import AntdFileManager, { FileManagerProps } from './index'
import * as React from 'react'
import { Meta, Story } from '@storybook/react'

import 'antd/dist/antd.css'
import { FileManagerNode } from '@codefreak/react-file-manager/dist/interfaces'

const Template: Story<FileManagerProps<FileManagerNode>> = props => (
  <AntdFileManager {...props} />
)

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

export const Default = Template.bind({})
Default.args = {
  files: exampleFiles
}
Default.argTypes = {
  onMove: { action: 'moved' },
  onClick: { action: 'clicked' },
  onDoubleClick: { action: 'double clicked' }
}

export default {
  title: 'AntDesignFileManager'
} as Meta
