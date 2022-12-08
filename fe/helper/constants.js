
const USERTYPE = {
    EMPLOYEE: "EMPLOYEE",
    HR: "HR",
}


const EVALUATIONTYPE = {
    CORE: 'CORE',
    KPI: 'KPI',
}

const userRole = {
    EMPLOYEE: 'OyzbjNvdmw',
    HR: 'HGFCyxjgWU',
}

const getRole = (role)=> {
    if(role === 'HR') return userRole.HR
    if(role === 'EMPLOYEE') return userRole.EMPLOYEE
    
    return false;
}


export {
    USERTYPE,
    EVALUATIONTYPE,
    getRole,
    userRole
}