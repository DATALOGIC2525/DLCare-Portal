# サービス表示制御とサイドバーUIの改善

テナントごとにダッシュボードに表示するサービスを選択できるようにし、サイドバーの現在地を視覚的に分かりやすくします。

## ユーザーレビューが必要な項目
- 特になし。

## 変更内容

### データベース (Prisma)
- [x] `TenantServiceAccess` モデルの追加（実施済み）
- [x] `npx prisma db push` および `generate`（実施済み）

### サーバーアクション
- [MODIFY] [src/app/dashboard/admin/actions.ts](file:///d:/ソフト開発/DLCareポータルサイト/src/app/dashboard/admin/actions.ts)
  - `updateTenantServiceAccess` 関数を追加し、テナントがアクセス可能なサービスを更新できるようにします。

### マスター管理画面
- [MODIFY] [src/app/dashboard/admin/page.tsx](file:///d:/ソフト開発/DLCareポータルサイト/src/app/dashboard/admin/page.tsx)
  - 全サービスを取得し、テナントごとに「サービス利用制限」の設定セクション（チェックボックス一覧）を追加します。
  - 新規登録フォームにも、初期サービス選択（オプション）を追加することを検討します。

### ダッシュボード
- [MODIFY] [src/app/dashboard/page.tsx](file:///d:/ソフト開発/DLCareポータルサイト/src/app/dashboard/page.tsx)
  - サービス取得時に `TenantServiceAccess` を参照し、許可されたサービスのみを表示するようにフィルターをかけます。
  - ただし、システム管理者の場合は全てのサービスが表示されるようにします。

### サイドバー UI
- [x] `NavItem` クライアントコンポーネントの作成（実施済み）
- [x] `DashboardLayout` での `NavItem` 適用とアイコン名の文字列渡し（実施済み）

## 検証計画
### 自動テスト
- ブラウザツールを使用して以下の項目を確認：
  - マスター管理で特定のサービス（例：「く～chat」）のチェックを外して保存する。
  - そのテナントの一般ユーザーでログインし、ダッシュボードから「く～chat」が消えているか確認する。
  - サイドバーのメニューをクリックした際、対応する項目がハイライトされるか確認する。

### 手動確認
- 新規テナント作成時にサービスの初期設定が正しく反映されるか確認します。
