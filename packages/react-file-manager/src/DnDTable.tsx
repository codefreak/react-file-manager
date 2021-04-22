import React, { useRef } from 'react'
import { useDrop } from 'react-dnd'
import { NativeTypes } from 'react-dnd-html5-backend'
import { getDnDHtmlStatusProps } from './utils'
import { DnDTableProps, FileDropItem } from './interfaces'

const DnDTable = (props: DnDTableProps) => {
  const {
    canDropItem,
    onDropItem,
    dndStatusProps = {},
    ...tableProps
  } = props
  const tableRef = useRef<HTMLTableElement>(null)
  const [{ isOver, isDragging, canDrop }, drop] = useDrop<
    FileDropItem,
    unknown,
    { isOver: boolean; isDragging: boolean; canDrop: boolean }
  >({
    accept: [NativeTypes.FILE],
    drop: (source, targetMonitor) => {
      if (!targetMonitor.didDrop()) {
        onDropItem?.(source, targetMonitor)
      }
    },
    canDrop: canDropItem,
    collect: monitor => ({
      isOver: monitor.isOver({ shallow: true }),
      canDrop: monitor.canDrop(),
      isDragging: !!monitor.getItem()
    })
  })
  drop(tableRef)
  const rootStatusProps = getDnDHtmlStatusProps<HTMLTableElement>(
    {
      isOver,
      canDrop,
      isDragging,
      isCurrentDragSource: false
    },
    dndStatusProps
  )
  return <table {...tableProps} {...rootStatusProps} ref={tableRef} />
}

export default DnDTable
