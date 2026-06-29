import Link from 'next/link'

export default function AuthErrorPage() {
  return (
    <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'sans-serif' }}>
      <div style={{ textAlign: 'center', maxWidth: 400, padding: '2rem' }}>
        <h1>Authentication error</h1>
        <p style={{ color: '#666', marginBottom: '1.5rem' }}>
          The verification link may have expired. Please try signing in again.
        </p>
        <Link href="/" style={{ color: '#d13438', fontWeight: 600 }}>
          Return to FireLearn
        </Link>
      </div>
    </main>
  )
}
