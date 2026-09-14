import { Link } from '@inertiajs/react';
import { Activity, LayoutDashboard, Menu, Server, Settings, ShieldCheck, Users, Wifi } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

export default function AppLayout({ children, title = 'Servers', serverId = null }) {
    const [collapsed, setCollapsed] = useState(false);
    const { user } = useAuth();
    const navigation = serverId
        ? [['Overview', `/servers/${serverId}`, LayoutDashboard], ['Console', `/servers/${serverId}/console`, Server], ['Files', `/servers/${serverId}/files`, Server], ['Databases', `/servers/${serverId}/databases`, Server], ['Backups', `/servers/${serverId}/backups`, Server], ['Startup', `/servers/${serverId}/startup`, Server], ['Installer', `/servers/${serverId}/installer`, Server], ['Server settings', `/servers/${serverId}/settings`, Settings]]
        : [['Servers', '/servers', Server], ['Account settings', '/account/settings', Settings]];

    return <div className="flex min-h-screen bg-navy-950 text-white">
        <aside className={`${collapsed ? 'w-20' : 'w-64'} flex shrink-0 flex-col border-r border-slate-800 bg-navy-900 p-4 transition-all`}>
            <div className="mb-10 flex items-center gap-3 px-2"><div className="grid h-9 w-9 place-items-center rounded-lg bg-gradient-to-br from-sapphire-500 to-azure-500 shadow-lg shadow-sapphire-500/20"><Wifi size={20} /></div>{!collapsed && <div><strong className="font-semibold tracking-widest">STRIKE<span className="text-azure-500">PANEL</span></strong><small className="block text-[9px] tracking-widest text-slate-500">LOCAL NODE CONTROL</small></div>}</div>
            <button onClick={() => setCollapsed(!collapsed)} className="mb-5 grid h-9 w-full place-items-center rounded-md text-slate-400 hover:bg-navy-800 hover:text-white" aria-label="Toggle navigation"><Menu size={18} /></button>
            <nav className="space-y-1">{navigation.map(([label, href, Icon]) => <Link key={label} href={href} className={`flex items-center gap-3 rounded-md px-3 py-3 text-sm transition hover:bg-navy-800 ${title === label ? 'border-l-2 border-sapphire-500 bg-navy-800 text-white' : 'text-slate-400'}`}><Icon size={18} />{!collapsed && label}</Link>)}{!serverId && user?.is_admin && <Link href="/admin" className="flex items-center gap-3 rounded-md px-3 py-3 text-sm text-azure-400 transition hover:bg-navy-800 hover:text-white"><ShieldCheck size={18} />{!collapsed && 'Admin Control Panel'}</Link>}{serverId && <Link href="/servers" className="mt-3 flex items-center gap-3 border-t border-slate-800 px-3 py-4 text-sm text-slate-400 hover:text-white"><Server size={18} />{!collapsed && 'All servers'}</Link>}</nav>
            <div className="mt-auto space-y-1"><div className="mb-3 flex items-center gap-2 border-t border-slate-800 px-2 pt-4 text-[11px] text-slate-400"><span className="h-2 w-2 rounded-full bg-azure-500" />{!collapsed && 'Local node online'}</div><Link href="/account/settings" className="flex items-center gap-3 rounded-md px-3 py-3 text-sm text-slate-400 hover:bg-navy-800 hover:text-white"><Users size={18} />{!collapsed && 'Account settings'}</Link></div>
        </aside>
        <main className="min-w-0 flex-1"><header className="flex h-20 items-center justify-between border-b border-slate-800 px-6 lg:px-12"><div><span className="text-[10px] font-bold tracking-[.2em] text-slate-500">STRIKE PANEL / {serverId ? 'SERVER' : 'CLIENT'}</span><h1 className="font-semibold">{title}</h1></div><div className="flex items-center gap-3"><button className="rounded-md p-2 text-slate-400 hover:bg-navy-800 hover:text-white"><Activity size={18} /></button><div className="grid h-8 w-8 place-items-center rounded-full bg-sapphire-600 text-xs font-bold">{user?.name?.slice(0, 2).toUpperCase() || 'SP'}</div><div className="hidden text-xs sm:block"><b>{user?.name || 'Client'}</b><span className="block text-slate-500">{user?.is_admin ? 'Administrator' : 'Client'}</span></div></div></header><div className="mx-auto max-w-7xl p-6 lg:p-12">{children}</div></main>
    </div>;
}
