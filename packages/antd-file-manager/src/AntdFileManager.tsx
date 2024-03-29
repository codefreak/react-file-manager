import React, { ReactElement } from 'react'
import FileManager, {
  FileManagerRenderComponent
} from '@codefreak/react-file-manager'
import { AntdFileManagerNode, AntdFileManagerProps } from './interfaces'
import AntdTableRenderer from './AntdTableRenderer'

const getAntdRendererByName = <T extends AntdFileManagerNode>(
  name: 'table'
): FileManagerRenderComponent<T> => {
  if (name === 'table') {
    return AntdTableRenderer
  }
  throw TypeError(`Unknown renderer ${name}`)
}

const AntdFileManager = <T extends AntdFileManagerNode>(
  props: AntdFileManagerProps<T>
): ReactElement => {
  const { renderType = 'table' } = props
  const RenderType = getAntdRendererByName<T>(renderType)
  return <FileManager {...props} renderer={RenderType} />
}

export default AntdFileManager
