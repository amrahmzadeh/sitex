# SiteX İdarəetmə Paneli Memarlıq Bələdçisi (Architecture Guide)

Bu sənəd SiteX platformasının müasirləşdirilmiş, genişləndirilə bilən və yüksək etibarlı Feature-Based Admin Panel memarlığını izah edir.

---

## 1. Memarlıq Fəlsəfəsi və Prinsiplər

1. **Feature-Based Modulluq**: Hər bir funksional sahə öz komponentləri, API adapterləri, tipləri və hook-ları ilə birlikdə müstəqil qovluqda toplanır.
2. **Tək Qeydiyyat Nöqtəsi (Single Source of Truth)**: Yeni modul əlavə edərkən naviqasiya menyusu, route bağlama və əməkdaş icazələri mərkəzi reyestrdən (`src/lib/module-registry/`) avtomatik idarə olunur.
3. **Mərkəzi və Tipləşdirilmiş API**: Bütün şəbəkə sorğuları standartlaşdırılmış `apiClient` vasitəsilə icra olunur, xətalar tutulur və azərbaycan dilində istifadəçiyə çatdırılır.
4. **Çoxsəviyyəli Xəta İzolasiyası (Resilience)**: Qlobal `ErrorBoundary`, həmçinin `/dashboard` və `/admin` üçün fərdi `error.tsx` və `not-found.tsx` ekranları vasitəsilə tətbiqin çökməsinin qarşısı alınır.
5. **Vahid UI Primitivləri**: Cədvəllər (`DataTable`), formlar (`FormField`), təsdiq dialoqları (`ConfirmDialog`) və başlıqlar (`PageHeader`) vahid komponentlər kimi təkrar istifadə olunur.

---

## 2. Qovluq Quruluşu (Folder Structure)

```
src/
├── app/
│   ├── (auth)/               # Giriş və qeydiyyat marşrutları
│   ├── admin/                # Super Admin Paneli (İcmal, İstifadəçilər, Saytlar, Parametrlər, Audit)
│   │   ├── layout.tsx        # SuperAdmin auth yoxlanışı + ToastProvider + AdminShell
│   │   ├── error.tsx         # Super Admin xəta ekranı
│   │   └── not-found.tsx     # Super Admin 404 ekranı
│   ├── dashboard/            # Təşkilat/Kirayəçi Dashboard-u (20+ modul)
│   │   ├── layout.tsx        # Kirayəçi auth + CurrentOrgProvider + ToastProvider + DashboardShell
│   │   ├── error.tsx         # Dashboard xəta ekranı
│   │   ├── not-found.tsx     # Dashboard 404 ekranı
│   │   └── theme/            # Yeni "Tema Kitabxanası" səhifəsi
│   ├── api/                  # REST API Route Handlers
│   ├── error.tsx             # Kök xəta ekranı
│   └── not-found.tsx         # Kök 404 ekranı
├── components/
│   ├── admin/                # AdminShell və super admin komponentləri
│   ├── common/               # Ortaq UI kitabxanası
│   │   ├── DataTable.tsx     # Tipli və səhifələmə dəstəkli cədvəl
│   │   ├── FormField.tsx     # Etiket, validasiya xətası və ipucu dəstəkli sahə
│   │   ├── ConfirmDialog.tsx # Təhlükəsiz silmə/təsdiq modalı
│   │   ├── PageHeader.tsx    # Başlıq, təsvir, ikon və əməliyyat düymələri
│   │   ├── LoadingState.tsx  # Skeleton və spinner yüklənmə vəziyyətləri
│   │   ├── EmptyState.tsx    # Məlumat olmadıqda çıxan vizual blok
│   │   ├── ErrorBoundary.tsx # React komponent səviyyəsində xəta tutucu
│   │   └── index.ts          # Ortaq komponent ixracı
│   ├── dashboard/            # Dashboard spesifik UI elementləri
│   └── themes/               # Sayt render mühərrikləri
├── contexts/
│   ├── CurrentOrgContext.tsx # Aktiv seçilmiş sayt/təşkilat konteksti
│   └── ToastContext.tsx      # Qlobal bildiriş (toast) sistemi
├── lib/
│   ├── api-client.ts         # Mərkəzi HTTP sorğu müştərisi (fetch wrapper)
│   ├── module-registry/      # Modul Qeydiyyat Sistemi (nav + icazələr)
│   ├── tenant-auth.ts        # Çoxkirayəçili (multi-tenant) avtorizasiya
│   └── themes.ts             # Default temalar və ThemeConfig tipi
└── modules/
    ├── navigation/           # Menyu konfiqurasiyası və görünmə qaydaları
    └── themes/               # Daxili temalar reyestri və provider
```

---

## 3. Yeni Modul Necə Əlavə Olunur? (Step-by-Step Guide)

Yeni bir idarəetmə modulunu (məsələn: `Rezervasiyalar` və ya `Kuponlar`) əlavə etmək üçün aşağıdakı 3 addımı izləyin:

### Addım 1: Modulun Qeydiyyatı (`src/lib/module-registry/index.ts`)
`defaultModules` massivinə modulunuzun tərifini əlavə edin:
```typescript
{
  id: 'reservations',
  label: 'Rezervasiyalar',
  href: '/dashboard/reservations',
  icon: CalendarCheck,
  category: 'content',
  description: 'Masa və otaq rezervasiyalarının idarə edilməsi',
  actions: ['view', 'create', 'edit', 'delete', 'manage'],
  // Yalnız restoran və otel kateqoriyalarında göstər:
  visibleFor: ['restoran-ve-qida-sayti', 'otel-ve-turizm'],
  isVisible: (site) => Boolean(site),
}
```
*Bu tək addımla:*
- Sol naviqasiya menyusunda avtomatik olaraq keçid yaranır.
- Əməkdaşların icazə cədvəlində (`SYSTEM_MODULES`) həmin modul üçün hüquqlar avtomatik aktivləşir.
- Rol və icazə qoruması avtomatik təmin olunur.

### Addım 2: API Marşrutunun Yaradılması (`src/app/api/organizations/[orgId]/reservations/route.ts`)
Kirayəçi hüquqlarını yoxlayaraq API endpoint-i qurun:
```typescript
import { NextResponse } from 'next/server';
import { verifyTenantAccess, tenantError } from '@/lib/tenant-auth';
import { prisma } from '@/lib/db';

export async function GET(req: Request, { params }: { params: Promise<{ orgId: string }> }) {
  const { orgId } = await params;
  const access = await verifyTenantAccess(orgId, 'EDITOR');
  if (!access.ok) return tenantError(access);

  // Məlumatları bazadan oxuyun
  return NextResponse.json({ success: true, items: [] });
}
```

### Addım 3: Səhifənin Qurulması (`src/app/dashboard/reservations/page.tsx`)
Ortaq UI komponentlərindən və `apiClient`-dən istifadə edərək səhifəni yaradın:
```tsx
'use client';

import { useState, useEffect } from 'react';
import { CalendarCheck, Plus } from 'lucide-react';
import { PageHeader, DataTable, ConfirmDialog, Column } from '@/components/common';
import { apiClient } from '@/lib/api-client';
import { useToast } from '@/contexts/ToastContext';
import { useCurrentOrg } from '@/contexts/CurrentOrgContext';

export default function ReservationsPage() {
  const { orgId } = useCurrentOrg();
  const { success, error } = useToast();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // Məlumatları yüklə
  useEffect(() => {
    if (!orgId) return;
    apiClient.get(`/api/organizations/${orgId}/reservations`)
      .then(d => setItems(d.items))
      .catch(err => error(err.message))
      .finally(() => setLoading(false));
  }, [orgId, error]);

  const columns: Column<any>[] = [
    { key: 'customerName', header: 'Müştəri' },
    { key: 'date', header: 'Tarix' },
  ];

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto' }}>
      <PageHeader
        title="Rezervasiyalar"
        description="Müştəri rezervasiyalarının idarə edilməsi"
        icon={CalendarCheck}
        actions={
          <button className="dash-btn-primary">
            <Plus size={14} /> Yeni Rezervasiya
          </button>
        }
      />
      <DataTable columns={columns} data={items} loading={loading} />
    </div>
  );
}
```

---

## 4. Təhlükəsizlik və Avtorizasiya Standartları

* **Çoxkirayəçili Təhlükəsizlik**: Heç vaxt müştəri tərəfindən göndərilən `orgId`-yə kor-koranə etibar etməyin. Hər bir API route `verifyTenantAccess(orgId, requiredRole)` ilə istifadəçinin həmin təşkilata mənsubiyyətini, blok statusunu və abunəlik müddətini DB-dən yoxlamalıdır.
* **Super Admin İzolasiyası**: `/admin/*` səhifələri `src/app/admin/layout.tsx` daxilində `user.role === 'SUPER_ADMIN'` və `user.status === 'ACTIVE'` qaydası ilə server səviyyəsində qorunur.
* **İframe İzolasiyası**: Xarici və ya istifadəçi tərəfindən daxil edilən kodları render edən hər hansı iframe mütləq `sandbox="allow-scripts"` parametri ilə təcrid olunmalıdır (eyni domenə və cookie-lərə çıxış verilməməlidir).
* **Mərkəzi Xəta İdarəsi**: `fetch` yerinə `apiClient` istifadə edin; heç vaxt boş `catch` blokları buraxmayın, istifadəçiyə həmişə `useToast().error(...)` vasitəsilə başa düşülən bildiriş göstərin.

