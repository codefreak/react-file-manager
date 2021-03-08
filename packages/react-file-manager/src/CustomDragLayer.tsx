import {
  CustomDragLayerProps,
  DropItemOrFile,
  FileManagerNode
} from './interfaces'
import { useDragLayer } from 'react-dnd'
import React, { useMemo } from 'react'
import { isFileDrop, isMultiMove } from './utils'

const CustomDragLayer: React.FC<CustomDragLayerProps> = props => {
  const { selectedPaths, renderer } = props
  const { isDragging, item, clientOffset } = useDragLayer(monitor => ({
    item: monitor.getItem() as DropItemOrFile<FileManagerNode>,
    itemType: monitor.getItemType(),
    isDragging: monitor.isDragging(),
    clientOffset: monitor.getClientOffset()
  }))

  const items = useMemo((): string[] => {
    if (!item) {
      return []
    }
    if (isFileDrop(item)) {
      // on hover we only get basic information about number of files and
      // the mime-type of the files
      return new Array(item.items.length).fill('')
    }
    if (isMultiMove(selectedPaths, item.node.path)) {
      return selectedPaths
    }
    return [item.node.path]
  }, [item, selectedPaths])

  if (!isDragging || !clientOffset) {
    return null
  }

  // TODO: this will depend on which is the scrolling element and the overlay offset technique
  const scrollingElement = document.scrollingElement
  const x = clientOffset.x + (scrollingElement?.scrollLeft || 0)
  const y = clientOffset.y + (scrollingElement?.scrollTop || 0)
  return renderer(x, y, items)
}

export default CustomDragLayer
