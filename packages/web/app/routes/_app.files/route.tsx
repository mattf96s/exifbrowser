import { Outlet, useNavigate } from '@remix-run/react'
import { useVirtualizer } from '@tanstack/react-virtual'
import { wrap, type Remote, releaseProxy } from 'comlink'
import { motion } from 'framer-motion'
import {
	type CSSProperties,
	memo,
	useCallback,
	useEffect,
	useRef,
	useState,
} from 'react'
import { ClientOnly } from 'remix-utils/client-only'
import { toast } from 'sonner'
import { useSpinDelay } from 'spin-delay'
import { type FileTreeWorker } from 'workers/file-tree-worker'
import FileListItem from './(components)/list-item'
import { Button } from '~/components/ui/button'

import {
	ResizableHandle,
	ResizablePanel,
	ResizablePanelGroup,
} from '~/components/ui/resizeable'
import { ScrollArea } from '~/components/ui/scroll-area'
import { TooltipProvider } from '~/components/ui/tooltip'
import { FileTreeProvider, useFileTree } from '~/context/file-tree'
import { useMediaQuery } from '~/lib/hooks/useMediaQuery'
import { cn } from '~/lib/utils'
import { inflect } from '~/utils/inflect'

export default function Component() {
	return (
		<FileTreeProvider>
			<MemoizedFileTree />
		</FileTreeProvider>
	)
}

const MemoizedFileTree = memo(FileTree)

const useFileDirectoryContents = () => {
	const rawWorkerRef = useRef<Worker | null>(null)
	const workerRef = useRef<Remote<FileTreeWorker> | null>(null)
	const { dispatch } = useFileTree()

	useEffect(() => {
		dispatch({ type: 'SET_STATUS', payload: { status: 'initializing' } })
		const worker = new Worker(
			new URL('/workers/file-tree-worker.js', import.meta.url),
			{
				type: 'module',
			},
		)
		rawWorkerRef.current = worker

		// comlink
		const wrapper = wrap<FileTreeWorker>(worker)
		workerRef.current = wrapper

		dispatch({ type: 'SET_STATUS', payload: { status: 'idle' } })

		return () => {
			wrapper[releaseProxy]()
			worker.terminate()
		}
	}, [dispatch, workerRef])

	return {
		workerRef,
		rawWorkerRef,
	}
}

function FileTreeDropContainer(props: { children: React.ReactNode }) {
	const { dispatch, state } = useFileTree()
	const onAddFilesHook = useAddFilesHandler()

	const onDropHandler = async (e: React.DragEvent<HTMLDivElement>) => {
		e.preventDefault()

		dispatch({ type: 'SET_STATUS', payload: { status: 'loading' } })
		dispatch({ type: 'IS_DRAGGING', payload: { isDragging: false } })

		const fileHandlesPromises = await Promise.all(
			[...e.dataTransfer.items]
				.filter(item => item.kind === 'file')
				.map(item => item.getAsFileSystemHandle()),
		)

		const handles = fileHandlesPromises
			.filter(handle => handle?.kind === 'file')
			.filter(Boolean) as FileSystemFileHandle[]

		await onAddFilesHook(handles)
	}

	const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
		e.preventDefault()
		e.stopPropagation()
		dispatch({ type: 'IS_DRAGGING', payload: { isDragging: true } })
		if (e.dataTransfer !== null) {
			e.dataTransfer.dropEffect = 'copy'
		}
	}

	const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
		dispatch({ type: 'IS_DRAGGING', payload: { isDragging: false } })
	}

	return (
		<div
			className={cn(
				'flex-1 flex-grow',
				state.isDragging &&
					'max-h-full cursor-pointer rounded-xl outline-dashed -outline-offset-8 outline-blue-500',
			)}
			onDrop={onDropHandler}
			onDragOver={handleDragEnter}
			onDragLeave={handleDragLeave}
		>
			<div className={cn('container px-0')}>
				<div className={cn('flex-1 overflow-y-auto')}>{props.children}</div>
			</div>
		</div>
	)
}

function FileTree() {
	return (
		<>
			{/* #TODO: add functionality to smaller screens */}
			<header className="sticky top-0 z-50 hidden w-full border-b bg-background/95 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-background/60 lg:block">
				<div className="container flex items-start justify-between space-y-2 py-4 sm:flex-row sm:items-center sm:space-y-0 md:h-16">
					<h2 className="text-lg font-semibold">File Explorer</h2>
					<motion.div className="inline-flex items-center gap-2">
						<AddFilesButton />
						<EmptyDirectoryButton />
					</motion.div>
				</div>
			</header>

			<FileTreeDropContainer>
				<TooltipProvider delayDuration={0}>
					<ClientOnly>{() => <ResizeableGroupContainer />}</ClientOnly>
				</TooltipProvider>
			</FileTreeDropContainer>
		</>
	)
}

const defaultDesktopLayout = [30, 70]
const defaultMobileLayout = [50, 50]

const getDefaultLayout = (isSmallerScreen: boolean) => {
	return isSmallerScreen ? defaultMobileLayout : defaultDesktopLayout
}

/**
 * Ensure it is client side only so we can use matchMedia.
 */
function ResizeableGroupContainer() {
	const [defaultLayout, setDefaultLayout] = useState<number[]>([
		...defaultDesktopLayout,
	])
	const isSmallerScreen = useMediaQuery('(max-width: 640px)')

	if (isSmallerScreen) {
		return (
			<ResizablePanelGroup
				className="min-h-[calc(100vh-64px)]"
				direction="vertical"
			>
				<ResizablePanel maxSize={75}>
					<Outlet />
				</ResizablePanel>
				<ResizableHandle withHandle />
				<ResizablePanel
					className="max-h-[500px] overflow-y-auto"
					maxSize={75}
				>
					<ScrollArea className="h-[500px]">
						<MemoTreeView height={500} />
					</ScrollArea>
				</ResizablePanel>
			</ResizablePanelGroup>
		)
	}

	return (
		<ResizablePanelGroup
			direction={isSmallerScreen ? 'vertical' : 'horizontal'}
			onLayout={(sizes: number[]) => {
				document.cookie = `react-resizable-panels:layout=${JSON.stringify(
					sizes,
				)}`
			}}
			className="h-full max-h-[calc(100vh-64px)] items-stretch" // 64px offset is the height of the header. NB for smooth scrolling with the virtualizer.
		>
			<ResizablePanel
				defaultSize={defaultLayout[0]}
				minSize={30}
			>
				<MemoTreeView />
			</ResizablePanel>
			<ResizableHandle withHandle />
			<ResizablePanel defaultSize={defaultLayout[1]}>
				<Outlet />
			</ResizablePanel>
		</ResizablePanelGroup>
	)
}

const MemoTreeView = memo(TreeView)

/**
 * Need to pass the worker to this hook as if accessed directly from the context it won't update (because it's a ref).
 * @param worker
 */
const useAddFileToasts = (worker: Worker | null) => {
	const { dispatch, state, onRefreshFileTree } = useFileTree()

	const isInitializing = state.status === 'initializing'

	useEffect(() => {
		const handleWorkerCallback = (ev: MessageEvent<any>) => {
			const { data } = ev
			const type = data?.type

			if (!type) return

			switch (type) {
				case 'add-files-start': {
					const { payload } = data
					const total = payload?.total ?? 0

					if (total < 10) break // otherwise too quick
					toast.info('Adding files', {
						description: 'This will happen in the background',
					})

					break
				}
				case 'add-files-complete': {
					const count = data.payload?.total ?? 0
					const inflectedFile = inflect('file')(count)
					toast.success('Success!', {
						description: `${count} ${inflectedFile} added`,
					})
					onRefreshFileTree()
					break
				}
				case 'add-files-error': {
					const { payload } = data
					dispatch({
						type: 'SET_STATUS',
						payload: {
							status: 'idle',
						},
					})
					toast.warning(payload?.error ?? 'Error', {})

					break
				}
				default:
					break
			}
		}

		worker?.addEventListener('message', handleWorkerCallback)

		return () => {
			worker?.removeEventListener('message', handleWorkerCallback)
		}
	}, [dispatch, isInitializing, onRefreshFileTree, worker])
}

const useAddFilesHandler = () => {
	const { workerRef, rawWorkerRef } = useFileDirectoryContents()
	const { dispatch } = useFileTree()

	useAddFileToasts(rawWorkerRef.current)

	return useCallback(
		async (fileHandles: FileSystemFileHandle[]) => {
			if (!fileHandles) return
			if (fileHandles.length === 0) return

			if (!workerRef.current || !workerRef.current.addFilesHandlesToOPFS) {
				toast.warning('Worker not ready', {
					description: 'Please try again',
				})
				return
			}

			dispatch({ type: 'SET_STATUS', payload: { status: 'loading' } })

			const permissions = await navigator.permissions.query({
				name: 'persistent-storage',
			})

			if (permissions.state !== 'granted') {
				const canPersist = await navigator.storage.persist()

				if (!canPersist) {
					toast.warning('Unable to process files', {
						description: 'Persistent storage permission not granted',
					})
					dispatch({ type: 'SET_STATUS', payload: { status: 'idle' } })
					return
				}
			}

			try {
				await workerRef.current.addFilesHandlesToOPFS(fileHandles)
				await workerRef.current.getDirectoryTree().then(tree => {
					dispatch({
						type: 'SET_TREE_STRUCTURE',
						payload: {
							// @ts-ignore
							tree,
						},
					})
				})
				// worker above handles toasts
			} catch (error) {
				console.error('Failed to add files: ', error)
				toast.warning('Failed to add files', {
					description: error instanceof Error ? error.message : undefined,
				})
			} finally {
				dispatch({ type: 'SET_STATUS', payload: { status: 'idle' } })
			}
		},
		[dispatch, workerRef],
	)
}

function AddFilesButton() {
	const { state } = useFileTree()
	const onAddFilesHook = useAddFilesHandler()

	const isIdle = state.status === 'idle'

	const onAddFiles = async () => {
		if (!isIdle) return
		const fileHandles = await window.showOpenFilePicker({
			types: [
				{
					description: 'Images',
					accept: {
						'image/*': ['.png', '.gif', '.jpeg', '.jpg'],
					},
				},
			],
			excludeAcceptAllOption: false,
			multiple: true,
		})

		onAddFilesHook(fileHandles)
	}

	const showDisabledState = useSpinDelay(!isIdle, {
		delay: 500,
	})

	return (
		<Button
			disabled={showDisabledState}
			size="sm"
			type="button"
			onClick={onAddFiles}
		>
			Add files
		</Button>
	)
}

function EmptyDirectoryButton() {
	const { workerRef } = useFileDirectoryContents()
	const { state, dispatch } = useFileTree()
	const isIdle = state.status === 'idle'

	const navigate = useNavigate()

	const onClearFiles = async () => {
		if (!isIdle) return
		dispatch({ type: 'SET_STATUS', payload: { status: 'loading' } })
		const opfsRoot = await navigator.storage.getDirectory()

		try {
			// @ts-ignore
			await opfsRoot.remove({ recursive: true })

			const tree = await workerRef.current?.getDirectoryTree()
			dispatch({
				type: 'SET_TREE_STRUCTURE',
				payload: {
					// @ts-ignore
					tree,
				},
			})
			dispatch({ type: 'UNSET_SELECTED' })

			toast.success('Files removed')
		} catch (error) {
			console.error('Failed to clear all files: ', error)
			toast.warning('Failed to clear all files', {
				description: error instanceof Error ? error.message : undefined,
			})
		} finally {
			dispatch({ type: 'SET_STATUS', payload: { status: 'idle' } })
			navigate('/files')
		}
	}

	const showDisabledState = useSpinDelay(!isIdle, {
		delay: 500,
	})
	return (
		<Button
			disabled={showDisabledState}
			variant="destructive"
			type="button"
			onClick={onClearFiles}
			size="sm"
		>
			Clear files
		</Button>
	)
}

type TreeViewProps = {
	height?: CSSProperties['height']
}
function TreeView(props: TreeViewProps) {
	const { workerRef } = useFileDirectoryContents()
	const { dispatch, state } = useFileTree()

	// The scrollable element for your list
	const parentRef = useRef<HTMLDivElement | null>(null)

	// The virtualizer
	const virtualizer = useVirtualizer({
		count: state.tree.length,
		getScrollElement: () => parentRef.current,
		estimateSize: () => 84,
		getItemKey: index => state.tree[index].id,
	})

	const isInitialized = state.status !== 'initializing'

	useEffect(() => {
		if (!isInitialized) return
		if (!workerRef.current) return
		dispatch({ type: 'SET_STATUS', payload: { status: 'loading' } })
		workerRef.current.getDirectoryTree().then(tree => {
			dispatch({
				type: 'SET_TREE_STRUCTURE',
				payload: {
					// @ts-ignore
					tree,
				},
			})
			dispatch({ type: 'SET_STATUS', payload: { status: 'idle' } })
		})
	}, [dispatch, isInitialized, workerRef])

	const items = virtualizer.getVirtualItems()

	const height = props.height

	return (
		<>
			<div
				ref={parentRef}
				style={{
					height: height ?? `calc(100vh - 64px)`,
					//width: `42rem`,
					overflowY: 'auto',
					contain: 'strict',
					scrollbarWidth: 'none',
					WebkitOverflowScrolling: 'touch',
					scrollBehavior: 'smooth',
					paddingTop: '1rem',
					paddingBottom: '1rem',
				}}
			>
				<div
					style={{
						height: `${virtualizer.getTotalSize()}px`,
						width: '100%',
						position: 'relative',
					}}
				>
					<div
						style={{
							position: 'absolute',
							top: 0,
							left: 0,
							width: '100%',
							transform: `translateY(${items[0]?.start ?? 0}px)`,
						}}
						className="flex flex-col" // gap-2 px-4 pb-10 pt-4"
					>
						{virtualizer.getVirtualItems().map(virtualItem => {
							const node = state.tree[virtualItem.index]
							return (
								<FileListItem
									measureElement={virtualizer.measureElement}
									key={node.id}
									node={node}
									virtualItem={virtualItem}
								/>
							)
						})}
					</div>
				</div>
			</div>
		</>
	)
}
