-- ============================================================
--  Global Exchange Monitor — Supabase schema
--  Run this in the Supabase SQL Editor.
--
--  Data-sourcing policy (see README / dev notes):
--   · 정규 거래시간·세션 : 정적 (src/data) — 변동 시 수동 갱신
--   · 서머타임(DST)      : IANA tzdata 자동 (Intl API) — DB 불필요
--   · 공휴일·조기폐장     : 이 스키마 (exchange_holidays)
--   · 트레이더 노트       : 이 스키마 (exchange_notes)
--
--  Auth model: 조회는 anon(로그인 불필요), 편집은 authenticated(1~2명).
--   → Supabase Dashboard > Authentication 에서 편집자 계정 1~2개 생성,
--     "Allow new users to sign up" 를 OFF 로 둘 것.
-- ============================================================

-- ── 공휴일 / 조기폐장 ────────────────────────────────────────
create table if not exists public.exchange_holidays (
  exchange_id text        not null,          -- 'krx', 'tse', 'nyse' ...
  date        date        not null,          -- 거래소 현지 캘린더 날짜
  name        text        not null,          -- '설날', 'Bastille Day' ...
  type        text        not null default 'full_close'
                          check (type in ('full_close','early_close')),
  close_time  text,                          -- early_close 시 현지 조기 마감 'HH:MM'
  updated_at  timestamptz not null default now(),
  primary key (exchange_id, date)
);

create index if not exists idx_exchange_holidays_date on public.exchange_holidays (date);

-- ── 트레이더 노트 (거래소별·날짜별 누적) ──────────────────────
create table if not exists public.exchange_notes (
  id          uuid        primary key default gen_random_uuid(),
  exchange_id text        not null,          -- 'krx' ...
  note_date   date        not null,          -- 노트가 참조하는 날짜
  body        text        not null,
  author      text,                          -- 작성자 이메일(선택)
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists idx_exchange_notes_ex   on public.exchange_notes (exchange_id, note_date desc);
create index if not exists idx_exchange_notes_date on public.exchange_notes (note_date desc);

-- keep updated_at fresh
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end; $$;

drop trigger if exists trg_notes_touch on public.exchange_notes;
create trigger trg_notes_touch before update on public.exchange_notes
  for each row execute function public.touch_updated_at();

-- ── RLS ──────────────────────────────────────────────────────
alter table public.exchange_holidays enable row level security;
alter table public.exchange_notes    enable row level security;

-- 공휴일: 누구나 읽기, 로그인 사용자만 쓰기
drop policy if exists holidays_read  on public.exchange_holidays;
drop policy if exists holidays_write on public.exchange_holidays;
create policy holidays_read  on public.exchange_holidays
  for select using (true);
create policy holidays_write on public.exchange_holidays
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

-- 노트: 누구나 읽기, 로그인 사용자만 쓰기
drop policy if exists notes_read  on public.exchange_notes;
drop policy if exists notes_write on public.exchange_notes;
create policy notes_read  on public.exchange_notes
  for select using (true);
create policy notes_write on public.exchange_notes
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

-- ============================================================
--  Seed — 2026 공휴일 (스타터 세트, 주요 거래소)
--  ※ 각 거래소 공식 캘린더 기준으로 매년 검증/보완할 것.
--    이동 공휴일(음력 설·추석, 부활절 등)은 연 단위로 갱신 필요.
-- ============================================================
insert into public.exchange_holidays (exchange_id, date, name, type, close_time) values
  -- 🇫🇷 Euronext Paris
  ('euronext','2026-01-01','New Year''s Day','full_close',null),
  ('euronext','2026-04-03','Good Friday','full_close',null),
  ('euronext','2026-04-06','Easter Monday','full_close',null),
  ('euronext','2026-05-01','Labour Day','full_close',null),
  ('euronext','2026-07-14','Bastille Day','full_close',null),
  ('euronext','2026-12-25','Christmas Day','full_close',null),
  ('euronext','2026-12-24','Christmas Eve','early_close','14:05'),
  -- 🇰🇷 KRX
  ('krx','2026-01-01','신정','full_close',null),
  ('krx','2026-02-16','설날','full_close',null),
  ('krx','2026-02-17','설날','full_close',null),
  ('krx','2026-02-18','설날','full_close',null),
  ('krx','2026-03-01','삼일절','full_close',null),
  ('krx','2026-05-05','어린이날','full_close',null),
  ('krx','2026-12-25','성탄절','full_close',null),
  ('krx','2026-12-31','연말 휴장','full_close',null),
  -- 🇯🇵 TSE
  ('tse','2026-01-01','元日','full_close',null),
  ('tse','2026-01-12','成人の日','full_close',null),
  ('tse','2026-08-11','山の日','full_close',null),
  ('tse','2026-12-31','大納会後休場','full_close',null),
  -- 🇭🇰 HKEX
  ('hkex','2026-01-01','New Year','full_close',null),
  ('hkex','2026-02-17','Lunar New Year','full_close',null),
  ('hkex','2026-02-18','Lunar New Year','full_close',null),
  ('hkex','2026-10-01','National Day','full_close',null),
  -- 🇨🇳 SSE
  ('sse','2026-01-01','元旦','full_close',null),
  ('sse','2026-02-16','春节','full_close',null),
  ('sse','2026-02-17','春节','full_close',null),
  ('sse','2026-10-01','国庆节','full_close',null),
  -- 🇬🇧 LSE
  ('lse','2026-01-01','New Year','full_close',null),
  ('lse','2026-04-03','Good Friday','full_close',null),
  ('lse','2026-12-25','Christmas','full_close',null),
  ('lse','2026-12-24','Christmas Eve','early_close','12:30'),
  -- 🇺🇸 NYSE / NASDAQ
  ('nyse','2026-01-01','New Year','full_close',null),
  ('nyse','2026-07-03','Independence Day (obs)','full_close',null),
  ('nyse','2026-11-26','Thanksgiving','full_close',null),
  ('nyse','2026-11-27','Day after Thanksgiving','early_close','13:00'),
  ('nyse','2026-12-25','Christmas','full_close',null),
  ('nasdaq','2026-01-01','New Year','full_close',null),
  ('nasdaq','2026-07-03','Independence Day (obs)','full_close',null),
  ('nasdaq','2026-11-26','Thanksgiving','full_close',null),
  ('nasdaq','2026-11-27','Day after Thanksgiving','early_close','13:00'),
  ('nasdaq','2026-12-25','Christmas','full_close',null)
on conflict (exchange_id, date) do nothing;


-- ============================================================
--  거래소 기본 데이터 + 거래소 정보 (DB 관리 · 웹 반영)
-- ============================================================

-- ── 거래소 기본 (거래시간 · 타임존→DST 자동) ──
create table if not exists public.exchanges (
  id          text primary key,
  name        text,
  name_kr     text,
  country     text,
  cc          text,          -- ISO alpha-2 (국기)
  flag        text,
  timezone    text not null, -- IANA (DST 자동 결정)
  gmt_offset  numeric not null, -- 비서머타임 기준 오프셋(시간)
  open_time   text not null, -- 현지 "HH:MM"
  close_time  text not null,
  lunch_start text,
  lunch_end   text,
  region      text not null, -- 'asia' | 'europe' | 'americas'
  currency    text,
  sort_order  int default 0,
  active      boolean default true,
  updated_at  timestamptz default now()
);

-- ── 거래소 정보 (편집 대상: 결제주기 · 제세금 · 비고) ──
create table if not exists public.exchange_info (
  exchange_id text primary key,
  settlement  text,   -- 결제 주기 (T+1 / T+2)
  taxes       text,   -- 제세금
  notes       text,   -- 비고
  updated_at  timestamptz default now()
);

alter table public.exchanges     enable row level security;
alter table public.exchange_info enable row level security;

drop policy if exists exchanges_read  on public.exchanges;
drop policy if exists exchanges_write on public.exchanges;
create policy exchanges_read  on public.exchanges for select using (true);
create policy exchanges_write on public.exchanges for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

drop policy if exists exchange_info_read  on public.exchange_info;
drop policy if exists exchange_info_write on public.exchange_info;
create policy exchange_info_read  on public.exchange_info for select using (true);
create policy exchange_info_write on public.exchange_info for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

drop trigger if exists trg_exinfo_touch on public.exchange_info;
create trigger trg_exinfo_touch before update on public.exchange_info
  for each row execute function public.touch_updated_at();

drop trigger if exists trg_ex_touch on public.exchanges;
create trigger trg_ex_touch before update on public.exchanges
  for each row execute function public.touch_updated_at();

-- Seed (현재 정적 데이터 기준; 이후 여기서 직접 수정/추가)
insert into public.exchanges
  (id, name, name_kr, country, cc, flag, timezone, gmt_offset, open_time, close_time, lunch_start, lunch_end, region, currency, sort_order) values
  ('krx', 'Korea Exchange', '한국거래소', '대한민국', 'kr', '🇰🇷', 'Asia/Seoul', 9, '09:00', '15:20', null, null, 'asia', 'KRW', 0),
  ('tse', 'Tokyo Stock Exchange', '도쿄증권거래소', '일본', 'jp', '🇯🇵', 'Asia/Tokyo', 9, '09:00', '15:30', '11:30', '12:30', 'asia', 'JPY', 1),
  ('sse', 'Shanghai Stock Exchange', '상하이증권거래소', '중국', 'cn', '🇨🇳', 'Asia/Shanghai', 8, '09:30', '15:00', '11:30', '13:00', 'asia', 'CNY', 2),
  ('hkex', 'Hong Kong Stock Exchange', '홍콩증권거래소', '홍콩', 'hk', '🇭🇰', 'Asia/Hong_Kong', 8, '09:30', '16:10', '12:00', '13:00', 'asia', 'HKD', 3),
  ('sgx', 'Singapore Exchange', '싱가포르거래소', '싱가포르', 'sg', '🇸🇬', 'Asia/Singapore', 8, '09:00', '17:06', null, null, 'asia', 'SGD', 4),
  ('bse', 'Bombay Stock Exchange / NSE', '인도 BSE/NSE', '인도', 'in', '🇮🇳', 'Asia/Kolkata', 5.5, '09:15', '15:30', null, null, 'asia', 'INR', 5),
  ('asx', 'Australian Securities Exchange', '호주증권거래소', '호주', 'au', '🇦🇺', 'Australia/Sydney', 10, '10:00', '16:00', null, null, 'asia', 'AUD', 6),
  ('nzx', 'New Zealand Exchange', '뉴질랜드거래소', '뉴질랜드', 'nz', '🇳🇿', 'Pacific/Auckland', 12, '10:00', '16:45', null, null, 'asia', 'NZD', 7),
  ('twse', 'Taiwan Stock Exchange', '대만증권거래소', '대만', 'tw', '🇹🇼', 'Asia/Taipei', 8, '09:00', '13:30', null, null, 'asia', 'TWD', 8),
  ('idx', 'Indonesia Stock Exchange', '인도네시아거래소', '인도네시아', 'id', '🇮🇩', 'Asia/Jakarta', 7, '09:00', '16:00', '12:00', '13:30', 'asia', 'IDR', 9),
  ('myx', 'Bursa Malaysia', '말레이시아거래소', '말레이시아', 'my', '🇲🇾', 'Asia/Kuala_Lumpur', 8, '09:00', '17:00', '12:30', '14:30', 'asia', 'MYR', 10),
  ('pse', 'Philippine Stock Exchange', '필리핀증권거래소', '필리핀', 'ph', '🇵🇭', 'Asia/Manila', 8, '09:30', '15:00', '12:00', '13:00', 'asia', 'PHP', 11),
  ('set', 'Stock Exchange of Thailand', '태국증권거래소', '태국', 'th', '🇹🇭', 'Asia/Bangkok', 7, '10:00', '16:30', '12:30', '14:00', 'asia', 'THB', 12),
  ('lse', 'London Stock Exchange', '런던증권거래소', '영국', 'gb', '🇬🇧', 'Europe/London', 0, '08:00', '16:30', null, null, 'europe', 'GBP', 13),
  ('euronext', 'Euronext Paris', '유로넥스트 파리', '프랑스', 'fr', '🇫🇷', 'Europe/Paris', 1, '09:00', '17:30', null, null, 'europe', 'EUR', 14),
  ('xetra', 'XETRA Frankfurt', '프랑크푸르트거래소', '독일', 'de', '🇩🇪', 'Europe/Berlin', 1, '09:00', '17:30', null, null, 'europe', 'EUR', 15),
  ('six', 'SIX Swiss Exchange', '스위스거래소', '스위스', 'ch', '🇨🇭', 'Europe/Zurich', 1, '09:00', '17:20', null, null, 'europe', 'CHF', 16),
  ('borsa', 'Euronext Milan (Borsa Italiana)', '이탈리아거래소', '이탈리아', 'it', '🇮🇹', 'Europe/Rome', 1, '09:00', '17:30', null, null, 'europe', 'EUR', 17),
  ('nyse', 'New York Stock Exchange', '뉴욕증권거래소', '미국', 'us', '🇺🇸', 'America/New_York', -5, '09:30', '16:00', null, null, 'americas', 'USD', 18),
  ('nasdaq', 'NASDAQ', '나스닥', '미국', 'us', '🇺🇸', 'America/New_York', -5, '09:30', '16:00', null, null, 'americas', 'USD', 19),
  ('tsx', 'Toronto Stock Exchange', '토론토증권거래소', '캐나다', 'ca', '🇨🇦', 'America/Toronto', -5, '09:30', '16:00', null, null, 'americas', 'CAD', 20)
on conflict (id) do nothing;

insert into public.exchange_info (exchange_id, settlement, taxes, notes) values
  ('krx', 'T+2', null, 'IRC 적용 (외국인 투자 등록)'),
  ('tse', 'T+2', null, null),
  ('sse', 'T+1', null, null),
  ('hkex', 'T+2', 'Stamp 10bps / FRC Levy 0.565bps', null),
  ('sgx', 'T+2', 'Clearing 3.25bps / GST 9%', null),
  ('bse', 'T+1', 'GST(Sell) 18% X commission', null),
  ('asx', 'T+2', null, null),
  ('nzx', 'T+2', null, null),
  ('twse', 'T+2', 'Sales Tax 30bps (Sell)', null),
  ('idx', 'T+2', null, null),
  ('myx', 'T+2', null, null),
  ('pse', 'T+2', null, null),
  ('set', 'T+2', null, null),
  ('lse', 'T+2', 'Levy: GBP1 for tickets ≥ £10,000 (eligible stocks, buy only)', null),
  ('euronext', 'T+2', null, null),
  ('xetra', 'T+2', null, null),
  ('six', 'T+2', null, null),
  ('borsa', 'T+2', 'Financial Transaction Tax: 10bps (buy trades only, Italy residents)', null),
  ('nyse', 'T+1', 'SEC Fee: 0.278bps (Gross, Sell side only)', null),
  ('nasdaq', 'T+1', 'SEC Fee: 0.278bps (Gross, Sell side only)', null),
  ('tsx', 'T+1', 'SCCP or Clearing Fee: 1bps / Sales Tax 60bps (shares)', null)
on conflict (exchange_id) do nothing;


-- ============================================================
--  거래소 휴장 달력 (CSV 업로드 · 앱이 ISO=국가코드로 매핑해 읽음)
--  · trading: 'No'=종일휴장(full_close), 'Partial'=반장(early_close), 'Full'=정상
--  · type = 'Exchange' 행만 사용, iso(국가 alpha-2) = exchanges.cc 로 매핑
--  · CSV 교체 시: truncate 후 재임포트 → 웹 자동 갱신
-- ============================================================
create table if not exists public.holiday_calendar (
  id            bigint generated always as identity primary key,
  date          text,   -- YYYY-MM-DD (현지 기준)
  code          text,   -- 벤더 거래소 코드 (미사용)
  calendar_name text,
  event         text,   -- 휴일/이벤트명
  settle        text,   -- 결제 유무
  trading       text,   -- No / Partial / Full
  type          text,   -- Exchange / Country
  iso           text,   -- 국가 ISO alpha-2 (KR, JP, US ...)
  country_name  text,
  region        text
);
create index if not exists idx_holcal_iso_date on public.holiday_calendar (iso, date);

alter table public.holiday_calendar enable row level security;
drop policy if exists holiday_calendar_read on public.holiday_calendar;
create policy holiday_calendar_read on public.holiday_calendar for select using (true);
