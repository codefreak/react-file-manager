import * as React from 'react'
import { Meta, Story } from '@storybook/react'
import 'antd/dist/antd.css'
import { FileManagerNode } from '@codefreak/react-file-manager/dist/interfaces'
import { useCallback, useEffect, useState } from 'react'
import AntdFileManager, { AntdFileManagerProps } from './index'

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
    <AntdFileManager
      {...restProps}
      data={files}
      onDropFiles={onDropFiles}
      onRename={onRename}
    />
  )
}

export const Default = Template.bind({})
Default.args = {
  data: [],
  additionalColumns: [
    {
      dataIndex: 'size',
      title: 'Size',
      render: (value: number) => (value !== undefined ? `${value} bytes` : '--')
    },
    {
      dataIndex: 'mode',
      title: 'Mode',
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
  onDrop: { action: 'dropped row(s)' },
  onDropFiles: { action: 'dropped file(s)' },
  onRename: { action: 'renamed node' },
  onDelete: { action: 'delete node(s)' }
}

export default {
  title: 'AntdFileManager'
} as Meta
