import FileManager from './FileManager'
import * as React from 'react'
import { Meta, Story } from '@storybook/react'
import { FileManagerNode, FileManagerProps } from './interfaces'

const exampleFiles: FileManagerNode[] = [
  {
    path: 'moin.txt',
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

const Template: Story<FileManagerProps<FileManagerNode>> = props => (
  <FileManager {...props} />
)

export const Default = Template.bind({})
Default.args = {
  data: exampleFiles
}
Default.argTypes = {
  onDrop: { action: 'onDrop' },
  onDropFiles: { action: 'onDropFiles' },
  onRename: { action: 'onRename' },
  onDelete: { action: 'onDelete' },
  onClickRow: { action: 'onClickRow' },
  onDoubleClickRow: { action: 'onDoubleClickRow' },
  onRowDragStart: { action: 'onRowDragStart' },
  onRowDragOver: { action: 'onRowDragOver' },
  onRowDragEnd: { action: 'onRowDragEnd' }
}

export default {
  title: 'FileManager'
} as Meta
