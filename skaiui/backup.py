from frappe.utils.backups import new_backup

def backup():
	new_backup(ignore_files=False, force=True)
