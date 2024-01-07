import * as ProgressPrimitive from '@radix-ui/react-progress'
import { motion } from 'framer-motion'
import * as React from 'react'

import { cn } from '~/lib/utils'

const MotionProgressIndicator = motion(ProgressPrimitive.Indicator)

const Progress = React.forwardRef<
	React.ElementRef<typeof ProgressPrimitive.Root>,
	React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root>
	// @ts-ignore
	// eslint-disable-next-line react/prop-types
>(({ className, value, ...props }, ref) => {
	const progress = value && value >= 0 ? value : 0
	return (
		<ProgressPrimitive.Root
			ref={ref}
			className={cn(
				'relative h-2 w-full overflow-hidden rounded-full bg-primary/20',
				className,
			)}
			style={{
				transform: 'translateZ(0)',
			}}
			{...props}
		>
			<MotionProgressIndicator
				className="bg-primary"
				// style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
				animate={{
					x: `-${100 - progress}%`,
					transition: {
						ease: 'easeInOut',
					},
				}}
				initial={false}
				style={{
					height: '100%',
					width: '100%',
					display: 'flex',
					flex: '1 1 0%',
				}}
			/>
		</ProgressPrimitive.Root>
	)
})
Progress.displayName = ProgressPrimitive.Root.displayName

export { Progress }
