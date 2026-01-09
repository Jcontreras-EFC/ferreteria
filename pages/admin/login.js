import { useEffect } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'

export default function AdminLogin() {
  const router = useRouter()

  useEffect(() => {
    // Redirigir automáticamente a la página de login unificada
    router.replace('/login')
  }, [router])

  return (
    <>
      <Head>
        <title>Redirigiendo... - Ferretería</title>
      </Head>
      <div className="min-h-screen flex items-center justify-center bg-gray-900 px-4">
        <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md text-center">
          <p className="text-gray-700">Redirigiendo al login...</p>
        </div>
      </div>
    </>
  )
}

