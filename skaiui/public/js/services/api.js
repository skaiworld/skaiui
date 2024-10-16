export async function fetchEmployeeMe() {
	const url = `/api/resource/Employee?fields=["employee","employee_name"]&filters=[["user_id","=","${ frappe.boot.user.email }"]]`;
	const r = await fetch(url)
	const res = await r.json()
	// Todo: Handle Error

	if ( ! res.data.length ) return false

	return {
		employee: res.data[0].employee,
		name: res.data[0].employee_name
	}
}

export async function getChecked() {
	const r = await fetch( `/api/resource/Employee Checkin?fields=["log_type","time"]&filters=[["employee","=","${ frappe.skaiMe.employee }"]]&order_by=time%20desc` )
	const res = await r.json()
	// Todo: Handle Error
	return res
}

export async function checkInNow( args ) {
	const r = await fetch( '/api/resource/Employee Checkin', {
		method: 'POST',
		headers: {
			'Accept': 'application/json',
			'Content-Type': 'application/json',
		},
		body: JSON.stringify( args )
	} )

	const res = await r.json()
	// Todo: Handle Error
	return res
}

export async function fetchTasks() {
	const url = `/api/resource/Task?fields=["name","subject","status","color","priority"]&or_filters=[["_assign","LIKE","%${frappe.boot.user.email}%"],["_assign","LIKE","%${frappe.boot.user.name }%"]]&order_by=status%20desc&limit=20`
	const r = await fetch(url)
	const res = await r.json()
	// Todo: Handle Error

	if (!res.data.length) return []

	const tasks = res.data.filter( task => {
		if ( ! task.color ) {
			colors = { Open: '#0070cc', Working: '#d1930d', Overdue: '#bd3e0c' }
			task.color = colors[ task.status ] || '#333333'
		}
		return task.status !== 'Completed'
	} )

	tasks.sort( (a, b) => (a.status === 'Overdue') ? -1 : 1 )
	return tasks
}

export async function createTask( subject = '', assign = true ) {
	if ( subject === '' ) return false
	const body = {
		subject,
		_assign: `["${ frappe.boot.user.email }"]`,
		status: 'Open'
	}

	const r = await fetch( '/api/resource/Task', {
		method: 'POST',
		headers: {
			"Accept": "application/json",
			"Content-Type": "application/json",
		},
		body: JSON.stringify( body )
	} )

	const res = await r.json()
	// Todo: Handle Error

	if ( ! res.data ) return false

	if ( assign ) {
		await assignMeTask( res.data.name )
	}
	return res.data
}

export async function assignMeTask(task) {
	if ( task === '' ) return false
	const body = {
		name: task,
		assign_to: `["${ frappe.boot.user.email }"]`,
		doctype: 'Task',
	}
	const assignFetch = ( b ) => {
		return fetch( '/api/method/frappe.desk.form.assign_to.add', {
			method: 'PUT',
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify( b )
		} )
	}
	const r = await assignFetch( body )
	if ( ! r.ok ) {
		body.assign_to = `["${ frappe.boot.user.name }"]`
		assignFetch( body )
	}
}

export async function createContact( data ) {
	const r = await fetch( '/api/method/skaiui.api.create_contact', {
		method: 'POST',
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify( data )
	} )
	return await r.json()
}
