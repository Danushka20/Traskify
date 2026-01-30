import type { ReactElement } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import MemberTasks from './pages/member/MemberTasks';
import MemberLateJobs from './pages/member/MemberLateJobs';
import MemberProgress from './pages/member/MemberProgress';
import Reassign from './pages/member/Reassign';
import MemberReassignments from './pages/member/MemberReassignments';
import AdminDailyNotes from './pages/admin/AdminDailyNotes';
import AdminRecords from './pages/admin/AdminRecords';
import AdminTasks from './pages/admin/AdminTasks';
import TaskSetup from './pages/admin/TaskSetup';
import AdminMembers from './pages/admin/AdminMembers';
import AdminMeeting from './pages/admin/AdminMeeting';
import AdminCustomMail from './pages/admin/AdminCustomMail';
import AdminMemberProgress from './pages/admin/AdminMemberProgress';
import AdminReassignments from './pages/admin/AdminReassignments';
import AdminProfile from './pages/admin/AdminProfile';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './components/feedback/ToastProvider';
import { ConfirmDialogProvider } from './components/feedback/ConfirmDialogProvider';
import { ErrorBoundary } from './components/ErrorBoundary';
import { RealtimeProvider } from './context/RealtimeContext';
import CreateProject from './pages/projects/CreateProject';
import ProjectDashboard from './pages/projects/ProjectDashboard';
import ProjectsList from './pages/projects/ProjectsList';

const PrivateRoute = ({ children }: { children: ReactElement }) => {
    const { token, isLoading } = useAuth();
    if (isLoading) return <div className="p-8 text-center">Loading authentication...</div>;
    return token ? children : <Navigate to="/login" />;
};

function AppRoutes() {
    return (
        <Routes>
             <Route path="/login" element={<Login />} />
             <Route path="/dashboard" element={
                 <PrivateRoute>
                     <Dashboard />
                 </PrivateRoute>
             } />
             <Route path="/projects" element={
                 <PrivateRoute>
                     <ProjectsList />
                 </PrivateRoute>
             } />
             <Route path="/projects/create" element={
                 <PrivateRoute>
                     <CreateProject />
                 </PrivateRoute>
             } />
             <Route path="/projects/:id" element={
                 <PrivateRoute>
                     <ProjectDashboard />
                 </PrivateRoute>
             } />
             <Route path="/tasks" element={
                 <PrivateRoute>
                     <MemberTasks />
                 </PrivateRoute>
             } />
             <Route path="/tasks/:id/reassign" element={
                 <PrivateRoute>
                     <Reassign />
                 </PrivateRoute>
             } />
             <Route path="/progress" element={
                 <PrivateRoute>
                     <MemberProgress />
                 </PrivateRoute>
             } />
             <Route path="/profile" element={
                 <PrivateRoute>
                     <Profile />
                 </PrivateRoute>
             } />
             <Route path="/reassignments" element={
                 <PrivateRoute>
                     <MemberReassignments />
                 </PrivateRoute>
             } />
             <Route path="/late-jobs" element={
                 <PrivateRoute>
                     <MemberLateJobs />
                 </PrivateRoute>
             } />
             <Route path="/admin/daily-notes" element={
                 <PrivateRoute>
                     <AdminDailyNotes />
                 </PrivateRoute>
             } />
             <Route path="/admin/records" element={
                 <PrivateRoute>
                     <AdminRecords />
                 </PrivateRoute>
             } />
             <Route path="/admin/tasks" element={
                 <PrivateRoute>
                     <AdminTasks />
                 </PrivateRoute>
             } />
             <Route path="/admin/task-setup" element={
                 <PrivateRoute>
                     <TaskSetup />
                 </PrivateRoute>
             } />
             <Route path="/admin/progress" element={
                 <PrivateRoute>
                     <AdminMemberProgress />
                 </PrivateRoute>
             } />
             <Route path="/admin/reassignments" element={
                 <PrivateRoute>
                     <AdminReassignments />
                 </PrivateRoute>
             } />
             <Route path="/admin/members" element={
                 <PrivateRoute>
                     <AdminMembers />
                 </PrivateRoute>
             } />
             <Route path="/admin/meeting" element={
                 <PrivateRoute>
                     <AdminMeeting />
                 </PrivateRoute>
             } />
             <Route path="/admin/custom-mail" element={
                 <PrivateRoute>
                     <AdminCustomMail />
                 </PrivateRoute>
             } />
             <Route path="/admin/profile" element={
                 <PrivateRoute>
                     <AdminProfile />
                 </PrivateRoute>
             } />
             <Route path="*" element={<Navigate to="/dashboard" />} />
        </Routes>
    );
}

export default function App() {
    return (
        <ErrorBoundary>
            <AuthProvider>
                <RealtimeProvider>
                    <ToastProvider>
                        <ConfirmDialogProvider>
                            <AppRoutes />
                        </ConfirmDialogProvider>
                    </ToastProvider>
                </RealtimeProvider>
            </AuthProvider>
        </ErrorBoundary>
    );
}
