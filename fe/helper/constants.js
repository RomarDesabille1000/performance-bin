
const USERTYPE = {
    EMPLOYEE: "EMPLOYEE",
    HR: "HR",
    SUPERVISOR: 'SUPERVISOR',
    STAFF: 'STAFF',
}


const EVALUATIONTYPE = {
    CORE: 'CORE',
    KPI: 'KPI',
}

const userRole = {
    EMPLOYEE: 'OyzbjNvdmw',
    HR: 'HGFCyxjgWU',
    SUPERVISOR: 'HGFGyxjgWU',
    STAFF: 'HGFGyxjgCA',
}

const getRole = (role)=> {
    if(role === 'HR') return userRole.HR
    if(role === 'EMPLOYEE') return userRole.EMPLOYEE
    if(role === 'SUPERVISOR') return userRole.SUPERVISOR
    if(role === 'STAFF') return userRole.STAFF
    
    return false;
}


export {
    USERTYPE,
    EVALUATIONTYPE,
    getRole,
    userRole
}