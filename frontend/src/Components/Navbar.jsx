// import React from 'react'


// // Navbar Component
// const Navbar = () => {
//   const navItems = ['Home', 'Features', 'Team', 'Github' , 'Video'];

//   return (
//     <nav className="flex justify-center">
//       <div className="bg-black/40 backdrop-blur-sm rounded-full px-4 lg:px-6 xl:px-8 py-2 lg:py-3 border border-white/10">
//         <ul className="flex gap-4 lg:gap-6 xl:gap-8 text-white/90 text-xs lg:text-sm xl:text-base font-medium">
//           {navItems.map((item, index) => (
//             <li
//               key={index}
//               className="cursor-pointer hover:text-white transition-colors px-1 lg:px-2 py-1">
//               {item}
//             </li>
//           ))}
//         </ul>
//       </div>
//     </nav>
//   );
// };

// export default Navbar

import React, { useState } from 'react';
import { Github, Video } from 'lucide-react';

const Navbar = () => {
  const [activeItem, setActiveItem] = useState('Home');

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }
  };

  const handleNavClick = (item) => {
    setActiveItem(item.label);
    
    switch(item.label) {
      case 'Home':
        window.scrollTo({ top: 0, behavior: 'smooth' });
        break;
      case 'Features':
        scrollToSection('features-section');
        break;
      case 'Team':
        scrollToSection('team-section');
        break;
      case 'Github':
        window.open('https://github.com/BHUSHN1611/simplemail', '_blank', 'noopener,noreferrer');
        break;
      case 'Video':
        window.open('https://youtu.be/BJ9-nEFl5Q8', '_blank', 'noopener,noreferrer');
        break;
      default:
        break;
    }
  };

  const navItems = [
    { label: 'Home', icon: null },
    { label: 'Features', icon: null },
    { label: 'Team', icon: null },
    { label: 'Github', icon: Github },
    { label: 'Video', icon: Video }
  ];

  return (
    <nav className="flex justify-center">
      <div className="bg-black/40 backdrop-blur-sm rounded-full px-4 lg:px-6 xl:px-8 py-2 lg:py-3 border border-white/10">
        <ul className="flex gap-4 lg:gap-6 xl:gap-8 text-white/90 text-xs lg:text-sm xl:text-base font-medium">
          {navItems.map((item, index) => {
            const Icon = item.icon;
            const isExternal = item.label === 'Github' || item.label === 'Video';
            
            return (
              <li
                key={index}
                onClick={() => handleNavClick(item)}
                className={`
                  cursor-pointer transition-all duration-300 px-1 lg:px-2 py-1 rounded-md
                  ${activeItem === item.label && !isExternal
                    ? 'text-white bg-white/10' 
                    : 'hover:text-white hover:bg-white/5'
                  }
                  ${isExternal ? 'hover:text-purple-400' : ''}
                  flex items-center gap-1.5 lg:gap-2
                `}
              >
                {Icon && <Icon size={16} className="lg:w-4 lg:h-4" />}
                <span>{item.label}</span>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;