import {
  DeleteOutlined,
  EditOutlined,
  FileTextFilled,
  FolderFilled
} from '@ant-design/icons'
import React, { HTMLProps, useState } from 'react'
import { Button, Table as AntdTable } from 'antd'
import { ColumnsType, TableProps as AntdTableProps } from 'antd/es/table'
import {
  DnDTable,
  DnDTableRow,
  DnDTableRowProps,
  FileManagerDragSource,
  FileManagerItemDragType
} from '@codefreak/react-file-manager'
import EditableValue from './EditableValue'
import { AntdFileManagerNode, AntdTableRendererProps } from './interfaces'

const antdIconRenderer = <T extends AntdFileManagerNode>(
  _: unknown,
  node: T
) => {
  if (node.type === 'directory') {
    return <FolderFilled style={{ fontSize: '1.5em' }} />
  }
  return <FileTextFilled style={{ fontSize: '1.5em' }} />
}

const AntdTableRenderer = <T extends AntdFileManagerNode>(
  props: AntdTableRendererProps<T>
) => {
  const {
    dataSource,
    dataKey,
    onRenameItem,
    onDeleteItems,
    onSelectionChange,
    antdTableProps = {},
    itemDndStatusProps = {},
    additionalColumns,
    canDropItem,
    onDropItem,
    acceptFiles,
    hideNativeDragPreview,
    additionalRowProperties,
    ...restProps
  } = props
  const [renamingNode, setRenamingNode] = useState<T | undefined>()
  const endDrag = (source: FileManagerDragSource<T>) => {
    props.onDragEndItem?.(source)
  }

  const getAdditionalRowProps = (
    item: T
  ): DnDTableRowProps<FileManagerDragSource<T>> => {
    const rowProps: DnDTableRowProps<FileManagerDragSource<T>> = {
      enableDrop: item.type === 'directory',
      acceptFiles,
      dndStatusProps: itemDndStatusProps,
      hideNativeDragPreview, // we render a custom drag layer in this component
      canDropItem: (source) => canDropItem(source, item),
      onDropItem: (source) => {
        onDropItem(source, item)
        endDrag(source)
      },
      onDragStartItem: () => {
        // either let callback define a drag source or create
        // a default one based on the current item
        return (
          props.onDragStartItem?.(item) || {
            items: [item],
            type: FileManagerItemDragType
          }
        )
      },
      onDragOverItem: (source, dropTargetMonitor) => {
        props.onDragOverItem?.(source, item, dropTargetMonitor)
      },
      onDragEndItem: (source) => endDrag(source),
      onClick: (e) => props.onClickItem?.(item, e),
      onDoubleClick: (e) => props.onDoubleClickItem?.(item, e)
    }

    if (additionalRowProperties) {
      return additionalRowProperties(item, rowProps)
    }
    return rowProps
  }

  const renderActions = (_: unknown, node: T) => {
    const buttons = []
    if (onDeleteItems) {
      const onDeleteClick = () => onDeleteItems([node])
      buttons.push(
        <Button
          key="delete"
          onClick={onDeleteClick}
          icon={<DeleteOutlined style={{ color: 'red' }} />}
        />
      )
    }
    if (onRenameItem) {
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
    if (!onRenameItem) {
      return node.basename
    }
    return (
      <EditableValue
        defaultValue={node.basename}
        onEditCancel={() => setRenamingNode(undefined)}
        onEditStart={() => setRenamingNode(node)}
        editing={renamingNode === node}
        onChange={(newName) => {
          onRenameItem?.(node, newName)
        }}
      />
    )
  }
  // shouldCellUpdate: () => false will improve rendering performance
  // see https://github.com/ant-design/ant-design/issues/23763#issuecomment-671096972
  const columns: ColumnsType<T> = [
    {
      key: 'icon',
      render: antdIconRenderer,
      width: 1,
      shouldCellUpdate: () => false
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
      render: renderNameColumn,
      shouldCellUpdate: () => false
    },
    ...(additionalColumns || []),
    {
      key: 'actions',
      render: renderActions,
      width: 1,
      shouldCellUpdate: () => false
    }
  ]

  const rowSelection: AntdTableProps<T>['rowSelection'] = {
    type: 'checkbox',
    onChange: (_, items) => {
      onSelectionChange(items)
    }
  }

  const ConnectedDnDTable = (tableProps: HTMLProps<HTMLTableElement>) => {
    if (!acceptFiles) return <table {...tableProps} />
    return (
      <DnDTable
        {...tableProps}
        onDropItem={(source) => onDropItem(source)}
        canDropItem={(source) => canDropItem(source)}
        dndStatusProps={props.rootDndStatusProps}
      />
    )
  }

  return (
    <AntdTable
      {...restProps}
      size="middle"
      columns={columns}
      pagination={false}
      rowSelection={rowSelection}
      {...antdTableProps}
      components={{
        table: ConnectedDnDTable,
        body: {
          // disable our custom drag&drop table row when there is no data
          // otherwise antd will render the "no data" table row with d&d capabilities
          row: dataSource.length > 0 ? DnDTableRow : undefined
        }
      }}
      onRow={getAdditionalRowProps}
      dataSource={dataSource}
      rowKey={dataKey}
    />
  )
}

export default AntdTableRenderer
