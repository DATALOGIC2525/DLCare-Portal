# DLCare Portal

DLCare Portalは、マルチテナントに対応した顧客・サービス管理ポータルサイトです。
システム管理者によるテナント管理、テナント管理者によるユーザー管理、および各種外部サービスへの連携機能を提供します。

## 主な機能

- **マルチテナント管理**: 複数の顧客（テナント）を個別に管理。
- **ロールベースアクセス制御 (RBAC)**:
  - **システム管理者**: テナントの作成・編集・削除、全ユーザーの管理、お知らせの全体配信。
  - **テナント管理者**: 自テナント内の一般ユーザー管理、テナント情報の確認。
  - **一般ユーザー**: 割り当てられたサービスへのアクセス、お知らせの閲覧、プロフィール管理。
- **サービス連携**: 外部サービス（動画配信、AIチャットなど）の資格情報を管理し、ポータルから直接アクセス可能。
- **お知らせ配信**: テナントやロールを絞り込んだお知らせの掲示。
- **監査ログ**: 重要な操作ログの記録。

## 技術スタック

- **Framework**: [Next.js](https://nextjs.org/) (App Router)
- **Language**: TypeScript
- **Database**: SQLite / [Prisma](https://www.prisma.io/)
- **Authentication**: [NextAuth.js (Auth.js)](https://authjs.dev/)
- **Styling**: Tailwind CSS / Vanilla CSS
- **Components**: shadcn/ui

## セットアップ手順

### 1. リポジトリのクローン
```bash
git clone <repository-url>
cd DLCare-Portal
```

### 2. 依存関係のインストール
```bash
npm install
```

### 3. 環境変数の設定
`.env.example` をコピーして `.env` ファイルを作成し、必要な値を設定してください。

```bash
cp .env.example .env
```

### 4. データベースのセットアップ
Prismaを使用してデータベースのマイグレーションとシードデータの投入を行います。

```bash
# マイグレーションの実行
npx prisma migrate dev --name init

# シードデータの投入（管理者アカウント等の作成）
npx prisma db seed
```

### 5. 開発サーバーの起動
```bash
npm run dev
```

ブラウザで [http://localhost:3000](http://localhost:3000) を開き、動作を確認してください。

## 開発ガイド

### Prismaの操作
スキーマを変更した場合は、以下のコマンドを実行してください。

```bash
npx prisma generate
npx prisma migrate dev
```

### ビルド
本番環境向けのビルドを行う場合：
```bash
npm run build
npm run start
```

## ライセンス

[LICENSE](LICENSE) ファイルを参照してください。
