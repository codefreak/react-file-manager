import { TableProps } from './interfaces'
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
