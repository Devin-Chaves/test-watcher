<script type="text/javascript">
/**
 * Quick Search Web Component (Webflow Version)
 *
 * @package Felix
 * @since 1.0.0
 * @description A simple search component that searches medications and shows popular/related results.
 */

class QuickSearch extends HTMLElement {
	static get observedAttributes() {
		return ['other-data']
	}

	constructor() {
		super()
		this.attachShadow({ mode: 'open' })
		this.medications = []
		this.popular = []
		this.otherSearchTerms = []
		this.relatedTerms = []
		this.blurTimeout = null
		this.render()
	}

	render() {
		this.shadowRoot.innerHTML = `
		<style>
			* {
				box-sizing: border-box;
			}
			:host {
				display: block;
				position: relative;
			}
			:host:focus {
				outline: none;
			}
			.search-container {
				position: relative;
			}
			.search-form {
				display: flex;
				align-items: center;
				position: relative;
				outline: none;
			}
			.search-form:focus-within {
				outline: none;
			}
			input {
				border: .5px solid #E2E2E1;
				border-radius: 12px;
				padding: 12px 12px 10px 38px;
				background: none;
				cursor: pointer;
				align-items: center;
				transition: width 0.15s ease;
				font-family: 'Matter';
				color: #5F5E5A;
				line-height: 14px;
				font-weight: 500;
				font-size: 14px;
				opacity: 1;
				vertical-align: middle;
				width: 100%;
				outline: none;
			}
			input::placeholder {
				font-family: 'Matter';
				color: #5F5E5A;
				line-height: 14px;
				font-weight: 500;
				font-size: 14px;
				opacity: 1;
				vertical-align: middle;
			}
			input[type="search"]::-webkit-search-decoration,
			input[type="search"]::-webkit-search-cancel-button,
			input[type="search"]::-webkit-search-results-button,
			input[type="search"]::-webkit-search-results-decoration {
				display: none;
				-webkit-appearance: none;
			}
			input[type="search"]::-ms-clear {
				display: none;
				width: 0;
				height: 0;
			}
			input[type="search"]::-ms-reveal {
				display: none;
				width: 0;
				height: 0;
			}
			.cancel-button {
				position: absolute;
				right: 20px;
				top: 50%;
				transform: translateY(-50%);
				background: none;
				border: none;
				color: #5F5E5A;
				font-family: 'Matter';
				font-size: 14px;
				font-weight: 500;
				cursor: pointer;
				padding: 2px 0 0 0;
				z-index: 10;
				opacity: 0;
				transition: opacity 0.05s ease-in;
			}
			input:focus ~ .cancel-button {
				opacity: 1;
			}
			input:focus {
				outline: none;
				cursor: text;
			}
			.search-icon {
				width: 20px;
				height: 20px;
				pointer-events: none;
				position: absolute;
				left: 12px;
				top: 50%;
				transform: translateY(-50%);
			}
			.results {
				opacity: 0;
				pointer-events: none;
				position: absolute;
				left: 0;
				top: 100%;
				background: white;
				padding: 24px 0;
				width: 100%;
				min-width: unset;
				z-index: 1000;
				height: 80svh;
		}
		input:focus ~ .results {
			opacity: 1;
			pointer-events: auto;
		}
			.title {
				font-weight: 400;
				font-style: Regular;
				font-size: 14px;
				leading-trim: none;
				line-height: 135%;
				letter-spacing: 0%;
				color: #5F5E5A;
				margin: 0 0 12px 0;
			}
			.title--similar {
				margin-top: 48px;
			}
			ul {
				list-style: none;
				padding: 0;
				margin: 0;
				display: flex;
				flex-direction: column;
				gap: 4px;
			}
			a {
				color: #31302F;
				line-height: 120%;
				font-size: 16px;
				font-weight: 500;
				text-decoration: none;
			}
			a:hover {
				text-decoration: underline;
			}
			@media (min-width: 992px) {
				:host {
					padding: 0;
				}
				input {
					width: 118px;
				}
				input:focus {
					width: 340px;
				}
				input:focus ~ .results {
					transform: translateY(0);
					transition: opacity 0.15s ease-in, transform 0.15s ease-in;
					transition-delay: 0.15s;
				}
				.search-icon {
					left: 12px;
				}
				.results {
					margin-top: 16px;
					padding: 24px;
					border-radius: 12px;
					height: unset;
					width: calc(100% + 56px);
					transform: translateY(-10px);
				}
				.cancel-button {
					display: none;
				}
			}
		</style>
		<div class="search-container">
			<form id="search-form" class="search-form">
				<svg class="search-icon" width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
					<path d="M17.9419 17.0578L14.0302 13.1469C15.1639 11.7857 15.7293 10.0398 15.6086 8.27244C15.488 6.50506 14.6906 4.85223 13.3823 3.65779C12.074 2.46334 10.3557 1.81926 8.58462 1.85951C6.81357 1.89976 5.12622 2.62125 3.87358 3.87389C2.62094 5.12653 1.89945 6.81388 1.8592 8.58492C1.81895 10.356 2.46304 12.0744 3.65748 13.3826C4.85192 14.6909 6.50475 15.4883 8.27214 15.6089C10.0395 15.7296 11.7854 15.1642 13.1466 14.0305L17.0575 17.9422C17.1156 18.0003 17.1845 18.0463 17.2604 18.0777C17.3363 18.1092 17.4176 18.1253 17.4997 18.1253C17.5818 18.1253 17.6631 18.1092 17.739 18.0777C17.8149 18.0463 17.8838 18.0003 17.9419 17.9422C17.9999 17.8841 18.046 17.8152 18.0774 17.7393C18.1089 17.6634 18.125 17.5821 18.125 17.5C18.125 17.4179 18.1089 17.3366 18.0774 17.2607C18.046 17.1848 17.9999 17.1159 17.9419 17.0578ZM3.12469 8.75C3.12469 7.63748 3.45459 6.54994 4.07267 5.62491C4.69076 4.69989 5.56926 3.97892 6.5971 3.55317C7.62493 3.12743 8.75593 3.01604 9.84707 3.23308C10.9382 3.45012 11.9405 3.98585 12.7272 4.77252C13.5138 5.55919 14.0496 6.56147 14.2666 7.65261C14.4837 8.74376 14.3723 9.87475 13.9465 10.9026C13.5208 11.9304 12.7998 12.8089 11.8748 13.427C10.9497 14.0451 9.86221 14.375 8.74969 14.375C7.25836 14.3733 5.82858 13.7802 4.77404 12.7256C3.71951 11.6711 3.12634 10.2413 3.12469 8.75Z" fill="#31302F"/>
				</svg>
				<input type="search" name="search" placeholder="Search" aria-label="Search" />
				<button type="button" class="cancel-button">Cancel</button>
				<div class="results"></div>
			</form>
		</div>
		`
	}

	async loadMedications() {
		try {
			const res = await fetch('https://my.felixforyou.ca/edge/felix-menu-api')
			if (res.ok) {
				const data = await res.json()
				this.medications = Array.isArray(data.items) ? data.items : []
			}
		} catch (err) {
			console.error('Failed to fetch medications:', err)
		}
	}

	loadOtherData() {
		const attr = this.getAttribute('other-data')
		if (!attr) return

		try {
			const data = JSON.parse(attr)
			this.popular = data.popularTerms || []
			this.otherSearchTerms = data.otherSearchTerms || []
			this.relatedTerms = data.relatedTerms || []
		} catch (e) {
			console.error('Failed to parse other-data:', e)
		}
	}

	attributeChangedCallback(name, oldValue, newValue) {
		if (oldValue === newValue || name !== 'other-data') return
		this.loadOtherData()
		const input = this.shadowRoot.querySelector('input')
		if (input && (document.activeElement === input || input.value.trim() !== '')) {
			this.renderResults()
		}
	}

	findRelatedTerms(slug) {
		if (!slug || !this.relatedTerms.length) return []
		const normalized = slug.toLowerCase().trim()
		return this.relatedTerms.find((e) => e.slug?.toLowerCase() === normalized)?.terms || []
	}

	cancelBlurTimeout() {
		if (this.blurTimeout) {
			clearTimeout(this.blurTimeout)
			this.blurTimeout = null
		}
	}

	closeSearch() {
		// Cancel any pending blur timeout
		this.cancelBlurTimeout()

		const input = this.shadowRoot.querySelector('input')
		const results = this.shadowRoot.querySelector('.results')

		if (input) {
			input.value = ''
			input.blur()
		}

		if (results) {
			results.innerHTML = ''
		}
	}

	openSearch() {
		// Cancel any pending blur timeout
		if (this.blurTimeout) {
			clearTimeout(this.blurTimeout)
			this.blurTimeout = null
		}

		const input = this.shadowRoot.querySelector('input')

		if (input) {
			input.focus()
			this.renderResults()
		}
	}

	renderResults() {
		const results = this.shadowRoot.querySelector('.results')
		const input = this.shadowRoot.querySelector('input')
		if (!results || !input) return

		const query = input.value.trim().toLowerCase()

		// No query: show popular searches
		if (!query) {
			if (!this.popular.length) {
				results.innerHTML = ''
				return
			}
			results.innerHTML = `
				<p class="title">Popular</p>
				<ul>
					${this.popular.map((term) => `<li><a href="${term.url || '#'}">${term.label}</a></li>`).join('')}
				</ul>
			`
			return
		}

		const allSearchable = [...this.medications, ...this.otherSearchTerms]

		const matches = []
		const seen = new Set()

		for (const item of allSearchable) {
			if (!item.label || seen.has(item.label)) continue

			const label = item.label.toLowerCase()
			const slug = (item.slug || '').toLowerCase()

			if (label.includes(query) || slug.includes(query)) {
				matches.push(item)
				seen.add(item.label)

				// Limit to 10 results
				if (matches.length >= 10) break
			}
		}

		// Render results
		if (matches.length === 0) {
			results.innerHTML = '<p class="title">No results found</p>'
		} else {
			let html = `<ul>${matches.map((item) => `<li><a href="${item.url || '#'}">${item.label}</a></li>`).join('')}</ul>`

			// Show similar results if exactly one match
			if (matches.length === 1) {
				const related = this.findRelatedTerms(matches[0].slug)
				if (related.length) {
					html += `
						<p class="title title--similar">Similar</p>
						<ul>
							${related.map((term) => `<li><a href="${term.url || '#'}">${term.label}</a></li>`).join('')}
						</ul>
					`
				}
			}

			results.innerHTML = html
		}
	}

	connectedCallback() {
		// Load medications from API
		this.loadMedications()
		// Load other data from attribute
		this.loadOtherData()

		const form = this.shadowRoot.querySelector('#search-form')
		const input = this.shadowRoot.querySelector('input')
		const results = this.shadowRoot.querySelector('.results')

		// Prevent form submission
		form.addEventListener('submit', (e) => {
			e.preventDefault()
		})

		input.addEventListener('focus', () => {
			this.renderResults()
		})
		input.addEventListener('blur', () => {
			this.blurTimeout = setTimeout(() => {
				if (!this.shadowRoot.contains(document.activeElement)) {
					input.value = ''
					results.innerHTML = ''
				}
				this.blurTimeout = null
			}, 200)
		})
		input.addEventListener('input', () => this.renderResults())
		input.addEventListener('keydown', (e) => {
			if (e.key === 'Escape') {
				this.closeSearch()
			}
			// Prevent Enter from submitting form
			if (e.key === 'Enter') {
				e.preventDefault()
			}
		})
		results.addEventListener('mousedown', (e) => e.preventDefault())

		// Cancel button click handler
		const cancelButton = this.shadowRoot.querySelector('.cancel-button')
		if (cancelButton) {
			cancelButton.addEventListener('click', () => {
				this.closeSearch()
			})
		}

		// Listen for custom close event
		document.addEventListener('quick-search:close', () => {
			this.closeSearch()
		})

		// Listen for custom open event
		document.addEventListener('quick-search:open', () => {
			this.openSearch()
		})
	}
}

if (!customElements.get('quick-search')) {
	customElements.define('quick-search', QuickSearch)
}




  // Set JSON Data

  const components = document.querySelectorAll('quick-search')
  components.forEach((component) => {
    component.setAttribute('other-data', JSON.stringify(searchData))
  })

</script>