-- ============================================================
--  거래소 추가 (2026-07) — Supabase SQL Editor 에서 실행
--  · 기본 거래시간/타임존(DST 자동)/통화/지역. 상세 auction 세션은 미포함(정적).
--  · 휴장일: holiday_calendar 의 iso=cc 로 자동 연동.
--    ※ 쿠웨이트/카타르/사우디/UAE/페루는 holiday_calendar 에 데이터가 없어
--      휴장일이 표기되지 않음(해당 국가 휴장 raw 업로드 시 자동 반영).
--  · 거래시간은 공개자료 기준 근사값 — 필요시 exchanges 테이블에서 직접 수정.
--  · 중동/일부 시장은 주말이 다르지만(예: 이스라엘 금·토, 걸프 토·일)
--    앱은 아직 요일 구분을 안 하므로 주말에도 개장으로 표시될 수 있음.
-- ============================================================

insert into public.exchanges
  (id, name, name_kr, country, cc, flag, timezone, gmt_offset, open_time, close_time, lunch_start, lunch_end, region, currency, sort_order) values
  -- ── EUROPE ──
  ('ebr',  'Euronext Brussels',            '유로넥스트 브뤼셀',   '벨기에',        'be', '🇧🇪', 'Europe/Brussels',    1, '09:00', '17:30', null, null, 'europe',     'EUR', 21),
  ('cse',  'Nasdaq Copenhagen',            '코펜하겐거래소',      '덴마크',        'dk', '🇩🇰', 'Europe/Copenhagen',  1, '09:00', '17:00', null, null, 'europe',     'DKK', 22),
  ('hel',  'Nasdaq Helsinki',              '헬싱키거래소',        '핀란드',        'fi', '🇫🇮', 'Europe/Helsinki',    2, '10:00', '18:30', null, null, 'europe',     'EUR', 23),
  ('ams',  'Euronext Amsterdam',           '유로넥스트 암스테르담','네덜란드',       'nl', '🇳🇱', 'Europe/Amsterdam',   1, '09:00', '17:30', null, null, 'europe',     'EUR', 24),
  ('osl',  'Oslo Bors',                    '오슬로거래소',        '노르웨이',      'no', '🇳🇴', 'Europe/Oslo',        1, '09:00', '16:20', null, null, 'europe',     'NOK', 25),
  ('ise',  'Euronext Dublin',              '유로넥스트 더블린',   '아일랜드',      'ie', '🇮🇪', 'Europe/Dublin',      0, '08:00', '16:28', null, null, 'europe',     'EUR', 26),
  ('lis',  'Euronext Lisbon',              '유로넥스트 리스본',   '포르투갈',      'pt', '🇵🇹', 'Europe/Lisbon',      0, '08:00', '16:30', null, null, 'europe',     'EUR', 27),
  ('bme',  'Bolsa de Madrid',              '마드리드거래소',      '스페인',        'es', '🇪🇸', 'Europe/Madrid',      1, '09:00', '17:30', null, null, 'europe',     'EUR', 28),
  ('sto',  'Nasdaq Stockholm',             '스톡홀름거래소',      '스웨덴',        'se', '🇸🇪', 'Europe/Stockholm',   1, '09:00', '17:30', null, null, 'europe',     'SEK', 29),
  ('wbag', 'Wiener Boerse',                '빈거래소',            '오스트리아',    'at', '🇦🇹', 'Europe/Vienna',      1, '09:00', '17:30', null, null, 'europe',     'EUR', 30),
  ('pra',  'Prague Stock Exchange',        '프라하거래소',        '체코',          'cz', '🇨🇿', 'Europe/Prague',      1, '09:00', '16:20', null, null, 'europe',     'CZK', 31),
  ('bux',  'Budapest Stock Exchange',      '부다페스트거래소',    '헝가리',        'hu', '🇭🇺', 'Europe/Budapest',    1, '09:00', '17:00', null, null, 'europe',     'HUF', 32),
  ('gpw',  'Warsaw Stock Exchange',        '바르샤바거래소',      '폴란드',        'pl', '🇵🇱', 'Europe/Warsaw',      1, '09:00', '17:00', null, null, 'europe',     'PLN', 33),
  ('ase',  'Athens Stock Exchange',        '아테네거래소',        '그리스',        'gr', '🇬🇷', 'Europe/Athens',      2, '10:15', '17:00', null, null, 'europe',     'EUR', 34),
  -- ── MIDDLE EAST ──
  ('tase', 'Tel Aviv Stock Exchange',      '텔아비브거래소',      '이스라엘',      'il', '🇮🇱', 'Asia/Jerusalem',     2, '10:00', '17:25', null, null, 'middleeast', 'ILS', 35),
  ('bist', 'Borsa Istanbul',               '보르사 이스탄불',     '터키',          'tr', '🇹🇷', 'Europe/Istanbul',    3, '10:00', '18:00', '13:00', '14:00', 'middleeast', 'TRY', 36),
  ('kse',  'Boursa Kuwait',                '쿠웨이트거래소',      '쿠웨이트',      'kw', '🇰🇼', 'Asia/Kuwait',        3, '09:00', '12:30', null, null, 'middleeast', 'KWD', 37),
  ('qse',  'Qatar Stock Exchange',         '카타르거래소',        '카타르',        'qa', '🇶🇦', 'Asia/Qatar',         3, '09:30', '13:15', null, null, 'middleeast', 'QAR', 38),
  ('tad',  'Saudi Exchange (Tadawul)',     '사우디거래소',        '사우디아라비아','sa', '🇸🇦', 'Asia/Riyadh',        3, '10:00', '15:00', null, null, 'middleeast', 'SAR', 39),
  ('dfm',  'Dubai Financial Market',       '두바이거래소',        '아랍에미리트',  'ae', '🇦🇪', 'Asia/Dubai',         4, '10:00', '15:00', null, null, 'middleeast', 'AED', 40),
  -- ── AFRICA ──
  ('jse',  'Johannesburg Stock Exchange',  '요하네스버그거래소',  '남아프리카공화국','za','🇿🇦', 'Africa/Johannesburg',2, '09:00', '17:00', null, null, 'africa',     'ZAR', 41),
  -- ── AMERICAS ──
  ('b3',   'B3 (Brasil Bolsa Balcao)',     '브라질거래소 B3',     '브라질',        'br', '🇧🇷', 'America/Sao_Paulo',  -3, '10:00', '17:00', null, null, 'americas',   'BRL', 42),
  ('bcs',  'Bolsa de Santiago',            '산티아고거래소',      '칠레',          'cl', '🇨🇱', 'America/Santiago',   -4, '09:30', '16:00', null, null, 'americas',   'CLP', 43),
  ('bvc',  'Bolsa de Valores de Colombia', '콜롬비아거래소',      '콜롬비아',      'co', '🇨🇴', 'America/Bogota',     -5, '09:30', '16:00', null, null, 'americas',   'COP', 44),
  ('bmv',  'Bolsa Mexicana de Valores',    '멕시코거래소',        '멕시코',        'mx', '🇲🇽', 'America/Mexico_City',-6, '08:30', '15:00', null, null, 'americas',   'MXN', 45),
  ('bvl',  'Bolsa de Valores de Lima',     '리마거래소',          '페루',          'pe', '🇵🇪', 'America/Lima',       -5, '09:00', '16:00', null, null, 'americas',   'PEN', 46)
on conflict (id) do nothing;

-- 거래소 정보(결제주기 기본값) — 이후 웹 [수정] 또는 여기서 편집
insert into public.exchange_info (exchange_id, settlement) values
  ('ebr','T+2'),('cse','T+2'),('hel','T+2'),('ams','T+2'),('osl','T+2'),('ise','T+2'),('lis','T+2'),
  ('bme','T+2'),('sto','T+2'),('wbag','T+2'),('pra','T+2'),('bux','T+2'),('gpw','T+2'),('ase','T+2'),
  ('tase','T+1'),('bist','T+2'),('kse','T+3'),('qse','T+2'),('tad','T+2'),('dfm','T+2'),
  ('jse','T+3'),
  ('b3','T+2'),('bcs','T+2'),('bvc','T+2'),('bmv','T+2'),('bvl','T+2')
on conflict (exchange_id) do nothing;
