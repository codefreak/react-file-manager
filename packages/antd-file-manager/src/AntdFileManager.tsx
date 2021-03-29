import {
  DeleteOutlined,
  EditOutlined,
  FileTextFilled,
  FolderFilled
} from '@ant-design/icons'
import React, { useMemo, useState } from 'react'
import { Button, Modal, Table as AntdTableComp } from 'antd'
import { ColumnsType } from 'antd/es/table'
import FileManager, {
  MultiSelectionProvider,
  FileManagerNode,
  FileManagerProps,
  TableProps
} from '@codefreak/react-file-manager'
import AntdDragLayer from './AntdDragLayer'
import EditableValue from './EditableValue'

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
      defaultValue={node.path}
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

export interface AntdFileManagerProps<T extends FileManagerNode>
  extends FileManagerProps<T> {
  onRename?: (node: T, newName: string) => void
}

const AntdFileManager = <T extends FileManagerNode>(
  props: AntdFileManagerProps<T>
): React.ReactElement => {
  const { data } = props
  const [selectedRows, setSelectedRows] = useState<string[]>([])
  const selectedItems = useMemo(() => {
    return data?.filter(node => selectedRows.indexOf(node.path) !== -1) || []
  }, [data, selectedRows])

  const onClick = (node: T) => {
    const index = selectedRows.indexOf(node.path)
    if (index === -1) {
      setSelectedRows([...selectedRows, node.path])
    } else {
      const newSelectedRows = selectedRows.filter(p => p !== node.path)
      setSelectedRows(newSelectedRows)
    }
    if (props.onClick) {
      props.onClick(node)
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
            onRowSelectionChange={setSelectedRows}
            onRename={props.onRename}
          />
        )}
        onClick={onClick}
      />
    </MultiSelectionProvider>
  )
}

export default AntdFileManager
