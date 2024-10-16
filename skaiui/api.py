import json
import frappe

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
		note.parentfield = 'notes' if (body['type'] == 'Lead') else 'custom_notes'
		note.parenttype = body['type']
		note.added_by = frappe.session.user
		note.insert()

	return f"Contact {body['first']} {body['last']} created"
