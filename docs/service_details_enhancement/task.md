# サービス詳細拡張タスクリスト

- [x] `prisma/schema.prisma` の `Service` モデルに `description` カラムを追加
- [x] `npx prisma generate` & `npx prisma db push` を実行
- [x] リッチテキストエディタのライブラリ（例: `@uiw/react-md-editor`）をインストール
- [x] 画像アップロード用APIエンドポイント (`src/app/api/upload/route.ts`) を実装
- [x] 管理画面 (`src/app/dashboard/admin/services/page.tsx`, `actions.ts`) にエディタとアップロード連携を組み込み
- [x] カスタマーポータル (`src/components/ribbon-dashboard.tsx`) に Markdown/HTML レンダリング処理を追加
- [x] 動作確認（画像アップロードと表示）
