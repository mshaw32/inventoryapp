"use client"

import { Bell, Search, User, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export function Header() {
  return (
    <header className="cyber-border h-16 bg-card/50 backdrop-blur-md border-b border-neon-cyan/30">
      <div className="flex h-full items-center justify-between px-6">
        {/* Search */}
        <div className="flex items-center space-x-4 flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search inventory, sales, customers..."
              className="pl-10 w-80"
            />
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center space-x-4">
          {/* Notifications */}
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            <span className="absolute -top-1 -right-1 h-3 w-3 bg-neon-pink rounded-full animate-pulse"></span>
          </Button>

          {/* Quick stats */}
          <div className="hidden md:flex items-center space-x-4 text-sm">
            <div className="flex items-center space-x-2">
              <div className="status-indicator bg-neon-green"></div>
              <span className="text-muted-foreground">24 items low stock</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="status-indicator bg-neon-cyan"></div>
              <span className="text-muted-foreground">$12,840 today</span>
            </div>
          </div>

          {/* User menu */}
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="icon">
              <User className="h-5 w-5" />
            </Button>
            <div className="hidden md:block">
              <p className="text-sm font-medium">Admin User</p>
              <p className="text-xs text-muted-foreground">admin@reseller.com</p>
            </div>
            <Button variant="ghost" size="icon">
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}