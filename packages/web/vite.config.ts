import { unstable_vitePlugin as remix } from '@remix-run/dev'
import { defineConfig } from 'vite'
import tsconfigPaths from 'vite-tsconfig-paths'
import remixConfig from './remix.config'

export default defineConfig({
	plugins: [remix(remixConfig), tsconfigPaths()],
})
