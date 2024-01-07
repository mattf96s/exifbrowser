import imageCompression from 'browser-image-compression'
import * as Comlink from 'comlink'
import { type TreeNode, type TreeNodeData } from '~/context/file-tree'

type ImageCompressorWorkerProps =
	| {
			path: string
	  }
	| {
			handle: FileSystemFileHandle
	  }

async function imageCompressor(props: ImageCompressorWorkerProps) {
	postMessage({
		type: 'start',
		payload: {},
	})

	const opfsRoot = await navigator.storage.getDirectory()

	let originalHandle: FileSystemFileHandle | undefined
	if ('path' in props) {
		originalHandle = await opfsRoot.getFileHandle(props.path)
		if (!originalHandle) {
			postMessage({
				type: 'error',
				payload: {
					error: 'File not found',
				},
			})
			return
		}
	} else {
		if ('handle' in props) {
			originalHandle = props.handle
		}
	}

	if (!originalHandle) {
		postMessage({
			type: 'error',
			payload: {
				error: 'File not found',
			},
		})
		return
	}

	const file = await originalHandle.getFile()

	// const fileHandle = await opfsRoot.getFileHandle(`${file.name}_compressed`, {
	// 	create: true,
	// })

	// @ts-ignore
	// const accessHandle = await fileHandle.createSyncAccessHandle()

	const img = await imageCompression(file, {
		maxSizeMB: 2,
		maxWidthOrHeight: 1920,
		useWebWorker: true,
		preserveExif: false,
	})

	let buffer = await img.arrayBuffer()

	const src = URL.createObjectURL(
		new Blob([buffer], {
			type: img.type,
		}),
	)

	// accessHandle.write(buffer)
	// accessHandle.flush()
	// accessHandle.close()

	const treeNode: TreeNode<TreeNodeData> = {
		id: originalHandle.name,
		name: originalHandle.name,
		children: [],
		data: {
			fileSize: file.size,
			fileType: file.type,
			handle: originalHandle,
			lastModified: file.lastModified,
		},
	}

	postMessage({
		type: 'complete',
		payload: {
			src,
			node: treeNode,
		},
	})
}

export type ImageCompressorWorker = typeof imageCompressor
Comlink.expose(imageCompressor)
