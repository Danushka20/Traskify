import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, Loader2, Eye, EyeOff, ArrowRight } from 'lucide-react';
import fulllogo from '../assets/fulllogo_transparent.png';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        try {
            const res = await api.post('/login', { email, password });
            login(res.data.access_token, res.data.user);
            navigate('/dashboard');
        } catch (err: any) {
            if (err?.response?.status === 401) {
                setError('Invalid credentials.');
            } else {
                setError('Unable to sign in. Please try again.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-slate-950 px-4 py-8 sm:py-12">
            {/* Background Decorative Elements */}
            <div className="absolute -left-20 top-20 h-64 sm:h-96 w-64 sm:w-96 rounded-full bg-indigo-500/20 blur-[128px]" />
            <div className="absolute right-0 bottom-0 h-64 sm:h-96 w-64 sm:w-96 rounded-full bg-blue-500/10 blur-[128px]" />
            
            <div className="relative w-full max-w-md">
                <div className="overflow-hidden rounded-2xl sm:rounded-[2.5rem] bg-white shadow-[0_0_50px_-12px_rgba(0,0,0,0.25)]">
                    <div className="relative px-6 py-8 sm:px-8 sm:py-12 lg:px-12">
                         {/* Logo Section */}
                        <div className="mb-8 sm:mb-10 text-center">
                            <div className="mx-auto mb-4 sm:mb-6 flex items-center justify-center">
                                <img src={fulllogo} alt="Logo" className="h-14 sm:h-20 w-auto" />
                            </div>
                            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 mb-1 sm:mb-2">Welcome Back</h1>
                            <p className="text-sm sm:text-base text-slate-500">Sign in to manage your team</p>
                        </div>

                        <form className="space-y-4 sm:space-y-6" onSubmit={handleSubmit}>
                            {error && (
                                <div className="rounded-xl sm:rounded-2xl border border-rose-500/20 bg-rose-50 p-3 sm:p-4 text-center">
                                    <p className="text-xs sm:text-sm font-medium text-rose-600">{error}</p>
                                </div>
                            )}

                            <div className="space-y-1.5 sm:space-y-2">
                                <label className="ml-1 text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-slate-500">
                                    Email
                                </label>
                                <div className="group relative flex items-center rounded-xl sm:rounded-2xl border border-slate-200 bg-slate-50 transition-all focus-within:border-indigo-500 focus-within:bg-white focus-within:ring-4 focus-within:ring-indigo-500/10 hover:border-slate-300">
                                    <Mail className="ml-3 sm:ml-4 h-4 w-4 sm:h-5 sm:w-5 text-slate-400 transition-colors group-focus-within:text-indigo-500" />
                                    <input
                                        type="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full bg-transparent py-3 sm:py-4 pl-2 sm:pl-3 pr-3 sm:pr-4 text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none"
                                        placeholder="name@company.com"
                                        autoComplete="email"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5 sm:space-y-2">
                                <label className="ml-1 text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-slate-500">
                                    Password
                                </label>
                                <div className="group relative flex items-center rounded-xl sm:rounded-2xl border border-slate-200 bg-slate-50 transition-all focus-within:border-indigo-500 focus-within:bg-white focus-within:ring-4 focus-within:ring-indigo-500/10 hover:border-slate-300">
                                    <Lock className="ml-3 sm:ml-4 h-4 w-4 sm:h-5 sm:w-5 text-slate-400 transition-colors group-focus-within:text-indigo-500" />
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        required
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full bg-transparent py-3 sm:py-4 pl-2 sm:pl-3 pr-10 sm:pr-12 text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none"
                                        placeholder="••••••••"
                                        autoComplete="current-password"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 sm:right-4 text-slate-400 transition-colors hover:text-indigo-500"
                                    >
                                        {showPassword ? <EyeOff size={16} className="sm:w-[18px] sm:h-[18px]" /> : <Eye size={16} className="sm:w-[18px] sm:h-[18px]" />}
                                    </button>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="group relative flex w-full items-center justify-center gap-2 rounded-xl sm:rounded-2xl bg-gradient-to-r from-indigo-500 to-blue-600 py-3 sm:py-4 font-semibold text-white shadow-xl shadow-indigo-500/20 transition-all hover:scale-[1.02] hover:shadow-indigo-500/30 active:scale-[0.98] disabled:opacity-70 text-sm sm:text-base"
                            >
                                {isLoading ? (
                                    <Loader2 className="h-4 w-4 sm:h-5 sm:w-5 animate-spin" />
                                ) : (
                                    <>
                                        <span>Sign in</span>
                                        <ArrowRight size={16} className="sm:w-[18px] sm:h-[18px] transition-transform group-hover:translate-x-1" />
                                    </>
                                )}
                            </button>
                        </form>
                    </div>
                    
                    {/* Footer decoration */}
                    <div className="border-t border-slate-100 bg-slate-50 p-4 sm:p-6 text-center">
                        <p className="text-[10px] sm:text-xs font-medium text-slate-500">
                            Protected by industry standard encryption
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
