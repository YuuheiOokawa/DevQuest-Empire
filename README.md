# DevQuest Empire

GitHubの活動（コミット・PR・Issueなど）や資格学習の記録を、自分だけの村・キャラクターの育成に変換するゲーミフィケーションアプリです。

## コンセプト

- GitHub OAuth連携で実際の開発アクティビティを取得し、EXP・ログインボーナス・実績・称号に変換
- クエスト・ミッション形式で日々の開発/学習目標を可視化
- 資格取得・学習ログ（Study Log）も育成要素として反映
- 村（Village）・建物（Buildings）を成長させるシミュレーション要素
- Claude APIが日々のアクティビティに応じた「今日のクエスト」やコメントを自動生成

「開発を頑張るほどキャラが育つ」体験を通じて、日々の学習・開発活動を継続しやすくすることを目指した個人開発プロジェクトです。現在はGitHub連携・EXP・クエスト・村育成の基本ループを実装したMVP段階です。

## 技術スタック

Next.js 16 (App Router) / TypeScript / Prisma + PostgreSQL / Auth.js (NextAuth v5, GitHub OAuth) /
Octokit (GitHub API) / Anthropic Claude API / React Three Fiber (3D表現) / Tailwind CSS

## 主な機能

| 機能 | 説明 |
|---|---|
| GitHub連携 | OAuthログイン後、コミット・PRなどのアクティビティを同期 |
| 育成システム | アクティビティに応じてEXP・ログインボーナスを付与 |
| クエスト / ミッション | 日次・週次の目標を提示し、達成で報酬を獲得 |
| 実績 / 称号 | 継続的な活動に応じて実績・称号を解放 |
| 資格 / 学習ログ | 資格取得・学習記録を育成要素として反映 |
| 村 / 建物 | 育成した村・建物を成長させるシミュレーション要素 |
| AIクエスト生成 | Claude APIが活動内容から日次クエスト・コメントを自動生成 |

## セットアップ

```bash
npm install
cp .env.example .env
# DATABASE_URL / AUTH_SECRET / AUTH_GITHUB_ID・SECRET / ANTHROPIC_API_KEY を設定
npx prisma generate
npm run dev   # http://localhost:4000
```

GitHub OAuth Appは https://github.com/settings/developers から作成してください。

## プロジェクト構成

```
src/app/        画面（dashboard, village, quest, missions, achievements, titles, study, qualifications, profile, settings, login）+ APIルート
src/lib/
  auth.ts       Auth.js設定
  github.ts     GitHub API連携
  sync/         アクティビティ同期処理
  game/         育成ロジック（EXP・実績・称号・クエスト・村・建物など）
  ai/           Claude APIによるクエスト/コメント生成
prisma/         スキーマ・マイグレーション
```
