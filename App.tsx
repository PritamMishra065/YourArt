import React, { useState } from 'react';
import ImageStudio from './components/ImageGenerator';
import HomePage from './components/HomePage';
import { BrainCircuitIcon } from './components/icons/Icons';

const App: React.FC = () => {
  const [showStudio, setShowStudio] = useState(false);

  if (!showStudio) {
    return <HomePage onStart={() => setShowStudio(true)} />;
  }

  return (
    <div className="min-h-screen bg-transparent font-sans text-slate-200">
      <header className="bg-slate-900/80 backdrop-blur-sm sticky top-0 z-10 w-full border-b border-slate-700">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center gap-3">
              <BrainCircuitIcon className="h-8 w-8 text-indigo-400" />
              <h1 className="text-xl md:text-2xl font-bold text-slate-100 tracking-tight">
                YourArt
              </h1>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto p-4 md:p-8">
        <div className="bg-slate-800/80 backdrop-blur-md rounded-lg shadow-2xl p-4 sm:p-6 lg:p-8 border border-slate-700">
            <ImageStudio />
        </div>
      </main>
      
      <footer className="text-center py-6 text-slate-400 text-sm">
        <p>Powered by Google Gemini API</p>
      </footer>
    </div>
  );
};

export default App;