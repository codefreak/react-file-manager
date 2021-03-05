import React, { PropsWithChildren, useMemo } from 'react'
import { DndProvider, useDragLayer } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import {
  CustomDragLayerProps,
  DnDTableProps,
  DropItemOrFile,
  FileManagerNode,
  FileManagerProps
} from './interfaces'
import { defaultCustomDragLayerRenderer } from './defaults'
import DnDTable from './DnDTable'
import { isFileDrop } from './utils'
import { ColumnsType } from 'rc-table/es/interface'

const isMultiMove = (selectedPaths: string[], draggedItemPath: string) => {
  return (
    selectedPaths.length > 1 && selectedPaths.indexOf(draggedItemPath) !== -1
  )
}

const generateDefaultColumns = <T extends FileManagerNode>(
  renderNodeTitle?: FileManagerProps<T>['renderNodeTitle']
): ColumnsType<T> => [
  {
    key: 'icon',
    title: '',
    width: 1
  },
  {
    key: 'name',
    title: 'Name',
    render: (_, node) =>
      renderNodeTitle ? renderNodeTitle({ node }) : node.path
  }
]

const CustomDragLayer = (props: CustomDragLayerProps) => {
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

const FileManager = <T extends FileManagerNode>(
  props: PropsWithChildren<FileManagerProps<T>>
): React.ReactElement => {
  const files = props.data || []
  const selectedPaths = props.selectedPaths || []

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

  const {
    columns = generateDefaultColumns<T>(props.renderNodeTitle),
    ...tableProps
  } = props
  const canDropFiles: DnDTableProps<T>['canDropFiles'] = () => true
  return (
    <DndProvider backend={HTML5Backend}>
      <CustomDragLayer
        selectedPaths={selectedPaths}
        renderer={defaultCustomDragLayerRenderer}
      />
      <DnDTable
        {...tableProps}
        rowKey="path"
        columns={columns}
        canDropNode={canDropNode}
        onDrop={onNodeDrop}
        canDropFiles={canDropFiles}
        onFilesDrop={onFilesDrop}
      />
    </DndProvider>
  )
}

export default FileManager
