import React, { createRef, PropsWithChildren, useEffect, useRef } from 'react'
import {
  DnDRowRenderProps,
  DnDTableRowItem,
  DnDTableRowType,
  DragSource,
  FileManagerNode
} from './interfaces'
import { useDrag, useDrop } from 'react-dnd'
import { getEmptyImage, NativeTypes } from 'react-dnd-html5-backend'
import { isFileDrag } from './utils'

export const DnDTableRow = <T extends FileManagerNode>(
  props: PropsWithChildren<DnDRowRenderProps<T>>
) => {
  const {
    item,
    canDropItem,
    onDropItem,
    canDropFiles,
    onDropFiles,
    onRowDragStart,
    onRowDragOver,
    onRowDragEnd,
    hideNativeDragPreview,
    ...restProps
  } = props
  const [, drop] = useDrop<DragSource<T>, unknown, unknown>({
    accept: [DnDTableRowType, NativeTypes.FILE],
    drop: source => {
      if (isFileDrag(source)) {
        onDropFiles(source.items)
      } else {
        onDropItem(source.item)
      }
    },
    canDrop: (source: DragSource<T>) => {
      if (isFileDrag(source)) {
        return canDropFiles(source.items)
      } else {
        return canDropItem(source.item)
      }
    },
    hover: (source, monitor) => onRowDragOver(source, monitor.canDrop())
  })
  const [, drag, preview] = useDrag<DnDTableRowItem<T>, unknown, unknown>({
    item: () => {
      onRowDragStart()
      return { item, type: DnDTableRowType }
    },
    type: DnDTableRowType,
    end: () => onRowDragEnd()
  })
  const rowRef = useRef<HTMLTableRowElement>(null)
  drag(drop(rowRef))
  useEffect(() => {
    if (hideNativeDragPreview) {
      preview(getEmptyImage(), { captureDraggingState: true })
    }
  }, [preview, hideNativeDragPreview])
  return <tr ref={rowRef} {...restProps} />
}

export default DnDTableRow
