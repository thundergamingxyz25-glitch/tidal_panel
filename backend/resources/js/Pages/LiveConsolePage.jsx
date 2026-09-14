import { useEffect, useRef, useState } from 'react';
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { CircleStop, Play, RotateCcw, Square, Terminal as TerminalIcon } from 'lucide-react';
import { FitAddon } from '@xterm/addon-fit';
import { WebglAddon } from '@xterm/addon-webgl';
import { Terminal } from '@xterm/xterm';
import '@xterm/xterm/css/xterm.css';

export default function LiveConsolePage({ server, api, notify }) {
    const terminalRef = useRef(null);
    const terminal = useRef(null);
    const lastLog = useRef('');
    const [command, setCommand] = useState('');
    const [history, setHistory] = useState([]);
    const [historyIndex, setHistoryIndex] = useState(-1);
    const [status, setStatus] = useState(server.status || 'offline');
    const [telemetry, setTelemetry] = useState([]);

    useEffect(() => {
        if (!terminalRef.current) return undefined;
        const instance = new Terminal({ scrollback: 5000, convertEol: true, cursorBlink: true, theme: { background: '#061222', foreground: '#c9daf0', cursor: '#25d2c1' } });
        const fit = new FitAddon();
        instance.loadAddon(fit);
        try { instance.loadAddon(new WebglAddon()); } catch (_) { /* Canvas fallback remains active. */ }
        instance.open(terminalRef.current); fit.fit();
        instance.writeln('\x1b[36mStrike Panel live Docker console\x1b[0m');
        instance.writeln(`\x1b[90mContainer: ${server.container_name || server.uuid}\x1b[0m`);
        terminal.current = instance;
        return () => instance.dispose();
    }, [server.container_name, server.uuid]);

    useEffect(() => {
        let cancelled = false;
        async function poll() {
            try {
                const [logs, stats] = await Promise.all([api(`/servers/${server.id}/logs`), api(`/servers/${server.id}/stats`)]);
                if (!cancelled && logs.data && logs.data !== lastLog.current) {
                    const fresh = lastLog.current ? logs.data.slice(logs.data.indexOf(lastLog.current) + lastLog.current.length) : logs.data;
                    if (fresh) terminal.current?.write(fresh.replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g, ''));
                    lastLog.current = logs.data;
                }
                if (!cancelled && stats.data) setTelemetry((items) => [...items.slice(-19), { time: new Date().toLocaleTimeString(), memory: Math.round((stats.data.memory_stats?.usage || 0) / 1048576), cpu: 0 }]);
            } catch (_) { /* The status header remains usable while a container is offline. */ }
        }
        poll(); const timer = setInterval(poll, 2000);
        return () => { cancelled = true; clearInterval(timer); };
    }, [server.id, api]);

    async function power(action) { setStatus(`${action}ing`); try { const body = await api(`/servers/${server.id}/power`, { method: 'POST', body: JSON.stringify({ action }) }); setStatus(body.status); notify(`Server ${action} accepted`); } catch (error) { setStatus(server.status || 'offline'); notify(error.message); } }
    async function send() { if (!command.trim()) return; const value = command.trim(); terminal.current?.writeln(`\x1b[94m> ${value}\x1b[0m`); setHistory((items) => [value, ...items].slice(0, 50)); setCommand(''); setHistoryIndex(-1); try { await api(`/servers/${server.id}/command`, { method: 'POST', body: JSON.stringify({ command: value }) }); } catch (error) { notify(error.message); } }
    function keyDown(event) { if (event.key === 'Enter') { event.preventDefault(); send(); } if (event.key === 'ArrowUp') { event.preventDefault(); const index = Math.min(historyIndex + 1, history.length - 1); setHistoryIndex(index); setCommand(history[index] || ''); } if (event.key === 'ArrowDown') { event.preventDefault(); const index = Math.max(historyIndex - 1, -1); setHistoryIndex(index); setCommand(index < 0 ? '' : history[index]); } }

    return <><div className="mb-6 flex flex-wrap items-end justify-between gap-4"><div><p className="mb-2 text-xs font-semibold uppercase tracking-[.2em] text-sapphire-500">Live server console</p><h2 className="text-3xl font-semibold">{server.name}</h2><p className="mt-2 text-sm text-slate-400">Docker logs and resource stats refresh every two seconds.</p></div><span className="rounded-full border border-azure-500/30 bg-azure-500/10 px-3 py-2 text-xs text-azure-300">{status}</span></div><div className="mb-5 flex flex-wrap gap-2"><PowerButton label="Start" icon={<Play size={15} />} color="emerald" action="start" disabled={status === 'running' || status.endsWith('ing')} onClick={power} /><PowerButton label="Restart" icon={<RotateCcw size={15} />} color="amber" action="restart" disabled={status.endsWith('ing')} onClick={power} /><PowerButton label="Stop" icon={<Square size={15} />} color="rose" action="stop" disabled={status !== 'running' || status.endsWith('ing')} onClick={power} /><PowerButton label="Force kill" icon={<CircleStop size={15} />} color="red" action="kill" disabled={status.endsWith('ing')} onClick={power} /></div><div className="grid gap-6 xl:grid-cols-[1.6fr_1fr]"><section className="panel overflow-hidden p-4"><div className="mb-3 flex items-center justify-between text-xs"><span className="flex items-center gap-2 text-azure-500"><i className="h-2 w-2 animate-pulse rounded-full bg-azure-500" />Live Docker stream</span><span className="text-slate-500">5,000 lines / WebGL</span></div><div className="terminal-frame" ref={terminalRef} /><div className="mt-3 flex gap-2"><TerminalIcon size={18} className="mt-2 text-slate-500" /><input className="field flex-1" value={command} onChange={(event) => setCommand(event.target.value)} onKeyDown={keyDown} placeholder="Send a command... Up/Down for history" /><button className="button-primary" onClick={send}>Send</button></div></section><section className="panel p-5"><h3 className="font-semibold">Live memory telemetry</h3><p className="mt-1 text-xs text-slate-500">Docker stats · 2 second polling</p><div className="mt-5 h-64"><ResponsiveContainer width="100%" height="100%"><AreaChart data={telemetry}><XAxis dataKey="time" hide /><YAxis tick={{ fill: '#7185a6', fontSize: 10 }} axisLine={false} tickLine={false} /><Tooltip contentStyle={{ background: '#102541', border: '1px solid #285177' }} /><Area type="monotone" dataKey="memory" stroke="#25d2c1" fill="#25d2c122" /></AreaChart></ResponsiveContainer></div></section></div></>;
}
function PowerButton({ label, icon, color, action, disabled, onClick }) { const colors = { emerald: 'border-emerald-500/30 text-emerald-300', amber: 'border-amber-500/30 text-amber-300', rose: 'border-rose-400/30 text-rose-300', red: 'border-red-500/30 text-red-300' }; return <button disabled={disabled} onClick={() => onClick(action)} className={`flex items-center gap-2 rounded-lg border bg-navy-900 px-4 py-2 text-xs font-semibold transition hover:bg-navy-800 disabled:cursor-not-allowed disabled:opacity-40 ${colors[color]}`}>{icon}{label}</button>; }
