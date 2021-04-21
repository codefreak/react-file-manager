import {
  DeleteOutlined,
  EditOutlined,
  FileTextFilled,
  FolderFilled
} from '@ant-design/icons'
import React, { HTMLProps, useState } from 'react'
import { Button, Modal, Table as AntdTable } from 'antd'
import { ColumnsType, TableProps as AntdTableProps } from 'antd/es/table'
import {
  basename,
  DnDTable,
  DnDTableRow,
  DnDTableRowProps,
  FileManagerDragSource,
  FileManagerItemDragType,
  FileManagerNode,
  isFileDrag
} from '@codefreak/react-file-manager'
import EditableValue from './EditableValue'
import { AntdTableRendererProps } from './interfaces'

const antdIconRenderer = <T extends FileManagerNode>(_: unknown, node: T) => {
  if (node.type === 'directory') {
    return <FolderFilled style={{ fontSize: '1.5em' }} />
  }
  return <FileTextFilled style={{ fontSize: '1.5em' }} />
}

const AntdTableRenderer = <T extends FileManagerNode>(
  props: AntdTableRendererProps<T>
) => {
  const {
    dataSource,
    dataKey,
    onRenameItem,
    onDeleteItems,
    onSelectionChange,
    antdTableProps = {},
    dragStatus = {},
    hideNativeDragPreview,
    ...restProps
  } = props
  const [renamingNode, setRenamingNode] = useState<T | undefined>()
  const [deletingNodes, setDeletingNodes] = useState<T[] | undefined>()
  const endDrag = (node: T) => {
    props.onDragEndItem?.(node)
  }

  const canDropOnItem = (source: FileManagerDragSource<T>, target: T) => {
    if (isFileDrag(source)) {
      if (typeof props.canDropFiles !== 'function') return !!props.canDropFiles
      return props.canDropFiles(source.items, target)
    } else {
      if (typeof props.canDropItem !== 'function') return !!props.canDropItem
      return props.canDropItem?.(source.item, target)
    }
  }

  const getAdditionalRowProps = (
    item: T
  ): DnDTableRowProps<FileManagerDragSource<T>> => {
    return {
      enableDrop: item.type === 'directory',
      dragStatus: props.dragStatus,
      hideNativeDragPreview,
      canDropItem: source => canDropOnItem(source, item),
      onDropItem: source => {
        if (isFileDrag(source)) {
          props.onDropFiles(source.items, item)
        } else {
          props.onDropItem(source.item, item)
        }
      },
      onDragStartItem: source => {
        props.onDragStartItem?.(item)
        return {
          item,
          type: FileManagerItemDragType
        }
      },
      onDragOverItem: (source, dropTargetMonitor) => {
        props.onDragOverItem?.(source, item, dropTargetMonitor)
      },
      onDragEndItem: () => endDrag(item)
    }
  }

  const renderActions = (_: unknown, node: T) => {
    const buttons = []
    if (onDeleteItems) {
      const onDeleteClick = (): void => setDeletingNodes([node])
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
      return basename(node.path)
    }
    return (
      <EditableValue
        defaultValue={basename(node.path)}
        onEditCancel={() => setRenamingNode(undefined)}
        onEditStart={() => setRenamingNode(node)}
        editing={renamingNode === node}
        onChange={newName => {
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
    ...(props.additionalColumns || []),
    {
      key: 'actions',
      render: renderActions,
      width: 1,
      shouldCellUpdate: () => false
    }
  ]

  const onDeleteModalOkay = () => {
    if (deletingNodes !== undefined) {
      onDeleteItems?.(deletingNodes)
      setDeletingNodes(undefined)
    }
  }

  const rowSelection: AntdTableProps<T>['rowSelection'] = {
    type: 'checkbox',
    onChange: (_, items) => {
      onSelectionChange(items)
    }
  }

  const ConnectedDnDTable = (tableProps: HTMLProps<HTMLTableElement>) => {
    return (
      <DnDTable
        {...tableProps}
        onDropItem={source => {
          props.onDropFiles(source.items)
        }}
        hideNativeDragPreview={hideNativeDragPreview}
        dragStatus={props.rootDragStatusProps}
      />
    )
  }

  return (
    <>
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
            row: DnDTableRow
          }
        }}
        onRow={getAdditionalRowProps}
        dataSource={dataSource}
        rowKey={dataKey}
      />
      <Modal
        visible={deletingNodes !== undefined}
        onOk={onDeleteModalOkay}
        onCancel={() => setDeletingNodes(undefined)}
        title={`Really delete ${deletingNodes?.length} file(s)?`}
        okButtonProps={{ danger: true }}
      />
    </>
  )
}

export default AntdTableRenderer
