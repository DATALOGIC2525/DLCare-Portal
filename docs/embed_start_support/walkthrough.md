# スタートサポートへのダッシュボード埋め込み 完了報告

「スタートサポート」サービスの詳細画面に、指定されたURLを iframe で埋め込む作業が完了しました。

## 実施内容

### 1. RibbonDashboard コンポーネントの修正
- `src/components/ribbon-dashboard.tsx` を修正し、「スタートサポート」が選択された際の特別コンテンツとして iframe を追加しました。
- 埋め込み先URL: `https://schedule-set.vercel.app/`
- iframe は詳細パネル全体（`absolute inset-0`）に表示されるように調整しています。

### 2. UIの調整
- 「スタートサポート」が選択されている間は、下部の「サービスを開く」ボタンを非表示にしました。これにより、ポータル内での操作に集中できるUIになっています。

## 修正ファイル
- [ribbon-dashboard.tsx](file:///d:/%E3%82%BD%E3%83%95%E3%83%88%E9%96%8B%E7%99%BA/DLCare-Portal/src/components/ribbon-dashboard.tsx)

## 確認方法
1. DLCare-Portal のダッシュボードを表示します。
2. サービス一覧から「スタートサポート」をクリックします。
3. 詳細エリアに `https://schedule-set.vercel.app/` の内容が表示されることを確認してください。

> [!NOTE]
> 埋め込みを正常に表示するためには、`https://schedule-set.vercel.app/` が稼働している必要があります。また、対象のサイトが iframe での表示を許可している必要があります。
