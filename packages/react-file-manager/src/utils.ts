import { FileDropItem } from './interfaces'

export const isFileDrag = (obj: unknown): obj is FileDropItem => {
  return (
    typeof obj === 'object' && obj !== null && 'items' in obj && 'files' in obj
  )
}
export const isMultiMove = <T>(selectedItems: T[], draggedItem: T): boolean => {
  return selectedItems.length > 1 && selectedItems.indexOf(draggedItem) !== -1
}

export const basename = (path: string): string => path
