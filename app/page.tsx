'use client';
import { useState } from 'react';
import { API_BASE_URL } from './lib/config';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

/* ── 八卦爻线数据：8个卦象，各3爻 ── */
const TRIGRAMS = [
  { name: '乾', lines: ['yang', 'yang', 'yang'], angle: 0 },
  { name: '巽', lines: ['yang', 'yang', 'yin'],  angle: 45 },
  { name: '坎', lines: ['yin', 'yang', 'yin'],    angle: 90 },
  { name: '艮', lines: ['yang', 'yin', 'yin'],    angle: 135 },
  { name: '坤', lines: ['yin', 'yin', 'yin'],     angle: 180 },
  { name: '震', lines: ['yang', 'yin', 'yang'],    angle: 225 },
  { name: '离', lines: ['yin', 'yang', 'yang'],    angle: 270 },
  { name: '兑', lines: ['yin', 'yin', 'yang'],     angle: 315 },
];

function YaoLine({ type, index, angle }: { type: string; index: number; angle: number }) {
  const radius = 24;
  const rad = ((angle - 90) * Math.PI) / 180;
  const cx = 140 + Math.cos(rad) * radius;
  const cy = 140 + Math.sin(rad) * radius;
  const offset = index * 7;
  return (
    <div
      className={`bagua-line ${type}`}
      style={{
        left: cx - 11,
        top: cy + offset - 1.5,
        transform: `rotate(${angle}deg)`,
        transformOrigin: 'center center',
      }}
    />
  );
}

function BaguaCompass() {
  return (
    <div className='bagua-compass mx-auto'>
      <div className='bagua-outer-ring' />
      <span className='bagua-direction north'>北</span>
      <span className='bagua-direction south'>南</span>
      <span className='bagua-direction east'>东</span>
      <span className='bagua-direction west'>西</span>
      <div className='bagua-middle-ring' />
      {TRIGRAMS.map((tri) =>
        tri.lines.map((line, i) => (
          <YaoLine key={`${tri.name}-${i}`} type={line} index={i} angle={tri.angle} />
        ))
      )}
      <div className='bagua-inner-ring' />
    </div>
  );
}

export default function HomePage() {
  const [key, setKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!key.trim()) return;
    setLoading(true);
    setError(null);
    setRetryCount(0);

    // 最多重试3次
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        setRetryCount(attempt);
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 15000);

        const res = await fetch(`${API_BASE_URL}/api/verify-key`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ key: key.trim() }),
          signal: controller.signal,
        });
        clearTimeout(timeout);

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.detail || '密钥无效');
        }

        sessionStorage.setItem('FangWeiGe_key', key.trim().toUpperCase());
        router.push('/upload-free');
        return;
      } catch (err: any) {
        if (attempt < 2) {
          // 非最后一次重试，等待1秒后重试
          await new Promise(r => setTimeout(r, 1000));
          continue;
        }
        // 最后一次重试失败
        if (err.name === 'AbortError') {
          setError('网络超时，请检查网络后重试');
        } else if (err.message.includes('Failed to fetch')) {
          setError('无法连接服务器，请稍后重试');
        } else {
          setError(err.message);
        }
      }
    }
    setLoading(false);
  };

  return (
    <main className='min-h-screen ink-wash-bg relative flex flex-col items-center justify-center px-6 py-12'>
      <div className='side-text-decoration left'>天干地支五行八卦阴阳乾坤</div>
      <div className='side-text-decoration right'>甲乙丙丁子丑寅卯金木水火</div>

      <div className='relative z-10 max-w-md w-full flex flex-col items-center'>
        <div className='flex gap-8 mb-8 animate-fade-in'>
          <div className='vertical-text text-[#8b9170] text-xs tracking-[0.4em] animate-slow-breath'>一桌一境</div>
          <div className='vertical-text-right text-[#8b9170] text-xs tracking-[0.4em] animate-slow-breath delay-300'>皆为易理</div>
        </div>

        <div className='text-center mb-6 animate-fade-in-up'>
          <h1 className='font-serif text-5xl font-bold text-[#2c2c2c] tracking-[0.2em] mb-2'>方位阁</h1>
          <div className='brush-divider-ink animate-brush-stroke delay-200 mx-auto w-48' />
          <p className='font-serif text-sm text-[#5a5a5a] tracking-[0.15em] mt-4'>八字参断 · 工位方圆</p>
        </div>

        <div className='my-10 animate-fade-in delay-300'>
          <BaguaCompass />
        </div>

        <div className='brush-divider-ornate w-full animate-fade-in delay-400' />

        <div className='w-full mt-6 animate-fade-in-up delay-500'>
          <div className='card-ink card-float p-8 sm:p-10'>
            <div className='absolute -top-3 -right-3'>
              <div className='stamp-seal-sm stamp-seal text-xs'>密</div>
            </div>

            <div className='text-center mb-6'>
              <p className='font-serif text-xs text-[#8b9170] tracking-[0.2em] mb-1'>通行验证</p>
              <p className='font-serif text-xs text-[#a0a0a0] tracking-wider'>天地万物皆有外应</p>
            </div>

            <form onSubmit={handleSubmit} className='space-y-5'>
              <div>
                <label className='font-serif text-sm text-[#4a5339] mb-2 block tracking-[0.15em]'>通行密钥</label>
                <input
                  type='text'
                  value={key}
                  onChange={(e) => setKey(e.target.value.toUpperCase())}
                  placeholder='请输入密钥'
                  className='input-xuan w-full px-4 py-3.5 rounded text-center text-lg tracking-wider'
                  maxLength={19}
                />
              </div>

              {error && (
                <div className='text-[#b85c3a] text-sm font-serif px-3 py-2 bg-[#b85c3a]/8 rounded border border-[#b85c3a]/15'>
                  {error}
                </div>
              )}

              {loading && retryCount > 0 && (
                <div className='text-[#8b9170] text-xs font-serif text-center tracking-wider'>
                  正在重试 ({retryCount + 1}/3)...
                </div>
              )}

              {loading && (
                <div className='ink-progress ink-progress-vermilion rounded-full' />
              )}

              <button
                type='submit'
                disabled={loading || !key.trim()}
                className='btn-vermilion w-full py-3.5 rounded disabled:opacity-35 disabled:cursor-not-allowed flex items-center justify-center gap-2'
              >
                {loading ? (
                  <>
                    <Loader2 className='w-4 h-4 animate-spin' />
                    验证中
                  </>
                ) : (
                  <span className='font-serif tracking-[0.2em]'>入局参断</span>
                )}
              </button>
            </form>

            <div className='mt-6 text-center'>
              <div className='brush-divider w-full' />
              <p className='font-serif text-xs text-[#a0a0a0] tracking-[0.15em] mt-4'>未持密钥者，请寻主家授予</p>
            </div>
          </div>
        </div>

        <div className='mt-10 flex flex-col items-center gap-4 animate-fade-in delay-700'>
          <div className='stamp-seal text-xs'>方位阁</div>
          <p className='font-serif text-xs text-[#a0a0a0] tracking-[0.15em]'>仅供娱乐参考 · 融合理性数理</p>
        </div>
      </div>

      <div className='ink-mountains fixed bottom-0 left-0 right-0 z-0'>
        <div className='ink-mountain-layer ink-mountain-far' />
        <div className='ink-mountain-layer ink-mountain-mid' />
        <div className='ink-mountain-layer ink-mountain-near' />
      </div>
    </main>
  );
}
