import { NextResponse } from 'next/server'

export function middleware(req) {

    let res = NextResponse.next()

    const isAuth = req.cookies.get('token')?.value

    const url = req.nextUrl.clone()
    url.pathname = '/'

    if (!isAuth)
        return NextResponse.redirect(url)

    return res
}

export const config = {
  matcher: ['/hr/:path*', '/e/:path*'],
}