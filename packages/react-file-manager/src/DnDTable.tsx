import {
  DnDRowRenderProps,
  DnDTableProps,
  DnDTableRowItem,
  DnDTableRowType,
  DropItemOrFile,
  TableProps
} from './interfaces'
import React, { PropsWithChildren, useEffect, useRef } from 'react'
import { useDrag, useDrop } from 'react-dnd'
import { getEmptyImage, NativeTypes } from 'react-dnd-html5-backend'
import Table from 'rc-table'
import { DefaultRecordType } from 'rc-table/es/interface'
import { isFileDrop } from './utils'

const DnDTableRow = <T extends DefaultRecordType>(
  props: PropsWithChildren<DnDRowRenderProps<T>>
) => {
  const {
    node,
    canDropNode,
    onNodeDrop,
    canDropFiles,
    onFilesDrop,
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
    }
  })
  const [, drag, preview] = useDrag<DnDTableRowItem<T>, unknown, unknown>({
    item: {
      type: DnDTableRowType,
      node
    }
  })
  drag(drop(ref))
  useEffect(() => {
    // hide default drag preview
    preview(getEmptyImage(), { captureDraggingState: true })
  }, [])
  return <tr ref={ref} {...restProps} />
}

const DnDTable = <T extends DefaultRecordType>(props: DnDTableProps<T>) => {
  const getAdditionalRowProps = (node: T): DnDRowRenderProps<T> => {
    return {
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
      }
    }
  }

  const tableProps: TableProps<T> = {
    ...props,
    components: {
      body: {
        row: DnDTableRow
      }
    },
    onRow: getAdditionalRowProps
  }

  const TableElement: React.ElementType<TableProps<T>> =
    props.tableElement || Table
  return <TableElement {...tableProps} />
}

export default DnDTable
