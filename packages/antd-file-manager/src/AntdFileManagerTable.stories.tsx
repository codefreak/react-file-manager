import * as React from 'react'
import { Meta, Story } from '@storybook/react'
import 'antd/dist/antd.css'
import { FileManagerNode } from '@codefreak/react-file-manager/dist/interfaces'
import { useCallback, useEffect, useState } from 'react'
import AntdFileManagerTable, { AntdFileManagerProps } from './index'
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'

interface DummyNode extends FileManagerNode {
  size?: number
  mode: string
}

interface GitHubTreeElement {
  path: string
  type: 'tree'
  size: number
  mode: string
}

const loadKernelFiles = (): Promise<DummyNode[]> =>
  fetch('https://api.github.com/repos/torvalds/linux/git/trees/master')
    .then(response => response.json())
    .then(ghKernelFiles =>
      ghKernelFiles.tree.map((ghFile: GitHubTreeElement) => ({
        path: ghFile.path,
        type: ghFile.type === 'tree' ? 'directory' : 'file',
        size: ghFile.size || undefined,
        mode: ghFile.mode
      }))
    )

const Template: Story<AntdFileManagerProps<DummyNode>> = props => {
  const {
    onDropFiles: originalOnDropFiles,
    onRename: originalOnRename,
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
    [files, setFiles]
  )

  useEffect(() => {
    loadKernelFiles().then(ghKernelFiles => setFiles(ghKernelFiles))
  }, [setFiles])

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
    <DndProvider backend={HTML5Backend}>
      <AntdFileManagerTable
        {...restProps}
        data={files}
        onDropFiles={onDropFiles}
        onRename={onRename}
      />
    </DndProvider>
  )
}

export const Default = Template.bind({})
Default.args = {
  data: [],
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
Default.argTypes = {
  onDrop: { action: 'onDrop' },
  onDropFiles: { action: 'onDropFiles' },
  onRename: { action: 'onRename' },
  onDelete: { action: 'onDelete' },
  onClickRow: { action: 'onClickRow' },
  onDoubleClickRow: { action: 'onDoubleClickRow' },
  onRowSelectionChange: { action: 'onRowSelectionChange' }
  // the following will make the overlay pretty slow
  //  onRowDragStart: { action: 'onRowDragStart' },
  //  onRowDragOver: { action: 'onRowDragOver' },
  //  onRowDragEnd: { action: 'onRowDragEnd' }
}

export default {
  title: 'AntdFileManagerTable'
} as Meta
