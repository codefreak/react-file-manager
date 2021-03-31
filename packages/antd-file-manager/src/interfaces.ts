import { ColumnsType, TableProps as AntdTableProps } from 'antd/es/table'
import {
  FileManagerNode,
  FileManagerProps
} from '@codefreak/react-file-manager'
import React from 'react'

export interface AntdFileManagerProps<T extends FileManagerNode>
  extends FileManagerProps<T> {
  antdTableProps?: Partial<AntdTableProps<T>>
  onRename?: (node: T, newName: string) => void
  onDelete?: (nodes: T[]) => void
  additionalColumns?: ColumnsType<T>
  onRowSelectionChange?: (selectedNodes: T[]) => void
  renderActions?: (
    node: T,
    defaultActions: React.ReactNode[]
  ) => React.ReactNode
}
