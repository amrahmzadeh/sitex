'use client';

import { Users, UserCheck, UserX, CalendarClock } from 'lucide-react';
import { EmployeeStats } from './types';

interface Props {
  stats: EmployeeStats;
  currentFilter: string;
  onFilterChange: (status: string) => void;
}

export default function EmployeeStatsCards({ stats, currentFilter, onFilterChange }: Props) {
  const cards = [
    {
      key: '',
      label: 'Ümumi Əməkdaşlar',
      value: stats.total,
      icon: Users,
      color: '#3B82F6',
      bg: 'rgba(59, 130, 246, 0.1)',
    },
    {
      key: 'ACTIVE',
      label: 'Aktiv Əməkdaşlar',
      value: stats.active,
      icon: UserCheck,
      color: '#00D37D',
      bg: 'rgba(0, 211, 125, 0.1)',
    },
    {
      key: 'INACTIVE',
      label: 'Deaktiv Əməkdaşlar',
      value: stats.inactive,
      icon: UserX,
      color: '#EF4444',
      bg: 'rgba(239, 68, 68, 0.1)',
    },
    {
      key: 'ON_LEAVE',
      label: 'Məzuniyyətdə',
      value: stats.onLeave,
      icon: CalendarClock,
      color: '#F59E0B',
      bg: 'rgba(245, 158, 11, 0.1)',
    },
  ];

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
      gap: 16,
      marginBottom: 24,
    }}>
      {cards.map((card) => {
        const Icon = card.icon;
        const isSelected = currentFilter === card.key;
        return (
          <button
            key={card.label}
            onClick={() => onFilterChange(card.key)}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '18px 20px',
              borderRadius: 14,
              border: isSelected ? `2px solid ${card.color}` : '1px solid #383334',
              background: '#171717',
              cursor: 'pointer',
              textAlign: 'left',
              transition: 'all 0.2s',
              transform: isSelected ? 'translateY(-2px)' : 'none',
              boxShadow: isSelected ? `0 4px 20px ${card.bg}` : 'none',
            }}
          >
            <div>
              <p style={{ fontSize: 13, color: '#B0B0B8', marginBottom: 6, fontWeight: 500 }}>
                {card.label}
              </p>
              <h3 style={{ fontSize: 26, fontWeight: 700, color: '#F5F5F7', margin: 0 }}>
                {card.value}
              </h3>
            </div>
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: 12,
                background: card.bg,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: card.color,
              }}
            >
              <Icon size={24} />
            </div>
          </button>
        );
      })}
    </div>
  );
}

