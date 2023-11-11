import { createApp } from "vue";
import { defineCustomElements } from '@ionic/pwa-elements/loader';

import Dash from "./dashboard/Dash.vue";
import { prepareSkaiMe } from './dashboard/utils';


function setSkaiDash() {
	if ( $('#skai-dash').length ) {
		return;
	}

	if ( ! frappe.container ) {
		setTimeout(() => setSkaiDash(), 100);
		return;
	}

	const dashSection = $( '<div id="skai-dash"></div>' );
	$('#page-Workspaces .layout-main-section').prepend(dashSection)

	let dashApp = createApp(Dash);
	dashApp.mount(dashSection.get(0));
}

function toggleSkaiDash() {
	if (frappe.router.current_sub_path === 'skai-home') {
		$('#skai-dash').removeClass('hide');
	} else {
		$('#skai-dash').addClass('hide');
	}
}

$(document).on( 'startup', function () {
	// Define Capacitor custom elements.
	defineCustomElements(window);

	// Set SKAI Dashboard
	setTimeout(() => {
		if (frappe.router.current_route && frappe.router.current_route.includes('Workspaces') && frappe.user.has_role('Desk User') ) {
			frappe.set_route('/app/skai-home');
			setSkaiDash();
		}

		frappe.router.on('change', (r) => {
			if (frappe.router.current_route && frappe.router.current_route.includes('Workspaces') && frappe.user.has_role('Desk User')) {
				setSkaiDash();
				toggleSkaiDash();
			}
		})

		prepareSkaiMe();
	}, 0);

	// Set SKAI logo
	if ( ! $('.app-logo').attr('src').includes( 'skai' ) ) {
		$('.app-logo').attr( 'src', '/assets/skaiui/images/skai-logo.svg' )
	}
});
