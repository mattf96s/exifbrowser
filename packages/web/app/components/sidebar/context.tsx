import * as React from 'react'
import useCookie from '~/lib/hooks/useCookie'

type SidebarProviderProps = { children: React.ReactNode }

const SidebarStateContext = React.createContext<
	{ isOpen: boolean; onToggleSidebar: (isOpen: boolean) => void } | undefined
>(undefined)

function SidebarProvider({ children }: SidebarProviderProps) {
	const isOpenCookie = useCookie('desktop-sidebar', { defaultValue: `false` })

	const onToggleSidebar = React.useCallback(
		(isOpen: boolean) => {
			isOpenCookie.updateCookie(isOpen ? 'true' : 'false')
		},
		[isOpenCookie],
	)

	const value = React.useMemo(() => {
		const isOpen = isOpenCookie.cookieValue === 'true'
		return {
			isOpen,
			onToggleSidebar,
		}
	}, [isOpenCookie.cookieValue, onToggleSidebar])
	return (
		<SidebarStateContext.Provider value={value}>
			{children}
		</SidebarStateContext.Provider>
	)
}

function useSidebar() {
	const context = React.useContext(SidebarStateContext)
	if (context === undefined) {
		throw new Error('useSidebar must be used within a SidebarProvider')
	}
	return context
}

export { SidebarProvider, useSidebar }
