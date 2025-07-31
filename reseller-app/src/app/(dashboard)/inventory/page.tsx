"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Package,
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  DollarSign,
} from "lucide-react"
import { formatCurrency, calculateProfit, calculateProfitMargin } from "@/lib/utils"

// Mock inventory data
const mockInventory = [
  {
    id: "1",
    name: "Vintage Rolex Watch",
    sku: "VRW-001",
    upc: "1234567890123",
    category: "Watches",
    costPrice: 2500.00,
    salePrice: 3200.00,
    quantity: 3,
    minQuantity: 1,
    condition: "VERY_GOOD",
    location: "A1-B2",
    tags: ["luxury", "vintage", "collectible"],
    createdAt: new Date("2024-01-15"),
  },
  {
    id: "2", 
    name: "Pokemon Card Collection",
    sku: "PCC-045",
    upc: "2345678901234",
    category: "Trading Cards",
    costPrice: 89.99,
    salePrice: 149.99,
    quantity: 12,
    minQuantity: 5,
    condition: "NEW",
    location: "C3-D1",
    tags: ["pokemon", "cards", "collectible"],
    createdAt: new Date("2024-01-18"),
  },
  {
    id: "3",
    name: "Rare First Edition Book",
    sku: "RFE-078",
    upc: "3456789012345",
    category: "Books",
    costPrice: 125.00,
    salePrice: 220.00,
    quantity: 1,
    minQuantity: 1,
    condition: "GOOD",
    location: "E2-F3",
    tags: ["books", "rare", "first-edition"],
    createdAt: new Date("2024-01-20"),
  },
  {
    id: "4",
    name: "Wireless Gaming Headset",
    sku: "WGH-112",
    upc: "4567890123456",
    category: "Electronics",
    costPrice: 45.00,
    salePrice: 89.99,
    quantity: 0,
    minQuantity: 5,
    condition: "NEW",
    location: "G1-H2",
    tags: ["gaming", "electronics", "headset"],
    createdAt: new Date("2024-01-22"),
  },
  {
    id: "5",
    name: "Antique Ceramic Vase",
    sku: "ACV-203",
    upc: "5678901234567",
    category: "Antiques",
    costPrice: 180.00,
    salePrice: 320.00,
    quantity: 2,
    minQuantity: 1,
    condition: "LIKE_NEW",
    location: "I3-J1",
    tags: ["antique", "ceramic", "decorative"],
    createdAt: new Date("2024-01-25"),
  },
]

const conditionColors = {
  NEW: "text-neon-green",
  LIKE_NEW: "text-neon-cyan",
  VERY_GOOD: "text-neon-blue",
  GOOD: "text-yellow-400",
  ACCEPTABLE: "text-orange-400",
  POOR: "text-red-400",
}

export default function InventoryPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  
  const filteredInventory = mockInventory.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    
    const matchesCategory = selectedCategory === "all" || item.category === selectedCategory
    
    return matchesSearch && matchesCategory
  })

  const categories = ["all", ...Array.from(new Set(mockInventory.map(item => item.category)))]
  
  const totalValue = mockInventory.reduce((sum, item) => sum + (item.costPrice * item.quantity), 0)
  const totalProfit = mockInventory.reduce((sum, item) => sum + (calculateProfit(item.costPrice, item.salePrice) * item.quantity), 0)
  const lowStockCount = mockInventory.filter(item => item.quantity <= item.minQuantity).length

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-cyber neon-text">
            Inventory Management
          </h1>
          <p className="text-muted-foreground mt-2">
            Track and manage your product inventory with real-time updates.
          </p>
        </div>
        <Button variant="cyber" className="relative overflow-hidden">
          <Plus className="mr-2 h-4 w-4" />
          Add New Item
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="metric-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Items</p>
                <p className="text-2xl font-bold text-neon-cyan">{mockInventory.length}</p>
              </div>
              <Package className="h-8 w-8 text-neon-blue" />
            </div>
          </CardContent>
        </Card>

        <Card className="metric-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Value</p>
                <p className="text-2xl font-bold text-neon-cyan">{formatCurrency(totalValue)}</p>
              </div>
              <DollarSign className="h-8 w-8 text-neon-green" />
            </div>
          </CardContent>
        </Card>

        <Card className="metric-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Potential Profit</p>
                <p className="text-2xl font-bold text-neon-cyan">{formatCurrency(totalProfit)}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-neon-purple" />
            </div>
          </CardContent>
        </Card>

        <Card className="metric-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Low Stock Items</p>
                <p className="text-2xl font-bold text-neon-pink">{lowStockCount}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-neon-pink" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card className="cyber-card">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by name, SKU, or tags..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="cyber-input px-3 py-2 rounded-md"
            >
              {categories.map(category => (
                <option key={category} value={category}>
                  {category === "all" ? "All Categories" : category}
                </option>
              ))}
            </select>
            <Button variant="outline">
              <Filter className="mr-2 h-4 w-4" />
              More Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Inventory Table */}
      <Card className="cyber-card">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Package className="mr-2 h-5 w-5 text-neon-cyan" />
            Inventory Items ({filteredInventory.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="data-grid">
            <div className="overflow-x-auto cyber-scrollbar">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-neon-cyan/30">
                    <th className="text-left p-4 font-medium text-muted-foreground">Item</th>
                    <th className="text-left p-4 font-medium text-muted-foreground">SKU/UPC</th>
                    <th className="text-left p-4 font-medium text-muted-foreground">Category</th>
                    <th className="text-left p-4 font-medium text-muted-foreground">Cost</th>
                    <th className="text-left p-4 font-medium text-muted-foreground">Sale Price</th>
                    <th className="text-left p-4 font-medium text-muted-foreground">Profit</th>
                    <th className="text-left p-4 font-medium text-muted-foreground">Stock</th>
                    <th className="text-left p-4 font-medium text-muted-foreground">Condition</th>
                    <th className="text-left p-4 font-medium text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredInventory.map((item) => (
                    <tr key={item.id} className="border-b border-neon-cyan/10 hover:bg-neon-cyan/5 transition-colors">
                      <td className="p-4">
                        <div>
                          <p className="font-medium text-sm">{item.name}</p>
                          <p className="text-xs text-muted-foreground">{item.location}</p>
                        </div>
                      </td>
                      <td className="p-4">
                        <div>
                          <p className="text-sm font-mono">{item.sku}</p>
                          <p className="text-xs text-muted-foreground font-mono">{item.upc}</p>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-neon-blue/20 text-neon-blue">
                          {item.category}
                        </span>
                      </td>
                      <td className="p-4">
                        <p className="text-sm font-medium">{formatCurrency(item.costPrice)}</p>
                      </td>
                      <td className="p-4">
                        <p className="text-sm font-medium text-neon-green">{formatCurrency(item.salePrice)}</p>
                      </td>
                      <td className="p-4">
                        <div>
                          <p className="text-sm font-medium text-neon-cyan">
                            {formatCurrency(calculateProfit(item.costPrice, item.salePrice))}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {calculateProfitMargin(item.costPrice, item.salePrice).toFixed(1)}%
                          </p>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center space-x-2">
                          {item.quantity === 0 ? (
                            <AlertTriangle className="h-4 w-4 text-red-400" />
                          ) : item.quantity <= item.minQuantity ? (
                            <AlertTriangle className="h-4 w-4 text-neon-pink" />
                          ) : (
                            <CheckCircle className="h-4 w-4 text-neon-green" />
                          )}
                          <span className={`text-sm font-medium ${
                            item.quantity === 0 ? 'text-red-400' :
                            item.quantity <= item.minQuantity ? 'text-neon-pink' : 'text-neon-green'
                          }`}>
                            {item.quantity}
                          </span>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className={`text-sm font-medium ${conditionColors[item.condition as keyof typeof conditionColors]}`}>
                          {item.condition.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center space-x-2">
                          <Button variant="ghost" size="icon">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}