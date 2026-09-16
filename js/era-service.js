/**
 * 歷史紀年推算服務 (era-service.js)
 * 負責推算給定西曆日期之清朝帝號、日治帝號、民國/民前紀年，並精確處理改元交接日
 */

import { QING_EMPERORS, JAPAN_ERAS, HISTORICAL_MILESTONES } from './era-data.js';

/**
 * 格式化年份數字為中文數字年號序數
 * 如 1 -> "元年", 2 -> "2年" (或 "二年")
 */
export function formatRegnalYear(num) {
  if (num === 1) return '元年';
  return `${num} 年`;
}

/**
 * 取得民國與民國前對照
 * @param {number} solarYear 西曆年
 * @param {string} dateStr YYYY-MM-DD
 */
export function getRepublicEra(solarYear, dateStr) {
  if (solarYear >= 1912) {
    const rocYear = solarYear - 1911;
    const text = rocYear === 1 ? '民國元年' : `民國 ${rocYear} 年`;
    let note = '';
    // 清帝宣統退位重疊期 (1912-01-01 至 1912-02-12)
    if (dateStr >= '1912-01-01' && dateStr <= '1912-02-12') {
      note = '公曆已採民國紀年，清廷宣統帝尚未頒布退位詔書（農曆仍在宣統三年）。';
    }
    return {
      type: 'ROC',
      year: rocYear,
      text: text,
      fullText: text,
      note: note
    };
  } else {
    const preRocYear = 1912 - solarYear;
    const text = `民國前 ${preRocYear} 年`;
    return {
      type: 'PRE_ROC',
      year: preRocYear,
      text: text,
      fullText: text,
      note: ''
    };
  }
}

/**
 * 取得清朝帝號對照
 * 清代採踰年改元：以正月初一日為改元交接界線
 * @param {number} solarYear 西曆年
 * @param {string} dateStr YYYY-MM-DD
 * @param {object} lunarObj lunar-javascript 農曆物件
 */
export function getQingEra(solarYear, dateStr, lunarObj) {
  if (dateStr > '1912-02-12' || solarYear < 1723) {
    return null;
  }

  // 1912-01-01 至 1912-02-12 宣統退位前重疊期
  if (dateStr >= '1912-01-01' && dateStr <= '1912-02-12') {
    return {
      dynasty: '清',
      templeName: '清遜帝',
      eraName: '宣統',
      regnalYear: 3,
      text: '清遜帝 宣統 3 年',
      fullText: '清遜帝 宣統三年（清帝即將退位）',
      note: '宣統三年十二月廿五日（西元 1912-02-12）清遜帝溥儀頒布退位詔書，清廷統治正式告終。'
    };
  }

  // 依據西曆日期搜尋匹配的清代帝號
  for (const emp of QING_EMPERORS) {
    // 判斷是否在此帝號區間
    const isAfterStart = !emp.startSolarDate || dateStr >= emp.startSolarDate;
    const isBeforeEnd = !emp.endSolarDate || dateStr <= emp.endSolarDate;

    if (isAfterStart && isBeforeEnd) {
      // 計算年號年數
      // 由於清代踰年改元，農曆正月初一啟用新元
      // 農曆年份對應年數
      let regnalYear = solarYear - emp.startYear + 1;
      
      // 特殊情況：若在正月初一前，農曆仍屬先帝之年
      if (emp.startSolarDate && dateStr < emp.startSolarDate) {
        continue; // 還在前一個年號
      }
      
      const yearStr = formatRegnalYear(regnalYear);
      return {
        dynasty: emp.dynasty,
        templeName: emp.templeName,
        eraName: emp.eraName,
        regnalYear: regnalYear,
        text: `${emp.templeName} (${emp.eraName} ${yearStr})`,
        fullText: `${emp.dynasty}朝 ${emp.templeName} ${emp.eraName} ${yearStr}`,
        note: emp.note || ''
      };
    }
  }

  return null;
}

/**
 * 取得臺灣日治時期帝號與日本年號對照
 * 日本採即日改元，當日生效
 * 臺灣日治時期：1895-06-02 至 1945-10-25
 * @param {number} solarYear 西曆年
 * @param {string} dateStr YYYY-MM-DD
 */
export function getJapanEra(solarYear, dateStr) {
  // 檢查同日改元關鍵特例：
  // 1. 1912-07-30: 明治 45 年／大正元年（同日改元）
  if (dateStr === '1912-07-30') {
    return {
      isTaiwanPeriod: true,
      eraName: '明治／大正',
      text: '明治 45 年／大正元年（同日改元）',
      fullText: '日本日治時期：明治 45 年／大正元年（同日改元）',
      isTransitionDay: true,
      note: '1912 年 7 月 30 日明治天皇崩御，同日大正天皇即位頒詔改元。依日本一世一元即日改元規定，本日兼具明治四十五年與大正元年雙重屬性。'
    };
  }

  // 2. 1926-12-25: 大正 15 年／昭和元年（同日改元）
  if (dateStr === '1926-12-25') {
    return {
      isTaiwanPeriod: true,
      eraName: '大正／昭和',
      text: '大正 15 年／昭和元年（同日改元）',
      fullText: '日本日治時期：大正 15 年／昭和元年（同日改元）',
      isTransitionDay: true,
      note: '1926 年 12 月 25 日大正天皇崩御，同日昭和天皇即位改元昭和。1926 年僅最後 7 天為昭和元年。'
    };
  }

  // 1895 乙未割臺交接過渡期特例 (1895-01-01 至 1895-06-01)
  if (dateStr >= '1895-01-01' && dateStr < '1895-06-02') {
    return {
      isTaiwanPeriod: true,
      isPreTaiwanTransition: true,
      eraName: '明治',
      regnalYear: 28,
      text: '明治 28 年（割臺交接期）',
      fullText: '明治 28 年（清日割臺交接過渡期，6/2 正式日治）',
      note: '1895 年 4 月 17 日簽署馬關條約割臺，5 月 23 日成立臺灣民主國抗日，6 月 2 日清代表李經方與日方簽署交接文據後日治正式生效。'
    };
  }

  // 一般日本年號區間查詢
  for (const item of JAPAN_ERAS) {
    if (dateStr >= item.startSolarDate && dateStr <= item.endSolarDate) {
      // 計算年數：西曆年 - 開始年 + 1
      const startYear = parseInt(item.startSolarDate.split('-')[0], 10);
      const regnalYear = solarYear - startYear + 1;
      const yearStr = formatRegnalYear(regnalYear);

      // 判斷是否在臺灣日治時期 (1895-06-02 至 1945-10-25)
      const isTaiwanPeriod = dateStr >= '1895-06-02' && dateStr <= '1945-10-25';

      let note = item.note || '';
      if (dateStr === '1895-06-02') {
        note = '清廷全權代表李經方與日本第一任臺灣總督樺山資紀於基隆外海旗艦上簽署《交接臺灣文據》，日本統治正式生效。';
      } else if (dateStr === '1945-10-25') {
        note = '臺北公會堂（今中山堂）舉行中國戰區臺灣省受降典禮，臺灣光復，五十年日治時期正式劃下句點。';
      }

      return {
        isTaiwanPeriod: isTaiwanPeriod,
        eraName: item.eraName,
        emperorName: item.emperorName,
        regnalYear: regnalYear,
        text: `${item.eraName} ${yearStr}`,
        fullText: isTaiwanPeriod 
          ? `臺灣日治時期：${item.eraName} ${yearStr}`
          : `日本年號（非日治）：${item.eraName} ${yearStr}`,
        note: note
      };
    }
  }

  return null;
}

/**
 * 取得當日重大歷史界標
 * @param {string} dateStr YYYY-MM-DD
 */
export function getHistoricalMilestone(dateStr) {
  return HISTORICAL_MILESTONES[dateStr] || null;
}

/**
 * 整合取得指定日期的完整多維歷史紀年資訊
 * @param {number} solarYear 
 * @param {number} solarMonth 
 * @param {number} solarDay 
 * @param {object} lunarObj 
 */
export function getFullHistoricalContext(solarYear, solarMonth, solarDay, lunarObj) {
  const mStr = String(solarMonth).padStart(2, '0');
  const dStr = String(solarDay).padStart(2, '0');
  const dateStr = `${solarYear}-${mStr}-${dStr}`;

  const republic = getRepublicEra(solarYear, dateStr);
  const qing = getQingEra(solarYear, dateStr, lunarObj);
  const japan = getJapanEra(solarYear, dateStr);
  const milestone = getHistoricalMilestone(dateStr);

  return {
    dateStr,
    solarYear,
    solarMonth,
    solarDay,
    republic,
    qing,
    japan,
    milestone
  };
}
