/**
 * Trading phase data sourced from Bloomberg BDME screens (Aug 2024).
 * All times are KST (UTC+9). Bloomberg terminal displays times in the
 * viewer's local timezone — verified by cross-referencing with known
 * exchange hours (e.g., LSE 16:00 KST = 08:00 BST, NYSE 22:30 KST = 09:30 EDT).
 *
 * Cross-midnight phases (European/US markets): endKST < startKST numerically,
 * e.g., LSE continuous "16:00" → "00:30". The display layer detects this and
 * shows "+1일" suffix.
 */

import { TradingPhase } from '../types/exchange';

export const exchangePhases: Record<string, TradingPhase[]> = {

  // ── ASIA ────────────────────────────────────────────────────────────

  krx: [
    { type: 'preopening',      nameEn: 'Preopening',            nameKr: '장 개시 전 동시호가', startKST: '08:00', endKST: '09:00' },
    { type: 'opening_auction', nameEn: 'Opening Match Auction',  nameKr: '시초가 경매',         startKST: '08:30', endKST: '09:00' },
    { type: 'continuous',      nameEn: 'Continuous Trading',     nameKr: '정규장',              startKST: '09:00', endKST: '15:20' },
    { type: 'closing_auction', nameEn: 'Closing Match Auction',  nameKr: '장 마감 동시호가',    startKST: '15:20', endKST: '15:30' },
    { type: 'trade_at_close',  nameEn: 'Trade at Close',         nameKr: '장 종료 후 단일가',   startKST: '15:40', endKST: '16:00' },
    { type: 'after_hours',     nameEn: 'After Hours',            nameKr: '시간외 거래',         startKST: '16:00', endKST: '18:00' },
  ],

  tse: [
    { type: 'opening_auction', nameEn: 'AM Opening Match Auction',  nameKr: '오전 시초가 경매', startKST: '08:00', endKST: '09:00' },
    { type: 'continuous',      nameEn: 'AM Continuous Trading',     nameKr: '오전 정규장',      startKST: '09:00', endKST: '11:30' },
    { type: 'closing_auction', nameEn: 'AM Closing Match Auction',  nameKr: '오전 마감 호가',   startKST: '11:30', endKST: '11:30', note: '단일가 체결' },
    { type: 'lunch',           nameEn: 'Lunch Break',              nameKr: '점심시간',          startKST: '11:30', endKST: '12:05' },
    { type: 'opening_auction', nameEn: 'PM Opening Match Auction',  nameKr: '오후 시초가 경매', startKST: '12:05', endKST: '12:30' },
    { type: 'continuous',      nameEn: 'PM Continuous Trading',     nameKr: '오후 정규장',      startKST: '12:30', endKST: '15:25' },
    { type: 'closing_auction', nameEn: 'PM Closing Auction Call',   nameKr: '오후 마감 동시호가', startKST: '15:25', endKST: '15:30' },
    { type: 'closing_auction', nameEn: 'PM Closing Match Auction',  nameKr: '오후 종가 체결',   startKST: '15:30', endKST: '15:30', note: '단일가 체결' },
  ],

  sse: [
    { type: 'opening_auction', nameEn: 'Opening Match Auction',     nameKr: '시초가 경매',    startKST: '10:15', endKST: '10:25' },
    { type: 'continuous',      nameEn: 'AM Continuous Trading',     nameKr: '오전 정규장',    startKST: '10:30', endKST: '12:30' },
    { type: 'lunch',           nameEn: 'Lunch Break',               nameKr: '점심시간',       startKST: '12:30', endKST: '14:00' },
    { type: 'continuous',      nameEn: 'PM Continuous Trading',     nameKr: '오후 정규장',    startKST: '14:00', endKST: '15:57' },
    { type: 'closing_auction', nameEn: 'PM Closing Match Auction',  nameKr: '종가 경매',      startKST: '15:57', endKST: '16:00' },
    { type: 'block_trade',     nameEn: 'Block Trade',               nameKr: '대량 거래',      startKST: '16:00', endKST: '16:30' },
    { type: 'trade_at_close',  nameEn: 'Trade at Close',            nameKr: '종가 거래',      startKST: '16:05', endKST: '16:30' },
  ],

  hkex: [
    { type: 'opening_auction', nameEn: 'AM Opening Match Auction', nameKr: '시초가 경매',  startKST: '10:00', endKST: '10:20' },
    { type: 'continuous',      nameEn: 'AM Continuous Trading',    nameKr: '오전 정규장',  startKST: '10:30', endKST: '13:00' },
    { type: 'lunch',           nameEn: 'Lunch Break',              nameKr: '점심시간',     startKST: '13:00', endKST: '14:00' },
    { type: 'continuous',      nameEn: 'PM Continuous Trading',    nameKr: '오후 정규장',  startKST: '14:00', endKST: '17:00' },
    { type: 'closing_auction', nameEn: 'PM Closing Match Auction', nameKr: '종가 경매',    startKST: '17:00', endKST: '17:10' },
  ],

  sgx: [
    { type: 'preopening',      nameEn: 'AM Preopening',            nameKr: '오전 프리오픈',  startKST: '09:30', endKST: '09:58' },
    { type: 'opening_auction', nameEn: 'AM Opening Match Auction', nameKr: '시초가 경매',    startKST: '09:59', endKST: '10:00' },
    { type: 'continuous',      nameEn: 'AM Continuous Trading',    nameKr: '오전 정규장',    startKST: '10:00', endKST: '13:00' },
    { type: 'lunch',           nameEn: 'Lunch Break',              nameKr: '점심시간',       startKST: '13:00', endKST: '14:00' },
    { type: 'mid_day_auction', nameEn: 'Mid-Day Auction',          nameKr: '중간 경매',      startKST: '13:00', endKST: '14:00' },
    { type: 'continuous',      nameEn: 'PM Continuous Trading',    nameKr: '오후 정규장',    startKST: '14:00', endKST: '18:00' },
    { type: 'closing_auction', nameEn: 'PM Closing Auction Call',  nameKr: '마감 동시호가',  startKST: '18:00', endKST: '18:04' },
    { type: 'closing_auction', nameEn: 'PM Closing Match Auction', nameKr: '마감 경매',      startKST: '18:05', endKST: '18:06' },
    { type: 'trade_at_close',  nameEn: 'Trade at Close',           nameKr: '종가 거래',      startKST: '18:06', endKST: '18:16' },
  ],

  bse: [
    { type: 'block_trade',     nameEn: 'AM Block Trade',           nameKr: '대량 거래 (오전)',  startKST: '12:15', endKST: '12:30' },
    { type: 'preopening',      nameEn: 'Preopening',               nameKr: '프리오픈',          startKST: '12:30', endKST: '12:38' },
    { type: 'opening_auction', nameEn: 'Opening Match Auction',    nameKr: '시초가 경매',       startKST: '12:38', endKST: '12:42' },
    { type: 'continuous',      nameEn: 'Continuous Trading',       nameKr: '정규장',            startKST: '12:45', endKST: '19:00' },
    { type: 'block_trade',     nameEn: 'PM Block Trade',           nameKr: '대량 거래 (오후)',  startKST: '17:35', endKST: '17:50' },
    { type: 'trade_at_close',  nameEn: 'Post Close',               nameKr: '장 종료 후',        startKST: '19:10', endKST: '19:30' },
  ],

  asx: [
    { type: 'preopening',      nameEn: 'Preopening',                  nameKr: '프리오픈',      startKST: '06:00', endKST: '08:59' },
    { type: 'opening_auction', nameEn: 'Opening Match Auction',       nameKr: '시초가 경매',   startKST: '06:00', endKST: '08:59' },
    { type: 'continuous',      nameEn: 'Continuous Trading',          nameKr: '정규장',        startKST: '08:59', endKST: '15:00' },
    { type: 'closing_auction', nameEn: 'Closing Auction Call Phase',  nameKr: '마감 동시호가', startKST: '15:00', endKST: '15:10' },
    { type: 'closing_auction', nameEn: 'Closing Match Auction',       nameKr: '마감 경매',     startKST: '15:10', endKST: '15:11', note: '±60초 랜덤' },
    { type: 'trade_at_close',  nameEn: 'Trade at Close',              nameKr: '종가 거래',     startKST: '15:11', endKST: '15:21' },
    { type: 'after_hours',     nameEn: 'After Hours',                 nameKr: '시간외 거래',   startKST: '15:21', endKST: '18:00' },
  ],

  // New Asian markets
  nzx: [
    { type: 'preopening',      nameEn: 'Preopening',                 nameKr: '프리오픈',      startKST: '06:00', endKST: '07:00' },
    { type: 'continuous',      nameEn: 'Continuous Trading',         nameKr: '정규장',        startKST: '07:00', endKST: '13:45' },
    { type: 'closing_auction', nameEn: 'Closing Auction Call Phase', nameKr: '마감 동시호가', startKST: '13:45', endKST: '14:00' },
    { type: 'after_hours',     nameEn: 'After Hours',                nameKr: '시간외 거래',   startKST: '14:00', endKST: '14:30' },
  ],

  idx: [
    { type: 'preopening',      nameEn: 'Preopening',                  nameKr: '프리오픈',      startKST: '10:45', endKST: '10:59' },
    { type: 'opening_auction', nameEn: 'Opening Match Auction',       nameKr: '시초가 경매',   startKST: '10:59', endKST: '11:00' },
    { type: 'continuous',      nameEn: 'AM Continuous Trading',       nameKr: '오전 정규장',   startKST: '11:00', endKST: '14:00', note: '금요일 11:00–11:30' },
    { type: 'lunch',           nameEn: 'Lunch Break',                 nameKr: '점심시간',      startKST: '14:00', endKST: '15:30', note: '금요일 11:30–14:00' },
    { type: 'continuous',      nameEn: 'PM Continuous Trading',       nameKr: '오후 정규장',   startKST: '15:30', endKST: '17:50', note: '금요일 14:00–15:50' },
    { type: 'closing_auction', nameEn: 'Closing Auction Call Phase',  nameKr: '마감 동시호가', startKST: '17:50', endKST: '18:00' },
    { type: 'closing_auction', nameEn: 'Closing Match Auction',       nameKr: '마감 경매',     startKST: '18:00', endKST: '18:01' },
    { type: 'after_hours',     nameEn: 'After Hours',                 nameKr: '시간외 거래',   startKST: '18:01', endKST: '18:15' },
  ],

  myx: [
    { type: 'preopening',      nameEn: 'AM Preopening',               nameKr: '오전 프리오픈', startKST: '09:30', endKST: '10:00' },
    { type: 'continuous',      nameEn: 'AM Continuous Trading',       nameKr: '오전 정규장',   startKST: '10:00', endKST: '13:30' },
    { type: 'lunch',           nameEn: 'Lunch Break',                 nameKr: '점심시간',      startKST: '13:30', endKST: '15:00' },
    { type: 'preopening',      nameEn: 'PM Preopening',               nameKr: '오후 프리오픈', startKST: '15:00', endKST: '15:30' },
    { type: 'continuous',      nameEn: 'PM Continuous Trading',       nameKr: '오후 정규장',   startKST: '15:30', endKST: '17:45' },
    { type: 'closing_auction', nameEn: 'Closing Auction Call Phase',  nameKr: '마감 동시호가', startKST: '17:45', endKST: '17:50' },
    { type: 'trade_at_close',  nameEn: 'Trade at Close',              nameKr: '종가 거래',     startKST: '17:50', endKST: '18:00' },
  ],

  pse: [
    { type: 'opening_auction', nameEn: 'Opening Match Auction',       nameKr: '시초가 경매',   startKST: '10:00', endKST: '10:30' },
    { type: 'continuous',      nameEn: 'AM Continuous Trading',       nameKr: '오전 정규장',   startKST: '10:30', endKST: '13:00' },
    { type: 'lunch',           nameEn: 'Lunch Break',                 nameKr: '점심시간',      startKST: '13:00', endKST: '14:00' },
    { type: 'continuous',      nameEn: 'PM Continuous Trading',       nameKr: '오후 정규장',   startKST: '14:00', endKST: '15:45' },
    { type: 'closing_auction', nameEn: 'Closing Match Auction',       nameKr: '마감 경매',     startKST: '15:45', endKST: '15:50' },
    { type: 'trade_at_close',  nameEn: 'Trade at Close',              nameKr: '종가 거래',     startKST: '15:50', endKST: '16:00' },
  ],

  set: [
    { type: 'preopening',      nameEn: 'AM Preopening',              nameKr: '오전 프리오픈',  startKST: '11:30', endKST: '12:00', note: '랜덤 개장' },
    { type: 'continuous',      nameEn: 'AM Continuous Trading',      nameKr: '오전 정규장',    startKST: '12:00', endKST: '14:30' },
    { type: 'lunch',           nameEn: 'Lunch Break',                nameKr: '점심시간',       startKST: '14:30', endKST: '15:30' },
    { type: 'preopening',      nameEn: 'PM Preopening',              nameKr: '오후 프리오픈',  startKST: '15:30', endKST: '16:00', note: '랜덤 개장' },
    { type: 'continuous',      nameEn: 'PM Continuous Trading',      nameKr: '오후 정규장',    startKST: '16:00', endKST: '18:30' },
    { type: 'closing_auction', nameEn: 'PM Closing Match Auction',   nameKr: '마감 경매',      startKST: '18:30', endKST: '18:40', note: '랜덤 종료' },
    { type: 'after_hours',     nameEn: 'After Hours',                nameKr: '시간외 거래',    startKST: '18:40', endKST: '19:00' },
  ],

  twse: [
    { type: 'preopening',      nameEn: 'Preopening',            nameKr: '프리오픈',    startKST: '09:30', endKST: '10:00' },
    { type: 'continuous',      nameEn: 'Continuous Trading',    nameKr: '정규장',      startKST: '10:00', endKST: '14:25' },
    { type: 'closing_auction', nameEn: 'Closing Match Auction', nameKr: '마감 경매',   startKST: '14:25', endKST: '14:30', note: 'Effective Feb 20, 2025' },
    { type: 'block_trade',     nameEn: 'Block Trade',           nameKr: '대량 거래',   startKST: '09:00', endKST: '18:00' },
    { type: 'odd_lot',         nameEn: 'Odd-Lot Trading',       nameKr: '단주 거래',   startKST: '14:40', endKST: '15:30' },
    { type: 'after_hours',     nameEn: 'After Hours (Fixed)',   nameKr: '시간외 정가', startKST: '15:00', endKST: '15:30' },
  ],

  // ── EUROPE ──────────────────────────────────────────────────────────
  // All KST times: European markets open ~16:00 KST and close ~00:30 KST (cross-midnight)

  lse: [
    { type: 'preopening',      nameEn: 'Preopening',            nameKr: '프리오픈',    startKST: '13:05', endKST: '15:50' },
    { type: 'opening_auction', nameEn: 'Opening Match Auction', nameKr: '시초가 경매', startKST: '15:50', endKST: '16:00' },
    { type: 'continuous',      nameEn: 'Continuous Trading',    nameKr: '정규장',      startKST: '16:00', endKST: '00:30' },
    { type: 'closing_auction', nameEn: 'Closing Match Auction', nameKr: '마감 경매',   startKST: '00:30', endKST: '00:35' },
    { type: 'trade_at_close',  nameEn: 'Trade at Close',        nameKr: '종가 거래',   startKST: '00:35', endKST: '00:40' },
    { type: 'after_hours',     nameEn: 'After Hours',           nameKr: '시간외 거래', startKST: '00:40', endKST: '01:15' },
  ],

  euronext: [
    { type: 'preopening',      nameEn: 'Preopening',                  nameKr: '프리오픈',    startKST: '14:30', endKST: '16:00', note: '랜덤 Uncrossing' },
    { type: 'continuous',      nameEn: 'Continuous Trading',          nameKr: '정규장',      startKST: '16:00', endKST: '00:30' },
    { type: 'closing_auction', nameEn: 'Closing Auction Call Phase',  nameKr: '마감 동시호가', startKST: '00:30', endKST: '00:35', note: '랜덤 Uncrossing' },
  ],

  xetra: [
    { type: 'preopening',      nameEn: 'Preopening',            nameKr: '프리오픈',    startKST: '14:30', endKST: '15:50', note: '호가 입력 가능' },
    { type: 'opening_auction', nameEn: 'Opening Match Auction', nameKr: '시초가 경매', startKST: '15:50', endKST: '16:04' },
    { type: 'continuous',      nameEn: 'Continuous Trading',    nameKr: '정규장',      startKST: '16:00', endKST: '00:30' },
    { type: 'closing_auction', nameEn: 'Closing Match Auction', nameKr: '마감 경매',   startKST: '00:30', endKST: '00:35' },
    { type: 'trade_at_close',  nameEn: 'Trade at Close',        nameKr: '종가 거래',   startKST: '00:35', endKST: '00:40' },
  ],

  six: [
    { type: 'preopening',      nameEn: 'Preopening',            nameKr: '프리오픈',    startKST: '14:30', endKST: '16:00' },
    { type: 'continuous',      nameEn: 'Continuous Trading',    nameKr: '정규장',      startKST: '16:00', endKST: '00:20' },
    { type: 'closing_auction', nameEn: 'Closing Auction',       nameKr: '마감 경매',   startKST: '00:20', endKST: '00:30' },
  ],

  borsa: [
    { type: 'opening_auction', nameEn: 'Opening Match Auction', nameKr: '시초가 경매', startKST: '14:30', endKST: '16:00' },
    { type: 'continuous',      nameEn: 'Continuous Trading',    nameKr: '정규장',      startKST: '16:00', endKST: '00:30' },
    { type: 'closing_auction', nameEn: 'Closing Match Auction', nameKr: '마감 경매',   startKST: '00:30', endKST: '00:35' },
    { type: 'trade_at_close',  nameEn: 'Trade at Close',        nameKr: '종가 거래',   startKST: '00:35', endKST: '00:40' },
    { type: 'after_hours',     nameEn: 'After Hours',           nameKr: '시간외 거래', startKST: '01:00', endKST: '03:30' },
  ],

  // ── AMERICAS ────────────────────────────────────────────────────────
  // US/Canada: 22:30–05:00 KST (= 09:30–16:00 ET), cross-midnight

  nyse: [
    { type: 'preopening',  nameEn: 'Preopening (Pre-Market)', nameKr: '프리마켓',    startKST: '16:30', endKST: '22:30', note: '호가 입력 가능' },
    { type: 'continuous',  nameEn: 'Continuous Trading',      nameKr: '정규장',      startKST: '22:30', endKST: '05:00' },
    { type: 'after_hours', nameEn: 'After Hours',             nameKr: '시간외 거래', startKST: '05:00', endKST: '09:00' },
  ],

  nasdaq: [
    { type: 'preopening',  nameEn: 'Preopening (Pre-Market)', nameKr: '프리마켓',    startKST: '16:30', endKST: '22:30' },
    { type: 'continuous',  nameEn: 'Continuous Trading',      nameKr: '정규장',      startKST: '22:30', endKST: '05:00' },
    { type: 'after_hours', nameEn: 'After Hours',             nameKr: '시간외 거래', startKST: '05:00', endKST: '09:00' },
  ],

  tsx: [
    { type: 'preopening', nameEn: 'Preopening', nameKr: '프리오픈', startKST: '20:00', endKST: '22:30' },
    { type: 'continuous', nameEn: 'Continuous Trading', nameKr: '정규장', startKST: '22:30', endKST: '05:00' },
  ],
};
