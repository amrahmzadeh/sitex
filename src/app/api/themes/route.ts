import { NextResponse } from 'next/server';
import { listThemes, registerTheme, ThemeDefinitionSchema } from '@/modules/themes';

export async function GET(request: Request) {
  try {
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
