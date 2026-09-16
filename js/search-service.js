/**
 * 智慧快速搜尋跳轉服務 (search-service.js)
 * 支援年號（清代、日治）、民國/民國前、公曆日期、節氣與歷史重大事件關鍵字
 */

import { HISTORICAL_MILESTONES } from './era-data.js';

// 節氣名稱列表
const SOLAR_TERMS = [
  '立春', '雨水', '驚蟄', '春分', '清明', '穀雨',
  '立夏', '小滿', '芒種', '夏至', '小暑', '大暑',
  '立秋', '處暑', '白露', '秋分', '寒露', '霜降',
  '立冬', '小雪', '大雪', '冬至', '小寒', '大寒'
];

/**
 * 解析使用者輸入字串並推算目標年月日
 * @param {string} rawQuery 使用者輸入文字
 * @param {number} currentYear 當前瀏覽中的西曆年
 * @returns {object|null} { year, month, day, matchedDesc }
 */
export function parseSearchQuery(rawQuery, currentYear = new Date().getFullYear()) {
  if (!rawQuery || typeof rawQuery !== 'string') return null;
  const q = rawQuery.trim().replace(/\s+/g, '');
  if (!q) return null;

  // 1. 標準或彈性西曆日期格式 (如 1895-05-23, 1895/5/23, 1895.5.23, 18950523)
  const dateMatch = q.match(/^(\d{4})[-/.]?(\d{1,2})[-/.]?(\d{1,2})$/);
  if (dateMatch) {
    const y = parseInt(dateMatch[1], 10);
    const m = parseInt(dateMatch[2], 10);
    const d = parseInt(dateMatch[3], 10);
    if (y >= 1726 && y <= 2126 && m >= 1 && m <= 12 && d >= 1 && d <= 31) {
      return { year: y, month: m, day: d, matchedDesc: `西曆 ${y} 年 ${m} 月 ${d} 日` };
    }
  }

  // 僅輸入西曆年份 (如 1895, 1736, 2026)
  const yearOnlyMatch = q.match(/^(\d{4})年?$/);
  if (yearOnlyMatch) {
    const y = parseInt(yearOnlyMatch[1], 10);
    if (y >= 1726 && y <= 2126) {
      return { year: y, month: 1, day: 1, matchedDesc: `西曆 ${y} 年` };
    }
  }

  // 2. 民國前搜尋 (如 民國前17年, 民前17, 民國前1)
  const preRocMatch = q.match(/^(?:民國前|民前)(\d{1,3})年?$/);
  if (preRocMatch) {
    const preYears = parseInt(preRocMatch[1], 10);
    const y = 1912 - preYears;
    if (y >= 1726 && y <= 2126) {
      return { year: y, month: 1, day: 1, matchedDesc: `民國前 ${preYears} 年 (西元 ${y} 年)` };
    }
  }

  // 3. 民國紀年搜尋 (如 民國元年, 民國84, 民國115年, 民84)
  const rocMatch = q.match(/^(?:民國|民)(元年|\d{1,3})年?$/);
  if (rocMatch) {
    const rocYears = rocMatch[1] === '元年' ? 1 : parseInt(rocMatch[1], 10);
    const y = 1911 + rocYears;
    if (y >= 1726 && y <= 2126) {
      return { year: y, month: 1, day: 1, matchedDesc: `民國 ${rocMatch[1]} (西元 ${y} 年)` };
    }
  }

  // 4. 清代帝號年號搜尋 (如 乾隆元年, 乾隆60年, 雍正4, 光緒21, 宣統3)
  const qingMap = {
    '雍正': 1722, // 1722 + 1 = 1723 (元年)
    '乾隆': 1735, // 1735 + 1 = 1736 (元年)
    '嘉慶': 1795,
    '道光': 1820,
    '咸豐': 1850,
    '同治': 1861,
    '光緒': 1874,
    '宣統': 1908
  };
  for (const [era, baseYear] of Object.entries(qingMap)) {
    if (q.startsWith(era)) {
      const rest = q.slice(era.length).replace(/年$/, '');
      const regnal = rest === '' || rest === '元年' ? 1 : parseInt(rest, 10);
      if (!isNaN(regnal) && regnal >= 1) {
        const y = baseYear + regnal;
        if (y >= 1726 && y <= 2126) {
          return { year: y, month: 1, day: 1, matchedDesc: `清 ${era} ${regnal === 1 ? '元年' : regnal + '年'} (西元 ${y} 年)` };
        }
      }
    }
  }

  // 5. 日治帝號搜尋 (如 明治28, 明治45, 大正元年, 大正15, 昭和20, 昭和元年, 平成, 令和)
  const japanMap = {
    '明治': 1867,
    '大正': 1911,
    '昭和': 1925,
    '平成': 1988,
    '令和': 2018
  };
  for (const [era, baseYear] of Object.entries(japanMap)) {
    if (q.startsWith(era)) {
      const rest = q.slice(era.length).replace(/年$/, '');
      const regnal = rest === '' || rest === '元年' ? 1 : parseInt(rest, 10);
      if (!isNaN(regnal) && regnal >= 1) {
        const y = baseYear + regnal;
        if (y >= 1726 && y <= 2126) {
          return { year: y, month: 1, day: 1, matchedDesc: `日治／日本 ${era} ${regnal === 1 ? '元年' : regnal + '年'} (西元 ${y} 年)` };
        }
      }
    }
  }

  // 6. 歷史重大事件關鍵字搜尋 (如 馬關條約, 割臺, 民主國, 始政, 光復, 退位)
  for (const [dateStr, desc] of Object.entries(HISTORICAL_MILESTONES)) {
    if (desc.includes(q) || (q.length >= 2 && q.includes(desc.slice(0, 4)))) {
      const [y, m, d] = dateStr.split('-').map(Number);
      return { year: y, month: m, day: d, matchedDesc: `歷史事件：${desc}` };
    }
  }

  // 7. 二十四節氣搜尋 (如 春分, 清明, 冬至, 立夏 等)
  for (const term of SOLAR_TERMS) {
    if (q.includes(term)) {
      return {
        year: currentYear,
        month: null, // 由後續動態查詢該年該節氣日期
        day: null,
        targetTerm: term,
        matchedDesc: `${currentYear} 年節氣【${term}】`
      };
    }
  }

  return null;
}
