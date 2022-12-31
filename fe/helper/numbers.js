

const DoubleType = (value, handleNan=false) => {
    let res = Math.round((value + Number.EPSILON) * 100) / 100
    if(handleNan){
        if(isNaN(res)) return handleNan
    }

    return res
}

function handleNaN(value){
    return isNaN(value) ? 0 : value;
}

const handleNoValue = (value, return_value) => {
    return value ? value : return_value;
}

function currencyDisplay(x) {
    if(x)
        return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    else return 0
}

export{
    DoubleType,
    handleNoValue,
    currencyDisplay,
    handleNaN,
}