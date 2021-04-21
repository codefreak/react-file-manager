import { DnDStatus, DnDStatusProps, FileDropItem } from './interfaces'
import React from 'react'

export const isFileDrag = (obj: unknown): obj is FileDropItem => {
  return (
    typeof obj === 'object' && obj !== null && 'items' in obj && 'files' in obj
  )
}
export const isMultiMove = <T>(selectedItems: T[], draggedItem: T): boolean => {
  return selectedItems.length > 1 && selectedItems.indexOf(draggedItem) !== -1
}

export const basename = (path: string): string => path

/**
 * Determine additional html props depending on the current d&d status for an individual item
 */
export const getDnDHtmlStatusProps = <ElementType extends HTMLElement>(
  status: DnDStatus,
  props: DnDStatusProps<ElementType>
): React.HTMLProps<ElementType> => {
  const { isDragging, isCurrentDragSource, canDrop, isOver } = status
  const {
    activeDragSourceProps,
    invalidDropTargetOverProps,
    invalidDropTargetProps,
    validDropTargetOverProps,
    validDropTargetProps
  } = props
  let rowHtmlProps = {}
  if (!isDragging) {
    return {}
  }

  if (canDrop) {
    // valid drop target
    rowHtmlProps = {
      ...validDropTargetProps,
      ...rowHtmlProps
    }
  } else {
    // invalid drop target
    rowHtmlProps = {
      ...invalidDropTargetProps,
      ...rowHtmlProps
    }
  }
  // additional props for currently hovered over items
  if (isOver) {
    if (canDrop) {
      // valid drop target that is being dragged over
      rowHtmlProps = {
        ...validDropTargetOverProps,
        ...rowHtmlProps
      }
    } else {
      // invalid drop target that is being dragged over
      rowHtmlProps = {
        ...invalidDropTargetOverProps,
        ...rowHtmlProps
      }
    }
  }
  // currently dragged node
  if (isCurrentDragSource) {
    rowHtmlProps = {
      ...activeDragSourceProps,
      ...rowHtmlProps
    }
  }

  return rowHtmlProps
}
