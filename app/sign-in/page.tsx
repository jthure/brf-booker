import { SignInForm } from "@/components/sign-in-form"

export default function SignInPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50">
      <div className="w-full max-w-md space-y-8 p-8 bg-white rounded-lg shadow">
        <div className="text-center">
          <h1 className="text-2xl font-bold">BRF Laundry Room</h1>
          <h2 className="mt-2 text-lg text-gray-600">Sign in to your account</h2>
        </div>
        <SignInForm />
      </div>
    </div>
  )
}

