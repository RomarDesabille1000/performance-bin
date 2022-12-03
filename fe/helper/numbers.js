

const DoubleType = (value) => Math.round((value + Number.EPSILON) * 100) / 100

export{
    DoubleType
}