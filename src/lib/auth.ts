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
      }
      return session;
    },
  },
  events: {
    // 初回ログイン時にPlayerとVillageを自動作成する(19_Phase4 M1)
    async createUser({ user }) {
      if (!user.id) return;
      await prisma.player.create({
        data: {
          user: { connect: { id: user.id } },
          name: user.name ?? "Player",
          village: { create: {} },
        },
      });
    },
  },
});
