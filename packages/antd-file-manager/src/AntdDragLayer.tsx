import { FileTextFilled } from '@ant-design/icons'
import { Badge } from 'antd'
import React, { useCallback } from 'react'
import { FileManagerNode, isFileDrag } from '@codefreak/react-file-manager'
import { DragLayerMonitor, useDragLayer } from 'react-dnd'
import { AntdDragLayerProps } from './interfaces'

const AntdDragLayer = <T extends FileManagerNode>(
  props: AntdDragLayerProps
): React.ReactElement | null => {
  const { scrollingElement = { current: document.scrollingElement } } = props
  const collector = useCallback(
    (monitor: DragLayerMonitor) => {
      const clientOffset = monitor.getClientOffset()
      const x =
        (clientOffset?.x || 0) + (scrollingElement.current?.scrollLeft || 0)
      const y =
        (clientOffset?.y || 0) + (scrollingElement.current?.scrollTop || 0)

      return {
        isDragging: monitor.isDragging(),
        item: monitor.getItem(),
        transform: `translate(${x}px, ${y}px)`
      }
    },
    [scrollingElement]
  )
  const { isDragging, transform, item } = useDragLayer(collector)
  // Browsers render a default file icon with (+) when dragging a file
  // over a droppable area. I think this cannot be removed...?
  if (!isDragging || isFileDrag(item)) {
    return null
  }

  const draggedItems = item.items
  let dragContent = <FileTextFilled style={{ fontSize: '1.5em' }} />
  // wrap in badge if multiple items are dragged or about to drop files
  if (draggedItems.length > 1) {
    dragContent = (
      <Badge count={draggedItems.length} size="small">
        {dragContent}
      </Badge>
    )
  }
  return (
    <div
      style={{
        position: 'absolute',
        left: 0,
        top: 0,
        transform,
        zIndex: 999,
        pointerEvents: 'none'
      }}
    >
      {dragContent}
    </div>
  )
}

export default AntdDragLayer
