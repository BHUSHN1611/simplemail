import React from 'react'


// Navbar Component
const Navbar = () => {
  const navItems = ['Home', 'Features', 'Team', 'Github' , 'Video'];;

  return (
    <nav className="flex justify-center">
      <div className="bg-black/40 backdrop-blur-sm rounded-full px-4 lg:px-6 xl:px-8 py-2 lg:py-3 border border-white/10">
        <ul className="flex gap-4 lg:gap-6 xl:gap-8 text-white/90 text-xs lg:text-sm xl:text-base font-medium">
          {navItems.map((item, index) => (
            <li
              key={index}
              className="cursor-pointer hover:text-white transition-colors px-1 lg:px-2 py-1">
              {item}
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
};

export default Navbar