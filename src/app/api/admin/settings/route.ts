import { NextResponse } from 'next/server';
import { requireSuperAdmin, unauthorizedResponse, logAudit } from '@/lib/admin';
import { prisma } from '@/lib/db';

// GET /api/admin/settings — get all platform settings
export async function GET() {
  const admin = await requireSuperAdmin();
  if (!admin) return unauthorizedResponse();

  const settings = await prisma.platformSettings.findMany();
  const map: Record<string, string> = {};
  for (const s of settings) map[s.key] = s.value;

  // Defaults
  if (!map['registration_enabled']) map['registration_enabled'] = 'true';
  if (!map['login_enabled']) map['login_enabled'] = 'true';

  return NextResponse.json({ settings: map });
}

// PUT /api/admin/settings — update platform settings
export async function PUT(req: Request) {
  const admin = await requireSuperAdmin();
  if (!admin) return unauthorizedResponse();

  const body = await req.json();
  const allowed = ['registration_enabled', 'login_enabled'];

  const updates: Record<string, string> = {};
  for (const key of allowed) {
    if (key in body) updates[key] = String(body[key]);
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: 'Yenilənəcək parametr yoxdur' }, { status: 400 });
  }

  for (const [key, value] of Object.entries(updates)) {
    await prisma.platformSettings.upsert({
      where: { key },
      create: { key, value },
      update: { value },
    });
  }

  await logAudit(admin.id, 'UPDATE_SETTINGS', 'SETTINGS', 'platform', { updates });

  return NextResponse.json({ success: true, settings: updates });
}

