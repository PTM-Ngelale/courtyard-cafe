import type { Metadata } from 'next';
import ManageStaff from '@/components/staff/ManageStaff';
import '../orders/dashboard.css';

export const metadata: Metadata = {
  title: 'Manage Staff',
  robots: { index: false, follow: false },
};

export default function ManageStaffPage() {
  return <ManageStaff />;
}
