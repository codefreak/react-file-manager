import React, { useEffect, useMemo, useRef } from 'react'
import { DnDTableRowProps, FileManagerItemDragType } from './interfaces'
import { useDrag, useDrop } from 'react-dnd'
import { getEmptyImage, NativeTypes } from 'react-dnd-html5-backend'
import { getDnDHtmlStatusProps } from './utils'
import { DefaultRecordType } from 'rc-table/es/interface'

export const DnDTableRow = <T extends DefaultRecordType>(
  props: DnDTableRowProps<T>
) => {
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
    ...additionalHtmlProps
  } = props
  const accept = useMemo(() => {
    if (acceptFiles) {
      return [FileManagerItemDragType, NativeTypes.FILE]
    } else {
      return [FileManagerItemDragType]
    }
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

  // This is necessary to make drop work on the whole table.
  if (enableDrop) {
    drag(drop(rowRef))
  } else {
    drag(rowRef)
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
