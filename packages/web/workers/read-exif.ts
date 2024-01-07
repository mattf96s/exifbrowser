import * as Comlink from 'comlink'
import * as ExifReader from 'exifreader'
import { get } from 'idb-keyval'

type ReadExifWorkerProps = {
	handle: FileSystemFileHandle
	withMakerTag?: boolean
}

async function readExif({ handle, withMakerTag }: ReadExifWorkerProps) {
	console.log('readExif', handle)
	postMessage({
		type: 'start',
		payload: {},
	})

	// md5 the name
	const longId = `${handle.name}_${handle.kind}_${
		withMakerTag ? 'with-maker-tag' : 'without-maker-tag'
	}`
	//const hash = await digestMessage(longId)

	const cachedExif = await get<ExifReader.Tags>(longId).catch(() => null)

	if (cachedExif) {
		postMessage({
			type: 'complete',
			payload: {
				exif: cachedExif,
			},
		})
		return
	}

	const file = await handle.getFile()

	const exif = await readExifData({ file, withMakerTag })

	// await set(hash, exif)

	postMessage({
		type: 'complete',
		payload: {
			exif,
		},
	})
}

async function digestMessage(message: string) {
	const msgUint8 = new TextEncoder().encode(message) // encode as (utf-8) Uint8Array
	const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8) // hash the message
	const hashArray = Array.from(new Uint8Array(hashBuffer)) // convert buffer to byte array
	const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('') // convert bytes to hex string
	return hashHex
}

type ReadExifDataProps = {
	file: File
	withMakerTag?: boolean
}

function readExifData({ file, withMakerTag }: ReadExifDataProps) {
	return new Promise<ExifReader.Tags>((resolve, reject) => {
		const exifReader = new FileReader()
		exifReader.onload = readerEvent => {
			try {
				let result = readerEvent.target?.result

				if (result instanceof ArrayBuffer) {
					const tags = ExifReader.load(result)
					// makerTags can be a lot of data (like 30000 invisible characters added to the dom...)
					if (!withMakerTag) {
						delete tags['MakerNote']
					}

					resolve(tags)
				}
			} catch (error) {
				console.error(error)
				reject(error)
			}
		}

		exifReader.readAsArrayBuffer(file)
	})
}

export type ReadExifWorker = typeof readExif
Comlink.expose(readExif)
