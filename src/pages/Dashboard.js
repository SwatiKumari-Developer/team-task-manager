import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import './Dashboard.css';

export default function Dashboard() {
  const { currentUser, getMyProjects, getMyTasks, isOverdue, getUserById } = useAuth();

  const projects = getMyProjects();
  const allTasks = getMyTasks();
  const today = new Date();

  const stats = {
    total: allTasks.length,
    todo: allTasks.filter(t => t.status === 'todo').length,
    inProgress: allTasks.filter(t => t.status === 'in-progress').length,
    done: allTasks.filter(t => t.status === 'done').length,
    overdue: allTasks.filter(t => isOverdue(t)).length,
  };

  const recentTasks = [...allTasks]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 6);

  const overdueTasks = allTasks.filter(t => isOverdue(t));

  const priorityColor = { high: '#ef4444', medium: '#f59e0b', low: '#10b981' };
  const statusLabel = { 'todo': 'To Do', 'in-progress': 'In Progress', 'done': 'Done' };
  const statusClass = { 'todo': 'badge-todo', 'in-progress': 'badge-progress', 'done': 'badge-done' };

  const formatDate = (d) => {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="dashboard">
      <div className="page-header">
        <div>
          <h1>Welcome back, {currentUser?.name.split(' ')[0]} 👋</h1>
          <p className="page-sub">Here's what's happening with your projects today.</p>
        </div>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#ede9fe' }}>📋</div>
          <div>
            <div className="stat-value">{stats.total}</div>
            <div className="stat-label">Total Tasks</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#fef3c7' }}>🔄</div>
          <div>
            <div className="stat-value">{stats.inProgress}</div>
            <div className="stat-label">In Progress</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#d1fae5' }}>✅</div>
          <div>
            <div className="stat-value">{stats.done}</div>
            <div className="stat-label">Completed</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#fee2e2' }}>⚠️</div>
          <div>
            <div className="stat-value" style={{ color: stats.overdue > 0 ? '#ef4444' : undefined }}>{stats.overdue}</div>
            <div className="stat-label">Overdue</div>
          </div>
        </div>
      </div>

      <div className="dash-grid">
        {/* Projects */}
        <div className="dash-card">
          <div className="card-header">
            <h2>My Projects</h2>
            <Link to="/projects" className="card-link">View all →</Link>
          </div>
          {projects.length === 0 ? (
            <div className="empty-state">No projects yet. <Link to="/projects">Create one →</Link></div>
          ) : (
            <div className="project-list">
              {projects.slice(0, 4).map(p => {
                const pTasks = allTasks.filter(t => t.projectId === p.id);
                const done = pTasks.filter(t => t.status === 'done').length;
                const pct = pTasks.length > 0 ? Math.round((done / pTasks.length) * 100) : 0;
                return (
                  <Link to={`/projects/${p.id}`} key={p.id} className="project-row">
                    <div className="project-color" style={{ background: '#1D9E75' }} />
                    <div className="project-info">
                      <div className="project-name">{p.name}</div>
                      <div className="project-meta">{pTasks.length} tasks · {p.members.length} members</div>
                      <div className="progress-bar">
                        <div className="progress-fill" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                    <div className="project-pct">{pct}%</div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* Overdue */}
        <div className="dash-card">
          <div className="card-header">
            <h2>⚠️ Overdue Tasks</h2>
            <Link to="/tasks" className="card-link">View all →</Link>
          </div>
          {overdueTasks.length === 0 ? (
            <div className="empty-state success">🎉 No overdue tasks! Great job.</div>
          ) : (
            <div className="task-list">
              {overdueTasks.slice(0, 5).map(t => (
                <div key={t.id} className="task-row overdue">
                  <div className="task-dot" style={{ background: priorityColor[t.priority] }} />
                  <div className="task-info">
                    <div className="task-title">{t.title}</div>
                    <div className="task-meta">Due: {formatDate(t.dueDate)}</div>
                  </div>
                  <span className={`badge ${statusClass[t.status]}`}>{statusLabel[t.status]}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent tasks */}
        <div className="dash-card full-width">
          <div className="card-header">
            <h2>Recent Tasks</h2>
            <Link to="/tasks" className="card-link">View all →</Link>
          </div>
          {recentTasks.length === 0 ? (
            <div className="empty-state">No tasks yet.</div>
          ) : (
            <div className="table-wrap">
              <table className="task-table">
                <thead>
                  <tr>
                    <th>Task</th>
                    <th>Status</th>
                    <th>Priority</th>
                    <th>Assignee</th>
                    <th>Due Date</th>
                  </tr>
                </thead>
                <tbody>
                  {recentTasks.map(t => {
                    const assignee = getUserById(t.assigneeId);
                    return (
                      <tr key={t.id} className={isOverdue(t) ? 'row-overdue' : ''}>
                        <td>{t.title}</td>
                        <td><span className={`badge ${statusClass[t.status]}`}>{statusLabel[t.status]}</span></td>
                        <td><span className="priority-dot" style={{ color: priorityColor[t.priority] }}>● {t.priority}</span></td>
                        <td>
                          {assignee ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                              <div className="mini-avatar">{assignee.avatar}</div>
                              <span>{assignee.name.split(' ')[0]}</span>
                            </div>
                          ) : '—'}
                        </td>
                        <td style={{ color: isOverdue(t) ? '#ef4444' : undefined }}>{formatDate(t.dueDate)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
