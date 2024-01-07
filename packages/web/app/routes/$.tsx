'use client'

import { type MetaFunction } from '@remix-run/node'
import { Link } from '@remix-run/react'
import { AnimatePresence, motion } from 'framer-motion'
import React, { useEffect, useRef, useState } from 'react'
import { cn } from '~/lib/utils'

export const meta: MetaFunction = () => {
	return [
		{
			title: '404 - Not Found',
		},
		{
			name: 'description',
			content: 'The page you are looking for does not exist.',
		},
		{
			name: 'robots',
			content: 'noindex',
		},
	]
}
/**
 * Based off https://ui.aceternity.com/components/glowing-stars-effect
 */
export default function Component() {
	return (
		<div className="relative flex h-screen max-h-screen w-screen flex-1 items-center justify-center overflow-hidden antialiased">
			<GlowingStarsBackgroundCard />
		</div>
	)
}

function Content() {
	return (
		<div className="absolute inset-0 z-10 flex h-full w-full flex-1 items-center justify-center">
			<div className="text-center">
				<p className="text-base font-semibold text-white">404</p>
				<h1 className="mt-4 text-3xl font-bold tracking-tight text-white sm:text-5xl">
					Page not found
				</h1>
				<p className="mt-6 text-base leading-7 text-white/90">
					{`Sorry, we couldn't find the page you're looking for.`}
				</p>
				<div className="mt-10 flex items-center justify-center gap-x-6">
					<Link
						to="/files"
						className="rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
					>
						Go back home
					</Link>
				</div>
			</div>
		</div>
	)
}

function GlowingStarsBackgroundCard({
	className,
	children,
}: {
	className?: string
	children?: React.ReactNode
}) {
	const [mouseEnter, setMouseEnter] = useState(false)

	return (
		<div
			onMouseEnter={() => {
				setMouseEnter(true)
			}}
			onMouseLeave={() => {
				setMouseEnter(false)
			}}
			className={cn(
				'h-full max-h-full w-full rounded-xl border border-[#eaeaea] bg-[linear-gradient(110deg,#333_0.6%,#222)] p-4 dark:border-neutral-600',
				className,
			)}
			style={{
				backgroundImage:
					'linear-gradient( 111.4deg,  rgba(7,7,9,1) 6.5%, rgba(27,24,113,1) 93.2% )',
			}}
		>
			<div className="flex h-full items-center justify-center">
				<Illustration mouseEnter={mouseEnter} />
			</div>
			<div className="absolute inset-0 px-2 pb-6">
				<Content />
			</div>
		</div>
	)
}

function Illustration({ mouseEnter }: { mouseEnter: boolean }) {
	const stars = 108
	const columns = 18

	const [glowingStars, setGlowingStars] = useState<number[]>([])

	const highlightedStars = useRef<number[]>([])

	useEffect(() => {
		const interval = setInterval(() => {
			highlightedStars.current = Array.from({ length: 5 }, () =>
				Math.floor(Math.random() * stars),
			)
			setGlowingStars([...highlightedStars.current])
		}, 3000 - Math.random())

		return () => clearInterval(interval)
	}, [])

	return (
		<div
			className="h-full w-full p-1"
			style={{
				display: 'grid',
				gridTemplateColumns: `repeat(${columns}, 1fr)`,
				gap: `1px`,
			}}
		>
			{[...Array(stars)].map((_, starIdx) => {
				const isGlowing = glowingStars.includes(starIdx)
				const delay = (starIdx % 10) * 0.1
				const staticDelay = starIdx * 0.01
				const drift = Math.random() * 10
				return (
					<div
						key={`matrix-col-${starIdx}}`}
						className="relative flex items-center justify-center"
					>
						<Star
							isGlowing={mouseEnter ? true : isGlowing}
							delay={mouseEnter ? staticDelay : delay}
						/>
						{mouseEnter && <Glow delay={staticDelay} />}
						<AnimatePresence mode="wait">
							{isGlowing && <Glow delay={delay} />}
						</AnimatePresence>
					</div>
				)
			})}
		</div>
	)
}

function Star({ isGlowing, delay }: { isGlowing: boolean; delay: number }) {
	return (
		<motion.div
			key={delay}
			initial={{
				scale: 1,
				x: 0,
				y: 0,
			}}
			animate={{
				scale: isGlowing ? [1, 1.2, 2.5, 2.2, 1.5] : 1,
				background: isGlowing ? '#fff' : '#666',
				x: 0 + Math.random() * 100,
				y: 0 + Math.random() * 100,
			}}
			transition={{
				duration: 2 + Math.random() * 2,
				ease: 'easeInOut',
				delay: delay,
			}}
			className={cn('relative z-20 h-[1px] w-[1px] rounded-full bg-[#666]')}
		></motion.div>
	)
}

function Glow({ delay }: { delay: number }) {
	return (
		<motion.div
			initial={{
				opacity: 0,
			}}
			animate={{
				opacity: 1,
			}}
			transition={{
				duration: 2,
				ease: 'easeInOut',
				delay: delay,
			}}
			exit={{
				opacity: 0,
			}}
			className="absolute left-1/2 z-10 h-[4px] w-[4px] -translate-x-1/2 rounded-full bg-blue-500 shadow-2xl shadow-blue-400 blur-[1px]"
		/>
	)
}
