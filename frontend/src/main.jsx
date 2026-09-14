import React from 'react'
import { createRoot } from 'react-dom/client'
import { Activity, Box, ChevronDown, CircleHelp, Command, Cpu, Database, FileText, FolderKanban, Gauge, HardDrive, LayoutDashboard, Menu, Network, Play, RotateCcw, Search, Settings, Terminal, Users, Wifi, Send, Power, Server, ShieldCheck } from 'lucide-react'
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { motion } from 'framer-motion'
import './styles.css'

const API = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'
const telemetry = [{ time: '12:10', cpu: 26, memory: 41 }, { time: '12:12', cpu: 34, memory: 46 }, { time: '12:14', cpu: 29, memory: 44 }, { time: '12:16', cpu: 48, memory: 52 }, { time: '12:18', cpu: 38, memory: 49 }, { time: '12:20', cpu: 31, memory: 47 }]
const nav = [{ label: 'Overview', icon: LayoutDashboard }, { label: 'Console', icon: Terminal }, { label: 'Files', icon: FolderKanban }, { label: 'Databases', icon: Database }, { label: 'Schedules', icon: RotateCcw }, { label: 'Users', icon: Users }, { label: 'Backups', icon: HardDrive }, { label: 'Network', icon: Network }]

async function request(path, options = {}, token = '') {
  const response = await fetch(`${API}${path}`, { ...options, headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}), ...options.headers } })
  const body = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(body.message || 'Request failed')
  return body
}

function App() {
  const [collapsed, setCollapsed] = React.useState(false)
  const [active, setActive] = React.useState('Overview')
  const [query, setQuery] = React.useState('')
  const [token, setToken] = React.useState(localStorage.getItem('tidepanel_token') || '')
  const [user, setUser] = React.useState(null)
  const [servers, setServers] = React.useState([])
  const [node, setNode] = React.useState({ status: 'checking' })
  const [command, setCommand] = React.useState('')
  const [consoleLines, setConsoleLines] = React.useState(['[local] TidePanel console ready', '[local] Authenticate to send commands to a Docker container'])
  const [login, setLogin] = React.useState({ email: 'test@example.com', password: 'password' })
  const [error, setError] = React.useState('')

  React.useEffect(() => { request('/health').then(data => setNode(data.node)).catch(() => setNode({ status: 'offline' })) }, [])
  React.useEffect(() => { if (!token) return; request('/auth/me', {}, token).then(data => setUser(data.user)).catch(() => { localStorage.removeItem('tidepanel_token'); setToken('') }); request('/servers', {}, token).then(data => setServers(data.data)).catch(err => setError(err.message)) }, [token])

  async function signIn(event) {
    event.preventDefault(); setError('')
    try { const data = await request('/auth/login', { method: 'POST', body: JSON.stringify(login) }); localStorage.setItem('tidepanel_token', data.token); setToken(data.token); setUser(data.user) } catch (err) { setError(err.message) }
  }
  async function sendCommand(event) {
    event.preventDefault(); if (!command.trim()) return
    const server = servers[0]
    setConsoleLines(lines => [...lines, `> ${command}`]); setCommand('')
    if (!server || !token) { setConsoleLines(lines => [...lines, '[local] No authenticated server is available']); return }
    try { await request(`/servers/${server.id}/command`, { method: 'POST', body: JSON.stringify({ command }) }, token); setConsoleLines(lines => [...lines, '[local] Command accepted by local node']) } catch (err) { setConsoleLines(lines => [...lines, `[error] ${err.message}`]) }
  }

  return <div className="app-shell">
    <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`}><div className="brand"><div className="brand-mark"><Wifi size={22} /></div>{!collapsed && <div><strong>TIDE<span>PANEL</span></strong><small>LOCAL NODE CONTROL</small></div>}</div><button className="collapse-button" onClick={() => setCollapsed(!collapsed)} aria-label="Toggle navigation"><Menu size={18} /></button><div className="nav-label">{!collapsed && 'SERVER CONTROL'}</div><nav>{nav.map(({ label, icon: Icon }) => <button key={label} className={active === label ? 'nav-item active' : 'nav-item'} onClick={() => setActive(label)} title={label}><Icon size={18} />{!collapsed && <span>{label}</span>}{label === 'Console' && !collapsed && <i>LIVE</i>}</button>)}</nav><div className="sidebar-bottom">{!collapsed && <div className="node-status"><span className="pulse"></span><div><b>Local node {node.status}</b><small>Docker socket {node.reachable ? 'connected' : 'unavailable'}</small></div></div>}<button className="nav-item"><Settings size={18} />{!collapsed && <span>Settings</span>}</button></div></aside>
    <main className="main-content"><header className="topbar"><div className="mobile-title"><span className="eyebrow">SERVER /</span> Aurora Survival</div><div className="search"><Search size={17} /><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search servers, files, activity..." /><kbd>⌘ K</kbd></div><div className="top-actions"><button className="icon-button"><CircleHelp size={19} /></button><div className="avatar">{user ? user.name.slice(0, 2).toUpperCase() : 'GU'}</div><div className="account"><b>{user?.name || 'Guest operator'}</b><small>{user ? 'Administrator' : 'Not signed in'} <ChevronDown size={13} /></small></div></div></header>
      <div className="page"><motion.div className="page-heading" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}><div><div className="eyebrow">SERVER / AURORA SURVIVAL</div><h1>{active}</h1><p>Live operations and resource telemetry for your local game instance.</p></div><div className="heading-actions"><button className="secondary"><Activity size={16} /> Activity log</button><button className="primary"><Play size={16} fill="currentColor" /> Start server</button></div></motion.div>
        {!user && <form className="auth-strip" onSubmit={signIn}><ShieldCheck size={18} /><div><b>Sign in to control servers</b><span>Use the seeded development account or your Sanctum credentials.</span></div><input aria-label="Email" value={login.email} onChange={e => setLogin({ ...login, email: e.target.value })} /><input aria-label="Password" type="password" value={login.password} onChange={e => setLogin({ ...login, password: e.target.value })} /><button className="primary">Sign in</button></form>}
        {error && <div className="error-banner">{error}</div>}
        <div className="server-strip"><div className="server-identity"><div className="server-icon"><Box size={22} /></div><div><b>{servers[0]?.name || 'Aurora Survival'}</b><span>{servers[0]?.image || 'minecraft / paper 1.21.1'}</span></div></div><div className="server-meta"><div><span>Status</span><strong className="status"><i></i> {servers[0]?.status || 'Ready'}</strong></div><div><span>Node</span><strong>{node.status}</strong></div><div><span>Servers</span><strong>{servers.length || '0'} provisioned</strong></div></div><button className="more-button">•••</button></div>
        {active === 'Overview' || active === 'Console' ? <><div className="stats-grid">{[['CPU load', '31.4', '%', 'of 400% allocated', Cpu, 'blue'], ['Memory', '3.8', 'GB', 'of 8 GB allocated', Gauge, 'cyan'], ['Disk usage', '42.7', 'GB', 'of 100 GB allocated', HardDrive, 'amber'], ['Players', '12', 'online', 'peak today 24', Users, 'green']].map(([label, value, unit, detail, Icon, tone], i) => <motion.div className="stat-card" key={label} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * .07 }}><div className="stat-top"><span>{label}</span><Icon size={17} className={`tone-${tone}`} /></div><div className="stat-value">{value}<small>{unit}</small></div><div className="stat-detail">{detail}</div><div className="meter"><i className={`meter-${tone}`} style={{ width: `${31 + i * 7}%` }} /></div></motion.div>)}</div><div className="content-grid"><section className="panel telemetry"><div className="panel-header"><div><h2>Resource activity</h2><p>Local node telemetry · two second target interval</p></div><div className="legend"><span><i className="dot blue-dot" /> CPU</span><span><i className="dot cyan-dot" /> Memory</span></div></div><div className="chart"><ResponsiveContainer width="100%" height="100%"><AreaChart data={telemetry}><XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fill: '#7185a6', fontSize: 11 }} /><YAxis axisLine={false} tickLine={false} tick={{ fill: '#7185a6', fontSize: 11 }} /><Tooltip contentStyle={{ background: '#10213e', border: '1px solid #22456f', borderRadius: 8, color: '#fff' }} /><Area type="monotone" dataKey="cpu" stroke="#258eff" strokeWidth={2} fill="#258eff33" /><Area type="monotone" dataKey="memory" stroke="#25d2c1" strokeWidth={2} fill="#25d2c122" /></AreaChart></ResponsiveContainer></div></section><section className="panel activity"><div className="panel-header"><div><h2>Management modules</h2><p>Provisioned control surfaces</p></div></div><div className="activity-list">{nav.slice(2).map(({ label, icon: Icon }) => <button className="activity-item module-button" key={label} onClick={() => setActive(label)}><div className="activity-icon blue"><Icon size={15} /></div><div><b>{label}</b><span>Open management view</span></div></button>)}</div></section></div></> : <section className="panel feature-panel"><div className="feature-icon"><Server size={22} /></div><h2>{active} workspace</h2><p>This workspace is connected to the authenticated server API. Its resource-specific operations are ready for the next module implementation and will use the same owner-scoped Laravel contract.</p><button className="secondary" onClick={() => setActive('Console')}><Terminal size={15} /> Open console</button></section>}
        <section className="console-preview panel"><div className="panel-header"><div className="console-title"><span className="live-dot"></span><div><h2>Console output</h2><p>Local node command channel</p></div></div><span className="text-button">{token ? 'Authenticated' : 'Read-only preview'}</span></div><div className="terminal">{consoleLines.map((line, index) => <div key={`${line}-${index}`}><span className="terminal-time">[{new Date().toLocaleTimeString()}]</span> <strong>{line}</strong></div>)}<span className="cursor">_</span></div><form className="console-input" onSubmit={sendCommand}><Command size={17} /><input value={command} onChange={e => setCommand(e.target.value)} placeholder="Send a command to the server..." /><button className="send" type="submit"><Send size={13} /> Send</button></form></section>
      </div></main></div>
}
createRoot(document.getElementById('root')).render(<App />)
