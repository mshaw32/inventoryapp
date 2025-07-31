"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from "recharts"
import {
  BarChart3,
  TrendingUp,
  DollarSign,
  Package,
  Download,
  Calendar,
  AlertTriangle,
  Star,
} from "lucide-react"
import { formatCurrency } from "@/lib/utils"

// Mock data for charts
const salesData = [
  { month: "Jan", sales: 12400, profit: 3200, items: 85 },
  { month: "Feb", sales: 15600, profit: 4800, items: 102 },
  { month: "Mar", sales: 18900, profit: 5900, items: 125 },
  { month: "Apr", sales: 22100, profit: 7200, items: 142 },
  { month: "May", sales: 19800, profit: 6400, items: 128 },
  { month: "Jun", sales: 25600, profit: 8900, items: 165 },
]

const topSellingItems = [
  { name: "Gaming Headsets", sold: 45, revenue: 4050 },
  { name: "Vintage Watches", sold: 12, revenue: 38400 },
  { name: "Pokemon Cards", sold: 89, revenue: 13350 },
  { name: "Rare Books", sold: 23, revenue: 5060 },
  { name: "Electronics", sold: 67, revenue: 8900 },
]

const categoryData = [
  { name: "Electronics", value: 35, color: "#00ffff" },
  { name: "Collectibles", value: 28, color: "#a855f7" },
  { name: "Books", value: 18, color: "#ec4899" },
  { name: "Clothing", value: 12, color: "#10b981" },
  { name: "Other", value: 7, color: "#3b82f6" },
]

const profitTrendData = [
  { week: "W1", profit: 2400, margin: 24.5 },
  { week: "W2", profit: 3200, margin: 26.8 },
  { week: "W3", profit: 2800, margin: 23.2 },
  { week: "W4", profit: 4100, margin: 28.9 },
  { week: "W5", profit: 3600, margin: 27.1 },
  { week: "W6", profit: 4800, margin: 31.2 },
]

const lowStockItems = [
  { name: "Wireless Earbuds", current: 2, minimum: 10, category: "Electronics" },
  { name: "Vintage Comics", current: 1, minimum: 5, category: "Collectibles" },
  { name: "Designer Bags", current: 0, minimum: 3, category: "Fashion" },
  { name: "Board Games", current: 3, minimum: 8, category: "Games" },
]

interface TooltipProps {
  active?: boolean
  payload?: Array<{
    dataKey: string
    value: number
    color: string
  }>
  label?: string
}

const CustomTooltip = ({ active, payload, label }: TooltipProps) => {
  if (active && payload && payload.length) {
    return (
      <div className="cyber-card p-3 border border-neon-cyan/30">
        <p className="text-sm font-medium text-neon-cyan">{`${label}`}</p>
        {payload.map((entry, index: number) => (
          <p key={index} className="text-sm" style={{ color: entry.color }}>
            {`${entry.dataKey}: ${
              entry.dataKey.includes('revenue') || entry.dataKey.includes('profit') || entry.dataKey.includes('sales')
                ? formatCurrency(entry.value)
                : entry.value
            }`}
          </p>
        ))}
      </div>
    )
  }
  return null
}

export default function ReportsPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-cyber neon-text">
            Reports & Analytics
          </h1>
          <p className="text-muted-foreground mt-2">
            Comprehensive insights into your business performance and trends.
          </p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline">
            <Calendar className="mr-2 h-4 w-4" />
            Date Range
          </Button>
          <Button variant="cyber">
            <Download className="mr-2 h-4 w-4" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="metric-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Revenue</p>
                <p className="text-2xl font-bold text-neon-cyan">$114,400</p>
                <p className="text-xs text-neon-green flex items-center">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +18.2% from last period
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-neon-green" />
            </div>
          </CardContent>
        </Card>

        <Card className="metric-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Items Sold</p>
                <p className="text-2xl font-bold text-neon-cyan">647</p>
                <p className="text-xs text-neon-green flex items-center">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +12.5% from last period
                </p>
              </div>
              <Package className="h-8 w-8 text-neon-purple" />
            </div>
          </CardContent>
        </Card>

        <Card className="metric-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg Profit Margin</p>
                <p className="text-2xl font-bold text-neon-cyan">27.8%</p>
                <p className="text-xs text-neon-green flex items-center">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +2.1% from last period
                </p>
              </div>
              <BarChart3 className="h-8 w-8 text-neon-pink" />
            </div>
          </CardContent>
        </Card>

        <Card className="metric-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Low Stock Items</p>
                <p className="text-2xl font-bold text-neon-pink">24</p>
                <p className="text-xs text-orange-400 flex items-center">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  Requires attention
                </p>
              </div>
              <AlertTriangle className="h-8 w-8 text-neon-pink" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Sales Trend */}
        <Card className="cyber-card">
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="mr-2 h-5 w-5 text-neon-cyan" />
              Sales Trend (6 Months)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,255,255,0.1)" />
                <XAxis dataKey="month" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="sales"
                  stackId="1"
                  stroke="#00ffff"
                  fill="rgba(0,255,255,0.2)"
                />
                <Area
                  type="monotone"
                  dataKey="profit"
                  stackId="2"
                  stroke="#a855f7"
                  fill="rgba(168,85,247,0.2)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Category Distribution */}
        <Card className="cyber-card">
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart3 className="mr-2 h-5 w-5 text-neon-purple" />
              Sales by Category
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={120}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="cyber-card p-3 border border-neon-cyan/30">
                          <p className="text-sm font-medium text-neon-cyan">
                            {payload[0].payload.name}: {payload[0].value}%
                          </p>
                        </div>
                      )
                    }
                    return null
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="grid grid-cols-2 gap-2 mt-4">
              {categoryData.map((item, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: item.color }}
                  ></div>
                  <span className="text-xs text-muted-foreground">
                    {item.name} ({item.value}%)
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Profit Margin Trend */}
        <Card className="cyber-card">
          <CardHeader>
            <CardTitle className="flex items-center">
              <DollarSign className="mr-2 h-5 w-5 text-neon-green" />
              Profit Margin Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={profitTrendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,255,255,0.1)" />
                <XAxis dataKey="week" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip content={<CustomTooltip />} />
                <Line
                  type="monotone"
                  dataKey="profit"
                  stroke="#10b981"
                  strokeWidth={3}
                  dot={{ fill: "#10b981", strokeWidth: 2, r: 5 }}
                />
                <Line
                  type="monotone"
                  dataKey="margin"
                  stroke="#ec4899"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={{ fill: "#ec4899", strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Top Selling Items */}
        <Card className="cyber-card">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Star className="mr-2 h-5 w-5 text-neon-pink" />
              Top Selling Items
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={topSellingItems} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,255,255,0.1)" />
                <XAxis type="number" stroke="#9ca3af" />
                <YAxis dataKey="name" type="category" stroke="#9ca3af" width={100} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="revenue" fill="#00ffff" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Low Stock Alert Table */}
      <Card className="cyber-card">
        <CardHeader>
          <CardTitle className="flex items-center">
            <AlertTriangle className="mr-2 h-5 w-5 text-neon-pink" />
            Low Stock Alert
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="data-grid">
            <table className="w-full">
              <thead>
                <tr className="border-b border-neon-cyan/30">
                  <th className="text-left p-4 font-medium text-muted-foreground">Item Name</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">Category</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">Current Stock</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">Minimum Required</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">Status</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">Action</th>
                </tr>
              </thead>
              <tbody>
                {lowStockItems.map((item, index) => (
                  <tr key={index} className="border-b border-neon-cyan/10 hover:bg-neon-cyan/5 transition-colors">
                    <td className="p-4">
                      <p className="font-medium text-sm">{item.name}</p>
                    </td>
                    <td className="p-4">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-neon-blue/20 text-neon-blue">
                        {item.category}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`font-medium ${item.current === 0 ? 'text-red-400' : 'text-neon-pink'}`}>
                        {item.current}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className="text-muted-foreground">{item.minimum}</span>
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${
                        item.current === 0 
                          ? 'bg-red-500/20 text-red-400' 
                          : 'bg-neon-pink/20 text-neon-pink'
                      }`}>
                        {item.current === 0 ? 'Out of Stock' : 'Low Stock'}
                      </span>
                    </td>
                    <td className="p-4">
                      <Button variant="outline" size="sm">
                        Reorder
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}