# ソフト所有情報＆CSVインポート 実装タスクリスト

- [x] `prisma/schema.prisma` の `Tenant` モデルに `softwareCount`, `purchaseDate` カラムを追加
- [x] `npx prisma generate` と `npx prisma db push` を実行
- [x] 管理者向け：`src/app/dashboard/admin/actions.ts` の登録処理に新項目を追加
- [x] 管理者向け：`src/app/dashboard/admin/page.tsx` に新項目の入力・表示UIを追加
- [x] 管理者向け：`src/app/dashboard/admin/page.tsx` にCSVファイル選択UIを追加
- [x] バックエンド：`src/app/api/admin/import-tenants/route.ts` を作成（CSVパース・DB一括登録・結果CSV返却）
- [x] 動作確認（手動登録、CSVインポート、表示の確認）
