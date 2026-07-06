import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";

// スコープ: read:user user:email に加え repo を要求する。
// GitHub OAuth Appには「Privateリポジトリを読み取り専用で」という粒度のスコープが存在しない。
// 書き込みはAI開発スタジオのHuman Approval済み操作(/api/ai-studio/github/execute)からのみ
// 行い、それ以外の機能では読み取り専用として扱う運用。
// 同期対象リポジトリは GithubRepository.syncEnabled / privateConsent で個別オプトイン。
// クライアントID/シークレットは環境変数(AUTH_GITHUB_ID / AUTH_GITHUB_SECRET)で管理し、
// アクセストークンはDBのAccountテーブルにのみ保存する(コード直書き禁止)。
const GITHUB_SCOPE = "read:user user:email repo";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    GitHub({
      clientId: process.env.AUTH_GITHUB_ID,
      clientSecret: process.env.AUTH_GITHUB_SECRET,
      authorization: { params: { scope: GITHUB_SCOPE } },
      profile(profile) {
        return {
          id: String(profile.id),
          name: profile.name ?? profile.login,
          email: profile.email,
          image: profile.avatar_url,
          githubLogin: profile.login,
        };
      },
    }),
  ],
  // GitHubへの再ログインを毎回求めないよう、セッションを60日間・
  // アクセスするたびに有効期限をスライド延長する設定にしている。
  session: {
    strategy: "database",
    maxAge: 60 * 60 * 24 * 60, // 60日
    updateAge: 60 * 60 * 24, // 1日ごとに有効期限を延長
  },
  events: {
    // PrismaAdapterはAccountを初回連携時にしか作成せず、再ログインしても
    // access_tokenが更新されない(失効トークンが残り続ける)ため、
    // サインインのたびに最新トークンでDBを上書きする。
    // これにより「トークン失効→再ログイン」で連携が確実に復旧する。
    async signIn({ account }) {
      if (account?.provider === "github" && account.access_token) {
        await prisma.account.updateMany({
          where: {
            provider: "github",
            providerAccountId: account.providerAccountId,
          },
          data: {
            access_token: account.access_token,
            refresh_token: account.refresh_token ?? undefined,
            expires_at: account.expires_at ?? undefined,
            token_type: account.token_type ?? undefined,
            scope: account.scope ?? undefined,
          },
        });
      }
    },
  },
  callbacks: {
    async session({ session, user }) {
      if (session.user) {
        session.user.id = user.id;
        // Player作成イベントが何らかの理由で未実行/失敗のまま
        // Userだけ存在すると、各画面のPlayer必須チェックとログイン画面の
        // リダイレクトが噛み合って無限ループになるため、ここで都度保証する。
        await prisma.player.upsert({
          where: { userId: user.id },
          update: {},
          create: {
            userId: user.id,
            name: user.name ?? "Player",
            village: { create: {} },
          },
        });
      }
      return session;
    },
  },
});
