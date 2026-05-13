# タスクリスト: 新規登録フローの刷新

- [x] **Phase 1: データベースの更新**
    - [x] `schema.prisma` に `Tenant` の `address`, `phoneNumber` を追加
    - [x] マイグレーションの実行
- [x] **Phase 2: 照合エンジンの作成**
    - [x] `src/lib/tenant-matching.ts` の作成（正規化・スコアリング）
    - [x] 照合ロジックのユニットテスト的な確認
- [x] **Phase 3: 完了画面（Successページ）の作成**
    - [x] `src/app/register/success/page.tsx` の作成（1週間待ちメッセージ）
- [x] **Phase 4: 登録フォーム（UI）の刷新**
    - [x] `src/app/register/page.tsx` をステップ形式（Googleフォーム風）に書き換え
- [x] **Phase 5: 登録APIの更新**
    - [x] `src/app/api/registration/route.ts` を新ロジックに対応
- [x] **Phase 6: 最終確認**
    - [x] 複数パターンでの照合テスト
    - [x] 完了画面へのリダイレクト確認
