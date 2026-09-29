import type { ReactNode } from 'react';
import { Icon, type IconName } from './Icons';

export type AppView = 'home' | 'lesson' | 'worksheet' | 'practice' | 'voice' | 'audio';

interface AppShellProps {
  view: AppView;
  onNavigate: (view: AppView) => void;
  children: ReactNode;
}

const navItems: { id: AppView; label: string; icon: IconName }[] = [
  { id: 'home', label: 'Inicio', icon: 'home' },
  { id: 'lesson', label: 'Lecciones', icon: 'book' },
  { id: 'practice', label: 'Práctica', icon: 'practice' },
  { id: 'voice', label: 'Mi voz', icon: 'mic' },
  { id: 'audio', label: 'Tu audio', icon: 'music' },
];

export function AppShell({ view, onNavigate, children }: AppShellProps) {
  const activeSection = view === 'worksheet' ? 'lesson' : view;
  const sectionName = navItems.find((item) => item.id === activeSection)?.label ?? 'Inicio';

  function renderNav(mobile = false) {
    return navItems.map((item) => {
      const selected = activeSection === item.id;
      return (
        <button
          key={`${mobile ? 'mobile-' : ''}${item.id}`}
          className={`nav-item${selected ? ' is-active' : ''}${mobile ? ' nav-item-mobile' : ''}`}
          type="button"
          aria-current={selected ? 'page' : undefined}
          onClick={() => onNavigate(item.id)}
        >
          <Icon name={item.icon} size={18} />
          <span>{item.label}</span>
        </button>
      );
    });
  }

  return (
    <div className="app-shell">
      <aside className="sidebar" aria-label="Navegación principal">
        <div className="brand-lockup">
          <img className="brand-mark" src="/favicon.svg" alt="" />
          <div><strong>English, paso a paso</strong><span>CURSO INTERACTIVO</span></div>
        </div>
        <div className="side-caption">TU ESPACIO</div>
        <nav className="primary-nav">{renderNav()}</nav>
        <div className="sidebar-note">
          <div className="sidebar-note-icon"><Icon name="sparkle" size={16} /></div>
          <p><strong>Un paso a la vez</strong><span>Aprende primero. Practica después.</span></p>
        </div>
        <div className="sidebar-bottom"><span className="status-dot" /> Demo independiente para revisar</div>
      </aside>

      <div className="main-column">
        <header className="mobile-header">
          <div className="brand-lockup">
            <img className="brand-mark" src="/favicon.svg" alt="" />
            <div><strong>English, paso a paso</strong><span>DEMO DE REDISEÑO</span></div>
          </div>
          <span className="demo-pill">DEMO</span>
        </header>
        <div className="topbar">
          <div className="breadcrumbs"><span>English, paso a paso</span><Icon name="chevron" size={14} /><strong>{view === 'worksheet' ? 'Hoja de trabajo' : sectionName}</strong></div>
          <div className="topbar-chip"><span className="status-dot" /> Solo vista previa</div>
        </div>
        <main className="main-content">{children}</main>
      </div>

      <nav className="mobile-nav" aria-label="Navegación móvil">{renderNav(true)}</nav>
    </div>
  );
}
