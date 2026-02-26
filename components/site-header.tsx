"use client"

import Link from "next/link"
import { Building2, Users, FolderKanban, BarChart3 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { BrainLogo } from "@/components/brain-logo"
import { GlobalSearch } from "@/components/global-search"
import { HelpPopover } from "@/components/help-popover"
import { useAuth } from "@/lib/auth-context"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

export function SiteHeader() {
  const { user, logout, isAdmin } = useAuth()

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-[#2D1A45] text-white">
      <div className="container flex h-16 items-center max-w-[1400px] mx-auto px-6">
        <Link href="/" className="mr-6" aria-label="Go to home page">
          <BrainLogo />
        </Link>
        <nav className="flex items-center space-x-6 text-sm font-medium">
          <Link href="/dashboard" className="flex items-center space-x-2">
            <BarChart3 className="w-4 h-4" />
            <span>Dashboard</span>
          </Link>
          <Link href="/organizations" className="flex items-center space-x-2">
            <Building2 className="w-4 h-4" />
            <span>Organizations</span>
          </Link>
          <Link href="/people" className="flex items-center space-x-2">
            <Users className="w-4 h-4" />
            <span>People</span>
          </Link>
          <Link href="/collections" className="flex items-center space-x-2">
            <FolderKanban className="w-4 h-4" />
            <span>Collections</span>
          </Link>
        </nav>
        <div className="ml-auto flex items-center space-x-4">
          <GlobalSearch />
          <HelpPopover />
          {user && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full overflow-hidden p-0">
                  {user.avatar ? (
                    <img src={user.avatar || "/placeholder.svg"} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-gray-300 flex items-center justify-center">
                      <span className="text-sm font-medium text-gray-600">{user.fullName.charAt(0)}</span>
                    </div>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user.fullName}</p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/profile/edit">Edit Profile</Link>
                </DropdownMenuItem>
                {isAdmin && (
                  <DropdownMenuItem asChild>
                    <Link href="/team">Manage Team</Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={logout}>Log out</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </header>
  )
}
