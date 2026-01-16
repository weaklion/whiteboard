# 🎨 Collaborative Whiteboard

실시간 협업 화이트보드 애플리케이션 (Monorepo)

## 📦 프로젝트 구조

```
whiteboard/
├── client/              # React 클라이언트
│   ├── src/
│   └── package.json
├── server/              # Express + Socket.IO 서버
│   ├── src/
│   └── package.json
├── package.json         # 루트 (실행 관리)
└── pnpm-workspace.yaml  # pnpm 워크스페이스 설정
```

## 🚀 빠른 시작

### 1. 의존성 설치

```bash
pnpm install
```

**이 명령어 하나로:**
- ✅ 루트 의존성 설치 (concurrently 등)
- ✅ 클라이언트 의존성 설치
- ✅ 서버 의존성 설치

### 2. 개발 서버 실행

```bash
# 🌟 클라이언트 + 서버 동시 실행 (추천)
pnpm dev

# 또는 개별 실행
pnpm dev:client   # 클라이언트만
pnpm dev:server   # 서버만
```

**실행 결과:**
- 🌐 클라이언트: http://localhost:5173
- 🔌 서버: http://localhost:3000

## ✨ 주요 기능

- ✅ 실시간 다중 사용자 협업
- ✅ 브러시/지우개/텍스트 도구
- ✅ URL 기반 방 공유
- ✅ Undo/Redo 기능
- ✅ Shape 변형 및 드래그
- ✅ 실시간 유저 수 표시

## 🔗 방 공유하기

1. 앱 실행 후 "Create New Room" 클릭
2. 상단의 "Share Room" 버튼으로 URL 복사
3. 친구에게 URL 공유
4. 같은 방에서 실시간 협업!

## 📝 사용 가능한 스크립트

```bash
# 개발
pnpm dev              # 클라이언트 + 서버 동시 실행
pnpm dev:client       # 클라이언트만 실행
pnpm dev:server       # 서버만 실행

# 빌드
pnpm build            # 전체 빌드
pnpm build:client     # 클라이언트 빌드
pnpm build:server     # 서버 빌드

# 설치
pnpm install          # 모든 의존성 설치 (루트, client, server)
```

## 🛠️ 기술 스택

### 클라이언트
- React 19
- TypeScript
- Konva / React-Konva (캔버스)
- Zustand (상태 관리)
- Socket.IO Client
- Vite
- Tailwind CSS + DaisyUI

### 서버
- Node.js
- Express
- Socket.IO
- TypeScript

### 개발 도구
- pnpm (패키지 관리자)
- pnpm workspaces (모노레포)

## 🔧 환경 변수

서버 설정은 `server/.env` 파일에서 관리:

```env
PORT=3000
CLIENT_URL=http://localhost:5173
```

## 🧪 네트워크 테스트 (다른 컴퓨터)

1. 서버 IP 확인
```bash
# Windows
ipconfig

# Mac/Linux
ifconfig
```

2. `client/src/services/socketService.ts` 수정
```typescript
socketService.connect("http://YOUR_IP:3000");
```

3. 친구에게 URL 공유
```
http://YOUR_IP:5173?room=abc123
```

## 🚧 향후 계획

- [ ] Shape 업데이트 동기화 (드래그, 변형)
- [ ] 지우개 기능 개선 (Layer 합성 방식)
- [ ] 커서 위치 실시간 공유
- [ ] 색상/두께 선택 UI
- [ ] 공통 타입 패키지 분리
- [ ] Redis 캐싱
- [ ] DB 영구 저장
- [ ] 사용자 인증

## 📄 라이선스

MIT
