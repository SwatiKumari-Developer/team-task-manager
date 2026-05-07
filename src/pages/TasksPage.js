import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import './TasksPage.css';

const STATUS_LABELS = { 'todo': 'To Do', 'in-progress': 'In Progress', 'done': 'Done' };
const PRIORITY_COLOR = { high: '#ef4444', medium: '#f59e0b', low: '#10b981' };

export default function TasksPage() {
  const { getMyTasks, getProjectById, getUserById, updateTask, deleteTask, isOverdue, currentUser } = useAuth();
  const [filter, setFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [search, setSearch] = useState('');

  const allTasks = getMyTasks();

  let tasks = allTasks;
  if (filter === 'overdue') tasks = tasks.filter(t => isOverdue(t));
  else if (filter !== 'all') tasks = tasks.filter(t => t.status === filter);
  if (priorityFilter !== 'all') tasks = tasks.filter(t => t.priority === priorityFilter);
  if (search) tasks = tasks.filter(t => t.title.toLowerCase().includes(search.toLowerCase()));

  const formatDate = d => d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—';

  const counts = {
    all: allTasks.length,
    todo: allTasks.filter(t => t.status === 'todo').length,
    'in-progress': allTasks.filter(t => t.status === 'in-progress').length,
    done: allTasks.filter(t => t.status === 'done').length,
    overdue: allTasks.filter(t => isOverdue(t)).length,
  };

  return (
    <div className="tasks-page">
      <div className="page-header">
        <div>
          <h1>My Tasks</h1>
          <p className="page-sub">{currentUser?.role === 'admin' ? 'All tasks across projects' : 'Tasks assigned to you'}</p>
        </div>
      </div>

      {/* Filter bar */}
      <div className="filter-bar">
        <div className="filter-tabs">
          {[['all', 'All'], ['todo', 'To Do'], ['in-progress', 'In Progress'], ['done', 'Done'], ['overdue', '⚠ Overdue']].map(([val, label]) => (
            <button key={val} className={`filter-tab ${filter === val ? 'active' : ''} ${val === 'overdue' ? 'danger' : ''}`} onClick={() => setFilter(val)}>
              {label} <span className="count">{counts[val] ?? 0}</span>
            </button>
          ))}
        </div>
        <div className="filter-right">
          <select value={priorityFilter} onChange={e => setPriorityFilter(e.target.value)} className="priority-sel">
            <option value="all">All Priority</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
          <input className="search-input" placeholder="🔍 Search tasks..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      {/* Task list */}
      {tasks.length === 0 ? (
        <div className="empty-full">
          <div className="empty-icon">✅</div>
          <h3>No tasks found</h3>
          <p>Try changing your filters or go to a project to create tasks.</p>
          <Link to="/projects" className="btn-link">Go to Projects →</Link>
        </div>
      ) : (
        <div className="task-rows">
          {tasks.map(task => {
            const project = getProjectById(task.projectId);
            const assignee = getUserById(task.assigneeId);
            const overdue = isOverdue(task);

            return (
              <div key={task.id} className={`task-row-card ${overdue ? 'overdue' : ''}`}>
                <div className="trc-left">
                  <div className="prio-bar" style={{ background: PRIORITY_COLOR[task.priority] }} />
                  <input
                    type="checkbox"
                    checked={task.status === 'done'}
                    onChange={e => updateTask(task.id, { status: e.target.checked ? 'done' : 'todo' })}
                    className="task-check"
                  />
                </div>
                <div className="trc-body">
                  <div className="trc-title" style={{ textDecoration: task.status === 'done' ? 'line-through' : 'none', color: task.status === 'done' ? '#9ca3af' : '#1a1a2e' }}>
                    {task.title}
                  </div>
                  {task.description && <div className="trc-desc">{task.description}</div>}
                  <div className="trc-meta">
                    {project && <Link to={`/projects/${project.id}`} className="proj-tag">📁 {project.name}</Link>}
                    {assignee && <span className="user-tag">👤 {assignee.name}</span>}
                    {task.dueDate && <span className={`date-tag ${overdue ? 'overdue' : ''}`}>📅 {formatDate(task.dueDate)}</span>}
                  </div>
                </div>
                <div className="trc-right">
                  <select
                    value={task.status}
                    onChange={e => updateTask(task.id, { status: e.target.value })}
                    className={`status-sel sel-${task.status}`}
                  >
                    <option value="todo">To Do</option>
                    <option value="in-progress">In Progress</option>
                    <option value="done">Done</option>
                  </select>
                  <span className={`prio-tag prio-${task.priority}`}>{task.priority}</span>
                  <button className="del-task" onClick={() => { if(window.confirm('Delete task?')) deleteTask(task.id); }}>🗑</button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
