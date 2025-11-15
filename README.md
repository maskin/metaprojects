# GitHub Repositories Dashboard

GitHubの全リポジトリの情報を一覧表示するダッシュボードです。

## 機能

- 認証ユーザーの全GitHubリポジトリの情報を取得
- リポジトリの基本情報（名前、説明、言語、スター数など）を表示
- READMEの内容を表示
- コード統計（言語別の行数）を可視化
- 主要ファイルの内容をシンタックスハイライト付きで表示
- 検索・フィルター機能
- GitHub Actionsで1日1回自動更新
- GitHub Pagesに自動デプロイ

## セットアップ

### 1. 依存関係のインストール

```bash
npm install
```

### 2. GitHub Personal Access Tokenの取得

1. GitHubのSettings > Developer settings > Personal access tokens > Tokens (classic)
2. "Generate new token"をクリック
3. 以下のスコープを選択：
   - `repo` (リポジトリ情報の読み取り)
4. トークンを生成し、コピー

### 3. ローカルでのデータ取得

```bash
GITHUB_TOKEN=your_token_here npm run fetch-repos
```

### 4. 開発サーバーの起動

```bash
npm run dev
```

### 5. ビルド

```bash
npm run build
```

## GitHub Actionsの設定

1. リポジトリのSettings > Secrets and variables > Actions
2. 既存の`GITHUB_TOKEN`が使用されます（自動的に提供されます）
3. より多くのリポジトリにアクセスする場合は、Personal Access Tokenを追加のSecretとして設定できます

## GitHub Pagesの設定

1. リポジトリのSettings > Pages
2. Sourceを"GitHub Actions"に設定
3. ワークフローが自動的にデプロイします

## プロジェクト構造

```
metaprojects/
├── .github/
│   └── workflows/
│       └── update-dashboard.yml  # GitHub Actions設定
├── src/
│   ├── components/
│   │   ├── RepoCard.tsx          # リポジトリカードコンポーネント
│   │   └── RepoDetail.tsx         # リポジトリ詳細モーダル
│   ├── App.tsx                    # メインアプリケーション
│   ├── main.tsx                   # エントリーポイント
│   ├── types.ts                   # TypeScript型定義
│   └── index.css                  # スタイル
├── scripts/
│   └── fetch-repos.js             # データ取得スクリプト
├── public/
│   └── repos-data.json            # リポジトリデータ（自動生成）
├── package.json
├── vite.config.ts
└── tailwind.config.js
```

## 技術スタック

- **React** + **TypeScript** + **Vite**
- **Tailwind CSS** - スタイリング
- **react-syntax-highlighter** - コードシンタックスハイライト
- **GitHub REST API** - リポジトリ情報の取得
- **GitHub Actions** - 自動更新
- **GitHub Pages** - デプロイ

## ライセンス

ISC
