import json
import frappe

TASK_ARCHIVE_DAYS = 7

@frappe.whitelist()
def backup():
	from frappe.utils.backups import new_backup
	new_backup(ignore_files=False, force=True)

@frappe.whitelist()
def create_contact():
	body = json.loads(frappe.request.data)

	# Todo: Sanitize
	contact = frappe.new_doc(body['type'])

	if body['type'] == 'Lead':
		contact.first_name = body['first']
		contact.last_name = body['last']
		contact.mobile_no = body['phone']
	else:
		full_name = f"{ body['first'] } { body['last'] }"
		if frappe.db.exists(body['type'], full_name):
			return f"{full_name} already exists"
		contact.name = full_name
		contact.mobile_no = body['phone']
		contact.gst_category = 'Unregistered'
		if body['type'] == 'Customer':
			contact.customer_name = full_name
			contact.customer_type = 'Individual'
		elif body['type'] == 'Supplier':
			contact.supplier_name = full_name
			contact.supplier_type = 'Company'
	contact.insert()

	if body['note']:
		note = frappe.new_doc('CRM Note')
		note.note = body['note']
		note.parent = contact.name
		note.parentfield = 'notes'
		note.parenttype = body['type']
		note.added_by = frappe.session.user
		note.insert()

	return f"Contact {body['first']} {body['last']} created"

@frappe.whitelist()
def archive_tasks():
	from frappe.utils.data import getdate, add_to_date

	last_week = add_to_date( getdate(), days=-1 * TASK_ARCHIVE_DAYS )

	frappe.db.sql(f"""UPDATE tabTask
		SET status = 'Archived'
		WHERE status in ('Completed', 'Cancelled')
		AND modified < '{ last_week }'""")
	frappe.db.commit()
	return 'Archived'

@frappe.whitelist()
def get_logged_roles():
	return frappe.get_roles(frappe.session.user)
