import React from 'react'
import { NavLink } from 'react-router-dom'
import { FontIcon, CompareIcon, BookmarkIcon, SettingsIcon } from './Icons'
import { ShipWheel } from 'lucide-react'
import logo from '../../public/icon.png'
const Sidebar: React.FC = () => {
  const navItems = [
    { path: '/explorer', icon: FontIcon, label: 'Explorer' },
    { path: '/compare', icon: CompareIcon, label: 'Compare' },
    { path: '/bookmarks', icon: BookmarkIcon, label: 'Bookmarks' },
    { path: '/settings', icon: SettingsIcon, label: 'Settings' }
  ]

  return (
    <aside className="w-16 border-r border-border-primary bg-bg-secondary flex flex-col items-center py-4">
      <div className="mb-8">
        <img src={logo} alt="icon" className="h-10 w-10" />
      </div>

      <nav className="flex-1 flex flex-col space-y-4">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => `
              w-12 h-12 rounded-lg flex items-center justify-center transition-all
              ${
                isActive
                  ? 'bg-bg-active text-accent-blue'
                  : 'text-text-secondary hover:text-text-primary hover:bg-bg-hover'
              }
            `}
            title={item.label}
          >
            <item.icon className="w-5 h-5" />
          </NavLink>
        ))}
      </nav>

      <div className="mt-auto">
        <ShipWheel size={30} color="#3d2c1d" />
      </div>
    </aside>
  )
}

export default Sidebar
