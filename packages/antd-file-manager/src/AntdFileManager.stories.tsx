import * as React from 'react'
import { Meta, Story } from '@storybook/react'
import { useCallback, useState } from 'react'
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import AntdFileManager, { AntdFileManagerProps, AntdDragLayer } from './index'
import sampleTableData, { DummyNode } from './data.example'

import 'antd/dist/antd.css'

const getNonDirItems = (items: DataTransferItemList): DataTransferItem[] => {
  const nonDirItems = []
  for (let i = 0; i < items.length; i++) {
    const entry = items[i].webkitGetAsEntry()
    // looks like entry is null while we are still dragging so we cannot say
    // 100% if entry is a dir or not
    if (entry === null || entry.isFile) {
      nonDirItems.push(items[i])
    }
  }
  return nonDirItems
}

const AntdFileManagerStory: Story<AntdFileManagerProps<DummyNode>> = (
  props
) => {
  const {
    onDropFiles: originalOnDropFiles,
    onRenameItem: originalOnRename,
    onDeleteItems: originalOnDelete,
    dataSource: initialFiles,
    ...restProps
  } = props
  const [files, setFiles] = useState(initialFiles || [])

  const onRename = useCallback(
    (node: DummyNode, newName: string) => {
      setFiles(
        files.map(({ path, ...other }) => {
          if (path === node.path) {
            return {
              path: newName,
              ...other
            }
          }
          return { path, ...other }
        })
      )
      originalOnRename?.(node, newName)
    },
    [files, setFiles, originalOnRename]
  )

  const onDelete = useCallback(
    (nodes: DummyNode[]) => {
      setFiles(files.filter((file) => !nodes.includes(file)))
      originalOnDelete?.(nodes)
    },
    [files, setFiles, originalOnDelete]
  )

  const onDropFiles: typeof originalOnDropFiles = (dataTransfer, target) => {
    if (target === undefined) {
      const addFiles: DummyNode[] = getNonDirItems(dataTransfer)
        .map((item) => item.getAsFile())
        .filter((item): item is File => item !== null)
        .map((file) => ({
          path: file.name,
          basename: file.name,
          type: 'file',
          mode: '100777',
          size: file.size
        }))
      setFiles([...addFiles, ...files])
    }
    if (originalOnDropFiles) {
      originalOnDropFiles(dataTransfer, target)
    }
  }
  return (
    <AntdFileManager
      {...restProps}
      dataSource={files}
      onDeleteItems={onDelete}
      onDropFiles={onDropFiles}
      onRenameItem={onRename}
    />
  )
}

export const Basic = AntdFileManagerStory.bind({})
Basic.args = {
  dataSource: sampleTableData,
  dataKey: 'path',
  canDropFiles: (items, target) => {
    if (target !== undefined && target.type !== 'directory') return false
    return getNonDirItems(items).length > 0
  },
  itemDndStatusProps: {
    invalidDropTargetProps: {
      style: {
        opacity: 0.3
      }
    },
    validDropTargetOverProps: {
      style: {
        position: 'relative',
        zIndex: 1,
        outline: '5px solid rgba(0, 255, 0, .3)'
      }
    }
  },
  rootDndStatusProps: {
    validDropTargetOverProps: {
      style: {
        position: 'relative',
        zIndex: 1,
        outline: '5px solid rgba(0, 255, 0, .3)'
      }
    }
  },
  additionalColumns: [
    {
      dataIndex: 'size',
      title: 'Size',
      width: '10%',
      render: (value: number) => (value !== undefined ? `${value} bytes` : '--')
    },
    {
      dataIndex: 'mode',
      title: 'Mode',
      width: '10%',
      render: (value: string) => {
        const mode = parseInt(value, 8)
        return (
          'rwxrwxrwx'
            .split('')
            // check if bit is set at position i and if not replace with dash
            .map((l, i) => ((1 << (8 - i)) & mode ? l : '-'))
            .join('')
        )
      }
    }
  ]
} as Partial<AntdFileManagerProps<DummyNode>>

Basic.argTypes = {
  onDropItems: { action: 'onDropItems' },
  onDropFiles: { action: 'onDropFiles' },
  onRenameItem: { action: 'onRenameItem' },
  onDeleteItems: { action: 'onDeleteItems' },
  onClickItem: { action: 'onClickItem' },
  onDoubleClickItem: { action: 'onDoubleClickItem' },
  onRowSelectionChange: { action: 'onRowSelectionChange' }
}

export const AntdCustomDragLayer = () => (
  <>
    <AntdDragLayer />
    <AntdFileManager
      dataSource={sampleTableData}
      dataKey="path"
      hideNativeDragPreview
    />
  </>
)

export default {
  title: 'AntD File Manager',
  decorators: [
    (InnerStory) => (
      <DndProvider backend={HTML5Backend}>
        <InnerStory />
      </DndProvider>
    )
  ]
} as Meta
