'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users,
  UserPlus,
  Search,
  Filter,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Shield,
  Trash2,
  Loader2,
} from 'lucide-react';
import EmployeeStatsCards from '@/components/dashboard/employees/EmployeeStatsCards';
import EmployeeTable from '@/components/dashboard/employees/EmployeeTable';
import EmployeeModal from '@/components/dashboard/employees/EmployeeModal';
import EmployeeDetailModal from '@/components/dashboard/employees/EmployeeDetailModal';
import EmployeePasswordModal from '@/components/dashboard/employees/EmployeePasswordModal';
import EmployeeActivityModal from '@/components/dashboard/employees/EmployeeActivityModal';
import {
  EmployeeItem,
  EmployeeStats,
  SystemModule,
  EmployeeOrganization,
} from '@/components/dashboard/employees/types';

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<EmployeeItem[]>([]);
  const [stats, setStats] = useState<EmployeeStats>({ total: 0, active: 0, inactive: 0, onLeave: 0 });
  const [systemModules, setSystemModules] = useState<SystemModule[]>([]);
  const [organizations, setOrganizations] = useState<EmployeeOrganization[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Filters & Pagination
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [positionFilter, setPositionFilter] = useState('');
  const [orgFilter, setOrgFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Modals state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<EmployeeItem | null>(null);

  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [viewingEmployee, setViewingEmployee] = useState<EmployeeItem | null>(null);

  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [passwordTargetEmployee, setPasswordTargetEmployee] = useState<EmployeeItem | null>(null);

  const [isActivityModalOpen, setIsActivityModalOpen] = useState(false);
  const [activityTargetEmployee, setActivityTargetEmployee] = useState<EmployeeItem | null>(null);

  const [deleteTargetEmployee, setDeleteTargetEmployee] = useState<EmployeeItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Toast / notification
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch organizations
  useEffect(() => {
    fetch('/api/organizations')
      .then((r) => r.json())
      .then((d) => {
        if (d.organizations) {
          setOrganizations(
            d.organizations.map((o: any) => ({
              id: o.id,
              name: o.name,
              slug: o.slug,
              logo: o.logo,
            }))
          );
        }
      })
      .catch(() => {});
  }, []);

  // Fetch employees list
  const fetchEmployees = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const params = new URLSearchParams();
      if (debouncedSearch) params.set('q', debouncedSearch);
      if (statusFilter) params.set('status', statusFilter);
      if (positionFilter) params.set('position', positionFilter);
      if (orgFilter) params.set('organizationId', orgFilter);
      params.set('page', page.toString());
      params.set('limit', '10');

      const res = await fetch(`/api/employees?${params.toString()}`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Məlumatları yükləmək mümkün olmadı');
      }

      setEmployees(data.employees || []);
      setStats(data.stats || { total: 0, active: 0, inactive: 0, onLeave: 0 });
      setTotalPages(data.pagination?.totalPages || 1);
      setTotalCount(data.pagination?.total || 0);

      if (data.systemModules) {
        setSystemModules(data.systemModules);
      }
    } catch (err: any) {
      showToast(err.message || 'Xəta baş verdi', 'error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [debouncedSearch, statusFilter, positionFilter, orgFilter, page]);

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  // Quick toggle status (ACTIVE <-> INACTIVE)
  const handleToggleStatus = async (emp: EmployeeItem) => {
    const nextStatus = emp.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    try {
      const res = await fetch(`/api/employees/${emp.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Status dəyişdirilə bilmədi');

      showToast(
        nextStatus === 'ACTIVE'
          ? `${emp.fullName} aktiv edildi`
          : `${emp.fullName} deaktiv edildi`
      );
      fetchEmployees(true);
    } catch (err: any) {
      showToast(err.message || 'Xəta baş verdi', 'error');
    }
  };

  // Delete employee
  const confirmDelete = async () => {
    if (!deleteTargetEmployee) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/employees/${deleteTargetEmployee.id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Silinmə zamanı xəta baş verdi');

      showToast(`${deleteTargetEmployee.fullName} uğurla silindi`);
      setDeleteTargetEmployee(null);
      fetchEmployees(true);
    } catch (err: any) {
      showToast(err.message || 'Xəta baş verdi', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  // Unique positions for filtering
  const positions = Array.from(
    new Set(employees.map((e) => e.position).filter((p): p is string => Boolean(p)))
  );

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto' }}>
      {/* Toast Alert */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            style={{
              position: 'fixed',
              top: 24,
              right: 24,
              zIndex: 10000,
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '12px 18px',
              borderRadius: 12,
              background: toast.type === 'success' ? '#00D37D' : '#EF4444',
              color: toast.type === 'success' ? '#121212' : '#FFFFFF',
              boxShadow: '0 8px 30px rgba(0,0,0,0.3)',
              fontSize: 14,
              fontWeight: 600,
            }}
          >
            {toast.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
            <span>{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Page Header */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 16,
          marginBottom: 24,
        }}
      >
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: '#F5F5F7', margin: 0 }}>
            Əməkdaşlar
          </h1>
          <p style={{ fontSize: 13, color: '#B0B0B8', margin: '4px 0 0' }}>
            Əməkdaşların idarə edilməsi, fərdi giriş məlumatları və çevik modul icazələri
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button
            onClick={() => fetchEmployees(true)}
            disabled={refreshing}
            title="Yenilə"
            style={{
              width: 40,
              height: 40,
              borderRadius: 10,
              background: '#222226',
              border: '1px solid #383334',
              color: '#B0B0B8',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
            }}
          >
            <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
          </button>

          <button
            onClick={() => {
              setEditingEmployee(null);
              setIsModalOpen(true);
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '10px 18px',
              borderRadius: 10,
              background: '#00D37D',
              border: 'none',
              color: '#121212',
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'background 0.15s',
            }}
          >
            <UserPlus size={16} />
            Yeni Əməkdaş
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <EmployeeStatsCards
        stats={stats}
        currentFilter={statusFilter}
        onFilterChange={(s) => {
          setStatusFilter(s);
          setPage(1);
        }}
      />

      {/* Search & Filter Toolbar */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 12,
          padding: 16,
          background: '#171717',
          border: '1px solid #383334',
          borderRadius: 14,
          marginBottom: 16,
          alignItems: 'center',
        }}
      >
        {/* Search Input */}
        <div style={{ flex: '1 1 260px', position: 'relative' }}>
          <Search
            size={16}
            color="#8888A0"
            style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }}
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Ad, e-poçt, telefon və ya istifadəçi adı ilə axtarış..."
            style={{
              width: '100%',
              padding: '9px 12px 9px 36px',
              borderRadius: 10,
              background: '#202024',
              border: '1px solid #383334',
              color: '#F5F5F7',
              fontSize: 13,
              outline: 'none',
            }}
          />
        </div>

        {/* Position Filter */}
        {positions.length > 0 && (
          <select
            value={positionFilter}
            onChange={(e) => {
              setPositionFilter(e.target.value);
              setPage(1);
            }}
            style={filterSelectStyle}
          >
            <option value="">Bütün vəzifələr</option>
            {positions.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        )}

        {/* Status Filter */}
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(1);
          }}
          style={filterSelectStyle}
        >
          <option value="">Bütün statuslar</option>
          <option value="ACTIVE">Aktiv</option>
          <option value="INACTIVE">Deaktiv</option>
          <option value="ON_LEAVE">Məzuniyyət</option>
        </select>

        {/* Site Filter */}
        {organizations.length > 1 && (
          <select
            value={orgFilter}
            onChange={(e) => {
              setOrgFilter(e.target.value);
              setPage(1);
            }}
            style={filterSelectStyle}
          >
            <option value="">Bütün saytlar</option>
            {organizations.map((o) => (
              <option key={o.id} value={o.id}>
                {o.name}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Main Table */}
      <EmployeeTable
        employees={employees}
        loading={loading}
        onView={(emp) => {
          setViewingEmployee(emp);
          setIsDetailOpen(true);
        }}
        onEdit={(emp) => {
          setEditingEmployee(emp);
          setIsModalOpen(true);
        }}
        onResetPassword={(emp) => {
          setPasswordTargetEmployee(emp);
          setIsPasswordModalOpen(true);
        }}
        onViewActivity={(emp) => {
          setActivityTargetEmployee(emp);
          setIsActivityModalOpen(true);
        }}
        onToggleStatus={handleToggleStatus}
        onDelete={(emp) => setDeleteTargetEmployee(emp)}
        onAddNew={() => {
          setEditingEmployee(null);
          setIsModalOpen(true);
        }}
      />

      {/* Pagination Footer */}
      {totalPages > 1 && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginTop: 16,
            padding: '12px 16px',
            background: '#171717',
            border: '1px solid #383334',
            borderRadius: 12,
            fontSize: 13,
            color: '#B0B0B8',
          }}
        >
          <div>
            Ümumi: <strong style={{ color: '#F5F5F7' }}>{totalCount}</strong> əməkdaş (Səhifə{' '}
            <strong style={{ color: '#F5F5F7' }}>{page}</strong> / {totalPages})
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              style={paginationBtnStyle}
            >
              <ChevronLeft size={16} /> Əvvəlki
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              style={paginationBtnStyle}
            >
              Növbəti <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Create / Edit Modal */}
      <EmployeeModal
        employee={editingEmployee}
        systemModules={systemModules}
        organizations={organizations}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingEmployee(null);
        }}
        onSuccess={() => {
          showToast(editingEmployee ? 'Əməkdaş yeniləndi' : 'Yeni əməkdaş yaradıldı');
          fetchEmployees(true);
        }}
      />

      {/* Detail / Profile Modal */}
      <EmployeeDetailModal
        employee={viewingEmployee}
        systemModules={systemModules}
        isOpen={isDetailOpen}
        onClose={() => {
          setIsDetailOpen(false);
          setViewingEmployee(null);
        }}
        onEdit={(emp) => {
          setEditingEmployee(emp);
          setIsModalOpen(true);
        }}
        onResetPassword={(emp) => {
          setPasswordTargetEmployee(emp);
          setIsPasswordModalOpen(true);
        }}
      />

      {/* Password Reset Modal */}
      <EmployeePasswordModal
        employee={passwordTargetEmployee}
        isOpen={isPasswordModalOpen}
        onClose={() => {
          setIsPasswordModalOpen(false);
          setPasswordTargetEmployee(null);
        }}
        onSuccess={() => {
          showToast('Şifrə uğurla yeniləndi');
        }}
      />

      {/* Activity Log Modal */}
      <EmployeeActivityModal
        employee={activityTargetEmployee}
        isOpen={isActivityModalOpen}
        onClose={() => {
          setIsActivityModalOpen(false);
          setActivityTargetEmployee(null);
        }}
      />

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteTargetEmployee && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0,0,0,0.75)',
              backdropFilter: 'blur(4px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 10000,
              padding: 16,
            }}
            onClick={() => setDeleteTargetEmployee(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              style={{
                background: '#171717',
                border: '1px solid #383334',
                borderRadius: 16,
                padding: 24,
                width: '100%',
                maxWidth: 420,
                textAlign: 'center',
              }}
            >
              <div
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: 14,
                  background: 'rgba(239,68,68,0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#EF4444',
                  margin: '0 auto 16px',
                }}
              >
                <Trash2 size={24} />
              </div>
              <h3 style={{ fontSize: 18, fontWeight: 700, color: '#F5F5F7', marginBottom: 8 }}>
                Əməkdaşı Silmək İstəyirsiniz?
              </h3>
              <p style={{ fontSize: 13, color: '#B0B0B8', marginBottom: 22, lineHeight: 1.5 }}>
                <strong style={{ color: '#F5F5F7' }}>{deleteTargetEmployee.fullName}</strong> adlı əməkdaş və onun bütün giriş hüquqları sistemdən tamamilə silinəcək. Bu əməliyyat geri qaytarıla bilməz.
              </p>
              <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
                <button
                  type="button"
                  onClick={() => setDeleteTargetEmployee(null)}
                  disabled={isDeleting}
                  style={{
                    padding: '9px 18px',
                    borderRadius: 10,
                    background: '#2E292A',
                    border: '1px solid #383334',
                    color: '#B0B0B8',
                    fontSize: 13,
                    cursor: 'pointer',
                  }}
                >
                  Ləğv et
                </button>
                <button
                  type="button"
                  onClick={confirmDelete}
                  disabled={isDeleting}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '9px 20px',
                    borderRadius: 10,
                    background: '#EF4444',
                    border: 'none',
                    color: '#FFFFFF',
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  {isDeleting ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                  Təsdiq et və Sil
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

const filterSelectStyle: React.CSSProperties = {
  padding: '9px 14px',
  borderRadius: 10,
  background: '#202024',
  border: '1px solid #383334',
  color: '#F5F5F7',
  fontSize: 13,
  outline: 'none',
  cursor: 'pointer',
};

const paginationBtnStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 4,
  padding: '6px 12px',
  borderRadius: 8,
  background: '#222226',
  border: '1px solid #383334',
  color: '#F5F5F7',
  fontSize: 12,
  cursor: 'pointer',
};

