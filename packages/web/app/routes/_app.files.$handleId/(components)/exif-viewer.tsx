import { releaseProxy, wrap } from 'comlink'
import { type ExifTags } from 'exifreader'
import { motion } from 'framer-motion'
import { ChevronUp } from 'lucide-react'
import { Suspense, useMemo, useTransition, useState, useEffect } from 'react'
import { toast } from 'sonner'
import { type ReadExifWorker } from 'workers/read-exif'
import { Button } from '~/components/ui/button'
import { ScrollArea } from '~/components/ui/scroll-area'
import { useFileTree } from '~/context/file-tree'

/**
 * View EXIF data for the current file.
 */
export default function ExifViewer() {
	const [exif, setExif] = useState<ExifReader.Tags | null>(null)
	const [isLoading, setIsLoading] = useState(false)
	const [isPending, startTransition] = useTransition()
	const { state } = useFileTree()

	useEffect(() => {
		const handleWorkerCallback = (ev: MessageEvent<any>) => {
			const { data } = ev
			const type = data?.type

			if (!type) return

			switch (type) {
				case 'start': {
					setIsLoading(true)
					break
				}
				case 'complete': {
					setIsLoading(false)
					const { payload } = data
					const exif = payload?.exif

					if (exif) {
						startTransition(() => setExif(exif))
					}

					break
				}
				case 'error': {
					setIsLoading(false)
					const { payload } = data
					const error = payload?.error

					toast.error('Failed to read EXIF data', {
						description: error?.message ?? '',
					})

					break
				}
				default:
					break
			}
		}

		const handle = state.selected?.data.handle

		if (!handle) return

		const worker = new Worker(
			new URL('/workers/read-exif.js', import.meta.url),
			{
				type: 'module',
			},
		)

		worker.addEventListener('message', handleWorkerCallback)

		// comlink
		const exifParserFn = wrap<ReadExifWorker>(worker)

		exifParserFn({ handle })

		return () => {
			exifParserFn[releaseProxy]()
			worker.removeEventListener('message', handleWorkerCallback)
			worker.terminate()
		}
	}, [state])

	return (
		<div>
			{/* {(isLoading || isPending) && <Skeleton className="h-72" />} */}
			<Suspense>{exif && <AttributesView tags={exif} />}</Suspense>
		</div>
	)
}

type ExpandedViewProps = {
	tags: ExifReader.Tags
}

const coreExifTags: (keyof ExifTags)[] = [
	'DateTimeOriginal',

	'Make',
	'Model',
	'LensMake',
	'LensModel',

	'ImageWidth',
	// @ts-ignore
	'ImageHeight',
	'ImageDescription',
	'Orientation',
	'XResolution',
	'YResolution',
	'ResolutionUnit',
	'Software',

	'GPSLatitudeRef',
	'GPSLatitude',
	'GPSLongitudeRef',
	'GPSLongitude',
	'GPSAltitudeRef',
]

const MotionChevron = motion(ChevronUp)

function AttributesView(props: ExpandedViewProps) {
	const [isExpanded, setIsExpanded] = useState(false)

	const tags: ExifTags = useMemo(() => {
		if (!props.tags) return {}
		if (!isExpanded) {
			return Object.fromEntries(
				coreExifTags
					.filter(key => {
						const value = props.tags[key]
						if (!value) return false
						const hasDescription =
							'description' in value && value.description !== ''
						return hasDescription
					})
					.map(key => [key, props.tags[key]]),
			)
		}
		return props.tags
	}, [isExpanded, props.tags])

	return (
		<div className="flex flex-col gap-4 px-6">
			<div className="flex flex-col gap-4">
				<div className="flex flex-col gap-2">
					<div className="flex w-full items-center justify-between">
						<p className="text-sm font-semibold leading-6 text-gray-900">
							Tags
						</p>
						<div>
							<Button
								variant="ghost"
								size="icon"
								onClick={() => setIsExpanded(s => !s)}
							>
								<MotionChevron
									animate={{ rotate: isExpanded ? 180 : 0 }}
									className="h-5 w-5"
								/>
							</Button>
						</div>
					</div>
					<ScrollArea className="flex h-72 flex-col pb-4">
						{Object.entries(tags ?? {}).map(([key, value]) => {
							const description = value?.description ?? ''
							return (
								<div
									key={key}
									className="my-2 flex flex-col"
								>
									<p className="text-xs font-semibold leading-4 text-gray-600">
										{key}
									</p>
									<p className="text-xs leading-4 text-gray-900">
										{description}
									</p>
								</div>
							)
						})}
					</ScrollArea>
				</div>
			</div>
		</div>
	)
}
