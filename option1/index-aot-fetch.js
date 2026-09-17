;(function () {
	preload('/api/colors')

	function preload(url) {
		const link = document.createElement('link')
		link.as = 'fetch'
		link.rel = 'preload'
		link.href = url
		link.crossOrigin = 'use-credentials'
		document.head.appendChild(link)
	}
}())
