window.addEventListener('DOMContentLoaded', async () => {
	if (document.getElementById('initial-data')) // this file (spa.js) loaded after injecting chunk2
		onInitialDataReady()
	else {
		addEventListener('initial-data-ready', onInitialDataReady, { once: true })
		setTimeout(() => {
			if (!window['initial-data-ready']) {
				removeEventListener('initial-data-ready', onInitialDataReady)
				console.error('Timed out waiting for initial data')
			}
		}, 10_000)
	}
	
	function onInitialDataReady() {
		const data = document.getElementById('initial-data').textContent.trim()

		const pre = document.createElement('pre')
		pre.innerText = data + '\nStreamed Chunk 2 END'
		document.body.appendChild(pre)
	}
})
