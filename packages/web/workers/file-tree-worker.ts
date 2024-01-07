import * as Comlink from 'comlink'
import { type TreeNode, type TreeNodeData } from '~/context/file-tree'

const fileTreeWorker = {
	getDirectoryTree,
	addFilesToOPFS,
	addFilesHandlesToOPFS,
}

/**
 * List all files in the OPFS.
 * In the future, we might want to better accomodate for nested folders etc.
 */
async function getDirectoryTree(startingDirectory?: string) {
	postMessage({
		type: 'get-directory-tree-started',
		payload: {},
	})

	try {
		let directoryHandle = await navigator.storage.getDirectory()
		let startingHandle = directoryHandle

		if (startingDirectory) {
			startingHandle = await directoryHandle.getDirectoryHandle(
				startingDirectory,
				{ create: false },
			)
			if (!startingHandle) {
				throw new Error('Directory not found')
			}
		}

		type FileWithRelativePath = File & {
			relativePath: string
			handle: FileSystemFileHandle
		}

		async function* getFilesRecursively(
			entry: FileSystemDirectoryHandle | FileSystemFileHandle,
		): AsyncGenerator<FileWithRelativePath> {
			if (entry.kind === 'file') {
				const file = await entry.getFile()
				if (file !== null) {
					const relativePath = (await startingHandle.resolve(entry)) ?? []
					yield Object.assign(file, {
						relativePath: relativePath.join('/'),
						handle: entry,
					})
				}
			} else if (entry.kind === 'directory') {
				for await (const handle of entry.values()) {
					yield* getFilesRecursively(handle)
				}
			}
		}

		const fileTree: TreeNode<TreeNodeData>[] = []

		for await (const fileHandle of getFilesRecursively(directoryHandle)) {
			const newEntry = {
				id: fileHandle.name,
				name: fileHandle.name,
				data: {
					fileSize: fileHandle.size,
					fileType: fileHandle.type,
					handle: fileHandle.handle,
					lastModified: fileHandle.lastModified,
				},
			}

			fileTree.push(newEntry)
			postMessage({
				type: 'get-directory-tree-progress',
				payload: { file: newEntry },
			})
		}

		postMessage({
			type: 'get-directory-tree-complete',
			payload: { tree: fileTree },
		})

		return fileTree
	} catch (e) {
		console.error('Failed to get directory tree: ', e)
		postMessage({
			type: 'get-directory-tree-error',
			payload: {
				error: e instanceof Error ? e.message : 'Something went wrong',
			},
		})
	}
}

/**
 * Add normal files to OPFS (from a file input, for example).
 */
async function addFilesToOPFS(files: File[]) {
	const opfsRoot = await navigator.storage.getDirectory()

	let count = 0

	try {
		// write files to directory
		for (const file of files) {
			const draftHandle = await opfsRoot.getFileHandle(
				`${file.name}_${Date.now()}`,
				{
					create: true,
				},
			)

			// @ts-ignore
			const accessHandle = await draftHandle.createSyncAccessHandle()

			// Get size of the file.
			const buffer = await fileToBuffer(file)

			accessHandle.write(buffer)
			accessHandle.flush()
			accessHandle.close()

			count++

			postMessage({
				type: 'add-files-progress',
				payload: { count, name: file.name },
			})
		}

		postMessage({
			type: 'add-files-complete',
		})
	} catch (e) {
		console.error('Failed to add files: ', e)
		postMessage({
			type: 'add-files-error',
			payload: {
				error: e instanceof Error ? e.message : 'Something went wrong',
			},
		})
	}
}

/**
 * Convert a file to a buffer.
 */
async function fileToBuffer(file: File) {
	const reader = new FileReader()
	const buffer = await new Promise<ArrayBuffer>((resolve, reject) => {
		reader.onload = () => resolve(reader.result as ArrayBuffer)
		reader.onerror = () => reject(reader.error)
		reader.readAsArrayBuffer(file)
	})
	return buffer
}

/**
 * Add file handles to OPFS (from window.showOpenFilePicker, for example).
 * This method is really quick.
 * We could probably do more files at once based on the user hardware.
 */
async function addFilesHandlesToOPFS(newHandles: FileSystemFileHandle[]) {
	const opfsRoot = await navigator.storage.getDirectory()
	let count = 0

	postMessage({
		type: 'add-files-start',
		payload: { total: newHandles.length },
	})

	try {
		// write files to directory
		for (const handle of newHandles) {
			// get file contents
			const file = await handle.getFile()

			// create a new file handle
			const fileHandle = await opfsRoot.getFileHandle(file.name, {
				create: true,
			})

			// @ts-ignore
			const accessHandle = await fileHandle.createSyncAccessHandle()

			const buffer = await fileToBuffer(file)

			accessHandle.write(buffer)
			accessHandle.flush()
			accessHandle.close()

			count++

			postMessage({
				type: 'add-files-progress',
				payload: { count, total: newHandles.length, name: file.name },
			})
		}

		postMessage({
			type: 'add-files-complete',
			payload: { total: count },
		})
	} catch (e) {
		console.error('Failed to add files: ', e)
		postMessage({
			type: 'add-files-error',
			payload: {
				error: e instanceof Error ? e.message : 'Something went wrong',
			},
		})
	}
}

export type FileTreeWorker = typeof fileTreeWorker
Comlink.expose(fileTreeWorker)
