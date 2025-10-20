import React from 'react'
import { Shield, Lock, Key, Mail, Users, Zap } from 'lucide-react';

const Footer = () => {
    const teamMembers = [
    { name: 'Yash Gabhale',  image: 'YG' },
    { name: 'Bhushan Jadhav',  image: 'BJ' },
    { name: 'Abhishek Yadav',  image: 'AY'},
    { name: 'Rahul Singh',  image: 'RS'},
    { name: 'Riddhi Makwana',  image: 'RM'},
    { name: 'Faizan Patel',  image: 'FP'}
  ];
  return (
    <div>
       <footer className="py-8 lg:py-12 xl:py-16 px-4 lg:px-6 xl:px-8" style={{ backgroundColor: '#010314' }}>
       <div className="max-w-6xl lg:max-w-7xl xl:max-w-[90rem] mx-auto">
         {/* Qumail Features Section */}
         <div className="mb-12 lg:mb-16 xl:mb-20">
           <div className="text-center mb-8 lg:mb-12 xl:mb-16">
             <h2 className="text-2xl lg:text-3xl xl:text-4xl 2xl:text-5xl font-bold mb-2 lg:mb-4 text-white">Qumail Features</h2>
             <p className="text-lg lg:text-xl xl:text-2xl text-purple-300">
               Post-Quantum Cryptography with Simulated Quantum Key Distribution
             </p>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 lg:gap-6 xl:gap-8 max-w-6xl lg:max-w-7xl xl:max-w-[90rem] mx-auto">
              {/* Quantum Key Integration */}
              <div className="group">
                <div className="mb-4 lg:mb-6">
                  <svg className="w-16 h-16 lg:w-20 lg:h-20 xl:w-24 xl:h-24" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M30 25L30 40L45 48L45 33L30 25Z" fill="#1e1b4b" stroke="#6366f1" strokeWidth="1.5"/>
                    <path d="M30 40L45 48L60 40L60 25L45 33L30 40Z" fill="#1e1b4b" stroke="#6366f1" strokeWidth="1.5"/>
                    <path d="M45 18L30 25L45 33L60 25L45 18Z" fill="#7c3aed" stroke="#a78bfa" strokeWidth="1.5"/>
                    <path d="M45 33L45 48" stroke="#6366f1" strokeWidth="1.5"/>
                  </svg>
                </div>
                <h3 className="text-lg lg:text-xl xl:text-2xl font-semibold mb-2 lg:mb-3 text-white">Quantum Key Integration</h3>
                <p className="text-purple-200 text-sm lg:text-base leading-relaxed">
                  Using ETSI GS QKD 014 APIs to fetch simulated quantum keys distribution.
                </p>
              </div>

              {/* Message Encryption */}
              <div className="group">
                <div className="mb-4 lg:mb-6">
                  <svg className="w-16 h-16 lg:w-20 lg:h-20 xl:w-24 xl:h-24" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M35 30L35 45L50 53L50 38L35 30Z" fill="#7c3aed" stroke="#a78bfa" strokeWidth="1.5"/>
                    <path d="M35 45L50 53L50 38" stroke="#a78bfa" strokeWidth="1.5"/>
                    <path d="M35 30L50 38L50 23L35 15L35 30Z" fill="#1e1b4b" stroke="#6366f1" strokeWidth="1.5"/>
                  </svg>
                </div>
                <h3 className="text-lg lg:text-xl xl:text-2xl font-semibold mb-2 lg:mb-3 text-white">Message Encryption</h3>
                <p className="text-purple-200 text-sm lg:text-base leading-relaxed">
                  Emails and attachments are encrypted with AES for maximum protection.
                </p>
              </div>

              {/* Application Layer Encryption */}
              <div className="group">
                <div className="mb-4 lg:mb-6">
                  <svg className="w-16 h-16 lg:w-20 lg:h-20 xl:w-24 xl:h-24" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="28" y="28" width="24" height="30" rx="2" fill="#1e1b4b" stroke="#6366f1" strokeWidth="1.5"/>
                    <rect x="32" y="35" width="16" height="16" rx="2" fill="#7c3aed" stroke="#a78bfa" strokeWidth="1.5"/>
                    <line x1="36" y1="54" x2="48" y2="54" stroke="#6366f1" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                </div>
                <h3 className="text-lg lg:text-xl xl:text-2xl font-semibold mb-2 lg:mb-3 text-white">Application Layer</h3>
                <p className="text-purple-200 text-sm lg:text-base leading-relaxed">
                  Encrypt messages and attachments at the client-side, before transmission.
                </p>
              </div>

              {/* Multi-Level Security */}
              <div className="group">
                <div className="mb-4 lg:mb-6">
                  <svg className="w-16 h-16 lg:w-20 lg:h-20 xl:w-24 xl:h-24" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M30 28L30 43L45 51L45 36L30 28Z" fill="#1e1b4b" stroke="#6366f1" strokeWidth="1.5"/>
                    <path d="M30 43L45 51L60 43L60 28L45 36L30 43Z" fill="#1e1b4b" stroke="#6366f1" strokeWidth="1.5"/>
                    <path d="M45 21L30 28L45 36L60 28L45 21Z" fill="#7c3aed" stroke="#a78bfa" strokeWidth="1.5"/>
                  </svg>
                </div>
                <h3 className="text-lg lg:text-xl xl:text-2xl font-semibold mb-2 lg:mb-3 text-white">Multi-Level Security</h3>
                <p className="text-purple-200 text-sm lg:text-base leading-relaxed">
                  Four encryption modes: OTP, Quantum-aided AES, PQC, and Standard security.
                </p>
              </div>

              {/* User-Friendly Interface */}
              <div className="group">
                <div className="mb-4 lg:mb-6">
                  <svg className="w-16 h-16 lg:w-20 lg:h-20 xl:w-24 xl:h-24" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="40" cy="35" r="18" fill="#1e1b4b" stroke="#6366f1" strokeWidth="1.5"/>
                    <circle cx="40" cy="35" r="10" fill="#7c3aed" stroke="#a78bfa" strokeWidth="1.5"/>
                    <path d="M28 52L52 52" stroke="#6366f1" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                </div>
                <h3 className="text-lg lg:text-xl xl:text-2xl font-semibold mb-2 lg:mb-3 text-white">User-Friendly Interface</h3>
                <p className="text-purple-200 text-sm lg:text-base leading-relaxed">
                  Simple GUI (Gmail) for account login, key management and composing emails.
                </p>
              </div>
            </div>
          </div>

          {/* Team Section */}
          <div className="border-t border-purple-900/30 pt-12 lg:pt-16 xl:pt-20">
            <div className="text-center mb-8 lg:mb-12 xl:mb-16">
              <h2 className="text-2xl lg:text-3xl xl:text-4xl 2xl:text-5xl font-bold mb-2 lg:mb-4 text-white">Our Team</h2>
              <p className="text-lg lg:text-xl xl:text-2xl text-purple-300">
                Meet the experts behind Qumail
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6 gap-4 lg:gap-6 xl:gap-8 2xl:gap-10">
              {teamMembers.map((member, index) => (
                <div
                  key={index}
                  className="bg-purple-950/20 p-4 lg:p-6 xl:p-8 rounded-xl lg:rounded-2xl border border-purple-800/30 hover:border-purple-600/50 transition-all hover:shadow-lg hover:shadow-purple-900/30 text-center backdrop-blur-sm"
                >
                  <div className="w-16 h-16 lg:w-20 lg:h-20 xl:w-24 xl:h-24 bg-gradient-to-br from-purple-600 to-purple-800 rounded-full flex items-center justify-center text-lg lg:text-xl xl:text-2xl font-bold mx-auto mb-3 lg:mb-4 shadow-lg shadow-purple-900/50">
                    {member.image}
                  </div>
                  <h3 className="text-lg lg:text-xl xl:text-2xl font-semibold mb-1 lg:mb-2 text-white">{member.name}</h3>
                  <p className="text-purple-300 text-sm lg:text-base xl:text-lg mb-1 lg:mb-2">{member.role}</p>
                  <p className="text-purple-400 text-xs lg:text-sm xl:text-base">{member.email}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Footer Bottom */}
          <div className="border-t border-purple-900/30 mt-12 lg:mt-16 xl:mt-20 pt-6 lg:pt-8 text-center text-purple-300">
            <p className="text-sm lg:text-base xl:text-lg">&copy; 2025 Qumail. All rights reserved. Powered by post-quantum cryptography.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default Footer;