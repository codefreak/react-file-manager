import FileManager, {
  FileManagerDragLayerRenderer,
  FileManagerNode,
  FileManagerProps,
  TableProps
} from '@codefreak/react-file-manager'
import React, { useState } from 'react'
import { Badge, Table } from 'antd'
import { FileTextFilled, FolderFilled } from '@ant-design/icons'
import { ColumnsType } from 'rc-table/es/interface'

export * from '@codefreak/react-file-manager'

const antdDragLayerRenderer: FileManagerDragLayerRenderer = (x, y, items) => {
  let dragContent = <FileTextFilled style={{ fontSize: '1.5em' }} />
  // wrap in badge if multiple items are dragged
  if (items.length > 1) {
    dragContent = (
      <Badge count={items.length} size="small">
        {dragContent}
      </Badge>
    )
  }
  return (
    <div
      style={{
        position: 'absolute',
        left: 0,
        top: 0,
        transform: `translate(${x}px, ${y}px)`,
        zIndex: 999,
        pointerEvents: 'none'
      }}
    >
      {dragContent}
    </div>
  )
}

const antdIconRenderer = <T extends FileManagerNode>(node: T) => {
  if (node.type === 'directory') {
    return <FolderFilled style={{ fontSize: '1.5em' }} />
  }
  return <FileTextFilled style={{ fontSize: '1.5em' }} />
}

type Writeable<T> = { -readonly [P in keyof T]: T[P] }

const AntdFileManager = <T extends FileManagerNode>(
  props: FileManagerProps<T>
): React.ReactElement => {
  const [selectedRows, setSelectedRows] = useState<string[]>([])

  const onClick = (node: T) => {
    const index = selectedRows.indexOf(node.path)
    if (index === -1) {
      setSelectedRows([...selectedRows, node.path])
    } else {
      const newSelectedRows = selectedRows.filter(p => p !== node.path)
      setSelectedRows(newSelectedRows)
    }
    if (props.onClick) {
      props.onClick(node)
    }
  }

  const renderAntdTable = (props: TableProps<T>) => {
    const { data, columns, ...restProps } = props
    return (
      <Table
        rowSelection={{
          type: 'checkbox',
          selectedRowKeys: selectedRows,
          onChange: selectedRowKeys => {
            setSelectedRows(selectedRowKeys.map(t => t.toString()))
          }
        }}
        dataSource={data}
        columns={columns as Writeable<ColumnsType<T>>}
        {...restProps}
        pagination={false}
      />
    )
  }

  return (
    <FileManager
      {...props}
      selectedPaths={selectedRows}
      renderTable={renderAntdTable}
      renderIcon={antdIconRenderer}
      dragLayerRenderer={antdDragLayerRenderer}
      onClick={onClick}
    />
  )
}

export default AntdFileManager
