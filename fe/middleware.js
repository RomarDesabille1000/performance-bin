import { NextResponse } from 'next/server'
import { userRole } from './helper/constants'

export function middleware(req) {

    let res = NextResponse.next()

    const isAuth = req.cookies.get('token')?.value
    const userRoleC = req.cookies.get(process.env.userRole)?.value

    const url = req.nextUrl.clone()
    url.pathname = '/'

    let path = req.nextUrl.pathname.split('/')

    if (!isAuth)
        return NextResponse.redirect(url)
    else {
        let redirect = ''
        if(userRole.HR === userRoleC && path[1] === 'e')
          redirect = '/hr'
        else if(userRole.SUPERVISOR === userRoleC && path[1] === 'hr'){
          if(path.length >= 4){
            const currentPath = `${path[1]}/${path[2]}/${path[3]}`;
            const evaluationPath = `${path[1]}/${path[2]}`
            if(currentPath !== 'hr/employees/evaluation' && evaluationPath !== 'hr/evaluate'){
              redirect = '/e'
            }
          }else{
            redirect = '/e'
          }
        }else if((userRole.STAFF === userRoleC && path.join('/') === '/e/evaluation') || (userRole.STAFF === userRoleC && path[1] === 'hr')){
          redirect = '/e'
        }
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