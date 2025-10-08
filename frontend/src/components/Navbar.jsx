import React from 'react'

// Navbar Component
const Navbar = () => {
  const navItems = ['Home', 'Team details', 'Github repo', 'References' , 'Video'];
  
  return (
    <nav className="flex justify-center">
      <div className="bg-black/40 backdrop-blur-sm rounded-full px-8 py-3 border border-white/10">
        <ul className="flex gap-8 text-white/90 text-sm font-medium">
          {navItems.map((item, index) => (
            <li 
              key={index} 
              className="cursor-pointer hover:text-white transition-colors">
              {item}
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
};

export default Navbar