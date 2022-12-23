import dayjs from "dayjs"

function dateAdd1Day(date){
    return dayjs(date).add(1, 'day').format('YYYY-MM-D');
}

function extractTimeLate24hrFormat(time){
    time = time.split(':');
    let totalMinutesLate = 0;
    let hr = parseInt(time[0]);
    let minutes = parseInt(time[1]);
    if(hr >= 8){
        totalMinutesLate += minutes;
    }
    if(hr > 8){
        totalMinutesLate += (Math.abs(hr - 8) * 60);
    }
    return totalMinutesLate;
}

function timeFormat(time){
    return dayjs("1/1/1 " +  time,"HH:mm:ss").format('h:mm A');
}

function toHoursAndMinutes(minutes) {
  const hours = Math.floor(minutes / 60);
  const currMinutes = minutes % 60;
  if(!hours && !currMinutes) return 0;
  if(!hours)
    return `${currMinutes < 10 ? '0'+currMinutes: currMinutes} min(s)`;

  return `${hours < 10 ? '0'+hours: hours} hr(s) ${currMinutes < 10 ? '0'+currMinutes: currMinutes} min(s)`;
}

export {
    dateAdd1Day,
    extractTimeLate24hrFormat,
    timeFormat,
    toHoursAndMinutes,
}