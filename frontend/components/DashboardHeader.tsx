import { Bell, Menu, Search } from "lucide-react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Image from 'next/image'
import { createClient } from '@/utils/supabase/server'
import DashboardHeaderProfileDropdown from "./DashboardHeaderProfileDropdown"
import { Badge } from "@/components/ui/badge"
import { getStripePlan } from "@/utils/stripe/api"
import { Suspense } from "react"
import { Skeleton } from "@/components/ui/skeleton"

export default async function DashboardHeader() {
    const supabase = createClient()
    const { data: { user }, error } = await supabase.auth.getUser()
    
    if (!user) {
        return null
    }
    
    // Get the user's plan from Stripe
    const stripePlan = getStripePlan(user.email!)

    return (
        <header className="sticky top-0 z-50 w-full bg-white border-b border-gray-200 shadow-sm">
            <div className="flex h-16 items-center px-6">
                <div className="flex flex-1 items-center justify-between">
                    <div className="flex items-center space-x-6">
                        <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                                <Image src="/logo.png" alt="logo" width={20} height={20} />
                            </div>
                            <div>
                                <h1 className="text-lg font-semibold text-gray-900">Analytics Dashboard</h1>
                                <p className="text-xs text-gray-500">Welcome back, {user.email}</p>
                            </div>
                        </div>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                                type="search"
                                placeholder="Search domains, keywords..."
                                className="pl-10 w-80 bg-gray-50 border-gray-200 focus:bg-white focus:border-blue-500 transition-all duration-200"
                            />
                        </div>
                        
                        <Button variant="outline" size="icon" className="relative">
                            <Bell className="h-5 w-5" />
                            <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
                        </Button>
                        
                        <Button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 hover:shadow-lg">
                            <span className="mr-2">+</span>
                            Quick Add
                        </Button>
                        
                        <DashboardHeaderProfileDropdown />
                    </div>
                </div>
            </div>
        </header>
    )
}