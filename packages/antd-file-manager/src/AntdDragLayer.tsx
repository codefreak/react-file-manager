import { FileTextFilled } from '@ant-design/icons'
import { Badge } from 'antd'
import React from 'react'
import {
  FileManagerCustomDragLayerProps,
  FileManagerNode
} from '@codefreak/react-file-manager'
import { useDragLayer } from 'react-dnd'

const AntdDragLayer = <T extends FileManagerNode>(
  props: FileManagerCustomDragLayerProps<T>
): React.ReactElement | null => {
  const { scrollingElement, draggedItems } = props
  const { isDragging, clientOffset } = useDragLayer(monitor => ({
    isDragging: monitor.isDragging(),
    clientOffset: monitor.getClientOffset()
  }))
  // Browsers render a default file icon with (+) when dragging a file
  // over a droppable area. I think this cannot be removed...?
  if (!isDragging || draggedItems === undefined) {
    return null
  }

  let dragContent = <FileTextFilled style={{ fontSize: '1.5em' }} />
  // wrap in badge if multiple items are dragged or about to drop files
  if (draggedItems.length > 1) {
    dragContent = (
      <Badge count={draggedItems.length} size="small">
        {dragContent}
      </Badge>
    )
  }
  const x = (clientOffset?.x || 0) + (scrollingElement.current?.scrollLeft || 0)
  const y = (clientOffset?.y || 0) + (scrollingElement.current?.scrollTop || 0)
  return (
    <div
      style={{
        position: 'absolute',
        left: 0,
        top: 0,
        transform: `translate(${x}px, ${y}px)`,
        zIndex: 999,
        pointerEvents: 'none'
      }}
    >
      {dragContent}
    </div>
  )
}

export default AntdDragLayer
