import { useRef } from "react"
import { useRouter } from 'next/router'
import handleRouteId from "../helper/HandleRouteId";
import Link from "next/link";
import { useAuth } from '../context/AuthContext'
import Image from 'next/image'
import logoWhite from '../images/logo-white.jpg'

const NavItem = ({href, name ,activeLinks ,clss=''}) => {
    const router = useRouter();
    const active = activeLinks ? activeLinks.includes(handleRouteId(router.pathname)) : false;

    return (
        <Link href={href} 
            className={`${active ? 'bg-gray-900 text-white' : 
            'text-gray-300 hover:bg-gray-700 hover:text-white'} px-3 py-2 rounded-md text-sm font-medium ${clss}`}>
            {name}
        </Link>
    )
}


export default function AdminLayout({children, title, hasBack=false}) {
    const router = useRouter()
    const mobileMenuRef = useRef(0);
    const { logout } = useAuth()

    const toggleMobileButton = () => {
        mobileMenuRef.current.classList.toggle('hidden');
    }

    const routes = [
        {
            href: '/hr', 
            activeLinks: ['/hr'],
            name: 'Dashboard'
        },
        {
            href: '/hr/department', 
            activeLinks: ['/hr/department'],
            name: 'Department'
        },
        {
            href: '/hr/rubrics', 
            activeLinks: ['/hr/rubrics'],
            name: 'Rubrics'
        },
        {
            href: '/hr/employees', 
            activeLinks: ['/hr/employees'],
            name: 'Employees'
        },
        {
            href: '/hr/c', 
            activeLinks: ['/hr/c'],
            name: 'Attendance CSV'
        },
        {
            href: '/schedule', 
            activeLinks: ['/schedule'],
            name: 'Schedules'
        },
        {
            href: '/hr/evaluate', 
            activeLinks: ['/hr/evaluate'],
            name: 'Evaluate'
        },
    ]


    return (
        <div className="min-h-full">
            <nav className="bg-gray-800">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex h-16 items-center justify-between">
                        <div className="flex items-center">
                            {/* <div className="flex-shrink-0">
								<Image
									src={logoWhite}
									alt="logo"
                                    width="auto"
                                    height="auto"
                                    loading="eager" 
                                    priority={true}
                                    className="rounded-sm w-[80px] h-[40px]"
									/>
                            </div> */}
                            <div className="hidden md:block">
                                <div className="ml-10 flex items-baseline space-x-4">
                                    {routes.map((d) => (
                                        <NavItem 
                                            key={d.href}
                                            href={d.href} 
                                            activeLinks={d.activeLinks}
                                            name={d.name}/>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div className="hidden md:block">
                            <div className="ml-4 flex items-center md:ml-6">
                                <button 
                                    onClick={logout}
                                    className="text-gray-300 hover:bg-gray-700 hover:text-white block px-3 py-2 rounded-md text-base font-medium">
                                    Logout
                                </button>
                            </div>
                        </div>
                        <div className="-mr-2 flex md:hidden">
                        <button type="button" 
                                className="inline-flex items-center justify-center rounded-md bg-gray-800 p-2 text-gray-400 hover:bg-gray-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800" 
                                aria-controls="mobile-menu" 
                                aria-expanded="false"
                                onClick={toggleMobileButton}
                        >
                            <span className="sr-only">Open main menu</span>
                            <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" aria-hidden="true">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                            </svg>
                            <svg className="hidden h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" aria-hidden="true">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                        </div>
                    </div>
                </div>

                <div 
                    className="md:hidden" 
                    id="mobile-menu"
                    ref={mobileMenuRef}
                >
                    <div className="space-y-1 px-2 pt-2 pb-3 sm:px-3">
                        {routes.map((d) => (
                            <NavItem 
                                key={d.href} 
                                href={d.href} 
                                activeLinks={d.activeLinks}
                                name={d.name}
                                clss={'block text-base font-medium'}
                            />
                        ))}
                    </div>
                    <div className="border-t border-gray-700 pt-4 pb-3 px-2">
                        <a href="#" className="text-gray-300 hover:bg-gray-700 hover:text-white block px-3 py-2 rounded-md text-base font-medium">
                            Logout
                        </a>
                    </div>
                </div>
            </nav>

            <header className="bg-white shadow">
                <div className="mx-auto max-w-7xl py-2 px-4 sm:px-6 lg:px-8">
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900">{title}</h1>
                    {hasBack && (
                        <button className="text-blue-600" onClick={() => router.back()}>Back</button>
                    )}
                </div>
            </header>
            <main>
                <div className="mx-auto max-w-7xl py-6 sm:px-6 lg:px-8">
                    <div className="px-4 py-6 sm:px-0">
                        {children}
                    </div>
                </div>
            </main>
        </div>
    )
}