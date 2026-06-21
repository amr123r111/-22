import { useState } from 'react';
import { UploadCloud, CheckCircle2, Loader2, ArrowRight } from 'lucide-react';

export default function UploadSection({ setUploadedFile, onComplete }) {
  const [isUploading, setIsUploading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [fileName, setFileName] = useState('');

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type === 'application/pdf') {
      setFileName(file.name);
      setIsUploading(true);
      
      // Simulate file reading and analysis delay
      setTimeout(() => {
        setIsUploading(false);
        setIsSuccess(true);
        setUploadedFile(file);
      }, 3000);
    } else {
      alert("الرجاء اختيار ملف PDF");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-full max-w-2xl mx-auto w-full space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-500">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold">رفع كِتاب المادة</h2>
        <p className="text-text-secondary">قم برفع ملف PDF ليقوم الذكاء الاصطناعي بقراءته وتحليله لك.</p>
      </div>

      <div className="w-full relative">
        <input 
          type="file" 
          accept="application/pdf"
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
          onChange={handleFileChange}
          disabled={isUploading || isSuccess}
        />
        
        <div className={`border-4 border-dashed rounded-3xl p-16 flex flex-col items-center justify-center transition-all duration-300
          ${isSuccess ? 'border-green-500 bg-green-50 dark:bg-green-900/20' : 
            isUploading ? 'border-primary bg-blue-50 dark:bg-blue-900/20' : 
            'border-slate-300 dark:border-slate-700 bg-surface hover:border-primary hover:bg-slate-50 dark:hover:bg-slate-800'}`}>
          
          {isUploading ? (
            <>
              <Loader2 className="w-20 h-20 text-primary animate-spin mb-6" />
              <h3 className="text-xl font-bold text-primary">جاري التحليل واستخراج البيانات...</h3>
              <p className="text-sm text-text-secondary mt-2">يرجى الانتظار بينما نقرأ المحتوى</p>
            </>
          ) : isSuccess ? (
            <>
              <CheckCircle2 className="w-20 h-20 text-green-500 mb-6 animate-bounce" />
              <h3 className="text-xl font-bold text-green-600 dark:text-green-400">تم التحليل بنجاح!</h3>
              <p className="text-sm font-medium mt-2">{fileName}</p>
            </>
          ) : (
            <>
              <UploadCloud className="w-20 h-20 text-slate-400 mb-6" />
              <h3 className="text-xl font-bold mb-2">اسحب وأفلت الملف هنا</h3>
              <p className="text-sm text-text-secondary mb-6">أو اضغط لتصفح الملفات (PDF فقط)</p>
              <button className="bg-primary text-white px-8 py-3 rounded-full font-bold shadow-md hover:bg-primary-dark transition z-20 pointer-events-none">
                اختيار ملف PDF
              </button>
            </>
          )}
        </div>
      </div>

      {isSuccess && (
        <button 
          onClick={onComplete}
          className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-green-600 text-white px-8 py-4 rounded-full font-bold shadow-lg hover:shadow-xl transition-all hover:scale-105 animate-in zoom-in"
        >
          متابعة و المراجعة
          <ArrowRight />
        </button>
      )}
    </div>
  );
}
