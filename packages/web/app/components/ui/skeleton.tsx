import { forwardRef } from 'react'
import { cn } from '~/lib/utils'

// I add the forwardRef; don't overwrite when updating ShadCN.
const Skeleton = forwardRef<
	HTMLDivElement,
	React.HTMLAttributes<HTMLDivElement>
>(function Skeleton({ className, ...props }, ref) {
	return (
		<div
			ref={ref}
			className={cn('animate-pulse rounded-md bg-primary/10', className)}
			{...props}
		/>
	)
})

export { Skeleton }
