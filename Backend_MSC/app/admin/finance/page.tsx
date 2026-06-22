"use client"

import { useState } from 'react'
import { ProtectedRoute } from '@/components/admin/ProtectedRoute'
import { FinanceOverview } from '@/components/admin/finance/FinanceOverview'
import { RevenueChart } from '@/components/admin/finance/RevenueChart'
import { ExpenseChart } from '@/components/admin/finance/ExpenseChart'
import { TransactionTable } from '@/components/admin/finance/TransactionTable'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { 
  Search, 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  CreditCard,
  Download,
  Calendar,
  Filter
} from 'lucide-react'

// TODO: Fetch real financial data from database
const revenueData: Array<{ month: string; revenue: number; expenses: number; profit: number }> = []
const expenseBreakdown: Array<{ category: string; amount: number; percentage: number }> = []
const recentTransactions: Array<any> = []

function FinanceReportingContent() {
  const [searchTerm, setSearchTerm] = useState('')
  const [transactionFilter, setTransactionFilter] = useState('all')
  const [dateRange, setDateRange] = useState('30')

  const filteredTransactions = recentTransactions.filter(transaction => {
    const matchesSearch =
      transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.category.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesFilter = transactionFilter === 'all' || transaction.type === transactionFilter

    return matchesSearch && matchesFilter
  })

  // Calculate financial stats with safe fallbacks for empty data
  const totalRevenue = revenueData.reduce((acc, month) => acc + month.revenue, 0)
  const totalExpenses = revenueData.reduce((acc, month) => acc + month.expenses, 0)
  const totalProfit = revenueData.reduce((acc, month) => acc + month.profit, 0)
  const avgMonthlyRevenue = revenueData.length > 0 ? Math.round(totalRevenue / revenueData.length) : 0
  const currentMonthData = revenueData.length > 0 ? revenueData[revenueData.length - 1] : { revenue: 0, profit: 0 }
  const previousMonthData = revenueData.length > 1 ? revenueData[revenueData.length - 2] : { revenue: 1 }
  const currentMonthRevenue = currentMonthData.revenue
  const currentMonthProfit = currentMonthData.profit
  const profitMargin = currentMonthData.revenue > 0 ? Math.round((currentMonthData.profit / currentMonthData.revenue) * 100) : 0
  const revenueGrowth = previousMonthData.revenue > 0 ? Math.round(((currentMonthData.revenue - previousMonthData.revenue) / previousMonthData.revenue) * 100) : 0

  const financeStats = {
    totalRevenue,
    totalExpenses,
    totalProfit,
    avgMonthlyRevenue,
    currentMonthRevenue,
    currentMonthProfit,
    profitMargin,
    revenueGrowth
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Finance Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Comprehensive financial reporting and analytics for revenue, expenses, and profitability.
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 3 months</SelectItem>
              <SelectItem value="365">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" className="flex items-center space-x-2">
            <Download className="h-4 w-4" />
            <span>Export Report</span>
          </Button>
        </div>
      </div>

      {/* Financial Overview */}
      <FinanceOverview stats={financeStats} />

      {/* Charts Section */}
      {revenueData.length === 0 ? (
        <Card className="backdrop-blur-xl bg-white/80 dark:bg-gray-800/80 border border-white/20 dark:border-gray-700/20">
          <CardContent className="p-12">
            <div className="text-center space-y-4">
              <p className="text-gray-600 dark:text-gray-400">
                Không có dữ liệu tài chính. Vui lòng tạo giao dịch để xem biểu đồ.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="backdrop-blur-xl bg-white/80 dark:bg-gray-800/80 border border-white/20 dark:border-gray-700/20">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">
                Revenue & Profit Trends
              </CardTitle>
            </CardHeader>
            <CardContent>
              <RevenueChart data={revenueData} />
            </CardContent>
          </Card>

          <Card className="backdrop-blur-xl bg-white/80 dark:bg-gray-800/80 border border-white/20 dark:border-gray-700/20">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">
                Expense Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ExpenseChart data={expenseBreakdown} />
            </CardContent>
          </Card>
        </div>
      )}

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="backdrop-blur-xl bg-white/80 dark:bg-gray-800/80 border border-white/20 dark:border-gray-700/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Profit Margin</p>
                <p className="text-2xl font-bold text-green-600">{financeStats.profitMargin}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
            <div className="mt-2">
              <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                Healthy
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="backdrop-blur-xl bg-white/80 dark:bg-gray-800/80 border border-white/20 dark:border-gray-700/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Revenue Growth</p>
                <p className="text-2xl font-bold text-blue-600">+{financeStats.revenueGrowth}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-blue-600" />
            </div>
            <div className="mt-2">
              <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                Month over Month
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="backdrop-blur-xl bg-white/80 dark:bg-gray-800/80 border border-white/20 dark:border-gray-700/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Avg Monthly Revenue</p>
                <p className="text-2xl font-bold text-purple-600">${(financeStats.avgMonthlyRevenue / 1000).toFixed(0)}K</p>
              </div>
              <DollarSign className="h-8 w-8 text-purple-600" />
            </div>
            <div className="mt-2">
              <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400">
                12 Month Average
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="backdrop-blur-xl bg-white/80 dark:bg-gray-800/80 border border-white/20 dark:border-gray-700/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Transactions</p>
                <p className="text-2xl font-bold text-orange-600">{recentTransactions.length}</p>
              </div>
              <CreditCard className="h-8 w-8 text-orange-600" />
            </div>
            <div className="mt-2">
              <Badge className="bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400">
                This Month
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Transaction History */}
      <Card className="backdrop-blur-xl bg-white/80 dark:bg-gray-800/80 border border-white/20 dark:border-gray-700/20">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">
            Recent Transactions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search transactions by description, customer, or category..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={transactionFilter} onValueChange={setTransactionFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Transactions</SelectItem>
                <SelectItem value="income">Income Only</SelectItem>
                <SelectItem value="expense">Expenses Only</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex items-center space-x-2">
              <Badge variant="outline">{filteredTransactions.length} transactions</Badge>
            </div>
          </div>

          <TransactionTable transactions={filteredTransactions} />
        </CardContent>
      </Card>
    </div>
  )
}

export default function FinanceReportingPage() {
  return (
    <ProtectedRoute allowedRoles={['admin']}>
      <FinanceReportingContent />
    </ProtectedRoute>
  )
}
