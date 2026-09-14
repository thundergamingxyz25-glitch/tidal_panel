import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { Head } from '@inertiajs/react';
import { UserPlus, Wifi } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

const schema = z.object({
    name: z.string().min(2, 'Enter your full name.'),
    email: z.string().email('Enter a valid email address.'),
    password: z.string().min(12, 'Use at least 12 characters.'),
    password_confirmation: z.string(),
}).refine((values) => values.password === values.password_confirmation, { path: ['password_confirmation'], message: 'Passwords must match.' });

export default function Register() {
    const auth = useAuth();
    const [error, setError] = useState('');
    const form = useForm({ resolver: zodResolver(schema) });

    async function submit(values) {
        setError('');
        try {
            await auth.register(values);
            window.location.href = '/';
        } catch (requestError) {
            setError(requestError.message);
        }
    }

    return <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-navy-950 px-5 py-10 text-white"><Head title="Create account" /><div className="pointer-events-none absolute -left-24 top-0 h-80 w-80 rounded-full bg-sapphire-600/20 blur-3xl" /><motion.main initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative w-full max-w-md"><div className="mb-8 flex items-center justify-center gap-3"><div className="grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br from-sapphire-500 to-azure-500"><Wifi size={23} /></div><strong className="font-semibold tracking-[.25em]">TIDE<span className="text-azure-500">PANEL</span></strong></div><div className="rounded-2xl border border-white/10 bg-navy-900/80 p-7 shadow-2xl backdrop-blur-xl"><div className="mb-7"><p className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[.18em] text-sapphire-500"><UserPlus size={13} /> New client</p><h1 className="text-2xl font-semibold">Create your account</h1><p className="mt-2 text-sm text-slate-400">Provision and operate your game servers from one secure panel.</p></div><form onSubmit={form.handleSubmit(submit)} className="space-y-4"><Field label="Full name" error={form.formState.errors.name?.message} {...form.register('name')} /><Field label="Email" type="email" error={form.formState.errors.email?.message} {...form.register('email')} /><Field label="Password" type="password" error={form.formState.errors.password?.message} {...form.register('password')} /><Field label="Confirm password" type="password" error={form.formState.errors.password_confirmation?.message} {...form.register('password_confirmation')} /><button className="w-full rounded-lg bg-sapphire-600 px-4 py-3 text-sm font-semibold shadow-lg shadow-sapphire-600/20 hover:bg-sapphire-500" type="submit">Create client account</button></form>{error && <p className="mt-4 rounded-lg border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-200">{error}</p>}<p className="mt-5 text-center text-xs text-slate-500">Already have access? <a className="text-azure-400 hover:text-white" href="/login">Sign in</a></p></div></motion.main></div>;
}

function Field({ label, error, ...props }) { return <label className="block text-sm"><span className="mb-2 block text-slate-300">{label}</span><input {...props} className={`w-full rounded-lg border bg-navy-950/80 px-3 py-3 text-white outline-none transition ${error ? 'border-rose-500' : 'border-slate-700 focus:border-sapphire-500 focus:ring-2 focus:ring-sapphire-500/20'}`} />{error && <span className="mt-1 block text-xs text-rose-300">{error}</span>}</label>; }
