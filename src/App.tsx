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
  RotateCcw,
  Upload,
  Camera,
  FileText,
  Download,
  ExternalLink,
  Search
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

interface SampleExercise {
  id: number;
  title: string;
  premises: string;
  conclusion: string;
  solution: string;
}

export default function App() {
  const [view, setView] = useState<'landing' | 'dashboard' | 'resources'>('landing');
  const [logicType, setLogicType] = useState<'propositional' | 'predicate'>('propositional');
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
  const [showOCRModal, setShowOCRModal] = useState(false);

  const sampleExercises: SampleExercise[] = [
    {
      id: 1,
      title: "Bài tập 1: Suy diễn cơ bản",
      premises: "p -> q\np",
      conclusion: "q",
      solution: "1. p -> q => ~p | q (CNF)\n2. p => p (CNF)\n3. Phủ định kết luận: ~q\n4. Hợp giải (~p | q) và p => q\n5. Hợp giải q và ~q => □ (Mâu thuẫn)\n=> Lập luận đúng."
    },
    {
      id: 2,
      title: "Bài tập 2: Phép tuyển và kéo theo",
      premises: "p | q\n~p",
      conclusion: "q",
      solution: "1. p | q => p | q (CNF)\n2. ~p => ~p (CNF)\n3. Phủ định kết luận: ~q\n4. Hợp giải (p | q) và ~p => q\n5. Hợp giải q và ~q => □ (Mâu thuẫn)\n=> Lập luận đúng."
    }
  ];

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

  const loadExercise = (ex: SampleExercise) => {
    setPremises(ex.premises);
    setConclusion(ex.conclusion);
    setView('dashboard');
    setResults(null);
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
          <div className="flex items-center gap-6">
            <div className="hidden items-center gap-6 md:flex">
              <button 
                onClick={() => setView('dashboard')}
                className={`text-sm font-medium transition-colors ${view === 'dashboard' ? 'text-indigo-600' : 'text-slate-600 hover:text-indigo-600'}`}
              >
                Dashboard
              </button>
              <button 
                onClick={() => setView('resources')}
                className={`text-sm font-medium transition-colors ${view === 'resources' ? 'text-indigo-600' : 'text-slate-600 hover:text-indigo-600'}`}
              >
                Tài nguyên
              </button>
            </div>
            <div className="flex items-center gap-4">
              <div className="hidden items-center gap-1 rounded-full bg-indigo-50 px-3 py-1 text-sm font-medium text-indigo-700 sm:flex">
                <History className="h-4 w-4" />
                Lượt còn lại: {usageCount}/20
              </div>
              <button 
                onClick={() => setView('dashboard')}
                className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-indigo-700 active:scale-95"
              >
                Bắt đầu
              </button>
            </div>
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
                Robinson Auto-Checker – Kiểm tra bài tập logic mệnh đề/vị từ
              </div>
              <h1 className="mb-6 text-4xl font-extrabold tracking-tight text-slate-900 sm:text-6xl">
                Tự động hóa <span className="text-indigo-600">Logic Robinson</span>
              </h1>
              <p className="mb-10 max-w-2xl text-lg text-slate-600 sm:text-xl">
                Hệ thống chuẩn hóa CNF và kiểm tra tính đúng đắn của lập luận. Minh bạch từng bước biến đổi và hợp giải.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <button 
                  onClick={() => setView('dashboard')}
                  className="flex items-center gap-2 rounded-xl bg-indigo-600 px-8 py-4 text-lg font-bold text-white shadow-lg shadow-indigo-200 transition-all hover:bg-indigo-700 hover:shadow-indigo-300 active:scale-95"
                >
                  <FileText className="h-5 w-5" /> Nhập công thức logic
                </button>
                <button 
                  onClick={() => setShowOCRModal(true)}
                  className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-8 py-4 text-lg font-bold text-slate-700 transition-all hover:bg-slate-50 active:scale-95"
                >
                  <Camera className="h-5 w-5" /> Tải/Chụp ảnh bài làm
                </button>
              </div>

              {/* Roadmap Preview */}
              <div className="mt-24 w-full max-w-4xl">
                <h2 className="mb-12 text-3xl font-bold text-slate-900">Lộ trình phát triển</h2>
                <div className="grid gap-6 sm:grid-cols-4">
                  {[
                    { phase: "GĐ 1", title: "Core Logic", status: "Hoàn thành" },
                    { phase: "GĐ 2", title: "Frontend & Limit", status: "Hiện tại" },
                    { phase: "GĐ 3", title: "OCR & Vị từ", status: "Sắp tới" },
                    { phase: "GĐ 4", title: "LMS & Community", status: "Tương lai" },
                  ].map((p, i) => (
                    <div key={i} className={`rounded-2xl border p-6 text-left ${i === 1 ? 'border-indigo-200 bg-indigo-50/50 ring-1 ring-indigo-200' : 'border-slate-100 bg-white'}`}>
                      <div className="mb-2 text-xs font-bold uppercase tracking-wider text-indigo-600">{p.phase}</div>
                      <h3 className="mb-1 font-bold text-slate-900">{p.title}</h3>
                      <div className="text-xs text-slate-500">{p.status}</div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          ) : view === 'dashboard' ? (
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
                  <div className="mb-6 flex items-center justify-between">
                    <h2 className="flex items-center gap-2 text-xl font-bold text-slate-900">
                      <Play className="h-5 w-5 text-indigo-600" />
                      Nhập dữ liệu
                    </h2>
                    <div className="flex rounded-lg bg-slate-100 p-1">
                      <button 
                        onClick={() => setLogicType('propositional')}
                        className={`rounded-md px-3 py-1 text-xs font-bold transition-all ${logicType === 'propositional' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500'}`}
                      >
                        Mệnh đề
                      </button>
                      <button 
                        onClick={() => setLogicType('predicate')}
                        className={`rounded-md px-3 py-1 text-xs font-bold transition-all ${logicType === 'predicate' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500'}`}
                      >
                        Vị từ
                      </button>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="mb-2 block text-sm font-semibold text-slate-700">
                        Tập công thức ban đầu (Giả thiết)
                      </label>
                      <textarea 
                        value={premises}
                        onChange={(e) => setPremises(e.target.value)}
                        placeholder="Ví dụ:&#10;P & Q -> R&#10;~R"
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
                        placeholder="Ví dụ: ~(P & Q)"
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
                        {isProcessing ? "Đang xử lý..." : "Chuẩn hóa & Kiểm tra"}
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
                          Bước 1: Chuẩn hóa CNF
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
                          Bước 2: Hợp giải Robinson
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
          ) : (
            <motion.div
              key="resources"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-slate-900">Tài nguyên học tập</h1>
                  <p className="text-slate-600">Danh sách bài tập mẫu và lời giải chi tiết giúp bạn luyện tập.</p>
                </div>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input 
                    type="text" 
                    placeholder="Tìm kiếm bài tập..." 
                    className="rounded-lg border border-slate-200 bg-white pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>
              </div>

              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {sampleExercises.map((ex) => (
                  <div key={ex.id} className="flex flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:shadow-md">
                    <h3 className="mb-4 text-lg font-bold text-slate-900">{ex.title}</h3>
                    <div className="mb-6 flex-1 space-y-4">
                      <div className="rounded-lg bg-slate-50 p-3">
                        <div className="text-xs font-bold uppercase text-slate-400">Tiền đề</div>
                        <pre className="mt-1 font-mono text-sm text-slate-700">{ex.premises}</pre>
                      </div>
                      <div className="rounded-lg bg-slate-50 p-3">
                        <div className="text-xs font-bold uppercase text-slate-400">Kết luận</div>
                        <pre className="mt-1 font-mono text-sm text-slate-700">{ex.conclusion}</pre>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => loadExercise(ex)}
                        className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-indigo-600 py-2.5 text-sm font-bold text-white transition-all hover:bg-indigo-700"
                      >
                        Thử giải <ArrowRight className="h-4 w-4" />
                      </button>
                      <button className="flex items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-slate-600 transition-all hover:bg-slate-50">
                        <Download className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
                
                {/* Placeholder for more resources */}
                <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/50 p-6 text-center">
                  <div className="mb-2 rounded-full bg-white p-4 shadow-sm">
                    <ExternalLink className="h-6 w-6 text-slate-400" />
                  </div>
                  <p className="text-sm font-medium text-slate-500">Đang cập nhật thêm bài tập...</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* OCR Modal Placeholder */}
      {showOCRModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-lg rounded-2xl bg-white p-8 shadow-2xl"
          >
            <div className="mb-6 flex items-center justify-between">
              <h3 className="text-xl font-bold text-slate-900">Tải ảnh bài làm (OCR)</h3>
              <button onClick={() => setShowOCRModal(false)} className="text-slate-400 hover:text-slate-600">
                <RotateCcw className="h-5 w-5" />
              </button>
            </div>
            
            <div className="mb-8 flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-indigo-100 bg-indigo-50/30 py-12 text-center">
              <div className="mb-4 rounded-full bg-white p-4 text-indigo-600 shadow-sm">
                <Upload className="h-8 w-8" />
              </div>
              <p className="mb-2 font-bold text-slate-900">Kéo thả ảnh vào đây</p>
              <p className="text-sm text-slate-500">Hỗ trợ định dạng JPG, PNG, PDF (Tối đa 5MB)</p>
              <button className="mt-6 rounded-lg bg-indigo-600 px-6 py-2 text-sm font-bold text-white hover:bg-indigo-700">
                Chọn file từ máy tính
              </button>
            </div>

            <div className="flex items-center gap-3 rounded-xl bg-amber-50 p-4 text-sm text-amber-700">
              <Info className="h-5 w-5 shrink-0" />
              <p>Tính năng OCR đang trong quá trình thử nghiệm (Giai đoạn 3). Kết quả có thể chưa chính xác tuyệt đối.</p>
            </div>

            <div className="mt-8 flex gap-3">
              <button 
                onClick={() => setShowOCRModal(false)}
                className="flex-1 rounded-xl border border-slate-200 bg-white py-3 font-bold text-slate-600 hover:bg-slate-50"
              >
                Hủy bỏ
              </button>
              <button 
                disabled
                className="flex-1 rounded-xl bg-indigo-600 py-3 font-bold text-white opacity-50 cursor-not-allowed"
              >
                Phân tích & Kiểm tra
              </button>
            </div>
          </motion.div>
        </div>
      )}

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
