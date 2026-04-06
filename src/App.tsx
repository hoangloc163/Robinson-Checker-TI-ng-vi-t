/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Calculator, 
  BookOpen, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight, 
  History, 
  Info,
  ChevronRight,
  Play,
  RotateCcw
} from 'lucide-react';

// Types based on PRD
interface Step {
  id: number;
  description: string;
  formula: string;
}

interface ResolutionStep {
  id: number;
  clause1: string;
  clause2: string;
  result: string;
}

export default function App() {
  const [view, setView] = useState<'landing' | 'dashboard'>('landing');
  const [premises, setPremises] = useState<string>('');
  const [conclusion, setConclusion] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [results, setResults] = useState<{
    cnfSteps: Step[];
    resolutionSteps: ResolutionStep[];
    isValid: boolean;
  } | null>(null);
  const [usageCount, setUsageCount] = useState(20);
  const [error, setError] = useState<string | null>(null);

  // Mock usage count logic
  useEffect(() => {
    const savedCount = localStorage.getItem('robinson_usage_count');
    if (savedCount) {
      setUsageCount(parseInt(savedCount));
    }
  }, []);

  const handleCheck = () => {
    if (usageCount <= 0) {
      setError("Bạn đã hết lượt dùng trong ngày. Vui lòng quay lại sau!");
      return;
    }

    if (!premises.trim() || !conclusion.trim()) {
      setError("Vui lòng nhập đầy đủ tiền đề và kết luận.");
      return;
    }

    setIsProcessing(true);
    setError(null);

    // Simulate API processing
    setTimeout(() => {
      setResults({
        cnfSteps: [
          { id: 1, description: "Loại bỏ phép kéo theo: p -> q", formula: "~p | q" },
          { id: 2, description: "Phủ định kết luận: q", formula: "~q" }
        ],
        resolutionSteps: [
          { id: 1, clause1: "{~p, q}", clause2: "{~q}", result: "{~p}" },
          { id: 2, clause1: "{~p}", clause2: "{p}", result: "□ (Mâu thuẫn)" }
        ],
        isValid: true
      });
      setIsProcessing(false);
      const newCount = usageCount - 1;
      setUsageCount(newCount);
      localStorage.setItem('robinson_usage_count', newCount.toString());
    }, 1500);
  };

  const reset = () => {
    setPremises('');
    setConclusion('');
    setResults(null);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b border-slate-200 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 font-bold text-indigo-600 cursor-pointer" onClick={() => setView('landing')}>
            <Calculator className="h-6 w-6" />
            <span className="text-xl tracking-tight">Robinson Auto-Checker</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden items-center gap-1 rounded-full bg-indigo-50 px-3 py-1 text-sm font-medium text-indigo-700 sm:flex">
              <History className="h-4 w-4" />
              Lượt còn lại: {usageCount}/20
            </div>
            <button 
              onClick={() => setView(view === 'landing' ? 'dashboard' : 'landing')}
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-indigo-700 active:scale-95"
            >
              {view === 'landing' ? 'Bắt đầu ngay' : 'Giới thiệu'}
            </button>
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <AnimatePresence mode="wait">
          {view === 'landing' ? (
            <motion.div
              key="landing"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex flex-col items-center text-center py-12 sm:py-20"
            >
              <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-indigo-100 px-4 py-1.5 text-sm font-medium text-indigo-700">
                <BookOpen className="h-4 w-4" />
                Công cụ hỗ trợ học tập Logic Mệnh đề
              </div>
              <h1 className="mb-6 text-4xl font-extrabold tracking-tight text-slate-900 sm:text-6xl">
                Kiểm tra logic <span className="text-indigo-600">tự động</span> & <span className="text-indigo-600">chi tiết</span>
              </h1>
              <p className="mb-10 max-w-2xl text-lg text-slate-600 sm:text-xl">
                Giúp sinh viên đối chiếu bài làm hợp giải Robinson. Hệ thống hiển thị từng bước chuẩn hóa CNF và tìm mâu thuẫn một cách minh bạch.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <button 
                  onClick={() => setView('dashboard')}
                  className="flex items-center gap-2 rounded-xl bg-indigo-600 px-8 py-4 text-lg font-bold text-white shadow-lg shadow-indigo-200 transition-all hover:bg-indigo-700 hover:shadow-indigo-300 active:scale-95"
                >
                  Thử ngay bây giờ <ArrowRight className="h-5 w-5" />
                </button>
                <button className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-8 py-4 text-lg font-bold text-slate-700 transition-all hover:bg-slate-50 active:scale-95">
                  Xem tài liệu <Info className="h-5 w-5" />
                </button>
              </div>

              {/* Features Grid */}
              <div className="mt-24 grid gap-8 sm:grid-cols-3">
                {[
                  { title: "Chuẩn hóa CNF", desc: "Biến đổi công thức sang dạng chuẩn hội với giải thích từng bước.", icon: CheckCircle2 },
                  { title: "Hợp giải Robinson", desc: "Tự động tìm mâu thuẫn và xuất dãy hợp giải chi tiết.", icon: Calculator },
                  { title: "Hỗ trợ học tập", desc: "Giao diện trực quan, giúp sinh viên nắm vững kiến thức nền tảng.", icon: BookOpen },
                ].map((f, i) => (
                  <div key={i} className="rounded-2xl border border-slate-100 bg-white p-8 shadow-sm transition-all hover:shadow-md">
                    <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                      <f.icon className="h-6 w-6" />
                    </div>
                    <h3 className="mb-2 text-xl font-bold text-slate-900">{f.title}</h3>
                    <p className="text-slate-600">{f.desc}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="grid gap-8 lg:grid-cols-12"
            >
              {/* Input Section */}
              <div className="lg:col-span-5">
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                  <h2 className="mb-6 flex items-center gap-2 text-xl font-bold text-slate-900">
                    <Play className="h-5 w-5 text-indigo-600" />
                    Nhập dữ liệu bài toán
                  </h2>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="mb-2 block text-sm font-semibold text-slate-700">
                        Danh sách tiền đề (Mỗi dòng một công thức)
                      </label>
                      <textarea 
                        value={premises}
                        onChange={(e) => setPremises(e.target.value)}
                        placeholder="Ví dụ:&#10;p -> q&#10;p"
                        className="h-40 w-full rounded-xl border border-slate-200 bg-slate-50 p-4 font-mono text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                      />
                    </div>
                    
                    <div>
                      <label className="mb-2 block text-sm font-semibold text-slate-700">
                        Kết luận
                      </label>
                      <input 
                        type="text"
                        value={conclusion}
                        onChange={(e) => setConclusion(e.target.value)}
                        placeholder="Ví dụ: q"
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 p-4 font-mono text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                      />
                    </div>

                    <div className="rounded-lg bg-amber-50 p-4 text-xs text-amber-700">
                      <p className="font-bold mb-1">Ký hiệu hỗ trợ:</p>
                      <div className="grid grid-cols-2 gap-2">
                        <span>~ : Phủ định (NOT)</span>
                        <span>& : Hội (AND)</span>
                        <span>| : Tuyển (OR)</span>
                        <span>-&gt; : Kéo theo</span>
                        <span>&lt;-&gt; : Tương đương</span>
                      </div>
                    </div>

                    {error && (
                      <div className="flex items-center gap-2 rounded-lg bg-red-50 p-4 text-sm font-medium text-red-700">
                        <AlertCircle className="h-4 w-4 shrink-0" />
                        {error}
                      </div>
                    )}

                    <div className="flex gap-3 pt-2">
                      <button 
                        onClick={handleCheck}
                        disabled={isProcessing}
                        className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-indigo-600 py-3 font-bold text-white transition-all hover:bg-indigo-700 disabled:opacity-50"
                      >
                        {isProcessing ? "Đang xử lý..." : "Kiểm tra ngay"}
                      </button>
                      <button 
                        onClick={reset}
                        className="flex items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-600 transition-all hover:bg-slate-50"
                        title="Làm mới"
                      >
                        <RotateCcw className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Results Section */}
              <div className="lg:col-span-7">
                <div className="h-full rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                  <h2 className="mb-6 flex items-center gap-2 text-xl font-bold text-slate-900">
                    <CheckCircle2 className="h-5 w-5 text-indigo-600" />
                    Kết quả chi tiết
                  </h2>

                  {!results && !isProcessing ? (
                    <div className="flex h-[400px] flex-col items-center justify-center text-center text-slate-400">
                      <div className="mb-4 rounded-full bg-slate-50 p-6">
                        <Calculator className="h-12 w-12" />
                      </div>
                      <p>Kết quả sẽ hiển thị tại đây sau khi bạn nhấn "Kiểm tra"</p>
                    </div>
                  ) : isProcessing ? (
                    <div className="flex h-[400px] flex-col items-center justify-center text-center">
                      <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
                      <p className="text-slate-600">Hệ thống đang phân tích logic...</p>
                    </div>
                  ) : (
                    <div className="space-y-8">
                      {/* Status Header */}
                      <div className={`rounded-xl p-4 ${results?.isValid ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
                        <div className="flex items-center gap-2 font-bold">
                          {results?.isValid ? <CheckCircle2 className="h-5 w-5" /> : <AlertCircle className="h-5 w-5" />}
                          Kết luận: {results?.isValid ? "Lập luận ĐÚNG" : "Lập luận SAI"}
                        </div>
                        <p className="mt-1 text-sm opacity-90">
                          {results?.isValid 
                            ? "Tìm thấy mâu thuẫn trong tập hợp tiền đề và phủ định kết luận." 
                            : "Không tìm thấy mâu thuẫn sau khi thực hiện hợp giải."}
                        </p>
                      </div>

                      {/* CNF Steps */}
                      <div>
                        <h3 className="mb-3 flex items-center gap-2 font-bold text-slate-800">
                          <ChevronRight className="h-4 w-4 text-indigo-600" />
                          1. Chuẩn hóa CNF
                        </h3>
                        <div className="space-y-2">
                          {results?.cnfSteps.map((step) => (
                            <div key={step.id} className="rounded-lg border border-slate-100 bg-slate-50 p-3">
                              <div className="text-xs font-medium text-slate-500 uppercase tracking-wider">{step.description}</div>
                              <div className="mt-1 font-mono text-sm text-indigo-700">{step.formula}</div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Resolution Steps */}
                      <div>
                        <h3 className="mb-3 flex items-center gap-2 font-bold text-slate-800">
                          <ChevronRight className="h-4 w-4 text-indigo-600" />
                          2. Dãy hợp giải Robinson
                        </h3>
                        <div className="overflow-hidden rounded-xl border border-slate-200">
                          <table className="w-full text-left text-sm">
                            <thead className="bg-slate-50 text-slate-600">
                              <tr>
                                <th className="px-4 py-2 font-semibold">Bước</th>
                                <th className="px-4 py-2 font-semibold">Mệnh đề 1</th>
                                <th className="px-4 py-2 font-semibold">Mệnh đề 2</th>
                                <th className="px-4 py-2 font-semibold">Kết quả</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                              {results?.resolutionSteps.map((step) => (
                                <tr key={step.id} className="hover:bg-slate-50/50">
                                  <td className="px-4 py-3 font-medium text-slate-400">{step.id}</td>
                                  <td className="px-4 py-3 font-mono text-slate-700">{step.clause1}</td>
                                  <td className="px-4 py-3 font-mono text-slate-700">{step.clause2}</td>
                                  <td className="px-4 py-3 font-mono font-bold text-indigo-600">{step.result}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200 bg-white py-8">
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <p className="text-sm text-slate-500">
            © 2026 Robinson Auto-Checker. Công cụ hỗ trợ giáo dục EdTech.
          </p>
        </div>
      </footer>
    </div>
  );
}
