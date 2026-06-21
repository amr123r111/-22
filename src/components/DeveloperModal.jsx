import { X, MessageSquare, Send } from 'lucide-react';

export default function DeveloperModal({ onClose }) {
  const handleWhatsApp = () => {
    window.open(`https://wa.me/967775973196`, '_blank');
  };

  const handleSuggest = (e) => {
    e.preventDefault();
    alert("تم إرسال اقتراحك بنجاح! شكراً لك.");
    e.target.reset();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200" onClick={onClose}>
      <div 
        className="bg-surface w-full max-w-md rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200"
        onClick={e => e.stopPropagation()} // Prevent clicking inside from closing
      >
        <div className="relative h-32 bg-gradient-to-r from-primary to-primary-dark">
          <button 
            onClick={onClose}
            className="absolute top-4 left-4 p-2 bg-black/20 hover:bg-black/40 text-white rounded-full transition"
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="px-6 pb-6 text-center -mt-16 relative">
          <div className="w-32 h-32 mx-auto bg-surface p-2 rounded-full mb-4 shadow-lg">
            <img 
              src="https://api.dicebear.com/7.x/avataaars/svg?seed=Amr&backgroundColor=e2e8f0" 
              alt="Developer Avatar" 
              className="w-full h-full rounded-full bg-slate-100"
            />
          </div>
          
          <h2 className="text-2xl font-bold mb-1">عمرو الحيدري</h2>
          <p className="text-text-secondary font-medium mb-6">مطور تقنيات ويب لتقديم حلول ذكية</p>
          
          <button 
            onClick={handleWhatsApp}
            className="w-full flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white py-3 rounded-xl font-bold shadow-md transition-colors mb-8"
          >
            <MessageSquare size={20} />
            تواصل عبر WhatsApp
          </button>

          <div className="border-t border-slate-200 dark:border-slate-800 pt-6">
            <h3 className="text-lg font-bold mb-4 text-right">تقديم فكرة أو اقتراح</h3>
            <form onSubmit={handleSuggest} className="space-y-4">
              <textarea 
                required
                placeholder="اكتب اقتراحك هنا..." 
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-4 focus:ring-2 focus:ring-primary focus:outline-none min-h-[100px] resize-none"
              ></textarea>
              <button 
                type="submit"
                className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary-dark text-white py-3 rounded-xl font-bold shadow-md transition-colors"
              >
                <Send size={20} />
                إرسال الاقتراح
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
