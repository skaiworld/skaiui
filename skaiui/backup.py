import frappe
from frappe.utils.backups import new_backup

def backup():
	new_backup(ignore_files=False, force=True)

@frappe.whitelist()
def get_logged_roles():
	return frappe.get_roles(frappe.session.user)
