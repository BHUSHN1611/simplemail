import React from 'react'

// Hero Section Component
const HeroSection = () => {
  return (
    <div className="flex-1 flex flex-col items-center justify-center px-8 text-center">
      <h1 className="text-6xl  text-white mb-6 tracking-tight font-outfit font-semibold">
        Quantum Secure Mailing
      </h1>
      
      <p className="text-2xl text-purple-200 mb-8 font-outfit ">
        A Robust Mailing System With Quantum Security
      </p>
      
      <p className="text-lg text-white/80 max-w-3xl mb-12 leading-relaxed font-Press-Start-2P">
        Mailing Application which provides high-end Security  using<br /> Quantum Key Distribution and Post Quantum Crypto-Graphy.
      </p>
      
      <button className="bg-white text-purple-900 px-8 py-3.5 rounded-full font-semibold text-base hover:bg-purple-50 transition-all shadow-lg hover:shadow-xl flex items-center gap-2">
        Get Started
        <span>›</span>
      </button>
    </div>
  );
};

export default HeroSection