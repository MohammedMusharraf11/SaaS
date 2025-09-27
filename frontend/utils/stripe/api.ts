import { Stripe } from 'stripe';
import { db } from '../db/db';
import { usersTable } from '../db/schema';
import { eq } from "drizzle-orm";


export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)
const PUBLIC_URL = process.env.NEXT_PUBLIC_WEBSITE_URL || "http://localhost:3000"

export async function getStripePlan(email: string) {
    try {
        const user = await db.select().from(usersTable).where(eq(usersTable.email, email))
        if (user.length === 0) {
            return "Free Plan"
        }
        
        const userPlan = user[0].plan
        if (userPlan === "none") {
            return "Free Plan"
        }
        
        // If user has a subscription, get the product name
        const subscription = await stripe.subscriptions.retrieve(userPlan);
        const productId = subscription.items.data[0].plan.product as string
        const product = await stripe.products.retrieve(productId)
        return product.name
    } catch (error) {
        console.error("Error getting Stripe plan:", error)
        return "Free Plan"
    }
}

export async function createStripeCustomer(id: string, email: string, name?: string) {
    const customer = await stripe.customers.create({
        name: name ? name : "",
        email: email,
        metadata: {
            supabase_id: id
        }
    });
    // Create a new customer in Stripe
    return customer.id
}

export async function createStripeCheckoutSession(email: string) {
    try {
        const user = await db.select().from(usersTable).where(eq(usersTable.email, email))
        if (user.length === 0) {
            throw new Error('User not found')
        }
        
        const customerSession = await stripe.customerSessions.create({
            customer: user[0].stripe_id,
            components: {
                pricing_table: {
                    enabled: true,
                },
            },
        });
        return customerSession.client_secret
    } catch (error) {
        console.error("Error creating checkout session:", error)
        throw new Error('Failed to create checkout session')
    }
}

export async function generateStripeBillingPortalLink(email: string) {
    try {
        const user = await db.select().from(usersTable).where(eq(usersTable.email, email))
        if (user.length === 0) {
            throw new Error('User not found')
        }
        
        const portalSession = await stripe.billingPortal.sessions.create({
            customer: user[0].stripe_id,
            return_url: `${PUBLIC_URL}/dashboard`,
        });
        return portalSession.url
    } catch (error) {
        console.error("Error generating billing portal link:", error)
        // Return a fallback URL or handle gracefully
        return `${PUBLIC_URL}/subscribe`
    }
}