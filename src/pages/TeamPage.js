import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';
import './TeamPage.css';

export default function TeamPage() {
  const { currentUser, users, getMyTasks, getMyProjects, tasks } = useAuth();

  if (currentUser?.role !== 'admin') return <Navigate to="/dashboard" replace />;

  const getUserStats = (userId) => {
    const userTasks = tasks.filter(t => t.assigneeId === userId);
    return {
      total: userTasks.length,
      done: userTasks.filter(t => t.status === 'done').length,
      inProgress: userTasks.filter(t => t.status === 'in-progress').length,
      todo: userTasks.filter(t => t.status === 'todo').length,
    };
  };

  const avatarColors = ['#1D9E75', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444', '#ec4899', '#06b6d4'];

  return (
    <div className="team-page">
      <div className="page-header">
        <div>
          <h1>Team Management</h1>
          <p className="page-sub">{users.length} team member{users.length !== 1 ? 's' : ''}</p>
        </div>
      </div>

      <div className="team-grid">
        {users.map((user, i) => {
          const stats = getUserStats(user.id);
          const color = avatarColors[i % avatarColors.length];
          const pct = stats.total > 0 ? Math.round((stats.done / stats.total) * 100) : 0;

          return (
            <div key={user.id} className="team-card">
              <div className="tc-header">
                <div className="tc-avatar" style={{ background: color }}>{user.avatar}</div>
                <div className="tc-info">
                  <div className="tc-name">{user.name}</div>
                  <div className="tc-email">{user.email}</div>
                </div>
                <span className={`role-pill ${user.role}`}>{user.role}</span>
              </div>
              <div className="tc-stats">
                <div className="tcs-item">
                  <div className="tcs-value">{stats.total}</div>
                  <div className="tcs-label">Total</div>
                </div>
                <div className="tcs-item">
                  <div className="tcs-value" style={{ color: '#f59e0b' }}>{stats.inProgress}</div>
                  <div className="tcs-label">Active</div>
                </div>
                <div className="tcs-item">
                  <div className="tcs-value" style={{ color: '#1D9E75' }}>{stats.done}</div>
                  <div className="tcs-label">Done</div>
                </div>
                <div className="tcs-item">
                  <div className="tcs-value" style={{ color: '#6b7280' }}>{stats.todo}</div>
                  <div className="tcs-label">To Do</div>
                </div>
              </div>
              <div className="tc-progress">
                <div className="tcp-label">
                  <span>Task Completion</span>
                  <span>{pct}%</span>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${pct}%`, background: color }} />
                </div>
              </div>
              <div className="tc-joined">
                Joined {new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary table */}
      <div className="summary-section">
        <h2>Task Distribution</h2>
        <div className="summary-table-wrap">
          <table className="summary-table">
            <thead>
              <tr>
                <th>Member</th>
                <th>Role</th>
                <th>Total Tasks</th>
                <th>To Do</th>
                <th>In Progress</th>
                <th>Done</th>
                <th>Completion</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user, i) => {
                const stats = getUserStats(user.id);
                const pct = stats.total > 0 ? Math.round((stats.done / stats.total) * 100) : 0;
                return (
                  <tr key={user.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div className="mini-av" style={{ background: avatarColors[i % avatarColors.length] }}>{user.avatar}</div>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: 13.5 }}>{user.name}</div>
                          <div style={{ fontSize: 12, color: '#9ca3af' }}>{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td><span className={`role-pill ${user.role}`}>{user.role}</span></td>
                    <td style={{ fontWeight: 600 }}>{stats.total}</td>
                    <td>{stats.todo}</td>
                    <td><span style={{ color: '#f59e0b', fontWeight: 600 }}>{stats.inProgress}</span></td>
                    <td><span style={{ color: '#1D9E75', fontWeight: 600 }}>{stats.done}</span></td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div className="progress-bar" style={{ flex: 1, minWidth: 80 }}>
                          <div className="progress-fill" style={{ width: `${pct}%`, background: avatarColors[i % avatarColors.length] }} />
                        </div>
                        <span style={{ fontSize: 12, fontWeight: 600, minWidth: 30 }}>{pct}%</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
