import React, { PropsWithChildren, useEffect, useRef } from 'react'
import {
  DnDTableRowProps,
  DnDTableRowType,
  DragSource,
  FileManagerNode
} from './interfaces'
import { useDrag, useDrop } from 'react-dnd'
import { getEmptyImage, NativeTypes } from 'react-dnd-html5-backend'

export const DnDTableRow = <T extends FileManagerNode>(
  props: PropsWithChildren<DnDTableRowProps<T>>
) => {
  const {
    onDropItem,
    canDropItem,
    onDragStartItem,
    onDragOverItem,
    onDragEndItem,
    hideNativeDragPreview,
    ...additionalHtmlProps
  } = props
  const [, drop] = useDrop<DragSource<T>, unknown, unknown>({
    accept: [DnDTableRowType, NativeTypes.FILE],
    drop: onDropItem,
    canDrop: canDropItem,
    hover: onDragOverItem
  })
  const [, drag, preview] = useDrag<DragSource<T>, unknown, unknown>({
    item: onDragStartItem,
    type: DnDTableRowType,
    end: onDragEndItem
  })
  const rowRef = useRef<HTMLTableRowElement>(null)
  drag(drop(rowRef))
  useEffect(() => {
    if (hideNativeDragPreview) {
      preview(getEmptyImage(), { captureDraggingState: true })
    }
  }, [preview, hideNativeDragPreview])
  return <tr {...additionalHtmlProps} ref={rowRef} />
}

export default DnDTableRow
