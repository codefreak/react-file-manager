import { FileDropItem } from './interfaces'

export const isFileDrop = (obj: unknown): obj is FileDropItem => {
  return (
    typeof obj === 'object' && obj !== null && 'items' in obj && 'files' in obj
  )
}
export const isMultiMove = (
  selectedPaths: string[],
  draggedItemPath: string
): boolean => {
  return (
    selectedPaths.length > 1 && selectedPaths.indexOf(draggedItemPath) !== -1
  )
}
