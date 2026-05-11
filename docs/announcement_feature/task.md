# お知らせ機能 実装タスクリスト

- [x] `prisma/schema.prisma` に `Announcement` と `UserAnnouncementRead` モデルを追加
- [x] `npx prisma generate` と `npx prisma db push` を実行
- [x] 管理者向け：`src/app/dashboard/admin/announcements/actions.ts` を作成 (CRUD処理)
- [x] 管理者向け：`src/app/dashboard/admin/announcements/page.tsx` を作成 (一覧・作成画面)
- [x] ユーザー向け：`src/app/dashboard/layout.tsx` のサイドバーに未読バッジ付きのメニューを追加
- [x] ユーザー向け：`src/app/dashboard/announcements/page.tsx` を作成 (一覧・詳細表示)
- [x] 動作確認（管理者の作成・編集・削除、ユーザーの未読/既読管理）
