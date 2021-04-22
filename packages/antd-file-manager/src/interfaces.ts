import { ColumnsType, TableProps as AntdTableProps } from 'antd/es/table'
import {
  FileManagerNode,
  FileManagerProps,
  FileManagerRendererProps
} from '@codefreak/react-file-manager'
import React from 'react'

export interface AntdDragLayerProps {
  relativeToElement?: React.RefObject<Element>
  additionalStyle?: React.HTMLProps<HTMLDivElement>['style']
}

export interface AntdTableRendererProps<T extends FileManagerNode>
  extends FileManagerRendererProps<T> {
  antdTableProps?: Partial<AntdTableProps<T>>
  additionalColumns?: ColumnsType<T>
  onRenameItem?: (node: T, newName: string) => void
  onDeleteItems?: (items: T[]) => void
  renderActions?: (
    node: T,
    defaultActions: React.ReactNode[]
  ) => React.ReactNode
}

export type AntdFileManagerProps<T extends FileManagerNode> = Omit<
  FileManagerProps<T>,
  'renderer'
> &
  Pick<
    AntdTableRendererProps<T>,
    'onDeleteItems' | 'additionalColumns' | 'antdTableProps' | 'onRenameItem'
  > & {
    renderType?: 'table'
    antdTableProps?: Partial<AntdTableProps<T>>
  }
