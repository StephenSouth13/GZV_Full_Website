"use client"

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  BarChart,
  Bar
} from 'recharts'

interface RevenueData {
  month: string
  revenue: number
  expenses: number
  profit: number
}

interface RevenueChartProps {
  data: RevenueData[]
}

export function RevenueChart({ data }: RevenueChartProps) {
  const formatCurrency = (value: number) => {
    return `$${(value / 1000).toFixed(0)}K`
  }

  return (
    <div className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
          <XAxis 
            dataKey="month" 
            className="text-xs fill-gray-600 dark:fill-gray-400"
          />
          <YAxis 
            tickFormatter={formatCurrency}
            className="text-xs fill-gray-600 dark:fill-gray-400"
          />
          <Tooltip
            formatter={(value: number, name: string) => [
              formatCurrency(value),
              name === 'revenue' ? 'Revenue' : name === 'expenses' ? 'Expenses' : 'Profit'
            ]}
            labelStyle={{ color: '#374151' }}
            contentStyle={{
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              border: '1px solid rgba(229, 231, 235, 0.8)',
              borderRadius: '8px',
              backdropFilter: 'blur(10px)'
            }}
          />
          <Legend 
            wrapperStyle={{ paddingTop: '20px' }}
          />
          <Line
            type="monotone"
            dataKey="revenue"
            stroke="#3B82F6"
            strokeWidth={3}
            dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6, stroke: '#3B82F6', strokeWidth: 2 }}
            name="Revenue"
          />
          <Line
            type="monotone"
            dataKey="expenses"
            stroke="#EF4444"
            strokeWidth={3}
            dot={{ fill: '#EF4444', strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6, stroke: '#EF4444', strokeWidth: 2 }}
            name="Expenses"
          />
          <Line
            type="monotone"
            dataKey="profit"
            stroke="#10B981"
            strokeWidth={3}
            dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6, stroke: '#10B981', strokeWidth: 2 }}
            name="Profit"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}