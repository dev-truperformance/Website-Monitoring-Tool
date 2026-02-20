import { useState } from 'react';
import { Globe, AlertTriangle, FileText, Settings, Users, Zap } from 'lucide-react';

interface NavigationProps {
  activeItem: string;
}

export default function Navigation({ activeItem }: NavigationProps) {
  const navItems = [
    { id: 'monitoring', label: 'Monitoring', icon: Globe },
    { id: 'incidents', label: 'Incidents', icon: AlertTriangle },
    { id: 'status-pages', label: 'Status pages', icon: FileText },
    { id: 'maintenance', label: 'Maintenance', icon: Settings },
    { id: 'team-members', label: 'Team members', icon: Users },
    { id: 'integrations', label: 'Integrations & API', icon: Zap }
  ];

  return (
    <nav className="flex-1 p-4">
      <ul className="space-y-1">
        {navItems.map((item) => (
          <li key={item.id}>
            <a 
              href="#" 
              className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
                activeItem === item.id 
                  ? 'text-primary-foreground bg-primary hover:shadow-lg transform hover:scale-105' 
                  : 'sidebar-text hover:bg-accent hover:shadow-md'
              }`}
            >
              <item.icon className="w-4 h-4 mr-3" />
              {item.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
