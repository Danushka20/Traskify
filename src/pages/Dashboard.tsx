import { useAuth } from '../context/AuthContext';
import AdminDashboard from './admin/AdminDashboard';
import MemberDashboard from './member/MemberDashboard';

export default function Dashboard() {
    const { user } = useAuth();

    if (!user) return <div>Loading...</div>;

    return user.role === 'admin' ? <AdminDashboard /> : <MemberDashboard />;
}