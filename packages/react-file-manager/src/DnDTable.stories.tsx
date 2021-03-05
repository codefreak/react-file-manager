import * as React from 'react'
import { Meta, Story } from '@storybook/react'
import { DnDTableProps } from './interfaces'
import DnDTable from './DnDTable'
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'

interface ExampleTableElement {
  title: string
}

const Template: Story<DnDTableProps<ExampleTableElement>> = props => (
  <DndProvider backend={HTML5Backend}>
    <DnDTable {...props} />
  </DndProvider>
)

export const Default = Template.bind({})
Default.args = {
  tableLayout: 'auto',
  rowKey: 'title',
  data: new Array(20).fill(0).map((_, index) => ({
    title: `Row ${index + 1}`
  })),
  columns: [
    {
      key: 'title',
      title: 'Title',
      dataIndex: 'title'
    }
  ],
  canDropNode: () => true,
  canDropFiles: () => true
}

Default.argTypes = {
  onDrop: {},
  onFilesDrop: {}
}

export default {
  title: 'DnDTable'
} as Meta
