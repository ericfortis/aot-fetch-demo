;(function () {
	const aotElem = () => document.getElementById('initial-data')

	if (aotElem()) // this file (spa.js) loaded after injecting chunk2
		onInitialDataReady()
	else {
		addEventListener('initial-data-ready', onInitialDataReady, { once: true })
		setTimeout(() => {
			if (!aotElem()) {
				removeEventListener('initial-data-ready', onInitialDataReady)
				console.error('Timed out waiting for initial data')
			}
		}, 10_000)
	}

	function onInitialDataReady() {
		const data = aotElem().textContent.trim()

		const pre = document.createElement('pre')
		pre.innerText = 'Rendering colors payload from spa.js:\n' + data
		document.body.appendChild(pre)
	}
}())
