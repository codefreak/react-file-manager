import React, { HTMLProps } from 'react'
import { TableProps as RcTableProps } from 'rc-table/es/Table'
import { ColumnsType } from 'rc-table/es/interface'

export interface FileManagerNode {
  path: string
  type: 'file' | 'directory'
}

export type TableProps<T> = Pick<
  RcTableProps<T>,
  | 'tableLayout'
  | 'components'
  | 'rowKey'
  | 'data'
  | 'className'
  | 'onRow'
  | 'columns'
>

export interface RenameFunc<T> {
  (node: T, newName: string): Promise<void>
}

export interface RowActionProps {
  onDelete: () => void
}

export interface FileManagerProps<T extends FileManagerNode> {
  selectedPaths?: string[]
  additionalColumns?: ColumnsType<T>
  files: T[]
  onMove?: (nodes: T[], target: T) => void
  // onRename?: RenameFunc<T>
  // onCreate?: (node: FileManagerNode, content?: Blob) => Promise<void>
  // onCopy?: (node: T, target: T) => Promise<void>
  onDelete?: (node: T) => void
  onClick?: (node: T) => void
  onDoubleClick?: (node: T) => void
  renderIcon?: (node: T) => React.ReactNode | undefined
  renderTable?: (props: TableProps<T>) => React.ReactElement
  renderActions?: (props: RowActionProps) => React.ReactElement
}

export interface FileDropItem {
  // TODO: this "type" doesn't really exist
  type: '__NATIVE_FILE__'
  items: DataTransferItemList
  files: File[]
}

export type DropItemOrFile<T> = T | FileDropItem

export interface AdditionalRowRenderProps<T extends FileManagerNode>
  extends HTMLProps<HTMLTableRowElement> {
  node: T
  onNodeDrop: (source: T) => void
  canDropNode: (source: DropItemOrFile<T>) => boolean
  onFilesDrop: (files: File[], dataTransfer: DataTransferItemList) => void
}
