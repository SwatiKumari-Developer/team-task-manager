import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Modal from '../components/Modal';
import './ProjectDetail.css';

const STATUSES = ['todo', 'in-progress', 'done'];
const STATUS_LABELS = { 'todo': 'To Do', 'in-progress': 'In Progress', 'done': 'Done' };
const PRIORITIES = ['low', 'medium', 'high'];
const PRIORITY_COLOR = { high: '#ef4444', medium: '#f59e0b', low: '#10b981' };

export default function ProjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser, getProjectById, getProjectTasks, users, createTask, updateTask, deleteTask, addMemberToProject, removeMemberFromProject, deleteProject, isOverdue } = useAuth();

  const project = getProjectById(id);
  const tasks = getProjectTasks(id);

  const [showTaskModal, setShowTaskModal] = useState(false);
  const [editTask, setEditTask] = useState(null);
  const [taskForm, setTaskForm] = useState({ title: '', description: '', assigneeId: '', priority: 'medium', dueDate: '', status: 'todo' });
  const [activeTab, setActiveTab] = useState('board');

  if (!project) return <div style={{ padding: '2rem' }}>Project not found. <Link to="/projects">Back to Projects</Link></div>;

  const isAdmin = currentUser?.role === 'admin';
  const isOwner = project.ownerId === currentUser?.id;
  const canManage = isAdmin || isOwner;

  const projectMembers = users.filter(u => project.members.includes(u.id));
  const nonMembers = users.filter(u => !project.members.includes(u.id));

  const openCreate = () => {
    setEditTask(null);
    setTaskForm({ title: '', description: '', assigneeId: currentUser.id, priority: 'medium', dueDate: '', status: 'todo' });
    setShowTaskModal(true);
  };

  const openEdit = (task) => {
    setEditTask(task);
    setTaskForm({ title: task.title, description: task.description || '', assigneeId: task.assigneeId || '', priority: task.priority || 'medium', dueDate: task.dueDate ? task.dueDate.split('T')[0] : '', status: task.status });
    setShowTaskModal(true);
  };

  const handleTaskForm = e => setTaskForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const submitTask = e => {
    e.preventDefault();
    if (!taskForm.title.trim()) return;
    const data = { ...taskForm, projectId: id, dueDate: taskForm.dueDate ? new Date(taskForm.dueDate).toISOString() : null };
    if (editTask) updateTask(editTask.id, data);
    else createTask(data);
    setShowTaskModal(false);
  };

  const moveTask = (taskId, status) => updateTask(taskId, { status });

  const handleDeleteProject = () => {
    if (window.confirm('Delete this project and all its tasks?')) {
      deleteProject(id);
      navigate('/projects');
    }
  };

  const formatDate = d => d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—';

  return (
    <div className="project-detail">
      {/* Header */}
      <div className="pd-header">
        <div className="pd-breadcrumb">
          <Link to="/projects">Projects</Link> / <span>{project.name}</span>
        </div>
        <div className="pd-title-row">
          <div>
            <h1>{project.name}</h1>
            {project.description && <p className="pd-desc">{project.description}</p>}
          </div>
          <div className="pd-actions">
            <button className="btn-add-task" onClick={openCreate}>+ Add Task</button>
            {canManage && <button className="btn-danger-sm" onClick={handleDeleteProject}>Delete</button>}
          </div>
        </div>
        <div className="pd-tabs">
          {['board', 'list', 'members'].map(t => (
            <button key={t} className={`pd-tab ${activeTab === t ? 'active' : ''}`} onClick={() => setActiveTab(t)}>
              {t === 'board' ? '🗂 Board' : t === 'list' ? '📋 List' : '👥 Members'}
            </button>
          ))}
        </div>
      </div>

      {/* Board View */}
      {activeTab === 'board' && (
        <div className="kanban-board">
          {STATUSES.map(status => {
            const colTasks = tasks.filter(t => t.status === status);
            return (
              <div key={status} className="kanban-col">
                <div className="col-header">
                  <span className={`col-badge ${status}`}>{STATUS_LABELS[status]}</span>
                  <span className="col-count">{colTasks.length}</span>
                </div>
                <div className="task-cards">
                  {colTasks.map(task => {
                    const assignee = users.find(u => u.id === task.assigneeId);
                    const overdue = isOverdue(task);
                    return (
                      <div key={task.id} className={`task-card ${overdue ? 'overdue' : ''}`} onClick={() => openEdit(task)}>
                        <div className="tc-priority" style={{ background: PRIORITY_COLOR[task.priority] || '#ccc' }} />
                        <div className="tc-title">{task.title}</div>
                        {task.description && <div className="tc-desc">{task.description}</div>}
                        <div className="tc-footer">
                          <div className="tc-meta">
                            {overdue && <span className="overdue-tag">⚠ Overdue</span>}
                            {task.dueDate && !overdue && <span className="due-tag">📅 {formatDate(task.dueDate)}</span>}
                          </div>
                          {assignee && <div className="tc-avatar" title={assignee.name}>{assignee.avatar}</div>}
                        </div>
                        <div className="tc-actions" onClick={e => e.stopPropagation()}>
                          {status !== 'todo' && <button onClick={() => moveTask(task.id, STATUSES[STATUSES.indexOf(status) - 1])}>◀</button>}
                          {status !== 'done' && <button onClick={() => moveTask(task.id, STATUSES[STATUSES.indexOf(status) + 1])}>▶</button>}
                          {canManage && <button className="del" onClick={() => { if(window.confirm('Delete?')) deleteTask(task.id); }}>🗑</button>}
                        </div>
                      </div>
                    );
                  })}
                  {colTasks.length === 0 && <div className="col-empty">Drop tasks here</div>}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* List View */}
      {activeTab === 'list' && (
        <div className="list-view">
          <table className="task-table">
            <thead>
              <tr>
                <th>Task</th><th>Status</th><th>Priority</th><th>Assignee</th><th>Due Date</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {tasks.length === 0 && (
                <tr><td colSpan={6} style={{ textAlign:'center', color:'#9ca3af', padding:'2rem' }}>No tasks yet. Click + Add Task to create one.</td></tr>
              )}
              {tasks.map(task => {
                const assignee = users.find(u => u.id === task.assigneeId);
                const overdue = isOverdue(task);
                return (
                  <tr key={task.id} className={overdue ? 'row-overdue' : ''}>
                    <td>
                      <div className="tl-title">{task.title}</div>
                      {task.description && <div className="tl-desc">{task.description}</div>}
                    </td>
                    <td><span className={`badge badge-${task.status}`}>{STATUS_LABELS[task.status]}</span></td>
                    <td><span style={{ color: PRIORITY_COLOR[task.priority], fontWeight:600, fontSize:12, textTransform:'capitalize' }}>● {task.priority}</span></td>
                    <td>{assignee ? <div className="assignee-cell"><div className="mini-av">{assignee.avatar}</div>{assignee.name.split(' ')[0]}</div> : '—'}</td>
                    <td style={{ color: overdue ? '#ef4444' : '#374151', fontSize: 13 }}>{formatDate(task.dueDate)}</td>
                    <td>
                      <div className="action-btns">
                        <button className="act-btn" onClick={() => openEdit(task)}>✏️</button>
                        {canManage && <button className="act-btn red" onClick={() => { if(window.confirm('Delete?')) deleteTask(task.id); }}>🗑</button>}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Members View */}
      {activeTab === 'members' && (
        <div className="members-view">
          <h2>Project Members ({projectMembers.length})</h2>
          <div className="members-grid">
            {projectMembers.map(u => (
              <div key={u.id} className="member-card">
                <div className="mc-avatar">{u.avatar}</div>
                <div className="mc-info">
                  <div className="mc-name">{u.name}</div>
                  <div className="mc-email">{u.email}</div>
                  <span className={`role-badge role-${u.role}`}>{u.role}</span>
                </div>
                {canManage && u.id !== project.ownerId && (
                  <button className="remove-btn" onClick={() => removeMemberFromProject(id, u.id)}>Remove</button>
                )}
              </div>
            ))}
          </div>
          {canManage && nonMembers.length > 0 && (
            <div className="add-members-section">
              <h3>Add Members</h3>
              <div className="add-members-list">
                {nonMembers.map(u => (
                  <div key={u.id} className="add-member-row">
                    <div className="mini-av">{u.avatar}</div>
                    <span>{u.name} ({u.role})</span>
                    <button className="btn-add-member" onClick={() => addMemberToProject(id, u.id)}>+ Add</button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Task Modal */}
      <Modal show={showTaskModal} title={editTask ? 'Edit Task' : 'Create Task'} onClose={() => setShowTaskModal(false)}>
        <form onSubmit={submitTask}>
          <div className="form-group">
            <label>Task Title *</label>
            <input name="title" value={taskForm.title} onChange={handleTaskForm} placeholder="What needs to be done?" required />
          </div>
          <div className="form-group">
            <label>Description</label>
            <textarea name="description" value={taskForm.description} onChange={handleTaskForm} rows={3} placeholder="Details about this task..." />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Status</label>
              <select name="status" value={taskForm.status} onChange={handleTaskForm}>
                {STATUSES.map(s => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Priority</label>
              <select name="priority" value={taskForm.priority} onChange={handleTaskForm}>
                {PRIORITIES.map(p => <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
              </select>
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Assign To</label>
              <select name="assigneeId" value={taskForm.assigneeId} onChange={handleTaskForm}>
                <option value="">Unassigned</option>
                {projectMembers.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Due Date</label>
              <input name="dueDate" type="date" value={taskForm.dueDate} onChange={handleTaskForm} />
            </div>
          </div>
          <div className="modal-actions">
            <button type="button" className="btn-cancel" onClick={() => setShowTaskModal(false)}>Cancel</button>
            <button type="submit" className="btn-submit">{editTask ? 'Update Task' : 'Create Task'}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
