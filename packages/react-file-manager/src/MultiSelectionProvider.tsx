import { createContext, useContext } from 'react'

const MultiSelectContext = createContext<unknown[]>([])
MultiSelectContext.displayName = 'MultiSelectContext'

const MultiSelectProvider = MultiSelectContext.Provider

export const useSelectedItems = (): any[] => useContext(MultiSelectContext)

export default MultiSelectProvider
