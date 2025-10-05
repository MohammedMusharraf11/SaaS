import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import Link from 'next/link'
import Image from 'next/image'
import ProviderSigninBlock from '@/components/ProviderSigninBlock'
import LoginForm from "@/components/LoginForm"

export default function Login() {
    return (
        <div className="flex items-center justify-center bg-muted min-h-screen p-4">
            <Card className="w-full max-w-[400px] mx-auto">
                <CardHeader className="space-y-1 px-4 sm:px-6 pt-6">
                    <div className="flex justify-center py-3 sm:py-4">
                        <Link href='/'>
                            <Image src="/logo.png" alt="logo" width={50} height={50} className="w-10 h-10 sm:w-12 sm:h-12" />
                        </Link>
                    </div>

                    <CardTitle className="text-xl sm:text-2xl font-bold text-center">Login</CardTitle>
                    <CardDescription className="text-center text-sm sm:text-base">
                        Choose your preferred login method
                    </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4 px-4 sm:px-6">
                    <LoginForm />
                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
                        </div>
                    </div>
                    <ProviderSigninBlock />
                </CardContent>
                <CardFooter className="flex-col text-center px-4 sm:px-6 pb-6 space-y-2">
                    <Link className="w-full text-sm text-muted-foreground hover:text-primary transition-colors" href="/forgot-password">
                        Forgot password?
                    </Link>
                    <Link className="w-full text-sm text-muted-foreground hover:text-primary transition-colors" href="/signup">
                        Don&apos;t have an account? Signup
                    </Link>
                </CardFooter>
            </Card>
        </div>
    )
}