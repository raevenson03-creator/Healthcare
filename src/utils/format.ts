import { BadgeTone } from '@/components/ui';
import { AppointmentStatus, AppointmentType } from '@/types/models';

export function formatDateTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/** Human-friendly relative time, e.g. "in 2 days", "3 hours ago". */
export function relativeTime(iso: string): string {
  const diffMs = new Date(iso).getTime() - Date.now();
  const abs = Math.abs(diffMs);
  const mins = Math.round(abs / 60000);
  const hours = Math.round(abs / 3600000);
  const days = Math.round(abs / 86400000);
  const future = diffMs >= 0;
  let phrase: string;
  if (mins < 60) phrase = `${mins} min`;
  else if (hours < 24) phrase = `${hours} hr`;
  else phrase = `${days} day${days === 1 ? '' : 's'}`;
  return future ? `in ${phrase}` : `${phrase} ago`;
}

export function appointmentStatusTone(status: AppointmentStatus): BadgeTone {
  switch (status) {
    case 'confirmed':
    case 'checked-in':
      return 'success';
    case 'booked':
    case 'proposed':
      return 'warning';
    case 'completed':
      return 'info';
    case 'cancelled':
    case 'no-show':
      return 'danger';
    default:
      return 'neutral';
  }
}

export function appointmentTypeLabel(type: AppointmentType): string {
  return { 'in-person': 'In-person', video: 'Video visit', phone: 'Phone' }[type];
}

export function calculateAge(birthDate: string): number {
  const b = new Date(birthDate);
  const now = new Date();
  let age = now.getFullYear() - b.getFullYear();
  const m = now.getMonth() - b.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < b.getDate())) age--;
  return age;
}
