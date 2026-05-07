import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Layout.css';

export default function Layout() {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/auth');
  };

  const navItems = [
    { to: '/dashboard', icon: '📊', label: 'Dashboard' },
    { to: '/projects', icon: '📁', label: 'Projects' },
    { to: '/tasks', icon: '✅', label: 'My Tasks' },
    ...(currentUser?.role === 'admin' ? [{ to: '/team', icon: '👥', label: 'Team' }] : []),
  ];

  return (
    <div className="layout">
      {/* Mobile overlay */}
      {sidebarOpen && <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />}

      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-logo">
          <div className="logo-box">TM</div>
          <span className="logo-text">TaskFlow</span>
        </div>

        <nav className="sidebar-nav">
          {navItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              onClick={() => setSidebarOpen(false)}
            >
              <span className="nav-icon">{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="user-info">
            <div className="user-avatar">{currentUser?.avatar}</div>
            <div className="user-details">
              <div className="user-name">{currentUser?.name}</div>
              <div className="user-role">{currentUser?.role}</div>
            </div>
          </div>
          <button className="logout-btn" onClick={handleLogout} title="Logout">⏻</button>
        </div>
      </aside>

      {/* Main content */}
      <div className="main-wrap">
        <header className="topbar">
          <button className="menu-btn" onClick={() => setSidebarOpen(!sidebarOpen)}>☰</button>
          <div className="topbar-right">
            <div className="role-badge" data-role={currentUser?.role}>{currentUser?.role}</div>
            <div className="user-avatar sm">{currentUser?.avatar}</div>
          </div>
        </header>
        <main className="content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
