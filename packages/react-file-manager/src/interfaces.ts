import React, { HTMLProps, MouseEvent } from 'react'
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
  onClickRow?: (node: T, e: MouseEvent<HTMLTableRowElement>) => void
  onDoubleClickRow?: (node: T, e: MouseEvent<HTMLTableRowElement>) => void
  renderIcon?: (node: T) => React.ReactNode | undefined
  renderNodeTitle?: (
    props: { node: T },
    defaultTitle: string
  ) => React.ReactElement
  onRowDragStart?: DnDTableProps<T>['onRowDragStart']
  onRowDragOver?: DnDTableProps<T>['onRowDragOver']
  onRowDragEnd?: DnDTableProps<T>['onRowDragEnd']
  validDropTargetProps?: HTMLProps<HTMLTableRowElement>
  validDropTargetOverProps?: HTMLProps<HTMLTableRowElement>
  invalidDropTargetProps?: HTMLProps<HTMLTableRowElement>
  invalidDropTargetOverProps?: HTMLProps<HTMLTableRowElement>
  dragSourceProps?: HTMLProps<HTMLTableRowElement>
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
  onRowDragStart?: (node: T) => void
  onRowDragOver?: (source: DragSource<T>, target: T, canDrop: boolean) => void
  onRowDragEnd?: (node: T) => void
  validDropTargetProps?: HTMLProps<HTMLTableRowElement>
  validDropTargetOverProps?: HTMLProps<HTMLTableRowElement>
  invalidDropTargetProps?: HTMLProps<HTMLTableRowElement>
  invalidDropTargetOverProps?: HTMLProps<HTMLTableRowElement>
  dragSourceProps?: HTMLProps<HTMLTableRowElement>
  hideNativeDragPreview?: boolean
}

export const DnDTableRowType = '__DND_TABLE_ROW__'
export interface DnDTableRowItem<T> {
  node: T
  type: typeof DnDTableRowType
}
export type DragSource<T> = DnDTableRowItem<T> | FileDropItem

export interface DnDRowRenderProps<T extends DefaultRecordType>
  extends HTMLProps<HTMLTableRowElement> {
  node: T
  hideNativeDragPreview?: boolean
  canDropNode: (source: T) => boolean
  onNodeDrop: (source: T) => void
  canDropFiles: (dataTransfer: DataTransferItemList) => boolean
  onFilesDrop: (files: File[], dataTransfer: DataTransferItemList) => void
  // prevent name conflict with native HTML properties with "row"
  onRowDragStart: () => void
  onRowDragOver: (draggedItem: DragSource<T>, canDrop: boolean) => void
  onRowDragEnd: () => void
}
