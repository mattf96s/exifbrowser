import { ArchiveIcon } from '@radix-ui/react-icons'
import { useParams } from '@remix-run/react'
import { type Remote, releaseProxy, wrap } from 'comlink'
import { addDays, addHours, format, nextSaturday } from 'date-fns'
import { AnimatePresence, motion } from 'framer-motion'
import {
	Calendar,
	Clock,
	FileArchive,
	Forward,
	Loader2,
	MoreVertical,
	Reply,
	ReplyAll,
	Trash2,
} from 'lucide-react'
import { useEffect, useRef, useState, useTransition } from 'react'
import { toast } from 'sonner'
import { type ImageCompressorWorker } from 'workers/image-compressor-worker'
import ExifViewer from './(components)/exif-viewer'
import { Button } from '~/components/ui/button'
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu'
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from '~/components/ui/popover'
import { ScrollArea } from '~/components/ui/scroll-area'
import { Separator } from '~/components/ui/separator'
import { Skeleton } from '~/components/ui/skeleton'
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from '~/components/ui/tooltip'
import {
	type TreeNode,
	type TreeNodeData,
	useFileTree,
} from '~/context/file-tree'
import { humanizeFileSize } from '~/utils/format'

export default function Component() {
	const params = useParams()
	const handleId = params.handleId
	const decodedHandleId = handleId ? decodeURIComponent(handleId) : null

	const { state, dispatch } = useFileTree()

	const { selected } = state

	useEffect(() => {
		const handleCallback = (ev: MessageEvent<any>) => {
			const { data } = ev
			const type = data?.type

			if (!type) return

			switch (type) {
				case 'start': {
					dispatch({
						type: 'SET_STATUS',
						payload: {
							status: 'loading',
						},
					})
					break
				}
				case 'complete': {
					const { payload } = data

					const node = payload?.node

					if (node) {
						dispatch({
							type: 'SET_SELECTED',
							payload: {
								selected: node,
							},
						})
					}

					dispatch({
						type: 'SET_STATUS',
						payload: {
							status: 'idle',
						},
					})
					break
				}
				case 'error': {
					const { payload } = data
					const error = payload?.error
					if (error) {
						toast.error(error)
					}
					dispatch({
						type: 'SET_STATUS',
						payload: {
							status: 'idle',
						},
					})
					break
				}
				default:
					break
			}
		}
		if (!decodedHandleId) return

		const worker = new Worker(
			new URL('/workers/image-compressor-worker.js', import.meta.url),
			{
				type: 'module',
			},
		)

		worker.addEventListener('message', handleCallback)

		const getImageFn = wrap<ImageCompressorWorker>(worker)

		getImageFn({ path: decodedHandleId })

		return () => {
			getImageFn[releaseProxy]()
			worker.removeEventListener('message', handleCallback)
			worker.terminate()
		}
	}, [decodedHandleId, dispatch])

	if (!selected) return null

	return (
		<div className="flex h-full flex-col">
			<div className="flex items-center p-2">
				<FileToolbar />
			</div>
			<Separator />
			<FileDetailsHeader selected={selected} />
		</div>
	)
}

function FileDetailsHeader({ selected }: { selected: TreeNode<TreeNodeData> }) {
	const [file, setFile] = useState<File | null>(null)
	const [isPending, startTransition] = useTransition()

	const handle = selected?.data.handle

	useEffect(() => {
		let isCancel = false
		if (!handle) return
		if (handle.kind !== 'file') return

		const parseFile = async (handle: FileSystemFileHandle) => {
			try {
				const file = await handle.getFile()
				if (isCancel) return
				startTransition(() => setFile(file))
			} catch (e) {
				toast.error(e instanceof Error ? e.message : 'Failed to read the file')
			}
		}

		parseFile(handle)

		return () => {
			isCancel = true
		}
	}, [handle])

	if (!selected) return null

	return (
		<ScrollArea className="flex-1">
			<div className="flex flex-1 flex-col">
				<div className="p-3">
					<div className="aspect-h-7 aspect-w-10 relative mb-4 block w-full overflow-hidden rounded-lg bg-gray-900">
						<PerformantImage handle={handle} />
					</div>
				</div>

				<div className="flex items-start p-4">
					<div className="flex items-start justify-between">
						<div>
							<h2 className="text-lg font-medium text-gray-900">
								<span className="sr-only">Details for </span>
								{selected.name}
							</h2>
							<p className="text-sm font-medium text-gray-500">
								{humanizeFileSize(selected.data.fileSize)}
							</p>
						</div>
					</div>
				</div>
				<Separator />
				<ExifViewer />
			</div>
		</ScrollArea>
	)
}

const useCompressImage = (handle: FileSystemFileHandle) => {
	const [isLoading, setIsLoading] = useState(false)
	const rawWorkerRef = useRef<Worker | null>(null)
	const workerRef = useRef<Remote<ImageCompressorWorker> | null>(null)
	const [src, setSrc] = useState<null | string>(null)

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
					const { payload } = data
					const src = payload?.src

					if (src && typeof src === 'string') {
						setSrc(src)
					}
					setIsLoading(false)
					break
				}
				case 'error': {
					const { payload } = data
					const error = payload?.error
					if (error) {
						toast.error(error)
					}
					setIsLoading(false)
					break
				}
				default:
					break
			}
		}

		const worker = new Worker(
			new URL('/workers/image-compressor-worker.js', import.meta.url),
			{
				type: 'module',
			},
		)
		rawWorkerRef.current = worker

		worker.addEventListener('message', handleWorkerCallback)

		// comlink
		const compressImageFn = wrap<ImageCompressorWorker>(worker)
		workerRef.current = compressImageFn

		compressImageFn({ handle }).catch(e => {
			console.error('Failed to compress image: ', e)
		})

		return () => {
			compressImageFn[releaseProxy]()
			worker.removeEventListener('message', handleWorkerCallback)
			worker.terminate()
		}
	}, [handle])

	return {
		src,
		isLoading,
	}
}

function PerformantImage({ handle }: { handle: FileSystemFileHandle }) {
	const { isLoading, src } = useCompressImage(handle)

	return (
		<AnimatePresence>
			{src && (
				<motion.img
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					exit={{
						opacity: 0,
						transition: {
							duration: 0.1,
						},
					}}
					layout
					layoutId="selected-image"
					key={src}
					src={src}
					alt=""
					className="object-cover"
				/>
			)}

			{isLoading && (
				<Skeleton className="absolute inset-0 flex h-full w-full items-center justify-center rounded-md bg-white/50 p-2">
					<Loader2 className="size-10 animate-spin" />
				</Skeleton>
			)}
		</AnimatePresence>
	)
}

function FileToolbar() {
	const today = new Date()
	const { state } = useFileTree()
	const { selected } = state
	return (
		<>
			<div className="flex items-center gap-2">
				<Tooltip>
					<TooltipTrigger asChild>
						<Button
							variant="ghost"
							size="icon"
							disabled={!selected}
						>
							<ArchiveIcon className="h-4 w-4" />
							<span className="sr-only">Archive</span>
						</Button>
					</TooltipTrigger>
					<TooltipContent>Archive</TooltipContent>
				</Tooltip>
				<Tooltip>
					<TooltipTrigger asChild>
						<Button
							variant="ghost"
							size="icon"
							disabled={!selected}
						>
							<FileArchive className="h-4 w-4" />
							<span className="sr-only">Move to junk</span>
						</Button>
					</TooltipTrigger>
					<TooltipContent>Move to junk</TooltipContent>
				</Tooltip>
				<Tooltip>
					<TooltipTrigger asChild>
						<Button
							variant="ghost"
							size="icon"
							disabled={!selected}
						>
							<Trash2 className="h-4 w-4" />
							<span className="sr-only">Move to trash</span>
						</Button>
					</TooltipTrigger>
					<TooltipContent>Move to trash</TooltipContent>
				</Tooltip>
				<Separator
					orientation="vertical"
					className="mx-1 h-6"
				/>
				<Tooltip>
					<Popover>
						<PopoverTrigger asChild>
							<TooltipTrigger asChild>
								<Button
									variant="ghost"
									size="icon"
									disabled={!selected}
								>
									<Clock className="h-4 w-4" />
									<span className="sr-only">Snooze</span>
								</Button>
							</TooltipTrigger>
						</PopoverTrigger>
						<PopoverContent className="flex w-[535px] p-0">
							<div className="flex flex-col gap-2 border-r px-2 py-4">
								<div className="px-4 text-sm font-medium">Snooze until</div>
								<div className="grid min-w-[250px] gap-1">
									<Button
										variant="ghost"
										className="justify-start font-normal"
									>
										Later today{' '}
										<span className="ml-auto text-muted-foreground">
											{format(addHours(today, 4), 'E, h:m b')}
										</span>
									</Button>
									<Button
										variant="ghost"
										className="justify-start font-normal"
									>
										Tomorrow
										<span className="ml-auto text-muted-foreground">
											{format(addDays(today, 1), 'E, h:m b')}
										</span>
									</Button>
									<Button
										variant="ghost"
										className="justify-start font-normal"
									>
										This weekend
										<span className="ml-auto text-muted-foreground">
											{format(nextSaturday(today), 'E, h:m b')}
										</span>
									</Button>
									<Button
										variant="ghost"
										className="justify-start font-normal"
									>
										Next week
										<span className="ml-auto text-muted-foreground">
											{format(addDays(today, 7), 'E, h:m b')}
										</span>
									</Button>
								</div>
							</div>
							<div className="p-2">
								<Calendar />
							</div>
						</PopoverContent>
					</Popover>
					<TooltipContent>Snooze</TooltipContent>
				</Tooltip>
			</div>
			<div className="ml-auto flex items-center gap-2">
				<Tooltip>
					<TooltipTrigger asChild>
						<Button
							variant="ghost"
							size="icon"
							disabled={!selected}
						>
							<Reply className="h-4 w-4" />
							<span className="sr-only">Reply</span>
						</Button>
					</TooltipTrigger>
					<TooltipContent>Reply</TooltipContent>
				</Tooltip>
				<Tooltip>
					<TooltipTrigger asChild>
						<Button
							variant="ghost"
							size="icon"
							disabled={!selected}
						>
							<ReplyAll className="h-4 w-4" />
							<span className="sr-only">Reply all</span>
						</Button>
					</TooltipTrigger>
					<TooltipContent>Reply all</TooltipContent>
				</Tooltip>
				<Tooltip>
					<TooltipTrigger asChild>
						<Button
							variant="ghost"
							size="icon"
							disabled={!selected}
						>
							<Forward className="h-4 w-4" />
							<span className="sr-only">Forward</span>
						</Button>
					</TooltipTrigger>
					<TooltipContent>Forward</TooltipContent>
				</Tooltip>
			</div>
			<Separator
				orientation="vertical"
				className="mx-2 h-6"
			/>
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<Button
						variant="ghost"
						size="icon"
						disabled={!selected}
					>
						<MoreVertical className="h-4 w-4" />
						<span className="sr-only">More</span>
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent align="end">
					<DropdownMenuItem>Mark as unread</DropdownMenuItem>
					<DropdownMenuItem>Star thread</DropdownMenuItem>
					<DropdownMenuItem>Add label</DropdownMenuItem>
					<DropdownMenuItem>Mute thread</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>
		</>
	)
}
