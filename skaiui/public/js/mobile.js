class Swipe {
	constructor(el) {
		this.x = null
		this.y = null
		this.left = () => {}
		this.right = () => {}
		this.element = typeof (el) === 'string' ? document.querySelector(el) : el

		this.element.addEventListener('touchstart', (e) => {
			const touch = this.getTouches(e)[0]
			this.x = touch.clientX
			this.y = touch.clientY
		} )

		this.element.addEventListener('touchmove', (e) => {
			this.handleTouchMove(this.getTouches(e)[0])
		} )

	}

	getTouches = (e) => e.touches || e.originalEvent.touches // Vanilla JS or jQuery
	onLeft = (cb) => this.left = cb
	onRight = (cb) => this.right = cb

	handleTouchMove(touch) {
		if ( ! this.x || ! this.y ) return

		this.xDiff = this.x - touch.clientX
		this.yDiff = this.y - touch.clientY

		if ( Math.abs(this.xDiff) > Math.abs(this.yDiff) ) {
			if (this.xDiff > 0) {
				this.left( this.x, this.y, touch.clientX, touch.clientY )
			} else {
				this.right( this.x, this.y, touch.clientX, touch.clientY )
			}
		}

		// Reset values.
		this.x = null
		this.y = null
	}
}

export class Mobile {
	constructor() {
		this.page = false
		this.menu_open = false

		this.setup()
	}

	setup() {
		if ( screen.width > 767 ) return
		this.swiper = new Swipe( document )

		const onPageChange = () => {
			// Set current page
			this.page = cur_page.page.page

			// Cleanup Filters
			this.cleanupFilters()

			// Setup Swipe menu
			this.swiper.onRight( this.showMenu.bind( this ) )
			this.swiper.onLeft( this.hideMenu.bind( this ) )

			// Todo: On main menu item click, if page changed, hide menu
		}

		$( document ).on( 'page-change', () => {
			setTimeout( onPageChange, 0 )
		} )
	}

	getPage() {
		return cur_page.page.page
	}

	cleanupFilters() {
		if ( ! frappe.router.current_route
			|| frappe.router.current_route.length < 3
			|| frappe.router.current_route[2] !== 'List'
		) return

		const skCl = frappe.router.current_sub_path.replaceAll('/', '-')
		if ($(`.skFilter.${skCl}`).length) return

		this.page.custom_actions.before(`<button class="btn btn-default btn-sm skFilter ${skCl}">${frappe.utils.icon("filter")}</button>`)

		this.page.page_form.addClass('sk-filter collapsed')
		this.page.page_actions.on('click', '.skFilter', () => {
			this.page.page_form.toggleClass('collapsed')
		})
	}

	showMenu( x ) {
		if ( x > 100 ) return
		this.page.setup_overlay_sidebar()
		this.menu_open = true
	}

	hideMenu() {
		if ( ! this.page.sidebar.find(".overlay-sidebar").hasClass( "opened" ) ) return
		this.page.close_sidebar()
		this.menu_open = false
	}
}
