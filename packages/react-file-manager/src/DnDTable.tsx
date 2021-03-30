import {
  DnDRowRenderProps,
  DnDTableProps,
  DnDTableRowItem,
  DnDTableRowType,
  DropItemOrFile
} from './interfaces'
import React, { PropsWithChildren, useEffect, useRef } from 'react'
import { useDrag, useDrop } from 'react-dnd'
import { getEmptyImage, NativeTypes } from 'react-dnd-html5-backend'
import { DefaultRecordType } from 'rc-table/es/interface'
import { isFileDrop } from './utils'
import { defaultTableRenderer } from './defaults'

const DnDTableRow = <T extends DefaultRecordType>(
  props: PropsWithChildren<DnDRowRenderProps<T>>
) => {
  const {
    node,
    canDropNode,
    onNodeDrop,
    canDropFiles,
    onFilesDrop,
    onRowDragStart,
    onRowDragOver,
    onRowDragEnd,
    ...restProps
  } = props
  const ref = useRef<HTMLTableRowElement>(null)
  const [, drop] = useDrop<DropItemOrFile<T>, unknown, unknown>({
    accept: [DnDTableRowType, NativeTypes.FILE],
    drop: item => {
      if (isFileDrop(item)) {
        onFilesDrop(item.files, item.items)
      } else {
        onNodeDrop(item.node)
      }
    },
    canDrop: (item: DropItemOrFile<T>) => {
      if (isFileDrop(item)) {
        return canDropFiles(item.items)
      } else {
        return canDropNode(item.node)
      }
    },
    hover: (draggedItem, monitor) =>
      onRowDragOver(draggedItem, monitor.canDrop())
  })
  const [, drag, preview] = useDrag<DnDTableRowItem<T>, unknown, unknown>({
    item: {
      type: DnDTableRowType,
      node
    },
    begin: () => onRowDragStart(),
    end: () => onRowDragEnd()
  })
  drag(drop(ref))
  useEffect(() => {
    // hide default drag preview
    preview(getEmptyImage(), { captureDraggingState: true })
  }, [])
  return <tr ref={ref} {...restProps} />
}

const DnDTable = <T extends DefaultRecordType>(
  props: DnDTableProps<T>
): React.ReactElement => {
  const getAdditionalRowProps = (
    node: T,
    index?: number
  ): DnDRowRenderProps<T> => {
    let rowProps: DnDRowRenderProps<T> = {
      node,
      canDropNode: source => props.canDropNode(source, node),
      onNodeDrop: source => props.onDrop(source, node),
      canDropFiles: files => {
        if (!props.canDropFiles) return false
        return props.canDropFiles(files, node)
      },
      onFilesDrop: (files, dataTransfer) => {
        if (!props.onFilesDrop) return
        props.onFilesDrop(files, dataTransfer, node)
      },
      onRowDragStart: () => {
        props.onRowDragStart?.(node)
      },
      onRowDragOver: (draggedItem, canDrop) => {
        props.onRowDragOver?.(draggedItem, node, canDrop)
      },
      onRowDragEnd: () => {
        props.onRowDragEnd?.(node)
      }
    }

    if (props.onRow) {
      rowProps = {
        ...rowProps,
        ...props.onRow(node, index)
      }
    }

    return rowProps
  }

  const renderTable = props.renderTable || defaultTableRenderer
  return renderTable({
    ...props,
    components: {
      body: {
        row: DnDTableRow
      }
    },
    onRow: getAdditionalRowProps
  })
}

export default DnDTable
