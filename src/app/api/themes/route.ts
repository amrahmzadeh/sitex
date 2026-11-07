import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { listThemes, registerTheme, deleteTheme, ThemeDefinitionSchema } from '@/modules/themes';

async function requireAuth() {
  const session = await getServerSession(authOptions);
  return session?.user ? session : null;
}

export async function GET(request: Request) {
  try {
    const session = await requireAuth();
    if (!session) {
      return NextResponse.json({ success: false, error: 'Giriş tələb olunur' }, { status: 401 });
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
    const session = await requireAuth();
    if (!session) {
      return NextResponse.json({ success: false, error: 'Giriş tələb olunur' }, { status: 401 });
    }
    const body = await request.json();
    const validated = ThemeDefinitionSchema.parse({
      ...body,
      source: 'custom',
      createdAt: new Date().toISOString(),
    });
    registerTheme(validated);
    return NextResponse.json({ success: true, theme: validated }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Məlumat etibarsızdır' },
      { status: 400 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await requireAuth();
    if (!session) {
      return NextResponse.json({ success: false, error: 'Giriş tələb olunur' }, { status: 401 });
    }
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ success: false, error: 'Tema ID tələb olunur' }, { status: 400 });
    }
    const deleted = deleteTheme(id);
    if (!deleted) {
      return NextResponse.json(
        { success: false, error: 'Daxili temalar silinə bilməz və ya tema tapılmadı' },
        { status: 400 }
      );
    }
    return NextResponse.json({ success: true, message: 'Tema silindi' });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Xəta baş verdi' },
      { status: 500 }
    );
  }
}
