"use client";

import { useEffect, useState } from "react";
import { API_BASE_URL } from '../lib/config';
import { useSearchParams } from "next/navigation";
import { Compass, AlertTriangle, ChevronDown, ChevronUp, Lock, X } from "lucide-react";

interface Report {
  task_id: string;
  scan_result: any;
  design_result: any;
  final_report: any;
  bazi_info: any;
  unlocked: boolean;
  disclaimer: string;
}

const WX_MAP: any = { jin: { label: "金", bg: "bg-jin" }, mu: { label: "木", bg: "bg-mu" }, shui: { label: "水", bg: "bg-shui" }, huo: { label: "火", bg: "bg-huo" }, tu: { label: "土", bg: "bg-tu" } };

export default function ReportPage() {
  const searchParams = useSearchParams();
  const taskId = searchParams.get('id') || '';
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [showPay, setShowPay] = useState(false);
  const [payNote, setPayNote] = useState("");

  useEffect(() => {
    const key = sessionStorage.getItem("FangWeiGe_key");
    if (!key) { window.location.href = "/"; return; }
    fetch(`${API_BASE_URL}/api/report/${taskId}`, { headers: { "X-Key": key } })
      .then((r) => r.json()).then((data) => { setReport(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [taskId]);

  const reload = async () => {
    const key = sessionStorage.getItem("FangWeiGe_key");
    const r = await fetch(`${API_BASE_URL}/api/report/${taskId}`, { headers: { "X-Key": key! } });
    setReport(await r.json());
  };

  const submitPay = async () => {
    const key = sessionStorage.getItem("FangWeiGe_key");
    await fetch(`${API_BASE_URL}/api/unlock/${taskId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Key": key! },
      body: JSON.stringify({ payment_proof: payNote || "user_submit" })
    });
    await reload();
    setShowPay(false);
  };

  if (loading) return <div className="min-h-screen paper-bg flex items-center justify-center font-serif text-[#5a5a5a]">加载中...</div>;
  if (!report) return (
    <div className="min-h-screen paper-bg flex flex-col items-center justify-center gap-3">
      <AlertTriangle className="w-10 h-10 text-[#b85c3a]" />
      <p className="font-serif text-[#5a5a5a]">报告加载失败</p>
      <a href="/" className="font-serif text-sm text-[#4a5339] underline">返回首页</a>
    </div>
  );

  const { scan_result, design_result, bazi_info, unlocked } = report;
  const score = scan_result?.overall_score ?? 0;
  const scoreColor = score >= 70 ? "text-[#6b7553]" : score >= 50 ? "text-[#8b6f47]" : "text-[#b85c3a]";
  const wuxing = bazi_info?.wuxing || {};

  const dims = [
    { key: "seat", icon: "🪑", label: "座位方位", data: scan_result?.seat_analysis },
    { key: "desktop", icon: "🖥️", label: "桌面陈设", data: scan_result?.desktop_analysis },
    { key: "plant", icon: "🌿", label: "植物摆件", data: scan_result?.plant_decoration },
    { key: "overhead", icon: "❄️", label: "头顶梁器", data: scan_result?.overhead },
    { key: "lighting", icon: "💡", label: "明暗光线", data: scan_result?.lighting },
    { key: "background", icon: "🧱", label: "背后靠山", data: scan_result?.background },
  ];

  return (
    <main className="min-h-screen paper-bg pb-16">
      <div className="max-w-2xl mx-auto px-5 py-6 space-y-6">

        <header className="text-center pb-2">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-[#4a5339] rounded mb-3">
            <Compass className="w-6 h-6 text-[#f5f1e8]" />
          </div>
          <div className="seal mb-2">易理参断书</div>
          <h1 className="font-serif text-3xl font-bold text-[#2c2c2c] tracking-wider mb-2">事业运格局判</h1>
          <p className="font-serif text-xs text-[#5a5a5a] tracking-wider">
            {bazi_info?.name || "命主"} · {bazi_info?.birthdate} · {bazi_info?.birthtime_label}
          </p>

        </header>

        <section className="card-paper p-6 shadow-sm">
          <div className="text-center mb-5">
            <div className="font-serif text-xs text-[#8b8b8b] tracking-widest mb-2">事业运总判</div>
            <div className={`font-serif text-7xl font-bold ${scoreColor} leading-none`}>{score}</div>
            <div className="font-serif text-xs text-[#8b8b8b] mt-1">/ 100</div>
            <div className="font-serif text-base text-[#4a5339] mt-3 tracking-wider">
              {score >= 70 ? "格局上佳" : score >= 50 ? "格局平常" : "格局有瑕"}
            </div>
          </div>

          <div className="mb-5 p-4 bg-[#faf7ef] rounded border border-[#d4cdb8]">
            <div className="font-serif text-xs text-[#8b8b8b] tracking-widest text-center mb-3">命局五行分布</div>
            <div className="grid grid-cols-5 gap-2 text-center">
              {Object.entries({ jin: '金', mu: '木', shui: '水', huo: '火', tu: '土' }).map(([key, label]) => {
                const value = wuxing[key] ?? 0;
                return (
                  <div key={key}>
                    <div className={`font-serif text-lg font-bold wuxing-${key}`}>{label}</div>
                    <div className="font-serif text-xs text-[#5a5a5a] mt-1">{value}</div>
                    <div className="mt-1 h-1.5 bg-[#faf7ef] rounded-full overflow-hidden border border-[#d4cdb8]">
                      <div className={`h-full ${WX_MAP[key]?.bg}`} style={{ width: `${Math.min(value * 12, 100)}%` }}></div>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="mt-3 text-center font-serif text-xs text-[#5a5a5a] tracking-wider">
              喜用神 · <span className="text-[#4a5339] font-bold text-sm">{bazi_info?.favorable}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-[#b85c3a]/8 border border-[#b85c3a]/30 rounded p-3">
              <div className="font-serif text-xs font-semibold text-[#b85c3a] mb-2 tracking-wider">⚠ 当下之碍</div>
              <div className="flex flex-wrap gap-1">
                {(scan_result?.risk_factors ?? []).map((r: string) => (
                  <span key={r} className="bg-[#b85c3a]/15 text-[#b85c3a] text-xs px-2 py-0.5 rounded font-serif">{r}</span>
                ))}
              </div>
            </div>
            <div className="bg-[#6b7553]/8 border border-[#6b7553]/30 rounded p-3">
              <div className="font-serif text-xs font-semibold text-[#6b7553] mb-2 tracking-wider">✓ 现有之利</div>
              <div className="flex flex-wrap gap-1">
                {(scan_result?.advantages ?? []).map((a: string) => (
                  <span key={a} className="bg-[#6b7553]/15 text-[#6b7553] text-xs px-2 py-0.5 rounded font-serif">{a}</span>
                ))}
              </div>
            </div>
          </div>
        </section>

        {bazi_info && (
          <section className="card-paper p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <span className="seal-mark">合断</span>
              <h2 className="font-serif text-base font-bold text-[#2c2c2c] tracking-wider">八字 · 工位 合断</h2>
            </div>
            <div className="mb-4">
              <div className="font-serif text-xs text-[#8b8b8b] tracking-widest mb-2">命主八字</div>
              <div className="grid grid-cols-4 gap-2 text-center">
                {bazi_info.bazi?.map((pillar: string, i: number) => (
                  <div key={i} className="bg-[#faf7ef] border border-[#d4cdb8] rounded p-2">
                    <div className="font-serif text-xs text-[#8b8b8b]">{['年柱', '月柱', '日柱', '时柱'][i]}</div>
                    <div className="font-serif text-lg font-bold text-[#4a5339] mt-1">{pillar}</div>
                  </div>
                ))}
              </div>
              <div className="text-center mt-2 font-serif text-xs text-[#8b8b8b]">
                日主 · <span className="text-[#4a5339] font-bold">{bazi_info.day_master}</span>
              </div>
            </div>
            <div className="border-t border-[#d4cdb8] pt-4 mt-4">
              <div className="font-serif text-sm leading-loose text-[#2c2c2c]">{bazi_info.synthesis}</div>
            </div>
          </section>
        )}

        <section className="card-paper p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <span className="seal-mark">总论</span>
            <h2 className="font-serif text-base font-bold text-[#2c2c2c] tracking-wider">改造前后判</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="border-l-2 border-[#b85c3a] pl-3">
              <div className="font-serif text-xs text-[#b85c3a] tracking-widest mb-1">现状之患</div>
              <p className="font-serif text-sm text-[#2c2c2c] leading-loose">
                {unlocked ? design_result?.overview?.harm_summary : "若不调候，三月内易见工作不顺、上司责难之象。详情解锁查看。"}
              </p>
            </div>
            <div className="border-l-2 border-[#6b7553] pl-3">
              <div className="font-serif text-xs text-[#6b7553] tracking-widest mb-1">调后之利</div>
              <p className="font-serif text-sm text-[#2c2c2c] leading-loose">
                {unlocked ? design_result?.overview?.benefit_summary : "调候之后气场可逐步改善。详情解锁查看。"}
              </p>
            </div>
          </div>
        </section>

        <section className="card-paper p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <span className="seal-mark">六事</span>
            <h2 className="font-serif text-base font-bold text-[#2c2c2c] tracking-wider">工位六事</h2>
          </div>
          <div className="space-y-2">
            {dims.map((item) => {
              const isOpen = expanded === item.key;
              return (
                <div key={item.key} className="border border-[#d4cdb8] rounded bg-[#faf7ef]">
                  <button onClick={() => setExpanded(isOpen ? null : item.key)} className="w-full flex items-center justify-between p-3 hover:bg-[#d4cdb8]/15">
                    <div className="flex items-center gap-2">
                      <span>{item.icon}</span>
                      <span className="font-serif font-medium text-[#2c2c2c] text-sm tracking-wider">{item.label}</span>
                    </div>
                    {isOpen ? <ChevronUp className="w-4 h-4 text-[#8b8b8b]" /> : <ChevronDown className="w-4 h-4 text-[#8b8b8b]" />}
                  </button>
                  {isOpen && item.data && (
                    <div className="px-4 pb-4 space-y-3 border-t border-[#d4cdb8] pt-3">
                      {item.data.note && <div className="font-serif text-sm text-[#5a5a5a]">{item.data.note}</div>}
                      {item.data.harm && unlocked && (
                        <div className="bg-[#b85c3a]/8 border-l-2 border-[#b85c3a] p-3 rounded">
                          <div className="font-serif text-xs text-[#b85c3a] tracking-widest mb-1">⚠ 当前之患</div>
                          <p className="font-serif text-sm text-[#2c2c2c] leading-loose">{item.data.harm}</p>
                        </div>
                      )}
                      {item.data.benefit && unlocked && (
                        <div className="bg-[#6b7553]/8 border-l-2 border-[#6b7553] p-3 rounded">
                          <div className="font-serif text-xs text-[#6b7553] tracking-widest mb-1">✓ 调后之利</div>
                          <p className="font-serif text-sm text-[#2c2c2c] leading-loose">{item.data.benefit}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {!unlocked ? (
          <>
            <section className="card-paper p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <span className="seal-mark">一</span>
                <h2 className="font-serif text-base font-bold text-[#2c2c2c] tracking-wider">当即可行 · 零成本</h2>
              </div>
              <ul className="space-y-1.5">
                {(design_result?.immediate_actions ?? []).map((a: string, i: number) => (
                  <li key={i} className="flex items-start gap-2 font-serif text-sm text-[#2c2c2c] leading-loose">
                    <span className="text-[#6b7553]">·</span>
                    <span>{a}</span>
                  </li>
                ))}
              </ul>
            </section>

            <div className="relative">
              <section className="card-paper p-6 shadow-sm filter blur-[2px] opacity-60 select-none pointer-events-none">
                <div className="flex items-center gap-2 mb-4">
                  <span className="seal-mark">详断</span>
                  <h2 className="font-serif text-base font-bold text-[#2c2c2c] tracking-wider">本周改造方案</h2>
                </div>
                <div className="space-y-2">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="bg-[#faf7ef] border border-[#d4cdb8] rounded p-3">
                      <div className="font-serif font-bold text-[#2c2c2c] text-sm mb-1">推荐物品 #{i}</div>
                      <div className="font-serif text-xs text-[#5a5a5a]">含规格 · 位置 · 价格 · 作用机理</div>
                    </div>
                  ))}
                </div>
              </section>

              <div className="relative z-10 -mt-32 text-center py-8">
                <div className="inline-flex items-center justify-center w-14 h-14 bg-[#4a5339] rounded-full mb-3 shadow-lg">
                  <Lock className="w-6 h-6 text-[#f5f1e8]" />
                </div>
                <div className="seal mb-3">解锁详断</div>
                <h3 className="font-serif text-xl font-bold text-[#2c2c2c] tracking-wider mb-2">完整改造方案 · 待解锁</h3>
                <p className="font-serif text-xs text-[#5a5a5a] tracking-wider leading-relaxed mb-5 max-w-xs mx-auto">
                  揭晓危害说明、具体盆栽/摆件推荐、本月长期建议、摆放示意
                </p>
                <button onClick={() => setShowPay(true)} className="btn-ink px-8 py-3 rounded font-serif tracking-wider text-base">
                  解锁完整方案 · ¥9.9
                </button>
                <div className="mt-3 font-serif text-xs text-[#8b8b8b] tracking-wider">注：解锁一次终身查看</div>
              </div>
            </div>
          </>
        ) : (
          <section className="card-paper p-6 shadow-sm">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <span className="seal-mark">详断</span>
                <h2 className="font-serif text-base font-bold text-[#2c2c2c] tracking-wider">改造详案</h2>
              </div>
              <span className="font-serif text-xs text-[#6b7553] tracking-wider">✓ 已解锁</span>
            </div>

            <div className="mb-5">
              <div className="flex items-center gap-2 mb-2">
                <span className="seal-mark">二</span>
                <h3 className="font-serif text-sm font-semibold text-[#4a5339] tracking-wider">当周可置（小额）</h3>
              </div>
              <div className="space-y-2">
                {(design_result?.this_week ?? []).map((item: any, i: number) => (
                  <div key={i} className="bg-[#faf7ef] border border-[#d4cdb8] rounded p-3">
                    <div className="flex items-start justify-between mb-1">
                      <span className="font-serif font-bold text-[#2c2c2c] text-sm">{item.name}</span>
                      <span className="font-serif text-xs text-[#4a5339] font-medium whitespace-nowrap ml-2">{item.price}</span>
                    </div>
                    <div className="font-serif text-xs text-[#8b8b8b] mb-1">→ {item.location}</div>
                    <div className="font-serif text-xs text-[#5a5a5a] leading-loose">{item.purpose}</div>
                    {item.spec && <div className="font-serif text-xs text-[#8b6f47] mt-1 italic">规格：{item.spec}</div>}
                  </div>
                ))}
              </div>
            </div>

            {design_result?.this_month && (
              <div className="mb-5">
                <div className="flex items-center gap-2 mb-2">
                  <span className="seal-mark">三</span>
                  <h3 className="font-serif text-sm font-semibold text-[#4a5339] tracking-wider">当月可添（中额）</h3>
                </div>
                <div className="space-y-2">
                  {design_result.this_month.map((item: any, i: number) => (
                    <div key={i} className="bg-[#faf7ef] border border-[#d4cdb8] rounded p-3">
                      <div className="flex items-start justify-between mb-1">
                        <span className="font-serif font-bold text-[#2c2c2c] text-sm">{item.name}</span>
                        <span className="font-serif text-xs text-[#4a5339] font-medium whitespace-nowrap ml-2">{item.price}</span>
                      </div>
                      <div className="font-serif text-xs text-[#8b8b8b] mb-1">→ {item.location}</div>
                      <div className="font-serif text-xs text-[#5a5a5a] leading-loose">{item.purpose}</div>
                      {item.spec && <div className="font-serif text-xs text-[#8b6f47] mt-1 italic">规格：{item.spec}</div>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="mb-5">
              <div className="flex items-center gap-2 mb-2">
                <span className="seal-mark">四</span>
                <h3 className="font-serif text-sm font-semibold text-[#4a5339] tracking-wider">长期可养（习性）</h3>
              </div>
              <ul className="space-y-1.5">
                {(design_result?.long_term ?? []).map((a: string, i: number) => (
                  <li key={i} className="flex items-start gap-2 font-serif text-sm text-[#2c2c2c] leading-loose">
                    <span className="text-[#6b7553]">·</span>
                    <span>{a}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <div className="font-serif text-sm font-semibold text-[#4a5339] mb-2 tracking-wider">布局示意</div>
              <pre className="bg-[#faf7ef] border border-[#d4cdb8] rounded p-3 text-xs text-[#5a5a5a] font-mono whitespace-pre overflow-x-auto">
                {design_result?.layout}
              </pre>
            </div>
          </section>
        )}

        <div className="bg-[#b89968]/8 border border-[#b89968]/30 rounded p-4 font-serif text-xs text-[#8b6f47] tracking-wider leading-relaxed">
          <span className="font-bold">附识：</span>{report.disclaimer}
        </div>

        <div className="text-center pt-2 space-y-3">

          <div>
            <a href="/" className="font-serif text-sm text-[#4a5339] hover:text-[#2c2c2c] tracking-wider underline underline-offset-4">再起一卦 →</a>
          </div>
        </div>
      </div>

      {showPay && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4" onClick={() => setShowPay(false)}>
          <div className="bg-[#faf7ef] rounded-2xl max-w-md w-full p-6 shadow-2xl border border-[#d4cdb8] max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Lock className="w-5 h-5 text-[#4a5339]" />
                <h3 className="font-serif text-lg font-bold text-[#2c2c2c] tracking-wider">解锁完整方案</h3>
              </div>
              <button onClick={() => setShowPay(false)} className="p-1 hover:bg-[#d4cdb8]/30 rounded">
                <X className="w-5 h-5 text-[#8b8b8b]" />
              </button>
            </div>

            <div className="text-center mb-5">
              <div className="font-serif text-3xl font-bold text-[#2c2c2c] mb-1">¥ 9.9</div>
              <div className="font-serif text-xs text-[#8b8b8b] tracking-wider">一次解锁 · 终身查看</div>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="bg-white border border-[#d4cdb8] rounded p-3 text-center">
                <div className="font-serif text-xs text-[#6b7553] mb-2 tracking-wider">微信支付</div>
                <img src="/wxpay.jpg" alt="微信" className="w-full aspect-square object-contain rounded" />
              </div>
              <div className="bg-white border border-[#d4cdb8] rounded p-3 text-center">
                <div className="font-serif text-xs text-[#1677ff] mb-2 tracking-wider">支付宝</div>
                <img src="/alipay.jpg" alt="支付宝" className="w-full aspect-square object-contain rounded" />
              </div>
            </div>

            <div className="bg-[#b89968]/8 border border-[#b89968]/30 rounded p-3 mb-4">
              <div className="font-serif text-xs text-[#8b6f47] leading-loose">
                <p className="mb-1 font-bold">📌 付款步骤：</p>
                <p>① 扫码支付 ¥9.9</p>
                <p>② 截图保存付款凭证</p>
                <p>③ 添加客服微信发送凭证</p>
                <p>④ 客服 5 分钟内解锁完整方案</p>
              </div>
            </div>

            <div className="mb-3">
              <label className="font-serif text-xs text-[#8b8b8b] mb-1 block tracking-wider">付款备注（订单后4位）</label>
              <input type="text" value={payNote} onChange={(e) => setPayNote(e.target.value)} placeholder="如：1234" maxLength={20} className="input-paper w-full px-3 py-2 rounded text-sm" />
            </div>

            <button onClick={submitPay} className="btn-ink w-full py-3 rounded font-serif tracking-wider">
              我已付款 · 提交解锁
            </button>
            <div className="text-center mt-3 font-serif text-xs text-[#8b8b8b] tracking-wider">
              提交后等待客服确认（约 5 分钟）
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
