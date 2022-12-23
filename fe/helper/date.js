import dayjs from "dayjs"

function dateAdd1Day(date){
    return dayjs(date).add(1, 'day').format('YYYY-MM-D');
}

export {
    dateAdd1Day,
}