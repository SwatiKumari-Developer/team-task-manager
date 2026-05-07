import React, { createContext, useContext, useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';

const AuthContext = createContext();

const STORAGE_KEYS = {
  USERS: 'ttm_users',
  CURRENT_USER: 'ttm_current_user',
  PROJECTS: 'ttm_projects',
  TASKS: 'ttm_tasks',
};

// Seed demo data
const seedData = () => {
  const existingUsers = localStorage.getItem(STORAGE_KEYS.USERS);
  if (!existingUsers) {
    const adminId = uuidv4();
    const member1Id = uuidv4();
    const member2Id = uuidv4();

    const users = [
      { id: adminId, name: 'Alice Admin', email: 'admin@demo.com', password: 'admin123', role: 'admin', avatar: 'AA', createdAt: new Date().toISOString() },
      { id: member1Id, name: 'Bob Member', email: 'bob@demo.com', password: 'bob123', role: 'member', avatar: 'BM', createdAt: new Date().toISOString() },
      { id: member2Id, name: 'Carol Dev', email: 'carol@demo.com', password: 'carol123', role: 'member', avatar: 'CD', createdAt: new Date().toISOString() },
    ];

    const proj1Id = uuidv4();
    const proj2Id = uuidv4();

    const projects = [
      { id: proj1Id, name: 'Website Redesign', description: 'Complete overhaul of company website with modern UI', ownerId: adminId, members: [adminId, member1Id, member2Id], createdAt: new Date().toISOString(), status: 'active' },
      { id: proj2Id, name: 'Mobile App v2', description: 'New features and performance improvements for mobile app', ownerId: adminId, members: [adminId, member2Id], createdAt: new Date().toISOString(), status: 'active' },
    ];

    const now = new Date();
    const yesterday = new Date(now - 86400000);
    const tomorrow = new Date(now.getTime() + 86400000);
    const nextWeek = new Date(now.getTime() + 7 * 86400000);
    const lastWeek = new Date(now.getTime() - 7 * 86400000);

    const tasks = [
      { id: uuidv4(), title: 'Design homepage mockup', description: 'Create Figma mockups for new homepage layout', projectId: proj1Id, assigneeId: member1Id, createdBy: adminId, status: 'done', priority: 'high', dueDate: yesterday.toISOString(), createdAt: lastWeek.toISOString() },
      { id: uuidv4(), title: 'Set up React project', description: 'Initialize project with CRA, install dependencies', projectId: proj1Id, assigneeId: member1Id, createdBy: adminId, status: 'done', priority: 'high', dueDate: yesterday.toISOString(), createdAt: lastWeek.toISOString() },
      { id: uuidv4(), title: 'Build navigation component', description: 'Responsive nav with mobile hamburger menu', projectId: proj1Id, assigneeId: member2Id, createdBy: adminId, status: 'in-progress', priority: 'medium', dueDate: tomorrow.toISOString(), createdAt: now.toISOString() },
      { id: uuidv4(), title: 'API integration', description: 'Connect frontend to REST API endpoints', projectId: proj1Id, assigneeId: member1Id, createdBy: adminId, status: 'todo', priority: 'high', dueDate: nextWeek.toISOString(), createdAt: now.toISOString() },
      { id: uuidv4(), title: 'Write unit tests', description: 'Test coverage for all utility functions', projectId: proj1Id, assigneeId: member2Id, createdBy: adminId, status: 'todo', priority: 'low', dueDate: nextWeek.toISOString(), createdAt: now.toISOString() },
      { id: uuidv4(), title: 'Overdue task example', description: 'This task is past its due date', projectId: proj1Id, assigneeId: member1Id, createdBy: adminId, status: 'todo', priority: 'high', dueDate: lastWeek.toISOString(), createdAt: lastWeek.toISOString() },
      { id: uuidv4(), title: 'Push notification system', description: 'Implement FCM for push notifications', projectId: proj2Id, assigneeId: member2Id, createdBy: adminId, status: 'in-progress', priority: 'high', dueDate: tomorrow.toISOString(), createdAt: now.toISOString() },
      { id: uuidv4(), title: 'Profile screen UI', description: 'User profile editing screen', projectId: proj2Id, assigneeId: member2Id, createdBy: adminId, status: 'todo', priority: 'medium', dueDate: nextWeek.toISOString(), createdAt: now.toISOString() },
    ];

    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(projects));
    localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
  }
};

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    seedData();
    const savedUser = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    if (savedUser) setCurrentUser(JSON.parse(savedUser));
    setUsers(JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]'));
    setProjects(JSON.parse(localStorage.getItem(STORAGE_KEYS.PROJECTS) || '[]'));
    setTasks(JSON.parse(localStorage.getItem(STORAGE_KEYS.TASKS) || '[]'));
    setLoading(false);
  }, []);

  const saveUsers = (data) => { setUsers(data); localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(data)); };
  const saveProjects = (data) => { setProjects(data); localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(data)); };
  const saveTasks = (data) => { setTasks(data); localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(data)); };

  const signup = (name, email, password, role = 'member') => {
    const existing = users.find(u => u.email === email);
    if (existing) return { error: 'Email already registered' };
    const initials = name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    const newUser = { id: uuidv4(), name, email, password, role, avatar: initials, createdAt: new Date().toISOString() };
    const updated = [...users, newUser];
    saveUsers(updated);
    setCurrentUser(newUser);
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(newUser));
    return { user: newUser };
  };

  const login = (email, password) => {
    const user = users.find(u => u.email === email && u.password === password);
    if (!user) return { error: 'Invalid email or password' };
    setCurrentUser(user);
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
    return { user };
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
  };

  // Projects CRUD
  const createProject = (data) => {
    const project = { id: uuidv4(), ...data, ownerId: currentUser.id, members: [currentUser.id, ...(data.members || [])], createdAt: new Date().toISOString(), status: 'active' };
    saveProjects([...projects, project]);
    return project;
  };

  const updateProject = (id, data) => {
    const updated = projects.map(p => p.id === id ? { ...p, ...data } : p);
    saveProjects(updated);
  };

  const deleteProject = (id) => {
    saveProjects(projects.filter(p => p.id !== id));
    saveTasks(tasks.filter(t => t.projectId !== id));
  };

  const addMemberToProject = (projectId, userId) => {
    const updated = projects.map(p => {
      if (p.id === projectId && !p.members.includes(userId)) {
        return { ...p, members: [...p.members, userId] };
      }
      return p;
    });
    saveProjects(updated);
  };

  const removeMemberFromProject = (projectId, userId) => {
    const updated = projects.map(p => {
      if (p.id === projectId) return { ...p, members: p.members.filter(m => m !== userId) };
      return p;
    });
    saveProjects(updated);
  };

  // Tasks CRUD
  const createTask = (data) => {
    const task = { id: uuidv4(), ...data, createdBy: currentUser.id, createdAt: new Date().toISOString(), status: data.status || 'todo' };
    saveTasks([...tasks, task]);
    return task;
  };

  const updateTask = (id, data) => {
    const updated = tasks.map(t => t.id === id ? { ...t, ...data } : t);
    saveTasks(updated);
  };

  const deleteTask = (id) => {
    saveTasks(tasks.filter(t => t.id !== id));
  };

  // Computed helpers
  const getMyProjects = () => {
    if (!currentUser) return [];
    if (currentUser.role === 'admin') return projects;
    return projects.filter(p => p.members.includes(currentUser.id));
  };

  const getProjectTasks = (projectId) => tasks.filter(t => t.projectId === projectId);

  const getMyTasks = () => {
    if (!currentUser) return [];
    if (currentUser.role === 'admin') return tasks;
    return tasks.filter(t => t.assigneeId === currentUser.id);
  };

  const getUserById = (id) => users.find(u => u.id === id);
  const getProjectById = (id) => projects.find(p => p.id === id);

  const isOverdue = (task) => {
    if (!task.dueDate || task.status === 'done') return false;
    return new Date(task.dueDate) < new Date();
  };

  return (
    <AuthContext.Provider value={{
      currentUser, users, projects, tasks, loading,
      signup, login, logout,
      createProject, updateProject, deleteProject, addMemberToProject, removeMemberFromProject,
      createTask, updateTask, deleteTask,
      getMyProjects, getProjectTasks, getMyTasks,
      getUserById, getProjectById, isOverdue,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
