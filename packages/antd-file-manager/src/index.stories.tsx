import AntdFileManager, { FileManagerProps } from './index'
import * as React from 'react'
import { Meta, Story } from '@storybook/react'

import 'antd/dist/antd.css'
import { FileManagerNode } from '@codefreak/react-file-manager/dist/interfaces'
import { useState } from 'react'

const exampleFiles: FileManagerNode[] = [
  {
    path: 'moin1.txt',
    type: 'file'
  },
  {
    path: 'moin2.txt',
    type: 'file'
  },
  {
    path: 'dir',
    type: 'directory'
  }
]

const Template: Story<FileManagerProps<FileManagerNode>> = props => {
  const { onFilesDrop, files: initialFiles, ...restProps } = props
  const [files, setFiles] = useState(initialFiles)
  const onDrop: typeof onFilesDrop = (newFiles, dataTransfer, target) => {
    if (target === undefined) {
      const addFiles = newFiles.map(
        (file): FileManagerNode => ({
          path: file.name,
          type: 'file'
        })
      )
      setFiles([...addFiles, ...files])
    }
    if (onFilesDrop) {
      onFilesDrop(newFiles, dataTransfer, target)
    }
  }
  return <AntdFileManager files={files} onFilesDrop={onDrop} {...restProps} />
}

export const Default = Template.bind({})
Default.args = {
  files: exampleFiles
}
Default.argTypes = {
  onMove: {},
  onClick: {},
  onDoubleClick: {},
  onFilesDrop: {}
}

export default {
  title: 'AntDesignFileManager'
} as Meta
