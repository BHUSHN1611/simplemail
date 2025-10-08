import React from 'react';

// Gradient Background Component
const GradientBackground = ({ children }) => {
  return (
    <div 
      className="min-h-screen rounded-b-4xl" 
      style={{
        background: 'radial-gradient(140% 107.13% at 50% 10%, transparent 37.41%, #63e 69.27%, #fff 100%)',
        backgroundColor: '#0a0a1a'
      }}
    >
      {children}
    </div>
  );
};

export default GradientBackground;




    
