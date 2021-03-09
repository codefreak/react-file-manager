import { FileTextFilled } from '@ant-design/icons'
import { Badge } from 'antd'
import React from 'react'
import { FileManagerDragLayerProps } from '@codefreak/react-file-manager'

const AntdDragLayer: React.FC<FileManagerDragLayerProps<any>> = props => {
  const { x, y, draggedItems } = props
  let dragContent = <FileTextFilled style={{ fontSize: '1.5em' }} />
  // wrap in badge if multiple items are dragged
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
