import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import DashboardPageLayout from '@/components/DashboardPageLayout'
import SEOPerformanceContent from '@/components/SEOPerformanceContent'

export default async function SEOPerformancePage() {
    try {
        const supabase = createClient()

        const { data, error } = await supabase.auth.getUser()
        
        if (error || !data?.user) {
            redirect('/login')
        }

        return (
            <DashboardPageLayout user={data.user}>
                <SEOPerformanceContent user={data.user} />
            </DashboardPageLayout>
        )
    } catch (error) {
        console.error('SEO Performance page error:', error)
        redirect('/login')
    }
}