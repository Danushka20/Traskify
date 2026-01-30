import { useEffect, useState, useCallback } from "react";
import type { FormEvent } from "react";
import api from "../../api/axios";
import Layout from "../../components/Layout";
import { UserPlus, Mail, Shield, User, Trash2, Edit } from "lucide-react";
import { clsx } from "clsx";
import { useToast } from "../../components/feedback/ToastProvider";
import { useConfirm } from "../../components/feedback/ConfirmDialogProvider";
import getEcho from "../../realtime/echo";
import { EditMemberModal } from "./components/EditMemberModal";

type Member = {
    id: number;
    name: string;
    email: string;
    role: string;
};

export default function AdminMembers() {
    const [members, setMembers] = useState<Member[]>([]);
    const [form, setForm] = useState({
        name: "",
        email: "",
        password: "",
        role: "member",
    });
    const [editingMember, setEditingMember] = useState<Member | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const { addToast } = useToast();
    const confirm = useConfirm();

    const fetchMembers = useCallback(async () => {
        try {
            const response = await api.get<Member[]>("/users?includeAdmins=1");
            setMembers(Array.isArray(response.data) ? response.data : []);
        } catch (err) {
            console.error("Failed to fetch members", err);
            setMembers([]);
            addToast({
                tone: "error",
                title: "Unable to load members",
                description: "Refresh the page or try again shortly.",
            });
        }
    }, [addToast]);

    useEffect(() => {
        fetchMembers();
        
        let userSub: any = null;
        (async () => {
            const echo = await getEcho();
            if (!echo) return;
            userSub = echo.channel('users');
            userSub.listen('UserCreated', () => fetchMembers());
        })();

        return () => {
            if (userSub) {
                try {
                    userSub.stopListening('UserCreated');
                } catch (e) {}
            }
        };
    }, [fetchMembers]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError("");
        setSuccess("");
        setIsSubmitting(true);

        try {
            await api.post("/register", form);
            setSuccess("Member added successfully!");
            setForm({ name: "", email: "", password: "", role: "member" });
            fetchMembers();
            addToast({
                tone: "success",
                title: "Member added",
                description: `${form.name || 'Member'} now has access.`,
            });
        } catch (err: any) {
            if (err.response && err.response.data && err.response.data.message) {
                setError(err.response.data.message);
            } else {
                setError("Failed to add member.");
            }
            addToast({
                tone: "error",
                title: "Member not added",
                description: err?.response?.data?.message ?? "Please review the details and try again.",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id: number) => {
        const confirmed = await confirm({
            title: "Remove member",
            message: "This member will lose access immediately. This action cannot be undone.",
            confirmText: "Remove member",
            cancelText: "Keep member",
            tone: "danger",
        });
        if (!confirmed) {
            return;
        }
        try {
            await api.delete(`/users/${id}`);
            fetchMembers();
            addToast({
                tone: "success",
                title: "Member removed",
                description: "Access revoked successfully.",
            });
        } catch (err) {
            console.error(err);
            addToast({
                tone: "error",
                title: "Failed to remove member",
                description: "Something went wrong. Try again shortly.",
            });
        }
    }

    return (
        <Layout>
             <EditMemberModal 
                member={editingMember} 
                onClose={() => setEditingMember(null)}
                onSuccess={() => {
                    fetchMembers();
                    addToast({ tone: 'success', title: 'Updated', description: 'Member details updated.' });
                }}
             />
             <div className="space-y-6 sm:space-y-8">
                <div>
                    <h1 className="text-xl sm:text-2xl font-bold text-slate-800">Team Members</h1>
                    <p className="mt-1 text-sm sm:text-base text-slate-500">Manage team access and roles.</p>
                </div>

                <div className="grid grid-cols-1 gap-6 sm:gap-8 lg:grid-cols-3">
                    {/* Add Member Form */}
                    <div className="lg:col-span-1">
                        <div className="lg:sticky lg:top-24 overflow-hidden bg-white border border-slate-100 shadow-xl shadow-slate-200/50 rounded-xl sm:rounded-[2rem]">
                            <div className="relative px-4 sm:px-8 py-4 sm:py-6 bg-gradient-to-r from-slate-900 to-indigo-950 text-white overflow-hidden">
                                <div className="absolute top-0 right-0 w-24 sm:w-32 h-24 sm:h-32 bg-white/5 rounded-bl-full -mr-6 sm:-mr-8 -mt-6 sm:-mt-8"/>
                                <h2 className="relative flex items-center gap-2 sm:gap-3 text-base sm:text-lg font-bold">
                                    <div className="p-1.5 sm:p-2 bg-white/10 rounded-lg sm:rounded-xl">
                                        <UserPlus className="text-white w-4 h-4 sm:w-5 sm:h-5" />
                                    </div>
                                    Add New Member
                                </h2>
                            </div>
                            
                            <form onSubmit={handleSubmit} className="p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6">
                                {error && <div className="p-3 sm:p-4 text-xs sm:text-sm font-medium text-red-600 rounded-lg sm:rounded-xl bg-red-50 border border-red-100">{error}</div>}
                                {success && <div className="p-3 sm:p-4 text-xs sm:text-sm font-medium text-green-600 rounded-lg sm:rounded-xl bg-green-50 border border-green-100">{success}</div>}

                                <div>
                                    <label className="block mb-1.5 sm:mb-2 text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-400">Full Name</label>
                                    <div className="relative group">
                                        <User className="absolute -translate-y-1/2 left-3 sm:left-4 top-1/2 text-slate-400 group-hover:text-indigo-500 transition-colors w-4 h-4 sm:w-[18px] sm:h-[18px]" />
                                        <input
                                            type="text"
                                            name="name"
                                            value={form.name}
                                            onChange={handleChange}
                                            className="w-full py-2.5 sm:py-3 pl-10 sm:pl-12 pr-3 sm:pr-4 text-sm font-semibold transition-all bg-white border border-slate-200 rounded-lg sm:rounded-xl hover:border-indigo-200 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500/30 placeholder:text-slate-400"
                                            placeholder="John Doe"
                                            required
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block mb-1.5 sm:mb-2 text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-400">Email Address</label>
                                    <div className="relative group">
                                        <Mail className="absolute -translate-y-1/2 left-3 sm:left-4 top-1/2 text-slate-400 group-hover:text-indigo-500 transition-colors w-4 h-4 sm:w-[18px] sm:h-[18px]" />
                                        <input
                                            type="email"
                                            name="email"
                                            value={form.email}
                                            onChange={handleChange}
                                            className="w-full py-2.5 sm:py-3 pl-10 sm:pl-12 pr-3 sm:pr-4 text-sm font-semibold transition-all bg-white border border-slate-200 rounded-lg sm:rounded-xl hover:border-indigo-200 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500/30 placeholder:text-slate-400"
                                            placeholder="john@example.com"
                                            required
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block mb-1.5 sm:mb-2 text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-400">Password</label>
                                    <input
                                        type="password"
                                        name="password"
                                        value={form.password}
                                        onChange={handleChange}
                                        className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm font-semibold transition-all bg-white border border-slate-200 rounded-lg sm:rounded-xl hover:border-indigo-200 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500/30 placeholder:text-slate-400"
                                        placeholder="••••••••"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block mb-1.5 sm:mb-2 text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-400">Role</label>
                                    <div className="relative group">
                                        <Shield className="absolute -translate-y-1/2 left-3 sm:left-4 top-1/2 text-slate-400 group-hover:text-indigo-500 transition-colors w-4 h-4 sm:w-[18px] sm:h-[18px]" />
                                        <select
                                            name="role"
                                            value={form.role}
                                            onChange={handleChange}
                                            className="w-full py-2.5 sm:py-3 pl-10 sm:pl-12 pr-3 sm:pr-4 text-sm font-semibold transition-all bg-white border border-slate-200 appearance-none rounded-lg sm:rounded-xl hover:border-indigo-200 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500/30 cursor-pointer"
                                        >
                                            <option value="member">Member</option>
                                            <option value="admin">Admin</option>
                                        </select>
                                        <div className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                                            <div className="w-0 h-0 border-l-[4px] sm:border-l-[5px] border-l-transparent border-r-[4px] sm:border-r-[5px] border-r-transparent border-t-[4px] sm:border-t-[5px] border-t-slate-400" />
                                        </div>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className={clsx(
                                        "w-full py-3 sm:py-4 mt-2 sm:mt-4 text-sm sm:text-base font-bold text-white transition-all shadow-lg rounded-lg sm:rounded-xl flex items-center justify-center gap-2",
                                        isSubmitting 
                                            ? "bg-slate-400 shadow-none cursor-not-allowed" 
                                            : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-blue-500/30 hover:shadow-blue-500/40 active:scale-[0.98]"
                                    )}
                                >
                                    {isSubmitting ? "Adding..." : "Add Member"}
                                </button>
                            </form>
                        </div>
                    </div>

                    {/* Members List */}
                    <div className="space-y-4 lg:col-span-2">
                        <div className="overflow-hidden bg-white border border-slate-100 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.05)] rounded-xl sm:rounded-2xl lg:rounded-[2rem]">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse min-w-[480px]">
                                    <thead>
                                        <tr className="text-[10px] sm:text-xs font-extrabold tracking-widest uppercase border-b bg-slate-50/50 border-slate-100 text-slate-400">
                                            <th className="px-4 sm:px-6 lg:px-8 py-3 sm:py-4 lg:py-5">Name</th>
                                            <th className="px-4 sm:px-6 lg:px-8 py-3 sm:py-4 lg:py-5 hidden sm:table-cell">Role</th>
                                            <th className="px-4 sm:px-6 lg:px-8 py-3 sm:py-4 lg:py-5 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50">
                                        {members.length > 0 ? members.map((member) => (
                                            <tr key={member.id} className="transition-all hover:bg-indigo-50/30 group">
                                                <td className="px-4 sm:px-6 lg:px-8 py-3 sm:py-4 lg:py-5">
                                                    <div className="flex items-center gap-3 sm:gap-4">
                                                        <div className="flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 lg:w-12 lg:h-12 text-sm sm:text-base lg:text-lg font-bold transition-transform text-white rounded-xl sm:rounded-2xl bg-gradient-to-br from-slate-400 to-slate-500 shadow-md group-hover:scale-105 group-hover:shadow-lg group-hover:from-indigo-500 group-hover:to-blue-500">
                                                            {member.name.charAt(0).toUpperCase()}
                                                        </div>
                                                        <div>
                                                            <div className="text-sm sm:text-base font-bold text-slate-700 group-hover:text-indigo-900 transition-colors">{member.name}</div>
                                                            <div className="text-xs sm:text-sm font-medium text-slate-400 truncate max-w-[120px] sm:max-w-none">{member.email}</div>
                                                            {/* Show role on mobile */}
                                                            <span className={clsx(
                                                                "sm:hidden inline-block mt-1 px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase border",
                                                                member.role === 'admin' 
                                                                    ? "bg-purple-50 text-purple-700 border-purple-100" 
                                                                    : "bg-blue-50 text-blue-700 border-blue-100"
                                                            )}>
                                                                {member.role}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-4 sm:px-6 lg:px-8 py-3 sm:py-4 lg:py-5 hidden sm:table-cell">
                                                    <span className={clsx(
                                                        "px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg sm:rounded-xl text-[10px] sm:text-xs font-bold uppercase border shadow-sm",
                                                        member.role === 'admin' 
                                                            ? "bg-purple-50 text-purple-700 border-purple-100 shadow-purple-100" 
                                                            : "bg-blue-50 text-blue-700 border-blue-100 shadow-blue-100"
                                                    )}>
                                                        {member.role}
                                                    </span>
                                                </td>
                                                <td className="px-4 sm:px-6 lg:px-8 py-3 sm:py-4 lg:py-5 text-right">
                                                    <button 
                                                        onClick={() => setEditingMember(member)}
                                                        className="p-2 sm:p-3 mr-1 sm:mr-2 transition-all rounded-lg sm:rounded-xl sm:opacity-0 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 hover:scale-110 active:scale-95 sm:group-hover:opacity-100"
                                                        title="Edit Member"
                                                    >
                                                        <Edit size={16} className="sm:w-5 sm:h-5" />
                                                    </button>
                                                    <button 
                                                        onClick={() => handleDelete(member.id)}
                                                        className="p-2 sm:p-3 transition-all rounded-lg sm:rounded-xl sm:opacity-0 text-slate-400 hover:text-red-600 hover:bg-red-50 hover:scale-110 active:scale-95 sm:group-hover:opacity-100"
                                                        title="Remove Member"
                                                    >
                                                        <Trash2 size={16} className="sm:w-5 sm:h-5" />
                                                    </button>
                                                </td>
                                            </tr>
                                        )) : (
                                            <tr>
                                                <td colSpan={3} className="px-4 sm:px-6 py-12 sm:py-24 text-center">
                                                    <div className="flex flex-col items-center justify-center text-slate-400">
                                                        <div className="p-3 sm:p-4 mb-3 sm:mb-4 rounded-full bg-slate-50">
                                                            <User size={24} className="sm:w-8 sm:h-8 opacity-50" />
                                                        </div>
                                                        <p className="text-sm text-slate-500 font-medium">No members found</p>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
             </div>
        </Layout>
    );
}
