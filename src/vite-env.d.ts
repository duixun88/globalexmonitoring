/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL?: string;
  readonly VITE_SUPABASE_ANON_KEY?: string;
  readonly VITE_MASTER_IDS?: string; // 마스터(전체 삭제/편집) 아이디 목록, 쉼표 구분
}
interface ImportMeta {
  readonly env: ImportMetaEnv;
}
