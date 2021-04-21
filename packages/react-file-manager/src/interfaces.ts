import React, { HTMLProps } from 'react'

export interface FileManagerNode {
  type: 'file' | 'directory'
  path: string
}
export interface FileDropItem {
  type: '__NATIVE_FILE__'
  items: DataTransferItemList
}

export const DnDTableRowType = '__DND_TABLE_ROW__'
export interface DnDTableRowItem<T> {
  item: T
  type: typeof DnDTableRowType
}
export type DragSource<T> = DnDTableRowItem<T> | FileDropItem

export interface DnDRowRenderProps<T extends FileManagerNode>
  extends HTMLProps<HTMLTableRowElement> {
  item: T
  canDropItem: (source: T) => boolean
  onDropItem: (source: T) => void
  canDropFiles: (dataTransferItems: DataTransferItemList) => boolean
  onDropFiles: (dataTransferItems: DataTransferItemList) => void
  onRowDragStart: () => void
  onRowDragOver: (draggedItem: DragSource<T>, canDrop: boolean) => void
  onRowDragEnd: () => void
  hideNativeDragPreview: boolean
}

export interface FileManagerRendererProps<RecordType extends FileManagerNode> {
  dataSource: RecordType[]
  dataKey: string
  onSelectionChange: (selectedItems: RecordType[]) => void
  onDragStartItem?: (item: RecordType) => void
  onDragEndItem?: (item: RecordType) => void
  onDragOverItem?: (
    source: DragSource<RecordType>,
    target: RecordType,
    canDrop: boolean
  ) => void
  canDropItem: boolean | ((source: RecordType, target: RecordType) => boolean)
  onDropItem: (source: RecordType, target: RecordType) => void
  canDropFiles:
    | boolean
    | ((dataTransferItems: DataTransferItemList, target: RecordType) => boolean)
  onDropFiles: (
    dataTransferItems: DataTransferItemList,
    target: RecordType
  ) => void
  onDeleteItems?: (item: RecordType[]) => void
  onRenameItem?: (item: RecordType, newName: string) => void
  // TODO: valid prop types instead of unknown
  onClickItem?: (node: RecordType, e: React.MouseEvent<unknown>) => void
  onDoubleClickItem?: (node: RecordType, e: React.MouseEvent<unknown>) => void
  dragStatus?: {
    activeDragSourceProps?: HTMLProps<any>
    validDropTargetProps?: HTMLProps<any>
    validDropTargetOverProps?: HTMLProps<any>
    invalidDropTargetProps?: HTMLProps<any>
    invalidDropTargetOverProps?: HTMLProps<any>
  }
  hideNativeDragPreview: boolean
}

export type FileManagerRenderComponent<
  RecordType extends FileManagerNode
> = React.ComponentType<FileManagerRendererProps<RecordType>>

export interface FileManagerCustomDragLayerProps<
  RecordType extends FileManagerNode
> {
  draggedItems?: RecordType[]
  draggedFiles?: DataTransferItemList
  scrollingElement: React.RefObject<{
    scrollLeft: number
    scrollTop: number
  }>
}

export type FileManagerCustomDragLayerRenderer<
  RecordType extends FileManagerNode
> = React.ComponentType<FileManagerCustomDragLayerProps<RecordType>>

/**
 * High-Level props for all kind of file managers.
 */
export type FileManagerProps<RecordType extends FileManagerNode> = Pick<
  FileManagerRendererProps<RecordType>,
  | 'dataSource'
  | 'dataKey'
  | 'onClickItem'
  | 'onDoubleClickItem'
  | 'dragStatus'
  | 'onSelectionChange'
> & {
  renderer: FileManagerRenderComponent<RecordType>
  customDragLayer?: {
    component: FileManagerCustomDragLayerRenderer<RecordType>
    scrollingElement?: FileManagerCustomDragLayerProps<RecordType>['scrollingElement']
  }
  canDropItems?:
    | boolean
    | ((sources: RecordType[], target: RecordType) => boolean)
  onDropItems?: (source: RecordType[], target: RecordType) => void
  canDropFiles?:
    | boolean
    | ((dataTransferItems: DataTransferItemList, target: RecordType) => boolean)
  onDropFiles?: (
    dataTransferItems: DataTransferItemList,
    target: RecordType
  ) => void
}
