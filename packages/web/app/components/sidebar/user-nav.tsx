import { Form } from '@remix-run/react'
import { useSidebar } from './context'
import { Avatar, AvatarFallback, AvatarImage } from '~/components/ui/avatar'
import { Button } from '~/components/ui/button'
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuShortcut,
	DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu'
import { useUser } from '~/lib/hooks/useUser'

export default function UserNav() {
	const user = useUser()
	const { isOpen } = useSidebar()
	const name = user?.displayName ?? 'Guest'
	const login = user?._json.login ?? 'guest'
	const email = user?.emails?.[0]?.value ?? ''
	const avatarUrl = user?.photos?.[0]?.value ?? '/avatars/01.png'
	return (
		<DropdownMenu>
			<DropdownMenuTrigger
				asChild
				className="flex w-full justify-start"
			>
				<Button
					variant="ghost"
					className="focus-visible::outline-none focus-visible::ring-0 mb-2 flex items-center gap-x-3 text-sm font-semibold leading-6 text-gray-900"
				>
					<Avatar className="h-8 w-8 rounded-full bg-white">
						<AvatarImage
							src={avatarUrl}
							alt={name}
						/>
						<AvatarFallback>A</AvatarFallback>
					</Avatar>
					<span className="sr-only">Your profile</span>
					{isOpen && <span aria-hidden="true">{name}</span>}
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent
				className="w-56"
				align="end"
				forceMount
			>
				<DropdownMenuLabel className="font-normal">
					<div className="flex flex-col space-y-1">
						<p className="text-sm font-medium leading-none">{`@${login}`}</p>
						<p className="text-xs leading-none text-muted-foreground">
							{email}
						</p>
					</div>
				</DropdownMenuLabel>
				<DropdownMenuSeparator />
				<DropdownMenuGroup>
					<DropdownMenuItem>
						Profile
						<DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut>
					</DropdownMenuItem>
					<DropdownMenuItem>
						Billing
						<DropdownMenuShortcut>⌘B</DropdownMenuShortcut>
					</DropdownMenuItem>
					<DropdownMenuItem>
						Settings
						<DropdownMenuShortcut>⌘S</DropdownMenuShortcut>
					</DropdownMenuItem>
					<DropdownMenuItem>New Team</DropdownMenuItem>
				</DropdownMenuGroup>
				<DropdownMenuSeparator />
				{user && (
					<Form
						action="/logout"
						method="POST"
						noValidate
						replace
					>
						<DropdownMenuItem asChild>
							<Button
								variant="ghost"
								type="submit"
								className="w-full justify-start"
							>
								Logout
							</Button>
						</DropdownMenuItem>
					</Form>
				)}
				{!user && (
					<Form
						action="/login"
						method="POST"
						noValidate
						replace
					>
						<DropdownMenuItem asChild>
							<Button
								type="submit"
								variant="ghost"
								className="w-full justify-start"
							>
								Login
							</Button>
						</DropdownMenuItem>
					</Form>
				)}
			</DropdownMenuContent>
		</DropdownMenu>
	)
}
