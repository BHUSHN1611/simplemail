import React from 'react'
import NetworkFlowVisualization from './NetworkFlowVisualization';

// Hero Section Component
const HeroSection = () => {
 return (
    <div className="flex flex-col items-center justify-center px-8 text-center z-0">
      <div className='flex flex-col justify-center items-center min-h-screen w-full absolute bottom-25'>
        <NetworkFlowVisualization></NetworkFlowVisualization>
      </div>
      <div className='mt-70'>
        <h1 className="bg-gradient-to-tr from-violet-600 via-white to-violet-700 bg-clip-text text-transparent text-6xl mb-4  font-outfit font-bold">
        QUANTUM SECURE MAILING
      </h1>
      <p className="text-2xl text-purple-200 mb-4 font-outfit ">
        A Robust Mailing System With Quantum Security
      </p>
      
      <p className="text-lg text-white/80 max-w-3xl mb-6 leading-relaxed font-Press-Start-2P">
        Mailing Application which provides high-end Security  using<br /> Quantum Key Distribution and Post Quantum Crypto-Graphy.
      </p>
      </div>
    </div>
  );
};

export default HeroSection