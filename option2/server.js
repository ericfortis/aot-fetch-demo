#!/usr/bin/env node

import { join } from 'node:path'
import { createServer } from 'node:http'
import { readFile } from 'node:fs/promises'
import { randomBytes } from 'node:crypto'

import { Mockaton } from 'mockaton'
import mockatonConfig from '../mockaton.config.js'


const rel = f => join(import.meta.dirname, f)

console.log('Starting mock API server…')
const mockServer = await Mockaton(mockatonConfig)
const apiAddr = `http://localhost:${mockServer.address().port}`


createServer(onRequest).listen(function () {
	console.log(`\nDEMO: http://localhost:${this.address().port}`)
})


async function onRequest(req, response) {
	if (req.url === '/')
		await onIndex(response)

	else if (req.url === '/spa.js')
		response.end(await readFile(rel(req.url)))

	else {
		response.statusCode = 404
		response.end()
	}
}


async function onIndex(response) {
	const nonce = randomBytes(16).toString('base64Url')

	// Chunk 1
	response.writeHead(200, {
		'Content-Type': 'text/html; charset=utf-8',
		'Content-Security-Policy': `default-src 'self'; script-src 'nonce-${nonce}' 'self'`
	})
	response.write(`<!DOCTYPE html>
<html>
<body>
  <h1>Streaming Server-Side Include (SSI) Demo</h1>
  <p>Chunk 1 END</p>
  <hr/>
  <script src="spa.js"></script>
`)

	// Chunk 2
	const payload = {
		status: -1,
		error: null,
		data: null
	}
	try {
		const apiResponse = await fetch(`${apiAddr}/api/colors`)
		payload.status = apiResponse.status
		if (apiResponse.ok)
			payload.data = await apiResponse.json()
	}
	catch (error) {
		payload.error = error?.message
	}
	finally {
		response.end(`
			<script type="application/json" id="initial-data" nonce="${nonce}">
				${JSON.stringify(payload)}
			</script>
			<script nonce="${nonce}">
				dispatchEvent(new Event('initial-data-ready'))
        console.log('chunk 2 received')
			</script>`
		)
	}
}