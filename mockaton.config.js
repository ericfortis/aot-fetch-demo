import { join } from 'node:path'
import { defineConfig } from 'mockaton'


export default defineConfig({
	port: 4040,
	mocksDir: join(import.meta.dirname, 'mocks'),
})
