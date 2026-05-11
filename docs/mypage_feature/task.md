# マイページ機能実装タスクリスト

- [x] サイドバーへの「マイページ」メニュー追加 (`src/app/dashboard/layout.tsx`)
- [x] ユーザー情報更新用 Server Action の作成 (`src/app/dashboard/mypage/actions.ts`)
- [x] 閲覧専用の所有システム表示テーブルコンポーネントの作成 (`src/app/dashboard/mypage/user-software-table.tsx`)
- [x] プロフィール編集フォームコンポーネントの作成 (`src/app/dashboard/mypage/profile-form.tsx`)
- [x] マイページ画面（親ページ）の作成 (`src/app/dashboard/mypage/page.tsx`)
- [x] 動作確認
    - [x] サイドバーからマイページに遷移できるか
    - [x] アカウント情報（氏名・メール）が更新できるか
    - [x] パスワード変更が正常に動作するか（旧パスワードチェック含む）
    - [x] 企業情報・所有ソフト情報が正しく表示されるか
