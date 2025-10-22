#!/usr/bin/env node

import { join } from 'node:path'
import { createServer } from 'node:http'
import { readFileSync } from 'node:fs'
import { randomBytes } from 'node:crypto'

import { Mockaton } from 'mockaton'
import mockatonConfig from '../mockaton.config.js'


const colorsMicroservice = await Mockaton({
	...mockatonConfig,
	onReady: () => {} // noop, so it doesn’t open Mockaton’s dashboard
})
const microservice = `http://localhost:${colorsMicroservice.address().port}`


createServer(onRequest)
	.listen(8080, () => {
		console.log('\nDEMO APP: http://localhost:8080')
	})


function onRequest(req, response) {
	if (req.url === '/')
		onIndex(response)

	else if (req.url === '/spa.js')
		response.end(readFileSync(join(import.meta.dirname, 'spa.js')))

	else {
		response.statusCode = 404
		response.end()
	}
}


async function onIndex(response) {
	const nonce = randomBytes(16).toString('base64Url')
	
	response.writeHead(200, { 
		'Content-Type': 'text/html; charset=utf-8',
		'Content-Security-Policy': `default-src 'self'; script-src 'nonce-${nonce}' 'self'` 
	})
	response.write(`<!DOCTYPE html>
<html>
<head>
  <title>Streaming SSI Demo</title>
</head>
<body>
  <h1>Streaming Server-Side Include (SSI) Demo</h1>
  <p>Streamed Chunk 1 END</p>
  <hr/>
  <script src="spa.js"></script>
`)

	// Chunk 2
	const payload = {
		status: -1,
		data: null,
		error: null
	}
	try {
		const colorsResponse = await fetch(`${microservice}/api/colors`)
		payload.status = colorsResponse.status
		if (colorsResponse.status === 200)
			payload.data = await colorsResponse.json()
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