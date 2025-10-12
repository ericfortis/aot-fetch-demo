window.addEventListener('DOMContentLoaded', async () => {
	let data = ''
	try {
		data = await waitForJsonById('initial-data')
	}
	catch (err) {
		data = err
	}
	finally {
		const pre = document.createElement('pre')
		pre.innerText = data.trim() + '\n\nStreamed Chunk 2 END'
		document.body.appendChild(pre)
	}


	async function waitForJsonById(id, timeout = 10_000) {
		const start = performance.now()
		while (true) {
			const el = document.getElementById(id)
			if (el?.textContent)
				return el.textContent

			if (performance.now() - start > timeout)
				throw new Error('Timed out waiting for JSON script')

			await sleep(30)
		}
	}

	async function sleep(ms) {
		await new Promise(r => setTimeout(r, ms))
	}
})
