
const handleRouteId = (route) => {
    if (route === undefined) return
    
    const r = route.split('/')
    const rSize = r.length - 1

    if ((r[rSize] !== '[id]' || r[rSize - 1] !== '[id]') &&
        (!Number.isInteger(parseInt(r[rSize])) || !Number.isInteger(parseInt(r[rSize - 1]))) &&
        rSize <= 2)
        return route


    let newRoute = ""

    //First run is '' string <= 2 to get /a/a
    // Check only parent /url1/url2
    for (let i = 0; i <= 2; i++) {
        if (r[i] === '' || i === rSize)
            continue
        
        newRoute += `/${r[i]}`
    }

    return newRoute
}


export default handleRouteId