import { useState, useEffect } from "react";
import { X, Shield, User, Mail, Lock } from "lucide-react";
import api from "../../../api/axios";
import { clsx } from "clsx";

type Member = {
    id: number;
    name: string;
    email: string;
    role: string;
};

type EditMemberModalProps = {
    member: Member | null;
    onClose: () => void;
    onSuccess: () => void;
};

export function EditMemberModal({ member, onClose, onSuccess }: EditMemberModalProps) {
    const [form, setForm] = useState({
        name: "",
        email: "",
        role: "member",
        password: "", // Optional
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        if (member) {
            setForm({
                name: member.name,
                email: member.email,
                role: member.role,
                password: "",
            });
            setError("");
        }
    }, [member]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!member) return;
        setIsSubmitting(true);
        setError("");

        try {
            await api.put(`/users/${member.id}`, form);
            onSuccess();
            onClose();
        } catch (err: any) {
             if (err.response && err.response.data && err.response.data.message) {
                setError(err.response.data.message);
            } else {
                setError("Failed to update user.");
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!member) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="w-full max-w-md bg-white rounded-xl sm:rounded-2xl lg:rounded-3xl shadow-2xl overflow-hidden scale-100 animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
                <div className="bg-slate-50 px-4 sm:px-6 lg:px-8 py-4 sm:py-5 lg:py-6 border-b border-slate-100 flex items-center justify-between sticky top-0">
                    <div>
                        <h2 className="text-base sm:text-lg font-bold text-slate-800">Edit Member</h2>
                        <p className="text-xs sm:text-sm text-slate-500">Update account details</p>
                    </div>
                    <button onClick={onClose} className="p-1.5 sm:p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-200/50 transition-colors">
                        <X size={18} className="sm:w-5 sm:h-5" />
                    </button>
                </div>
                
                <form onSubmit={handleSubmit} className="p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-5">
                     {error && (
                        <div className="p-3 sm:p-4 text-xs sm:text-sm text-red-600 bg-red-50 rounded-lg sm:rounded-xl border border-red-100">
                            {error}
                        </div>
                    )}
                    
                    <div>
                        <label className="block text-[10px] sm:text-xs font-bold uppercase text-slate-400 mb-1 sm:mb-1.5">Full Name</label>
                        <div className="relative">
                            <User className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                            <input
                                type="text"
                                value={form.name}
                                onChange={(e) => setForm({ ...form, name: e.target.value })}
                                className="w-full pl-9 sm:pl-12 pr-3 sm:pr-4 py-2.5 sm:py-3 bg-slate-50 border border-slate-200 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium text-sm sm:text-base text-slate-700"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-[10px] sm:text-xs font-bold uppercase text-slate-400 mb-1 sm:mb-1.5">Email Address</label>
                        <div className="relative">
                            <Mail className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                            <input
                                type="email"
                                value={form.email}
                                onChange={(e) => setForm({ ...form, email: e.target.value })}
                                className="w-full pl-9 sm:pl-12 pr-3 sm:pr-4 py-2.5 sm:py-3 bg-slate-50 border border-slate-200 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium text-sm sm:text-base text-slate-700"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-[10px] sm:text-xs font-bold uppercase text-slate-400 mb-1 sm:mb-1.5">Role</label>
                         <div className="relative">
                            <Shield className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                            <select
                                value={form.role}
                                onChange={(e) => setForm({ ...form, role: e.target.value })}
                                className="w-full pl-9 sm:pl-12 pr-3 sm:pr-4 py-2.5 sm:py-3 bg-slate-50 border border-slate-200 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium text-sm sm:text-base text-slate-700 appearance-none cursor-pointer"
                            >
                                <option value="member">Member</option>
                                <option value="admin">Admin</option>
                            </select>
                         </div>
                    </div>

                     <div>
                        <label className="block text-[10px] sm:text-xs font-bold uppercase text-slate-400 mb-1 sm:mb-1.5">
                            New Password <span className="text-slate-300 font-normal normal-case">(Optional)</span>
                        </label>
                        <div className="relative">
                            <Lock className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                            <input
                                type="password"
                                value={form.password}
                                onChange={(e) => setForm({ ...form, password: e.target.value })}
                                placeholder="Leave empty to keep current"
                                className="w-full pl-9 sm:pl-12 pr-3 sm:pr-4 py-2.5 sm:py-3 bg-slate-50 border border-slate-200 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium text-sm sm:text-base text-slate-700"
                            />
                        </div>
                    </div>

                    <div className="pt-2 flex gap-2 sm:gap-3">
                         <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-2.5 sm:py-3 text-sm sm:text-base text-slate-600 font-bold bg-slate-100 hover:bg-slate-200 rounded-lg sm:rounded-xl transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className={clsx(
                                "flex-1 py-2.5 sm:py-3 text-sm sm:text-base text-white font-bold rounded-lg sm:rounded-xl transition-all shadow-lg flex items-center justify-center gap-2",
                                isSubmitting 
                                    ? "bg-slate-400 cursor-not-allowed" 
                                    : "bg-indigo-600 hover:bg-indigo-700 hover:shadow-indigo-200"
                            )}
                        >
                            {isSubmitting ? "Saving..." : "Save Changes"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
