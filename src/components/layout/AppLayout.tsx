import { NavLink, Outlet } from 'react-router-dom';
import { useStore } from '../../store/useStore';
import { Mic, Sliders, BarChart3, Users, Dumbbell, User, Sun, Moon, Music } from 'lucide-react';

const navItems = [
  { to: '/', icon: Mic, label: 'Pitch Monitor' },
  { to: '/calibrate', icon: Sliders, label: 'Calibration' },
  { to: '/analytics', icon: BarChart3, label: 'Analytics' },
  { to: '/choir', icon: Users, label: 'Choir' },
  { to: '/training', icon: Dumbbell, label: 'Training' },
  { to: '/profile', icon: User, label: 'Profile' },
];

export default function AppLayout() {
  const { theme, toggleTheme } = useStore();
  const isDark = theme === 'dark';

  return (
    <div className={`${isDark ? 'dark' : 'light'} min-h-screen flex flex-col`}>
      <header className={`sticky top-0 z-50 border-b backdrop-blur-md transition-colors duration-300 ${isDark ? 'bg-gray-950/80 border-gray-800 text-white' : 'bg-white/80 border-gray-200 text-gray-900'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          <div className="flex items-center gap-2.5">
            <Music className="w-7 h-7 text-primary-500" />
            <span className="font-[family-name:var(--font-display)] text-xl font-bold tracking-tight">Voice Profile</span>
          </div>
          <button onClick={toggleTheme} className={`p-2 rounded-lg transition-colors duration-200 ${isDark ? 'hover:bg-gray-800 text-gray-400' : 'hover:bg-gray-100 text-gray-600'}`} aria-label="Toggle theme">
            {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
        </div>
      </header>
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 pb-24">
        <Outlet />
      </main>
      <nav className={`fixed bottom-0 inset-x-0 border-t backdrop-blur-md transition-colors duration-300 z-50 ${isDark ? 'bg-gray-950/80 border-gray-800' : 'bg-white/80 border-gray-200'}`}>
        <div className="max-w-7xl mx-auto px-2 flex items-center justify-around h-16">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink key={to} to={to} className={({ isActive }) => `flex flex-col items-center gap-1 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200 ${isActive ? 'text-primary-500 scale-105' : isDark ? 'text-gray-500 hover:text-gray-300' : 'text-gray-400 hover:text-gray-700'}`}>
              <Icon className="w-5 h-5" />
              <span className="hidden sm:inline">{label}</span>
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
}
