"use client";

import { useState, useRef, useEffect } from "react";
import { API_BASE_URL } from '../lib/config';
import { useRouter } from "next/navigation";
import { Upload, Camera, Loader2 } from "lucide-react";

export default function UploadPage() {
  const [key, setKey] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const [birthdate, setBirthdate] = useState("");
  const [birthtime, setBirthtime] = useState("");
  const [calendarType, setCalendarType] = useState("solar");
  const [gender, setGender] = useState("male");
  const [name, setName] = useState("");
  

  useEffect(() => {
    const k = sessionStorage.getItem("FangWeiGe_key");
    if (!k) { router.push("/"); return; }
    setKey(k);
  }, [router]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      setFile(selected);
      setError(null);
      const reader = new FileReader();
      reader.onload = (r) => setPreview(r.target?.result as string);
      reader.readAsDataURL(selected);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const dropped = e.dataTransfer.files?.[0];
    if (dropped && dropped.type.startsWith("image/")) {
      setFile(dropped);
      setError(null);
      const reader = new FileReader();
      reader.onload = (r) => setPreview(r.target?.result as string);
      reader.readAsDataURL(dropped);
    } else { setError("请上传图片文件"); }
  };

  const canSubmit = file && birthdate && birthtime;

  const handleSubmit = async () => {
    if (!canSubmit || !key) return;
    setUploading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append("file", file!);
      formData.append("birthdate", birthdate);
      formData.append("birthtime", birthtime);
      formData.append("calendarType", calendarType);
      formData.append("gender", gender);
      formData.append("name", name);

      const res = await fetch(`${API_BASE_URL}/api/upload`, {
        method: "POST", headers: { "X-Key": key }, body: formData,
      });
      if (!res.ok) { const data = await res.json(); throw new Error(data.detail || "上传失败"); }
      const data = await res.json();
      sessionStorage.setItem("FangWeiGe_task", data.task_id);
      router.push(`/diagnosing-free/?id=${data.task_id}`);
    } catch (err: any) { setError(err.message); setUploading(false); }
  };

  return (
    <main className="ink-wash-bg min-h-screen relative flex flex-col">
      {/* 左侧竖排装饰文字 */}
      <div className="side-text-decoration left">
        天 地 定 位 · 山 泽 通 气
      </div>

      {/* 右侧竖排装饰文字 */}
      <div className="side-text-decoration right">
        雷 风 相 薄 · 水 火 不 相 射
      </div>

      {/* 顶部区域 */}
      <header className="relative z-10 px-6 py-8 max-w-2xl mx-auto w-full flex flex-col items-center">
        {/* 竖排装饰文字 */}
        <div className="vertical-text text-xs tracking-[0.4em] mb-3" style={{ color: 'rgba(107, 117, 83, 0.35)', height: '60px' }}>
          观物取象
        </div>

        {/* 小标题 */}
        <div className="flex items-center gap-3 animate-fade-in-up opacity-0" style={{ animationDelay: '0.1s' }}>
          <span className="seal text-xs">方位阁</span>
          <span className="font-serif text-xs tracking-[0.2em]" style={{ color: 'var(--ink-light)' }}>·</span>
          <span className="font-serif text-xs tracking-[0.2em]" style={{ color: 'var(--ink-light)' }}>八字参断</span>
        </div>

        {/* 更换密钥 */}
        <button
          onClick={() => { sessionStorage.removeItem("FangWeiGe_key"); router.push("/"); }}
          className="absolute right-6 top-8 font-serif text-xs hover:opacity-100 opacity-60 tracking-wider transition-opacity"
          style={{ color: 'var(--moss)' }}
        >
          更换密钥
        </button>
      </header>

      {/* 中央表单区域 */}
      <div className="flex-1 relative z-10 flex items-center justify-center px-6 py-4">
        <div className="max-w-md w-full">
          {/* 标题区 */}
          <div className="text-center mb-8">
            <div className="animate-fade-in-up opacity-0" style={{ animationDelay: '0.2s' }}>
              <div className="stamp-seal mb-4 text-sm">起 卦 参 断</div>
            </div>
            <h1
              className="font-serif text-2xl font-bold tracking-[0.15em] mb-3 animate-fade-in-up opacity-0"
              style={{ color: 'var(--ink)', animationDelay: '0.3s' }}
            >
              "请录工位与命主信息"
            </h1>
            <p
              className="font-serif text-xs tracking-[0.2em] animate-fade-in-up opacity-0"
              style={{ color: 'var(--ink-light)', animationDelay: '0.4s' }}
            >
              "工位为外境 · 八字为内主 · 二者参合方得真断"
            </p>
          </div>

          {/* 宣纸纹理卡片 */}
          <div className="card-ink p-8 card-float animate-fade-in-up opacity-0" style={{ animationDelay: '0.5s' }}>
            {/* 第一部分：命主信息 */}
            <div className="space-y-4">
              <div className="flex items-center gap-3 mb-1">
                <span className="font-serif text-sm tracking-[0.15em]" style={{ color: 'var(--moss-dark)' }}>壹</span>
                <span className="font-serif text-sm tracking-[0.15em]" style={{ color: 'var(--moss-dark)' }}>"命主信息"</span>
                <div className="flex-1 h-px" style={{ background: 'var(--border-light)' }}></div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-serif text-xs mb-1.5 block tracking-wider" style={{ color: 'var(--ink-faint)' }}>
                    姓名（可选）
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="王先生"
                    className="input-xuan w-full px-3 py-2.5 rounded text-sm"
                  />
                </div>
                <div>
                  <label className="font-serif text-xs mb-1.5 block tracking-wider" style={{ color: 'var(--ink-faint)' }}>
                    性别
                  </label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="input-xuan w-full px-3 py-2.5 rounded text-sm"
                  >
                    <option value="male">男（乾造）</option>
                    <option value="female">女（坤造）</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="font-serif text-xs tracking-wider" style={{ color: 'var(--ink-faint)' }}>
                      出生日期
                    </label>
                    <div className="flex gap-1 rounded-full p-0.5" style={{ background: 'rgba(250, 247, 239, 0.8)', border: '1px solid var(--border-light)' }}>
                      <button
                        type="button"
                        onClick={() => setCalendarType("solar")}
                        className={`text-xs px-2 py-0.5 rounded-full transition-all font-serif ${calendarType === "solar" ? "text-[#f5f1e8]" : ""}`}
                        style={calendarType === "solar" ? { background: 'var(--moss-dark)', letterSpacing: '0.1em' } : { color: 'var(--ink-faint)', letterSpacing: '0.1em' }}
                      >
                        阳历
                      </button>
                      <button
                        type="button"
                        onClick={() => setCalendarType("lunar")}
                        className={`text-xs px-2 py-0.5 rounded-full transition-all font-serif ${calendarType === "lunar" ? "text-[#f5f1e8]" : ""}`}
                        style={calendarType === "lunar" ? { background: 'var(--moss-dark)', letterSpacing: '0.1em' } : { color: 'var(--ink-faint)', letterSpacing: '0.1em' }}
                      >
                        农历
                      </button>
                    </div>
                  </div>
                  <input
                    type="date"
                    value={birthdate}
                    onChange={(e) => setBirthdate(e.target.value)}
                    className="input-xuan w-full px-3 py-2.5 rounded text-sm"
                  />
                  {calendarType === "lunar" && (
                    <p className="text-[10px] mt-1.5 font-serif tracking-wider" style={{ color: 'var(--gold)' }}>
                      * 农历日期请换算后再填
                    </p>
                  )}
                </div>
                <div>
                  <label className="font-serif text-xs mb-1.5 block tracking-wider" style={{ color: 'var(--ink-faint)' }}>
                    出生时辰
                  </label>
                  <select
                    value={birthtime}
                    onChange={(e) => setBirthtime(e.target.value)}
                    className="input-xuan w-full px-3 py-2.5 rounded text-sm"
                  >
                    <option value="">请选择</option>
                    <option value="23-01">子时 (23:00-01:00)</option>
                    <option value="01-03">丑时 (01:00-03:00)</option>
                    <option value="03-05">寅时 (03:00-05:00)</option>
                    <option value="05-07">卯时 (05:00-07:00)</option>
                    <option value="07-09">辰时 (07:00-09:00)</option>
                    <option value="09-11">巳时 (09:00-11:00)</option>
                    <option value="11-13">午时 (11:00-13:00)</option>
                    <option value="13-15">未时 (13:00-15:00)</option>
                    <option value="15-17">申时 (15:00-17:00)</option>
                    <option value="17-19">酉时 (17:00-19:00)</option>
                    <option value="19-21">戌时 (19:00-21:00)</option>
                    <option value="21-23">亥时 (21:00-23:00)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* 工笔线条分隔 */}
            <div className="brush-divider-ink my-6"></div>

            {/* 第二部分：工位照片 */}
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-4">
                <span className="font-serif text-sm tracking-[0.15em]" style={{ color: 'var(--moss-dark)' }}>贰</span>
                <span className="font-serif text-sm tracking-[0.15em]" style={{ color: 'var(--moss-dark)' }}>工位外境</span>
                <div className="flex-1 h-px" style={{ background: 'var(--border-light)' }}></div>
              </div>

              {/* 水墨风拖拽上传区域 */}
              <div
                onClick={() => fileInputRef.current?.click()}
                onDrop={handleDrop}
                onDragOver={(e) => e.preventDefault()}
                className="relative rounded-md p-8 text-center cursor-pointer transition-all"
                style={{
                  background: 'rgba(250, 247, 239, 0.6)',
                  border: '2px dashed var(--border)',
                }}
              >
                {preview ? (
                  <div className="relative inline-block">
                    <img
                      src={preview}
                      alt="预览"
                      className="max-h-52 mx-auto rounded object-cover"
                      style={{ border: '1px solid var(--border-light)' }}
                    />
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setFile(null);
                        setPreview(null);
                      }}
                      className="absolute -top-2 -right-2 w-7 h-7 flex items-center justify-center text-xs rounded-full transition-all"
                      style={{
                        background: 'var(--vermilion)',
                        color: 'var(--paper-pure)',
                        border: '2px solid var(--vermilion)',
                        boxShadow: 'inset 0 0 0 1px var(--paper-pure)',
                      }}
                    >
                      <span className="text-[10px]">✕</span>
                    </button>
                  </div>
                ) : (
                  <div className="py-6">
                    <div
                      className="w-14 h-14 mx-auto rounded-full flex items-center justify-center mb-3"
                      style={{
                        background: 'rgba(107, 117, 83, 0.08)',
                        border: '1px solid rgba(107, 117, 83, 0.15)',
                      }}
                    >
                      <Upload className="w-6 h-6" style={{ color: 'var(--moss)' }} />
                    </div>
                    <p className="font-serif text-sm tracking-[0.15em] mb-1" style={{ color: 'var(--moss-dark)' }}>
                      点击或拖拽上传工位照片
                    </p>
                    <p className="font-serif text-xs tracking-wider" style={{ color: 'var(--ink-faint)' }}>
                      光线充足 · 视角正对 · 细节清晰
                    </p>
                  </div>
                )}

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>
            </div>

            {/* 错误提示 */}
            {error && (
              <div
                className="text-sm font-serif px-4 py-2.5 rounded mb-4 animate-fade-in"
                style={{
                  color: 'var(--vermilion)',
                  background: 'rgba(184, 92, 58, 0.08)',
                  border: '1px solid rgba(184, 92, 58, 0.15)',
                  letterSpacing: '0.1em',
                }}
              >
                {error}
              </div>
            )}

            {/* 提交按钮 - 朱砂印章风格 */}
            <button
              onClick={handleSubmit}
              disabled={!canSubmit || uploading}
              className="btn-vermilion w-full py-4 rounded-md disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-2.5 text-base"
            >
              {uploading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>启判中...</span>
                </>
              ) : (
                <>
                  <Camera className="w-4 h-4" />
                  <span>启 局 参 断</span>
                </>
              )}
            </button>
          </div>

          {/* 底部装饰 */}
          <div className="text-center mt-8 animate-fade-in-up opacity-0" style={{ animationDelay: '0.7s' }}>
            <div className="brush-divider-ornate mb-5"></div>
            <div className="flex items-center justify-center gap-3">
              <div className="ink-dot"></div>
              <span className="font-serif text-xs tracking-[0.25em]" style={{ color: 'rgba(107, 117, 83, 0.45)' }}>
                一桌一境皆为易理
              </span>
              <div className="ink-dot"></div>
            </div>
          </div>
        </div>
      </div>

      {/* 底部留白 */}
      <div className="h-12 relative z-10"></div>
    </main>
  );
}
