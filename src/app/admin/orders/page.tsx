import type { Metadata } from 'next';
import StaffDashboard from '@/components/StaffDashboard';
import './dashboard.css';

export const metadata: Metadata = {
  title: 'Staff Orders',
  robots: { index: false, follow: false },
};

export default function AdminOrdersPage() {
  return <StaffDashboard />;
}
