# Global Exchange Monitor

글로벌 주식시장 실시간 모니터링 — 트레이더용

---

## 로컬 개발 환경 실행 가이드

### 전제 조건
- Node.js 18 이상 ([nodejs.org](https://nodejs.org))
- Git 설치

---

### 처음 시작할 때 (최초 1회)

```powershell
# 1. 코드 받기 (C:\Dev\gsm 에 clone)
git clone https://github.com/duixun88/globalexmonitoring.git C:\Dev\gsm

# 2. 폴더 이동
cd C:\Dev\gsm

# 3. 패키지 설치
npm install

# 4. 개발 서버 실행
npm run dev
```

브라우저에서 `http://localhost:3000` 접속

---

### 이미 clone한 경우 (매번 작업 시작할 때)

```powershell
cd C:\Dev\gsm
git pull
npm run dev
```

종료: `Ctrl + C`

---

### ⚠️ 주의 — Google Drive 경로에서는 실행 불가

```
❌ G:\내 드라이브\Dev-Projects\...   (Google Drive — 실행 안 됨)
✅ C:\Dev\gsm\                        (로컬 드라이브 — 정상 작동)
```

Windows 보안 정책상 네트워크 드라이브에서 네이티브 바이너리 실행이 차단됩니다.
반드시 로컬 드라이브(C:\)에서 실행하세요.

---

### 코드 수정 후 GitHub에 올리기

```powershell
cd C:\Dev\gsm
git add .
git commit -m "변경 내용 설명"
git push origin main
```

push하면 Vercel에 **자동 배포**됩니다.

---

## Vercel 배포 (최초 1회)

1. [vercel.com](https://vercel.com) 로그인 (GitHub 계정 연동)
2. **Add New Project** 클릭
3. `globalexmonitoring` 저장소 선택
4. 설정 확인:
   - Framework Preset: **Vite**
   - Build Command: `npm run build`
   - Output Directory: `dist`
5. **Deploy** 클릭

이후엔 `git push` 만 하면 자동 배포됩니다.

---

## 프로젝트 구조

```
src/
├── data/exchanges.ts          # 15개 거래소 데이터
├── types/exchange.ts          # TypeScript 타입
├── utils/timeUtils.ts         # Intl API 기반 시간 계산 (DST 자동)
├── hooks/
│   ├── useClock.ts            # 1초 KST 시계
│   └── useExchangeStatuses.ts # 거래소 상태 파생
├── components/
│   ├── Header.tsx             # KST 시계 + 개장/폐장 요약
│   ├── Timeline/              # 24h KST 타임라인
│   └── StatusGrid/            # 거래소 상태 카드 그리드
└── App.tsx
```

## 주요 기능

- **KST 기준 24시간 타임라인** — 전 거래소 교차 시간 한눈에 확인
- **서머타임 자동 반영** — Intl API, 수동 DST 규칙 없음
- **점심휴장 표시** — TSE·SSE·HKEX 황색 구간
- **KST ↔ 현지시간 즉시 변환** — 카드 + 타임라인 동시 표시
- **개장 카운트다운** — 초 단위 실시간
