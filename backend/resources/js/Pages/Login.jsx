import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { Head } from '@inertiajs/react';
import { LockKeyhole, Sparkles, TriangleAlert, Wifi } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useAuth } from '../contexts/AuthContext';

const schema = z.object({
    email: z.string().email('Enter a valid email address.'),
    password: z.string().min(8, 'Password must be at least 8 characters.'),
});

export default function Login() {
    const auth = useAuth();
    const [error, setError] = useState('');
    const form = useForm({ resolver: zodResolver(schema), defaultValues: { email: '', password: '' } });

    async function submit(values) {
        setError('');
        try {
            await auth.login(values);
            window.location.href = '/';
        } catch (requestError) {
            setError(requestError.message);
        }
    }

    return <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-navy-950 px-5 py-10 text-white"><Head title="Sign in" /><div className="pointer-events-none absolute -left-24 top-0 h-80 w-80 rounded-full bg-sapphire-600/20 blur-3xl" /><div className="pointer-events-none absolute -right-24 bottom-0 h-96 w-96 rounded-full bg-azure-500/10 blur-3xl" /><motion.main initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative w-full max-w-md"><div className="mb-8 flex items-center justify-center gap-3"><div className="grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br from-sapphire-500 to-azure-500 shadow-xl shadow-sapphire-500/20"><Wifi size={23} /></div><div><strong className="font-semibold tracking-[.25em]">TIDE<span className="text-azure-500">PANEL</span></strong><small className="block text-[9px] tracking-[.25em] text-slate-500">LOCAL NODE CONTROL</small></div></div><div className="rounded-2xl border border-white/10 bg-navy-900/80 p-7 shadow-2xl backdrop-blur-xl"><div className="mb-7"><p className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[.18em] text-sapphire-500"><Sparkles size={13} /> Welcome back</p><h1 className="text-2xl font-semibold">Sign in to TidePanel</h1><p className="mt-2 text-sm text-slate-400">Access your client or admin control panel.</p></div><form onSubmit={form.handleSubmit(submit)} className="space-y-4"><Field label="Email" type="email" autoComplete="email" error={form.formState.errors.email?.message} {...form.register('email')} /><Field label="Password" type="password" autoComplete="current-password" error={form.formState.errors.password?.message} {...form.register('password')} /><button type="submit" className="flex w-full items-center justify-center gap-2 rounded-lg bg-sapphire-600 px-4 py-3 text-sm font-semibold shadow-lg shadow-sapphire-600/20 transition hover:bg-sapphire-500" disabled={form.formState.isSubmitting}>Continue <LockKeyhole size={15} /></button></form>{error && <div className="mt-5 flex items-start gap-2 rounded-lg border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-200"><TriangleAlert size={15} />{error}</div>}<p className="mt-5 text-center text-xs text-slate-500">New client? <a className="text-azure-400 hover:text-white" href="/register">Create an account</a></p></div><p className="mt-5 text-center text-xs text-slate-500">Sanctum protected · rate-limited access</p></motion.main></div>;
}

function Field({ label, error, ...props }) { return <label className="block text-sm"><span className="mb-2 block text-slate-300">{label}</span><input {...props} className={`w-full rounded-lg border bg-navy-950/80 px-3 py-3 text-white outline-none transition ${error ? 'border-rose-500' : 'border-slate-700 focus:border-sapphire-500 focus:ring-2 focus:ring-sapphire-500/20'}`} />{error && <span className="mt-1 block text-xs text-rose-300">{error}</span>}</label>; }
