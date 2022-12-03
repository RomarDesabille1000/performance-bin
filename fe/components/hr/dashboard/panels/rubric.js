import { useState } from "react";
import Update from "../../../../public/admin/dashboard/update.png";
import Delete from "../../../../public/admin/dashboard/delete.png";


export default function Rubric() {
  const [core, setCore] = useState(['1','2','3'])
  const [kpi, setKpi] = useState(['1','2','3'])

  function renderCoreComp () {
    if(core.length == 0)
      return (<></>)
    else{
      return core.map((item)=>(
        <tr key ={item} className="bg-white border-b text-gray-800">
            <th scope="row" className="py-4 px-6 font-medium">
                <p className="text-left">
                  TITLE
                </p>
            </th>
            <td className="py-4">
              <p className="text-left">
                Description
              </p>
            </td>
            <td className="py-4">
              <p className="text-left">
                Percentage
              </p>
            </td>
            <td className="py-4">
                <img className="h-6 w-6 rounded-full" src= {Update.src}/>
            </td>
            <td className="py-4">
              <img className="h-6 w-6 rounded-full" src= {Delete.src}/>
            </td>
        </tr>
      ))
    }
  }
  function renderKPI () {
    if(kpi.length == 0)
      return (<></>)
    else{
      return kpi.map((item)=>(
        <tr key ={item} className="bg-white border-b text-gray-800">
            <th scope="row" className="py-4 px-6 font-medium">
                <p className="text-left">
                  TITLE
                </p>
            </th>
            <td className="py-4">
              <p className="text-left">
                Description
              </p>
            </td>
            <td className="py-4">
              <p className="text-left">
                Percentage
              </p>
            </td>
            <td className="py-4">
                <img className="h-6 w-6 rounded-full" src= {Update.src}/>
            </td>
            <td className="py-4">
              <img className="h-6 w-6 rounded-full" src= {Delete.src}/>
            </td>
        </tr>
      ))
    }
  }

	return (
    <div className="flex flex-col items-center w-full  px-4">
        {/** CORE COMPATENCY ____________________ */}
        <div className="flex flex-col justify-center h-full w-full mb-5">
          <div className="w-full min-w-full max-w-2xl mx-auto bg-white shadow-lg rounded-sm border border-gray-200">
            <header className="px-5 py-4 border-b border-gray-100">
              <h2 className="font-semibold text-gray-800">Core Competency</h2>
            </header>
            <div className="p-3">
              <div className="overflow-x-auto">
                <table className="table-auto w-full ">
                  <thead className="text-xs font-semibold uppercase text-gray-400 bg-gray-50">
                    <tr>
                        <th className="p-2 whitespace-nowrap">
                            <div className="font-semibold text-left">Name</div>
                        </th>
                        <th className="p-2 whitespace-nowrap">
                            <div className="font-semibold text-left">Description</div>
                        </th>
                        <th className="p-2 whitespace-nowrap">
                            <div className="font-semibold text-left">Percentage</div>
                        </th>
                        <th className="p-2 whitespace-nowrap">
                            <div className="font-semibold text-center">Update</div>
                        </th>
                        <th className="p-2 whitespace-nowrap">
                            <div className="font-semibold text-center">Delete</div>
                        </th>
                    </tr>
                  </thead>
                  <tbody>
                    {renderCoreComp()}
                  </tbody>
                </table>
                <button className="btn w-full my-5">ADD</button>
              </div>
            </div>
          </div>
        </div>
        {/** KEY PERFORMACE INNDICATOR ____________________ */}
        <div className="flex flex-col justify-center h-full w-full">
          <div className="w-full min-w-full max-w-2xl mx-auto bg-white shadow-lg rounded-sm border border-gray-200">
            <header className="px-5 py-4 border-b border-gray-100">
              <h2 className="font-semibold text-gray-800">KEY PERFORMACE INNDICATOR</h2>
            </header>
            <div className="p-3">
              <div className="overflow-x-auto">
                <table className="table-auto w-full">
                  <thead className="text-xs font-semibold uppercase text-gray-400 bg-gray-50">
                    <tr>
                        <th className="p-2 whitespace-nowrap">
                            <div className="font-semibold text-left">Name</div>
                        </th>
                        <th className="p-2 whitespace-nowrap">
                            <div className="font-semibold text-left">Description</div>
                        </th>
                        <th className="p-2 whitespace-nowrap">
                            <div className="font-semibold text-left">Percentage</div>
                        </th>
                        <th className="p-2 whitespace-nowrap">
                            <div className="font-semibold text-center">Update</div>
                        </th>
                        <th className="p-2 whitespace-nowrap">
                            <div className="font-semibold text-center">Delete</div>
                        </th>
                    </tr>
                  </thead>
                  <tbody>
                    {renderKPI()}
                  </tbody>
                </table>
                <button className="btn w-full my-5">ADD</button>
              </div>
            </div>
          </div>
        </div>
    </div>
	)
}
