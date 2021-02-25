import { CustomDragLayerProps, TableProps } from './interfaces'
import Table from 'rc-table'
import React from 'react'

export const defaultTableRenderer = <T,>(
  tableProps: TableProps<T>
): React.ReactNode => {
  return <Table {...tableProps} />
}
export const defaultIconRenderer = (): React.ReactNode => '📄'

export const defaultActionRenderer = (): React.ReactNode => {
  return 'ACTIONS'
}

export const defaultCustomDragLayerRenderer: CustomDragLayerProps['renderer'] = (
  x,
  y,
  items
) => {
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
      {items.join(', ')}
    </div>
  )
}
