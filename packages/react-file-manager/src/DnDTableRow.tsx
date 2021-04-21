import React, { PropsWithChildren, useEffect, useRef } from 'react'
import { DnDTableRowProps, FileManagerDragSource, FileManagerItemDragType, FileManagerNode } from './interfaces'
import { useDrag, useDrop } from 'react-dnd'
import { getEmptyImage, NativeTypes } from 'react-dnd-html5-backend'
import { getDnDHtmlStatusProps } from './utils'

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
    dragStatus,
    ...additionalHtmlProps
  } = props
  const [{ isOver, isDragging, canDrop }, drop] = useDrop<
    FileManagerDragSource<T>,
    unknown,
    { isOver: boolean; canDrop: boolean; isDragging: boolean }
  >({
    accept: [FileManagerItemDragType, NativeTypes.FILE],
    drop: onDropItem,
    canDrop: canDropItem,
    hover: onDragOverItem,
    collect: targetMonitor => ({
      isOver: targetMonitor.isOver(),
      canDrop: targetMonitor.canDrop(),
      isDragging: !!targetMonitor.getItem()
    })
  })
  const [{ isCurrentDragSource }, drag, preview] = useDrag<
    FileManagerDragSource<T>,
    unknown,
    { isCurrentDragSource: boolean }
  >({
    item: onDragStartItem,
    type: FileManagerItemDragType,
    end: onDragEndItem,
    collect: sourceMonitor => ({
      isCurrentDragSource: sourceMonitor.isDragging()
    })
  })
  const rowRef = useRef<HTMLTableRowElement>(null)
  drag(drop(rowRef))
  useEffect(() => {
    if (hideNativeDragPreview) {
      preview(getEmptyImage(), { captureDraggingState: true })
    }
  }, [preview, hideNativeDragPreview])

  const rowHtmlProps = dragStatus
    ? getDnDHtmlStatusProps(
        {
          canDrop,
          isOver,
          isDragging,
          isCurrentDragSource
        },
        dragStatus
      )
    : {}
  return <tr {...additionalHtmlProps} {...rowHtmlProps} ref={rowRef} />
}

export default DnDTableRow
