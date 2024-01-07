import { wrap } from 'comlink'
import {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useReducer,
	useRef,
} from 'react'
import { toast } from 'sonner'
import { type FileTreeWorker } from 'workers/file-tree-worker'

export type TreeNode<T> = {
	id: string
	name: string
	data: T
	children?: TreeNode<T>[]
}

export type TreeNodeData = {
	fileSize: number
	fileType: string
	handle: FileSystemFileHandle
	lastModified: number
}

type Status = 'initializing' | 'loading' | 'idle' | 'error'

type State<T> = {
	tree: TreeNode<T>[]
	status: Status
	isDragging: boolean
	selected: TreeNode<T> | undefined
}

type Action<T> =
	| {
			type: 'IS_DRAGGING'
			payload: {
				isDragging: boolean
			}
	  }
	| {
			type: 'SET_TREE_STRUCTURE'
			payload: {
				tree: TreeNode<T>[]
			}
	  }
	| {
			type: 'SET_STATUS'
			payload: {
				status: Status
			}
	  }
	| {
			type: 'SET_SELECTED'
			payload: {
				selected: TreeNode<T>
			}
	  }
	| {
			type: 'UNSET_SELECTED'
	  }
	| {
			type: 'MERGE_TREE_STRUCTURE'
			payload: {
				tree: TreeNode<T>[]
			}
	  }

type Dispatch<T> = (action: Action<T>) => void

type FileTreeProviderProps = { children: React.ReactNode }

const FileTreeStateContext = createContext<
	| {
			state: State<TreeNodeData>
			dispatch: Dispatch<TreeNodeData>
			onRefreshFileTree: () => void
	  }
	| undefined
>(undefined)

function fileHandleReducer<T>(state: State<T>, action: Action<T>): State<T> {
	switch (action.type) {
		case 'SET_STATUS': {
			const { status } = action.payload
			return { ...state, status }
		}

		case 'SET_TREE_STRUCTURE': {
			const { tree } = action.payload
			return { ...state, tree }
		}

		case 'MERGE_TREE_STRUCTURE': {
			const { tree } = action.payload
			const mergedTree = [...state.tree, ...tree]
			return { ...state, tree: mergedTree }
		}

		case 'IS_DRAGGING': {
			const { isDragging } = action.payload
			return { ...state, isDragging }
		}

		case 'SET_SELECTED': {
			const { selected } = action.payload
			return { ...state, selected }
		}

		case 'UNSET_SELECTED': {
			return { ...state, selected: undefined }
		}

		default: {
			return { ...state }
		}
	}
}

const initialHandleState: State<TreeNodeData> = {
	tree: [],
	status: 'initializing',
	isDragging: false,
	selected: undefined,
}

function FileTreeProvider(props: FileTreeProviderProps) {
	const [state, dispatch] = useReducer(fileHandleReducer<TreeNodeData>, {
		...initialHandleState,
	})
	const workerRef = useRef<Worker | undefined>(undefined)

	useEffect(() => {
		//if (workerRef.current) return

		const worker = new Worker('/workers/file-tree-worker.ts', {
			type: 'module',
		})
		worker.onmessage = ev => {
			const { data } = ev
			const type = data?.type

			if (!type) return

			switch (type) {
				case 'get-directory-tree-started': {
					dispatch({
						type: 'SET_STATUS',
						payload: {
							status: 'loading',
						},
					})
					break
				}
				case 'get-directory-tree-complete': {
					dispatch({
						type: 'SET_STATUS',
						payload: {
							status: 'idle',
						},
					})
					const { payload } = data
					const tree = payload?.tree

					if (!tree) {
						break
					}

					dispatch({
						type: 'SET_TREE_STRUCTURE',
						payload: {
							tree,
						},
					})
					break
				}
				case 'file-tree-error': {
					dispatch({
						type: 'SET_STATUS',
						payload: {
							status: 'idle',
						},
					})
					const { payload } = data
					const error = payload?.error
					if (error) {
						toast.warning('Error', {
							description: error,
						})
					}
					break
				}
				case 'aborted': {
					console.log('aborted')
					break
				}
				default:
					break
			}
		}
		workerRef.current = worker
		return () => {
			worker.terminate()
			workerRef.current = undefined
		}
	}, [])

	const onRefreshFileTree = useCallback(() => {
		if (!workerRef.current) return
		if (state.status === 'initializing') return

		if (state.status === 'loading') {
			// cancel the old invocation
			workerRef.current.postMessage({
				type: 'cancel',
			})
		}

		const wrapper = wrap<FileTreeWorker>(workerRef.current)

		wrapper.getDirectoryTree()
	}, [state.status])

	const value = useMemo(
		() => ({ state, dispatch, onRefreshFileTree }),
		[state, dispatch, onRefreshFileTree],
	)
	return (
		<FileTreeStateContext.Provider value={value}>
			{props.children}
		</FileTreeStateContext.Provider>
	)
}

function useFileTree() {
	const context = useContext(FileTreeStateContext)

	if (context === undefined) {
		throw new Error('useFileTree must be used within a FileTreeProvider')
	}
	return context
}

export { FileTreeProvider, useFileTree }
