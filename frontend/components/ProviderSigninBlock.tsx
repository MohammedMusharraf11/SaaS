'use client'

import { Button } from '@/components/ui/button'
import { FaGoogle, FaGithub } from 'react-icons/fa'
import { signInWithGithub } from '@/app/auth/actions'

interface ProviderSigninBlockProps {
  mode?: 'signin' | 'signup'
}

export default function ProviderSigninBlock({ mode = 'signup' }: ProviderSigninBlockProps) {
  const isGoogleEnabled = process.env.GOOGLE_OAUTH_CLIENT_ID ? true : false
  const isGithubEnabled = process.env.GITHUB_OAUTH_CLIENT_ID ? true : false

  const handleGoogleSignIn = async () => {
    try {
      window.location.href = '/auth/google'
    } catch (error) {
      console.error('Error signing in with Google:', error)
    }
  }

  const googleButtonText = mode === 'signin' ? 'Sign in with Google' : 'Sign up with Google'

  return (
    <div className="flex flex-row gap-2">
      {isGoogleEnabled && (
        <Button
          type="button"
          onClick={handleGoogleSignIn}
          variant="outline"
          className="w-full h-14 bg-orange-50/50 border-orange-200 hover:bg-orange-100/50 hover:border-orange-300 text-gray-800 font-medium rounded-xl transition-all flex items-center justify-center gap-3 text-base"
        >
          <FaGoogle className="w-5 h-5 text-orange-500" />
          <span>{googleButtonText}</span>
        </Button>
      )}
      {isGithubEnabled && (
        <form action={signInWithGithub} className="basis-full">
          <Button variant="outline" aria-label="Sign in with Github" className="w-full">
            <FaGithub />
          </Button>
        </form>
      )}
    </div>
  )
}