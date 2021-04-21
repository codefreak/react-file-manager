import React, { PropsWithChildren, useState } from 'react'
import {
  FileManagerNode,
  FileManagerProps,
  FileManagerRenderComponent,
  FileManagerRendererProps
} from './interfaces'
import { isMultiMove } from './utils'

const FileManager = <T extends FileManagerNode>(
  props: PropsWithChildren<FileManagerProps<T>>
): React.ReactElement => {
  const data = props.dataSource || []
  const [selectedItems, setSelectedItems] = useState<T[]>([])

  const canDropItem: FileManagerRendererProps<T>['canDropItem'] = (
    source,
    target
  ) => {
    // only ever allow moves/drops to directories and never on dir itself
    if (target.type !== 'directory' || target === source) return false
    // only allow multi drop to directory if it's not contained in dragged items
    return (
      !isMultiMove(selectedItems, source) ||
      selectedItems.indexOf(target) === -1
    )
  }

  const onDropItem: FileManagerRendererProps<T>['onDropItem'] = (
    source,
    target
  ) => {
    if (isMultiMove(selectedItems, source)) {
      const sources = data.filter(i => selectedItems.indexOf(i) !== -1)
      props.onDropItems?.(sources, target)
    } else {
      props.onDropItems?.([source], target)
    }
  }

  const onDropFiles: FileManagerRendererProps<T>['onDropFiles'] = (
    dataTransfer,
    target
  ) => {
    if (!props.onDropFiles) return
    props.onDropFiles(dataTransfer, target)
  }

  const renderCustomDragLayer = () => {
    const CustomDragLayer = props.customDragLayer?.component
    if (CustomDragLayer === undefined) return null
    return (
      <CustomDragLayer
        draggedItems={selectedItems}
        scrollingElement={
          props.customDragLayer?.scrollingElement || {
            current: document.scrollingElement
          }
        }
      />
    )
  }

  const RenderComponent: FileManagerRenderComponent<T> = props.renderer
  return (
    <>
      {renderCustomDragLayer()}
      <RenderComponent
        {...props}
        hideNativeDragPreview={props.customDragLayer !== undefined}
        onSelectionChange={items => setSelectedItems(items)}
        canDropFiles={props.canDropFiles || props.onDropFiles !== undefined}
        onDropFiles={onDropFiles}
        onDropItem={onDropItem}
        canDropItem={canDropItem}
      />
    </>
  )
}

export default FileManager
