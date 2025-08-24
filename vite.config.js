import { join } from 'node:path'
import { readFileSync } from 'node:fs'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'


export default defineConfig({
	plugins: [
		react(),
		htmlPlugin()
	],
	server: {
		port: 3030,
		open: true,
		host: true,
		proxy: {
			'/api': {
				target: 'http://localhost:2345',
				changeOrigin: true
			}
		}
	}
})


function htmlPlugin() {
	return {
		name: 'html-plugin',
		transformIndexHtml(html) {
			return html.replace('</body>',
				`<script>${readAotFetch()}</script></body>`
			)
		}
	}
}

function readAotFetch() {
	return readFileSync(join(import.meta.dirname, './index-aot-fetch.js'), 'utf8').trim()
}


