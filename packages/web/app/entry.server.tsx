import { PassThrough } from 'node:stream'

import {
	type AppLoadContext,
	type EntryContext,
	type HandleDocumentRequestFunction,
	createReadableStreamFromReadable,
} from '@remix-run/node'
import { RemixServer } from '@remix-run/react'
import isbot from 'isbot'
import { renderToPipeableStream } from 'react-dom/server'
import { getEnv, init } from './utils/env.server'

const ABORT_DELAY = 5_000

init()
global.ENV = getEnv()

// #TODO: add Sentry monitoring
// if (ENV.MODE === 'production' && ENV.SENTRY_DSN) {
// 	import('./utils/monitoring.server.ts').then(({ init }) => init())
// }

export default function handleRequest(
	request: Request,
	responseStatusCode: number,
	responseHeaders: Headers,
	remixContext: EntryContext,
	loadContext: AppLoadContext,
) {
	return isbot(request.headers.get('user-agent'))
		? handleBotRequest(
				request,
				responseStatusCode,
				responseHeaders,
				remixContext,
				loadContext,
			)
		: handleBrowserRequest(
				request,
				responseStatusCode,
				responseHeaders,
				remixContext,
				loadContext,
			)
}

type DocRequestArgs = Parameters<HandleDocumentRequestFunction>

function handleBotRequest(...args: DocRequestArgs) {
	let [request, responseStatusCode, responseHeaders, remixContext] = args

	return new Promise((resolve, reject) => {
		let shellRendered = false
		const { pipe, abort } = renderToPipeableStream(
			<RemixServer
				context={remixContext}
				url={request.url}
				abortDelay={ABORT_DELAY}
			/>,

			{
				onAllReady() {
					shellRendered = true
					const body = new PassThrough()
					const stream = createReadableStreamFromReadable(body)

					responseHeaders.set('Content-Type', 'text/html')

					resolve(
						new Response(stream, {
							headers: responseHeaders,
							status: responseStatusCode,
						}),
					)

					pipe(body)
				},
				onShellError(error: unknown) {
					reject(error)
				},
				onError(error: unknown) {
					responseStatusCode = 500
					// Log streaming rendering errors from inside the shell.  Don't log
					// errors encountered during initial shell rendering since they'll
					// reject and get logged in handleDocumentRequest.
					if (shellRendered) {
						console.error(error)
					}
				},
			},
		)

		setTimeout(abort, ABORT_DELAY)
	})
}

function handleBrowserRequest(...args: DocRequestArgs) {
	let [request, responseStatusCode, responseHeaders, remixContext] = args

	return new Promise((resolve, reject) => {
		let shellRendered = false
		const { pipe, abort } = renderToPipeableStream(
			<RemixServer
				context={remixContext}
				url={request.url}
				abortDelay={ABORT_DELAY}
			/>,

			{
				onShellReady() {
					shellRendered = true
					const body = new PassThrough()
					const stream = createReadableStreamFromReadable(body)

					responseHeaders.set('Content-Type', 'text/html')

					resolve(
						new Response(stream, {
							headers: responseHeaders,
							status: responseStatusCode,
						}),
					)

					pipe(body)
				},
				onShellError(error: unknown) {
					reject(error)
				},
				onError(error: unknown) {
					responseStatusCode = 500
					// Log streaming rendering errors from inside the shell.  Don't log
					// errors encountered during initial shell rendering since they'll
					// reject and get logged in handleDocumentRequest.
					if (shellRendered) {
						console.error(error)
					}
				},
			},
		)

		setTimeout(abort, ABORT_DELAY)
	})
}
