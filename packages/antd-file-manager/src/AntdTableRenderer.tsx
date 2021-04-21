import {
  DeleteOutlined,
  EditOutlined,
  FileTextFilled,
  FolderFilled
} from '@ant-design/icons'
import React, { useRef, useState } from 'react'
import { Button, Modal, Table as AntdTable } from 'antd'
import { ColumnsType, TableProps as AntdTableProps } from 'antd/es/table'
import {
  basename,
  DnDRowRenderProps,
  DnDTableRow,
  DnDTableRowType,
  DragSource,
  FileDropItem,
  FileManagerNode,
  isFileDrag
} from '@codefreak/react-file-manager'
import EditableValue from './EditableValue'
import { AntdTableRendererProps } from './interfaces'
import { useDrop } from 'react-dnd'
import { NativeTypes } from 'react-dnd-html5-backend'

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
  const [dragSource, setDragSource] = useState<DragSource<T> | undefined>(
    undefined
  )
  const [dropTarget, setDropTarget] = useState<T | undefined>(undefined)
  const endDrag = (node: T) => {
    setDragSource(undefined)
    setDropTarget(undefined)
    props.onDragEndItem?.(node)
  }

  const canDropFiles = (item: T, dataTransferItems: DataTransferItemList) => {
    if (typeof props.canDropFiles !== 'function') return !!props.canDropFiles
    return props.canDropFiles(dataTransferItems, item)
  }

  const canDropItem = (source: T, target: T) => {
    if (typeof props.canDropItem !== 'function') return !!props.canDropItem
    return props.canDropItem?.(source, target)
  }

  // TODO: memoization... this gets pretty slow for large tables
  const getAdditionalRowProps = (item: T): DnDRowRenderProps<T> => {
    let rowProps: DnDRowRenderProps<T> = {
      hideNativeDragPreview,
      item,
      canDropItem: source => canDropItem(source, item),
      onDropItem: source => {
        endDrag(item)
        props.onDropItem(source, item)
      },
      canDropFiles: files => canDropFiles(item, files),
      onDropFiles: dataTransfer => {
        endDrag(item)
        if (!props.onDropFiles) return
        props.onDropFiles(dataTransfer, item)
      },
      onRowDragStart: () => {
        props.onDragStartItem?.(item)
      },
      onRowDragOver: (draggedItem, canDrop) => {
        props.onDragOverItem?.(draggedItem, item, canDrop)
        setDragSource(draggedItem)
        setDropTarget(item)
      },
      onRowDragEnd: () => endDrag(item)
    }

    // add additional props depending on the current d&d status
    const {
      activeDragSourceProps,
      invalidDropTargetOverProps,
      invalidDropTargetProps,
      validDropTargetOverProps,
      validDropTargetProps
    } = dragStatus
    if (dragSource) {
      let canDrop: boolean
      if (isFileDrag(dragSource)) {
        canDrop = canDropFiles(item, dragSource.items)
      } else {
        canDrop = canDropItem(dragSource.item, item)
      }
      if (canDrop) {
        // valid drop target
        rowProps = {
          ...validDropTargetProps,
          ...rowProps
        }
      } else {
        // invalid drop target
        rowProps = {
          ...invalidDropTargetProps,
          ...rowProps
        }
      }
      if (dropTarget && dropTarget === item) {
        if (canDrop) {
          // valid drop target that is being dragged over
          rowProps = {
            ...validDropTargetOverProps,
            ...rowProps
          }
        } else {
          // invalid drop target that is being dragged over
          rowProps = {
            ...invalidDropTargetOverProps,
            ...rowProps
          }
        }
      }
      // currently dragged node
      if (!isFileDrag(dragSource) && dragSource.item === item) {
        rowProps = {
          ...activeDragSourceProps,
          ...rowProps
        }
      }
    }

    return rowProps
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
