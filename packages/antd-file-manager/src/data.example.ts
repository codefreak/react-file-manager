import { AntdFileManagerNode } from './interfaces'

export interface DummyNode extends AntdFileManagerNode {
  size?: number
  mode: string
}

/**
 * These are the files from Linux' kernel repo taken on April 2021.
 */
const dummyData = [
  { path: '.clang-format', type: 'file', size: 16757, mode: '100644' },
  { path: '.cocciconfig', type: 'file', size: 59, mode: '100644' },
  { path: '.get_maintainer.ignore', type: 'file', size: 71, mode: '100644' },
  { path: '.gitattributes', type: 'file', size: 62, mode: '100644' },
  { path: '.gitignore', type: 'file', size: 1910, mode: '100644' },
  { path: '.mailmap', type: 'file', size: 19598, mode: '100644' },
  { path: 'COPYING', type: 'file', size: 496, mode: '100644' },
  { path: 'CREDITS', type: 'file', size: 100629, mode: '100644' },
  { path: 'Documentation', type: 'directory', mode: '040000' },
  { path: 'Kbuild', type: 'file', size: 1327, mode: '100644' },
  { path: 'Kconfig', type: 'file', size: 555, mode: '100644' },
  { path: 'LICENSES', type: 'directory', mode: '040000' },
  { path: 'MAINTAINERS', type: 'file', size: 591724, mode: '100644' },
  { path: 'Makefile', type: 'file', size: 66247, mode: '100644' },
  { path: 'README', type: 'file', size: 727, mode: '100644' },
  { path: 'arch', type: 'directory', mode: '040000' },
  { path: 'block', type: 'directory', mode: '040000' },
  { path: 'certs', type: 'directory', mode: '040000' },
  { path: 'crypto', type: 'directory', mode: '040000' },
  { path: 'drivers', type: 'directory', mode: '040000' },
  { path: 'fs', type: 'directory', mode: '040000' },
  { path: 'include', type: 'directory', mode: '040000' },
  { path: 'init', type: 'directory', mode: '040000' },
  { path: 'ipc', type: 'directory', mode: '040000' },
  { path: 'kernel', type: 'directory', mode: '040000' },
  { path: 'lib', type: 'directory', mode: '040000' },
  { path: 'mm', type: 'directory', mode: '040000' },
  { path: 'net', type: 'directory', mode: '040000' },
  { path: 'samples', type: 'directory', mode: '040000' },
  { path: 'scripts', type: 'directory', mode: '040000' },
  { path: 'security', type: 'directory', mode: '040000' },
  { path: 'sound', type: 'directory', mode: '040000' },
  { path: 'tools', type: 'directory', mode: '040000' },
  { path: 'usr', type: 'directory', mode: '040000' },
  { path: 'virt', type: 'directory', mode: '040000' }
]

export default dummyData.map(dummyNode => ({
  basename: dummyNode.path,
  ...dummyNode
})) as DummyNode[]
