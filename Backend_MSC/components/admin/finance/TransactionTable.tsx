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
  TrendingUp,
  TrendingDown,
  Calendar,
  CreditCard,
  User,
  Eye,
  Download
} from 'lucide-react'

interface Transaction {
  id: number
  type: 'income' | 'expense'
  description: string
  amount: number
  date: string
  category: string
  paymentMethod: string
  customer: string
  status: 'completed' | 'pending' | 'failed'
}

interface TransactionTableProps {
  transactions: Transaction[]
}

const columnHelper = createColumnHelper<Transaction>()

export function TransactionTable({ transactions }: TransactionTableProps) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])

  const getTypeBadge = (type: string) => {
    if (type === 'income') {
      return (
        <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
          <TrendingUp className="h-3 w-3 mr-1" />
          Income
        </Badge>
      )
    }
    return (
      <Badge className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">
        <TrendingDown className="h-3 w-3 mr-1" />
        Expense
      </Badge>
    )
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">Completed</Badge>
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">Pending</Badge>
      case 'failed':
        return <Badge className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">Failed</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const formatCurrency = (amount: number) => {
    return `$${amount.toLocaleString()}`
  }

  const columns = [
    columnHelper.accessor('date', {
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="hover:bg-transparent p-0 font-medium"
        >
          Date
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: (info) => (
        <div className="flex items-center space-x-2">
          <Calendar className="h-4 w-4 text-gray-500" />
          <span className="text-sm font-medium text-gray-900 dark:text-white">
            {new Date(info.getValue()).toLocaleDateString()}
          </span>
        </div>
      ),
    }),

    columnHelper.accessor('description', {
      header: 'Description',
      cell: (info) => (
        <div className="flex flex-col max-w-xs">
          <span className="font-medium text-gray-900 dark:text-white truncate">
            {info.getValue()}
          </span>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {info.row.original.category}
          </span>
        </div>
      ),
    }),

    columnHelper.accessor('type', {
      header: 'Type',
      cell: (info) => getTypeBadge(info.getValue()),
      filterFn: 'equals',
    }),

    columnHelper.accessor('amount', {
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="hover:bg-transparent p-0 font-medium"
        >
          Amount
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: (info) => {
        const transaction = info.row.original
        const isIncome = transaction.type === 'income'
        return (
          <span className={`font-semibold ${isIncome ? 'text-green-600' : 'text-red-600'}`}>
            {isIncome ? '+' : '-'}{formatCurrency(info.getValue())}
          </span>
        )
      },
    }),

    columnHelper.display({
      header: 'Customer & Payment',
      cell: (info) => {
        const transaction = info.row.original
        return (
          <div className="space-y-1">
            <div className="flex items-center space-x-1 text-sm">
              <User className="h-3 w-3 text-gray-500" />
              <span className="text-gray-900 dark:text-white">{transaction.customer}</span>
            </div>
            <div className="flex items-center space-x-1 text-xs text-gray-500 dark:text-gray-400">
              <CreditCard className="h-3 w-3" />
              <span>{transaction.paymentMethod}</span>
            </div>
          </div>
        )
      },
    }),

    columnHelper.accessor('status', {
      header: 'Status',
      cell: (info) => getStatusBadge(info.getValue()),
      filterFn: 'equals',
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
              View Details
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer">
              <Download className="mr-2 h-4 w-4" />
              Download Receipt
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            {info.row.original.status === 'pending' && (
              <DropdownMenuItem className="cursor-pointer text-green-600 dark:text-green-400">
                Mark as Completed
              </DropdownMenuItem>
            )}
            {info.row.original.status === 'failed' && (
              <DropdownMenuItem className="cursor-pointer text-blue-600 dark:text-blue-400">
                Retry Transaction
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    }),
  ]

  const table = useReactTable({
    data: transactions,
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
      sorting: [
        {
          id: 'date',
          desc: true, // Most recent first
        },
      ],
    },
  })

  const totalIncome = transactions
    .filter(t => t.type === 'income' && t.status === 'completed')
    .reduce((sum, t) => sum + t.amount, 0)

  const totalExpenses = transactions
    .filter(t => t.type === 'expense' && t.status === 'completed')
    .reduce((sum, t) => sum + t.amount, 0)

  const pendingAmount = transactions
    .filter(t => t.status === 'pending')
    .reduce((sum, t) => sum + t.amount, 0)

  return (
    <div className="space-y-4">
      {/* Transaction Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5 text-green-600" />
            <div>
              <p className="text-sm text-green-600 dark:text-green-400">Total Income</p>
              <p className="text-lg font-semibold text-green-700 dark:text-green-300">
                {formatCurrency(totalIncome)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <TrendingDown className="h-5 w-5 text-red-600" />
            <div>
              <p className="text-sm text-red-600 dark:text-red-400">Total Expenses</p>
              <p className="text-lg font-semibold text-red-700 dark:text-red-300">
                {formatCurrency(totalExpenses)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <Calendar className="h-5 w-5 text-yellow-600" />
            <div>
              <p className="text-sm text-yellow-600 dark:text-yellow-400">Pending</p>
              <p className="text-lg font-semibold text-yellow-700 dark:text-yellow-300">
                {formatCurrency(pendingAmount)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Transaction Table */}
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
                  No transactions found.
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
    </div>
  )
}