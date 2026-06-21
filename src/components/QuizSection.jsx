import { useState, useEffect } from 'react';
import { generateQuiz } from '../utils/gemini';
import { Clock, PlayCircle, Loader2, CheckCircle2, XCircle, ChevronRight, Check } from 'lucide-react';

export default function QuizSection({ fileName, onBack }) {
  const [topic, setTopic] = useState('');
  const [numQuestions, setNumQuestions] = useState(5);
  const [durationMins, setDurationMins] = useState(5);
  const [quizState, setQuizState] = useState('config'); // config, loading, active, result
  const [questions, setQuestions] = useState([]);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);

  // Timer Effect
  useEffect(() => {
    let timer;
    if (quizState === 'active' && timeLeft > 0) {
      timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    } else if (quizState === 'active' && timeLeft === 0) {
      setQuizState('result'); // Auto-submit when time is up
    }
    return () => clearInterval(timer);
  }, [quizState, timeLeft]);

  const handleStart = async () => {
    setQuizState('loading');
    try {
      const data = await generateQuiz(fileName, topic || "المنهج كاملاً", numQuestions);
      setQuestions(data);
      setTimeLeft(durationMins * 60);
      setQuizState('active');
    } catch (error) {
      console.error(error);
      alert('حدث خطأ أثناء استخراج الأسئلة. تأكد من إعداد مفتاح API بشكل صحيح.');
      setQuizState('config');
    }
  };

  const handleOptionSelect = (optIndex) => {
    setUserAnswers({ ...userAnswers, [currentQIndex]: optIndex });
  };

  const handleNext = () => {
    if (currentQIndex < questions.length - 1) {
      setCurrentQIndex(currentQIndex + 1);
    } else {
      setQuizState('result');
    }
  };

  const calculateScore = () => {
    let score = 0;
    questions.forEach((q, i) => {
      if (userAnswers[i] === q.correctAnswerIndex) score++;
    });
    return score;
  };

  if (quizState === 'config' || quizState === 'loading') {
    return (
      <div className="max-w-2xl mx-auto w-full animate-in fade-in pt-8">
        <h2 className="text-3xl font-bold mb-8 flex items-center gap-3">
          <PlayCircle className="text-primary" size={32} />
          إعداد الاختبار الذكي
        </h2>

        {quizState === 'loading' ? (
          <div className="flex flex-col items-center justify-center p-20 bg-surface rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800">
            <Loader2 className="w-16 h-16 text-primary animate-spin mb-6" />
            <h3 className="text-xl font-bold">جاري استخراج الأسئلة وتوليد الاختبار...</h3>
          </div>
        ) : (
          <div className="bg-surface p-8 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 space-y-6">
            <div>
              <label className="block text-sm font-bold mb-2">الدرس أو الوحدة المستهدفة</label>
              <input 
                type="text" 
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="مثال: الفصل الأول، قوانين نيوتن..."
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-4 focus:ring-2 focus:ring-primary focus:outline-none"
              />
            </div>
            
            <div>
              <label className="block text-sm font-bold mb-2">عدد الأسئلة: {numQuestions}</label>
              <input 
                type="range" min="3" max="20" step="1"
                value={numQuestions} onChange={(e) => setNumQuestions(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-primary"
              />
            </div>

            <div>
              <label className="block text-sm font-bold mb-2">مدة الاختبار: {durationMins} دقائق</label>
              <input 
                type="range" min="1" max="30" step="1"
                value={durationMins} onChange={(e) => setDurationMins(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-primary"
              />
            </div>

            <button onClick={handleStart} className="w-full bg-primary text-white py-4 rounded-xl font-bold text-lg shadow-md hover:bg-primary-dark transition mt-4">
              بدء الاختبار الآن
            </button>
          </div>
        )}
      </div>
    );
  }

  if (quizState === 'active') {
    const q = questions[currentQIndex];
    const mins = Math.floor(timeLeft / 60).toString().padStart(2, '0');
    const secs = (timeLeft % 60).toString().padStart(2, '0');

    return (
      <div className="max-w-3xl mx-auto w-full animate-in slide-in-from-right pt-4">
        <div className="flex justify-between items-center bg-surface p-4 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 mb-6">
          <div className="font-bold text-text-secondary">
            السؤال {currentQIndex + 1} من {questions.length}
          </div>
          <div className={`flex items-center gap-2 font-mono text-xl font-bold ${timeLeft < 60 ? 'text-red-500 animate-pulse' : 'text-primary'}`}>
            <Clock /> {mins}:{secs}
          </div>
        </div>

        <div className="bg-surface p-8 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800">
          <h3 className="text-2xl font-bold mb-8 leading-tight">{q?.question}</h3>
          
          <div className="space-y-3">
            {q?.options.map((opt, i) => (
              <button 
                key={i}
                onClick={() => handleOptionSelect(i)}
                className={`w-full text-right p-4 rounded-xl border-2 transition-all flex items-center justify-between
                  ${userAnswers[currentQIndex] === i 
                    ? 'border-primary bg-blue-50 dark:bg-blue-900/30' 
                    : 'border-slate-200 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-700'}`}
              >
                <span className="text-lg">{opt}</span>
                {userAnswers[currentQIndex] === i && <CheckCircle2 className="text-primary" />}
              </button>
            ))}
          </div>

          <div className="mt-8 flex justify-between">
            <button 
              onClick={() => setCurrentQIndex(Math.max(0, currentQIndex - 1))}
              disabled={currentQIndex === 0}
              className="px-6 py-3 font-semibold text-text-secondary disabled:opacity-30"
            >
              السابق
            </button>
            
            <button 
              onClick={handleNext}
              disabled={userAnswers[currentQIndex] === undefined}
              className="px-8 py-3 bg-primary text-white font-bold rounded-xl disabled:opacity-50 flex items-center gap-2 shadow-md hover:bg-primary-dark transition"
            >
              {currentQIndex === questions.length - 1 ? 'إنهاء الاختبار' : 'التالي'}
              {currentQIndex !== questions.length - 1 && <ChevronRight size={20} />}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Result State
  const score = calculateScore();
  const pass = score >= questions.length / 2;

  return (
    <div className="max-w-3xl mx-auto w-full animate-in fade-in slide-in-from-bottom pt-4 pb-12">
      <div className={`p-8 rounded-3xl text-center mb-8 border-2 ${pass ? 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800' : 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800'}`}>
        <h2 className="text-2xl font-bold mb-2">النتيجة النهائية</h2>
        <div className={`text-6xl font-bold ${pass ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
          {score} / {questions.length}
        </div>
      </div>

      <h3 className="text-2xl font-bold mb-6">مراجعة الإجابات</h3>
      <div className="space-y-6">
        {questions.map((q, i) => {
          const uA = userAnswers[i];
          const isCorrect = uA === q.correctAnswerIndex;
          
          return (
            <div key={i} className="bg-surface p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
              <div className="flex items-start gap-3 mb-4">
                {isCorrect ? <CheckCircle2 className="text-green-500 shrink-0 mt-1" /> : <XCircle className="text-red-500 shrink-0 mt-1" />}
                <h4 className="font-bold text-lg leading-snug">{q.question}</h4>
              </div>

              {!isCorrect && uA !== undefined && (
                <div className="text-red-500 dark:text-red-400 mb-2 font-medium bg-red-50 dark:bg-red-900/20 p-3 rounded-lg border border-red-100 dark:border-red-800">
                  إجابتك: {q.options[uA]}
                </div>
              )}
              
              <div className="text-green-600 dark:text-green-400 font-bold bg-green-50 dark:bg-green-900/20 p-3 rounded-lg border border-green-100 dark:border-green-800 mb-4">
                الإجابة الصحيحة: {q.options[q.correctAnswerIndex]}
              </div>

              {!isCorrect && (
                <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl space-y-2 border border-slate-100 dark:border-slate-700">
                  <p className="text-sm font-semibold text-primary">شرح توضيحي:</p>
                  <p className="text-sm">{q.explanation}</p>
                  <p className="text-xs text-text-secondary inline-block bg-slate-200 dark:bg-slate-700 px-2 py-1 rounded">
                    المصدر: {q.source}
                  </p>
                </div>
              )}
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
