import { Capacitor } from '@capacitor/core'
import { Geolocation } from '@capacitor/geolocation'

import { fetchEmployeeMe, getChecked, checkInNow } from './api'

// Todo: Different config for development
const config = {
	locationTimeout: 30000, // 5 seconds
	locationmaxAge: 120000, // 10 minutes
	checkedCache: 300000, // 5 minutes
}

export function myName() {
	return frappe.user.full_name()
}

export function capitalize( str ) {
	return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
}

export async function prepareSkaiMe() {
	if ( ! frappe.skaiMe ) {
		// Todo: Refetch if old
		frappe.skaiMe = getLocalJson('skaiMe')
	}
	if ( ! frappe.skaiMe ) {
		frappe.skaiMe = await fetchEmployeeMe()
		// Todo: If not emplyee, disable employee items in dashboard.
		if ( frappe.skaiMe ) {
			setLocalJson('skaiMe', frappe.skaiMe)
		}
	}
	return frappe.skaiMe
}

function storeChecked( checkedType, checkedTime ) {
	setLocalJson( 'skaiChecked', {
		type: checkedType,
		time: checkedTime,
		stored: new Date()
	} )
}

export async function checkedStatus() {
	const skaiChecked = getLocalJson( 'skaiChecked' )
	const status = skaiChecked ? skaiChecked : {
		type: 'OUT',
		time: '2000',
		stored: '2000'
	}

	frappe.skaiMe = await prepareSkaiMe()
	if ( ! frappe.skaiMe.employee ) {
		return status
	}

	if ( new Date().getTime() - new Date( status.stored ).getTime() < config.checkedCache ) {
		return status
	}

	const res = await getChecked()
	if ( ! res.data.length ) {
		return status
	}

	storeChecked( res.data[0].log_type, res.data[0].time )
	return status
}

async function getPosition() {
	try {
		return await Geolocation.getCurrentPosition( {
			enableHighAccuracy: true,
			timeout: config.locationTimeout,
			maximumAge: config.locationmaxAge
		} )
	} catch( err ) {
		if ( err.code === 1 && Capacitor.platform !== 'web' ) {
			try {
				const perm = await Geolocation.requestPermissions()
				if ( perm.location === 'denied' && perm.coarseLocation === 'denied' ) {
					return { err }
				}
			} catch( e ) {
				return { err: e }
			}
			return getPosition()
		} else {
			return { err }
		}
	}
}

function trimPositionData( pos ) {
	const data = {}
	for (var key in pos.coords ) {
		// Strip to 4 decimal accuracy
		data[key] = ( 'number' === typeof pos.coords[key] ) ? Math.round( pos.coords[key] * 1e4 ) / 1e4 : pos.coords[key]
	}
	return data
}

export async function checkIn(log = 'IN') {
	if (!frappe.is_online()) {
		frappe.show_alert({
			indicator: 'orange',
			message: __( `Check ${ logType } Issue` ),
			subtitle: __("You are not connected to Internet. Retry again after connecting."),
		}, 10 )
		return
	}

	const skaiMe = await prepareSkaiMe()

	const logType = capitalize( log )

	if ( ! skaiMe ) {
		frappe.show_alert({
			indicator: 'orange',
			message: __( `Check ${ logType } Issue` ),
			subtitle: __( 'Employee role not assigned to you?' ),
		}, 5 )
		return
	}

	const pos = await getPosition();
	if ( pos.err && pos.err.code === 1 ) {
		frappe.show_alert({
			indicator: 'orange',
			message: __( `Check ${ logType } Issue` ),
			subtitle: __( `Grant location permission to Check ${ logType }. Contact your reporting manager if you don't know how to Grant location permission.` ),
		}, 10 )
		return
	} else if ( pos.err || ! pos.coords.latitude ) {
		frappe.show_alert({
			indicator: 'orange',
			message: __( `Check ${ logType } Issue` ),
			subtitle: __( `Could not Check ${ logType }. Contact your reporting manager.` ),
		}, 10 )
		return
	}

	frappe.dom.freeze()

	const args = {
		log_type: log,
		time: (new Date().toISOString()).split('T').join(' ').split('Z')[0],
		skip_auto_attendance: 0,
		employee_name: skaiMe.name,
		employee: skaiMe.employee,
		device_id: JSON.stringify( trimPositionData( pos ) )
	}

	const res = await checkInNow( args )
	frappe.dom.unfreeze()

	if ( res.data.name ) {
		frappe.show_alert({
			indicator: 'green',
			message: __( `Checked ${ logType }` ),
			subtitle: __( `You have Checked ${ logType } successfully!` ),
		}, 5)
	}

	storeChecked(res.data.log_type, res.data.time)
	return getLocalJson( 'skaiChecked' )
}

export function getLocalJson(key) {
	const item = localStorage.getItem(key)
	return JSON.parse( item )
}

export function setLocalJson(key, val) {
	const item = JSON.stringify(val)
	localStorage.setItem(key, item)
}

export function generatePassword() {
	return Math.random().toString(36).slice(2, 8)
}

export async function sleep(s) {
	return new Promise( r => setTimeout(r, s * 1000) )
}

export function runOnceReady( condition, cb, expiry ) {
	if ( condition() === false ) {
		if ( expiry <= 0 ) return
		setTimeout( () => runOnceReady( condition, cb, expiry - 100 ), 100 ); return
	}
	cb()
}
