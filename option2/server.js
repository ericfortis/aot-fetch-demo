#!/usr/bin/env node

import { readFileSync } from 'node:fs'
import { createServer } from 'node:http'
import { join } from 'node:path'
import { Mockaton } from 'mockaton'
import mockatonConfig from '../mockaton.config.js'


console.log('Starting Mockaton…')
await Mockaton(mockatonConfig)

createServer(onRequest)
	.listen(8080, () => {
		console.log('\nDEMO: http://localhost:8080')
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
	response.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' })
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

	try {
		const colorsResponse = await fetch('http://localhost:2345/api/colors') // e.g. calling a microservice
		if (colorsResponse.ok)
			response.end(`<script type="application/json" id="initial-data">
				${JSON.stringify({
				status: colorsResponse.status,
				data: await colorsResponse.json()
			})}
			</script>`)
		else
			throw 'error'
	}
	catch {
		response.end(`<script type="application/json" id="initial-data">
		  ${JSON.stringify({ status: 'ERROR' })}
		</script>`)
	}
}