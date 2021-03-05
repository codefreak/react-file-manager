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
  onDrop: { action: 'dropped row(s)' },
  onDropFiles: { action: 'dropped file(s)' }
}

export default {
  title: 'FileManager'
} as Meta
