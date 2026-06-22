'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Folder, 
  FolderOpen, 
  Plus, 
  Edit, 
  Trash2, 
  ChevronRight, 
  ChevronDown,
  AlertCircle,
  CheckCircle
} from 'lucide-react'

interface CloudinaryFolder {
  name: string
  path: string
  subfolders?: CloudinaryFolder[]
}

interface FolderManagerProps {
  selectedFolder?: string
  onFolderSelect: (path: string) => void
}

export default function FolderManager({ selectedFolder, onFolderSelect }: FolderManagerProps) {
  const [folders, setFolders] = useState<CloudinaryFolder[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set())
  
  // Dialog states
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [renameDialogOpen, setRenameDialogOpen] = useState(false)
  const [newFolderName, setNewFolderName] = useState('')
  const [newFolderParent, setNewFolderParent] = useState('')
  const [renamingFolder, setRenamingFolder] = useState<string>('')

  useEffect(() => {
    loadFolders()
  }, [])

  const loadFolders = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/images/folders')
      if (!response.ok) throw new Error('Failed to fetch folders')
      
      const data = await response.json()
      
      // API trả về { success: true, data: { folders: [...] } }
      const folderList = data.data?.folders || data.folders || []
      setFolders(folderList)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load folders')
    } finally {
      setLoading(false)
    }
  }

  const createFolder = async () => {
    if (!newFolderName.trim()) return

    const folderPath = newFolderParent 
      ? `${newFolderParent}/${newFolderName.trim()}`
      : newFolderName.trim()

    try {
      const response = await fetch('/api/images/folders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ folderPath: folderPath })
      })

      if (!response.ok) throw new Error('Failed to create folder')

      setSuccess('Folder created successfully!')
      setCreateDialogOpen(false)
      setNewFolderName('')
      setNewFolderParent('')
      loadFolders()
      
      setTimeout(() => setSuccess(null), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create folder')
    }
  }

  const renameFolder = async () => {
    if (!newFolderName.trim() || !renamingFolder) return

    try {
      const response = await fetch('/api/images/folders', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          oldPath: renamingFolder, 
          newPath: newFolderName.trim() 
        })
      })

      if (!response.ok) throw new Error('Failed to rename folder')

      setSuccess('Folder renamed successfully!')
      setRenameDialogOpen(false)
      setNewFolderName('')
      setRenamingFolder('')
      loadFolders()
      
      setTimeout(() => setSuccess(null), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to rename folder')
    }
  }

  const deleteFolder = async (folderPath: string) => {
    if (!confirm(`Are you sure you want to delete folder "${folderPath}"? This action cannot be undone.`)) {
      return
    }

    try {
      const response = await fetch('/api/images/folders', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path: folderPath })
      })

      if (!response.ok) throw new Error('Failed to delete folder')

      setSuccess('Folder deleted successfully!')
      loadFolders()
      
      // If deleted folder was selected, reset selection
      if (selectedFolder === folderPath) {
        onFolderSelect('')
      }
      
      setTimeout(() => setSuccess(null), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete folder')
    }
  }

  const toggleExpanded = (folderPath: string) => {
    const newExpanded = new Set(expandedFolders)
    if (newExpanded.has(folderPath)) {
      newExpanded.delete(folderPath)
    } else {
      newExpanded.add(folderPath)
    }
    setExpandedFolders(newExpanded)
  }

  const renderFolder = (folder: CloudinaryFolder, level: number = 0) => {
    const isExpanded = expandedFolders.has(folder.path)
    const isSelected = selectedFolder === folder.path
    const hasSubfolders = folder.subfolders && folder.subfolders.length > 0

    return (
      <div key={folder.path} className="select-none">
        <div 
          className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer hover:bg-gray-50 ${
            isSelected ? 'bg-blue-50 border border-blue-200' : ''
          }`}
          style={{ paddingLeft: `${12 + level * 20}px` }}
        >
          {hasSubfolders && (
            <Button
              variant="ghost"
              size="sm"
              className="p-0 h-4 w-4"
              onClick={(e) => {
                e.stopPropagation()
                toggleExpanded(folder.path)
              }}
            >
              {isExpanded ? (
                <ChevronDown className="h-3 w-3" />
              ) : (
                <ChevronRight className="h-3 w-3" />
              )}
            </Button>
          )}
          
          <div 
            className="flex items-center gap-2 flex-1 min-w-0"
            onClick={() => onFolderSelect(folder.path)}
          >
            {isExpanded ? (
              <FolderOpen className="h-4 w-4 text-blue-500 flex-shrink-0" />
            ) : (
              <Folder className="h-4 w-4 text-gray-500 flex-shrink-0" />
            )}
            
            <span className="text-sm truncate">{folder.name}</span>
            
            {isSelected && (
              <Badge variant="secondary" className="ml-auto text-xs">
                Selected
              </Badge>
            )}
          </div>

          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100">
            <Button
              variant="ghost"
              size="sm"
              className="p-1 h-6 w-6"
              onClick={(e) => {
                e.stopPropagation()
                setRenamingFolder(folder.path)
                setNewFolderName(folder.name)
                setRenameDialogOpen(true)
              }}
            >
              <Edit className="h-3 w-3" />
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              className="p-1 h-6 w-6 text-red-500 hover:text-red-700"
              onClick={(e) => {
                e.stopPropagation()
                deleteFolder(folder.path)
              }}
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        </div>

        {isExpanded && hasSubfolders && (
          <div>
            {folder.subfolders!.map(subfolder => 
              renderFolder(subfolder, level + 1)
            )}
          </div>
        )}
      </div>
    )
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="flex items-center gap-2 text-base min-w-0">
            <Folder className="h-4 w-4 flex-shrink-0" />
            <span className="truncate">Folders</span>
          </CardTitle>
          
          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="flex items-center gap-1 text-xs px-2 py-1 flex-shrink-0">
                <Plus className="h-3 w-3" />
                <span>New</span>
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Folder</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="parent-folder">Parent Folder (optional)</Label>
                  <Input
                    id="parent-folder"
                    value={newFolderParent}
                    onChange={(e) => setNewFolderParent(e.target.value)}
                    placeholder="e.g., projects/2024"
                  />
                </div>
                <div>
                  <Label htmlFor="folder-name">Folder Name</Label>
                  <Input
                    id="folder-name"
                    value={newFolderName}
                    onChange={(e) => setNewFolderName(e.target.value)}
                    placeholder="Enter folder name"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') createFolder()
                    }}
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={createFolder} disabled={!newFolderName.trim()}>
                    Create Folder
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      
      <CardContent>
        {error && (
          <Alert className="mb-4" variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="mb-4">
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}

        {loading ? (
          <div className="text-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mx-auto"></div>
            <p className="text-sm text-gray-500 mt-2">Loading folders...</p>
          </div>
        ) : (
          <div className="space-y-1">
            {/* All Images option */}
            <div 
              className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer hover:bg-gray-50 ${
                selectedFolder === '' ? 'bg-blue-50 border border-blue-200' : ''
              }`}
              onClick={() => onFolderSelect('')}
            >
              <Folder className="h-4 w-4 text-gray-500" />
              <span className="text-sm">All Images</span>
              {selectedFolder === '' && (
                <Badge variant="secondary" className="ml-auto text-xs">
                  Selected
                </Badge>
              )}
            </div>

            {loading ? (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mx-auto"></div>
                <p className="text-sm text-gray-500 mt-2">Loading folders...</p>
              </div>
            ) : folders.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-4">
                No folders found. Create your first folder to organize images.
              </p>
            ) : (
              <div className="space-y-1">
                <div className="text-xs text-gray-400 px-2 py-1">
                  {folders.length} folder{folders.length !== 1 ? 's' : ''} found
                </div>
                <div className="group">
                  {folders.map(folder => renderFolder(folder))}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>

      {/* Rename Dialog */}
      <Dialog open={renameDialogOpen} onOpenChange={setRenameDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename Folder</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="rename-folder">New Folder Name</Label>
              <Input
                id="rename-folder"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                placeholder="Enter new folder name"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') renameFolder()
                }}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setRenameDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={renameFolder} disabled={!newFolderName.trim()}>
                Rename
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  )
}