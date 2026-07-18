"use client";
import { useEffect, useState } from "react";
import { API_BASE_URL } from '../lib/config';
import { useSearchParams } from "next/navigation";
import { AlertTriangle, ChevronDown, ChevronUp } from "lucide-react";

const WX_MAP: any = { jin: { label: "金", bg: "bg-jin" }, mu: { label: "木", bg: "bg-mu" }, shui: { label: "水", bg: "bg-shui" }, huo: { label: "火", bg: "bg-huo" }, tu: { label: "土", bg: "bg-tu" } };

export default function ReportFree() {
  const searchParams = useSearchParams();
  const taskId = searchParams.get('id') || '';
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    const k = sessionStorage.getItem("FangWeiGe_key");
    if (!k) { window.location.href = "/"; return; }
    fetch(`${API_BASE_URL}/api/report-free/${taskId}`, { headers: { "X-Key": k } })
      .then((r) => r.json()).then((d) => { setReport(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, [taskId]);

  if (loading) return (
    <div className="min-h-screen ink-wash-bg flex flex-col items-center justify-center gap-6 relative">
      <div className="ink-progress w-48 animate-slow-breath" />
      <p className="font-serif text-[#5a5a5a] tracking-widest text-sm animate-fade-in">研墨判卦中...</p>
    </div>
  );
  if (!report) return (
    <div className="min-h-screen ink-wash-bg flex flex-col items-center justify-center gap-4">
      <AlertTriangle className="w-10 h-10 text-[#b85c3a] animate-fade-in" />
      <p className="font-serif text-[#5a5a5a] tracking-widest">报告加载失败</p>
      <a href="/" className="font-serif text-sm text-[#4a5339] underline underline-offset-4 tracking-wider">返回首页</a>
    </div>
  );

  const sr = report.scan_result, dr = report.design_result, bz = report.bazi_info;
  const score = sr?.overall_score ?? 0;
  const sc = score >= 70 ? "text-[#6b7553]" : score >= 50 ? "text-[#8b6f47]" : "text-[#b85c3a]";
  const wx = bz?.wuxing || {};

  const dims = [
    { k: "seat", i: "🪑", l: "座位方位", d: sr?.seat_analysis },
    { k: "desk", i: "🖥️", l: "桌面陈设", d: sr?.desktop_analysis },
    { k: "pl", i: "🌿", l: "植物摆件", d: sr?.plant_decoration },
    { k: "ov", i: "❄️", l: "头顶梁器", d: sr?.overhead },
    { k: "li", i: "💡", l: "明暗光线", d: sr?.lighting },
    { k: "bg", i: "🧱", l: "背后靠山", d: sr?.background },
  ];

  /* ink ring progress */
  const ringRadius = 90;
  const ringCircumference = 2 * Math.PI * ringRadius;
  const ringOffset = ringCircumference * (1 - score / 100);

  return (
    <main className="min-h-screen ink-wash-bg pb-0 relative">
      {/* Side vertical decorations */}
      <div className="side-text-decoration left animate-fade-in delay-500">
        天行健君子以自强不息地势坤君子以厚德载物
      </div>
      <div className="side-text-decoration right animate-fade-in delay-700">
        一命二运三风水四积阴德五读书
      </div>

      <div className="max-w-2xl mx-auto px-5 pt-8 pb-16 relative z-10 space-y-0">

        {/* ============ 1. HEADER ============ */}
        <header className="text-center pb-6 animate-fade-in-up">
          <div className="flex justify-center mb-5">
            <div className="stamp-seal-sm" style={{ transform: "rotate(-6deg)" }}>
              方位阁
            </div>
          </div>
          <h1 className="font-serif text-4xl font-black text-[#2c2c2c] tracking-[0.2em] mb-3 leading-tight">
            八字工位合断
          </h1>
          <div className="flex items-center justify-center gap-3 mb-2">
            <span className="font-serif text-sm text-[#5a5a5a] tracking-widest">
              {bz?.name || "命主"}
            </span>
            <span className="ink-dot" />
            <span className="font-serif text-sm text-[#5a5a5a] tracking-widest">
              {bz?.birthdate}
            </span>
            <span className="ink-dot" />
            <span className="font-serif text-sm text-[#5a5a5a] tracking-widest">
              {bz?.birthtime_label}
            </span>
          </div>

        </header>

        <div className="brush-divider-ornate animate-brush-stroke" />

        {/* ============ 2. 总评分区 ============ */}
        <section className="card-ink card-float p-8 mt-8 animate-fade-in-up delay-100">
          <div className="flex flex-col items-center mb-6">
            <div className="font-serif text-xs text-[#8b8b8b] tracking-[0.3em] mb-4">工位格局总判</div>

            {/* 水墨圆环进度条 */}
            <div className="relative w-52 h-52 mb-4">
              <svg className="w-full h-full" viewBox="0 0 200 200" style={{ transform: "rotate(-90deg)" }}>
                <circle cx="100" cy="100" r={ringRadius} fill="none" stroke="rgba(200,195,180,0.3)" strokeWidth="6" />
                <circle
                  cx="100" cy="100" r={ringRadius}
                  fill="none"
                  stroke={score >= 70 ? "#6b7553" : score >= 50 ? "#8b6f47" : "#b85c3a"}
                  strokeWidth="6"
                  strokeLinecap="round"
                  strokeDasharray={ringCircumference}
                  strokeDashoffset={ringOffset}
                  style={{ transition: "stroke-dashoffset 1.5s ease-out" }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className={`font-serif text-6xl font-black ${sc} leading-none`}>{score}</span>
                <span className="font-serif text-xs text-[#8b8b8b] mt-1 tracking-widest">/ 100</span>
              </div>
            </div>

            <div className="font-serif text-lg text-[#4a5339] tracking-[0.2em] font-semibold">
              {score >= 70 ? "格局上佳" : score >= 50 ? "格局平常" : "格局有瑕"}
            </div>
          </div>

          {/* 五行分布条形图 */}
          <div className="mb-6 p-5 bg-[#faf7ef]/80 rounded border border-[#d4cdb8]/60">
            <div className="font-serif text-xs text-[#8b8b8b] tracking-[0.3em] text-center mb-4">命局五行分布</div>
            <div className="space-y-3">
              {Object.entries({ jin: "金", mu: "木", shui: "水", huo: "火", tu: "土" }).map(([k, l]) => {
                const v = wx[k] ?? 0;
                return (
                  <div key={k} className="flex items-center gap-3">
                    <div className={`font-serif text-base font-bold wuxing-${k} w-6 text-center`}>{l}</div>
                    <div className="flex-1 h-2 bg-[#faf7ef] rounded-full overflow-hidden border border-[#d4cdb8]/50">
                      <div
                        className={`h-full ${WX_MAP[k]?.bg} rounded-full`}
                        style={{ width: `${Math.min(v * 12, 100)}%`, transition: "width 1s ease-out" }}
                      />
                    </div>
                    <div className="font-serif text-xs text-[#5a5a5a] w-6 text-right">{v}</div>
                  </div>
                );
              })}
            </div>
            <div className="mt-4 text-center font-serif text-xs text-[#5a5a5a] tracking-widest">
              喜用神 · <span className="text-[#4a5339] font-bold text-sm">{bz?.favorable}</span>
            </div>
          </div>

          {/* 风险 + 优势 */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-[#b85c3a]/6 border border-[#b85c3a]/20 rounded p-4">
              <div className="font-serif text-xs font-semibold text-[#b85c3a] mb-3 tracking-widest">当下之碍</div>
              <div className="flex flex-wrap gap-1.5">
                {(sr?.risk_factors ?? []).map((r: string) => (
                  <span key={r} className="bg-[#b85c3a]/10 text-[#b85c3a] text-xs px-2.5 py-1 rounded font-serif tracking-wider border border-[#b85c3a]/15">{r}</span>
                ))}
              </div>
            </div>
            <div className="bg-[#6b7553]/6 border border-[#6b7553]/20 rounded p-4">
              <div className="font-serif text-xs font-semibold text-[#6b7553] mb-3 tracking-widest">现有之利</div>
              <div className="flex flex-wrap gap-1.5">
                {(sr?.advantages ?? []).map((a: string) => (
                  <span key={a} className="bg-[#6b7553]/10 text-[#6b7553] text-xs px-2.5 py-1 rounded font-serif tracking-wider border border-[#6b7553]/15">{a}</span>
                ))}
              </div>
            </div>
          </div>
        </section>

        <div className="brush-divider-ink" />

        {/* ============ 3. 八字信息卡 ============ */}
        {bz && (
          <section className="card-ink card-float p-8 animate-fade-in-up delay-200">
            <div className="flex items-center gap-3 mb-6">
              <span className="seal-mark">合断</span>
              <h2 className="font-serif text-lg font-bold text-[#2c2c2c] tracking-[0.15em]">八字 · 工位 合断</h2>
            </div>
            <div className="mb-5">
              <div className="font-serif text-xs text-[#8b8b8b] tracking-[0.3em] mb-3">命主八字</div>
              <div className="grid grid-cols-4 gap-3 text-center">
                {bz.bazi?.map((p: string, i: number) => (
                  <div key={i} className="bg-[#faf7ef]/80 border border-[#d4cdb8]/60 rounded p-3 relative overflow-hidden">
                    <div className="absolute top-0 left-0 right-0 h-0.5 bg-[#4a5339]/30" />
                    <div className="font-serif text-xs text-[#8b8b8b] tracking-widest">{["年柱","月柱","日柱","时柱"][i]}</div>
                    <div className="font-serif text-xl font-bold text-[#4a5339] mt-2 tracking-wider">{p}</div>
                  </div>
                ))}
              </div>
              <div className="text-center mt-3 font-serif text-xs text-[#8b8b8b] tracking-widest">
                日主 · <span className="text-[#4a5339] font-bold text-sm">{bz.day_master}</span>
              </div>
            </div>
            <div className="border-t border-[#d4cdb8]/60 pt-5 mt-4">
              <div className="font-serif text-sm leading-[2] text-[#2c2c2c] tracking-wider">{bz.synthesis}</div>
            </div>
          </section>
        )}

        <div className="brush-divider" />

        {/* ============ 4. 工位六事卡 ============ */}
        <section className="card-ink card-float p-8 animate-fade-in-up delay-300">
          <div className="flex items-center gap-3 mb-6">
            <span className="seal-mark">六事</span>
            <h2 className="font-serif text-lg font-bold text-[#2c2c2c] tracking-[0.15em]">工位六事详断</h2>
          </div>
          <div className="space-y-3">
            {dims.map((it) => {
              const open = expanded === it.k;
              return (
                <div key={it.k} className={`border border-[#d4cdb8]/60 rounded overflow-hidden transition-all duration-300 ${open ? "bg-[#faf7ef]/60 shadow-sm" : "bg-[#faf7ef]/30"}`}>
                  <button
                    onClick={() => setExpanded(open ? null : it.k)}
                    className="w-full flex items-center justify-between p-4 hover:bg-[#d4cdb8]/10 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-lg">{it.i}</span>
                      <span className="font-serif font-semibold text-[#2c2c2c] text-sm tracking-widest">{it.l}</span>
                    </div>
                    {open ? <ChevronUp className="w-4 h-4 text-[#8b8b8b]" /> : <ChevronDown className="w-4 h-4 text-[#8b8b8b]" />}
                  </button>
                  {open && it.d && (
                    <div className="px-5 pb-5 space-y-3 border-t border-[#d4cdb8]/40 pt-4">
                      {it.d.note && <div className="font-serif text-sm text-[#5a5a5a] leading-relaxed tracking-wider">{it.d.note}</div>}
                      {it.d.harm && (
                        <div className="bg-[#b85c3a]/6 border-l-2 border-[#b85c3a] p-4 rounded-r">
                          <div className="font-serif text-xs text-[#b85c3a] tracking-[0.2em] mb-2 font-semibold">当前之患</div>
                          <p className="font-serif text-sm text-[#2c2c2c] leading-relaxed tracking-wider">{it.d.harm}</p>
                        </div>
                      )}
                      {it.d.benefit && (
                        <div className="bg-[#6b7553]/6 border-l-2 border-[#6b7553] p-4 rounded-r">
                          <div className="font-serif text-xs text-[#6b7553] tracking-[0.2em] mb-2 font-semibold">调后之利</div>
                          <p className="font-serif text-sm text-[#2c2c2c] leading-relaxed tracking-wider">{it.d.benefit}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        <div className="brush-divider-ink" />

        {/* ============ 5. 合断总论卡 ============ */}
        <section className="card-ink card-float p-8 animate-fade-in-up delay-400">
          <div className="flex items-center gap-3 mb-6">
            <span className="seal-mark">总论</span>
            <h2 className="font-serif text-lg font-bold text-[#2c2c2c] tracking-[0.15em]">改造前后判</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-5">
            <div className="bg-[#b85c3a]/5 border border-[#b85c3a]/15 rounded p-5">
              <div className="font-serif text-xs text-[#b85c3a] tracking-[0.3em] mb-3 font-semibold">现状之患</div>
              <p className="font-serif text-sm text-[#2c2c2c] leading-[2] tracking-wider">{dr?.overview?.harm_summary}</p>
            </div>
            <div className="bg-[#6b7553]/5 border border-[#6b7553]/15 rounded p-5">
              <div className="font-serif text-xs text-[#6b7553] tracking-[0.3em] mb-3 font-semibold">调后之利</div>
              <p className="font-serif text-sm text-[#2c2c2c] leading-[2] tracking-wider">{dr?.overview?.benefit_summary}</p>
            </div>
          </div>
        </section>

        <div className="brush-divider-ornate" />

        {/* ============ 6. 改造方案区 ============ */}
        <section className="card-ink card-float p-8 animate-fade-in-up delay-500">
          <div className="flex items-center gap-3 mb-6">
            <span className="seal-mark">调候</span>
            <h2 className="font-serif text-lg font-bold text-[#2c2c2c] tracking-[0.15em]">调候改造 · 分步</h2>
          </div>

          {/* 一、当即可行 */}
          <div className="mb-7">
            <div className="flex items-center gap-3 mb-3">
              <span className="stamp-seal-sm" style={{ transform: "rotate(-2deg)", fontSize: "0.6rem", padding: "0.2rem 0.5rem" }}>一</span>
              <h3 className="font-serif text-sm font-bold text-[#4a5339] tracking-[0.15em]">当即可行（零成本）</h3>
            </div>
            <ul className="space-y-2 pl-1">
              {(dr?.immediate_actions ?? []).map((a: string, i: number) => (
                <li key={i} className="flex items-start gap-3 font-serif text-sm text-[#2c2c2c] leading-[2] tracking-wider">
                  <span className="text-[#6b7553] mt-0.5">·</span>
                  <span>{a}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="brush-divider-ink" />

          {/* 二、当周可置 */}
          <div className="mb-7">
            <div className="flex items-center gap-3 mb-3">
              <span className="stamp-seal-sm" style={{ transform: "rotate(1deg)", fontSize: "0.6rem", padding: "0.2rem 0.5rem" }}>二</span>
              <h3 className="font-serif text-sm font-bold text-[#4a5339] tracking-[0.15em]">当周可置（小额）</h3>
            </div>
            <div className="space-y-3">
              {(dr?.this_week ?? []).map((it: any, i: number) => (
                <div key={i} className="bg-[#faf7ef]/60 border border-[#d4cdb8]/50 rounded p-4 hover:border-[#d4cdb8] transition-colors">
                  <div className="flex items-start justify-between mb-1.5">
                    <span className="font-serif font-bold text-[#2c2c2c] text-sm tracking-wider">{it.name}</span>
                    <span className="font-serif text-xs text-[#4a5339] font-medium whitespace-nowrap ml-3">{it.price}</span>
                  </div>
                  <div className="font-serif text-xs text-[#8b8b8b] mb-1.5 tracking-wider">→ {it.location}</div>
                  <div className="font-serif text-xs text-[#5a5a5a] leading-relaxed tracking-wider">{it.purpose}</div>
                  {it.spec && <div className="font-serif text-xs text-[#8b6f47] mt-2 italic tracking-wider">规格：{it.spec}</div>}
                </div>
              ))}
            </div>
          </div>

          {/* 三、当月可添 */}
          {dr?.this_month && (
            <>
              <div className="brush-divider" />
              <div className="mb-7">
                <div className="flex items-center gap-3 mb-3">
                  <span className="stamp-seal-sm" style={{ transform: "rotate(-3deg)", fontSize: "0.6rem", padding: "0.2rem 0.5rem" }}>三</span>
                  <h3 className="font-serif text-sm font-bold text-[#4a5339] tracking-[0.15em]">当月可添（中额）</h3>
                </div>
                <div className="space-y-3">
                  {dr.this_month.map((it: any, i: number) => (
                    <div key={i} className="bg-[#faf7ef]/60 border border-[#d4cdb8]/50 rounded p-4 hover:border-[#d4cdb8] transition-colors">
                      <div className="flex items-start justify-between mb-1.5">
                        <span className="font-serif font-bold text-[#2c2c2c] text-sm tracking-wider">{it.name}</span>
                        <span className="font-serif text-xs text-[#4a5339] font-medium whitespace-nowrap ml-3">{it.price}</span>
                      </div>
                      <div className="font-serif text-xs text-[#8b8b8b] mb-1.5 tracking-wider">→ {it.location}</div>
                      <div className="font-serif text-xs text-[#5a5a5a] leading-relaxed tracking-wider">{it.purpose}</div>
                      {it.spec && <div className="font-serif text-xs text-[#8b6f47] mt-2 italic tracking-wider">规格：{it.spec}</div>}
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          <div className="brush-divider" />

          {/* 四、长期可养 */}
          <div className="mb-7">
            <div className="flex items-center gap-3 mb-3">
              <span className="stamp-seal-sm" style={{ transform: "rotate(2deg)", fontSize: "0.6rem", padding: "0.2rem 0.5rem" }}>四</span>
              <h3 className="font-serif text-sm font-bold text-[#4a5339] tracking-[0.15em]">长期可养（习性）</h3>
            </div>
            <ul className="space-y-2 pl-1">
              {(dr?.long_term ?? []).map((a: string, i: number) => (
                <li key={i} className="flex items-start gap-3 font-serif text-sm text-[#2c2c2c] leading-[2] tracking-wider">
                  <span className="text-[#6b7553] mt-0.5">·</span>
                  <span>{a}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* 7. 布局示意区 */}
          {dr?.layout && (
            <>
              <div className="brush-divider-ink" />
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="seal-mark">图</span>
                  <h3 className="font-serif text-sm font-semibold text-[#4a5339] tracking-[0.15em]">布局示意</h3>
                </div>
                <pre className="bg-[#faf7ef]/80 border border-[#d4cdb8]/50 rounded p-4 text-xs text-[#5a5a5a] font-mono whitespace-pre overflow-x-auto leading-relaxed">{dr.layout}</pre>
              </div>
            </>
          )}
        </section>

        {/* 附识 */}
        <div className="mt-6 bg-[#b89968]/6 border border-[#b89968]/20 rounded p-5 font-serif text-xs text-[#8b6f47] tracking-wider leading-relaxed animate-fade-in delay-600">
          <span className="font-bold">附识：</span>{report.disclaimer}
        </div>

        {/* ============ 8. 底部 ============ */}
        <div className="text-center pt-8 space-y-5 animate-fade-in-up delay-700">
          <div>
            <a href="/" className="font-serif text-sm text-[#4a5339] hover:text-[#2c2c2c] tracking-widest underline underline-offset-4 transition-colors">
              再起一卦 →
            </a>
          </div>

          {/* 水墨山水装饰 */}
          <div className="ink-mountains mt-4">
            <div className="ink-mountain-layer ink-mountain-far" />
            <div className="ink-mountain-layer ink-mountain-mid" />
            <div className="ink-mountain-layer ink-mountain-near" />
          </div>

          {/* 底部文字 */}
          <p className="font-serif text-xs text-[#8b8b8b] tracking-[0.4em] pt-2 pb-4 animate-slow-breath">
            一桌一境皆为易理
          </p>
        </div>

      </div>
    </main>
  );
}
