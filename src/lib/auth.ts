import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";

// スコープ: read:user user:email に加え repo を要求する。
// GitHub OAuth Appには「Privateリポジトリを読み取り専用で」という粒度のスコープが
// 存在しないため、リポジトリへの書き込みは行わないという運用上の制約として扱う。
// 実際にどのリポジトリを同期対象にするかは GithubRepository.syncEnabled /
// privateConsent でユーザーがアプリ内で個別にオプトインする(18_Phase3参照)。
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
  session: { strategy: "database" },
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
