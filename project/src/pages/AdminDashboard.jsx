import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/Authenticate';
import { API_BASE_URL } from '../config/api';
import './admin.css';

const AdminDashboard = () => {
  const { user, authenticatedFetch } = useAuth();
  const navigate = useNavigate();

  const [applications, setApplications] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [loadingApps, setLoadingApps] = useState(true);
  const [loadingJobs, setLoadingJobs] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [activeTab, setActiveTab] = useState('applications');

  // Redirect non-admins
  useEffect(() => {
    if (user && user.role !== 'ADMIN') {
      navigate('/');
    }
  }, [user, navigate]);

  // Fetch all applications from backend
  useEffect(() => {
    authenticatedFetch(`${API_BASE_URL}/applications`)
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch applications');
        return res.json();
      })
      .then((data) => {
        setApplications(data);
        setLoadingApps(false);
      })
      .catch((err) => {
        console.error(err);
        setApplications([]);
        setLoadingApps(false);
      });
  }, []);

  // Fetch all jobs from backend
  useEffect(() => {
    authenticatedFetch(`${API_BASE_URL}/jobs`)
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch jobs');
        return res.json();
      })
      .then((data) => {
        const fixedJobs = data.map((job) => ({
          ...job,
          skills: job.skills ? job.skills.split(',').map((s) => s.trim()) : [],
        }));
        setJobs(fixedJobs);
        setLoadingJobs(false);
      })
      .catch((err) => {
        console.error(err);
        setJobs([]);
        setLoadingJobs(false);
      });
  }, []);

  const handleStatusChange = (appId, newStatus) => {
    authenticatedFetch(`${API_BASE_URL}/applications/${appId}`, {
      method: 'PUT',
      body: JSON.stringify({ status: newStatus }),
    })
      .then((res) => {
        if (res.ok) {
          setApplications((prev) =>
            prev.map((app) => (app.id === appId ? { ...app, status: newStatus } : app))
          );
        } else {
          alert('Failed to update status');
        }
      })
      .catch((err) => {
        console.error('Error updating status:', err);
        alert('Failed to update status');
      });
  };

  const handleRemoveJob = (jobId) => {
    if (window.confirm('Are you sure you want to delete this job listing? Warning: This will also delete any student applications associated with this job.')) {
      authenticatedFetch(`${API_BASE_URL}/jobs/${jobId}`, {
        method: 'DELETE',
      })
        .then((res) => {
          if (res.ok) {
            setJobs((prev) => prev.filter((j) => j.id !== jobId));
            // Also filter out any applications associated with this job from local state
            setApplications((prev) => prev.filter((app) => app.job?.id !== jobId));
          } else {
            alert('Failed to delete job. Please verify your permissions.');
          }
        })
        .catch((err) => {
          console.error('Error deleting job:', err);
          alert('Error deleting job.');
        });
    }
  };

  const loading = loadingApps || loadingJobs;

  // Unique categories from backend jobs
  const jobCategories = ['All', ...new Set(jobs.map((j) => j.category).filter(Boolean))];

  // Filter applications
  const filtered = applications.filter((app) => {
    const q = search.toLowerCase().trim();
    const studentName = (app.user?.name || app.user?.username || app.user?.email || '').toLowerCase();
    const jobTitle = (app.job?.title || '').toLowerCase();
    const company = (app.job?.company || '').toLowerCase();
    const jobCategory = app.job?.category || '';

    const matchesSearch =
      !q || studentName.includes(q) || jobTitle.includes(q) || company.includes(q);
    const matchesCategory =
      selectedCategory === 'All' || jobCategory === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  // Stats
  const totalStudents = new Set(applications.map((a) => a.user?.id)).size;
  const totalApplications = applications.length;
  const categoryCounts = {};
  applications.forEach((app) => {
    const cat = app.job?.category || 'Unknown';
    categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
  });

  if (loading) {
    return (
      <div className="page-loading">
        <div className="page-spinner" />
        <p className="loading-text">Loading Admin Dashboard…</p>
      </div>
    );
  }

  return (
    <div className="admin-page">
      {/* Header */}
      <div className="admin-header">
        <div className="admin-header-left">
          <div className="admin-badge">👑 Admin Panel</div>
          <h1 className="admin-title">Admin Dashboard</h1>
          <p className="admin-subtitle">Monitor student applications and job listings</p>
        </div>
      </div>

      {/* Stats */}
      <div className="admin-stats-grid">
        <div className="admin-stat-card">
          <div className="admin-stat-icon">👨‍🎓</div>
          <div className="admin-stat-value">{totalStudents}</div>
          <div className="admin-stat-label">Total Students</div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-icon">📋</div>
          <div className="admin-stat-value">{totalApplications}</div>
          <div className="admin-stat-label">Applications</div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-icon">💼</div>
          <div className="admin-stat-value">{jobs.length}</div>
          <div className="admin-stat-label">Jobs Listed</div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-icon">📂</div>
          <div className="admin-stat-value">{jobCategories.length - 1}</div>
          <div className="admin-stat-label">Categories</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="admin-tabs">
        <button
          className={`admin-tab${activeTab === 'applications' ? ' active' : ''}`}
          onClick={() => setActiveTab('applications')}
        >
          📋 Student Applications ({totalApplications})
        </button>
        <button
          className={`admin-tab${activeTab === 'jobs' ? ' active' : ''}`}
          onClick={() => setActiveTab('jobs')}
        >
          💼 All Jobs ({jobs.length})
        </button>
      </div>

      {/* ── Applications Tab ─────────────────────────────────────────── */}
      {activeTab === 'applications' && (
        <div className="admin-section">
          <div className="admin-filters">
            <div className="admin-search-wrapper">
              <span className="search-icon">🔍</span>
              <input
                className="admin-search-input"
                type="text"
                placeholder="Search by student name, job, or company…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              {search && (
                <button className="search-clear" onClick={() => setSearch('')}>✕</button>
              )}
            </div>
            <div className="admin-cat-chips">
              {jobCategories.map((cat) => (
                <button
                  key={cat}
                  className={`filter-chip${selectedCategory === cat ? ' active' : ''}`}
                  onClick={() => setSelectedCategory(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <p className="admin-result-count">
            Showing {filtered.length} of {totalApplications} applications
          </p>

          {filtered.length === 0 ? (
            <div className="admin-empty">
              <div className="admin-empty-icon">📭</div>
              <h3>No applications found</h3>
              <p>
                {totalApplications === 0
                  ? 'No students have applied for any jobs yet.'
                  : 'Try adjusting your search or filters.'}
              </p>
            </div>
          ) : (
            <div className="admin-table-wrapper">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Student</th>
                    <th>Email</th>
                    <th>Job Title</th>
                    <th>Company</th>
                    <th>Category</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((app, idx) => (
                    <tr key={app.id || idx}>
                      <td className="admin-td-num">{idx + 1}</td>
                      <td>
                        <div className="admin-student-cell">
                          <div className="admin-avatar">
                            {(app.user?.name || app.user?.username || app.user?.email || 'S')
                              .slice(0, 2)
                              .toUpperCase()}
                          </div>
                          <span>
                            {app.user?.name || app.user?.username || `Student #${app.user?.id}`}
                          </span>
                        </div>
                      </td>
                      <td className="admin-td-email">{app.user?.email || '—'}</td>
                      <td className="admin-td-job">{app.job?.title || `Job #${app.job?.id}`}</td>
                      <td>{app.job?.company || '—'}</td>
                      <td>
                        {app.job?.category ? (
                          <span
                            className={`admin-cat-badge cat-${(app.job.category || '').toLowerCase()}`}
                          >
                            {app.job.category}
                          </span>
                        ) : (
                          '—'
                        )}
                      </td>
                      <td>
                        <select
                          value={app.status || 'Applied'}
                          onChange={(e) => handleStatusChange(app.id, e.target.value)}
                          style={{
                            background: '#ffffff',
                            color: '#0f172a',
                            border: '1px solid rgba(29,78,216,0.2)',
                            borderRadius: '6px',
                            padding: '5px 10px',
                            fontSize: '0.82rem',
                            cursor: 'pointer',
                            fontWeight: '600',
                          }}
                        >
                          <option value="Applied">Applied</option>
                          <option value="Under Review">Under Review</option>
                          <option value="Shortlisted">Shortlisted</option>
                          <option value="Rejected">Rejected</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ── Jobs Tab ─────────────────────────────────────────────────── */}
      {activeTab === 'jobs' && (
        <div className="admin-section">
          <div className="admin-cat-chips" style={{ marginBottom: '1.5rem' }}>
            {jobCategories.map((cat) => (
              <button
                key={cat}
                className={`filter-chip${selectedCategory === cat ? ' active' : ''}`}
                onClick={() => setSelectedCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>

          {jobs.length === 0 ? (
            <div className="admin-empty">
              <div className="admin-empty-icon">💼</div>
              <h3>No jobs found in the database</h3>
              <p>The backend server may be restarting. Please refresh in a moment.</p>
            </div>
          ) : (
            <div className="admin-table-wrapper">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Job Title</th>
                    <th>Company</th>
                    <th>Location</th>
                    <th>Category</th>
                    <th>Type</th>
                    <th>Salary</th>
                    <th>Remote</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {jobs
                    .filter(
                      (job) =>
                        selectedCategory === 'All' || job.category === selectedCategory
                    )
                    .map((job, idx) => (
                      <tr key={job.id}>
                        <td className="admin-td-num">{idx + 1}</td>
                        <td className="admin-td-job">
                          <button
                            className="admin-job-link"
                            onClick={() => navigate(`/job/${job.id}`)}
                          >
                            {job.title}
                          </button>
                        </td>
                        <td>{job.company}</td>
                        <td>{job.location}</td>
                        <td>
                          <span
                            className={`admin-cat-badge cat-${(job.category || '').toLowerCase()}`}
                          >
                            {job.category}
                          </span>
                        </td>
                        <td>{job.type}</td>
                        <td className="admin-td-salary">{job.salary}</td>
                        <td>{job.remote ? '🌐 Yes' : '🏢 No'}</td>
                        <td>
                          <button
                            onClick={() => handleRemoveJob(job.id)}
                            style={{
                              background: '#ef4444',
                              color: '#fff',
                              border: 'none',
                              borderRadius: '4px',
                              padding: '6px 12px',
                              fontSize: '0.8rem',
                              fontWeight: '600',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px',
                            }}
                          >
                            🗑 Remove
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
