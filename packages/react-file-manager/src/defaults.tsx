import {
  FileManagerDragLayerProps,
  FileManagerNode,
  FileManagerProps,
  TableProps
} from './interfaces'
import Table from 'rc-table'
import React from 'react'
import { ColumnsType } from 'rc-table/es/interface'

export const defaultTableRenderer = <T,>(
  tableProps: TableProps<T>
): React.ReactNode => {
  return <Table {...tableProps} />
}
export const defaultIconRenderer = (): React.ReactNode => '📄'

export const defaultActionRenderer = (): React.ReactNode => {
  return 'ACTIONS'
}

export const DefaultCustomDragLayer: React.FC<
  FileManagerDragLayerProps<any>
> = props => {
  const { x, y, draggedItems } = props
  return (
    <div
      style={{
        display: 'inline-block',
        position: 'absolute',
        left: 0,
        top: 0,
        transform: `translate(${x}px, ${y}px)`,
        zIndex: 999,
        padding: '10px',
        border: '1px solid grey',
        backgroundColor: '#fdfdfd',
        lineHeight: 1,
        pointerEvents: 'none' // prevent drop event on overlay
      }}
    >
      {draggedItems.length}
    </div>
  )
}

export const generateDefaultColumns = <T extends FileManagerNode>(
  renderNodeTitle?: FileManagerProps<T>['renderNodeTitle']
): ColumnsType<T> => [
  {
    key: 'icon',
    title: '',
    width: 1
  },
  {
    key: 'name',
    title: 'Name',
    render: (_, node) =>
      renderNodeTitle ? renderNodeTitle({ node }) : node.path
  }
]
