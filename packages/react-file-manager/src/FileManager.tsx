import React, { ReactElement, useMemo, useState } from 'react'
import {
  FileManagerItemDragType,
  FileManagerNode,
  FileManagerProps,
  FileManagerRenderComponent,
  FileManagerRendererProps
} from './interfaces'
import { isFileDrag } from './utils'

/**
 * The default behaviour is:
 * Do only allow item drops on directories if it is not included in the sources
 * @param items
 * @param target
 */
const defaultCanDropItems = <T extends FileManagerNode>(
  items: T[],
  target: T
): boolean => target.type === 'directory' && !items.includes(target)

const FileManager = <T extends FileManagerNode>(
  props: FileManagerProps<T>
): ReactElement => {
  const {
    canDropItems = defaultCanDropItems,
    canDropFiles = false,
    renderer,
    hideNativeDragPreview,
    dataKey
  } = props
  const [selectedItems, setSelectedItems] = useState<T[]>([])
  const selectedItemKeys = useMemo(() => {
    return (
      props.selectedItemKeys ||
      selectedItems.map(
        item => item[dataKey as keyof T] as unknown as React.Key
      )
    )
  }, [selectedItems, props.selectedItemKeys, dataKey])

  const canDropFilesOnTarget = (
    items: DataTransferItemList,
    target?: T
  ): boolean => {
    if (typeof canDropFiles !== 'function') return !!canDropFiles
    return canDropFiles(items, target)
  }

  const canDropItemsOnTarget = (items: T[], target: T): boolean => {
    if (typeof canDropItems !== 'function') return !!canDropItems
    return canDropItems(items, target)
  }

  const canDropItem: FileManagerRendererProps<T>['canDropItem'] = (
    source,
    target
  ) => {
    if (isFileDrag(source)) {
      return canDropFilesOnTarget(source.items, target)
    }
    if (target === undefined) {
      throw TypeError('Expected a valid drop target')
    }
    return canDropItemsOnTarget(source.items, target)
  }

  const onDropItem: FileManagerRendererProps<T>['onDropItem'] = (
    source,
    target
  ) => {
    if (isFileDrag(source)) {
      props.onDropFiles?.(source.items, target)
    } else {
      if (target === undefined) {
        throw TypeError('Expected a valid drop target')
      }
      props.onDropItems?.(source.items, target)
    }
  }

  const onDragStart: FileManagerRendererProps<T>['onDragStartItem'] =
    draggedItem => {
      // if we are dragging multiple items create a new drag source with all selected items
      if (
        selectedItems.length > 1 &&
        selectedItems.indexOf(draggedItem) !== -1
      ) {
        return {
          type: FileManagerItemDragType,
          items: [...selectedItems]
        }
      }
      return null // use original drag source
    }

  const onSelectionChange = (items: T[]) => {
    setSelectedItems(items)
    props.onSelectionChange?.(items)
  }

  const RenderComponent: FileManagerRenderComponent<T> = renderer
  return (
    <RenderComponent
      {...props}
      selectedItemKeys={selectedItemKeys}
      acceptFiles={!!canDropFiles}
      hideNativeDragPreview={hideNativeDragPreview || false}
      onSelectionChange={onSelectionChange}
      onDragStartItem={onDragStart}
      onDropItem={onDropItem}
      canDropItem={canDropItem}
    />
  )
}

export default FileManager
