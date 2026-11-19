# 이음 캠퍼스 지도 v20 — 클라우드 공유

## 최초 설정 (한 번만)
1. https://supabase.com 에서 새 프로젝트를 만듭니다.
2. Supabase SQL Editor에서 `setup.sql`을 실행합니다.
3. Authentication > Users에서 관리자 이메일 계정을 생성합니다. (이메일 확인이 필요한 경우 확인)
4. Users 목록의 해당 계정 UUID를 복사하여 SQL Editor에서 다음 SQL을 실행합니다.
   `insert into public.admin_users(user_id) values ('실제-UUID');`
5. Project Settings > API에서 Project URL 및 `anon`(또는 publishable) key를 확인하고 `cloud-config.js`의 두 값을 수정합니다. **service_role/secret 키를 입력하면 안 됩니다.**
6. `index.html`, `cloud-config.js`, `campus-reference.png` 파일을 같은 폴더에 두고 Netlify Drop으로 배포합니다.

## 사용법
- 학생: 로그인 없이 지도 열람. 클라우드 위치 데이터를 최초 로드하고 8초마다 변경 확인.
- 관리자: 상단 관리자 버튼 → Supabase 관리자 이메일/비밀번호 로그인 → 건물 위치 수정.
- 변경 후 약 1초 이내 서버 저장 요청, 학생 페이지는 최대 약 8초 후 변경 반영.
- JSON 백업/불러오기 기능 유지.

## 주의
- 기존 v19에서 로컬에만 저장한 좌표는 자동으로 클라우드로 올라가지 않습니다. 관리자 로그인 후 JSON 백업을 불러오면 서버에 저장됩니다.
- 서버 설정 전에는 v20 관리자 로그인/공유가 작동하지 않습니다.
- 현재 버전은 WebSocket 푸시가 아니라 8초 주기 갱신(준실시간)입니다.
- 외부 서버 및 Netlify 실제 배포 환경에서 동작 검증은 별도로 필요합니다.
- 위치 데이터에 개인 정보나 비밀번호를 입력하지 마세요.
