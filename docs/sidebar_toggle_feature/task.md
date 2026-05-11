# タスクリスト: サイドバー開閉機能の実装

- [x] `NavItem` コンポーネントの調整 (`src/components/nav-item.tsx`)
    - [x] `isCollapsed` プロップスの追加とラベル制御
- [x] サイドバーコンポーネントの新規作成 (`src/components/dashboard-sidebar.tsx`)
    - [x] `DashboardLayout` からロジックを移行
    - [x] `useState` による開閉管理と `localStorage` 連携
    - [x] トグルボタンの実装
- [x] レイアウトへの組み込み (`src/app/dashboard/layout.tsx`)
    - [x] サーバーサイドでのデータ取得は維持しつつ、新コンポーネントを呼び出す
- [x] 動作確認
