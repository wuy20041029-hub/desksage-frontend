"use client";

import { useState, useRef, useEffect } from "react";
import { API_BASE_URL } from '../lib/config';
import { useRouter } from "next/navigation";
import { Upload, Camera, Loader2, Compass } from "lucide-react";

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
  const [retestToken, setRetestToken] = useState("");

  useEffect(() => {
    const k = sessionStorage.getItem("fangweige_key");
    if (!k) { router.push("/"); return; }
    setKey(k);
    const rt = sessionStorage.getItem("fangweige_retest");
    if (rt) setRetestToken(rt);
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
      if (retestToken) {
        formData.append("retest_token", retestToken);
        sessionStorage.removeItem("fangweige_retest");
      }
      const res = await fetch(`${API_BASE_URL}/api/upload`, {
        method: "POST", headers: { "X-Key": key }, body: formData,
      });
      if (!res.ok) { const data = await res.json(); throw new Error(data.detail || "上传失败"); }
      const data = await res.json();
      sessionStorage.setItem("fangweige_task", data.task_id);
      router.push(`/diagnosing-free/${data.task_id}`);
    } catch (err: any) { setError(err.message); setUploading(false); }
  };

  return (
    <main className="min-h-screen paper-bg flex flex-col">
      <header className="px-6 py-4 max-w-3xl mx-auto w-full flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-[#4a5339] rounded flex items-center justify-center">
            <Compass className="w-4 h-4 text-[#f5f1e8]" />
          </div>
          <span className="font-serif font-bold text-[#2c2c2c] tracking-wider">方位阁</span>
        </div>
        <button onClick={() => { sessionStorage.removeItem("fangweige_key"); router.push("/"); }} className="font-serif text-xs text-[#8b8b8b] hover:text-[#4a5339] tracking-wider">
          更换密钥
        </button>
      </header>

      <div className="flex-1 flex items-center justify-center px-6 py-6">
        <div className="max-w-md w-full">
          <div className="text-center mb-6">
            {retestToken && (
              <div className="mb-3 inline-flex items-center gap-2 px-3 py-1.5 bg-[#6b7553]/15 rounded-full border border-[#6b7553]/40">
                <span className="font-serif text-xs text-[#4a5339] tracking-wider">复测 · 已改造后再测，气场可见改善</span>
              </div>
            )}
            <div className="seal mb-3">起卦参断</div>
            <h1 className="font-serif text-2xl font-bold text-[#2c2c2c] tracking-wider mb-2">请录工位与命主信息</h1>
            <p className="font-serif text-xs text-[#5a5a5a] tracking-wide">工位为外境 · 八字为内主 · 二者参合方得真断</p>
          </div>

          <div className="card-paper p-6 shadow-sm space-y-5">
            <div className="space-y-3">
              <div className="font-serif text-sm text-[#4a5339] tracking-wider mb-2">一 · 命主信息</div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-serif text-xs text-[#8b8b8b] mb-1 block tracking-wider">姓名（可选）</label>
                  <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="王先生" className="input-paper w-full px-3 py-2.5 rounded text-sm" />
                </div>
                <div>
                  <label className="font-serif text-xs text-[#8b8b8b] mb-1 block tracking-wider">性别</label>
                  <select value={gender} onChange={(e) => setGender(e.target.value)} className="input-paper w-full px-3 py-2.5 rounded text-sm">
                    <option value="male">男（乾造）</option>
                    <option value="female">女（坤造）</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-serif text-xs text-[#8b8b8b] tracking-wider">出生日期</label>
                    <div className="flex gap-1 bg-[#faf7ef] border border-[#d4cdb8] rounded-full p-0.5">
                      <button type="button" onClick={() => setCalendarType("solar")} className={`text-xs px-2 py-0.5 rounded-full transition-all ${calendarType === "solar" ? "bg-[#4a5339] text-[#f5f1e8]" : "text-[#8b8b8b]"}`}>阳历</button>
                      <button type="button" onClick={() => setCalendarType("lunar")} className={`text-xs px-2 py-0.5 rounded-full transition-all ${calendarType === "lunar" ? "bg-[#4a5339] text-[#f5f1e8]" : "text-[#8b8b8b]"}`}>农历</button>
                    </div>
                  </div>
                  <input type="date" value={birthdate} onChange={(e) => setBirthdate(e.target.value)} className="input-paper w-full px-3 py-2.5 rounded text-sm" />
                  {calendarType === "lunar" && <p className="text-[10px] text-[#8b6f47] mt-1 font-serif tracking-wide">* 农历日期请换算后再填</p>}
                </div>
                <div>
                  <label className="font-serif text-xs text-[#8b8b8b] mb-1 block tracking-wider">出生时辰</label>
                  <select value={birthtime} onChange={(e) => setBirthtime(e.target.value)} className="input-paper w-full px-3 py-2.5 rounded text-sm">
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

            <div className="flex items-center gap-3 py-2">
              <div className="flex-1 h-px bg-[#d4cdb8]"></div>
              <span className="font-serif text-xs text-[#8b8b8b] tracking-widest">二 · 工位外境</span>
              <div className="flex-1 h-px bg-[#d4cdb8]"></div>
            </div>

            <div onClick={() => fileInputRef.current?.click()} onDrop={handleDrop} onDragOver={(e) => e.preventDefault()}
              className="border-2 border-dashed border-[#d4cdb8] hover:border-[#6b7553] hover:bg-[#6b7553]/5 rounded p-6 text-center cursor-pointer transition-all bg-[#faf7ef]">
              {preview ? (
                <div className="relative">
                  <img src={preview} alt="预览" className="max-h-48 mx-auto rounded object-cover" />
                  <button onClick={(e) => { e.stopPropagation(); setFile(null); setPreview(null); }} className="absolute top-2 right-2 bg-[#b85c3a] text-white rounded-full w-7 h-7 flex items-center justify-center text-xs hover:bg-[#a04a2a]">✕</button>
                </div>
              ) : (
                <div className="py-4">
                  <div className="w-12 h-12 mx-auto bg-[#6b7553]/10 rounded-full flex items-center justify-center mb-2">
                    <Upload className="w-6 h-6 text-[#6b7553]" />
                  </div>
                  <p className="font-serif text-sm text-[#4a5339] tracking-wider">点击或拖拽工位照片</p>
                  <p className="font-serif text-xs text-[#8b8b8b] mt-1">光线充足 · 视角正对</p>
                </div>
              )}
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
            </div>

            {error && <div className="text-[#b85c3a] text-sm font-serif px-3 py-2 bg-[#b85c3a]/10 rounded">{error}</div>}

            <button onClick={handleSubmit} disabled={!canSubmit || uploading} className="btn-ink w-full py-3.5 rounded disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2">
              {uploading ? <><Loader2 className="w-4 h-4 animate-spin" />启判中</> : <><Camera className="w-4 h-4" /><span>启 局 参 断</span></>}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}

