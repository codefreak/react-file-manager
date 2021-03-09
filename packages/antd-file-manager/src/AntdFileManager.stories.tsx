import { FileManagerProps } from './index'
import * as React from 'react'
import { Meta, Story } from '@storybook/react'

import 'antd/dist/antd.css'
import { FileManagerNode } from '@codefreak/react-file-manager/dist/interfaces'
import { useEffect, useState } from 'react'
import AntdFileManager from './AntdFileManager'

const loadKernelFiles = () =>
  fetch(
    'https://api.github.com/repos/torvalds/linux/git/trees/master'
  ).then(response => response.json())

const Template: Story<FileManagerProps<FileManagerNode>> = props => {
  const {
    onDropFiles: originalOnDropFiles,
    data: initialFiles,
    ...restProps
  } = props
  const [files, setFiles] = useState(initialFiles || [])

  useEffect(() => {
    loadKernelFiles().then(ghKernelFiles => {
      const newFiles = ghKernelFiles.tree.map((ghFile: any) => ({
        path: ghFile.path,
        type: ghFile.type === 'tree' ? 'directory' : 'file'
      }))
      setFiles(newFiles)
    })
  }, [])

  const onDropFiles: typeof originalOnDropFiles = (
    newFiles,
    dataTransfer,
    target
  ) => {
    if (target === undefined) {
      const addFiles = newFiles.map(
        (file): FileManagerNode => ({
          path: file.name,
          type: 'file'
        })
      )
      setFiles([...addFiles, ...files])
    }
    if (originalOnDropFiles) {
      originalOnDropFiles(newFiles, dataTransfer, target)
    }
  }
  return (
    <AntdFileManager data={files} onDropFiles={onDropFiles} {...restProps} />
  )
}

export const Default = Template.bind({})
Default.args = {
  data: []
}
Default.argTypes = {
  onDrop: { action: 'dropped row(s)' },
  onDropFiles: { action: 'dropped file(s)' }
}

export default {
  title: 'AntdFileManager'
} as Meta
