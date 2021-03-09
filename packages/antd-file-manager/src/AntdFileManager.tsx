import { FileTextFilled, FolderFilled, MoreOutlined } from '@ant-design/icons'
import React, { useState } from 'react'
import { Button, Dropdown, Input, Menu, Table } from 'antd'
import { ColumnsType } from 'antd/es/table'
import FileManager, {
  FileManagerNode,
  FileManagerProps,
  TableProps
} from '@codefreak/react-file-manager'
import AntdDragLayer from './AntdDragLayer'

const antdIconRenderer = <T extends FileManagerNode>(_: any, node: T) => {
  if (node.type === 'directory') {
    return <FolderFilled style={{ fontSize: '1.5em' }} />
  }
  return <FileTextFilled style={{ fontSize: '1.5em' }} />
}

const AntdFileManager = <T extends FileManagerNode>(
  props: FileManagerProps<T>
): React.ReactElement => {
  const [selectedRows, setSelectedRows] = useState<string[]>([])
  const [renaming, setRenaming] = useState<string | undefined>(undefined)

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

  const AntdTable = (props: TableProps<T>) => {
    const { data, ...restProps } = props

    const renderActions = (_: any, node: T) => {
      const onClickRename = () => setRenaming(node.path)
      const menu = (
        <Menu>
          <Menu.Item>Delete</Menu.Item>
          <Menu.Item onClick={onClickRename}>Rename</Menu.Item>
        </Menu>
      )
      return (
        <Dropdown overlay={menu} trigger={['click']}>
          <Button size="small" icon={<MoreOutlined />} />
        </Dropdown>
      )
    }

    const renderTitle = (_: any, node: T) => {
      if (node.path === renaming) {
        return (
          <Input
            size="small"
            defaultValue={node.path}
            autoFocus
            onFocus={e => {
              e.target.select()
            }}
          />
        )
      }
      return <span>{node.path}</span>
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
        render: renderTitle
      },
      {
        key: 'actions',
        render: renderActions,
        width: 1
      }
    ]

    return (
      <Table
        rowSelection={{
          type: 'checkbox',
          selectedRowKeys: selectedRows,
          onChange: selectedRowKeys => {
            setSelectedRows(selectedRowKeys.map(t => t.toString()))
          }
        }}
        dataSource={data}
        {...restProps}
        columns={columns}
        pagination={false}
      />
    )
  }

  return (
    <FileManager
      {...props}
      dragLayer={AntdDragLayer}
      selectedPaths={selectedRows}
      tableElement={AntdTable}
      onClick={onClick}
    />
  )
}

export default AntdFileManager
