import { NextResponse } from 'next/server'
import { userRole } from './helper/constants'

export function middleware(req) {

    let res = NextResponse.next()

    const isAuth = req.cookies.get('token')?.value
    const userRoleC = req.cookies.get(process.env.userRole)?.value

    const url = req.nextUrl.clone()
    url.pathname = '/'

    let path = req.nextUrl.pathname.split('/')[1]

    if (!isAuth)
        return NextResponse.redirect(url)
    else {
        let redirect = ''
        if(userRole.HR === userRoleC && path === 'e')
          redirect = '/hr'
        else if(userRole.EMPLOYEE === userRoleC && path === 'hr')
          redirect = '/e'
        if (redirect){
            url.pathname = redirect
            return NextResponse.redirect(url)
        }
    }

    return res
}

export const config = {
  matcher: ['/hr/:path*', '/e/:path*'],
}