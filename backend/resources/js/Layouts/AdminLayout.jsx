import { Link } from '@inertiajs/react';
import { Activity, Boxes, FileKey2, Gauge, Menu, Network, Rocket, ScrollText, Settings, ShieldCheck, Users, Wifi } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

const navigation = [
    ['Infrastructure', '/admin', Gauge],
    ['Servers', '/admin/servers', Boxes],
    ['Deploy server', '/admin/deploy', Rocket],
    ['Users', '/admin/users', Users],
    ['Nodes & allocations', '/admin/nodes', Network],
    ['Nests & Eggs', '/admin/eggs', ShieldCheck],
    ['Application API', '/admin/api', FileKey2],
    ['Audit logs', '/admin/audit-logs', ScrollText],
];

export default function AdminLayout({ children, title = 'Infrastructure' }) {
    const [collapsed, setCollapsed] = useState(false);
    const { user } = useAuth();

    return <div className="flex min-h-screen bg-navy-950 text-white"><aside className={`${collapsed ? 'w-20' : 'w-72'} flex shrink-0 flex-col border-r border-teal-500/15 bg-[#081d2a] p-4 transition-all`}><div className="mb-10 flex items-center gap-3 px-2"><div className="grid h-9 w-9 place-items-center rounded-lg bg-gradient-to-br from-azure-500 to-sapphire-500 shadow-lg shadow-azure-500/20"><ShieldCheck size={20} /></div>{!collapsed && <div><strong className="font-semibold tracking-widest">TIDE<span className="text-azure-500">ACP</span></strong><small className="block text-[9px] tracking-widest text-slate-500">ADMIN CONTROL PLANE</small></div>}</div><button onClick={() => setCollapsed(!collapsed)} className="mb-5 grid h-9 w-full place-items-center rounded-md text-slate-400 hover:bg-[#102f3d] hover:text-white" aria-label="Toggle admin navigation"><Menu size={18} /></button><p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[.2em] text-azure-500">Infrastructure</p><nav className="space-y-1">{navigation.map(([label, href, Icon]) => <Link key={label} href={href} className={`flex items-center gap-3 rounded-md px-3 py-3 text-sm transition hover:bg-[#102f3d] ${title === label ? 'border-l-2 border-azure-500 bg-[#102f3d] text-white' : 'text-slate-400'}`}><Icon size={18} />{!collapsed && label}</Link>)}</nav><div className="mt-auto border-t border-teal-500/15 pt-4"><div className="mb-4 flex items-center gap-2 px-2 text-[11px] text-slate-400"><span className="h-2 w-2 rounded-full bg-azure-500 shadow-[0_0_0_4px_rgba(37,210,193,.12)]" />{!collapsed && 'Local node online'}</div><Link href="/" className="flex items-center gap-3 rounded-md px-3 py-3 text-sm text-slate-400 hover:bg-[#102f3d] hover:text-white"><Activity size={18} />{!collapsed && 'Return to client panel'}</Link><div className="mt-2 flex items-center gap-3 px-3 py-3 text-xs text-slate-500"><Users size={15} />{!collapsed && user?.email}</div></div></aside><main className="min-w-0 flex-1"><header className="flex h-20 items-center justify-between border-b border-teal-500/15 px-6 lg:px-12"><div><span className="text-[10px] font-bold tracking-[.2em] text-azure-500">ADMIN CONTROL PLANE / GLOBAL</span><h1 className="font-semibold">{title}</h1></div><div className="flex items-center gap-3"><div className="rounded-md border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-300">Privileged session</div><div className="grid h-8 w-8 place-items-center rounded-full bg-azure-600 text-xs font-bold">AD</div></div></header><div className="mx-auto max-w-[1600px] p-6 lg:p-12">{children}</div></main></div>;
}
