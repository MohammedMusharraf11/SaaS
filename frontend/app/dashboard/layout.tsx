import DashboardHeader from "@/components/DashboardHeader";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { createClient } from '@/utils/supabase/server'
import { redirect } from "next/navigation"
import { db } from '@/utils/db/db'
import { usersTable } from '@/utils/db/schema'
import { eq } from "drizzle-orm";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "SAAS Starter Kit",
    description: "SAAS Starter Kit with Stripe, Supabase, Postgres",
};

export default async function DashboardLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const supabase = createClient()

    const {
        data: { user },
    } = await supabase.auth.getUser()

    // Redirect to login if no user
    if (!user) {
        redirect('/login')
    }

    // Get user plan info but don't redirect - show dashboard with upgrade prompt
    let userPlan = "none"
    try {
        const checkUserInDB = await db.select().from(usersTable).where(eq(usersTable.email, user.email!))
        if (checkUserInDB.length > 0) {
            userPlan = checkUserInDB[0].plan
        }
    } catch (error) {
        console.log("Error fetching user plan:", error)
    }

    return (
        <html lang="en">
            <body className={inter.className}>
                <DashboardHeader />
                {children}
            </body>
        </html>
    );
}
