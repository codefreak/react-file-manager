import { FileTextFilled } from '@ant-design/icons'
import { Badge } from 'antd'
import React, { HTMLProps, useCallback } from 'react'
import { isFileDrag } from '@codefreak/react-file-manager'
import { DragLayerMonitor, useDragLayer } from 'react-dnd'
import { AntdDragLayerProps } from './interfaces'

/**
 * Function that calculates the position of the cursor relative to an element
 */
const calculateRelativeDragLayerTransform = (
  monitor: DragLayerMonitor,
  element: Element | null
) => {
  // position of the element relative to body
  const wrapperBoundingRect = element?.getBoundingClientRect()
  // position of the cursor relative to body
  const cursorOffset = monitor.getClientOffset()
  const wrapperX = wrapperBoundingRect?.x || 0
  const wrapperY = wrapperBoundingRect?.y || 0
  const cursorX = cursorOffset?.x || 0
  const cursorY = cursorOffset?.y || 0
  // position of the cursor relative to element
  return {
    x: cursorX - wrapperX,
    y: cursorY - wrapperY
  }
}

const AntdDragLayer: React.FC<AntdDragLayerProps> = (props) => {
  const {
    relativeToElement = { current: document.scrollingElement },
    additionalStyle = {}
  } = props
  const positionCalculator = useCallback(
    (monitor) =>
      calculateRelativeDragLayerTransform(monitor, relativeToElement.current),
    [relativeToElement]
  )
  const collector = useCallback(
    (monitor: DragLayerMonitor) => {
      const { x, y } = positionCalculator(monitor)
      return {
        isDragging: monitor.isDragging(),
        item: monitor.getItem(),
        transform: `translate(${x}px, ${y}px)`
      }
    },
    [positionCalculator]
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

  const style: HTMLProps<HTMLDivElement>['style'] = {
    transform,
    position: 'absolute',
    left: 0,
    top: 0,
    zIndex: 999,
    pointerEvents: 'none',
    ...additionalStyle
  }
  return <div style={style}>{dragContent}</div>
}

export default AntdDragLayer
