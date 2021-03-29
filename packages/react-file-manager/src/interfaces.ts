import React, { HTMLProps } from 'react'
import { TableProps as RcTableProps } from 'rc-table/es/Table'
import { ColumnsType, DefaultRecordType } from 'rc-table/es/interface'

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

export interface FileManagerDragLayerProps<T> {
  x: number
  y: number
  draggedItems: T[]
}

export interface FileManagerProps<T extends FileManagerNode>
  extends Omit<
    DnDTableProps<T>,
    'canDropFiles' | 'onFilesDrop' | 'onDrop' | 'canDropNode'
  > {
  selectedPaths?: string[]
  additionalColumns?: ColumnsType<T>
  onRenameStart?: (node: T) => void
  onDrop?: (sources: T[], target: T) => void
  onDropFiles?: (
    files: File[],
    dataTransfer: DataTransferItemList,
    target?: T
  ) => void
  onDelete?: (nodes: T[]) => void
  onClickRow?: (node: T) => void
  onDoubleClickRow?: (node: T) => void
  renderIcon?: (node: T) => React.ReactNode | undefined
  renderNodeTitle?: (props: { node: T }) => React.ReactElement
  dragLayer?: React.FC<FileManagerDragLayerProps<T>>
}

export interface FileDropItem {
  type: '__NATIVE_FILE__'
  items: DataTransferItemList
  files: File[]
}

export interface DnDTableProps<T = unknown> extends TableProps<T> {
  canDropNode: (source: T, target: T) => boolean
  onDrop: (source: T, target: T) => void
  canDropFiles?: (dataTransfer: DataTransferItemList, target: T) => boolean
  onFilesDrop?: (
    files: File[],
    dataTransfer: DataTransferItemList,
    target: T
  ) => void
  renderTable?: (props: TableProps<T>) => React.ReactElement
}

export const DnDTableRowType = '__DND_TABLE_ROW__'
export interface DnDTableRowItem<T> {
  node: T
  type: typeof DnDTableRowType
}
export type DropItemOrFile<T> = DnDTableRowItem<T> | FileDropItem

export interface DnDRowRenderProps<T extends DefaultRecordType>
  extends HTMLProps<HTMLTableRowElement> {
  node: T
  canDropNode: (source: T) => boolean
  onNodeDrop: (source: T) => void
  canDropFiles: (dataTransfer: DataTransferItemList) => boolean
  onFilesDrop: (files: File[], dataTransfer: DataTransferItemList) => void
}
