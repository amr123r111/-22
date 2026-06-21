import { useState } from 'react';
import { Upload, FileText, BookOpen, User, Moon, Sun, Home } from 'lucide-react';
import UploadSection from './components/UploadSection';
import QuizSection from './components/QuizSection';
import SummarySection from './components/SummarySection';
import DeveloperModal from './components/DeveloperModal';

function App() {
  const [darkMode, setDarkMode] = useState(true);
  const [currentView, setCurrentView] = useState('home'); // home, upload, quiz, summary
  const [uploadedFile, setUploadedFile] = useState(null);
  const [isDevModalOpen, setIsDevModalOpen] = useState(false);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle('dark');
  };

  const menuItems = [
    { id: 'upload', title: 'رفع ملف', icon: <Upload size={24} />, description: 'ارفع كتابك لتحليله' },
    { id: 'quiz', title: 'اختبار ذكي', icon: <FileText size={24} />, description: 'تدرب على أسئلة مستخرجة من المنهج', disabled: !uploadedFile },
    { id: 'summary', title: 'التلخيص الذكي', icon: <BookOpen size={24} />, description: 'احصل على ملخص لأهم النقاط', disabled: !uploadedFile },
  ];

  return (
    <div className={`min-h-screen flex flex-col font-sans`}>
      {/* Navbar */}
      <header className="bg-surface shadow-md sticky top-0 z-10 transition-colors">
        <div className="max-w-5xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setCurrentView('home')}>
            <div className="bg-primary text-white p-2 rounded-lg">
              <BookOpen size={28} />
            </div>
            <h1 className="text-xl md:text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary-dark cursor-pointer">
              المساعد الدراسي
            </h1>
          </div>
          
          <div className="flex items-center gap-4">
            {currentView !== 'home' && (
              <button onClick={() => setCurrentView('home')} className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition">
                <Home size={24} />
              </button>
            )}
            <button onClick={toggleDarkMode} className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition">
              {darkMode ? <Sun size={24} /> : <Moon size={24} />}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-5xl w-full mx-auto p-4 md:p-8 flex flex-col">
        {currentView === 'home' && (
          <div className="flex flex-col items-center justify-center flex-1 space-y-8 animate-in fade-in zoom-in duration-500">
            <div className="text-center space-y-4 max-w-2xl">
              <h2 className="text-3xl md:text-4xl font-bold">مرحباً بك في مساعدك الدراسي الشخصي!</h2>
              <p className="text-lg text-text-secondary">
                ارفع كتابك المدرسي وسيتكفل الذكاء الاصطناعي باستخراج الاختبارات والملخصات لتبسيط دراستك.
              </p>
            </div>

            {uploadedFile && (
              <div className="bg-green-100 dark:bg-green-900 border border-green-400 text-green-700 dark:text-green-300 px-6 py-3 rounded-lg flex items-center gap-4">
                <FileText size={24} />
                <span className="font-semibold">الملف الحالي: {uploadedFile.name}</span>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full mt-8">
              {menuItems.map((item) => (
                <button
                  key={item.id}
                  disabled={item.disabled}
                  onClick={() => setCurrentView(item.id)}
                  className={`flex flex-col items-center justify-center p-8 rounded-2xl border-2 transition-all duration-300
                    ${item.disabled 
                      ? 'opacity-50 cursor-not-allowed border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900' 
                      : 'border-transparent bg-surface hover:ring-2 hover:ring-primary shadow-lg hover:shadow-xl hover:-translate-y-2'}`}
                >
                  <div className={`p-4 rounded-full mb-4 ${item.disabled ? 'bg-slate-300 dark:bg-slate-700 text-slate-500' : 'bg-blue-100 text-primary dark:bg-blue-900/40'}`}>
                    {item.icon}
                  </div>
                  <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                  <p className="text-center text-sm text-text-secondary">{item.description}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {currentView === 'upload' && <UploadSection setUploadedFile={setUploadedFile} onComplete={() => setCurrentView('home')} />}
        {currentView === 'quiz' && <QuizSection fileName={uploadedFile?.name} onBack={() => setCurrentView('home')} />}
        {currentView === 'summary' && <SummarySection fileName={uploadedFile?.name} onBack={() => setCurrentView('home')} />}
      </main>

      {/* Footer */}
      <footer className="bg-surface shadow-inner py-6 mt-auto transition-colors">
        <div className="max-w-5xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-text-secondary font-medium">تطوير عمرو الحيدري | +967 775 973 196</p>
          <button 
            onClick={() => setIsDevModalOpen(true)}
            className="flex items-center gap-2 bg-gradient-to-r from-primary to-primary-dark text-white px-6 py-2 rounded-full font-bold hover:shadow-lg transition-transform hover:scale-105"
          >
            <User size={20} />
            حول المطور
          </button>
        </div>
      </footer>

      {/* Developer Modal */}
      {isDevModalOpen && <DeveloperModal onClose={() => setIsDevModalOpen(false)} />}
    </div>
  );
}

export default App;
