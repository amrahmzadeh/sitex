import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { listThemes, registerTheme, ThemeDefinitionSchema } from '@/modules/themes';

async function requireSuperAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return false;
  return (session.user as { role?: string }).role === 'SUPER_ADMIN';
}

export async function GET(request: Request) {
  try {
    if (!(await requireSuperAdmin())) {
      return NextResponse.json({ success: false, error: 'İcazəsiz giriş' }, { status: 403 });
    }
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category') || undefined;
    const source = (searchParams.get('source') as 'builtin' | 'custom') || undefined;

    const themes = listThemes({ category, source });
    return NextResponse.json({ success: true, themes });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Xəta baş verdi' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    if (!(await requireSuperAdmin())) {
      return NextResponse.json({ success: false, error: 'İcazəsiz giriş' }, { status: 403 });
    }
    const body = await request.json();
    const validated = ThemeDefinitionSchema.parse(body);
    registerTheme(validated);
    return NextResponse.json({ success: true, theme: validated }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Məlumat etibarsızdır' },
      { status: 400 }
    );
  }
}

