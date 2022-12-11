

export default function TotalCard({ title, total, className=''}){
    return (
        <div className={`w-100 block p-6 border border-gray-200 rounded-lg shadow-md bg-gray-800 ${className}`}>
            <h5 className="mb-2 text-2xl font-bold tracking-tight text-white">
                {total}
            </h5>
            <p className={`font-normal text-white`}>
                {title}
            </p>
        </div>
    )
}