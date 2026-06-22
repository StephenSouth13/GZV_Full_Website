"use client"

import { useState } from 'react'
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  flexRender,
  createColumnHelper,
  SortingState,
  ColumnFiltersState
} from '@tanstack/react-table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { 
  MoreHorizontal, 
  ArrowUpDown, 
  Edit3, 
  Trash2, 
  Shield, 
  ShieldCheck,
  Ban,
  CheckCircle
} from 'lucide-react'
import { EditUserModal } from './EditUserModal'
import { DeleteUserModal } from './DeleteUserModal'

interface User {
  id: number
  name: string
  email: string
  role: 'admin' | 'editor' | 'user'
  status: 'active' | 'suspended'
  joinDate: string
  lastLogin: string
  courses: number
  projects: number
}

interface UsersTableProps {
  users: User[]
  onUpdateUser: (user: User) => void
  onDeleteUser: (userId: number) => void
}

const columnHelper = createColumnHelper<User>()

export function UsersTable({ users, onUpdateUser, onDeleteUser }: UsersTableProps) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [deletingUser, setDeletingUser] = useState<User | null>(null)

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin':
        return <Badge className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">Admin</Badge>
      case 'editor':
        return <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400">Editor</Badge>
      default:
        return <Badge variant="outline">User</Badge>
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return (
          <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
            <CheckCircle className="w-3 h-3 mr-1" />
            Active
          </Badge>
        )
      case 'suspended':
        return (
          <Badge className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">
            <Ban className="w-3 h-3 mr-1" />
            Suspended
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const columns = [
    columnHelper.accessor('name', {
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="hover:bg-transparent p-0 font-medium"
        >
          Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: (info) => (
        <div className="flex flex-col">
          <span className="font-medium text-gray-900 dark:text-white">
            {info.getValue()}
          </span>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {info.row.original.email}
          </span>
        </div>
      ),
    }),

    columnHelper.accessor('role', {
      header: 'Role',
      cell: (info) => getRoleBadge(info.getValue()),
      filterFn: 'equals',
    }),

    columnHelper.accessor('status', {
      header: 'Status',
      cell: (info) => getStatusBadge(info.getValue()),
      filterFn: 'equals',
    }),

    columnHelper.accessor('joinDate', {
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="hover:bg-transparent p-0 font-medium"
        >
          Join Date
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: (info) => new Date(info.getValue()).toLocaleDateString(),
    }),

    columnHelper.accessor('lastLogin', {
      header: 'Last Login',
      cell: (info) => new Date(info.getValue()).toLocaleDateString(),
    }),

    columnHelper.display({
      header: 'Activity',
      cell: (info) => (
        <div className="text-sm">
          <div className="text-gray-900 dark:text-white">
            {info.row.original.courses} courses
          </div>
          <div className="text-gray-500 dark:text-gray-400">
            {info.row.original.projects} projects
          </div>
        </div>
      ),
    }),

    columnHelper.display({
      id: 'actions',
      header: '',
      cell: (info) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="backdrop-blur-xl bg-white/95 dark:bg-gray-800/95">
            <DropdownMenuItem 
              onClick={() => setEditingUser(info.row.original)}
              className="cursor-pointer"
            >
              <Edit3 className="mr-2 h-4 w-4" />
              Edit User
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              onClick={() => {
                const updatedUser = {
                  ...info.row.original,
                  status: (info.row.original.status === 'active' ? 'suspended' : 'active') as 'active' | 'suspended'
                }
                onUpdateUser(updatedUser)
              }}
              className="cursor-pointer"
            >
              {info.row.original.status === 'active' ? (
                <>
                  <Ban className="mr-2 h-4 w-4" />
                  Suspend User
                </>
              ) : (
                <>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Activate User
                </>
              )}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              onClick={() => setDeletingUser(info.row.original)}
              className="cursor-pointer text-red-600 dark:text-red-400"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete User
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    }),
  ]

  const table = useReactTable({
    data: users,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    state: {
      sorting,
      columnFilters,
    },
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
  })

  return (
    <div className="space-y-4">
      <div className="rounded-md border border-white/20 dark:border-gray-700/20 overflow-hidden">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow 
                key={headerGroup.id}
                className="border-white/20 dark:border-gray-700/20 bg-gray-50/50 dark:bg-gray-900/50"
              >
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} className="text-gray-900 dark:text-white">
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  className="border-white/20 dark:border-gray-700/20 hover:bg-gray-50/50 dark:hover:bg-gray-900/50"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No users found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-600 dark:text-gray-400">
          Page {table.getState().pagination.pageIndex + 1} of{' '}
          {table.getPageCount()}
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
      </div>

      {/* Modals */}
      {editingUser && (
        <EditUserModal
          user={editingUser}
          isOpen={!!editingUser}
          onClose={() => setEditingUser(null)}
          onUpdateUser={onUpdateUser}
        />
      )}

      {deletingUser && (
        <DeleteUserModal
          user={deletingUser}
          isOpen={!!deletingUser}
          onClose={() => setDeletingUser(null)}
          onDeleteUser={onDeleteUser}
        />
      )}
    </div>
  )
}