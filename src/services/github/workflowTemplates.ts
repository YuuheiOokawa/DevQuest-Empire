// CI/Deployワークフローのテンプレート(純粋関数のみ)。
// サーバー・クライアント両方から参照するため、外部依存を持たない。

/**
 * スタジオが生成リポジトリへPushするCIワークフロー。
 * Lint→TypeCheck→Test→Coverage→Build→Security Scan→Artifactの順で、
 * 生成直後のスキャフォールドでも成功するよう各ステップは自己完結にしている。
 */
export function buildCiWorkflowYaml(appName: string): string {
  return `name: CI
on:
  push:
    branches: ["**"]
  pull_request:
  workflow_dispatch:

jobs:
  ci:
    name: Lint / TypeCheck / Test / Build (${appName})
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Lint
        run: echo "lint placeholder (プロジェクト実装後に eslint へ差し替え)"
      - name: Type Check
        run: echo "typecheck placeholder (tsc --noEmit へ差し替え)"
      - name: Unit Test
        run: echo "unit test placeholder (vitest へ差し替え)"
      - name: Coverage
        run: echo "coverage placeholder"
      - name: Build
        run: echo "build placeholder (next build へ差し替え)"
      - name: Security Scan
        run: echo "security scan placeholder (npm audit へ差し替え)"
      - name: Artifact
        run: |
          mkdir -p dist && echo "${appName} artifact" > dist/build.txt
      - uses: actions/upload-artifact@v4
        with:
          name: build
          path: dist/
`;
}

/** Deploy用ワークフロー(workflow_dispatch起動、Human Approval後のみdispatchされる)。 */
export function buildDeployWorkflowYaml(appName: string, target = "Vercel"): string {
  const commands: Record<string, string> = {
    Vercel: "npx vercel deploy --prod --token $VERCEL_TOKEN",
    "Cloudflare Pages": "npx wrangler pages deploy dist --project-name " + appName,
    Netlify: "npx netlify deploy --prod --auth $NETLIFY_AUTH_TOKEN",
    "Firebase Hosting": "npx firebase-tools deploy --only hosting --token $FIREBASE_TOKEN",
    "GitHub Pages": "actions/deploy-pages を使用(Pages設定を有効化)",
    Render: "Render Deploy Hook URLへcurl POST",
    Railway: "npx @railway/cli up --service " + appName,
  };
  return `name: Deploy
on:
  workflow_dispatch:

# デプロイ先: ${target}(Human Approval後のみdispatchされる)
jobs:
  deploy:
    name: Deploy ${appName} to ${target}
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Deploy
        run: |
          echo "${target}へのデプロイはトークンをSecretsへ設定後に有効化してください"
          echo "実行コマンド例: ${commands[target] ?? commands.Vercel}"
`;
}
