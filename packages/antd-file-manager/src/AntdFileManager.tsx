import React from 'react'
import FileManager, {
  FileManagerNode,
  FileManagerRenderComponent
} from '@codefreak/react-file-manager'
import { AntdFileManagerProps } from './interfaces'
import AntdTableRenderer from './AntdTableRenderer'
import { AntdDragLayer } from './index'

const getAntdRendererByName = <T extends FileManagerNode>(
  name: 'table'
): FileManagerRenderComponent<T> => {
  if (name === 'table') {
    return AntdTableRenderer
  }
  throw `Unknown renderer ${name}`
}

const AntdFileManager = <T extends FileManagerNode>(
  props: AntdFileManagerProps<T>
) => {
  const { renderType = 'table' } = props
  const RenderType = getAntdRendererByName<T>(renderType)
  return (
    <FileManager
      renderer={RenderType}
      customDragLayer={{
        component: AntdDragLayer,
        scrollingElement: { current: document.scrollingElement }
      }}
      {...props}
    />
  )
}

export default AntdFileManager
