import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import DashboardLayout from '@/components/DashboardLayout'

export default async function Dashboard() {
    try {
        const supabase = createClient()

        const { data, error } = await supabase.auth.getUser()
        
        if (error) {
            console.error('Supabase auth error:', error)
            redirect('/login')
        }
        
        if (!data?.user) {
            redirect('/login')
        }

        return <DashboardLayout user={data.user} />
    } catch (error) {
        console.error('Dashboard page error:', error)
        redirect('/login')
    }
}