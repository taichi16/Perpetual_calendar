/**
 * 月曆核心計算與狀態管理 (calendar-core.js)
 * 負責公曆網格計算、前導/後續日期補齊、跨度 (1726-2126) 限制與當選狀態維護
 */

import { getLunarDayInfo } from './lunar-calc.js';
import { getFullHistoricalContext } from './era-service.js';

export const MIN_YEAR = 1726;
export const MAX_YEAR = 2126;

/**
 * 取得指定公曆年月的天數
 */
export function getDaysInMonth(year, month) {
  return new Date(year, month, 0).getDate();
}

/**
 * 判斷指定年月日是否為「今天」
 */
export function isToday(year, month, day) {
  const now = new Date();
  return (
    now.getFullYear() === year &&
    now.getMonth() + 1 === month &&
    now.getDate() === day
  );
}

/**
 * 產生指定年月的月曆網格資料（包含上月補齊與下月補齊）
 * @param {number} year 
 * @param {number} month 1-12
 * @param {object} selectedDate { year, month, day }
 */
export function generateMonthGrid(year, month, selectedDate) {
  // 年份邊界保護
  const clampedYear = Math.max(MIN_YEAR, Math.min(MAX_YEAR, year));
  
  // 該月第 1 天的星期 (0 是週日, 6 是週六)
  const firstDayWeek = new Date(clampedYear, month - 1, 1).getDay();
  // 該月總天數
  const daysInCurMonth = getDaysInMonth(clampedYear, month);
  
  // 上個月的年份與月份
  const prevMonthYear = month === 1 ? clampedYear - 1 : clampedYear;
  const prevMonth = month === 1 ? 12 : month - 1;
  const daysInPrevMonth = getDaysInMonth(prevMonthYear, prevMonth);

  // 下個月的年份與月份
  const nextMonthYear = month === 12 ? clampedYear + 1 : clampedYear;
  const nextMonth = month === 12 ? 1 : month + 1;

  const cells = [];

  // 1. 上月補齊格子 (Leading days)
  for (let i = firstDayWeek - 1; i >= 0; i--) {
    const day = daysInPrevMonth - i;
    const canCalculate = prevMonthYear >= MIN_YEAR;
    let dayData = null;
    let eraData = null;
    if (canCalculate) {
      dayData = getLunarDayInfo(prevMonthYear, prevMonth, day);
      eraData = getFullHistoricalContext(prevMonthYear, prevMonth, day, dayData.lunar.rawLunar);
    }
    cells.push({
      year: prevMonthYear,
      month: prevMonth,
      day: day,
      isCurrentMonth: false,
      isToday: isToday(prevMonthYear, prevMonth, day),
      isSelected: selectedDate && selectedDate.year === prevMonthYear && selectedDate.month === prevMonth && selectedDate.day === day,
      dayData,
      eraData
    });
  }

  // 2. 當月所有天數 (Current month days)
  for (let day = 1; day <= daysInCurMonth; day++) {
    const dayData = getLunarDayInfo(clampedYear, month, day);
    const eraData = getFullHistoricalContext(clampedYear, month, day, dayData.lunar.rawLunar);

    cells.push({
      year: clampedYear,
      month: month,
      day: day,
      isCurrentMonth: true,
      isToday: isToday(clampedYear, month, day),
      isSelected: selectedDate && selectedDate.year === clampedYear && selectedDate.month === month && selectedDate.day === day,
      dayData,
      eraData
    });
  }

  // 3. 下月補齊格子 (Trailing days，使總天數補足至 35 或 42 格整齊排版)
  const remaining = (7 - (cells.length % 7)) % 7;
  // 若總格子少於 35 格，補齊至 35 格或 42 格
  const totalTarget = cells.length + remaining <= 35 ? 35 : 42;
  const trailingCount = totalTarget - cells.length;

  for (let day = 1; day <= trailingCount; day++) {
    const canCalculate = nextMonthYear <= MAX_YEAR;
    let dayData = null;
    let eraData = null;
    if (canCalculate) {
      dayData = getLunarDayInfo(nextMonthYear, nextMonth, day);
      eraData = getFullHistoricalContext(nextMonthYear, nextMonth, day, dayData.lunar.rawLunar);
    }
    cells.push({
      year: nextMonthYear,
      month: nextMonth,
      day: day,
      isCurrentMonth: false,
      isToday: isToday(nextMonthYear, nextMonth, day),
      isSelected: selectedDate && selectedDate.year === nextMonthYear && selectedDate.month === nextMonth && selectedDate.day === day,
      dayData,
      eraData
    });
  }

  return {
    year: clampedYear,
    month: month,
    cells: cells
  };
}
