import { useNavigate, useLocation } from 'react-router-dom';
import { useMode } from '../context/ModeContext';

type Tab = 'home' | 'arena' | 'learn' | 'stats' | 'social' | 'profile' | 'studypath';

interface Props {
  active: Tab;
}

export default function BottomNav({ active }: Props) {
  const navigate = useNavigate();
  const location = useLocation();
  const { can } = useMode();

  const tabs: { id: Tab; icon: string; label: string; path: string }[] = [
    { id: 'home',    icon: '🏠', label: 'Home',    path: '/'        },
    { id: 'arena',   icon: '⚔️',  label: 'Arena',   path: '/arena'   },
    { id: 'learn',   icon: '📚', label: 'Learn',   path: '/setup'   },
    { id: 'stats',   icon: '📊', label: 'Stats',   path: '/stats'   },
    can('social')
      ? { id: 'social',  icon: '👥', label: 'Social',  path: '/social'  }
      : { id: 'profile', icon: '👤', label: 'Profile', path: '/profile' },
  ];

  const current =
    tabs.find((t) => t.id === active)?.id ??
    tabs.find((t) => t.path === location.pathname)?.id ??
    'home';

  return (
    <nav className="fixed bottom-0 left-0 right-0 max-w-lg mx-auto bg-slate-900/95 backdrop-blur border-t border-slate-800 flex justify-around py-2 z-40">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => navigate(tab.path)}
          className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl transition-colors ${
            current === tab.id
              ? 'text-primary'
              : 'text-slate-500 hover:text-slate-300'
          }`}
        >
          <span className="text-xl leading-none">{tab.icon}</span>
          <span className="text-[10px] font-medium">{tab.label}</span>
        </button>
      ))}
    </nav>
  );
}
