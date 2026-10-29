import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { compare } from 'bcryptjs';
import { prisma } from '@/lib/db';

export const authOptions: NextAuthOptions = {
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: '/giris',
    newUser: '/qeydiyyat',
  },
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Şifrə', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('E-poçt və şifrə tələb olunur');
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email.toLowerCase() },
        });

        if (!user) {
          throw new Error('Hesab tapılmadı');
        }

        // Super Admin always can login regardless of platform login_enabled setting
        if (user.role !== 'SUPER_ADMIN') {
          // Check if login is enabled
          const loginSetting = await prisma.platformSettings.findUnique({
            where: { key: 'login_enabled' },
          });
          if (loginSetting && loginSetting.value === 'false') {
            throw new Error('Sistem girişi müvəqqəti dayandırılıb. Zəhmət olmasa sonra yenidən cəhd edin.');
          }

          // Check ban status
          if (user.status === 'BANNED') {
            throw new Error('Hesabınız bloklanmışdır. Ətraflı məlumat üçün adminə müraciət edin.');
          }

          // Check subscription expiry
          if (user.subscriptionExpiry && new Date(user.subscriptionExpiry) < new Date()) {
            throw new Error('İstifadə müddətiniz bitmişdir. Yenilənmə üçün adminə müraciət edin.');
          }
        }

        const isValid = await compare(credentials.password, user.passwordHash);

        if (!isValid) {
          throw new Error('Şifrə yanlışdır');
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          role: user.role,
          status: user.status,
          subscriptionExpiry: user.subscriptionExpiry?.toISOString() ?? null,
          maxSites: user.maxSites ?? null,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.status = user.status;
        token.subscriptionExpiry = user.subscriptionExpiry;
        token.maxSites = user.maxSites;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as { id: string }).id = token.id as string;
        (session.user as { role?: string }).role = token.role as string;
        (session.user as { status?: string }).status = token.status as string;
        (session.user as { subscriptionExpiry?: string | null }).subscriptionExpiry = token.subscriptionExpiry as string | null;
        (session.user as { maxSites?: number | null }).maxSites = token.maxSites as number | null;
      }
      return session;
    },
  },
};
