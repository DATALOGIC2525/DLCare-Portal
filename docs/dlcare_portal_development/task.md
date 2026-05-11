# サイドバー共通レイアウト化 タスクリスト

- [x] フェーズ1: 共通レイアウトの構築
  - [x] `src/app/dashboard/layout.tsx` を新規作成し、サイドバーを移行
  - [x] 共通データの取得（ユーザー情報、テナント情報、利用状況）をレイアウトで実装
- [x] フェーズ2: 各ページのクリーンアップ
  - [x] `src/app/dashboard/page.tsx` からサイドバーを削除
  - [x] `src/app/dashboard/admin/page.tsx` のデザイン調整（サイドバー前提の余白に変更）
  - [x] `src/app/dashboard/admin/services/page.tsx` のデザイン調整
  - [x] `src/app/dashboard/tenant-users/page.tsx` のデザイン調整
- [x] フェーズ3: 動作確認
  - [x] すべての管理画面でサイドバーが正しく表示されることを確認
  - [x] 画面遷移が正常に行えることを確認
  - [x] レスポンシブ表示の確認
