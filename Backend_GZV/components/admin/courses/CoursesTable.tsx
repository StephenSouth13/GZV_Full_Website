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
  Eye,
  Star,
  DollarSign,
  Users,
  Clock
} from 'lucide-react'
import { EditCourseModal } from './EditCourseModal'
import { DeleteCourseModal } from './DeleteCourseModal'

interface Course {
  id: number
  title: string
  description: string
  instructor: string
  category: 'frontend' | 'backend' | 'fullstack' | 'data' | 'design'
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  status: 'published' | 'draft' | 'review'
  price: number
  duration: string
  students: number
  rating: number
  createdAt: string
  updatedAt: string
}

interface CoursesTableProps {
  courses: Course[]
  onUpdateCourse: (course: Course) => void
  onDeleteCourse: (courseId: number) => void
}

const columnHelper = createColumnHelper<Course>()

export function CoursesTable({ courses, onUpdateCourse, onDeleteCourse }: CoursesTableProps) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [editingCourse, setEditingCourse] = useState<Course | null>(null)
  const [deletingCourse, setDeletingCourse] = useState<Course | null>(null)

  const getCategoryBadge = (category: string) => {
    const categoryColors = {
      frontend: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
      backend: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
      fullstack: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
      data: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
      design: 'bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-400'
    }
    return (
      <Badge className={categoryColors[category as keyof typeof categoryColors]}>
        {category.charAt(0).toUpperCase() + category.slice(1)}
      </Badge>
    )
  }

  const getDifficultyBadge = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner':
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">Beginner</Badge>
      case 'intermediate':
        return <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">Intermediate</Badge>
      case 'advanced':
        return <Badge className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">Advanced</Badge>
      default:
        return <Badge variant="outline">{difficulty}</Badge>
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'published':
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">Published</Badge>
      case 'draft':
        return <Badge className="bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400">Draft</Badge>
      case 'review':
        return <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">In Review</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const columns = [
    columnHelper.accessor('title', {
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="hover:bg-transparent p-0 font-medium"
        >
          Course Title
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: (info) => (
        <div className="flex flex-col max-w-sm">
          <span className="font-medium text-gray-900 dark:text-white truncate">
            {info.getValue()}
          </span>
          <span className="text-sm text-gray-500 dark:text-gray-400 truncate">
            by {info.row.original.instructor}
          </span>
        </div>
      ),
    }),

    columnHelper.accessor('category', {
      header: 'Category',
      cell: (info) => getCategoryBadge(info.getValue()),
      filterFn: 'equals',
    }),

    columnHelper.accessor('difficulty', {
      header: 'Difficulty',
      cell: (info) => getDifficultyBadge(info.getValue()),
      filterFn: 'equals',
    }),

    columnHelper.accessor('status', {
      header: 'Status',
      cell: (info) => getStatusBadge(info.getValue()),
      filterFn: 'equals',
    }),

    columnHelper.accessor('price', {
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="hover:bg-transparent p-0 font-medium"
        >
          Price
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: (info) => (
        <div className="flex items-center space-x-1">
          <DollarSign className="h-4 w-4 text-green-600" />
          <span className="font-medium">{info.getValue()}</span>
        </div>
      ),
    }),

    columnHelper.display({
      header: 'Students & Rating',
      cell: (info) => (
        <div className="text-sm">
          <div className="flex items-center space-x-1 text-gray-900 dark:text-white">
            <Users className="h-3 w-3" />
            <span>{info.row.original.students.toLocaleString()}</span>
          </div>
          <div className="flex items-center space-x-1 text-gray-500 dark:text-gray-400">
            <Star className="h-3 w-3" />
            <span>{info.row.original.rating > 0 ? info.row.original.rating.toFixed(1) : '—'}</span>
          </div>
        </div>
      ),
    }),

    columnHelper.accessor('duration', {
      header: 'Duration',
      cell: (info) => (
        <div className="flex items-center space-x-1 text-sm">
          <Clock className="h-3 w-3 text-gray-500" />
          <span>{info.getValue()}</span>
        </div>
      ),
    }),

    columnHelper.accessor('updatedAt', {
      header: 'Last Updated',
      cell: (info) => new Date(info.getValue()).toLocaleDateString(),
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
            <DropdownMenuItem className="cursor-pointer">
              <Eye className="mr-2 h-4 w-4" />
              View Course
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => setEditingCourse(info.row.original)}
              className="cursor-pointer"
            >
              <Edit3 className="mr-2 h-4 w-4" />
              Edit Course
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              onClick={() => {
                const newStatus = info.row.original.status === 'published' ? 'draft' : 'published'
                const updatedCourse = {
                  ...info.row.original,
                  status: newStatus as 'published' | 'draft' | 'review'
                }
                onUpdateCourse(updatedCourse)
              }}
              className="cursor-pointer"
            >
              {info.row.original.status === 'published' ? (
                <>Unpublish Course</>
              ) : (
                <>Publish Course</>
              )}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              onClick={() => setDeletingCourse(info.row.original)}
              className="cursor-pointer text-red-600 dark:text-red-400"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete Course
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    }),
  ]

  const table = useReactTable({
    data: courses,
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
                  No courses found.
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
      {editingCourse && (
        <EditCourseModal
          course={editingCourse}
          isOpen={!!editingCourse}
          onClose={() => setEditingCourse(null)}
          onUpdateCourse={onUpdateCourse}
        />
      )}

      {deletingCourse && (
        <DeleteCourseModal
          course={deletingCourse}
          isOpen={!!deletingCourse}
          onClose={() => setDeletingCourse(null)}
          onDeleteCourse={onDeleteCourse}
        />
      )}
    </div>
  )
}