import Stripe from 'stripe'
import { db } from '../db/db'
import { usersTable } from '../db/schema'
import { eq } from 'drizzle-orm'

const PUBLIC_URL = process.env.NEXT_PUBLIC_WEBSITE_URL || 'http://localhost:3000'

// Disable Stripe for development/testing
const DISABLE_STRIPE = true // Set to false when you want to enable Stripe

// Initialize Stripe with error handling
let stripe: Stripe | null = null
if (!DISABLE_STRIPE) {
    try {
        if (process.env.STRIPE_SECRET_KEY && process.env.STRIPE_SECRET_KEY.startsWith('sk_test_')) {
            stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
                apiVersion: '2024-06-20',
            })
            console.log('Stripe initialized successfully (TEST MODE)')
        } else {
            console.log('Stripe disabled - invalid or live mode key in development')
        }
    } catch (error) {
        console.error('Stripe initialization failed:', error)
    }
}

export async function createStripeCustomer(id: string, email: string, name?: string) {
    if (DISABLE_STRIPE || !stripe) {
        console.log('Stripe disabled, skipping customer creation')
        return `mock_customer_${id.substring(0, 8)}` // Return a mock customer ID
    }

    try {
        const customer = await stripe.customers.create({
            name: name || email.split('@')[0],
            email: email,
            metadata: {
                supabase_id: id
            }
        })
        console.log('Stripe customer created:', customer.id)
        return customer.id
    } catch (error) {
        console.error('Stripe customer creation failed:', error)
        return `mock_customer_${id.substring(0, 8)}` // Return a mock customer ID
    }
}

export async function getStripePlan(email: string) {
    if (!db) {
        console.log('Database not available, returning default plan')
        return 'free'
    }

    try {
        const user = await db.select().from(usersTable).where(eq(usersTable.email, email))
        if (user.length === 0) {
            return 'free'
        }
        return user[0].plan || 'free'
    } catch (error) {
        console.log("Error getting Stripe plan:", error)
        return 'free'
    }
}

export async function createStripeCheckoutSession(email: string) {
    console.log('Stripe checkout disabled in development, returning fallback URL')
    return `${PUBLIC_URL}/subscribe`
}

export async function generateStripeBillingPortalLink(email: string) {
    console.log('Stripe billing portal disabled in development, returning fallback URL')
    return `${PUBLIC_URL}/subscribe`
}

export { stripe }