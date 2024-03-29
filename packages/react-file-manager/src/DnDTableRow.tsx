import React, { ReactElement, useEffect, useMemo, useRef } from 'react'
import { useDrag, useDrop } from 'react-dnd'
import { getEmptyImage, NativeTypes } from 'react-dnd-html5-backend'
import { DnDTableRowProps, FileManagerItemDragType } from './interfaces'
import { getDnDHtmlStatusProps } from './utils'

export const DnDTableRow = <T extends Record<string, unknown>>(
  props: DnDTableRowProps<T>
): ReactElement => {
  const {
    onDropItem,
    canDropItem,
    onDragStartItem,
    onDragOverItem,
    onDragEndItem,
    hideNativeDragPreview,
    dndStatusProps = {},
    acceptFiles,
    enableDrop,
    disableDrag,
    ...additionalHtmlProps
  } = props
  const accept = useMemo(() => {
    if (acceptFiles) {
      return [FileManagerItemDragType, NativeTypes.FILE]
    }
    return [FileManagerItemDragType]
  }, [acceptFiles])
  const [{ isOver, isDragging, canDrop }, drop] = useDrop<
    T,
    unknown,
    { isOver: boolean; canDrop: boolean; isDragging: boolean }
  >({
    accept,
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
    T,
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
  useEffect(() => {
    if (hideNativeDragPreview) {
      preview(getEmptyImage(), { captureDraggingState: true })
    }
  }, [preview, hideNativeDragPreview])

  const enableDrag = !disableDrag
  if (enableDrag && enableDrop) {
    drag(drop(rowRef))
  } else if (enableDrag) {
    drag(rowRef)
  } else if (enableDrop) {
    drop(rowRef)
  }

  const rowHtmlProps = getDnDHtmlStatusProps(
    {
      canDrop,
      isOver,
      isDragging,
      isCurrentDragSource
    },
    dndStatusProps
  )
  return <tr {...additionalHtmlProps} {...rowHtmlProps} ref={rowRef} />
}

export default DnDTableRow
