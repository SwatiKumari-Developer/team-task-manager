import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Modal from '../components/Modal';
import './ProjectsPage.css';

export default function ProjectsPage() {
  const { currentUser, getMyProjects, getProjectTasks, users, createProject, deleteProject } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', description: '', members: [] });
  const [error, setError] = useState('');

  const projects = getMyProjects();
  const isAdmin = currentUser?.role === 'admin';

  const handle = e => setForm({ ...form, [e.target.name]: e.target.value });

  const toggleMember = (uid) => {
    setForm(f => ({
      ...f,
      members: f.members.includes(uid) ? f.members.filter(m => m !== uid) : [...f.members, uid]
    }));
  };

  const submit = (e) => {
    e.preventDefault();
    if (!form.name.trim()) { setError('Project name is required'); return; }
    createProject({ name: form.name, description: form.description, members: form.members });
    setShowModal(false);
    setForm({ name: '', description: '', members: [] });
    setError('');
  };

  return (
    <div className="projects-page">
      <div className="page-header">
        <div>
          <h1>Projects</h1>
          <p className="page-sub">{projects.length} project{projects.length !== 1 ? 's' : ''} total</p>
        </div>
        {isAdmin && (
          <button className="btn-create" onClick={() => setShowModal(true)}>+ New Project</button>
        )}
      </div>

      {projects.length === 0 ? (
        <div className="empty-full">
          <div className="empty-icon">📁</div>
          <h3>No projects yet</h3>
          <p>Create your first project to get started.</p>
          {isAdmin && <button className="btn-create" onClick={() => setShowModal(true)}>Create Project</button>}
        </div>
      ) : (
        <div className="projects-grid">
          {projects.map(p => {
            const pTasks = getProjectTasks(p.id);
            const done = pTasks.filter(t => t.status === 'done').length;
            const pct = pTasks.length > 0 ? Math.round((done / pTasks.length) * 100) : 0;
            const colors = ['#1D9E75', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444', '#ec4899'];
            const color = colors[p.name.charCodeAt(0) % colors.length];

            return (
              <div key={p.id} className="project-card">
                <div className="project-card-header" style={{ background: color }}>
                  <div className="project-initials">{p.name.slice(0, 2).toUpperCase()}</div>
                  {isAdmin && (
                    <button className="del-btn" onClick={(e) => { e.preventDefault(); if(window.confirm('Delete project?')) deleteProject(p.id); }}>🗑</button>
                  )}
                </div>
                <div className="project-card-body">
                  <h3>{p.name}</h3>
                  <p className="proj-desc">{p.description || 'No description'}</p>
                  <div className="proj-stats">
                    <span>📋 {pTasks.length} tasks</span>
                    <span>👥 {p.members.length} members</span>
                  </div>
                  <div className="progress-bar" style={{ margin: '10px 0 4px' }}>
                    <div className="progress-fill" style={{ width: `${pct}%`, background: color }} />
                  </div>
                  <div className="progress-label">{pct}% complete</div>
                  <Link to={`/projects/${p.id}`} className="btn-view">View Project →</Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Modal show={showModal} title="Create New Project" onClose={() => { setShowModal(false); setError(''); }}>
        <form onSubmit={submit}>
          <div className="form-group">
            <label>Project Name *</label>
            <input name="name" value={form.name} onChange={handle} placeholder="e.g. Website Redesign" required />
          </div>
          <div className="form-group">
            <label>Description</label>
            <textarea name="description" value={form.description} onChange={handle} placeholder="What is this project about?" rows={3} />
          </div>
          <div className="form-group">
            <label>Add Members</label>
            <div className="member-checkboxes">
              {users.filter(u => u.id !== currentUser.id).map(u => (
                <label key={u.id} className="member-check">
                  <input type="checkbox" checked={form.members.includes(u.id)} onChange={() => toggleMember(u.id)} />
                  <div className="mini-av">{u.avatar}</div>
                  <span>{u.name} <em>({u.role})</em></span>
                </label>
              ))}
            </div>
          </div>
          {error && <div className="form-error">{error}</div>}
          <div className="modal-actions">
            <button type="button" className="btn-cancel" onClick={() => setShowModal(false)}>Cancel</button>
            <button type="submit" className="btn-submit">Create Project</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
