# スタートサポートへのダッシュボード埋め込み

「スタートサポート」サービスの詳細画面に、指定されたURL（`https://schedule-set.vercel.app/`）を iframe で埋め込みます。これにより、ユーザーがポータル内から直接サポートダッシュボードを利用できるようになります。

## 変更内容

### [Component] RibbonDashboard

#### [MODIFY] [ribbon-dashboard.tsx](file:///d:/%E3%82%BD%E3%83%95%E3%83%88%E9%96%8B%E7%99%BA/DLCare-Portal/src/components/ribbon-dashboard.tsx)

- `selectedService.name === 'スタートサポート'` の条件を追加し、iframe をレンダリングするように修正します。
- 「く～chat」や「オンラインセミナー」と同様に、フッターの「サービスを開く」ボタンを「スタートサポート」の場合も非表示（null）にします。
- iframe のスタイルを調整し、パネル全体に広がるようにします。

## 確認事項

- `https://schedule-set.vercel.app/` が実際に稼働している必要があります。
- ブラウザのセキュリティ制限（X-Frame-Options 等）により、埋め込みがブロックされないか確認が必要です。

## 修正後のイメージ

```tsx
{/* サービス別 特別コンテンツ */}
{selectedService.name === 'く～chat' ? (
  // ...
) : selectedService.name === 'スタートサポート' ? (
  <div className="absolute inset-0">
    <iframe 
      src="http://localhost:3000/dashboard"
      className="w-full h-full border-0 rounded-b-xl"
      title="Start Support Dashboard"
    />
  </div>
) : selectedService.name === 'オンラインセミナー' ? (
  // ...
```

## 検証プラン

### 手動確認
- DLCare-Portal を起動し、ダッシュボードにログインする。
- 「スタートサポート」のアイコンをクリックする。
- 詳細パネルに `https://schedule-set.vercel.app/` の内容が表示されることを確認する。
- 下部の「サービスを開く」ボタンが表示されていないことを確認する。
