import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu } from '@headlessui/react';

export function Navbar() {
  const [isMailConnected, setIsMailConnected] = useState(false);

  return (
    <header className="w-full h-16 flex items-center justify-between px-8 lg:px-16 fixed top-0 left-0 z-40 bg-white/90 backdrop-blur-xl border-b border-gray-100">
      <Link to="/" className="flex items-center gap-3 select-none cursor-pointer group">
        <div className="size-8 rounded-lg bg-gray-900 flex items-center justify-center text-white transition-transform group-hover:scale-105">
          <span className="material-symbols-outlined text-[18px]">eco</span>
        </div>
        <h2 className="text-gray-900 text-base font-medium tracking-tight">Antigravity</h2>
      </Link>
      
      <div className="flex items-center gap-6">
        <button className="relative p-2 text-gray-400 hover:text-gray-900 transition-colors">
          <span className="material-symbols-outlined text-[20px]">notifications</span>
          <span className="absolute top-1.5 right-1.5 size-1.5 bg-orange-500 rounded-full" />
        </button>
        
        {/* Profile Dropdown */}
        <Menu as="div" className="relative">
          <Menu.Button className="flex items-center gap-3 pl-6 border-l border-gray-200 outline-none">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium text-gray-900">Alex Chen</p>
            </div>
            <div className="size-8 rounded-full bg-gray-900 border-2 border-white shadow-sm cursor-pointer transition-transform hover:scale-105" />
          </Menu.Button>
          
          <Menu.Items className="absolute right-0 mt-2 w-56 origin-top-right bg-white rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100 py-2 focus:outline-none z-50">
            <div className="px-4 py-3 border-b border-gray-100">
              <p className="text-sm font-medium text-gray-900">Alex Chen</p>
              <p className="text-xs text-gray-400">alex@company.com</p>
            </div>
            
            <div className="py-1">
              <Menu.Item>
                {({ active }) => (
                  <button
                    className={`w-full text-left px-4 py-2.5 text-sm transition-colors flex items-center gap-3 ${
                      active ? 'bg-gray-50 text-gray-900' : 'text-gray-600'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[18px] text-gray-400">person</span>
                    Profile
                  </button>
                )}
              </Menu.Item>
              
              <Menu.Item>
                {({ active }) => (
                  <button
                    onClick={() => setIsMailConnected(!isMailConnected)}
                    className={`w-full text-left px-4 py-2.5 text-sm transition-colors flex items-center gap-3 ${
                      active ? 'bg-gray-50 text-gray-900' : 'text-gray-600'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[18px] text-gray-400">mail</span>
                    <span className="flex-1">Connect Mail</span>
                    {isMailConnected && (
                      <span className="size-1.5 rounded-full bg-green-500" />
                    )}
                  </button>
                )}
              </Menu.Item>
              
              <Menu.Item>
                {({ active }) => (
                  <button
                    className={`w-full text-left px-4 py-2.5 text-sm transition-colors flex items-center gap-3 ${
                      active ? 'bg-gray-50 text-gray-900' : 'text-gray-600'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[18px] text-gray-400">settings</span>
                    Settings
                  </button>
                )}
              </Menu.Item>
            </div>
            
            <div className="border-t border-gray-100 py-1 mt-1">
              <Menu.Item>
                {({ active }) => (
                  <button
                    className={`w-full text-left px-4 py-2.5 text-sm transition-colors flex items-center gap-3 text-gray-600 ${
                      active ? 'bg-gray-50' : ''
                    }`}
                  >
                    <span className="material-symbols-outlined text-[18px] text-gray-400">logout</span>
                    Sign Out
                  </button>
                )}
              </Menu.Item>
            </div>
          </Menu.Items>
        </Menu>
      </div>
    </header>
  );
}