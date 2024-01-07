import { useNavigate } from '@remix-run/react'
import { type Remote, releaseProxy, wrap } from 'comlink'
import { useCallback, useEffect, useRef, useState, useTransition } from 'react'
import { toast } from 'sonner'
import { type DuplicateFileWorker } from 'workers/duplicate'
import { useFileTree } from '~/context/file-tree'

// const useRefreshFileTree = () => {
// 	const workerRef = useRef<Worker | null>(null)
// 	const wrapperRef = useRef<Remote<FileTreeWorker> | null>(null)
// 	const { dispatch } = useFileTree()

// 	// initializing is setting up the worker; loading is when the worker is doing something; idle is when the worker is ready to do something
// 	const [status, setStatus] = useState<'initializing' | 'loading' | 'idle'>(
// 		'initializing',
// 	)

// 	useEffect(() => {
// 		setStatus('initializing')
// 		const worker = new Worker(
// 			new URL('/workers/file-tree-worker.js', import.meta.url),
// 			{
// 				type: 'module',
// 			},
// 		)
// 		workerRef.current = worker
// 		setStatus('loading')

// 		worker.onmessage = ev => {
// 			const { data } = ev
// 			const type = data?.type

// 			if (!type) return

// 			switch (type) {
// 				case 'get-directory-tree-started': {
// 					dispatch({
// 						type: 'SET_STATUS',
// 						payload: {
// 							status: 'loading',
// 						},
// 					})
// 					setStatus('loading')
// 					break
// 				}
// 				case 'get-directory-tree-complete': {
// 					setStatus('idle')
// 					const { payload } = data
// 					const tree = payload?.tree

// 					if (!tree) {
// 						toast.warning('Error', {
// 							description: 'Could not get file tree',
// 						})
// 						break
// 					}

// 					dispatch({
// 						type: 'SET_TREE_STRUCTURE',
// 						payload: {
// 							tree,
// 						},
// 					})

// 					dispatch({
// 						type: 'SET_STATUS',
// 						payload: {
// 							status: 'idle',
// 						},
// 					})

// 					break
// 				}
// 				case 'file-tree-error': {
// 					setStatus('idle')
// 					dispatch({
// 						type: 'SET_STATUS',
// 						payload: {
// 							status: 'idle',
// 						},
// 					})
// 					const { payload } = data
// 					toast.warning(payload?.error ?? 'Error', {})
// 					break
// 				}
// 				default:
// 					break
// 			}
// 		}

// 		const wrapper = wrap<FileTreeWorker>(worker)
// 		wrapperRef.current = wrapper

// 		return () => {
// 			wrapper[releaseProxy]()
// 			worker.terminate()
// 		}
// 	}, [dispatch])

// 	return {
// 		workerRef,
// 		wrapperRef,
// 		status,
// 	}
// }

const useDuplicateWorker = () => {
	const rawWorkerRef = useRef<Worker | null>(null)
	const wrapperRef = useRef<Remote<DuplicateFileWorker> | null>(null)
	// initializing is setting up the worker; loading is when the worker is doing something; idle is when the worker is ready to do something
	const [status, setStatus] = useState<'initializing' | 'loading' | 'idle'>(
		'initializing',
	)

	const { dispatch, onRefreshFileTree } = useFileTree()

	const [isPending, startTransition] = useTransition()
	const navigate = useNavigate()

	useEffect(() => {
		let timerId: NodeJS.Timeout | undefined

		const handleWorkerCallback = (ev: MessageEvent<any>) => {
			const { data } = ev
			const type = data?.type

			if (!type) return

			switch (type) {
				case 'duplicate-file-started': {
					setStatus('loading')
					// Don't show the toast if the worker is fast
					timerId = setTimeout(() => {
						toast.info('Duplicate your file', {
							description: 'This will happen in the background',
						})
					}, 1000)

					break
				}
				case 'duplicate-file-complete': {
					clearTimeout(timerId)

					const { payload } = data
					const fileHandle = payload?.fileHandle

					if (fileHandle) {
						toast.success('Success!', {
							description: `Added ${fileHandle.name} to your files`,
							action: {
								label: 'View',
								onClick: () => {
									navigate(`/file/${fileHandle.name}`, {
										state: {
											fileHandle,
										},
									})
								},
							},
						})
					} else {
						toast.success('Success!', {
							description: `Duplicate file created`,
						})
					}

					// refresh the file tree
					startTransition(() => {
						onRefreshFileTree()
						setStatus('idle')
					})

					break
				}
				case 'duplicate-file-error': {
					clearTimeout(timerId)
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
				default: {
					clearTimeout(timerId)
					break
				}
			}
		}

		const worker = new Worker(
			new URL('/workers/duplicate.js', import.meta.url),
			{
				type: 'module',
			},
		)

		worker.addEventListener('message', handleWorkerCallback)

		rawWorkerRef.current = worker

		// comlink
		const wrapper = wrap<DuplicateFileWorker>(worker)
		wrapperRef.current = wrapper

		setStatus('idle')

		return () => {
			wrapper[releaseProxy]()
			worker.removeEventListener('message', handleWorkerCallback)
			worker.terminate()

			if (timerId) {
				clearTimeout(timerId)
			}
		}
	}, [dispatch, navigate, onRefreshFileTree])

	const onDuplicate = useCallback((handle: FileSystemFileHandle) => {
		if (!wrapperRef.current) {
			console.log('wrapperRef.current is null')
			return
		}
		wrapperRef.current(handle)
	}, [])

	return {
		onDuplicate,
		status,
	}
}

export default useDuplicateWorker
