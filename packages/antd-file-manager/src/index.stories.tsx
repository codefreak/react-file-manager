import * as React from 'react'
import { Meta, Story } from '@storybook/react'
import { useCallback, useState } from 'react'
import AntdFileManagerTable, {
  AntdFileManagerProps,
  AntdDragLayer
} from './index'
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import sampleTableData, { DummyNode } from './data.example'

import 'antd/dist/antd.css'
import { MultiSelectionProvider } from '@codefreak/react-file-manager'

const AntdFileManager: Story<AntdFileManagerProps<DummyNode>> = props => {
  const {
    onDropFiles: originalOnDropFiles,
    onRename: originalOnRename,
    onDelete: originalOnDelete,
    data: initialFiles,
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

  const onDropFiles: typeof originalOnDropFiles = (
    newFiles,
    dataTransfer,
    target
  ) => {
    if (target === undefined) {
      const addFiles = newFiles.map(
        (file): DummyNode => ({
          path: file.name,
          type: 'file',
          mode: '100777',
          size: file.size
        })
      )
      setFiles([...addFiles, ...files])
    }
    if (originalOnDropFiles) {
      originalOnDropFiles(newFiles, dataTransfer, target)
    }
  }
  return (
    <AntdFileManagerTable
      {...restProps}
      data={files}
      onDelete={onDelete}
      onDropFiles={onDropFiles}
      onRename={onRename}
    />
  )
}

export const Basic = AntdFileManager.bind({})
Basic.args = {
  data: sampleTableData,
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
}
Basic.argTypes = {
  onDrop: { action: 'onDrop' },
  onDropFiles: { action: 'onDropFiles' },
  onRename: { action: 'onRename' },
  onDelete: { action: 'onDelete' },
  onClickRow: { action: 'onClickRow' },
  onDoubleClickRow: { action: 'onDoubleClickRow' },
  onRowSelectionChange: { action: 'onRowSelectionChange' }
}

export const AntdCustomDragLayer = () => {
  const [selectedNodes, setSelectedNodes] = useState<DummyNode[]>([])
  return (
    <MultiSelectionProvider value={selectedNodes}>
      <AntdDragLayer
        scrollingElement={{ current: document.scrollingElement }}
      />
      <AntdFileManagerTable
        onRowSelectionChange={setSelectedNodes}
        hideNativeDragPreview
        data={sampleTableData}
      />
    </MultiSelectionProvider>
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
