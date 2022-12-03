import { useRouter } from "next/router";
import { useState } from "react";
import Backjobs from "../../components/hr/dashboard/panels/backjobs";
import Employee from "../../components/hr/dashboard/panels/employee";
import Evaluate from "../../components/hr/dashboard/panels/evaluate";
import Rubric from "../../components/hr/dashboard/panels/rubric";
import Sales from "../../components/hr/dashboard/panels/sales";
import { useSignatureStore } from "../../../store/signature";

export default function HRDashboard() {
	const router = useRouter()
  const signatureStore = useSignatureStore();
  const [panelShown, setPanelShown] = useState(signatureStore.activePanel);
  const [profileDropdownShown, setProfileDropdownShown] = useState(false);
  const [mobilleDropdownShown, setMobileDropdownShown] = useState(false);
  const [panelTitle, setPanelTitle] = useState('Manage Rubric');

  const [navigation, setNavigation] = useState([
    { name: 'Manage Rubric', panel: 'Rubric', current: true },
    { name: 'Manage Employee', panel: 'Employee', current: false },
    { name: 'Encode Sales', panel: 'Sales', current: false },
    { name: 'Encode Reported backjobs', panel: 'Backjobs', current: false },
    { name: 'Evaluate Employee', panel: 'Evaluate', current: false },
  ])

  function switchPanel(panel, name){
    console.log(`panel ${panel}`)
    const newNavigation = [
      { name: 'Manage Rubric', panel: 'Rubric', current: panel == "Rubric" ? true : false },
      { name: 'Manage Employee', panel: 'Employee', current: panel == "Employee" ? true : false },
      { name: 'Encode Sales', panel: 'Sales', current: panel == "Sales" ? true :false },
      { name: 'Encode Reported backjobs', panel: 'Backjobs', current: panel == "Backjobs" ? true :false },
      { name: 'Evaluate Employee', panel: 'Evaluate', current: panel == "Evaluate" ? true : false },
    ];
    signatureStore.setActivePanel(panel)
    console.log(signatureStore.activePanel)
    setPanelTitle(name)
    setNavigation(newNavigation)
    setPanelShown(panel)
  }

  function renderPanel(){
    
    switch(panelShown){
      case 'Employee':
        return <Employee/>
      case 'Rubric':
        return <Rubric/>
      case 'Sales':
        return <Sales/>
      case 'Backjobs':
        return <Backjobs/>
      case 'Evaluate':
        return <Evaluate/>
    }
  }
	


	return (
    <div className="min-h-full">
      <nav className="bg-gray-800">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <img className="h-8 w-8" src="https://tailwindui.com/img/logos/mark.svg?color=indigo&shade=500" alt="Your Company"/>
              </div>
              <div className="hidden md:block">
                <div className="ml-10 flex items-baseline space-x-4">
                  {navigation.map((item) => (
                          <label
                            key={item.name}
                            onClick={()=> switchPanel(item.panel, item.name)}
                            className={
                              item.current
                                ? 'bg-gray-900 text-white px-3 py-2 rounded-md text-sm font-medium'
                                : 'text-gray-300 hover:bg-gray-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium'
                            }
                            aria-current={item.current ? 'page' : undefined}
                          >
                            {item.name}
                          </label>
                        ))}
                </div>
              </div>
            </div>
            <div className="hidden md:block">
              <div className="ml-4 flex items-center md:ml-6">

                <div className="relative ml-3">
                  <div>
                    <button type="button" className="flex max-w-xs items-center rounded-full bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800" id="user-menu-button" onClick = {()=> setProfileDropdownShown(!profileDropdownShown)}>
                      <span className="sr-only">Open user menu</span>
                      <img className="h-8 w-8 rounded-full" src="/admin/dashboard/admin.png" alt=""/>
                    </button>
                  </div>
                  <div className={`${profileDropdownShown ? '' : 'hidden'} absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none`}>
                    <a href="#" className="block px-4 py-2 text-sm text-gray-700" role="menuitem" id="user-menu-item-2">Sign out</a>
                  </div>
                </div>
              </div>
            </div>
            <div className="-mr-2 flex md:hidden">
              <button type="button" className="inline-flex items-center justify-center rounded-md bg-gray-800 p-2 text-gray-400 hover:bg-gray-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800" onClick = {()=> setMobileDropdownShown(!mobilleDropdownShown)}>
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

        <div className="md:hidden" id="mobile-menu">
          <div className={mobilleDropdownShown ? "" : "hidden"}>
            <div className="space-y-1 px-2 pt-2 pb-3 sm:px-3">
              {navigation.map((item) => (
                <label
                  key={item.name}
                  onClick={()=> switchPanel(item.panel, item.name)}
                  className={
                    item.current
                      ? 'bg-gray-100 block px-4 py-2 text-sm text-gray-700'
                      : 'block px-4 py-2 text-sm text-gray-300'
                  }
                  aria-current={item.current ? 'page' : undefined}
                >
                  {item.name}
                </label>
              ))}
            </div>
            <div className="border-t border-gray-700 pt-4 pb-3">
              <div className="flex items-center px-5">
                <div className="flex-shrink-0">
                  <img className="h-10 w-10 rounded-full" src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" alt=""/>
                </div>
                <div className="ml-3">
                  <div className="text-base font-medium leading-none text-white">Tom Cook</div>
                  <div className="text-sm font-medium leading-none text-gray-400">tom@example.com</div>
                </div>

              </div>
              <div className="mt-3 space-y-1 px-2">
                <a href="#" className="block rounded-md px-3 py-2 text-base font-medium text-gray-400 hover:bg-gray-700 hover:text-white">Sign out</a>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <header className="bg-white shadow">
        <div className="mx-auto max-w-7xl py-6 px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">{panelTitle}</h1>
        </div>
      </header>
      <main>
        <div className="mx-auto max-w-7xl py-6 sm:px-6 lg:px-8">
          <div className="px-4 sm:px-0">
            {renderPanel()}
          </div>
        </div>
      </main>
    </div>

	)
}