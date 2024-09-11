import { createApp } from "vue";
import { defineCustomElements } from '@ionic/pwa-elements/loader';

import Dash from "./dashboard/Dash.vue";
import { prepareSkaiMe, generatePassword } from './dashboard/utils';

import { Mobile } from './mobile'

class SkaiUI {
	constructor() {
		// Initiate main customization
		this.setup()

		// Initiate mobile customization
		new Mobile()
	}

	setup() {
		const onFrappeStart = () => {
			// Define Capacitor custom elements.
			defineCustomElements( window )

			// Set SKAI logo
			if ( ! $( '.app-logo' ).attr( 'src' ).includes( 'skai' ) ) {
				$('.app-logo').attr( 'src', '/assets/skaiui/images/skai-logo.svg' )
			}
			document.querySelector( 'a.navbar-brand.navbar-home' ).setAttribute( 'href', '/app/skai-home' )

			// Set SKAI Dashboard
			if ( 'workspace' in frappe && frappe.user.has_role( 'Desk User' ) ) {
				frappe.set_route( '/app/skai-home' )
			}

			prepareSkaiMe()
		}

		const onPageChange = () => {
			this.onContainer()
			this.onSidebarChat()
			this.setWikiLinks()
			this.setChatUserForm()
		}

		$( document ).on( 'startup', () => {
			setTimeout( onFrappeStart, 0 )
		} )

		$( document ).on( 'page-change', () => {
			setTimeout( onPageChange, 0 )
		} )
	}

	onContainer() {
		if ( ! frappe.container ) {
			setTimeout( this.onContainer.bind(this), 100 ); return
		}

		if ( 'workspace' in frappe && frappe.user.has_role( 'Desk User' ) ) {
			this.setSkaiDash()
			this.toggleSkaiDash()
		}
	}

	onSidebarChat() {
		const chatLink = $( '.sidebar-item-container a[title=Chat]' )
		if ( chatLink.length === 0 ) {
			setTimeout( this.onSidebarChat.bind(this), 100 ); return
		}

		chatLink.attr( 'href', '/element/' ).attr( 'target', '_blank' )
	}

	setSkaiDash() {
		if ( $( '#skai-dash' ).length ) return

		const dashSection = $( '<div id="skai-dash"></div>' )
		$( '#page-Workspaces .layout-main-section' ).prepend( dashSection )

		createApp( Dash ).mount( dashSection.get(0) )
	}

	toggleSkaiDash() {
		if ( frappe.router.current_sub_path === 'skai-home' ) {
			$( '#skai-dash' ).removeClass( 'hide' )
		} else {
			$( '#skai-dash' ).addClass( 'hide' )
		}
	}

	setWikiLinks() {
		if ( cur_page.page.label !== 'Wiki Page' || ! ( 'route' in cur_frm.doc ) ) return

		const route = cur_frm.$wrapper.find( `input[data-fieldname='route']` )
		if ( route.length ) {
			const link = cur_frm.wrapper.querySelector( '.sk-wiki-link' )
			link && link.remove()
			route.after(`<a href="/${ route.val() }" target="_blank" class="sk-wiki-link">View Page</a>`)
		}
	}

	setChatUserForm() {
		if ( cur_page.page?.frm?.doctype !== 'User' ) return
		const tab = $( '#user-user_details_tab' )
		const abc = tab.find( '#chat-user-form' )
		if ( abc.length ) return
		tab.append( `<div id="chat-user-form" style="padding: 15px 5px; display:flex;">
			<div class="form-column col-sm-12">
				<label class="control-label">Access Token (from Chat > Settings > Help & About)</label>
				✦ <a href="/element/" target="_blank">Open Chat in new tab</a>
				<input id="access-token" type="password" class="token form-control" style="margin-bottom: 10px;" />
				<button id="create-chat-user" class="btn btn-primary btn-sm">
					Create Chat User
				</button>
			</div>
		</div>
		<div id="chat-result" style="padding: 0 20px 10px;"></div>` )
		$( '#create-chat-user' ).on( 'click', this.createChatUser )
	}

	createChatUser() {
		const un = cur_frm?.selected_doc?.username
		const token = $( '#access-token' ).val()
		if ( ! un || ! token ) {
			frappe.show_alert({
				indicator: 'orange',
				message: __( 'Check fields' ),
				subtitle: __( 'Username and Token must be set.' ),
			}, 10);
			return
		}
		const body = {
			password: generatePassword(),
			displayname: cur_frm.selected_doc.full_name,
			threepids: [ { medium: "email", address: cur_frm.selected_doc.email } ]
		}
		if ( cur_frm.selected_doc.phone ) {
			body.threepids.push( { medium: "msisdn", address: `91${ cur_frm.selected_doc.phone }` } )
		}
		if ( cur_frm.selected_doc.mobile_no ) {
			body.threepids.push( { medium: "msisdn", address: `91${ cur_frm.selected_doc.mobile_no }` } )
		}

		fetch( `${ location.protocol }//localhost${ location.protocol === 'http:' ? ':8008' : '' }/_synapse/admin/v2/users/@${ un }:${ location.hostname }`, {
			method: 'PUT',
			body: JSON.stringify( body ),
			headers: {
				'Authorization': `Bearer ${ token }`,
				'Content-Type': 'application/json'
			},
		} ).then( x => x.json() ).then( d => {
			console.log(d)
			if ( d.error ) {
				$( '#chat-result' ).text( d.error ); return
			}
			$( '#chat-result' ).text( `Created. Username: ${ un } , Password: ${ body.password }` )
		} ).catch( e => {
			console.log(d)
			$( '#chat-result' ).text( 'Could not create user. Contact Admin.' )
		} )
	}
}

new SkaiUI()
