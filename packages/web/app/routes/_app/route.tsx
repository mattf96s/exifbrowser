import { type MetaFunction, Outlet } from '@remix-run/react'
import { type ReactNode, memo } from 'react'
import Sidebar from '~/components/sidebar'
import { SidebarProvider, useSidebar } from '~/components/sidebar/context'
import { cn } from '~/lib/utils'

export const meta: MetaFunction = () => [
	{
		title: 'Exif Browser',
	},
	{
		name: 'description',
		content:
			'A file browser exploring the capabilities of the Origin Private File System.',
	},
]

export default function Component() {
	return (
		<SidebarProvider>
			<LayoutContainer>
				<Sidebar />
				<main className="h-full w-full">
					<div className="flex h-full flex-col">
						<ContentShell>
							<Outlet />
						</ContentShell>
					</div>
				</main>
			</LayoutContainer>
		</SidebarProvider>
	)
}

const LayoutContainer = memo(function LayoutContainer(props: {
	children: ReactNode
}) {
	return (
		<div className="flex h-screen flex-col lg:flex-row">{props.children}</div>
	)
})

const ContentShell = memo(function ContentShell(props: {
	children: ReactNode
}) {
	const { isOpen } = useSidebar()
	return (
		<div
			className={cn(
				'flex h-full min-h-0 flex-col transition-all lg:pl-20',
				isOpen && 'lg:pl-72',
			)}
		>
			{props.children}
		</div>
	)
})
