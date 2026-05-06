import { NextRequest, NextResponse } from "next/server"

// middleware.ts
export function middleware(request: NextRequest) {
  const allowedOrigin = process.env.NEXT_PUBLIC_SITE_URL!

  if (request.nextUrl.pathname.startsWith('/api')) {
    const origin = request.headers.get('origin') ?? ''

    // Block disallowed origins
    if (origin && origin !== allowedOrigin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Allow and set CORS headers
    const response = NextResponse.next()
    response.headers.set('Access-Control-Allow-Origin', allowedOrigin)
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
    return response
  }

  return NextResponse.next()
}