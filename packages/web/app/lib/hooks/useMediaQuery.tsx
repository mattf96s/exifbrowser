import { useCallback, useSyncExternalStore } from 'react'

type EventListenerCB = Parameters<
	ReturnType<typeof matchMedia>['addEventListener']
>[1]

/**
 * The useMediaQuery hook leverages the window.matchMedia API to subscribe to CSS media query changes, thereby providing real-time responsiveness to dynamic changes in the viewport or screen orientation.
 * It allows the component to rerender whenever the media query’s result changes. It throws an error if attempted to be used on the server-side (media queries only work in the browser).
 * @source [usehooks](https://github.com/uidotdev/usehooks/blob/dfa6623fcc2dcad3b466def4e0495b3f38af962b/index.js#L785C1-L807C2)
 * 
 * @example
 	const isSmallDevice = useMediaQuery("only screen and (max-width : 768px)");
  	const isMediumDevice = useMediaQuery(
    	"only screen and (min-width : 769px) and (max-width : 992px)"
  	);
  	const isLargeDevice = useMediaQuery(
    	"only screen and (min-width : 993px) and (max-width : 1200px)"
  	);
  	const isExtraLargeDevice = useMediaQuery(
    	"only screen and (min-width : 1201px)"
  	);
 */
export function useMediaQuery(query: string) {
	const subscribe = useCallback(
		(callback: EventListenerCB) => {
			const matchMedia = window.matchMedia(query)

			matchMedia.addEventListener('change', callback)
			return () => {
				matchMedia.removeEventListener('change', callback)
			}
		},
		[query],
	)

	const getSnapshot = () => {
		return window.matchMedia(query).matches
	}

	const getServerSnapshot = () => {
		throw Error('useMediaQuery is a client-only hook')
	}

	return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
}
