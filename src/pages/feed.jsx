import { useState, useEffect } from "react";
import { X, Download } from "lucide-react";
import FeedContainer from "../components/feed/feedContainer";
import PageSEO from "../components/common/PageSEO";

const Feed = () => {
  const [showInstallModal, setShowInstallModal] = useState(false);

  useEffect(() => {
    // Only show once per session
    if (!sessionStorage.getItem("pwaPromptDismissed")) {
      // Small delay so it doesn't jarringly appear before feed loads
      const timer = setTimeout(() => {
        setShowInstallModal(true);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleDismiss = () => {
    sessionStorage.setItem("pwaPromptDismissed", "true");
    setShowInstallModal(false);
  };

  const handleInstall = () => {
    // Logic for actual PWA install would go here (e.g. triggering deferredPrompt.prompt())
    // For now, just dismiss
    handleDismiss();
    // Simulate install request if service worker logic exists elsewhere
    window.dispatchEvent(new Event('app_install_requested'));
  };

  return (
    <>
      <PageSEO/>
      <FeedContainer />
      
      {showInstallModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-300">
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl relative animate-in zoom-in-95 duration-300">
            <button 
              onClick={handleDismiss}
              className="absolute top-4 right-4 text-gray-300 hover:text-gray-500 transition-colors p-1"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
            
            <div className="flex flex-col items-center text-center mt-2">
              <div className="w-16 h-16 bg-lily/10 text-lily rounded-2xl flex items-center justify-center mb-4">
                <Download className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Install LilyApp</h3>
              <p className="text-sm text-gray-600 mb-6 px-2">
                Get the best experience with instant chats, faster ordering, and push notifications.
              </p>
              
              <button 
                onClick={handleInstall}
                className="w-full bg-lily text-white font-bold py-3.5 rounded-2xl hover:bg-lily/90 transition-all shadow-lg shadow-lily/20 active:scale-[0.98]"
              >
                Install Now
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Feed;
