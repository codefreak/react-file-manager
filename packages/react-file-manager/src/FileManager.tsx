import React, { PropsWithChildren, useEffect, useMemo, useRef } from 'react'
import { DndProvider, useDrag, useDragLayer, useDrop } from 'react-dnd'
import {
  getEmptyImage,
  HTML5Backend,
  NativeTypes
} from 'react-dnd-html5-backend'
import { ColumnsType } from 'rc-table/es/interface'
import {
  AdditionalRowRenderProps,
  CustomDragLayerProps,
  DropItemOrFile,
  FileDropItem,
  FileManagerNode,
  FileManagerProps,
  TableProps
} from './interfaces'
import {
  defaultActionRenderer,
  defaultCustomDragLayerRenderer,
  defaultIconRenderer,
  defaultTableRenderer
} from './defaults'

const isMultiMove = (selectedPaths: string[], draggedItemPath: string) => {
  return (
    selectedPaths.length > 1 && selectedPaths.indexOf(draggedItemPath) !== -1
  )
}

const CustomDragLayer = (props: CustomDragLayerProps) => {
  const { selectedPaths, renderer } = props
  const { isDragging, item, clientOffset } = useDragLayer(monitor => ({
    item: monitor.getItem(),
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
    if (isMultiMove(selectedPaths, item.path)) {
      return selectedPaths
    }
    return [item.path]
  }, [item, selectedPaths])

  if (!isDragging || !clientOffset) {
    return null
  }

  const { x, y } = clientOffset
  return renderer(x, y, items)
}

const isFileDrop = (obj: unknown): obj is FileDropItem => {
  return (
    typeof obj === 'object' && obj !== null && 'items' in obj && 'files' in obj
  )
}

const FileManagerRow = <T extends FileManagerNode>(
  props: PropsWithChildren<AdditionalRowRenderProps<T>>
) => {
  const {
    style,
    node,
    onNodeDrop,
    canDropNode,
    onFilesDrop,
    ...restProps
  } = props
  const ref = useRef<HTMLTableRowElement>(null)
  const [, drop] = useDrop<DropItemOrFile<T>, unknown, unknown>({
    accept: ['directory', 'file', NativeTypes.FILE],
    drop: item => {
      if (isFileDrop(item)) {
        onFilesDrop(item.files, item.items)
      } else {
        onNodeDrop(item)
      }
    },
    canDrop: (item: DropItemOrFile<T>) => {
      return canDropNode(item)
    }
  })
  const [, drag, preview] = useDrag({ item: node })
  if (node.type === 'directory') {
    drag(drop(ref))
  } else {
    drag(ref)
  }
  useEffect(() => {
    // hide default drag preview
    preview(getEmptyImage(), { captureDraggingState: true })
  }, [])
  return <tr ref={ref} style={{ cursor: 'pointer', ...style }} {...restProps} />
}

const FileManager = <T extends FileManagerNode>(
  props: PropsWithChildren<FileManagerProps<T>>
): React.ReactElement => {
  const { files, additionalColumns } = props
  const selectedPaths = props.selectedPaths || []

  const renderActions = props.renderActions || defaultActionRenderer
  const iconRenderer = props.renderIcon || defaultIconRenderer
  const columns: ColumnsType<T> = useMemo(() => {
    const buildActionRenderer = (node: T) => {
      const actionRendererProps = {
        onDelete: () => {
          props.onDelete && props.onDelete(node)
        }
      }

      return renderActions(actionRendererProps)
    }

    return [
      {
        key: 'icon',
        title: '',
        render: (_, node) => {
          return iconRenderer(node)
        },
        width: '60px'
      },
      {
        key: 'name',
        title: 'Name',
        sorter: (a: T, b: T) => a.path.localeCompare(b.path),
        defaultSortOrder: 'ascend',
        render: (_, node) => node.path
      },
      ...(additionalColumns || []),
      {
        key: 'actions',
        render: (_, node: T) => buildActionRenderer(node),
        width: '0'
      }
    ]
  }, [additionalColumns, selectedPaths, iconRenderer, renderActions])

  const getAdditionalRowProps = (node: T) => {
    const isSelected = selectedPaths.indexOf(node.path) !== -1
    return {
      node: node,
      onDoubleClick: () => {
        if (props.onDoubleClick) {
          props.onDoubleClick(node)
        }
      },
      onClick: () => {
        if (props.onClick) {
          props.onClick(node)
        }
      },
      className: isSelected ? 'selected-row' : '',
      canDropNode: source => {
        // allow file drops on all node types
        if (isFileDrop(source)) return true
        // only ever allow moves/drops to directories and never on dir itself
        if (node.type !== 'directory' || node.path === source.path) return false
        // only allow multi drop to directory if it's not contained in selectedPaths
        return (
          !isMultiMove(selectedPaths, source.path) ||
          selectedPaths.indexOf(node.path) === -1
        )
      },
      onNodeDrop: source => {
        if (props.onMove) {
          if (isMultiMove(selectedPaths, source.path)) {
            const sources = files.filter(
              i => selectedPaths.indexOf(i.path) !== -1
            )
            props.onMove(sources, node)
          } else {
            props.onMove([source], node)
          }
        }
      },
      onFilesDrop: (files, dataTransfer) => {
        // native files can also be dropped on file nodes! not only dirs
        // drop on file means "upload to current directory"
        console.log(dataTransfer)
      }
    } as AdditionalRowRenderProps<T>
  }

  const tableProps: TableProps<T> = {
    tableLayout: 'auto',
    className: 'file-manager-table',
    data: files,
    columns,
    rowKey: 'path',
    components: {
      body: {
        row: FileManagerRow
      }
    },
    onRow: getAdditionalRowProps
  }
  const tableRenderer = props.renderTable || defaultTableRenderer
  const dragLayerRenderer =
    props.dragLayerRenderer || defaultCustomDragLayerRenderer
  return (
    <div>
      <DndProvider backend={HTML5Backend}>
        <CustomDragLayer
          selectedPaths={selectedPaths}
          renderer={dragLayerRenderer}
        />
        {tableRenderer(tableProps)}
      </DndProvider>
    </div>
  )
}

export default FileManager
