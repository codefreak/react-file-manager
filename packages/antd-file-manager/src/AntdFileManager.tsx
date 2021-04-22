import React from 'react'
import FileManager, { FileManagerNode } from '@codefreak/react-file-manager'
import { AntdFileManagerProps } from './interfaces'
import AntdTableRenderer from './AntdTableRenderer'

const getAntdRendererByName = <T extends FileManagerNode>(name: 'table') => {
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
  return <FileManager {...props} renderer={RenderType} />
}

export default AntdFileManager
