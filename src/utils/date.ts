/**
 * 获取指定时间范围内指定间隔天数的所有日期
 * @param startDate
 * @param endDate
 * @param length
 */
export function getDatesByRange(
  startDate: string,
  endDate: string,
  length = 0,
): string[] {
  const result = [startDate];
  let sDate = startDate;
  for (let i = 0; ; i++) {
    const nextDate = getTargetDate(sDate, length);
    sDate = nextDate;
    if (nextDate <= endDate) {
      result.push(nextDate);
    } else {
      break;
    }
  }
  return result;
}

/**
 *
 *
 * @param {string} date
 * @param {number} [length=0]
 * @return {*}
 */
function getTargetDate(date: string, length = 0): string {
  const step = length + 1;
  const tempDate = new Date(date);
  tempDate.setDate(tempDate.getDate() + step);

  const year = tempDate.getFullYear();
  const monthTemp = tempDate.getMonth() + 1;
  const month = monthTemp < 10 ? `0${monthTemp}` : monthTemp;
  const dayTemp = tempDate.getDate();
  const day = dayTemp < 10 ? `0${dayTemp}` : dayTemp;
  return `${year}-${month}-${day}`;
}
