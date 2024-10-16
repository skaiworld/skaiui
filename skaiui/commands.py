import glob
import subprocess

import click

from frappe.commands import get_site, pass_context

@click.command('skai-restore')
@click.option('--site', help='Site to restore')
@pass_context
def skai_restore(context, site=''):
	if not site:
		site = get_site(context)
	flist = glob.glob('{}/private/backups/*.sql.gz'.format(site))
	if not flist:
		# Todo: No backups. Try to fetch from offsite.
		return
	click.secho('Running bench restore {}'.format(max(flist)), fg="yellow")
	subprocess.run('bench restore {}'.format(max(flist)), shell=True)

@click.command('skai-backup')
def skai_backup():
	click.secho('Backing up now')
	subprocess.getoutput('bench backup')
	click.secho('Back up complete')

commands = [
	skai_restore,
	skai_backup,
]
