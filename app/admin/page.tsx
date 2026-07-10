"use client";

import { useState, useEffect } from "react";
import { API_BASE_URL } from '../lib/config';
import { Key, Plus, Trash2, Power, Loader2, Copy, CheckCheck, BarChart3, ArrowLeft, RefreshCw, Compass } from "lucide-react";

interface KeyInfo {
  key: string;
  created_at: string;
  expires_at: string;
  used_count: number;
  note: string;
  active: boolean;
}

const ADMIN_TOKEN = "admin-secret-token-2024";

export default function AdminPage() {
  const [logged, setLogged] = useState(false);
  const [token, setToken] = useState("");
  const [keys, setKeys] = useState<KeyInfo[]>([]);
  const [stats, setStats] = useState({ total: 0, active: 0, expired: 0, total_usage: 0 });
  const [days, setDays] = useState(30);
  const [count, setCount] = useState(1);
  const [note, setNote] = useState("");
  const [generating, setGenerating] = useState(false);
  const [newKeys, setNewKeys] = useState<KeyInfo[]>([]);
  const [copied, setCopied] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const headers = { "Authorization": `Bearer ${token}` };

  const loadData = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const [keysRes, statsRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/admin/keys/list`, { headers }),
        fetch(`${API_BASE_URL}/api/admin/stats`, { headers })
      ]);
      if (keysRes.ok) {
        const data = await keysRes.json();
        setKeys(data.keys);
      } else {
        setLogged(false);
      }
      if (statsRes.ok) setStats(await statsRes.json());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (logged) loadData(); }, [logged]);

  const handleLogin = (e: React.FormEvent) => { e.preventDefault(); if (token) setLogged(true); };

  const generateKeys = async () => {
    setGenerating(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/keys/create`, {
        method: "POST",
        headers: { ...headers, "Content-Type": "application/json" },
        body: JSON.stringify({ days, count, note })
      });
      if (res.ok) {
        const data = await res.json();
        setNewKeys(data.keys);
        loadData();
      }
    } finally { setGenerating(false); }
  };

  const toggleKey = async (key: string) => {
    await fetch(`${API_BASE_URL}/api/admin/keys/toggle/${key}`, { method: "POST", headers });
    loadData();
  };

  const deleteKey = async (key: string) => {
    if (!confirm(`确定删除密钥 ${key}？`)) return;
    await fetch(`${API_BASE_URL}/api/admin/keys/${key}`, { method: "DELETE", headers });
    loadData();
  };

  const copy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(text);
    setTimeout(() => setCopied(null), 1500);
  };

  if (!logged) {
    return (
      <main className="min-h-screen paper-bg flex items-center justify-center px-6">
        <div className="max-w-sm w-full card-paper p-8 shadow-sm">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-[#4a5339] rounded mb-3">
              <Key className="w-6 h-6 text-[#f5f1e8]" />
            </div>
            <div className="seal mb-3">执钥者入</div>
            <h1 className="font-serif text-xl font-bold text-[#2c2c2c] tracking-wider">商家后台</h1>
            <p className="font-serif text-xs text-[#5a5a5a] mt-1 tracking-wider">密钥管理 · 数据概览</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="password"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="执钥令牌"
              className="input-paper w-full px-4 py-3 rounded text-center"
            />
            <button type="submit" className="btn-ink w-full py-3 rounded">入 局</button>
          </form>
          <a href="/" className="flex items-center gap-1 font-serif text-xs text-[#8b8b8b] mt-4 justify-center hover:text-[#4a5339] tracking-wider">
            <ArrowLeft className="w-3 h-3" /> 返客户端
          </a>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen paper-bg pb-12">
      <header className="bg-[#faf7ef] border-b border-[#d4cdb8] sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#4a5339] rounded flex items-center justify-center">
              <Compass className="w-4 h-4 text-[#f5f1e8]" />
            </div>
            <span className="font-serif font-bold text-[#2c2c2c] tracking-wider">商家后台</span>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={loadData} className="p-2 hover:bg-[#d4cdb8]/30 rounded" title="刷新">
              <RefreshCw className={`w-4 h-4 text-[#5a5a5a] ${loading ? "animate-spin" : ""}`} />
            </button>
            <a href="/" className="font-serif text-sm text-[#5a5a5a] hover:text-[#4a5339] tracking-wider">客户端</a>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-5 py-6 space-y-5">
        {/* 统计 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: "总密钥", value: stats.total, color: "text-[#2c2c2c]" },
            { label: "有效密钥", value: stats.active, color: "text-[#6b7553]" },
            { label: "已过期", value: stats.expired, color: "text-[#b85c3a]" },
            { label: "使用次数", value: stats.total_usage, color: "text-[#8b6f47]" },
          ].map((s) => (
            <div key={s.label} className="card-paper p-4 shadow-sm">
              <div className="font-serif text-xs text-[#8b8b8b] tracking-wider">{s.label}</div>
              <div className={`font-serif text-3xl font-bold mt-1 ${s.color}`}>{s.value}</div>
            </div>
          ))}
        </div>

        {/* 生成密钥 */}
        <section className="card-paper p-6 shadow-sm">
          <h2 className="font-serif text-base font-bold text-[#2c2c2c] mb-4 flex items-center gap-2 tracking-wider">
            <Plus className="w-5 h-5" />
            铸 新 钥
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div>
              <label className="font-serif text-xs text-[#8b8b8b]">有效天数</label>
              <input type="number" value={days} onChange={(e) => setDays(Number(e.target.value))} className="input-paper w-full mt-1 px-3 py-2 rounded" />
            </div>
            <div>
              <label className="font-serif text-xs text-[#8b8b8b]">生成数量</label>
              <input type="number" value={count} onChange={(e) => setCount(Number(e.target.value))} className="input-paper w-full mt-1 px-3 py-2 rounded" />
            </div>
            <div>
              <label className="font-serif text-xs text-[#8b8b8b]">备注</label>
              <input type="text" value={note} onChange={(e) => setNote(e.target.value)} placeholder="如：客户甲" className="input-paper w-full mt-1 px-3 py-2 rounded" />
            </div>
            <div className="flex items-end">
              <button onClick={generateKeys} disabled={generating} className="btn-ink w-full py-2 rounded disabled:opacity-50 flex items-center justify-center gap-2">
                {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                <span>铸钥</span>
              </button>
            </div>
          </div>

          {newKeys.length > 0 && (
            <div className="mt-4 p-4 bg-[#6b7553]/8 border border-[#6b7553]/30 rounded">
              <div className="font-serif text-sm font-semibold text-[#4a5339] mb-2 tracking-wider">✓ 已铸 {newKeys.length} 钥</div>
              <div className="space-y-1.5">
                {newKeys.map((k) => (
                  <div key={k.key} className="flex items-center gap-2 bg-[#faf7ef] px-3 py-2 rounded border border-[#d4cdb8]">
                    <code className="flex-1 font-mono text-sm text-[#4a5339]">{k.key}</code>
                    <button onClick={() => copy(k.key)} className="text-[#8b8b8b] hover:text-[#4a5339]">
                      {copied === k.key ? <CheckCheck className="w-4 h-4 text-[#6b7553]" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>

        {/* 密钥列表 */}
        <section className="card-paper shadow-sm overflow-hidden">
          <div className="p-6 border-b border-[#d4cdb8]">
            <h2 className="font-serif text-base font-bold text-[#2c2c2c] flex items-center gap-2 tracking-wider">
              <BarChart3 className="w-5 h-5" />
              钥 匙 簿（{keys.length}）
            </h2>
          </div>

          {keys.length === 0 ? (
            <div className="p-12 text-center font-serif text-[#8b8b8b] tracking-wider">暂无密钥，请先铸钥</div>
          ) : (
            <div className="divide-y divide-[#d4cdb8]/40">
              {keys.map((k) => {
                const isExpired = new Date(k.expires_at) < new Date();
                return (
                  <div key={k.key} className="p-4 hover:bg-[#d4cdb8]/15 flex items-center gap-3">
                    <code className="font-mono text-sm text-[#2c2c2c] flex-1">{k.key}</code>
                    <div className="font-serif text-xs text-[#5a5a5a] hidden md:block">
                      用 {k.used_count} 次 · {k.note || "无备注"}
                    </div>
                    <div className="font-serif text-xs text-[#5a5a5a] hidden md:block">
                      至 {new Date(k.expires_at).toLocaleDateString()}
                    </div>
                    {isExpired ? <span className="font-serif text-xs px-2 py-1 rounded bg-[#b85c3a]/15 text-[#b85c3a]">已过期</span> :
                     k.active ? <span className="font-serif text-xs px-2 py-1 rounded bg-[#6b7553]/15 text-[#4a5339]">有效</span> :
                     <span className="font-serif text-xs px-2 py-1 rounded bg-[#d4cdb8] text-[#5a5a5a]">已停用</span>}
                    <button onClick={() => toggleKey(k.key)} className="p-1.5 hover:bg-[#d4cdb8]/30 rounded" title={k.active ? "停用" : "启用"}>
                      <Power className={`w-4 h-4 ${k.active ? "text-[#6b7553]" : "text-[#8b8b8b]"}`} />
                    </button>
                    <button onClick={() => deleteKey(k.key)} className="p-1.5 hover:bg-[#b85c3a]/15 rounded" title="删除">
                      <Trash2 className="w-4 h-4 text-[#b85c3a]" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

