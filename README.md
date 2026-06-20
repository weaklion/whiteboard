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
- ✅ URL 기반 방 공유(진행중)
- ✅ Undo/Redo 기능
- ✅ Shape 변형 및 드래그
- ✅ 실시간 유저 수 표시

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
- Lucide React (아이콘)
- Nanoid (ID 생성)

### 서버

- Node.js
- Express
- Socket.IO
- TypeScript

### 개발 도구

- pnpm (패키지 관리자)
- pnpm workspaces (모노레포)

## 📚 구현 상세 (Implementation Details)

### 1. 선 (Line)

- **데이터 구조**: `ShapeLine` 인터페이스(`points`, `stroke`, `strokeWidth` 등)를 사용하여 관리합니다.
-
- **로직**: `useCanvasDrawing` 훅을 통해 마우스 이벤트를 감지합니다. 드래그 중에는 `DraftStore`에 임시 데이터를 저장하여 빠른 반응성을 확보하고, 드래그가 끝나면 `ShapeStore`에 저장 및 `socket`을 통해 서버로 전송합니다.

### 2. 텍스트 (Text)

- **데이터 구조**: `ShapeText` 인터페이스(`x`, `y`, `value`, `fontSize` 등)를 사용하여 관리합니다.
- **렌더링**: `TextShape` 컴포넌트를 사용하며, 내부적으로 `EditableText`를 통해 편집 기능을 제공합니다.
- **로직**: 텍스트 도구 선택 후 클릭 시 생성됩니다. `Html` 컴포넌트(rea **렌더링**: `react-konva`의 `Line` 컴포넌트를 사용하여 캔버스에 그립니다.ct-konva-utils)를 활용하거나 HTML overlay 방식을 사용하여 캔버스 위에서 직접 타이핑이 가능하도록 구현되어 있습니다.

### 3. 선택 (Selection)

- **데이터 구조**: `SelectionStore`를 통해 선택된 도형들의 ID 배열(`selectedIds`)을 관리합니다.
- **렌더링**: 선택된 도형 주위에 `Konva.Transformer`를 부착하여 크기 조절 및 회전 핸들을 표시합니다.
- **로직**: `useCanvasSelection` 훅이 담당합니다.
  - **클릭 선택**: 단일 도형 선택 또는 Shift/Ctrl 키를 이용한 다중 선택.
  - **드래그 선택**: 마우스 드래그로 사각형 영역을 만들고, `Konva.Util.haveIntersection`을 사용하여 해당 영역 교차하는 모든 도형을 선택합니다.

## 🚧 향후 계획

- [ ] Shape 업데이트 동기화 (드래그, 변형)
- [ ] 지우개 기능 개선 (Layer 합성 방식)
- [ ] 색상/두께 선택 UI
- [ ] 공통 타입 패키지 분리

## 📄 라이선스

MIT
