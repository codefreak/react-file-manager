import {
  DragSource,
  FileManagerDragLayerProps,
  FileManagerNode
} from './interfaces'
import { useDragLayer } from 'react-dnd'
import React from 'react'
import { DefaultCustomDragLayer } from './defaults'
import { useSelectedItems } from './MultiSelectionProvider'
import { isFileDrag } from './utils'

export interface CustomDragLayerProps<T extends FileManagerNode> {
  element?: React.FC<FileManagerDragLayerProps<T>>
}

/**
 * HOC that detects file dropping and multi-selection
 */
const CustomDragLayer = <T extends FileManagerNode>(
  props: CustomDragLayerProps<T>
): React.ReactElement | null => {
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

  // TODO: this will depend on which is the scrolling element and the overlay offset technique
  const scrollingElement = document.scrollingElement
  const x = clientOffset.x + (scrollingElement?.scrollLeft || 0)
  const y = clientOffset.y + (scrollingElement?.scrollTop || 0)
  const LayerType = props.element || DefaultCustomDragLayer

  const draggedItems: T[] = selectedItems.length ? selectedItems : [item.node]
  return <LayerType x={x} y={y} draggedItems={draggedItems} />
}

export default CustomDragLayer
