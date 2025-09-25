import { join } from 'node:path'
import { lstatSync } from 'node:fs'
import { Mockaton, defineConfig } from 'mockaton'


export default defineConfig({
	port: 2345,
	mocksDir: join(import.meta.dirname, 'mocks'),
	staticDir: ifDirExists(join(import.meta.dirname, 'dist'))
})

function ifDirExists(path) {
	return lstatSync(path, { throwIfNoEntry: false })?.isDirectory() && path
}
