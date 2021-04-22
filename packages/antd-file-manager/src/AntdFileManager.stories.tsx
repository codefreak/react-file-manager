import * as React from 'react'
import { Meta, Story } from '@storybook/react'
import { useCallback, useState } from 'react'
import AntdFileManager, { AntdFileManagerProps, AntdDragLayer } from './index'
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import sampleTableData, { DummyNode } from './data.example'

import 'antd/dist/antd.css'

const AntdFileManagerStory: Story<AntdFileManagerProps<DummyNode>> = props => {
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
      setFiles(files.filter(file => !nodes.includes(file)))
      originalOnDelete?.(nodes)
    },
    [files, setFiles, originalOnDelete]
  )

  const onDropFiles: typeof originalOnDropFiles = (dataTransfer, target) => {
    if (target === undefined) {
      const addFiles: DummyNode[] = []
      for (let i = 0; i < dataTransfer.length; i++) {
        const file = dataTransfer[i].getAsFile()
        if (!file) continue
        addFiles.push({
          path: file.name,
          type: 'file',
          mode: '100777',
          size: file.size
        })
      }
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
  canDropFiles: (_, target) => {
    return target.type === 'directory'
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

export const AntdCustomDragLayer = () => {
  const [selectedNodes, setSelectedNodes] = useState<DummyNode[]>([])
  return (
    <>
      <AntdDragLayer
        scrollingElement={{ current: document.scrollingElement }}
      />
      <AntdFileManager
        dataSource={sampleTableData}
        dataKey="path"
        onSelectionChange={setSelectedNodes}
      />
    </>
  )
}

export default {
  title: 'AntD File Manager',
  decorators: [
    Story => (
      <DndProvider backend={HTML5Backend}>
        <Story />
      </DndProvider>
    )
  ]
} as Meta
