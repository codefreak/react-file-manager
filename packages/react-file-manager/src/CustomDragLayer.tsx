import {
  DropItemOrFile,
  FileManagerDragLayerProps,
  FileManagerNode
} from './interfaces'
import { useDragLayer } from 'react-dnd'
import React from 'react'
import { DefaultCustomDragLayer } from './defaults'

export interface CustomDragLayerProps<T extends FileManagerNode> {
  element?: React.FC<FileManagerDragLayerProps<T>>
}

const CustomDragLayer = <T extends FileManagerNode>(
  props: CustomDragLayerProps<T>
) => {
  const { isDragging, item, clientOffset } = useDragLayer(monitor => ({
    item: monitor.getItem() as DropItemOrFile<T>,
    itemType: monitor.getItemType(),
    isDragging: monitor.isDragging(),
    clientOffset: monitor.getClientOffset()
  }))

  if (!isDragging || !clientOffset) {
    return null
  }

  // TODO: this will depend on which is the scrolling element and the overlay offset technique
  const scrollingElement = document.scrollingElement
  const x = clientOffset.x + (scrollingElement?.scrollLeft || 0)
  const y = clientOffset.y + (scrollingElement?.scrollTop || 0)
  const LayerType = props.element || DefaultCustomDragLayer
  return <LayerType x={x} y={y} draggedItems={[item]} />
}

export default CustomDragLayer
