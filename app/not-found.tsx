import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-950 text-white p-8">
      <div className="text-center max-w-md">
        <div className="text-8xl font-bold text-gray-700 mb-4">404</div>
        <h1 className="text-2xl font-semibold text-gray-200 mb-2">
          Page Not Found
        </h1>
        <p className="text-gray-400 mb-8 text-sm">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <Link
          href="/"
          className="inline-block px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm font-medium"
        >
          Back to Dashboard
        </Link>
      </div>
    </div>
  )
}
