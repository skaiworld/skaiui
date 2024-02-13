import { createApp } from "vue";
import { defineCustomElements } from '@ionic/pwa-elements/loader';

import Dash from "./dashboard/Dash.vue";
import { prepareSkaiMe } from './dashboard/utils';

import { Mobile } from './mobile'

class SkaiUI {
	constructor() {
		// Initiate main customization
		this.setup()

		// Initiate mobile customization
		new Mobile()
	}

	setup() {
		const onFrappeReady = () => {
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
			if ( 'workspace' in frappe && frappe.user.has_role( 'Desk User' ) ) {
				this.setSkaiDash()
				this.toggleSkaiDash()
			}

			this.setWikiLinks()
		}

		$( document ).on( 'startup', () => {
			setTimeout( onFrappeReady, 0 )
		} )

		$( document ).on( 'page-change', () => {
			setTimeout( onPageChange, 0 )
		} )
	}

	setSkaiDash() {
		if ( $( '#skai-dash' ).length ) return

		if ( ! frappe.container ) {
			setTimeout( this.setSkaiDash, 100 )
			return
		}

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
		if ( route.length && ! cur_frm.wrapper.querySelector( '.sk-wiki-link' ) ) {
			route.after(`<a href="/${ route.val() }" target="_blank" class="sk-wiki-link">View Page</a>`)
		}
	}
}

new SkaiUI()
