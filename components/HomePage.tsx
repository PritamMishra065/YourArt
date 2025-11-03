import React from 'react';
import { Button } from './ui/Button';

interface HomePageProps {
  onStart: () => void;
}

const HomePage: React.FC<HomePageProps> = ({ onStart }) => {
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center text-center p-4 bg-transparent">
      <div className="max-w-3xl">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-slate-100 tracking-tight">
          Welcome to <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-pink-500">YourArt</span>
        </h1>
        <p className="mt-6 text-lg md:text-xl text-slate-300 max-w-2xl mx-auto">
          Unleash your creativity with the power of AI. Generate stunning, unique images from your imagination or edit existing ones with simple text commands.
        </p>
        <div className="mt-10">
          <div className="inline-block rainbow-border rounded-lg">
            <button
              onClick={onStart}
              className="relative inline-flex items-center justify-center px-8 py-4 text-lg font-bold text-white bg-slate-800 rounded-md transition-transform duration-200 hover:scale-105"
            >
              Let's Create
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;