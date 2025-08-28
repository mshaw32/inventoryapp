"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  DollarSign,
  Package,
  ShoppingCart,
  TrendingUp,
  AlertTriangle,
  BarChart3,
  Plus,
} from "lucide-react"
import { formatCurrency } from "@/lib/utils"

// Mock data - in a real app, this would come from your API
const dashboardData = {
  revenue: {
    total: 45231.89,
    change: 12.5,
  },
  sales: {
    total: 234,
    change: 8.2,
  },
  inventory: {
    total: 1429,
    lowStock: 24,
  },
  profit: {
    total: 12840.50,
    margin: 28.4,
  },
}

const recentSales = [
  { id: "1", item: "Vintage Watch", amount: 450.00, customer: "John Doe", time: "2 hours ago" },
  { id: "2", item: "Collectible Cards", amount: 89.99, customer: "Jane Smith", time: "4 hours ago" },
  { id: "3", item: "Rare Book", amount: 125.00, customer: "Mike Johnson", time: "6 hours ago" },
  { id: "4", item: "Antique Vase", amount: 320.00, customer: "Sarah Wilson", time: "8 hours ago" },
]

const lowStockItems = [
  { name: "Gaming Console", stock: 2, minStock: 5 },
  { name: "Smartphone Cases", stock: 1, minStock: 10 },
  { name: "Wireless Headphones", stock: 3, minStock: 8 },
  { name: "Tablet Accessories", stock: 0, minStock: 5 },
]

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-cyber neon-text">
            Dashboard
          </h1>
          <p className="text-muted-foreground mt-2">
            Welcome back! Here&apos;s what&apos;s happening with your business today.
          </p>
        </div>
        <div className="flex space-x-3">
          <Button variant="cyber" className="relative overflow-hidden">
            <Plus className="mr-2 h-4 w-4" />
            Add Item
          </Button>
          <Button variant="neon">
            <ShoppingCart className="mr-2 h-4 w-4" />
            New Sale
          </Button>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="metric-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-neon-green" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-neon-cyan">
              {formatCurrency(dashboardData.revenue.total)}
            </div>
            <p className="text-xs text-muted-foreground flex items-center mt-1">
              <TrendingUp className="h-3 w-3 mr-1 text-neon-green" />
              +{dashboardData.revenue.change}% from last month
            </p>
          </CardContent>
        </Card>

        <Card className="metric-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
            <ShoppingCart className="h-4 w-4 text-neon-purple" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-neon-cyan">
              {dashboardData.sales.total}
            </div>
            <p className="text-xs text-muted-foreground flex items-center mt-1">
              <TrendingUp className="h-3 w-3 mr-1 text-neon-green" />
              +{dashboardData.sales.change}% from last month
            </p>
          </CardContent>
        </Card>

        <Card className="metric-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inventory Items</CardTitle>
            <Package className="h-4 w-4 text-neon-blue" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-neon-cyan">
              {dashboardData.inventory.total}
            </div>
            <p className="text-xs text-muted-foreground flex items-center mt-1">
              <AlertTriangle className="h-3 w-3 mr-1 text-neon-pink" />
              {dashboardData.inventory.lowStock} items low stock
            </p>
          </CardContent>
        </Card>

        <Card className="metric-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Profit Margin</CardTitle>
            <BarChart3 className="h-4 w-4 text-neon-pink" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-neon-cyan">
              {dashboardData.profit.margin}%
            </div>
            <p className="text-xs text-muted-foreground">
              {formatCurrency(dashboardData.profit.total)} total profit
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Recent Sales */}
        <Card className="cyber-card">
          <CardHeader>
            <CardTitle className="flex items-center">
              <ShoppingCart className="mr-2 h-5 w-5 text-neon-green" />
              Recent Sales
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentSales.map((sale) => (
                <div key={sale.id} className="flex items-center justify-between p-3 rounded-lg bg-dark-800/30 border border-neon-cyan/20">
                  <div>
                    <p className="font-medium text-sm">{sale.item}</p>
                    <p className="text-xs text-muted-foreground">{sale.customer} • {sale.time}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-neon-green">{formatCurrency(sale.amount)}</p>
                  </div>
                </div>
              ))}
            </div>
            <Button variant="outline" className="w-full mt-4">
              View All Sales
            </Button>
          </CardContent>
        </Card>

        {/* Low Stock Alert */}
        <Card className="cyber-card">
          <CardHeader>
            <CardTitle className="flex items-center">
              <AlertTriangle className="mr-2 h-5 w-5 text-neon-pink" />
              Low Stock Alert
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {lowStockItems.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-dark-800/30 border border-neon-pink/20">
                  <div>
                    <p className="font-medium text-sm">{item.name}</p>
                    <p className="text-xs text-muted-foreground">Min: {item.minStock}</p>
                  </div>
                  <div className="text-right">
                    <p className={`font-bold text-sm ${item.stock === 0 ? 'text-red-400' : 'text-neon-pink'}`}>
                      {item.stock === 0 ? 'Out of Stock' : `${item.stock} left`}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <Button variant="outline" className="w-full mt-4">
              Manage Inventory
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}