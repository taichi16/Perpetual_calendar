/**
 * 主應用程式控制模組 (app.js)
 * 整合歷法推算、歷史紀年、月曆網格渲染、UI 互動與 PWA
 */

import { generateMonthGrid, MIN_YEAR, MAX_YEAR } from './calendar-core.js';
import { getLunarDayInfo, setLunarLib } from './lunar-calc.js';
import { getFullHistoricalContext } from './era-service.js';
import { parseSearchQuery } from './search-service.js';

// 初始化全域 Lunar
if (typeof window !== 'undefined' && window.Lunar) {
  setLunarLib(window.Lunar);
}

class PerpetualCalendarApp {
  constructor() {
    const today = new Date();
    this.currentYear = today.getFullYear();
    this.currentMonth = today.getMonth() + 1;
    this.selectedDate = {
      year: this.currentYear,
      month: this.currentMonth,
      day: today.getDate()
    };

    // 快取 DOM 元素
    this.dom = {
      grid: document.getElementById('calendar-grid'),
      periodTitle: document.getElementById('period-title'),
      periodSubTitle: document.getElementById('period-sub-title'),
      yearSelect: document.getElementById('year-select'),
      monthSelect: document.getElementById('month-select'),
      prevYearBtn: document.getElementById('prev-year-btn'),
      nextYearBtn: document.getElementById('next-year-btn'),
      prevMonthBtn: document.getElementById('prev-month-btn'),
      nextMonthBtn: document.getElementById('next-month-btn'),
      todayBtn: document.getElementById('today-btn'),
      themeToggleBtn: document.getElementById('theme-toggle-btn'),
      themeIcon: document.getElementById('theme-icon'),
      searchInput: document.getElementById('search-input'),
      searchBtn: document.getElementById('search-btn'),
      detailPanel: document.getElementById('detail-panel'),
      aboutBtn: document.getElementById('about-btn'),
      aboutModal: document.getElementById('about-modal'),
      modalCloseBtn: document.getElementById('modal-close-btn'),
      modalConfirmBtn: document.getElementById('modal-confirm-btn')
    };

    this.init();
  }

  init() {
    this.initTheme();
    this.populateYearOptions();
    this.bindEvents();
    this.render();
    this.registerPWA();
  }

  // 初始化深淺色主題
  initTheme() {
    const savedTheme = localStorage.getItem('pc_theme') || 
      (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    document.documentElement.setAttribute('data-theme', savedTheme);
    this.updateThemeIcon(savedTheme);
  }

  toggleTheme() {
    const current = document.documentElement.getAttribute('data-theme') || 'light';
    const next = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('pc_theme', next);
    this.updateThemeIcon(next);
  }

  updateThemeIcon(theme) {
    if (this.dom.themeIcon) {
      this.dom.themeIcon.textContent = theme === 'dark' ? '☀️' : '🌙';
    }
  }

  // 填裝 1726 - 2126 年份下拉選項
  populateYearOptions() {
    const select = this.dom.yearSelect;
    if (!select) return;
    select.innerHTML = '';
    for (let y = MIN_YEAR; y <= MAX_YEAR; y++) {
      const opt = document.createElement('option');
      opt.value = y;
      // 輔助標示重要歷史分期
      let eraTag = '';
      if (y >= 1723 && y <= 1735) eraTag = ` (雍正)`;
      else if (y >= 1736 && y <= 1795) eraTag = ` (乾隆)`;
      else if (y >= 1796 && y <= 1820) eraTag = ` (嘉慶)`;
      else if (y >= 1821 && y <= 1850) eraTag = ` (道光)`;
      else if (y >= 1851 && y <= 1861) eraTag = ` (咸豐)`;
      else if (y >= 1862 && y <= 1874) eraTag = ` (同治)`;
      else if (y >= 1875 && y <= 1908) eraTag = ` (光緒)`;
      else if (y >= 1909 && y <= 1911) eraTag = ` (宣統)`;
      else if (y === 1912) eraTag = ` (民國元年/明治45/大正)`;
      else if (y === 1926) eraTag = ` (大正15/昭和)`;
      else if (y === 1945) eraTag = ` (昭和20/光復)`;
      else if (y > 1912) eraTag = ` (民國 ${y - 1911})`;

      opt.textContent = `${y} 年${eraTag}`;
      select.appendChild(opt);
    }
  }

  // 事件綁定
  bindEvents() {
    // 年份與月份下拉
    this.dom.yearSelect.addEventListener('change', (e) => {
      this.currentYear = parseInt(e.target.value, 10);
      this.render();
    });

    this.dom.monthSelect.addEventListener('change', (e) => {
      this.currentMonth = parseInt(e.target.value, 10);
      this.render();
    });

    // 導覽按鈕
    this.dom.prevYearBtn.addEventListener('click', () => this.changeYear(-1));
    this.dom.nextYearBtn.addEventListener('click', () => this.changeYear(1));
    this.dom.prevMonthBtn.addEventListener('click', () => this.changeMonth(-1));
    this.dom.nextMonthBtn.addEventListener('click', () => this.changeMonth(1));

    // 今日按鈕
    this.dom.todayBtn.addEventListener('click', () => {
      const now = new Date();
      this.goToDate(now.getFullYear(), now.getMonth() + 1, now.getDate());
    });

    // 主題切換
    this.dom.themeToggleBtn.addEventListener('click', () => this.toggleTheme());

    // 搜尋跳轉
    const doSearch = () => {
      const query = this.dom.searchInput.value;
      const res = parseSearchQuery(query, this.currentYear);
      if (res) {
        let targetMonth = res.month || 1;
        let targetDay = res.day || 1;

        // 若搜尋節氣，查找該年該節氣具體日期
        if (res.targetTerm) {
          try {
            const solarYearObj = window.Lunar.Solar.fromYmd(res.year, 1, 1).getLunar().getJieQiTable();
            if (solarYearObj[res.targetTerm]) {
              const jqSolar = solarYearObj[res.targetTerm];
              targetMonth = jqSolar.getMonth();
              targetDay = jqSolar.getDay();
            }
          } catch(e) {}
        }

        this.goToDate(res.year, targetMonth, targetDay);
        this.showToast(`已跳轉至：${res.matchedDesc}`);
      } else {
        this.showToast('查無符合日期，請輸入如「光緒21」、「明治28」、「民國前17」、「1895-05-23」等關鍵字');
      }
    };

    this.dom.searchBtn.addEventListener('click', doSearch);
    this.dom.searchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') doSearch();
    });

    // 鍵盤快捷鍵（方向鍵翻頁、ESC 關閉彈窗）
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        closeModal();
      }
      // 若在輸入框中則不干涉
      if (document.activeElement === this.dom.searchInput) return;
      if (e.key === 'ArrowLeft') this.changeMonth(-1);
      else if (e.key === 'ArrowRight') this.changeMonth(1);
      else if (e.key === 'ArrowUp') this.changeYear(-1);
      else if (e.key === 'ArrowDown') this.changeYear(1);
    });

    // 關於本系統 彈跳視窗開關互動
    const openModal = () => {
      if (this.dom.aboutModal) {
        this.dom.aboutModal.removeAttribute('hidden');
        document.body.style.overflow = 'hidden';
      }
    };

    const closeModal = () => {
      if (this.dom.aboutModal) {
        this.dom.aboutModal.setAttribute('hidden', '');
        document.body.style.overflow = '';
      }
    };

    if (this.dom.aboutBtn) {
      this.dom.aboutBtn.addEventListener('click', openModal);
    }
    if (this.dom.modalCloseBtn) {
      this.dom.modalCloseBtn.addEventListener('click', closeModal);
    }
    if (this.dom.modalConfirmBtn) {
      this.dom.modalConfirmBtn.addEventListener('click', closeModal);
    }
    if (this.dom.aboutModal) {
      this.dom.aboutModal.addEventListener('click', (e) => {
        if (e.target === this.dom.aboutModal) {
          closeModal();
        }
      });
    }

    // 快捷預設用例按鈕 (TC-01 ~ TC-06 等)
    document.querySelectorAll('[data-preset-date]').forEach(chip => {
      chip.addEventListener('click', (e) => {
        const dateStr = e.currentTarget.getAttribute('data-preset-date');
        const [y, m, d] = dateStr.split('-').map(Number);
        this.goToDate(y, m, d);
      });
    });
  }

  changeYear(delta) {
    const nextY = this.currentYear + delta;
    if (nextY >= MIN_YEAR && nextY <= MAX_YEAR) {
      this.currentYear = nextY;
      this.render();
    }
  }

  changeMonth(delta) {
    let nextM = this.currentMonth + delta;
    let nextY = this.currentYear;
    if (nextM > 12) {
      nextM = 1;
      nextY++;
    } else if (nextM < 1) {
      nextM = 12;
      nextY--;
    }
    if (nextY >= MIN_YEAR && nextY <= MAX_YEAR) {
      this.currentYear = nextY;
      this.currentMonth = nextM;
      this.render();
    }
  }

  goToDate(year, month, day) {
    const clampedY = Math.max(MIN_YEAR, Math.min(MAX_YEAR, year));
    this.currentYear = clampedY;
    this.currentMonth = month;
    this.selectedDate = { year: clampedY, month, day };
    this.render();
  }

  // 渲染主畫面
  render() {
    this.dom.yearSelect.value = this.currentYear;
    this.dom.monthSelect.value = this.currentMonth;

    // 計算月中代表日的歷史紀年（用於頂部副標題）
    const midDayInfo = getLunarDayInfo(this.currentYear, this.currentMonth, 15);
    const midEraInfo = getFullHistoricalContext(this.currentYear, this.currentMonth, 15, midDayInfo.lunar.rawLunar);

    // 更新頂部標題
    const rocText = midEraInfo.republic.text;
    this.dom.periodTitle.innerHTML = `【西元 ${this.currentYear} 年 (${rocText}) ${String(this.currentMonth).padStart(2, '0')} 月】`;

    // 構建副標題（並列帝號）
    const subParts = [];
    if (midEraInfo.qing) subParts.push(midEraInfo.qing.text);
    if (midEraInfo.japan) subParts.push(midEraInfo.japan.text);
    this.dom.periodSubTitle.textContent = subParts.join(' · ') || '現代公曆紀年';

    // 產生並渲染網格
    const gridData = generateMonthGrid(this.currentYear, this.currentMonth, this.selectedDate);
    this.renderGrid(gridData);

    // 渲染右側面板
    this.renderDetailPanel();
  }

  // 渲染日曆網格
  renderGrid(gridData) {
    const container = this.dom.grid;
    container.innerHTML = '';

    gridData.cells.forEach(cell => {
      const cellEl = document.createElement('div');
      cellEl.className = 'day-cell';
      if (!cell.isCurrentMonth) cellEl.classList.add('other-month');
      if (cell.isToday) cellEl.classList.add('is-today');
      if (cell.isSelected) cellEl.classList.add('is-selected');

      const isWeekend = new Date(cell.year, cell.month - 1, cell.day).getDay() === 0 || 
                        new Date(cell.year, cell.month - 1, cell.day).getDay() === 6;

      // 檢查當日是否具備特殊印章標籤
      let tagHtml = '';
      if (cell.dayData) {
        // 節氣標籤
        if (cell.dayData.solarTerm && cell.dayData.solarTerm.current) {
          tagHtml += `<span class="tag-badge tag-jieqi">${cell.dayData.solarTerm.current}</span>`;
        }
        // 初一標籤（顯示月份如「五月」或「閏五月」）
        if (cell.dayData.lunar.dayName === '初一') {
          tagHtml += `<span class="tag-badge tag-first-day">${cell.dayData.lunar.monthName}</span>`;
        }
      }

      // 改元交接日標籤
      if (cell.eraData && cell.eraData.japan && cell.eraData.japan.isTransitionDay) {
        tagHtml += `<span class="tag-badge tag-transition">改元</span>`;
      }

      // 重大歷史界標
      if (cell.eraData && cell.eraData.milestone) {
        cellEl.classList.add('has-milestone');
        cellEl.title = cell.eraData.milestone;
      }

      // 農曆文字呈現
      let lunarDisplay = '';
      if (cell.dayData) {
        lunarDisplay = cell.dayData.lunar.dayName === '初一' 
          ? cell.dayData.lunar.monthName 
          : cell.dayData.lunar.dayName;
        // 若有節氣，日曆單元格優先呈現節氣名
        if (cell.dayData.solarTerm && cell.dayData.solarTerm.current) {
          lunarDisplay = cell.dayData.solarTerm.current;
        }
      }

      cellEl.innerHTML = `
        <div class="cell-top">
          <span class="solar-num ${isWeekend ? 'weekend-num' : ''}">${cell.day}</span>
          <div class="cell-tags">${tagHtml}</div>
        </div>
        <div class="cell-bottom">
          <span class="lunar-text">${lunarDisplay}</span>
        </div>
      `;

      // 點擊選擇該日
      cellEl.addEventListener('click', () => {
        this.selectedDate = { year: cell.year, month: cell.month, day: cell.day };
        // 若點擊非當月日期，同時翻月
        if (!cell.isCurrentMonth) {
          this.currentYear = cell.year;
          this.currentMonth = cell.month;
        }
        this.render();
      });

      container.appendChild(cellEl);
    });
  }

  // 渲染右側「當日多維歷史對照詳細面板」
  renderDetailPanel() {
    const { year, month, day } = this.selectedDate;
    let dayInfo = null;
    let eraInfo = null;
    try {
      dayInfo = getLunarDayInfo(year, month, day);
      eraInfo = getFullHistoricalContext(year, month, day, dayInfo.lunar.rawLunar);
    } catch(err) {
      console.error(err);
      return;
    }

    const panel = this.dom.detailPanel;
    panel.innerHTML = `
      <div class="panel-header">
        <div class="panel-solar-date">
          <span>📅 ${year} 年 ${month} 月 ${day} 日</span>
          <span class="panel-week">${dayInfo.solar.weekName}</span>
        </div>
        <div class="panel-julian">儒略日 (Julian Day): ${dayInfo.julianDay}</div>
      </div>

      <div class="panel-body">
        <!-- 農曆與生肖資訊 -->
        <div class="info-section">
          <div class="section-label">🌙 農曆歷法資訊</div>
          <div class="section-content">
            <strong>${dayInfo.lunar.monthName}${dayInfo.lunar.dayName}</strong>
            <div style="font-size: 0.88rem; color: var(--text-secondary); margin-top: 0.2rem;">
              歲次：${dayInfo.lunar.fullGanZhi}（生肖屬 ${dayInfo.lunar.shengXiao}）
            </div>
          </div>
        </div>

        <!-- 二十四節氣 -->
        <div class="info-section">
          <div class="section-label">🌿 二十四節氣（定氣法 UTC+8）</div>
          <div class="section-content">
            ${dayInfo.solarTerm.current ? `
              <div class="jieqi-box">
                <div class="jieqi-title">今日節氣：【${dayInfo.solarTerm.current}】</div>
                <div class="jieqi-time">交節準確時刻：${dayInfo.solarTerm.detail ? dayInfo.solarTerm.detail.fullTimeStr : '本日'}</div>
              </div>
            ` : `
              <div style="font-size: 0.88rem; color: var(--text-secondary);">
                今日無交節。
                ${dayInfo.solarTerm.nextName ? `次一節氣為<strong>【${dayInfo.solarTerm.nextName}】</strong>(${dayInfo.solarTerm.nextTime})` : ''}
              </div>
            `}
          </div>
        </div>

        <!-- 歷史多維紀年對照 -->
        <div class="info-section">
          <div class="section-label">🏛️ 歷史紀年對照（清朝 / 日治 / 民國）</div>
          <div class="era-list">
            <!-- 民國與民國前 -->
            <div class="era-item roc">
              <span class="era-name">${eraInfo.republic.text}</span>
              ${eraInfo.republic.note ? `<span class="era-desc">${eraInfo.republic.note}</span>` : ''}
            </div>

            <!-- 清朝帝號 -->
            ${eraInfo.qing ? `
              <div class="era-item qing">
                <span class="era-name">${eraInfo.qing.fullText}</span>
                <span class="era-desc">${eraInfo.qing.note}</span>
              </div>
            ` : ''}

            <!-- 日治時期帝號 -->
            ${eraInfo.japan ? `
              <div class="era-item japan">
                <span class="era-name">${eraInfo.japan.fullText}</span>
                <span class="era-desc">${eraInfo.japan.note}</span>
              </div>
            ` : ''}
          </div>
        </div>

        <!-- 重大歷史界標事件 -->
        ${eraInfo.milestone ? `
          <div class="milestone-box">
            <div class="milestone-title">📜 歷史重要界標</div>
            <div class="milestone-content">${eraInfo.milestone}</div>
          </div>
        ` : ''}
      </div>
    `;
  }

  showToast(msg) {
    let toast = document.getElementById('pc-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'pc-toast';
      toast.style.cssText = `
        position: fixed;
        bottom: 2rem;
        left: 50%;
        transform: translateX(-50%);
        background-color: var(--text-primary);
        color: var(--bg-surface);
        padding: 0.6rem 1.2rem;
        border-radius: 20px;
        font-size: 0.88rem;
        box-shadow: var(--shadow-md);
        z-index: 1000;
        transition: opacity 0.3s ease;
        pointer-events: none;
      `;
      document.body.appendChild(toast);
    }
    toast.textContent = msg;
    toast.style.opacity = '1';
    clearTimeout(this._toastTimer);
    this._toastTimer = setTimeout(() => {
      toast.style.opacity = '0';
    }, 2800);
  }

  // 註冊 PWA 離線快取
  registerPWA() {
    if ('serviceWorker' in navigator && window.location.protocol.startsWith('http')) {
      navigator.serviceWorker.register('./sw.js')
        .then(() => console.log('ServiceWorker registered successfully.'))
        .catch(err => console.log('ServiceWorker registration skipped or failed:', err));
    }
  }
}

// 啟動應用
window.addEventListener('DOMContentLoaded', () => {
  window.calendarApp = new PerpetualCalendarApp();
});
