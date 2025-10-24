// components/TypingRoles.tsx
import React, { useState, useEffect } from 'react';

interface TypingRolesProps {
  roles: string[];
}

const TypingRoles: React.FC<TypingRolesProps> = ({ roles }) => {
  const [currentRoleIndex, setCurrentRoleIndex] = useState(0);
  const [currentText, setCurrentText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [typingSpeed, setTypingSpeed] = useState(150);

  useEffect(() => {
    if (!roles || roles.length === 0) return;

    const currentRole = roles[currentRoleIndex];
    
    const timer = setTimeout(() => {
      if (!isDeleting) {
        // Typing phase
        if (currentText.length < currentRole.length) {
          setCurrentText(currentRole.slice(0, currentText.length + 1));
          setTypingSpeed(150);
        } else {
          // Finished typing, wait then start deleting
          setTimeout(() => setIsDeleting(true), 2000);
        }
      } else {
        // Deleting phase
        if (currentText.length > 0) {
          setCurrentText(currentText.slice(0, -1));
          setTypingSpeed(100);
        } else {
          // Finished deleting, move to next role
          setIsDeleting(false);
          setCurrentRoleIndex((prev) => (prev + 1) % roles.length);
        }
      }
    }, typingSpeed);

    return () => clearTimeout(timer);
  }, [currentText, isDeleting, currentRoleIndex, roles, typingSpeed]);

  if (!roles || roles.length === 0) return null;

  return (
    <div className="text-xl md:text-2xl text-gray-300 mb-8 min-h-[2.5rem] flex items-center justify-center">
      <span className="inline-block mr-4">
        {currentText}
        <span className="inline-block w-0.5 h-6 bg-purple-400 ml-1 animate-pulse"></span>
      </span>
    </div>
  );
};

export default TypingRoles;