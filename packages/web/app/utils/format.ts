/**
 * Format file size into a more meaningful string.
 */
export const humanizeFileSize = (bytes: number, si = false) => {
	const thresh = si ? 1000 : 1024

	if (Math.abs(bytes) < thresh) {
		return bytes + ' B'
	}

	const units = si
		? ['kB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
		: ['KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB', 'ZiB', 'YiB']

	let u = -1
	const r = 10 ** 1

	do {
		bytes /= thresh
		++u
	} while (
		Math.round(Math.abs(bytes) * r) / r >= thresh &&
		u < units.length - 1
	)

	return bytes.toFixed(1) + ' ' + units[u]
}
