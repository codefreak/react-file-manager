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
  const {
    onDropFiles: originalOnDropFiles,
    data: initialFiles,
    ...restProps
  } = props
  const [files, setFiles] = useState(initialFiles || [])
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
  data: exampleFiles
}
Default.argTypes = {
  onDrop: { action: 'dropped row(s)' },
  onDropFiles: { action: 'dropped file(s)' }
}

export default {
  title: 'AntDesignFileManager'
} as Meta
