"use client";

import { useEffect, useState } from "react";
import { API_BASE_URL } from '../../lib/config';
import { useParams, useRouter } from "next/navigation";
import { CheckCircle, Loader2, Circle, Compass } from "lucide-react";

interface Step {
  name: string;
  label: string;
  icon: string;
  status: string;
}

export default function DiagnosingPage() {
  const params = useParams();
  const router = useRouter();
  const taskId = params.id as string;
  const [status, setStatus] = useState<any>(null);

  useEffect(() => {
    const key = sessionStorage.getItem("fangweige_key");
    if (!key) { router.push("/"); return; }
    const poll = setInterval(async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/status/${taskId}`);
        if (!res.ok) return;
        const data = await res.json();
        setStatus(data);
        if (data.status === "completed") {
          clearInterval(poll);
          setTimeout(() => router.push(`/report/${taskId}`), 1200);
        }
      } catch {}
    }, 1500);
    return () => clearInterval(poll);
  }, [taskId, router]);

  return (
    <main className="min-h-screen paper-bg flex items-center justify-center px-6">
      <div className="max-w-sm w-full">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-[#4a5339] rounded mb-3">
            <Loader2 className="w-7 h-7 text-[#f5f1e8] animate-spin" />
          </div>
          <div className="seal mb-3">易理推演中</div>
          <h1 className="font-serif text-2xl font-bold text-[#2c2c2c] tracking-wider">
            八字合局 · 启判中
          </h1>
          <p className="font-serif text-sm text-[#5a5a5a] mt-2 tracking-wider">
            {status?.current_step ?? "准备起卦..."}
          </p>
        </div>

        <div className="card-paper p-6 shadow-sm">
          <div className="mb-5">
            <div className="h-1 bg-[#d4cdb8] rounded-full overflow-hidden">
              <div className="h-full ink-progress rounded-full transition-all duration-700" style={{ width: `${status?.progress ?? 0}%` }} />
            </div>
            <div className="flex justify-between mt-2 font-serif text-xs text-[#8b8b8b]">
              <span>推演进度</span>
              <span>{status?.progress ?? 0}%</span>
            </div>
          </div>

          <div className="space-y-4">
            {status?.steps?.map((step: Step) => (
              <div key={step.name} className="flex items-center gap-3">
                <span className="text-xl w-8 text-center">{step.icon}</span>
                <div className="flex-1">
                  <div className="font-serif font-medium text-[#2c2c2c]">{step.label}</div>
                  <div className="font-serif text-xs text-[#8b8b8b]">
                    {step.status === "completed" ? "已完成" : step.status === "running" ? "推演中..." : "等待起算"}
                  </div>
                </div>
                {step.status === "completed" ? <CheckCircle className="w-5 h-5 text-[#6b7553]" /> :
                 step.status === "running" ? <Loader2 className="w-5 h-5 text-[#4a5339] animate-spin" /> :
                 <Circle className="w-5 h-5 text-[#d4cdb8]" />}
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
