import FileManagerTable from './FileManagerTable'
import * as React from 'react'
import { Meta, Story } from '@storybook/react'
import { FileManagerNode, FileManagerProps } from './interfaces'
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'

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
  <DndProvider backend={HTML5Backend}>
    <FileManagerTable {...props} />
  </DndProvider>
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
  title: 'FileManagerTable'
} as Meta
