import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import DashboardSidebar from '@/components/DashboardSidebar'
import WebsiteAnalyzer from '@/components/WebsiteAnalyzer'

export default async function Dashboard() {
    const supabase = createClient()

    const { data, error } = await supabase.auth.getUser()
    if (error || !data?.user) {
        redirect('/login')
    }

    return (
        <div className="flex h-screen bg-white">
            {/* Left Sidebar */}
            <DashboardSidebar />
            
            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Dashboard Content */}
                <div className="flex-1 overflow-y-auto p-8">
                    <div className="max-w-4xl mx-auto">
                        <WebsiteAnalyzer />
                    </div>
                </div>
            </div>
        </div>
    )
}