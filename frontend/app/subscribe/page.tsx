import StripePricingTable from "@/components/StripePricingTable";
import Image from "next/image"
import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'

export default async function Subscribe() {
    const supabase = createClient()
    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-secondary p-4">
                <div className="text-center">
                    <p className="text-lg mb-4">Please log in to subscribe</p>
                    <Link href="/login" className="text-blue-600 hover:underline">
                        Go to Login
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <div className="flex flex-col min-h-screen bg-secondary">
            {/* Header - Mobile Responsive */}
            <header className="px-4 sm:px-6 lg:px-8 h-14 sm:h-16 flex items-center bg-white border-b fixed border-b-slate-200 w-full z-50">
                <Link href="/" className="flex items-center">
                    <Image 
                        src="/logo.png" 
                        alt="logo" 
                        width={50} 
                        height={50} 
                        className="w-10 h-10 sm:w-12 sm:h-12"
                    />
                </Link>
                <Link 
                    href="/dashboard" 
                    className="ml-auto text-sm sm:text-base text-gray-600 hover:text-gray-900 transition-colors"
                >
                    Back to Dashboard
                </Link>
            </header>
            
            {/* Main Content */}
            <div className="w-full pt-20 sm:pt-24 pb-12 sm:pb-16 lg:pb-20 px-4 sm:px-6">
                {/* Title Section */}
                <div className="text-center py-6 sm:py-8 md:py-10 lg:py-12 max-w-4xl mx-auto">
                    <h1 className="font-bold text-2xl sm:text-3xl md:text-4xl lg:text-5xl text-gray-900 mb-3 sm:mb-4">
                        Pricing
                    </h1>
                    <p className="text-muted-foreground text-sm sm:text-base md:text-lg lg:text-xl px-4">
                        Choose the right plan for your team! Cancel anytime!
                    </p>
                </div>
                
                {/* Pricing Table Container */}
                <div className="max-w-6xl mx-auto">
                    <StripePricingTable userEmail={user.email!} />
                </div>
            </div>
        </div>
    )
}