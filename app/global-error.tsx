'use client'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html lang="en">
      <body className="bg-gray-950 text-white">
        <div className="flex items-center justify-center min-h-screen p-8">
          <div className="text-center max-w-md">
            <div className="text-6xl mb-4">💥</div>
            <h2 className="text-xl font-semibold text-gray-200 mb-2">
              Critical Error
            </h2>
            <p className="text-gray-400 mb-6 text-sm">
              {error.message || 'A critical error occurred. Please try refreshing the page.'}
            </p>
            <button
              onClick={reset}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors text-sm font-medium"
            >
              Reload
            </button>
          </div>
        </div>
      </body>
    </html>
  )
}
