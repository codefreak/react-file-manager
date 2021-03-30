import React, { HTMLProps, PropsWithChildren, useMemo } from 'react'
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { DnDTableProps, FileManagerNode, FileManagerProps } from './interfaces'
import { generateDefaultColumns } from './defaults'
import DnDTable from './DnDTable'
import { isMultiMove } from './utils'
import CustomDragLayer from './CustomDragLayer'
import { useSelectedItems } from './MultiSelectionProvider'

const FileManager = <T extends FileManagerNode>(
  props: PropsWithChildren<FileManagerProps<T>>
): React.ReactElement => {
  const files = props.data || []
  const selectedItems = useSelectedItems() as T[]
  const selectedPaths = useMemo(() => selectedItems.map(item => item.path), [
    selectedItems
  ])

  const canDropNode: DnDTableProps<T>['canDropNode'] = (source, target) => {
    // only ever allow moves/drops to directories and never on dir itself
    if (target.type !== 'directory' || target.path === source.path) return false
    // only allow multi drop to directory if it's not contained in selectedPaths
    return (
      !isMultiMove(selectedPaths, source.path) ||
      selectedPaths.indexOf(target.path) === -1
    )
  }

  const onNodeDrop: DnDTableProps<T>['onDrop'] = (source, target) => {
    if (props.onDrop) {
      if (isMultiMove(selectedPaths, source.path)) {
        const sources = files.filter(i => selectedPaths.indexOf(i.path) !== -1)
        props.onDrop(sources, target)
      } else {
        props.onDrop([source], target)
      }
    }
  }

  const onFilesDrop: DnDTableProps<T>['onFilesDrop'] = (
    files,
    dataTransfer,
    target
  ) => {
    if (!props.onDropFiles) return
    if (target.type === 'directory') {
      props.onDropFiles(files, dataTransfer, target)
    } else {
      // indicate drop on root ("current directory") by leaving out the
      // target node
      props.onDropFiles(files, dataTransfer)
    }
  }

  const getAdditionalRowProps = (node: T): HTMLProps<HTMLTableRowElement> => ({
    onClick: e => props.onClickRow?.(node, e),
    onDoubleClick: e => props.onDoubleClickRow?.(node, e)
  })

  const {
    columns = generateDefaultColumns<T>(props.renderNodeTitle),
    ...tableProps
  } = props
  const canDropFiles: DnDTableProps<T>['canDropFiles'] = () => true
  return (
    <DndProvider backend={HTML5Backend}>
      <CustomDragLayer element={props.dragLayer} />
      <DnDTable
        {...tableProps}
        rowKey="path"
        columns={columns}
        canDropNode={canDropNode}
        onDrop={onNodeDrop}
        canDropFiles={canDropFiles}
        onFilesDrop={onFilesDrop}
        onRow={getAdditionalRowProps}
      />
    </DndProvider>
  )
}

export default FileManager
