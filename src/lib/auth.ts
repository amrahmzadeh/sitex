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

        const input = credentials.email.trim();
        const inputLower = input.toLowerCase();

        const user = await prisma.user.findFirst({
          where: {
            OR: [
              { email: inputLower },
              { employeeProfile: { username: input } },
              { employeeProfile: { email: inputLower } },
            ],
          },
          include: {
            employeeProfile: true,
          },
        });

        if (!user) {
          throw new Error('Hesab tapılmadı');
        }

        // Employee specific checks
        if (user.role === 'EMPLOYEE') {
          if (user.status === 'BANNED' || user.employeeProfile?.status === 'INACTIVE') {
            throw new Error('Əməkdaş hesabı deaktiv edilib. Zəhmət olmasa adminə müraciət edin.');
          }
        } else if (user.role !== 'SUPER_ADMIN') {
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

        // Update employee last login and log activity
        if (user.role === 'EMPLOYEE' && user.employeeProfile) {
          try {
            await prisma.employee.update({
              where: { id: user.employeeProfile.id },
              data: { lastLoginAt: new Date() },
            });
            await prisma.employeeActivityLog.create({
              data: {
                employeeId: user.employeeProfile.id,
                action: 'LOGIN',
                module: 'auth',
                description: 'Sistemə uğurla daxil oldu',
              },
            });
          } catch (e) {
            console.error('Error logging employee login activity:', e);
          }
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
          employeeId: user.employeeProfile?.id ?? null,
          organizationId: user.employeeProfile?.organizationId ?? null,
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
        token.employeeId = (user as any).employeeId ?? null;
        token.organizationId = (user as any).organizationId ?? null;
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
        (session.user as { employeeId?: string | null }).employeeId = token.employeeId as string | null;
        (session.user as { organizationId?: string | null }).organizationId = token.organizationId as string | null;
      }
      return session;
    },
  },
};
