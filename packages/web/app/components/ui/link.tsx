import {
	Link as RemixLink,
	type LinkProps as RemixLinkProps,
} from '@remix-run/react'
import { type VariantProps } from 'class-variance-authority'
import * as React from 'react'

import { buttonVariants } from './button'
import { cn } from '~/lib/utils'

export interface LinkProps
	extends RemixLinkProps,
		VariantProps<typeof buttonVariants> {}

const StyledLink = React.forwardRef<HTMLAnchorElement, LinkProps>(
	({ className, variant, size, ...props }, ref) => {
		return (
			<RemixLink
				className={cn(buttonVariants({ variant, size, className }))}
				ref={ref}
				{...props}
			/>
		)
	},
)
StyledLink.displayName = 'Link'

export { StyledLink, buttonVariants as linkVariants }
