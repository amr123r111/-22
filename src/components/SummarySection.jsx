import { useState } from 'react';
import { generateSummary } from '../utils/gemini';
import { Loader2, ScrollText, Sparkles, BookOpen, AlertCircle } from 'lucide-react';

export default function SummarySection({ fileName, onBack }) {
  const [topic, setTopic] = useState('');
  const [state, setState] = useState('config'); // config, loading, result
  const [summaryData, setSummaryData] = useState([]);

  const handleStart = async () => {
    setState('loading');
    try {
      const data = await generateSummary(fileName, topic || "المنهج كاملاً");
      setSummaryData(data);
      setState('result');
    } catch (error) {
      console.error(error);
      alert('حدث خطأ أثناء استخراج التلخيص. تأكد من إعداد مفتاح API بشكل صحيح.');
      setState('config');
    }
  };

  if (state === 'config' || state === 'loading') {
    return (
      <div className="max-w-2xl mx-auto w-full animate-in fade-in pt-8">
        <h2 className="text-3xl font-bold mb-8 flex items-center gap-3">
          <ScrollText className="text-primary" size={32} />
          التلخيص الذكي
        </h2>

        {state === 'loading' ? (
          <div className="flex flex-col items-center justify-center p-20 bg-surface rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800">
            <Loader2 className="w-16 h-16 text-primary animate-spin mb-6" />
            <h3 className="text-xl font-bold">جاري قراءة المنهج واستخراج النقاط المهمة...</h3>
          </div>
        ) : (
          <div className="bg-surface p-8 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 space-y-6">
            <div>
              <label className="block text-sm font-bold mb-2">الدرس أو الوحدة المراد تلخيصها</label>
              <input 
                type="text" 
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="مثال: الخلية النباتية، الفصل الثاني..."
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-4 focus:ring-2 focus:ring-primary focus:outline-none"
              />
            </div>

            <button onClick={handleStart} className="w-full bg-gradient-to-r from-primary to-primary-dark text-white py-4 rounded-xl font-bold text-lg shadow-md hover:shadow-lg transition mt-4 flex items-center justify-center gap-2">
              <Sparkles size={20} />
              توليد التلخيص الآن
            </button>
          </div>
        )}
      </div>
    );
  }

  // Result view
  return (
    <div className="max-w-4xl mx-auto w-full animate-in fade-in slide-in-from-bottom pt-4 pb-12">
      <div className="flex items-center gap-4 mb-8">
        <div className="bg-primary/20 p-3 rounded-full">
          <Sparkles className="text-primary" size={32} />
        </div>
        <div>
          <h2 className="text-3xl font-bold">الملخص الذكي</h2>
          <p className="text-text-secondary mt-1">الموضوع المستهدف: {topic || "المنهج كاملاً"}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {summaryData.map((item, idx) => {
          let IconType, badgeColor, badgeLabel;
          
          if (item.type === 'RULE') {
            IconType = AlertCircle;
            badgeColor = 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400 border-pink-200 dark:border-pink-800';
            badgeLabel = 'قاعدة هامة';
          } else if (item.type === 'EXAMPLE') {
            IconType = ScrollText;
            badgeColor = 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 border-orange-200 dark:border-orange-800';
            badgeLabel = 'مثال توضيحي';
          } else {
            IconType = BookOpen;
            badgeColor = 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800';
            badgeLabel = 'نقطة محورية';
          }

          return (
            <div key={idx} className="bg-surface p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-3 mb-4">
                <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${badgeColor}`}>
                  <IconType size={14} />
                  {badgeLabel}
                </span>
              </div>
              <h3 className="text-xl font-bold mb-3">{item.title}</h3>
              <p className="text-text-secondary leading-relaxed">{item.content}</p>
            </div>
          );
        })}
      </div>

      <button onClick={onBack} className="w-full mt-8 bg-surface border-2 border-slate-200 dark:border-slate-700 py-4 rounded-xl font-bold text-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition">
        العودة للرئيسية
      </button>
    </div>
  );
}
