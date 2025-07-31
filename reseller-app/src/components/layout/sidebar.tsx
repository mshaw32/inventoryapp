"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  BarChart3,
  Users,
  Settings,
  TrendingUp,
  AlertTriangle,
  DollarSign,
} from "lucide-react"

const navigation = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "Inventory",
    href: "/inventory",
    icon: Package,
  },
  {
    name: "Sales",
    href: "/sales",
    icon: ShoppingCart,
  },
  {
    name: "Reports",
    href: "/reports",
    icon: BarChart3,
    children: [
      { name: "Top Selling", href: "/reports/top-selling", icon: TrendingUp },
      { name: "Low Inventory", href: "/reports/low-inventory", icon: AlertTriangle },
      { name: "Profit Analysis", href: "/reports/profit", icon: DollarSign },
    ],
  },
  {
    name: "Customers",
    href: "/customers",
    icon: Users,
  },
  {
    name: "Settings",
    href: "/settings",
    icon: Settings,
  },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="cyber-border flex h-screen w-64 flex-col bg-card/30 backdrop-blur-md">
      {/* Logo */}
      <div className="flex h-16 items-center justify-center border-b border-neon-cyan/30">
        <h1 className="text-2xl font-bold font-cyber neon-text">
          ResellerPro
        </h1>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-2 p-4 cyber-scrollbar overflow-y-auto">
        {navigation.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
          
          return (
            <div key={item.name}>
              <Link
                href={item.href}
                className={cn(
                  "group flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-neon-cyan/20 text-neon-cyan border border-neon-cyan/30 shadow-lg shadow-neon-cyan/20"
                    : "text-muted-foreground hover:bg-neon-cyan/10 hover:text-neon-cyan hover:border-neon-cyan/20 border border-transparent"
                )}
              >
                <item.icon className="mr-3 h-5 w-5" />
                {item.name}
              </Link>
              
              {/* Submenu */}
              {item.children && isActive && (
                <div className="ml-6 mt-2 space-y-1">
                  {item.children.map((child) => {
                    const isChildActive = pathname === child.href
                    return (
                      <Link
                        key={child.name}
                        href={child.href}
                        className={cn(
                          "group flex items-center rounded-lg px-3 py-2 text-sm transition-all duration-200",
                          isChildActive
                            ? "bg-neon-purple/20 text-neon-purple border border-neon-purple/30"
                            : "text-muted-foreground hover:bg-neon-purple/10 hover:text-neon-purple border border-transparent"
                        )}
                      >
                        <child.icon className="mr-3 h-4 w-4" />
                        {child.name}
                      </Link>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </nav>

      {/* Status indicator */}
      <div className="border-t border-neon-cyan/30 p-4">
        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
          <div className="status-indicator bg-neon-green"></div>
          <span>System Online</span>
        </div>
      </div>
    </div>
  )
}