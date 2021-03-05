import { FileDropItem } from './interfaces'

export const isFileDrop = (obj: unknown): obj is FileDropItem => {
  return (
    typeof obj === 'object' && obj !== null && 'items' in obj && 'files' in obj
  )
}
