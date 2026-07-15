-- ============================================================
--  거래 요일(trading_days) 추가 — Supabase SQL Editor 에서 실행
--  · 값: 요일 번호 CSV (0=일 … 6=토). 기본 월–금 = '1,2,3,4,5'.
--  · 중동 일부는 일–목 = '0,1,2,3,4' (이스라엘/쿠웨이트/카타르/사우디).
--    UAE(dfm)는 2022년부터 월–금이라 기본값 유지.
--  · 앱은 이 값으로 현지 요일이 거래일이 아니면 '주말(휴장)'로 표시.
-- ============================================================

alter table public.exchanges
  add column if not exists trading_days text default '1,2,3,4,5';

-- 기존/신규 행 중 비어있으면 기본값(월–금)
update public.exchanges set trading_days = '1,2,3,4,5' where trading_days is null;

-- 일–목 시장
update public.exchanges set trading_days = '0,1,2,3,4'
  where id in ('tase', 'kse', 'qse', 'tad');
