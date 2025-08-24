import { createRoot } from 'react-dom/client'
import { useEffect, useState } from 'react'


/**
 * In this demo, the backend doesn’t check the session id or token,
 * but in your code you’ll have to add the corresponding credentials.
 * For example:
 *   `fetch(url, { credentials: 'include' })` or
 *   `fetch(url, { headers: { Authorization: … }})`
 */

const getColors = () => aotFetch('/api/colors')

function aotFetch(url) {
	if (window._aotFetch?.[url]) {
		const promise = window._aotFetch[url]
		delete window._aotFetch[url]
		return promise
	}
	return fetch(url)
}


function App() {
	const [loaded, setLoaded] = useState(false)
	const [colors, setColors] = useState([])
	const [error, setError] = useState('')

	useEffect(() => {
		(async () => {
			try {
				const response = await getColors()
				if (response.ok)
					setColors(await response.json())
				else
					throw response.status
			}
			catch (error) {
				setError(`Error: ${error}`)
			}
			finally {
				setLoaded(true)
			}
		})()
	}, [])


	if (!loaded) return <div>Loading…</div>
	if (error) return <div>{error}</div>
	if (!colors.length) return <div>No colors found</div>

	return <pre>{JSON.stringify(colors, null, 2)}</pre>
}


createRoot(document.getElementById('root'))
	.render(<App />)

