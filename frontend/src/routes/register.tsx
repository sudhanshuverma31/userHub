import { createFileRoute, Link, useNavigate, redirect } from '@tanstack/react-router'
import { useForm } from '@tanstack/react-form'
import { zodValidator } from '@tanstack/zod-form-adapter'
import { z } from 'zod'
import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import axios from 'axios'
import { toast } from 'sonner'

export const Route = createFileRoute('/register')({
  beforeLoad: ({ context }) => {
    if (context.auth.isAuthenticated) {
      throw redirect({ to: '/' })
    }
  },
  component: Register,
})

const countries = [
  { code: '+1', name: 'United States', display: 'United States (+1)' },
  { code: '+44', name: 'United Kingdom', display: 'United Kingdom (+44)' },
  { code: '+91', name: 'India', display: 'India (+91)' },
  { code: '+61', name: 'Australia', display: 'Australia (+61)' },
  { code: '+81', name: 'Japan', display: 'Japan (+81)' },
]

function Register() {
  const [showPassword, setShowPassword] = useState(false)
  const navigate = useNavigate()
  const { auth } = Route.useRouteContext()

  const form = useForm({
    defaultValues: {
      name: '',
      email: '',
      password: '',
      country: '',
      mobile: '',
    },
    validatorAdapter: zodValidator(),
    onSubmit: async ({ value }) => {
      try {
        const { data } = await axios.post('/api/auth/register', value)
        auth.login(data.token)
        toast.success('Account created! Welcome aboard 🎉')
        navigate({ to: '/' })
      } catch (error: any) {
        toast.error(error.response?.data?.message || 'Registration failed')
      }
    },
  })

  return (
    <div className="flex justify-center items-center min-h-[calc(100vh-73px)] p-4 py-12">
      <div className="w-full max-w-lg bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800 p-8">
        <h2 className="text-3xl font-bold mb-2 text-center text-gray-900 dark:text-white">Create an account</h2>
        <p className="text-gray-500 dark:text-gray-400 text-center mb-8">Enter your details to get started</p>
        
        <form
          onSubmit={(e) => {
            e.preventDefault()
            e.stopPropagation()
            form.handleSubmit()
          }}
          className="space-y-5"
        >
          {/* Name Field */}
          <form.Field
            name="name"
            validators={{
              onChange: z.string().min(2, 'Name must be at least 2 characters'),
            }}
            children={(field) => (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Full Name</label>
                <input
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  placeholder="John Doe"
                />
                {field.state.meta.errors ? (
                  <p className="mt-1 text-sm text-red-500">{field.state.meta.errors.join(', ')}</p>
                ) : null}
              </div>
            )}
          />

          {/* Email Field */}
          <form.Field
            name="email"
            validators={{
              onChange: z.string().email('Invalid email address'),
            }}
            children={(field) => (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email Address</label>
                <input
                  type="email"
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  placeholder="john@example.com"
                />
                {field.state.meta.errors ? (
                  <p className="mt-1 text-sm text-red-500">{field.state.meta.errors.join(', ')}</p>
                ) : null}
              </div>
            )}
          />

          {/* Password Field */}
          <form.Field
            name="password"
            validators={{
              onChange: z.string().min(8, 'Password must be at least 8 characters'),
            }}
            children={(field) => (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    className="w-full px-4 py-2.5 pr-12 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 focus:outline-none"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                {field.state.meta.errors ? (
                  <p className="mt-1 text-sm text-red-500">{field.state.meta.errors.join(', ')}</p>
                ) : null}
              </div>
            )}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Country Field */}
            <form.Field
              name="country"
              validators={{
                onChange: z.string().min(1, 'Please select a country'),
              }}
              children={(field) => (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Country</label>
                  <select
                    name={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all appearance-none"
                  >
                    <option value="" disabled>Select Country</option>
                    {countries.map(c => (
                      <option key={c.code} value={c.name}>{c.display}</option>
                    ))}
                  </select>
                  {field.state.meta.errors ? (
                    <p className="mt-1 text-sm text-red-500">{field.state.meta.errors.join(', ')}</p>
                  ) : null}
                </div>
              )}
            />

            {/* Mobile Number Field */}
            <form.Field
              name="mobile"
              validators={{
                onChange: z.string().regex(/^\d{7,15}$/, 'Invalid mobile number (7-15 digits)'),
              }}
              children={(field) => (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Mobile Number</label>
                  <input
                    name={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    placeholder="9876543210"
                  />
                  {field.state.meta.errors ? (
                    <p className="mt-1 text-sm text-red-500">{field.state.meta.errors.join(', ')}</p>
                  ) : null}
                </div>
              )}
            />
          </div>

          <form.Subscribe
            selector={(state) => [state.canSubmit, state.isSubmitting]}
            children={([canSubmit, isSubmitting]) => (
              <button
                type="submit"
                disabled={!canSubmit || isSubmitting}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-4"
              >
                {isSubmitting ? 'Creating account...' : 'Create account'}
              </button>
            )}
          />
        </form>
        
        <p className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
          Already have an account?{' '}
          <Link to="/login" className="text-blue-600 hover:text-blue-500 dark:text-blue-400 font-semibold">
            Log in
          </Link>
        </p>
      </div>
    </div>
  )
}
