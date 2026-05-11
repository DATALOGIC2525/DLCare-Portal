# サービス詳細情報（説明・画像）の追加

ダッシュボードでサービスを開くボタンの上部に、サービスごとの説明文（テキスト）や画像（URL）を表示できるように機能拡張を行います。すべてのサービスに適用できるように、管理画面から各サービスごとにこれらを編集可能にします。

## User Review Required

> [!IMPORTANT]
> **データベース（Prisma）のスキーマ変更**を伴います。
> 本計画の承認後、自動的にマイグレーションコマンド（`npx prisma db push` 等）を実行しデータベースに変更を反映しますが、運用中のデータが消えることはありません。

## Open Questions

> [!WARNING]
> 画像のアップロードとリッチテキストエディタについて：
> 添付いただいた画像のような編集ツール（リッチテキストエディタ）を導入することは**可能**です。
> 今回の実装では、React環境でよく使われるエディタ（MarkdownエディタまたはWYSIWYGエディタ）を組み込み、文字の装飾やテーブル作成などを行えるようにします。
> また、エディタ内に画像を直接挿入（アップロード）できるよう、サーバー内（`public/uploads` フォルダなど）に画像を保存する仕組みを併せて構築します。
> この方針で進めてよろしいでしょうか？

## Proposed Changes

### Database Schema
- `Service` モデルの拡張

#### [MODIFY] [schema.prisma](file:///d:/%E3%82%BD%E3%83%95%E3%83%88%E9%96%8B%E7%99%BA/DLCare%E3%83%9D%E3%83%BC%E3%82%BF%E3%83%AB%E3%82%B5%E3%82%A4%E3%83%88/prisma/schema.prisma)
`Service` モデルにリッチテキストのコンテンツを保存するためのフィールドを追加します。
- `description String?` (HTMLまたはMarkdown形式のテキストデータを保存)

---

### Backend API (ファイルアップロード)
画像をサーバーに保存するためのAPIエンドポイントを作成します。

#### [NEW] `src/app/api/upload/route.ts`
- エディタから送信された画像ファイルを受け取り、プロジェクト内の `public/uploads` フォルダ等に保存し、アクセス用のURL（例: `/uploads/filename.png`）を返すAPIを実装します。

---

### Admin Dashboard (サービス管理画面)
管理画面にリッチテキストエディタを導入します。

#### [MODIFY] [actions.ts](file:///d:/%E3%82%BD%E3%83%95%E3%83%88%E9%96%8B%E7%99%BA/DLCare%E3%83%9D%E3%83%BC%E3%82%BF%E3%83%AB%E3%82%B5%E3%82%A4%E3%83%88/src/app/dashboard/admin/services/actions.ts)
`updateServiceInfo` と `createService` 関数内で `description` を受け取り、データベースに保存するように修正します。

#### [MODIFY] [page.tsx](file:///d:/%E3%82%BD%E3%83%95%E3%83%88%E9%96%8B%E7%99%BA/DLCare%E3%83%9D%E3%83%BC%E3%82%BF%E3%83%AB%E3%82%B5%E3%82%A4%E3%83%88/src/app/dashboard/admin/services/page.tsx)
- 新規追加フォームおよび編集フォームの説明文入力欄に、**リッチテキストエディタ（WYSIWYG/Markdownエディタライブラリ）**を導入します。
- エディタの画像挿入機能と上記で作ったアップロードAPIを連携させます。

---

### User Dashboard (カスタマーポータル)
追加された説明文と画像をユーザー画面に表示します。

#### [MODIFY] [ribbon-dashboard.tsx](file:///d:/%E3%82%BD%E3%83%95%E3%83%88%E9%96%8B%E7%99%BA/DLCare%E3%83%9D%E3%83%BC%E3%82%BF%E3%83%AB%E3%82%B5%E3%82%A4%E3%83%88/src/components/ribbon-dashboard.tsx)
- `Service` の型定義に `description: string | null` と `imageUrl: string | null` を追加します。
- 選択されたサービス（`selectedService`）に `description` や `imageUrl` が設定されている場合、詳細パネル内の「{サービス名} を開く」ボタンの直上に、画像と説明文を表示するレイアウトを追加します。
- 画像は `img` タグでレスポンシブに表示させ、説明文は読みやすいようにスタイリングします。

## Verification Plan

### Automated Tests
- なし（UI変更とDBスキーマ変更のため手動確認を優先）

### Manual Verification
1. `npx prisma generate` と `npx prisma db push` でDBスキーマの変更が正常に適用されることを確認します。
2. 管理画面（`/dashboard/admin/services`）にアクセスし、任意のサービス（例：スタートサポート）の説明文と画像URLを登録して保存できるか確認します。
3. ダッシュボードでそのサービスを開き、設定した画像とテキストが「開く」ボタンの上部に正しく表示されているか確認します。
