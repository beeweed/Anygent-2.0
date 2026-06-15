export type FileNode = {
  name: string
  path: string
  nodeType: 'file' | 'directory'
  size?: number | null
  children: FileNode[]
}
