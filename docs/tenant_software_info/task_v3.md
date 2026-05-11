# ソフト所有情報＆Excelテンプレートインポート 実装タスク

- [x] `prisma/schema.prisma` の `Tenant` モデルの修正と `TenantSoftware` モデルの追加
- [x] `npx prisma generate` と `npx prisma db push` を実行
- [x] バックエンド：`src/app/api/admin/import-tenants/route.ts` をエクセル（CSV形式）のフォーマットに合わせて改修
- [x] Server Actions：`src/app/dashboard/admin/actions.ts` を修正（新しい基本情報とソフト情報のCRUD処理追加）
- [x] 管理者UI：`src/app/dashboard/admin/page.tsx` の詳細パネルに「保守情報」フォームと「所有ソフト情報テーブル」を追加
- [x] 動作確認（インポートのテスト、画面からの手動登録・編集・削除のテスト）
