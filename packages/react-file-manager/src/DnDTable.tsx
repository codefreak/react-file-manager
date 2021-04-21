import React, { useRef } from 'react'
import { useDrop } from 'react-dnd'
import { NativeTypes } from 'react-dnd-html5-backend'
import { getDnDHtmlStatusProps } from './utils'
import { DnDTableProps, FileDropItem } from './interfaces'

const DnDTable = (props: DnDTableProps) => {
  const tableRef = useRef<HTMLTableElement>(null)
  const [{ isOver, isDragging, canDrop }, drop] = useDrop<
    FileDropItem,
    unknown,
    { isOver: boolean; isDragging: boolean; canDrop: boolean }
  >({
    accept: [NativeTypes.FILE],
    drop: (source, targetMonitor) => {
      if (!targetMonitor.didDrop()) {
        props.onDropItem?.(source, targetMonitor)
      }
    },
    collect: monitor => ({
      isOver: monitor.isOver({ shallow: true }),
      canDrop: monitor.canDrop(),
      isDragging: !!monitor.getItem()
    })
  })
  drop(tableRef)
  const rootStatusProps = props.dragStatus
    ? getDnDHtmlStatusProps<HTMLTableElement>(
        {
          isOver,
          canDrop,
          isDragging,
          isCurrentDragSource: false
        },
        props.dragStatus
      )
    : {}
  return <table {...props} {...rootStatusProps} ref={tableRef} />
}

export default DnDTable
