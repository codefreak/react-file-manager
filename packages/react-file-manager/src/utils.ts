import { DnDStatus, DnDStatusProps, FileDropItem } from './interfaces'
import React from 'react'

export const isFileDrag = (obj: unknown): obj is FileDropItem => {
  return (
    typeof obj === 'object' && obj !== null && 'items' in obj && 'files' in obj
  )
}

/**
 * Determine additional html props depending on the current d&d status for an individual item
 */
export const getDnDHtmlStatusProps = <ElementType extends HTMLElement>(
  status: DnDStatus,
  props: DnDStatusProps<ElementType>
): React.HTMLProps<ElementType> => {
  const { isDragging, isCurrentDragSource, canDrop, isOver } = status
  // don't do anything if we are not dragging or there are no props specified
  if (!isDragging || Object.keys(props).length === 0) {
    return {}
  }

  const {
    activeDragSourceProps,
    invalidDropTargetOverProps,
    invalidDropTargetProps,
    validDropTargetOverProps,
    validDropTargetProps
  } = props
  let rowHtmlProps = {}
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
