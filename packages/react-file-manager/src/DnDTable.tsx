import {
  DnDRowRenderProps,
  DnDTableProps,
  DnDTableRowItem,
  DnDTableRowType,
  DragSource
} from './interfaces'
import React, { PropsWithChildren, useEffect, useRef, useState } from 'react'
import { useDrag, useDrop } from 'react-dnd'
import { getEmptyImage, NativeTypes } from 'react-dnd-html5-backend'
import { DefaultRecordType } from 'rc-table/es/interface'
import { isFileDrag } from './utils'
import { defaultTableRenderer } from './defaults'

const DnDTableRow = <T extends DefaultRecordType>(
  props: PropsWithChildren<DnDRowRenderProps<T>>
) => {
  const {
    node,
    canDropNode,
    onNodeDrop,
    canDropFiles,
    onFilesDrop,
    onRowDragStart,
    onRowDragOver,
    onRowDragEnd,
    hideNativeDragPreview,
    ...restProps
  } = props
  const ref = useRef<HTMLTableRowElement>(null)
  const [, drop] = useDrop<DragSource<T>, unknown, unknown>({
    accept: [DnDTableRowType, NativeTypes.FILE],
    drop: item => {
      if (isFileDrag(item)) {
        onFilesDrop(item.files, item.items)
      } else {
        onNodeDrop(item.node)
      }
    },
    canDrop: (item: DragSource<T>) => {
      if (isFileDrag(item)) {
        return canDropFiles(item.items)
      } else {
        return canDropNode(item.node)
      }
    },
    hover: (draggedItem, monitor) =>
      onRowDragOver(draggedItem, monitor.canDrop())
  })
  const [, drag, preview] = useDrag<DnDTableRowItem<T>, unknown, unknown>({
    item: () => {
      onRowDragStart()
      return { node, type: DnDTableRowType }
    },
    type: DnDTableRowType,
    end: () => onRowDragEnd()
  })
  drag(drop(ref))
  useEffect(() => {
    if (hideNativeDragPreview === true) {
      preview(getEmptyImage(), { captureDraggingState: true })
    }
  }, [preview, hideNativeDragPreview])
  return <tr ref={ref} {...restProps} />
}

const DnDTable = <T extends DefaultRecordType>(
  props: DnDTableProps<T>
): React.ReactElement => {
  const [dragSource, setDragSource] = useState<DragSource<T> | undefined>(
    undefined
  )
  const [dropTarget, setDropTarget] = useState<T | undefined>(undefined)
  const {
    onRow,
    validDropTargetProps = {},
    invalidDropTargetProps = {},
    validDropTargetOverProps = {},
    invalidDropTargetOverProps = {},
    dragSourceProps = {}
  } = props

  const endDrag = (node: T) => {
    setDragSource(undefined)
    setDropTarget(undefined)
    props.onRowDragEnd?.(node)
  }

  // TODO: memoization... this gets pretty slow for large tables
  const getAdditionalRowProps = (
    node: T,
    index?: number
  ): DnDRowRenderProps<T> => {
    let rowProps: DnDRowRenderProps<T> = {
      node,
      hideNativeDragPreview: props.hideNativeDragPreview,
      canDropNode: source => props.canDropNode(source, node),
      onNodeDrop: source => {
        endDrag(node)
        props.onDrop(source, node)
      },
      canDropFiles: files => {
        if (!props.canDropFiles) return false
        return props.canDropFiles(files, node)
      },
      onFilesDrop: (files, dataTransfer) => {
        endDrag(node)
        if (!props.onFilesDrop) return
        props.onFilesDrop(files, dataTransfer, node)
      },
      onRowDragStart: () => {
        props.onRowDragStart?.(node)
      },
      onRowDragOver: (draggedItem, canDrop) => {
        props.onRowDragOver?.(draggedItem, node, canDrop)
        setDragSource(draggedItem)
        setDropTarget(node)
      },
      onRowDragEnd: () => endDrag(node)
    }

    // add additional props depending on the current d&d status
    if (dragSource) {
      let canDrop: boolean
      if (isFileDrag(dragSource)) {
        canDrop = props.canDropFiles?.(dragSource.items, node) || false
      } else {
        canDrop = props.canDropNode(dragSource.node, node)
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
      if (dropTarget && dropTarget === node) {
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
      if (!isFileDrag(dragSource) && dragSource.node === node) {
        rowProps = {
          ...dragSourceProps,
          ...rowProps
        }
      }
    }

    if (onRow) {
      rowProps = {
        ...rowProps,
        ...onRow(node, index)
      }
    }

    return rowProps
  }

  const renderTable = props.renderTable || defaultTableRenderer
  return renderTable({
    ...props,
    components: {
      body: {
        row: DnDTableRow
      }
    },
    onRow: getAdditionalRowProps
  })
}

export default DnDTable
