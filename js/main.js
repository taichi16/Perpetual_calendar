/**
 * 本地端歷史萬年曆 (1726-2126) 核心自包含主腳本 (main.js)
 * 無需 ES Modules、零 CORS 限制，完全相容 file:// 協議（本機雙擊即開）與 http:// 伺服器
 */

(function (window) {
  'use strict';

  // ==========================================
  // 1. 歷史紀年資料庫 (QING_EMPERORS, JAPAN_ERAS, HISTORICAL_MILESTONES)
  // ==========================================
  const QING_EMPERORS = [
    {
      dynasty: '清',
      templeName: '清世宗',
      eraName: '雍正',
      startYear: 1723,
      endYear: 1735,
      endSolarDate: '1736-02-11',
      note: '雍正十三年八月世宗崩，依踰年改元定制，至除夕仍稱雍正十三年。'
    },
    {
      dynasty: '清',
      templeName: '清高宗',
      eraName: '乾隆',
      startYear: 1736,
      endYear: 1795,
      startSolarDate: '1736-02-12',
      endSolarDate: '1796-02-08',
      note: '乾隆六十年底禪位予嘉慶帝，次年正月初一日改元嘉慶，高宗為太上皇帝。'
    },
    {
      dynasty: '清',
      templeName: '清仁宗',
      eraName: '嘉慶',
      startYear: 1796,
      endYear: 1820,
      startSolarDate: '1796-02-09',
      endSolarDate: '1821-02-02',
      note: '嘉慶二十五年七月仁宗崩於避暑山莊，宣宗即位，次年正月初一改元道光。'
    },
    {
      dynasty: '清',
      templeName: '清宣宗',
      eraName: '道光',
      startYear: 1821,
      endYear: 1850,
      startSolarDate: '1821-02-03',
      endSolarDate: '1851-01-31',
      note: '道光三十年正月宣宗崩，文宗即位，次年正月初一改元咸豐。'
    },
    {
      dynasty: '清',
      templeName: '清文宗',
      eraName: '咸豐',
      startYear: 1851,
      endYear: 1861,
      startSolarDate: '1851-02-01',
      endSolarDate: '1862-01-29',
      note: '咸豐十一年七月文宗崩於熱河，原擬改元「祺祥」，辛酉政變後廢除，次年正月初一改元同治。'
    },
    {
      dynasty: '清',
      templeName: '清穆宗',
      eraName: '同治',
      startYear: 1862,
      endYear: 1874,
      startSolarDate: '1862-01-30',
      endSolarDate: '1875-02-05',
      note: '同治十三年十二月初五日穆宗崩，德宗即位，次年正月初一改元光緒。'
    },
    {
      dynasty: '清',
      templeName: '清德宗',
      eraName: '光緒',
      startYear: 1875,
      endYear: 1908,
      startSolarDate: '1875-02-06',
      endSolarDate: '1909-01-21',
      note: '光緒三十四年十月德宗與慈禧太后相繼崩逝，宣統帝即位，次年正月初一改元宣統。'
    },
    {
      dynasty: '清',
      templeName: '清遜帝',
      eraName: '宣統',
      startYear: 1909,
      endYear: 1911,
      startSolarDate: '1909-01-22',
      endSolarDate: '1912-02-12',
      note: '宣統三年十二月廿五日（西曆 1912 年 2 月 12 日）隆裕太后頒布清帝遜位詔書，清廷統治正式終結。'
    }
  ];

  const JAPAN_ERAS = [
    {
      eraName: '明治',
      emperorName: '明治天皇',
      startSolarDate: '1868-01-25',
      taiwanStartDate: '1895-06-02',
      endSolarDate: '1912-07-30',
      note: '1895 年 6 月 2 日簽署交接文據，日治正式開始。1912 年 7 月 30 日明治天皇崩，同日即日改元大正。'
    },
    {
      eraName: '大正',
      emperorName: '大正天皇',
      startSolarDate: '1912-07-30',
      endSolarDate: '1926-12-25',
      note: '1912 年 7 月 30 日即日改元大正（明治 45 年兼大正元年）。1926 年 12 月 25 日大正天皇崩，同日即日改元昭和。'
    },
    {
      eraName: '昭和',
      emperorName: '昭和天皇',
      startSolarDate: '1926-12-25',
      taiwanEndDate: '1945-10-25',
      endSolarDate: '1989-01-07',
      note: '1926 年 12 月 25 日同日改元昭和（大正 15 年兼昭和元年）。1945 年 10 月 25 日臺北受降典禮，臺灣日治終止。'
    },
    {
      eraName: '平成',
      emperorName: '明仁天皇（上皇）',
      startSolarDate: '1989-01-08',
      endSolarDate: '2019-04-30',
      note: '日本本土年號（非臺灣日治）。'
    },
    {
      eraName: '令和',
      emperorName: '德仁天皇',
      startSolarDate: '2019-05-01',
      endSolarDate: '2199-12-31',
      note: '日本本土現行年號。'
    }
  ];

  const HISTORICAL_MILESTONES = {
    '1895-04-17': '清日簽署《馬關條約》，清廷割讓臺灣、澎湖群島予日本。',
    '1895-05-23': '臺灣紳民發表《臺灣民主國自主宣言》（乙未割臺抗爭交接期）。',
    '1895-05-29': '日軍近衛師團於澳底登陸。',
    '1895-06-02': '清代表李經方與日方樺山資紀於基隆外海簽署《交接臺灣文據》，日治統治生效。',
    '1895-06-17': '臺灣總督府於臺北舉行「始政式」（始政紀念日）。',
    '1911-10-10': '武昌起義爆發，辛亥革命推翻滿清帝制。',
    '1912-01-01': '中華民國南京臨時政府成立，孫中山宣誓就職，是日為民國元年元旦。',
    '1912-02-12': '清宣統帝溥儀頒布《退位詔書》，清朝對全國統治正式告終。',
    '1912-07-30': '明治天皇崩御，大正天皇即位，同日頒布改元詔書改元大正（明治45年／大正元年同日）。',
    '1926-12-25': '大正天皇崩御，昭和天皇即位，同日頒布改元詔書改元昭和（大正15年／昭和元年同日）。',
    '1945-08-15': '日本昭和天皇宣讀《終戰詔書》（玉音放送），無條件投降。',
    '1945-10-25': '臺北公會堂（今中山堂）舉行受降典禮，臺灣光復，日治結束。',
    '1989-01-07': '昭和天皇崩御，昭和六十四年終。翌日（1月8日）改元平成。',
    '2019-04-30': '明仁天皇退位，平成三十一年終。翌日（5月1日）德仁天皇即位改元令和。'
  };

  // 100% 正體中文（繁體）十二生肖對映表
  const SHENG_XIAO_TRAD = {
    '鼠': '鼠', '牛': '牛', '虎': '虎', '兔': '兔',
    '龙': '龍', '龍': '龍',
    '蛇': '蛇',
    '马': '馬', '馬': '馬',
    '羊': '羊', '猴': '猴',
    '鸡': '雞', '鷄': '雞', '雞': '雞',
    '狗': '狗',
    '猪': '豬', '豬': '豬'
  };

  // 100% 正體中文（繁體）二十四節氣對映表
  const SOLAR_TERMS_TRAD = {
    '立春': '立春', '雨水': '雨水', '惊蛰': '驚蟄', '驚蟄': '驚蟄',
    '春分': '春分', '清明': '清明', '谷雨': '穀雨', '穀雨': '穀雨',
    '立夏': '立夏', '小满': '小滿', '小滿': '小滿', '芒种': '芒種', '芒種': '芒種',
    '夏至': '夏至', '小暑': '小暑', '大暑': '大暑', '立秋': '立秋',
    '处暑': '處暑', '處暑': '處暑', '白露': '白露', '秋分': '秋分',
    '寒露': '寒露', '霜降': '霜降', '立冬': '立冬', '小雪': '小雪',
    '大雪': '大雪', '冬至': '冬至', '小寒': '小寒', '大寒': '大寒'
  };

  // 通用簡體轉繁體字元字典
  const SIMP_TO_TRAD = {
    '鸡': '雞', '鷄': '雞', '马': '馬', '龙': '龍', '猪': '豬',
    '闰': '閏', '腊': '臘', '惊': '驚', '蛰': '蟄', '谷': '穀',
    '满': '滿', '芒': '芒', '种': '種', '处': '處', '国': '國',
    '台': '臺', '湾': '灣', '历': '曆', '书': '書', '终': '終',
    '战': '戰', '降': '降', '署': '署', '万': '萬', '节': '節',
    '气': '氣', '显': '顯', '示': '示', '间': '間', '条': '條',
    '约': '約', '统': '統', '后': '後', '继': '繼', '宪': '憲',
    '会': '會', '总': '總', '督': '督', '府': '府', '纪': '紀',
    '录': '錄', '报': '報', '开': '開', '关': '關', '双': '雙',
    '两': '兩', '为': '為', '仅': '僅', '虽': '雖', '与': '與',
    '从': '從', '东': '東', '时': '時', '区': '區', '准': '準',
    '备': '備', '注': '註', '这': '這', '查': '查', '询': '詢',
    '跳': '跳', '转': '轉', '实': '實', '现': '現', '数': '數',
    '据': '據', '库': '庫', '算': '算', '法': '法', '页': '頁',
    '选': '選', '择': '擇', '项': '項', '标': '標', '签': '籤',
    '题': '題', '内': '內', '容': '容', '详': '詳', '细': '細',
    '板': '板', '单': '單', '元': '元', '格': '格', '网': '網',
    '络': '絡', '点': '點', '击': '擊', '设': '設', '置': '置',
    '浅': '淺', '深': '深', '色': '色', '换': '換', '输': '輸',
    '入': '入', '键': '鍵', '盘': '盤', '快': '快', '捷': '捷',
    '岁': '歲', '次': '次', '生': '生', '肖': '肖', '属': '屬',
    '义': '義', '乐': '樂', '产': '產', '传': '傳', '伪': '偽',
    '优': '優', '体': '體', '余': '餘', '佛': '佛', '克': '克',
    '免': '免', '兑': '兌', '党': '黨', '兰': '蘭', '关': '關',
    '兽': '獸', '内': '內', '冈': '岡', '册': '冊', '军': '軍',
    '农': '農', '冠': '冠', '冬': '冬', '冰': '冰', '冲': '衝',
    '决': '決', '况': '況', '冷': '冷', '凉': '涼', '凌': '凌',
    '准': '準', '几': '幾', '凤': '鳳', '凯': '凱', '刘': '劉',
    '创': '創', '初': '初', '别': '別', '制': '制', '刷': '刷',
    '券': '券', '刺': '刺', '刻': '刻', '剂': '劑', '剧': '劇',
    '劝': '勸', '办': '辦', '功': '功', '加': '加', '务': '務',
    '动': '動', '劣': '劣', '助': '助', '劳': '勞', '势': '勢',
    '勋': '勳', '励': '勵', '劝': '勸', '匀': '勻', '包': '包',
    '化': '化', '北': '北', '区': '區', '医': '醫', '千': '千'
  };

  // 全域字串繁體化轉換工具
  function toTrad(text) {
    if (!text || typeof text !== 'string') return text;
    let res = '';
    for (let i = 0; i < text.length; i++) {
      const ch = text[i];
      res += SIMP_TO_TRAD[ch] || ch;
    }
    return res;
  }

  const SOLAR_TERMS = [
    '立春', '雨水', '驚蟄', '春分', '清明', '穀雨',
    '立夏', '小滿', '芒種', '夏至', '小暑', '大暑',
    '立秋', '處暑', '白露', '秋分', '寒露', '霜降',
    '立冬', '小雪', '大雪', '冬至', '小寒', '大寒'
  ];

  const WEEK_DAYS = ['日', '一', '二', '三', '四', '五', '六'];
  const MIN_YEAR = 1726;
  const MAX_YEAR = 2126;

  // ==========================================
  // 2. 歷史紀年推算服務 (era-service)
  // ==========================================
  function formatRegnalYear(num) {
    if (num === 1) return '元年';
    return `${num} 年`;
  }

  function getRepublicEra(solarYear, dateStr) {
    if (solarYear >= 1912) {
      const rocYear = solarYear - 1911;
      const text = rocYear === 1 ? '民國元年' : `民國 ${rocYear} 年`;
      let note = '';
      if (dateStr >= '1912-01-01' && dateStr <= '1912-02-12') {
        note = '公曆已採民國紀年，清廷宣統帝尚未頒布退位詔書（農曆仍在宣統三年）。';
      }
      return { type: 'ROC', year: rocYear, text, fullText: text, note };
    } else {
      const preRocYear = 1912 - solarYear;
      const text = `民國前 ${preRocYear} 年`;
      return { type: 'PRE_ROC', year: preRocYear, text, fullText: text, note: '' };
    }
  }

  function getQingEra(solarYear, dateStr) {
    if (dateStr > '1912-02-12' || solarYear < 1723) return null;

    if (dateStr >= '1912-01-01' && dateStr <= '1912-02-12') {
      return {
        dynasty: '清',
        templeName: '清遜帝',
        eraName: '宣統',
        regnalYear: 3,
        text: '清遜帝 宣統 3 年',
        fullText: '清遜帝 宣統三年（清帝即將退位）',
        note: '宣統三年十二月廿五日（西曆 1912-02-12）清遜帝溥儀頒布退位詔書，清廷統治正式告終。'
      };
    }

    for (const emp of QING_EMPERORS) {
      const isAfterStart = !emp.startSolarDate || dateStr >= emp.startSolarDate;
      const isBeforeEnd = !emp.endSolarDate || dateStr <= emp.endSolarDate;

      if (isAfterStart && isBeforeEnd) {
        let regnalYear = solarYear - emp.startYear + 1;
        if (emp.startSolarDate && dateStr < emp.startSolarDate) continue;
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

  function getJapanEra(solarYear, dateStr) {
    if (dateStr === '1912-07-30') {
      return {
        isTaiwanPeriod: true,
        eraName: '明治／大正',
        text: '明治 45 年／大正元年（同日改元）',
        fullText: '日本日治時期：明治 45 年／大正元年（同日改元）',
        isTransitionDay: true,
        note: '1912 年 7 月 30 日明治天皇崩御，同日大正天皇即位頒詔改元。本日兼具明治四十五年與大正元年雙重屬性。'
      };
    }

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

    if (dateStr >= '1895-01-01' && dateStr < '1895-06-02') {
      return {
        isTaiwanPeriod: true,
        isPreTaiwanTransition: true,
        eraName: '明治',
        regnalYear: 28,
        text: '明治 28 年（割臺交接期）',
        fullText: '明治 28 年（清日割臺交接過渡期，6/2 正式日治）',
        note: '1895 年 4 月 17 日簽署馬關條約割臺，5 月 23 日成立臺灣民主國抗日，6 月 2 日簽署交接文據後日治正式生效。'
      };
    }

    for (const item of JAPAN_ERAS) {
      if (dateStr >= item.startSolarDate && dateStr <= item.endSolarDate) {
        const startYear = parseInt(item.startSolarDate.split('-')[0], 10);
        const regnalYear = solarYear - startYear + 1;
        const yearStr = formatRegnalYear(regnalYear);
        const isTaiwanPeriod = dateStr >= '1895-06-02' && dateStr <= '1945-10-25';

        let note = item.note || '';
        if (dateStr === '1895-06-02') {
          note = '清廷全權代表李經方與日本第一任臺灣總督樺山資紀於基隆外海簽署《交接臺灣文據》，日治統治正式生效。';
        } else if (dateStr === '1945-10-25') {
          note = '臺北公會堂（今中山堂）舉行中國戰區臺灣省受降典禮，臺灣光復，五十年日治時期劃下句點。';
        }

        return {
          isTaiwanPeriod,
          eraName: item.eraName,
          emperorName: item.emperorName,
          regnalYear,
          text: `${item.eraName} ${yearStr}`,
          fullText: isTaiwanPeriod 
            ? `臺灣日治時期：${item.eraName} ${yearStr}`
            : `日本年號（非日治）：${item.eraName} ${yearStr}`,
          note
        };
      }
    }
    return null;
  }

  function getHistoricalMilestone(dateStr) {
    return HISTORICAL_MILESTONES[dateStr] || null;
  }

  function getFullHistoricalContext(solarYear, solarMonth, solarDay, lunarObj) {
    const mStr = String(solarMonth).padStart(2, '0');
    const dStr = String(solarDay).padStart(2, '0');
    const dateStr = `${solarYear}-${mStr}-${dStr}`;

    const republic = getRepublicEra(solarYear, dateStr);
    const qing = getQingEra(solarYear, dateStr);
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

  // ==========================================
  // 3. 農曆與節氣推算 (lunar-calc)
  // ==========================================
  function getSolar() {
    if (typeof window !== 'undefined') {
      if (window.Solar) return window.Solar;
      if (window.LunarPkg && window.LunarPkg.Solar) return window.LunarPkg.Solar;
      if (window.Lunar && window.Lunar.Solar) return window.Lunar.Solar;
    }
    if (typeof globalThis !== 'undefined') {
      if (globalThis.Solar) return globalThis.Solar;
      if (globalThis.LunarPkg && globalThis.LunarPkg.Solar) return globalThis.LunarPkg.Solar;
    }
    return null;
  }

  function getLunarDayInfo(year, month, day) {
    const Solar = getSolar();
    if (!Solar) {
      throw new Error('Solar/Lunar library is not available.');
    }

    const solar = Solar.fromYmd(year, month, day);
    const lunar = solar.getLunar();

    const weekIndex = solar.getWeek();
    const weekName = `星期${WEEK_DAYS[weekIndex]}`;

    const lunarYear = lunar.getYear();
    const lunarMonth = lunar.getMonth();
    const isLeap = lunarMonth < 0;
    const absMonth = Math.abs(lunarMonth);
    const rawMonthName = (isLeap ? '閏' : '') + lunar.getMonthInChinese() + '月';
    const lunarMonthName = toTrad(rawMonthName);
    const lunarDayName = toTrad(lunar.getDayInChinese());

    const yearInGanZhi = toTrad(lunar.getYearInGanZhi());
    const monthInGanZhi = toTrad(lunar.getMonthInGanZhi());
    const dayInGanZhi = toTrad(lunar.getDayInGanZhi());
    const rawShengXiao = lunar.getYearShengXiao();
    const shengXiao = SHENG_XIAO_TRAD[rawShengXiao] || toTrad(rawShengXiao);

    const rawJieQi = lunar.getJieQi() || null;
    const jieQiName = rawJieQi ? (SOLAR_TERMS_TRAD[rawJieQi] || toTrad(rawJieQi)) : null;
    let jieQiDetail = null;

    try {
      const jqTable = lunar.getJieQiTable();
      if (rawJieQi && jqTable[rawJieQi]) {
        const jqSolar = jqTable[rawJieQi];
        jieQiDetail = {
          name: jieQiName,
          timeStr: `${String(jqSolar.getHour()).padStart(2, '0')}:${String(jqSolar.getMinute()).padStart(2, '0')}`,
          fullTimeStr: jqSolar.toYmdHms()
        };
      }

      let nextTermName = null;
      let nextTermTime = null;
      for (const termName of Object.keys(jqTable)) {
        const termSolar = jqTable[termName];
        if (termSolar.isAfter(solar)) {
          nextTermName = SOLAR_TERMS_TRAD[termName] || toTrad(termName);
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
    } catch (e) {
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
        solarTerm: { current: jieQiName, detail: null, nextName: null, nextTime: null },
        julianDay: solar.getJulianDay()
      };
    }
  }

  // ==========================================
  // 4. 月曆核心網格計算 (calendar-core)
  // ==========================================
  function getDaysInMonth(year, month) {
    return new Date(year, month, 0).getDate();
  }

  function isToday(year, month, day) {
    const now = new Date();
    return (
      now.getFullYear() === year &&
      now.getMonth() + 1 === month &&
      now.getDate() === day
    );
  }

  function generateMonthGrid(year, month, selectedDate) {
    const clampedYear = Math.max(MIN_YEAR, Math.min(MAX_YEAR, year));
    const firstDayWeek = new Date(clampedYear, month - 1, 1).getDay();
    const daysInCurMonth = getDaysInMonth(clampedYear, month);

    const prevMonthYear = month === 1 ? clampedYear - 1 : clampedYear;
    const prevMonth = month === 1 ? 12 : month - 1;
    const daysInPrevMonth = getDaysInMonth(prevMonthYear, prevMonth);

    const nextMonthYear = month === 12 ? clampedYear + 1 : clampedYear;
    const nextMonth = month === 12 ? 1 : month + 1;

    const cells = [];

    // 上月補齊
    for (let i = firstDayWeek - 1; i >= 0; i--) {
      const day = daysInPrevMonth - i;
      let dayData = null;
      let eraData = null;
      if (prevMonthYear >= MIN_YEAR) {
        dayData = getLunarDayInfo(prevMonthYear, prevMonth, day);
        eraData = getFullHistoricalContext(prevMonthYear, prevMonth, day, dayData.lunar.rawLunar);
      }
      cells.push({
        year: prevMonthYear,
        month: prevMonth,
        day,
        isCurrentMonth: false,
        isToday: isToday(prevMonthYear, prevMonth, day),
        isSelected: selectedDate && selectedDate.year === prevMonthYear && selectedDate.month === prevMonth && selectedDate.day === day,
        dayData,
        eraData
      });
    }

    // 當月
    for (let day = 1; day <= daysInCurMonth; day++) {
      const dayData = getLunarDayInfo(clampedYear, month, day);
      const eraData = getFullHistoricalContext(clampedYear, month, day, dayData.lunar.rawLunar);
      cells.push({
        year: clampedYear,
        month,
        day,
        isCurrentMonth: true,
        isToday: isToday(clampedYear, month, day),
        isSelected: selectedDate && selectedDate.year === clampedYear && selectedDate.month === month && selectedDate.day === day,
        dayData,
        eraData
      });
    }

    // 下月補齊
    const remaining = (7 - (cells.length % 7)) % 7;
    const totalTarget = cells.length + remaining <= 35 ? 35 : 42;
    const trailingCount = totalTarget - cells.length;

    for (let day = 1; day <= trailingCount; day++) {
      let dayData = null;
      let eraData = null;
      if (nextMonthYear <= MAX_YEAR) {
        dayData = getLunarDayInfo(nextMonthYear, nextMonth, day);
        eraData = getFullHistoricalContext(nextMonthYear, nextMonth, day, dayData.lunar.rawLunar);
      }
      cells.push({
        year: nextMonthYear,
        month: nextMonth,
        day,
        isCurrentMonth: false,
        isToday: isToday(nextMonthYear, nextMonth, day),
        isSelected: selectedDate && selectedDate.year === nextMonthYear && selectedDate.month === nextMonth && selectedDate.day === day,
        dayData,
        eraData
      });
    }

    return { year: clampedYear, month, cells };
  }

  // ==========================================
  // 5. 智慧搜尋解析 (search-service)
  // ==========================================
  function parseSearchQuery(rawQuery, currentYear = new Date().getFullYear()) {
    if (!rawQuery || typeof rawQuery !== 'string') return null;
    const q = rawQuery.trim().replace(/\s+/g, '');
    if (!q) return null;

    // 西曆完整日期
    const dateMatch = q.match(/^(\d{4})[-/.]?(\d{1,2})[-/.]?(\d{1,2})$/);
    if (dateMatch) {
      const y = parseInt(dateMatch[1], 10);
      const m = parseInt(dateMatch[2], 10);
      const d = parseInt(dateMatch[3], 10);
      if (y >= MIN_YEAR && y <= MAX_YEAR && m >= 1 && m <= 12 && d >= 1 && d <= 31) {
        return { year: y, month: m, day: d, matchedDesc: `西曆 ${y} 年 ${m} 月 ${d} 日` };
      }
    }

    // 西曆年
    const yearOnlyMatch = q.match(/^(\d{4})年?$/);
    if (yearOnlyMatch) {
      const y = parseInt(yearOnlyMatch[1], 10);
      if (y >= MIN_YEAR && y <= MAX_YEAR) {
        return { year: y, month: 1, day: 1, matchedDesc: `西曆 ${y} 年` };
      }
    }

    // 民國前
    const preRocMatch = q.match(/^(?:民國前|民前)(\d{1,3})年?$/);
    if (preRocMatch) {
      const preYears = parseInt(preRocMatch[1], 10);
      const y = 1912 - preYears;
      if (y >= MIN_YEAR && y <= MAX_YEAR) {
        return { year: y, month: 1, day: 1, matchedDesc: `民國前 ${preYears} 年 (西元 ${y} 年)` };
      }
    }

    // 民國
    const rocMatch = q.match(/^(?:民國|民)(元年|\d{1,3})年?$/);
    if (rocMatch) {
      const rocYears = rocMatch[1] === '元年' ? 1 : parseInt(rocMatch[1], 10);
      const y = 1911 + rocYears;
      if (y >= MIN_YEAR && y <= MAX_YEAR) {
        return { year: y, month: 1, day: 1, matchedDesc: `民國 ${rocMatch[1]} (西元 ${y} 年)` };
      }
    }

    // 清代年號
    const qingMap = { '雍正': 1722, '乾隆': 1735, '嘉慶': 1795, '道光': 1820, '咸豐': 1850, '同治': 1861, '光緒': 1874, '宣統': 1908 };
    for (const [era, baseYear] of Object.entries(qingMap)) {
      if (q.startsWith(era)) {
        const rest = q.slice(era.length).replace(/年$/, '');
        const regnal = rest === '' || rest === '元年' ? 1 : parseInt(rest, 10);
        if (!isNaN(regnal) && regnal >= 1) {
          const y = baseYear + regnal;
          if (y >= MIN_YEAR && y <= MAX_YEAR) {
            return { year: y, month: 1, day: 1, matchedDesc: `清 ${era} ${regnal === 1 ? '元年' : regnal + '年'} (西元 ${y} 年)` };
          }
        }
      }
    }

    // 日本年號
    const japanMap = { '明治': 1867, '大正': 1911, '昭和': 1925, '平成': 1988, '令和': 2018 };
    for (const [era, baseYear] of Object.entries(japanMap)) {
      if (q.startsWith(era)) {
        const rest = q.slice(era.length).replace(/年$/, '');
        const regnal = rest === '' || rest === '元年' ? 1 : parseInt(rest, 10);
        if (!isNaN(regnal) && regnal >= 1) {
          const y = baseYear + regnal;
          if (y >= MIN_YEAR && y <= MAX_YEAR) {
            return { year: y, month: 1, day: 1, matchedDesc: `日治／日本 ${era} ${regnal === 1 ? '元年' : regnal + '年'} (西元 ${y} 年)` };
          }
        }
      }
    }

    // 重大歷史事件
    for (const [dateStr, desc] of Object.entries(HISTORICAL_MILESTONES)) {
      if (desc.includes(q) || (q.length >= 2 && q.includes(desc.slice(0, 4)))) {
        const [y, m, d] = dateStr.split('-').map(Number);
        return { year: y, month: m, day: d, matchedDesc: `歷史事件：${desc}` };
      }
    }

    // 二十四節氣
    for (const term of SOLAR_TERMS) {
      if (q.includes(term)) {
        return { year: currentYear, month: null, day: null, targetTerm: term, matchedDesc: `${currentYear} 年節氣【${term}】` };
      }
    }

    return null;
  }

  // ==========================================
  // 6. UI 控制器 (PerpetualCalendarApp)
  // ==========================================
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
        detailPanel: document.getElementById('detail-panel')
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

    populateYearOptions() {
      const select = this.dom.yearSelect;
      if (!select) return;
      select.innerHTML = '';
      for (let y = MIN_YEAR; y <= MAX_YEAR; y++) {
        const opt = document.createElement('option');
        opt.value = y;
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

    bindEvents() {
      this.dom.yearSelect.addEventListener('change', (e) => {
        this.currentYear = parseInt(e.target.value, 10);
        this.render();
      });

      this.dom.monthSelect.addEventListener('change', (e) => {
        this.currentMonth = parseInt(e.target.value, 10);
        this.render();
      });

      this.dom.prevYearBtn.addEventListener('click', () => this.changeYear(-1));
      this.dom.nextYearBtn.addEventListener('click', () => this.changeYear(1));
      this.dom.prevMonthBtn.addEventListener('click', () => this.changeMonth(-1));
      this.dom.nextMonthBtn.addEventListener('click', () => this.changeMonth(1));

      this.dom.todayBtn.addEventListener('click', () => {
        const now = new Date();
        this.goToDate(now.getFullYear(), now.getMonth() + 1, now.getDate());
      });

      this.dom.themeToggleBtn.addEventListener('click', () => this.toggleTheme());

      const doSearch = () => {
        const query = this.dom.searchInput.value;
        const res = parseSearchQuery(query, this.currentYear);
        if (res) {
          let targetMonth = res.month || 1;
          let targetDay = res.day || 1;

          if (res.targetTerm) {
            try {
              const Solar = getSolar();
              if (Solar) {
                const jqTable = Solar.fromYmd(res.year, 1, 1).getLunar().getJieQiTable();
                if (jqTable[res.targetTerm]) {
                  const jqSolar = jqTable[res.targetTerm];
                  targetMonth = jqSolar.getMonth();
                  targetDay = jqSolar.getDay();
                }
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

      window.addEventListener('keydown', (e) => {
        if (document.activeElement === this.dom.searchInput) return;
        if (e.key === 'ArrowLeft') this.changeMonth(-1);
        else if (e.key === 'ArrowRight') this.changeMonth(1);
        else if (e.key === 'ArrowUp') this.changeYear(-1);
        else if (e.key === 'ArrowDown') this.changeYear(1);
      });

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

    render() {
      this.dom.yearSelect.value = this.currentYear;
      this.dom.monthSelect.value = this.currentMonth;

      const midDayInfo = getLunarDayInfo(this.currentYear, this.currentMonth, 15);
      const midEraInfo = getFullHistoricalContext(this.currentYear, this.currentMonth, 15, midDayInfo.lunar.rawLunar);

      const rocText = midEraInfo.republic.text;
      this.dom.periodTitle.innerHTML = `【 西元 ${this.currentYear} 年 (${rocText}) &nbsp;${String(this.currentMonth).padStart(2, '0')} 月 】`;

      const subParts = [];
      if (midEraInfo.qing) subParts.push(midEraInfo.qing.text);
      if (midEraInfo.japan) subParts.push(midEraInfo.japan.text);
      this.dom.periodSubTitle.textContent = subParts.join(' · ') || '現代公曆紀年';

      const gridData = generateMonthGrid(this.currentYear, this.currentMonth, this.selectedDate);
      this.renderGrid(gridData);
      this.renderDetailPanel();
    }

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

        let tagHtml = '';
        if (cell.dayData) {
          if (cell.dayData.solarTerm && cell.dayData.solarTerm.current) {
            tagHtml += `<span class="tag-badge tag-jieqi">${cell.dayData.solarTerm.current}</span>`;
          }
          if (cell.dayData.lunar.dayName === '初一') {
            tagHtml += `<span class="tag-badge tag-first-day">${cell.dayData.lunar.monthName}</span>`;
          }
        }

        if (cell.eraData && cell.eraData.japan && cell.eraData.japan.isTransitionDay) {
          tagHtml += `<span class="tag-badge tag-transition">改元</span>`;
        }

        if (cell.eraData && cell.eraData.milestone) {
          cellEl.classList.add('has-milestone');
          cellEl.title = cell.eraData.milestone;
        }

        let lunarDisplay = '';
        if (cell.dayData) {
          lunarDisplay = cell.dayData.lunar.dayName === '初一' 
            ? cell.dayData.lunar.monthName 
            : cell.dayData.lunar.dayName;
          if (cell.dayData.solarTerm && cell.dayData.solarTerm.current) {
            lunarDisplay = cell.dayData.solarTerm.current;
          }
        }

        cellEl.innerHTML = toTrad(`
          <div class="cell-top">
            <span class="solar-num ${isWeekend ? 'weekend-num' : ''}">${cell.day}</span>
            <div class="cell-tags">${tagHtml}</div>
          </div>
          <div class="cell-bottom">
            <span class="lunar-text">${lunarDisplay}</span>
          </div>
        `);

        cellEl.addEventListener('click', () => {
          this.selectedDate = { year: cell.year, month: cell.month, day: cell.day };
          if (!cell.isCurrentMonth) {
            this.currentYear = cell.year;
            this.currentMonth = cell.month;
          }
          this.render();
        });

        container.appendChild(cellEl);
      });
    }

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
      panel.innerHTML = toTrad(`
        <div class="panel-header">
          <div class="panel-solar-date">
            <span>📅 ${year} 年 ${month} 月 ${day} 日</span>
            <span class="panel-week">${dayInfo.solar.weekName}</span>
          </div>
          <div class="panel-julian">儒略日 (Julian Day): ${dayInfo.julianDay}</div>
        </div>

        <div class="panel-body">
          <div class="info-section">
            <div class="section-label">🌙 農曆歷法資訊</div>
            <div class="section-content">
              <strong>${dayInfo.lunar.monthName}${dayInfo.lunar.dayName}</strong>
              <div style="font-size: 0.88rem; color: var(--text-secondary); margin-top: 0.2rem;">
                歲次：${dayInfo.lunar.fullGanZhi}（生肖屬 ${dayInfo.lunar.shengXiao}）
              </div>
            </div>
          </div>

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

          <div class="info-section">
            <div class="section-label">🏛️ 歷史紀年對照（清朝 / 日治 / 民國）</div>
            <div class="era-list">
              <div class="era-item roc">
                <span class="era-name">${eraInfo.republic.text}</span>
                ${eraInfo.republic.note ? `<span class="era-desc">${eraInfo.republic.note}</span>` : ''}
              </div>

              ${eraInfo.qing ? `
                <div class="era-item qing">
                  <span class="era-name">${eraInfo.qing.fullText}</span>
                  <span class="era-desc">${eraInfo.qing.note}</span>
                </div>
              ` : ''}

              ${eraInfo.japan ? `
                <div class="era-item japan">
                  <span class="era-name">${eraInfo.japan.fullText}</span>
                  <span class="era-desc">${eraInfo.japan.note}</span>
                </div>
              ` : ''}
            </div>
          </div>

          ${eraInfo.milestone ? `
            <div class="milestone-box">
              <div class="milestone-title">📜 歷史重要界標</div>
              <div class="milestone-content">${eraInfo.milestone}</div>
            </div>
          ` : ''}
        </div>
      `);
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

    registerPWA() {
      if ('serviceWorker' in navigator && window.location.protocol.startsWith('http')) {
        navigator.serviceWorker.register('./sw.js')
          .then(() => console.log('ServiceWorker registered.'))
          .catch(err => console.log('SW registration skipped:', err));
      }
    }
  }

  // 匯出至全域，方便測試與除錯
  window.PerpetualCalendar = {
    QING_EMPERORS,
    JAPAN_ERAS,
    HISTORICAL_MILESTONES,
    getLunarDayInfo,
    getFullHistoricalContext,
    generateMonthGrid,
    parseSearchQuery,
    PerpetualCalendarApp
  };

  // 當 DOM 準備完成時啟動
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      window.calendarApp = new PerpetualCalendarApp();
    });
  } else {
    window.calendarApp = new PerpetualCalendarApp();
  }

})(typeof window !== 'undefined' ? window : globalThis);
