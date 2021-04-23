import { ColumnsType, TableProps as AntdTableProps } from 'antd/es/table'
import {
  DnDTableRowProps,
  FileManagerDragSource,
  FileManagerNode,
  FileManagerProps,
  FileManagerRendererProps
} from '@codefreak/react-file-manager'
import React from 'react'

export interface AntdFileManagerNode extends FileManagerNode {
  /**
   * Required to make renaming work
   */
  basename: string
}

export interface AntdDragLayerProps {
  relativeToElement?: React.RefObject<Element>
  additionalStyle?: React.HTMLProps<HTMLDivElement>['style']
}

export interface AntdTableRendererProps<T extends AntdFileManagerNode>
  extends FileManagerRendererProps<T> {
  antdTableProps?: Partial<AntdTableProps<T>>
  additionalColumns?: ColumnsType<T>
  onRenameItem?: (node: T, newBasename: string) => void
  onDeleteItems?: (items: T[]) => void
  renderActions?: (
    node: T,
    defaultActions: React.ReactNode[]
  ) => React.ReactNode
  additionalRowProperties?: (
    item: T,
    currentProps: DnDTableRowProps<FileManagerDragSource<T>>
  ) => DnDTableRowProps<FileManagerDragSource<T>>
}

export type AntdFileManagerProps<T extends AntdFileManagerNode> = Omit<
  FileManagerProps<T>,
  'renderer'
> &
  Pick<
    AntdTableRendererProps<T>,
    | 'renderActions'
    | 'onDeleteItems'
    | 'additionalColumns'
    | 'antdTableProps'
    | 'onRenameItem'
    | 'additionalRowProperties'
  > & {
    renderType?: 'table'
    antdTableProps?: Partial<AntdTableProps<T>>
  }
