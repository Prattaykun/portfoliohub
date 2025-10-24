// components/AnimatedName.tsx
import React from 'react';


// Updated AnimatedName Component with proper reveal effect
// Updated AnimatedName Component without center line
const AnimatedName: React.FC<{ name: string }> = ({ name }) => {
  return (
    <div className="name-reveal-container">
      {/* Top Moving Line */}
      <div className="name-reveal-lines name-reveal-top">
        <div className="animate-line-move-top"></div>
      </div>
      
      {/* Name Text with Reveal Animation */}
      <h1 className="name-text text-5xl md:text-7xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
        {name}
      </h1>
      
      {/* Bottom Moving Line */}
      <div className="name-reveal-lines name-reveal-bottom">
        <div className="animate-line-move-bottom"></div>
      </div>
      
      {/* Removed the center sparkle line completely */}
    </div>
  );
};
export default AnimatedName;