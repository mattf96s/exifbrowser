import { GitHubLogoIcon } from '@radix-ui/react-icons'
import { type MetaFunction } from '@remix-run/react'
import { motion } from 'framer-motion'
import { ListX } from 'lucide-react'
import { ScrollArea } from '~/components/ui/scroll-area'

// #TODO: Add a link to the GitHub repo
const GitHubRepoUrl = 'https://github.com/mattf96s/exifbrowser'

export const meta: MetaFunction = () => {
	return [
		{
			title: 'About',
		},
		{
			name: 'description',
			content:
				'A file browser exploring the capabilities of the Origin Private File System.',
		},
	]
}

export default function Component() {
	return (
		<>
			<header className="sticky top-0 z-50 hidden w-full border-b bg-background/95 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-background/60 lg:block">
				<div className="container flex items-start justify-between space-y-2 py-4 sm:flex-row sm:items-center sm:space-y-0 md:h-16">
					<h1 className="text-lg font-semibold">About</h1>
					<motion.div className="inline-flex items-center gap-2">
						<a
							referrerPolicy="no-referrer"
							rel="noreferrer"
							target="_blank"
							href={GitHubRepoUrl}
						>
							<GitHubLogoIcon className="h-5 w-5" />
						</a>
					</motion.div>
				</div>
			</header>

			<div className="container px-0">
				<div className="flex w-full justify-center">
					<ScrollArea className="max-h-full max-w-prose pt-10">
						<div className="max-w-xl text-base leading-7 text-gray-700 lg:max-w-lg">
							{/* explain how this uses the origin private file system  */}
							<p>
								A file browser exploring the capabilities of the{' '}
								<a
									className="font-semibold text-blue-500 hover:underline"
									referrerPolicy="no-referrer"
									rel="noreferrer"
									target="_blank"
									href="https://developer.mozilla.org/en-US/docs/Web/API/File_System_API/Origin_private_file_system"
								>
									Origin Private File System
								</a>
								.
							</p>

							<p>
								Web workers are used extensively to avoid blocking the main
								thread.
							</p>

							{/* TODO list */}
							<ul className="mt-8 space-y-4 text-gray-600">
								<li className="flex gap-x-3">
									<ListX
										className="mt-1 h-5 w-5 flex-none text-blue-500"
										aria-hidden="true"
									/>
									<span>
										<strong className="font-semibold text-gray-900">
											Responsiveness.
										</strong>{' '}
										Still very much a work in progress.
									</span>
								</li>

								<li className="flex gap-x-3">
									<ListX
										className="mt-1 h-5 w-5 flex-none text-blue-500"
										aria-hidden="true"
									/>
									<span>
										<strong className="font-semibold text-gray-900">
											Perf.
										</strong>{' '}
										There are some more patterns I want to experiment with.
									</span>
								</li>

								<li className="flex gap-x-3">
									<ListX
										className="mt-1 h-5 w-5 flex-none text-blue-500"
										aria-hidden="true"
									/>
									<span>
										<strong className="font-semibold text-gray-900">
											Image Editor.
										</strong>{' '}
										An image editor is in the works.
									</span>
								</li>

								<li className="flex gap-x-3">
									<ListX
										className="mt-1 h-5 w-5 flex-none text-blue-500"
										aria-hidden="true"
									/>
									<span>
										<strong className="font-semibold text-gray-900">
											Cleanup.
										</strong>{' '}
										Organise the codebase, finalize patterns, etc.
									</span>
								</li>

								<li className="flex gap-x-3">
									<ListX
										className="mt-1 h-5 w-5 flex-none text-blue-500"
										aria-hidden="true"
									/>
									<span>
										<strong className="font-semibold text-gray-900">
											Cross Browser Support.
										</strong>{' '}
										Currently only tested in Chrome.
									</span>
								</li>
							</ul>
						</div>
					</ScrollArea>
				</div>
			</div>
		</>
	)
}
