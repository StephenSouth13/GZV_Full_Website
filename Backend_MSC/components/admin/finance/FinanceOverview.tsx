"use client"

import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Minus,
  Calculator,
  PieChart
} from 'lucide-react'

interface FinanceStats {
  totalRevenue: number
  totalExpenses: number
  totalProfit: number
  avgMonthlyRevenue: number
  currentMonthRevenue: number
  currentMonthProfit: number
  profitMargin: number
  revenueGrowth: number
}

interface FinanceOverviewProps {
  stats: FinanceStats
}

export function FinanceOverview({ stats }: FinanceOverviewProps) {
  const formatCurrency = (amount: number) => {
    if (amount >= 1000000) {
      return `$${(amount / 1000000).toFixed(1)}M`
    } else if (amount >= 1000) {
      return `$${(amount / 1000).toFixed(0)}K`
    } else {
      return `$${amount.toLocaleString()}`
    }
  }

  const getGrowthIcon = (growth: number) => {
    if (growth > 0) return <TrendingUp className="h-4 w-4 text-green-600" />
    if (growth < 0) return <TrendingDown className="h-4 w-4 text-red-600" />
    return <Minus className="h-4 w-4 text-gray-600" />
  }

  const getGrowthBadge = (growth: number) => {
    if (growth > 0) {
      return (
        <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
          +{growth}%
        </Badge>
      )
    }
    if (growth < 0) {
      return (
        <Badge className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">
          {growth}%
        </Badge>
      )
    }
    return (
      <Badge className="bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400">
        0%
      </Badge>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Total Revenue */}
      <Card className="backdrop-blur-xl bg-white/80 dark:bg-gray-800/80 border border-white/20 dark:border-gray-700/20">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Revenue</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                {formatCurrency(stats.totalRevenue)}
              </p>
              <div className="flex items-center space-x-2 mt-3">
                {getGrowthIcon(stats.revenueGrowth)}
                {getGrowthBadge(stats.revenueGrowth)}
                <span className="text-xs text-gray-500 dark:text-gray-400">vs last month</span>
              </div>
            </div>
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">This month</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {formatCurrency(stats.currentMonthRevenue)}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Total Expenses */}
      <Card className="backdrop-blur-xl bg-white/80 dark:bg-gray-800/80 border border-white/20 dark:border-gray-700/20">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Expenses</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                {formatCurrency(stats.totalExpenses)}
              </p>
              <div className="flex items-center space-x-2 mt-3">
                <TrendingUp className="h-4 w-4 text-orange-600" />
                <Badge className="bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400">
                  5.2% increase
                </Badge>
                <span className="text-xs text-gray-500 dark:text-gray-400">vs last month</span>
              </div>
            </div>
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center">
                <TrendingDown className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">Expense ratio</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {Math.round((stats.totalExpenses / stats.totalRevenue) * 100)}%
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Net Profit */}
      <Card className="backdrop-blur-xl bg-white/80 dark:bg-gray-800/80 border border-white/20 dark:border-gray-700/20">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Net Profit</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                {formatCurrency(stats.totalProfit)}
              </p>
              <div className="flex items-center space-x-2 mt-3">
                <TrendingUp className="h-4 w-4 text-green-600" />
                <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                  12.3% increase
                </Badge>
                <span className="text-xs text-gray-500 dark:text-gray-400">vs last month</span>
              </div>
            </div>
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center">
                <Calculator className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">This month</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {formatCurrency(stats.currentMonthProfit)}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Profit Margin */}
      <Card className="backdrop-blur-xl bg-white/80 dark:bg-gray-800/80 border border-white/20 dark:border-gray-700/20">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Profit Margin</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                {stats.profitMargin}%
              </p>
              <div className="flex items-center space-x-2 mt-3">
                <TrendingUp className="h-4 w-4 text-purple-600" />
                <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400">
                  Excellent
                </Badge>
                <span className="text-xs text-gray-500 dark:text-gray-400">industry avg: 25%</span>
              </div>
            </div>
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
                <PieChart className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">Target</span>
              <span className="font-medium text-gray-900 dark:text-white">
                35%
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}