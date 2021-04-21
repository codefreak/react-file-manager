import {
  DeleteOutlined,
  EditOutlined,
  FileTextFilled,
  FolderFilled
} from '@ant-design/icons'
import React, { useState } from 'react'
import { Button, Modal, Table as AntdTable } from 'antd'
import { ColumnsType, TableProps as AntdTableProps } from 'antd/es/table'
import {
  basename,
  DnDTableRow,
  DnDTableRowProps,
  DragSource,
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
  const [dragSource, setDragSource] = useState<DragSource<T> | undefined>(
    undefined
  )
  const [dropTarget, setDropTarget] = useState<T | undefined>(undefined)
  const endDrag = (node: T) => {
    setDragSource(undefined)
    setDropTarget(undefined)
    props.onDragEndItem?.(node)
  }

  const canDropOnItem = (source: DragSource<T>, target: T) => {
    if (isFileDrag(source)) {
      if (typeof props.canDropFiles !== 'function') return !!props.canDropFiles
      return props.canDropFiles(source.items, target)
    } else {
      if (typeof props.canDropItem !== 'function') return !!props.canDropItem
      return props.canDropItem?.(source.item, target)
    }
  }

  /**
   * Determine additional props depending on the current d&d status
   * @param item
   */
  const getRowHtmlStatusProps = (
    item: T
  ): React.HTMLProps<HTMLTableRowElement> => {
    const {
      activeDragSourceProps,
      invalidDropTargetOverProps,
      invalidDropTargetProps,
      validDropTargetOverProps,
      validDropTargetProps
    } = dragStatus
    let rowHtmlProps = {}
    if (dragSource) {
      const canDrop = canDropOnItem(dragSource, item)
      if (canDrop) {
        // valid drop target
        rowHtmlProps = {
          ...validDropTargetProps,
          ...rowHtmlProps
        }
      } else {
        // invalid drop target
        rowHtmlProps = {
          ...invalidDropTargetProps,
          ...rowHtmlProps
        }
      }
      if (dropTarget && dropTarget === item) {
        if (canDrop) {
          // valid drop target that is being dragged over
          rowHtmlProps = {
            ...validDropTargetOverProps,
            ...rowHtmlProps
          }
        } else {
          // invalid drop target that is being dragged over
          rowHtmlProps = {
            ...invalidDropTargetOverProps,
            ...rowHtmlProps
          }
        }
      }
      // currently dragged node
      if (!isFileDrag(dragSource) && dragSource.item === item) {
        rowHtmlProps = {
          ...activeDragSourceProps,
          ...rowHtmlProps
        }
      }
    }

    return rowHtmlProps
  }

  /**
   * Determine props that will be passed to each row
   *
   * TODO: Memoization? Dragging over an item will re-render every item and not only affected rows
   * @param item
   */
  const getAdditionalRowProps = (item: T): DnDTableRowProps<T> => {
    return {
      ...getRowHtmlStatusProps(item),
      hideNativeDragPreview,
      canDropItem: source => canDropOnItem(source, item),
      onDropItem: source => {
        endDrag(item)
        if (isFileDrag(source)) {
          props.onDropFiles(source.items, item)
        } else {
          props.onDropItem(source.item, item)
        }
      },
      onDragStartItem: () => {
        props.onDragStartItem?.(item)
        return {
          item,
          type: '__DND_TABLE_ROW__'
        }
      },
      onDragOverItem: (source, dropTargetMonitor) => {
        props.onDragOverItem?.(source, item, dropTargetMonitor)
        // this is necessary because file dragging will not cause a drag start
        setDragSource(source)
        setDropTarget(item)
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
