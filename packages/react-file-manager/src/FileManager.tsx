import React, { PropsWithChildren, useState } from 'react'
import {
  FileManagerItemDragType,
  FileManagerNode,
  FileManagerProps,
  FileManagerRenderComponent,
  FileManagerRendererProps
} from './interfaces'
import { isFileDrag, isMultiMove } from './utils'

const FileManager = <T extends FileManagerNode>(
  props: PropsWithChildren<FileManagerProps<T>>
): React.ReactElement => {
  const data = props.dataSource || []
  const [selectedItems, setSelectedItems] = useState<T[]>([])

  const canDropItem: FileManagerRendererProps<T>['canDropItem'] = (
    source,
    target
  ) => {
    // TODO: invoke props.canDropItems()
    // only ever allow moves/drops to directories and never on dir itself
    return (
      target.type === 'directory' &&
      (isFileDrag(source) || !source.items.includes(target))
    )
  }

  const onDropItem: FileManagerRendererProps<T>['onDropItem'] = (
    source,
    target
  ) => {
    if (isFileDrag(source)) {
      props.onDropFiles?.(source.items, target)
    } else {
      if (target !== undefined) {
        props.onDropItems?.(source.items, target)
      } else {
        throw 'Expected a valid drop target'
      }
    }
  }

  const onDragStart: FileManagerRendererProps<T>['onDragStartItem'] = item => {
    if (isMultiMove(selectedItems, item)) {
      return {
        type: FileManagerItemDragType,
        items: [...selectedItems]
      }
    }
    return null // use original drag source
  }

  const RenderComponent: FileManagerRenderComponent<T> = props.renderer
  // TODO: hideNativeDragPreview by argument
  return (
    <RenderComponent
      {...props}
      hideNativeDragPreview={props.hideNativeDragPreview || false}
      onSelectionChange={items => setSelectedItems(items)}
      onDragStartItem={onDragStart}
      onDropItem={onDropItem}
      canDropItem={canDropItem}
    />
  )
}

export default FileManager
