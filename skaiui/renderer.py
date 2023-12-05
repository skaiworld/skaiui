import os
import mimetypes

from werkzeug.wrappers import Response
from werkzeug.wsgi import wrap_file

import frappe
from frappe.website.page_renderers.static_page import StaticPage
from frappe.website.utils import build_response

# Todo: Not used. element routing is in nginx config.
# Todo: Better route element here for more control?

class ElementPage(StaticPage):
    def set_file_path(self):
        self.file_path = ''
        if not self.is_element_part():
            return
        file_path = frappe.get_app_path('skaiui', 'www') + '/' + self.path
        if os.path.isfile(file_path):
            self.file_path = file_path

    def can_render(self):
        return (self.is_element_part() and self.file_path) or self.is_element_noslash()

    def is_element_part(self):
        return self.path.startswith( 'element/' )

    def is_element_noslash(self):
        return frappe.local.request.path == '/element'

    def render(self):
        if self.is_element_noslash():
            return build_response(
                self.path,
                "",
                301,
                {
                    "Location": '/element/',
                    "Cache-Control": "no-store, no-cache, must-revalidate",
                },
            )
        else:
            f = open(self.file_path, "rb")
            response = Response(wrap_file(frappe.local.request.environ, f), direct_passthrough=True)
            response.mimetype = mimetypes.guess_type(self.file_path)[0] or "application/octet-stream"
            return response
