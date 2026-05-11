# マイページからのアイコン変更機能の実装

マイページでユーザー自身のアイコン（アバター）を変更できるようにします。

## ユーザーレビューが必要な項目（ご質問）

> [!IMPORTANT]  
> **画像データの保存方法についてご指示ください**
> 
> ユーザーがアップロードする画像ファイルは、データベース（SQLite）内にBase64文字列として保存するか、サーバーのローカルディレクトリ（例: `public/uploads`）にファイルとして保存し、DBにはそのパスを記録するかの2通りが考えられます。
> 
> **今回は、セットアップが簡単で追加のインフラ設定が不要な「ローカルディレクトリ(`public/uploads`) への保存」という方針で進めてよろしいでしょうか？**（もしBase64保存など他のご希望があればお知らせください）

## 提案する変更内容

### 1. データベーススキーマの変更
#### [MODIFY] [schema.prisma](file:///d:/ソフト開発/DLCare-Portal/prisma/schema.prisma)
- `User` モデルに画像のURLやパスを保存するための `avatarUrl String?` フィールドを追加します。
- 変更後、`npx prisma db push` でデータベースに反映し、Prisma Client を再生成します。

### 2. サーバーアクションの作成
#### [NEW] [actions.ts](file:///d:/ソフト開発/DLCare-Portal/src/app/dashboard/mypage/actions.ts) (または新規ファイル)
- 画像ファイルを受け取り、サーバーの指定ディレクトリ（`public/uploads/avatars`など）に保存する `uploadAvatar` アクションを作成します。
- 保存したファイルのパスをデータベースの `avatarUrl` に更新します。

### 3. マイページのUI追加
#### [MODIFY] [page.tsx](file:///d:/ソフト開発/DLCare-Portal/src/app/dashboard/mypage/page.tsx)
- アカウント設定領域などに、現在のアイコンを表示し、クリック（またはボタン）でファイルを選択・アップロードできるUIを追加します。
- `shadcn/ui` などの既存コンポーネントを活用して、きれいなデザインにします。

### 4. サイドバーへの反映
#### [MODIFY] [dashboard-sidebar.tsx](file:///d:/ソフト開発/DLCare-Portal/src/components/dashboard-sidebar.tsx)
- データベースから取得した `avatarUrl` が存在する場合はその画像を表示し、無い場合は現状通り名前の頭文字とグラデーションを表示するように変更します。

## 検証計画
- `npx prisma db push` が成功し、データベースが更新されること。
- マイページで画像（JPEG, PNG等）を選択し、アップロードが成功すること。
- アップロード後、マイページおよびサイドバーのアイコンが即座に切り替わること。
- 画像が未設定の場合は、元のグラデーションアイコンが表示されること。
