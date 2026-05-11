# お知らせの時間指定投稿機能の実装

お知らせ（システム通知）を特定の日時に自動で公開する機能を追加します。

## ユーザーレビューが必要な項目

> [!NOTE]
> 公開日時を指定しなかった場合は、従来通り「作成時」に即時公開されます。
> 未来の日時を指定した場合は、その時間になるまでユーザー画面には表示されません。

## 提案する変更内容

### 1. データベース層
#### [MODIFY] [schema.prisma](file:///d:/ソフト開発/DLCare-Portal/prisma/schema.prisma)
- `Announcement` モデルに `publishedAt` フィールド（デフォルト値: `now()`）を追加します。

### 2. サーバーアクション
#### [MODIFY] [actions.ts](file:///d:/ソフト開発/DLCare-Portal/src/app/dashboard/admin/announcements/actions.ts)
- `createAnnouncement` と `updateAnnouncement` で `publishedAt` の値（日時）を受け取り、保存するように修正します。

### 3. 管理画面 UI
#### [MODIFY] [page.tsx](file:///d:/ソフト開発/DLCare-Portal/src/app/dashboard/admin/announcements/page.tsx)
- 新規作成および編集フォームに「公開日時」を指定できる入力欄を追加します。
- 一覧表示で、未来の日時が指定されている場合に「予約投稿」であることが分かるようにします。

### 4. ユーザー表示および未読管理
#### [MODIFY] [page.tsx](file:///d:/ソフト開発/DLCare-Portal/src/app/dashboard/announcements/page.tsx)
- お知らせ取得クエリに `publishedAt: { lte: new Date() }` を追加し、未来のお知らせが表示されないようにします。

#### [MODIFY] [layout.tsx](file:///d:/ソフト開発/DLCare-Portal/src/app/dashboard/layout.tsx)
- 未読件数のカウント処理にも同様の条件を追加します。

## 検証計画

### 自動テスト / 手動確認
- 管理画面でお知らせを未来の日時で作成し、一般ユーザー画面に表示されないことを確認。
- 過去の日時または即時公開でお知らせを作成し、即座に表示されることを確認。
- 予約投稿の時間になった後、自動的に表示・カウントされることを確認（リロードによる確認）。
