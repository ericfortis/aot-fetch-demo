import { join } from 'node:path'
import { createHash } from 'node:crypto'
import { readFileSync, writeFileSync } from 'node:fs'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'


function readAotFetch() {
	return readFileSync(join(import.meta.dirname, './index-aot-fetch.js'), 'utf8').trim()
}


export default defineConfig({
	plugins: [
		react(),
		injectInlineAotScriptPlugin(),
		cspNginxPlugin()
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


function injectInlineAotScriptPlugin() {
	return {
		name: 'inject-inline-aot-script-plugin',
		transformIndexHtml: html => ({
			html,
			tags: [
				{
					tag: 'script',
					children: readAotFetch()
				}
			]
		})
	}
}

/**
 * If you use a Content-Security-Policy, here’s an example for signing
 * the inline script.
 * 
 * This Vite plugin writes a file (csp.nginx), which is meant to be 
 * included in your nginx.conf. For example,
 * ```nginx
 * server {
 *   …
 *   location / {
 *     …
 *     include   /usr/local/spa-dist/csp.nginx;
 *     rewrite ^ /index.html break;
 *   }
 * }
 * ```
 */
function cspNginxPlugin() {
	return {
		name: 'csp-nginx-plugin',
		closeBundle() {
			const csp = [
				`default-src 'self'`,
				`script-src 'self' 'sha256-${sha256(readAotFetch())}'`
			].join(';')

			const nginxInclude = `add_header Content-Security-Policy "${csp}";`
			writeFileSync(join('dist', 'csp.nginx'), nginxInclude)

			function sha256(data) {
				return createHash('sha256').update(data).digest('base64')
			}
		}
	}
}
