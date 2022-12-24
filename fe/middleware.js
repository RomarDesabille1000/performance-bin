import { NextResponse } from 'next/server'
import { userRole } from './helper/constants'

export function middleware(req) {

    let res = NextResponse.next()

    // const isAuth = req.cookies.get('token')?.value
    // const userRoleC = req.cookies.get(process.env.userRole)?.value

    // const url = req.nextUrl.clone()
    // url.pathname = '/'

    // let path = req.nextUrl.pathname.split('/')

    // if (!isAuth)
    //     return NextResponse.redirect(url)
    // else {
    //     let redirect = ''
    //     if(userRole.HR === userRoleC && path[1] === 'e')
    //       redirect = '/hr'
    //     else if(userRole.EMPLOYEE === userRoleC && path[1] === 'hr'){
    //       if(path.length >= 4){
    //         const currentPath = `${path[1]}/${path[2]}/${path[3]}`;
    //         if(currentPath !== 'hr/employees/evaluation'){
    //           redirect = '/e'
    //         }
    //       }else{
    //         redirect = '/e'
    //       }
    //     }
    //     if (redirect){
    //         url.pathname = redirect
    //         return NextResponse.redirect(url)
    //     }
    // }

    return res
}

export const config = {
  matcher: ['/hr/:path*', '/e/:path*'],
}