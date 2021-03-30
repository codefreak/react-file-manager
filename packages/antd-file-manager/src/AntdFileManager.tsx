import {
  DeleteOutlined,
  EditOutlined,
  FileTextFilled,
  FolderFilled
} from '@ant-design/icons'
import React, { useEffect, useMemo, useState } from 'react'
import { Button, Modal, Table as AntdTableComp } from 'antd'
import { ColumnsType } from 'antd/es/table'
import FileManager, {
  basename,
  FileManagerNode,
  MultiSelectionProvider,
  TableProps
} from '@codefreak/react-file-manager'
import AntdDragLayer from './AntdDragLayer'
import EditableValue from './EditableValue'
import { AntdFileManagerProps } from './interfaces'

const antdIconRenderer = <T extends FileManagerNode>(_: unknown, node: T) => {
  if (node.type === 'directory') {
    return <FolderFilled style={{ fontSize: '1.5em' }} />
  }
  return <FileTextFilled style={{ fontSize: '1.5em' }} />
}

interface AntdFileManagerTableProps<T extends FileManagerNode>
  extends TableProps<T> {
  onRename?: (node: T, newName: string) => void
  onDelete?: (nodes: T[]) => void
  onRowSelectionChange?: (selectedKeys: string[]) => void
  selectedRows?: string[]
  additionalColumns?: ColumnsType<T>
}

/**
 * Wrapper that bridges rc-table to antd's Table
 * AntD's table brings some additional functionality like sorting columns
 *
 * @param props
 * @constructor
 */
const AntdTable = <T extends FileManagerNode>(
  props: AntdFileManagerTableProps<T>
) => {
  const { data, onRename, onRowSelectionChange, ...restProps } = props
  const [renamingNode, setRenamingNode] = useState<T | undefined>()
  const [deletingNode, setDeletingNode] = useState<T | undefined>()

  const renderActions = (_: unknown, node: T) => {
    const onRename = (): void => setRenamingNode(node)
    const onDelete = (): void => setDeletingNode(node)
    return (
      <Button.Group>
        <Button
          onClick={onDelete}
          icon={<DeleteOutlined style={{ color: 'red' }} />}
        />
        <Button onClick={onRename} icon={<EditOutlined />} />
      </Button.Group>
    )
  }

  const renderNameColumn = (_: unknown, node: T) => (
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

  const onDelete = () => {
    if (deletingNode !== undefined) {
      props.onDelete?.([deletingNode])
      setDeletingNode(undefined)
    }
  }

  return (
    <>
      <AntdTableComp
        rowSelection={{
          type: 'checkbox',
          selectedRowKeys: props.selectedRows,
          onChange: (_, items) => {
            onRowSelectionChange?.(items.map(item => item.path))
          }
        }}
        dataSource={data}
        {...restProps}
        columns={columns}
        pagination={false}
      />
      <Modal
        visible={deletingNode !== undefined}
        onOk={onDelete}
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

const AntdFileManager = <T extends FileManagerNode>(
  props: AntdFileManagerProps<T>
): React.ReactElement => {
  const { data } = props
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
        dragLayer={AntdDragLayer}
        renderTable={tableProps => (
          <AntdTable
            {...tableProps}
            selectedRows={selectedRows}
            onRowSelectionChange={onRowSelectionChange}
            onRename={props.onRename}
            onDelete={props.onDelete}
            additionalColumns={props.additionalColumns}
          />
        )}
      />
    </MultiSelectionProvider>
  )
}

export default AntdFileManager
