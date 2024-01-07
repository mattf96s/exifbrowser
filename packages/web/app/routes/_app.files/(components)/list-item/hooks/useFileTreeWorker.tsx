// import { type Remote, releaseProxy, wrap } from 'comlink'
// import { useCallback, useEffect, useRef, useState } from 'react'
// import { toast } from 'sonner'
// import { type FileTreeWorker } from 'workers/file-tree-worker'
// import { useFileTree } from '~/context/file-tree'

// type WorkWeakMap = WeakMap<Worker, Remote<unknown>>
// /**
//  * @description
//  * A hook that exposes the methods in the file-tree-worker:
//   	- getDirectoryTree: enumerates the directory tree.
// 	- addFilesToOPFS: adds files of type [File] to the OPFS (i.e. FileSystemAPI rather than FileSystemFileAPI).
// 	- addFilesHandlesToOPFS: adds files of type [FileSystemFileHandle] to the OPFS.

//  *   Consumers of this hook are responsible for setting up and cleaning
//  *
//  * @example
// 	const { workerRef, wrapperRef, status } = useRefreshFileTree()
// 	const { dispatch } = useFileTree()

// 	const refreshFileTree = useCallback(() => {
// 		if (!wrapperRef.current) return
// 		wrapperRef.current.getDirectoryTree()
// 	},[])
//  */
// const useFileTreeWorker = () => {
// 	const workerListeners = useRef<>(new WeakMap())
// 	const workerRef = useRef<Worker | null>(null)
// 	const wrapperRef = useRef<Remote<FileTreeWorker> | null>(null)
// 	const { dispatch } = useFileTree()

// 	// initializing is setting up the worker; loading is when the worker is doing something; idle is when the worker is ready to do something
// 	const [status, setStatus] = useState<'initializing' | 'loading' | 'idle'>(
// 		'initializing',
// 	)

// 	const [isRefreshing, setIsRefreshing] = useState(false)

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

// 		const wrapper = wrap<FileTreeWorker>(worker)
// 		wrapperRef.current = wrapper

// 		return () => {
// 			wrapper[releaseProxy]()
// 			worker.terminate()
// 		}
// 	}, [])

// 	const onRefreshFileTree = useCallback(() => {
// 		if (!wrapperRef.current) return
// 		if (isRefreshing) {
// 			wrapperRef.current.getDirectoryTree.caller
// 		}
// 		wrapperRef.current.getDirectoryTree()
// 	}, [])

// 	return {
// 		workerRef,
// 		wrapperRef,
// 		status,
// 	}
// }

// const useRefreshFileTree = () => {
// 	const { workerRef, wrapperRef, status } = useFileTreeWorker()
// 	const { dispatch } = useFileTree()

// 	const isInitialized = status !== 'initializing'

// 	useEffect(() => {
// 		const onMessageCallback = (ev: MessageEvent) => {
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

// 		if (!isInitialized) return
// 		if (!workerRef.current) return

// 		let worker = workerRef.current

// 		worker.addEventListener('message', onMessageCallback)

// 		return () => {
// 			worker.removeEventListener('message', onMessageCallback)
// 		}
// 	}, [dispatch, isInitialized, workerRef])
// }

// export { useFileTreeWorker }
