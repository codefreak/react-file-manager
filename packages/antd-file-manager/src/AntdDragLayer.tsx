import { FileTextFilled } from '@ant-design/icons'
import { Badge } from 'antd'
import React from 'react'
import {
  DragSource,
  FileManagerNode,
  useSelectedItems,
  isFileDrag,
  isMultiMove
} from '@codefreak/react-file-manager'
import { useDragLayer } from 'react-dnd'

interface AntdDragLayerProps {
  scrollingElement?: React.RefObject<{
    scrollLeft: number
    scrollTop: number
  }>
}

const AntdDragLayer = <T extends FileManagerNode>(
  props: AntdDragLayerProps
): React.ReactElement | null => {
  const { scrollingElement } = props
  const { isDragging, item, clientOffset } = useDragLayer(monitor => ({
    item: monitor.getItem() as DragSource<T>,
    itemType: monitor.getItemType(),
    isDragging: monitor.isDragging(),
    clientOffset: monitor.getClientOffset()
  }))
  // TODO: this casting is unsafe. Can we make the context type-safe?
  const selectedItems = useSelectedItems() as T[]
  // Browsers render a default file icon with (+) when dragging a file
  // over a droppable area. I think this cannot be removed...?
  if (!isDragging || !clientOffset || isFileDrag(item)) {
    return null
  }

  const draggedItems: T[] = selectedItems.length ? selectedItems : [item.node]
  let dragContent = <FileTextFilled style={{ fontSize: '1.5em' }} />
  const isMovingMultipleFiles =
    !isFileDrag(item) &&
    isMultiMove(
      draggedItems.map(item => item.path),
      item.node.path
    )
  // wrap in badge if multiple items are dragged or about to drop files
  if (isFileDrag(item) || isMovingMultipleFiles) {
    dragContent = (
      <Badge count={draggedItems.length} size="small">
        {dragContent}
      </Badge>
    )
  }
  const x = clientOffset.x + (scrollingElement?.current?.scrollLeft || 0)
  const y = clientOffset.y + (scrollingElement?.current?.scrollTop || 0)
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
