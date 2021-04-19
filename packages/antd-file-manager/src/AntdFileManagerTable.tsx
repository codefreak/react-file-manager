import {
  DeleteOutlined,
  EditOutlined,
  FileTextFilled,
  FolderFilled
} from '@ant-design/icons'
import React, { useEffect, useMemo, useState } from 'react'
import { Button, Modal, Table as AntdTableComp } from 'antd'
import { ColumnsType, TableProps as AntdTableProps } from 'antd/es/table'
import FileManager, {
  basename,
  FileManagerNode,
  MultiSelectionProvider,
  TableProps
} from '@codefreak/react-file-manager'
import EditableValue from './EditableValue'
import { AntdFileManagerProps } from './interfaces'

const antdIconRenderer = <T extends FileManagerNode>(_: unknown, node: T) => {
  if (node.type === 'directory') {
    return <FolderFilled style={{ fontSize: '1.5em' }} />
  }
  return <FileTextFilled style={{ fontSize: '1.5em' }} />
}

interface AntdTableBridgeProps<T extends FileManagerNode>
  extends TableProps<T> {
  antdTableProps?: Partial<AntdTableProps<T>>
  onRename?: (node: T, newName: string) => void
  onDelete?: (nodes: T[]) => void
  onRowSelectionChange?: (selectedKeys: string[]) => void
  selectedRows?: string[]
  additionalColumns?: ColumnsType<T>
  renderActions?: (
    node: T,
    defaultActions: React.ReactNode[]
  ) => React.ReactNode
}

/**
 * Wrapper that bridges rc-table to antd's Table
 * AntD's table brings some additional functionality like sorting columns
 *
 * @internal
 */
const AntdTableBridge = <T extends FileManagerNode>(
  props: AntdTableBridgeProps<T>
) => {
  const {
    data,
    onRename,
    onDelete,
    onRowSelectionChange,
    antdTableProps = {},
    ...restProps
  } = props
  const [renamingNode, setRenamingNode] = useState<T | undefined>()
  const [deletingNode, setDeletingNode] = useState<T | undefined>()

  const renderActions = (_: unknown, node: T) => {
    const buttons = []
    if (onDelete) {
      const onDeleteClick = (): void => setDeletingNode(node)
      buttons.push(
        <Button
          key="delete"
          onClick={onDeleteClick}
          icon={<DeleteOutlined style={{ color: 'red' }} />}
        />
      )
    }
    if (onRename) {
      const onRenameClick = (): void => setRenamingNode(node)
      buttons.push(
        <Button key="rename" onClick={onRenameClick} icon={<EditOutlined />} />
      )
    }
    if (props.renderActions) {
      return props.renderActions(node, buttons)
    }
    if (buttons.length === 0) {
      return null
    }
    return <Button.Group>{buttons}</Button.Group>
  }

  const renderNameColumn = (_: unknown, node: T) => {
    if (!onRename) {
      return basename(node.path)
    }
    return (
      <EditableValue
        defaultValue={basename(node.path)}
        onEditCancel={() => setRenamingNode(undefined)}
        onEditStart={() => setRenamingNode(node)}
        editing={renamingNode === node}
        onChange={newName => {
          onRename?.(node, newName)
        }}
      />
    )
  }

  const columns: ColumnsType<T> = [
    {
      key: 'icon',
      render: antdIconRenderer,
      width: 1
    },
    {
      key: 'name',
      title: 'Name',
      sorter: (a: T, b: T) =>
        a.path.localeCompare(b.path, undefined, {
          numeric: true,
          sensitivity: 'base'
        }),
      defaultSortOrder: 'ascend',
      render: renderNameColumn
    },
    ...(props.additionalColumns || []),
    {
      key: 'actions',
      render: renderActions,
      width: 1
    }
  ]

  const onDeleteModalOkay = () => {
    if (deletingNode !== undefined) {
      onDelete?.([deletingNode])
      setDeletingNode(undefined)
    }
  }

  const rowSelection: AntdTableProps<T>['rowSelection'] = {
    type: 'checkbox',
    selectedRowKeys: props.selectedRows,
    onChange: (_, items) => {
      onRowSelectionChange?.(items.map(item => item.path))
    }
  }

  return (
    <>
      <AntdTableComp
        {...restProps}
        size="middle"
        columns={columns}
        pagination={false}
        rowSelection={rowSelection}
        {...antdTableProps}
        dataSource={data}
      />
      <Modal
        visible={deletingNode !== undefined}
        onOk={onDeleteModalOkay}
        onCancel={() => setDeletingNode(undefined)}
        title={`Really delete ${deletingNode?.path}?`}
        okButtonProps={{ danger: true }}
      />
    </>
  )
}

const getItemsByPath = <T extends FileManagerNode>(
  items: readonly T[],
  paths: string[]
): T[] => {
  return items.filter(node => paths.indexOf(node.path) !== -1)
}

const AntdFileManagerTable = <T extends FileManagerNode>(
  props: AntdFileManagerProps<T>
): React.ReactElement => {
  const { data, antdTableProps } = props
  const [selectedRows, setSelectedRows] = useState<string[]>([])
  const selectedItems: T[] = useMemo(() => {
    return data ? getItemsByPath(data, selectedRows) : []
  }, [data, selectedRows])

  useEffect(() => {
    // intersection between "new" items and selected paths
    const stillAvailableItems = selectedRows.filter(path => {
      return data?.find(item => item.path === path)
    })
    setSelectedRows(stillAvailableItems)
  }, [data, setSelectedRows, setSelectedRows])

  const onRowSelectionChange = (keys: string[]) => {
    setSelectedRows(keys)
    if (data && props.onRowSelectionChange) {
      props.onRowSelectionChange(getItemsByPath(data, keys))
    }
  }

  return (
    <MultiSelectionProvider value={selectedItems}>
      <FileManager
        {...props}
        renderTable={tableProps => (
          <AntdTableBridge
            {...tableProps}
            antdTableProps={antdTableProps}
            selectedRows={selectedRows}
            onRowSelectionChange={onRowSelectionChange}
            onRename={props.onRename}
            onDelete={props.onDelete}
            additionalColumns={props.additionalColumns}
            renderActions={props.renderActions}
          />
        )}
      />
    </MultiSelectionProvider>
  )
}

export default AntdFileManagerTable
