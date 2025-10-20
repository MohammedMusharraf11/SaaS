import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import DashboardLayout from '@/components/DashboardLayout'
import SocialDashboard from '@/components/dashboard/SocialDashboard'

export default async function SocialPage() {
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

    return (
      // DashboardLayout will show the sidebar/header; SocialDashboard is rendered as children
      <DashboardLayout user={data.user}>
        <SocialDashboard />
      </DashboardLayout>
    )
  } catch (err) {
    console.error('Social page error:', err)
    redirect('/login')
  }
}
