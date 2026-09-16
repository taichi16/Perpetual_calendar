/**
 * 驗收測試用例 (test-cases.js)
 * 驗證 TC-01 至 TC-06 之歷史紀年與天文歷法準確度
 */

import { getLunarDayInfo, setLunarLib } from '../js/lunar-calc.js';
import { getFullHistoricalContext } from '../js/era-service.js';
import lunarPkg from '../js/lunar.js';

// 初始化 Lunar 庫
setLunarLib(lunarPkg);

console.log('====================================================');
console.log('   本地端歷史萬年曆 (1726-2126) 驗收測試用例驗證   ');
console.log('====================================================\n');

let passCount = 0;
let totalCount = 6;

function assert(condition, message) {
  if (!condition) {
    console.error(`❌ FAIL: ${message}`);
    throw new Error(`Assertion failed: ${message}`);
  } else {
    console.log(`  ✓ ${message}`);
  }
}

// ----------------------------------------------------
// TC-01: 1736-02-12（清代中葉、乾隆元年正月初一）
// ----------------------------------------------------
console.log('▶ 測試 TC-01: 1736-02-12 (乾隆登基新年號改元正月初一)');
{
  const dayInfo = getLunarDayInfo(1736, 2, 12);
  const eraInfo = getFullHistoricalContext(1736, 2, 12, dayInfo.lunar.rawLunar);
  
  assert(eraInfo.republic.text === '民國前 176 年', `民國前紀年應為 民國前 176 年 (實際: ${eraInfo.republic.text})`);
  assert(eraInfo.qing.templeName === '清高宗' && eraInfo.qing.eraName === '乾隆', `清代帝號應為 清高宗 乾隆 (實際: ${eraInfo.qing.text})`);
  assert(eraInfo.qing.regnalYear === 1, `乾隆年數應為 元年 (實際: ${eraInfo.qing.regnalYear})`);
  assert(dayInfo.lunar.monthName === '正月' && dayInfo.lunar.dayName === '初一', `農曆應為 正月初一 (實際: ${dayInfo.lunar.monthName}${dayInfo.lunar.dayName})`);
  assert(dayInfo.lunar.yearGanZhi === '丙辰', `年干支應為 丙辰 (實際: ${dayInfo.lunar.yearGanZhi})`);
  passCount++;
  console.log('  👉 TC-01 通過！\n');
}

// ----------------------------------------------------
// TC-02: 1895-05-23（乙未割臺期、臺灣民主國宣言）
// ----------------------------------------------------
console.log('▶ 測試 TC-02: 1895-05-23 (乙未割臺交接過渡期)');
{
  const dayInfo = getLunarDayInfo(1895, 5, 23);
  const eraInfo = getFullHistoricalContext(1895, 5, 23, dayInfo.lunar.rawLunar);

  assert(eraInfo.republic.text === '民國前 17 年', `民國前紀年應為 民國前 17 年 (實際: ${eraInfo.republic.text})`);
  assert(eraInfo.qing.eraName === '光緒' && eraInfo.qing.regnalYear === 21, `清代帝號應為 光緒 21 年 (實際: ${eraInfo.qing.text})`);
  assert(eraInfo.japan.eraName === '明治' && eraInfo.japan.regnalYear === 28, `日治時期標記應包含 明治 28 年 (實際: ${eraInfo.japan.text})`);
  assert(eraInfo.japan.isTaiwanPeriod === true, '應處於日治臺灣或割臺交接過渡期');
  assert(eraInfo.milestone !== null, '當日應有重大歷史界標事件註記（臺灣民主國宣言）');
  passCount++;
  console.log('  👉 TC-02 通過！\n');
}

// ----------------------------------------------------
// TC-03: 1912-07-30（明治改元大正同日交接）
// ----------------------------------------------------
console.log('▶ 測試 TC-03: 1912-07-30 (明治/大正 同日即日改元)');
{
  const dayInfo = getLunarDayInfo(1912, 7, 30);
  const eraInfo = getFullHistoricalContext(1912, 7, 30, dayInfo.lunar.rawLunar);

  assert(eraInfo.republic.text === '民國元年', `民國紀年應為 民國元年 (實際: ${eraInfo.republic.text})`);
  assert(eraInfo.japan.isTransitionDay === true, '應標記為改元交接日');
  assert(eraInfo.japan.text.includes('明治 45 年／大正元年'), `應標註為明治 45 年／大正元年 (實際: ${eraInfo.japan.text})`);
  passCount++;
  console.log('  👉 TC-03 通過！\n');
}

// ----------------------------------------------------
// TC-04: 1926-12-25（大正改元昭和同日交接）
// ----------------------------------------------------
console.log('▶ 測試 TC-04: 1926-12-25 (大正/昭和 同日即日改元)');
{
  const dayInfo = getLunarDayInfo(1926, 12, 25);
  const eraInfo = getFullHistoricalContext(1926, 12, 25, dayInfo.lunar.rawLunar);

  assert(eraInfo.republic.text === '民國 15 年', `民國紀年應為 民國 15 年 (實際: ${eraInfo.republic.text})`);
  assert(eraInfo.japan.isTransitionDay === true, '應標記為改元交接日');
  assert(eraInfo.japan.text.includes('大正 15 年／昭和元年'), `應標註為大正 15 年／昭和元年 (實際: ${eraInfo.japan.text})`);
  passCount++;
  console.log('  👉 TC-04 通過！\n');
}

// ----------------------------------------------------
// TC-05: 1912-01-15（清帝退位前重疊期）
// ----------------------------------------------------
console.log('▶ 測試 TC-05: 1912-01-15 (民國元年立但清宣統未退位重疊期)');
{
  const dayInfo = getLunarDayInfo(1912, 1, 15);
  const eraInfo = getFullHistoricalContext(1912, 1, 15, dayInfo.lunar.rawLunar);

  assert(eraInfo.republic.text === '民國元年', `民國紀年應為 民國元年 (實際: ${eraInfo.republic.text})`);
  assert(eraInfo.qing !== null && eraInfo.qing.eraName === '宣統', `清代年號應標示 宣統 (實際: ${eraInfo.qing?.text})`);
  assert(dayInfo.lunar.monthName.includes('冬月') || dayInfo.lunar.monthName.includes('十一月'), `農曆月應為十一月(冬月) (實際: ${dayInfo.lunar.monthName})`);
  assert(dayInfo.lunar.dayName === '廿七', `農曆日應為廿七 (實際: ${dayInfo.lunar.dayName})`);
  passCount++;
  console.log('  👉 TC-05 通過！\n');
}

// ----------------------------------------------------
// TC-06: 2026-03-20（未來節氣與農曆驗證）
// ----------------------------------------------------
console.log('▶ 測試 TC-06: 2026-03-20 (春分節氣與交節時分、農曆)');
{
  const dayInfo = getLunarDayInfo(2026, 3, 20);
  const eraInfo = getFullHistoricalContext(2026, 3, 20, dayInfo.lunar.rawLunar);

  assert(eraInfo.republic.text === '民國 115 年', `民國紀年應為 民國 115 年 (實際: ${eraInfo.republic.text})`);
  assert(dayInfo.lunar.monthName === '二月' && dayInfo.lunar.dayName === '初二', `農曆應為二月初二 (實際: ${dayInfo.lunar.monthName}${dayInfo.lunar.dayName})`);
  assert(dayInfo.solarTerm.current === '春分', `當日節氣應為 春分 (實際: ${dayInfo.solarTerm.current})`);
  assert(dayInfo.solarTerm.detail !== null && dayInfo.solarTerm.detail.timeStr.length > 0, `應具備交節精確時刻 (實際: ${dayInfo.solarTerm.detail?.timeStr})`);
  passCount++;
  console.log(`  ✓ 2026 春分精確時刻：${dayInfo.solarTerm.detail.fullTimeStr}`);
  console.log('  👉 TC-06 通過！\n');
}

console.log('====================================================');
console.log(`🎉 測試結果：${passCount}/${totalCount} 全部通過 (ALL PASS)`);
console.log('====================================================');
