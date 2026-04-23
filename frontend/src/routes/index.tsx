import { createFileRoute, redirect } from '@tanstack/react-router'
import { UsersTable } from '../components/UsersTable'

export const Route = createFileRoute('/')({
  beforeLoad: ({ context }) => {
    if (!context.auth.isAuthenticated) {
      throw redirect({ to: '/login' })
    }
  },
  component: Index,
})

function Index() {
  return (
    <div className="p-6 max-w-6xl mx-auto py-8">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">Dashboard</h2>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Manage your team members and their account permissions here.</p>
      </div>
      <UsersTable />
    </div>
  )
}
