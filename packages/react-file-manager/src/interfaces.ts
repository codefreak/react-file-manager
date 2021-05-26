import React, { HTMLProps } from 'react'
import {
  DragSourceHookSpec,
  DropTargetHookSpec,
  DropTargetMonitor
} from 'react-dnd'

export interface FileManagerNode {
  type: 'file' | 'directory'
  path: string
}
export interface FileDropItem {
  type: '__NATIVE_FILE__'
  items: DataTransferItemList
  files: File[]
}

export interface DnDStatus {
  /**
   * In contrast to the react-dnd monitor method this indicates if we are
   * globally in a DnD state
   */
  isDragging: boolean
  /**
   * Indicates if this row is currently being dragged
   */
  isCurrentDragSource: boolean
  /**
   * Are we currently dragging over this element?
   */
  isOver: boolean
  canDrop: boolean
}

export const FileManagerItemDragType = 'REACT_FILE_MANAGER_ITEM'
export interface FileManagerItemDrag<T> {
  items: T[]
  type: typeof FileManagerItemDragType
}
export type FileManagerDragSource<T> = FileManagerItemDrag<T> | FileDropItem

export interface DnDStatusProps<ElementType extends HTMLElement = HTMLElement> {
  activeDragSourceProps?: HTMLProps<ElementType>
  validDropTargetProps?: HTMLProps<ElementType>
  validDropTargetOverProps?: HTMLProps<ElementType>
  invalidDropTargetProps?: HTMLProps<ElementType>
  invalidDropTargetOverProps?: HTMLProps<ElementType>
}

export interface DnDTableProps extends HTMLProps<HTMLTableElement> {
  canDropItem: DropTargetHookSpec<FileDropItem, unknown, unknown>['canDrop']
  onDropItem: DropTargetHookSpec<FileDropItem, unknown, unknown>['drop']
  dndStatusProps?: DnDStatusProps<HTMLTableElement>
}

export interface DnDTableRowProps<T> extends HTMLProps<HTMLTableRowElement> {
  acceptFiles: boolean
  canDropItem: DropTargetHookSpec<T, unknown, unknown>['canDrop']
  onDropItem: DropTargetHookSpec<T, unknown, unknown>['drop']
  onDragOverItem: DropTargetHookSpec<T, unknown, unknown>['hover']
  onDragStartItem: DragSourceHookSpec<T, unknown, unknown>['item']
  onDragEndItem: DragSourceHookSpec<T, unknown, unknown>['end']
  hideNativeDragPreview: boolean
  dndStatusProps?: DnDStatusProps<HTMLTableRowElement>
  enableDrop: boolean
  disableDrag?: boolean
}

export interface FileManagerRendererProps<RecordType extends FileManagerNode> {
  dataSource: RecordType[]
  dataKey: string
  acceptFiles: boolean
  selectedItemKeys: React.Key[]
  onSelectionChange: (selectedItems: RecordType[]) => void
  onDragStartItem?: (
    source: RecordType
  ) => FileManagerDragSource<RecordType> | null
  onDragEndItem?: (source: FileManagerDragSource<RecordType>) => void
  onDragOverItem?: (
    source: FileManagerDragSource<RecordType>,
    target: RecordType,
    dragSourceMonitor: DropTargetMonitor<RecordType>
  ) => void
  canDropItem: (
    source: FileManagerDragSource<RecordType>,
    target?: RecordType
  ) => boolean
  onDropItem: (
    source: FileManagerDragSource<RecordType>,
    target?: RecordType
  ) => void
  onDeleteItems?: (item: RecordType[]) => void
  onRenameItem?: (item: RecordType, newName: string) => void
  // TODO: valid prop types instead of unknown
  onClickItem?: (node: RecordType, e: React.MouseEvent<unknown>) => void
  onDoubleClickItem?: (node: RecordType, e: React.MouseEvent<unknown>) => void
  itemDndStatusProps?: DnDStatusProps<HTMLTableRowElement>
  rootDndStatusProps?: DnDStatusProps<HTMLTableElement>
  hideNativeDragPreview: boolean
}

export type FileManagerRenderComponent<RecordType extends FileManagerNode> =
  React.ComponentType<FileManagerRendererProps<RecordType>>

/**
 * High-Level props for all kind of file managers.
 */
export type FileManagerProps<RecordType extends FileManagerNode> = Pick<
  FileManagerRendererProps<RecordType>,
  | 'dataSource'
  | 'dataKey'
  | 'onClickItem'
  | 'onDoubleClickItem'
  | 'itemDndStatusProps'
  | 'rootDndStatusProps'
> & {
  selectedItemKeys?: React.Key[]
  onSelectionChange?: (selectedItems: RecordType[]) => void
  renderer: FileManagerRenderComponent<RecordType>
  canDropItems?:
    | boolean
    | ((sources: RecordType[], target: RecordType) => boolean)
  onDropItems?: (source: RecordType[], target: RecordType) => void
  canDropFiles?:
    | boolean
    | ((
        dataTransferItems: DataTransferItemList,
        target?: RecordType
      ) => boolean)
  onDropFiles?: (
    dataTransferItems: DataTransferItemList,
    target?: RecordType
  ) => void
  hideNativeDragPreview?: boolean
}
