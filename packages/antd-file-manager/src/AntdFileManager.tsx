import { FileTextFilled, FolderFilled, MoreOutlined } from '@ant-design/icons'
import React, { useState } from 'react'
import { Button, Dropdown, Menu, Table as AntdTableComp } from 'antd'
import { ColumnsType } from 'antd/es/table'
import FileManager, {
  FileManagerNode,
  FileManagerProps,
  TableProps
} from '@codefreak/react-file-manager'
import AntdDragLayer from './AntdDragLayer'
import EditableValue from './EditableValue'

const antdIconRenderer = <T extends FileManagerNode>(_: any, node: T) => {
  if (node.type === 'directory') {
    return <FolderFilled style={{ fontSize: '1.5em' }} />
  }
  return <FileTextFilled style={{ fontSize: '1.5em' }} />
}

interface AntdFileManagerTableProps<T extends FileManagerNode>
  extends TableProps<T> {
  onRename?: (node: T, newName: string) => void
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
  const [renamingKey, setRenamingKey] = useState<string | undefined>(undefined)

  const renderActions = (_: any, node: T) => {
    const onRename = (): void => setRenamingKey(node.path)
    const menu = (
      <Menu>
        <Menu.Item>Delete</Menu.Item>
        <Menu.Item onClick={onRename}>Rename</Menu.Item>
      </Menu>
    )
    return (
      <Dropdown overlay={menu} trigger={['click']}>
        <Button size="small" icon={<MoreOutlined />} />
      </Dropdown>
    )
  }

  const renderNameColumn = (_: any, node: T) => (
    <EditableValue
      defaultValue={node.path}
      onEditCancel={() => setRenamingKey(undefined)}
      onEditStart={() => setRenamingKey(node.path)}
      editing={renamingKey === node.path}
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

  return (
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
  )
}

export interface AntdFileManagerProps<T extends FileManagerNode>
  extends FileManagerProps<T> {
  onRename?: (node: T, newName: string) => void
}

const AntdFileManager = <T extends FileManagerNode>(
  props: AntdFileManagerProps<T>
): React.ReactElement => {
  const [selectedRows, setSelectedRows] = useState<string[]>([])

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
    <FileManager
      {...props}
      dragLayer={AntdDragLayer}
      selectedPaths={selectedRows}
      renderTable={tableProps => (
        <AntdTable
          {...tableProps}
          onRowSelectionChange={setSelectedRows}
          onRename={props.onRename}
        />
      )}
      onClick={onClick}
    />
  )
}

export default AntdFileManager
