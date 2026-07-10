"use client";

import { useState } from "react";
import { API_BASE_URL } from './lib/config';
import { useRouter } from "next/navigation";
import { Compass, Loader2 } from "lucide-react";

export default function HomePage() {
  const [key, setKey] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!key.trim()) return;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`${API_BASE_URL}/api/verify-key`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: key.trim() }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.detail || "密钥无效");
      }

      sessionStorage.setItem("FangWeiGe_key", key.trim().toUpperCase());
      router.push("/upload-free");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen paper-bg flex items-center justify-center px-6">
      <div className="max-w-md w-full">
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-[#4a5339] rounded mb-4">
            <Compass className="w-7 h-7 text-[#f5f1e8]" />
          </div>
          <div className="seal mb-3">一桌一境 · 皆为易理</div>
          <h1 className="font-serif text-4xl font-bold text-[#2c2c2c] tracking-wider mb-3">
            方位阁 · 八字参断
          </h1>
          <p className="font-serif text-sm text-[#5a5a5a] leading-relaxed tracking-wide">
            天地万物皆有外应
            <br />
            工位布局与命主八字共振，方见事业运之端倪
          </p>
        </div>

        {/* 卡片 */}
        <div className="card-paper p-8 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="font-serif text-sm text-[#4a5339] mb-2 block tracking-wider">
                通行密钥
              </label>
              <input
                type="text"
                value={key}
                onChange={(e) => setKey(e.target.value.toUpperCase())}
                placeholder="XXXX-XXXX-XXXX-XXXX"
                className="input-paper w-full px-4 py-3 rounded font-mono tracking-wider text-center text-lg"
                maxLength={19}
              />
            </div>

            {error && (
              <div className="text-[#b85c3a] text-sm font-serif px-3 py-2 bg-[#b85c3a]/10 rounded">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !key.trim()}
              className="btn-ink w-full py-3.5 rounded disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  验证中
                </>
              ) : (
                <span>入局参断 →</span>
              )}
            </button>
          </form>

          <div className="mt-6 text-center font-serif text-xs text-[#8b8b8b] tracking-wider">
            未持密钥者，请寻主家授予
          </div>
        </div>

        <div className="text-center mt-8 font-serif text-xs text-[#8b8b8b] tracking-wider">
          仅供娱乐参考 · 融合理性数理
        </div>
      </div>
    </main>
  );
}

