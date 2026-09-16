/**
 * 歷法與天文推算運算模組 (lunar-calc.js)
 * 整合高精度農曆、二十四節氣（定氣法 UTC+8）、歲次干支與生肖
 */

// 取得全域或 import 的 Lunar/Solar 物件
let LunarLib = null;
if (typeof window !== 'undefined' && window.Lunar) {
  LunarLib = window.Lunar;
}

export function setLunarLib(lib) {
  LunarLib = lib;
}

function getLib() {
  if (!LunarLib) {
    if (typeof window !== 'undefined' && window.Lunar) {
      LunarLib = window.Lunar;
    } else if (typeof global !== 'undefined' && global.Lunar) {
      LunarLib = global.Lunar;
    }
  }
  return LunarLib;
}

const WEEK_DAYS = ['日', '一', '二', '三', '四', '五', '六'];

/**
 * 取得指定公曆日期的完整農曆、干支、節氣與天文資訊
 * @param {number} year 
 * @param {number} month 1-12
 * @param {number} day 1-31
 */
export function getLunarDayInfo(year, month, day) {
  const lib = getLib();
  if (!lib || !lib.Solar) {
    throw new Error('Lunar library is not loaded.');
  }

  const solar = lib.Solar.fromYmd(year, month, day);
  const lunar = solar.getLunar();

  // 星期幾
  const weekIndex = solar.getWeek(); // 0 是週日
  const weekName = `星期${WEEK_DAYS[weekIndex]}`;

  // 農曆年月日中文
  const lunarYear = lunar.getYear();
  const lunarMonth = lunar.getMonth(); // 負數為閏月
  const isLeap = lunarMonth < 0;
  const absMonth = Math.abs(lunarMonth);
  const lunarMonthName = (isLeap ? '閏' : '') + lunar.getMonthInChinese() + '月';
  const lunarDayName = lunar.getDayInChinese();

  // 該農曆月天數（大月 30 天，小月 29 天）
  // 藉由初一所在的 LunarMonth 物件取得天數
  let monthDayCount = 29;
  try {
    const lMonthObj = lunar.getTime().getLunar().getMonth();
    // 或直接比對下個朔日
  } catch (e) {}

  // 歲次干支
  const yearInGanZhi = lunar.getYearInGanZhi();
  const monthInGanZhi = lunar.getMonthInGanZhi();
  const dayInGanZhi = lunar.getDayInGanZhi();
  const SHENG_XIAO_TRAD = {
    '鼠': '鼠', '牛': '牛', '虎': '虎', '兔': '兔',
    '龙': '龍', '蛇': '蛇', '马': '馬', '羊': '羊',
    '猴': '猴', '鸡': '雞', '鷄': '雞', '狗': '狗', '猪': '豬'
  };
  const rawShengXiao = lunar.getYearShengXiao();
  const shengXiao = SHENG_XIAO_TRAD[rawShengXiao] || rawShengXiao; // 正體繁體生肖

  const SOLAR_TERMS_TRAD = {
    '惊蛰': '驚蟄', '谷雨': '穀雨', '小满': '小滿', '芒种': '芒種', '处暑': '處暑'
  };
  const rawJieQiName = lunar.getJieQi() || null;
  const jieQiName = rawJieQiName ? (SOLAR_TERMS_TRAD[rawJieQiName] || rawJieQiName) : null;
  let jieQiDetail = null;

  // 取得該年節氣表以尋找精確時分
  try {
    const jqTable = lunar.getJieQiTable();
    if (jieQiName && jqTable[jieQiName]) {
      const jqSolar = jqTable[jieQiName];
      jieQiDetail = {
        name: jieQiName,
        timeStr: `${String(jqSolar.getHour()).padStart(2, '0')}:${String(jqSolar.getMinute()).padStart(2, '0')}`,
        fullTimeStr: jqSolar.toYmdHms()
      };
    }
    
    // 計算下一個即將到來的節氣
    let nextTermName = null;
    let nextTermTime = null;
    const allJqKeys = Object.keys(jqTable);
    for (const termName of allJqKeys) {
      const termSolar = jqTable[termName];
      if (termSolar.isAfter(solar)) {
        nextTermName = termName;
        nextTermTime = `${termSolar.getMonth()}-${String(termSolar.getDay()).padStart(2, '0')} ${String(termSolar.getHour()).padStart(2, '0')}:${String(termSolar.getMinute()).padStart(2, '0')}`;
        break;
      }
    }
    
    return {
      solar: {
        year,
        month,
        day,
        weekIndex,
        weekName,
        dateStr: `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
      },
      lunar: {
        lunarYear,
        lunarMonth: absMonth,
        isLeap,
        monthName: lunarMonthName,
        dayName: lunarDayName,
        fullChineseDate: `${lunar.getYearInChinese()}年 ${lunarMonthName}${lunarDayName}`,
        yearGanZhi: yearInGanZhi,
        monthGanZhi: monthInGanZhi,
        dayGanZhi: dayInGanZhi,
        fullGanZhi: `${yearInGanZhi}年 ${monthInGanZhi}月 ${dayInGanZhi}日`,
        shengXiao,
        rawLunar: lunar
      },
      solarTerm: {
        current: jieQiName,
        detail: jieQiDetail,
        nextName: nextTermName,
        nextTime: nextTermTime
      },
      julianDay: solar.getJulianDay()
    };
  } catch (err) {
    return {
      solar: { year, month, day, weekIndex, weekName, dateStr: `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}` },
      lunar: {
        lunarYear,
        lunarMonth: absMonth,
        isLeap,
        monthName: lunarMonthName,
        dayName: lunarDayName,
        fullChineseDate: `${lunarYear}年 ${lunarMonthName}${lunarDayName}`,
        yearGanZhi: yearInGanZhi,
        monthGanZhi: monthInGanZhi,
        dayGanZhi: dayInGanZhi,
        fullGanZhi: `${yearInGanZhi}年 ${monthInGanZhi}月 ${dayInGanZhi}日`,
        shengXiao,
        rawLunar: lunar
      },
      solarTerm: { current: jieQiName, detail: jieQiDetail, nextName: null, nextTime: null },
      julianDay: solar.getJulianDay()
    };
  }
}
