import {
	json,
	type LinksFunction,
	type LoaderFunctionArgs,
	type MetaFunction,
} from '@remix-run/node'
import {
	Links,
	LiveReload,
	Meta,
	Outlet,
	Scripts,
	ScrollRestoration,
	useFetchers,
	useLoaderData,
	useNavigation,
} from '@remix-run/react'

import NProgress from 'nprogress'
import { useEffect } from 'react'
import { Toaster } from '~/components/ui/toaster'

import 'nprogress/nprogress.css'
import '@fontsource-variable/inter'
import '~/styles/tailwind.css'

export const links: LinksFunction = () => [
	{
		rel: 'manifest',
		href: '/site.webmanifest',
		crossOrigin: 'use-credentials',
	},
]

export const meta: MetaFunction = () => {
	return [
		{
			title: 'ExifBrowser',
		},

		{
			name: 'description',
			content: 'A local-first file browser for your photos',
		},
	]
}

function GlobalLoader(): null {
	const navigation = useNavigation()
	const fetchers = useFetchers()
	useEffect(() => {
		const fetchersIdle = fetchers.every(f => f.state === 'idle')

		if (navigation.state === 'idle' && fetchersIdle) {
			NProgress.done()
		} else {
			NProgress.start()
		}
	}, [navigation.state, fetchers])

	return null
}

// Remix complaings about needing a root loader (might be a Vite bug).
export async function loader(_props: LoaderFunctionArgs) {
	return json({
		ENV: {},
	})
}

export default function App() {
	const data = useLoaderData<typeof loader>() // don't destructure (HMR breaks)

	return (
		<html
			lang="en"
			dir="ltr"
			className="h-full bg-white"
		>
			<head>
				<meta charSet="utf-8" />
				<meta
					name="viewport"
					content="width=device-width, initial-scale=1"
				/>

				<Meta />
				<Links />
			</head>
			<body className="h-screen min-h-0 bg-background font-sans antialiased">
				<Outlet />
				<GlobalLoader />
				<Toaster
					position="bottom-right"
					closeButton
				/>
				<ScrollRestoration />
				<Scripts />
				<script
					dangerouslySetInnerHTML={{
						__html: `window.ENV = ${JSON.stringify(data.ENV)}`,
					}}
				/>
				<LiveReload />
			</body>
		</html>
	)
}
