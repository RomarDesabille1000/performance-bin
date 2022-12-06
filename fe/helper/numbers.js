

const DoubleType = (value, handleNan=false) => {
    let res = Math.round((value + Number.EPSILON) * 100) / 100
    if(handleNan){
        if(isNaN(res)) return handleNan
    }

    return res
}

const handleNoValue = (value, return_value) => {
    return value ? value : return_value;
}

export{
    DoubleType,
    handleNoValue,
}