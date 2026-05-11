# サイドバーの共通レイアウト化 実装計画

サイドバーを特定のページから共通のレイアウトファイルに移動し、管理画面（マスター管理、サービス管理、ユーザー管理）を含むすべてのダッシュボード内ページでサイドバーが固定表示されるようにします。

## 課題と解決方針

### 1. 共通レイアウトの導入
- **現状**: サイドバーが `src/app/dashboard/page.tsx` に直接書き込まれており、他のページ（`/dashboard/admin` など）に遷移するとサイドバーが消えてしまう。
- **改善案**: `src/app/dashboard/layout.tsx` を新規作成し、そこにサイドバーのロジックとデザインを移動します。

### 2. データ取得の最適化
- **現状**: サイドバーに表示する「ユーザー名」「テナント名」「利用ユーザー数」などのデータを `page.tsx` で取得している。
- **改善案**: `layout.tsx` でサイドバーに必要な共通データを取得するようにします。Next.js のデータフェッチの仕組みを利用し、各ページで必要なデータはそれぞれのページで取得し続けます。

## Proposed Changes

### 共通レイアウトの作成
#### [NEW] [layout.tsx](file:///d:/ソフト開発/DLCareポータルサイト/src/app/dashboard/layout.tsx)
- サイドバーのデザインとロジックを統合した共通レイアウトを作成します。
- `children` をメインコンテンツエリアに表示するように構成します。

### 各ページの修正
#### [MODIFY] [page.tsx](file:///d:/ソフト開発/DLCareポータルサイト/src/app/dashboard/page.tsx)
- サイドバーの記述を削除し、メインコンテンツ（リボンUI）のみを返すようにします。

#### [MODIFY] [admin/page.tsx](file:///d:/ソフト開発/DLCareポータルサイト/src/app/dashboard/admin/page.tsx)
#### [MODIFY] [admin/services/page.tsx](file:///d:/ソフト開発/DLCareポータルサイト/src/app/dashboard/admin/services/page.tsx)
#### [MODIFY] [tenant-users/page.tsx](file:///d:/ソフト開発/DLCareポータルサイト/src/app/dashboard/tenant-users/page.tsx)
- これらのページから、ダッシュボードに戻るための重複したボタンや不要な余白を調整し、サイドバーがある前提のレイアウトに微調整します。

## User Review Required

> [!IMPORTANT]
> - サイドバーを固定すると、画面の左側 200px 程度が常に占有されます。管理画面のテーブルなどが少し狭くなる可能性がありますが、レスポンシブ対応（横スクロール等）でカバーする方針でよろしいでしょうか？
> - 管理画面内にある「← ダッシュボードへ戻る」ボタンは、サイドバーからいつでも戻れるようになるため、削除してスッキリさせてもよろしいでしょうか？
