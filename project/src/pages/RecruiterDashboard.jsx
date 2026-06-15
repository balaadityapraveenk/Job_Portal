import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/Authenticate';
import { API_BASE_URL } from '../config/api';
import './admin.css';

const emptyForm = {
  title: '',
  location: '',
  salary: '',
  category: 'Engineering',
  type: 'Full-Time',
  experience: '0-1 years',
  skills: '',
  description: '',
  responsibilities: '',
  requirements: '',
  remote: false,
  deadline: '',
};

const RecruiterDashboard = () => {
  const { user, authenticatedFetch } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState(emptyForm);
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user && user.role !== 'RECRUITER') {
      navigate('/');
    }
  }, [user, navigate]);

  const loadRecruiterData = () => {
    setLoading(true);
    Promise.all([
      authenticatedFetch(`${API_BASE_URL}/jobs`).then((res) => res.ok ? res.json() : []),
      authenticatedFetch(`${API_BASE_URL}/applications`).then((res) => res.ok ? res.json() : []),
    ])
      .then(([allJobs, apps]) => {
        setJobs(allJobs.filter((job) => job.recruiterId === user?.id));
        setApplications(apps);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (user?.id && user.role === 'RECRUITER') {
      loadRecruiterData();
    }
  }, [user?.id]);

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    if (status) setStatus('');
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setStatus('Saving job...');

    authenticatedFetch(`${API_BASE_URL}/jobs`, {
      method: 'POST',
      body: JSON.stringify({
        ...form,
        company: user?.companyName,
      }),
    })
      .then(async (res) => {
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body.detail || 'Failed to publish job');
        }
        return res.json();
      })
      .then((job) => {
        setJobs((prev) => [job, ...prev]);
        setForm(emptyForm);
        setStatus('Job published successfully.');
      })
      .catch((error) => setStatus(error.message));
  };

  const handleRemoveJob = (jobId) => {
    authenticatedFetch(`${API_BASE_URL}/jobs/${jobId}`, { method: 'DELETE' })
      .then((res) => {
        if (!res.ok) throw new Error('Failed to remove job');
        setJobs((prev) => prev.filter((job) => job.id !== jobId));
      })
      .catch((error) => setStatus(error.message));
  };

  if (loading) {
    return (
      <div className="page-loading">
        <div className="page-spinner" />
        <p className="loading-text">Loading recruiter dashboard...</p>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <div className="admin-header">
        <div className="admin-header-left">
          <div className="admin-badge">Recruiter Panel</div>
          <h1 className="admin-title">{user?.companyName || 'Company'} Hiring Dashboard</h1>
          <p className="admin-subtitle">Publish jobs directly to the portal and review applications.</p>
        </div>
      </div>

      <div className="admin-stats-grid">
        <div className="admin-stat-card">
          <div className="admin-stat-icon">+</div>
          <div className="admin-stat-value">{jobs.length}</div>
          <div className="admin-stat-label">Posted Jobs</div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-icon">#</div>
          <div className="admin-stat-value">{applications.length}</div>
          <div className="admin-stat-label">Applications</div>
        </div>
      </div>

      <div className="recruiter-layout">
        <section className="admin-section recruiter-form-panel">
          <h2 className="section-title">Add New Job</h2>
          {status && <div className="error-message recruiter-status">{status}</div>}
          <form onSubmit={handleSubmit} className="recruiter-form">
            <div className="apply-form-row">
              <div className="form-group">
                <label className="form-label">Job Title</label>
                <input name="title" className="form-control" value={form.title} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label className="form-label">Location</label>
                <input name="location" className="form-control" value={form.location} onChange={handleChange} required />
              </div>
            </div>

            <div className="apply-form-row">
              <div className="form-group">
                <label className="form-label">Salary</label>
                <input name="salary" className="form-control" value={form.salary} onChange={handleChange} placeholder="₹8 - ₹12 LPA" />
              </div>
              <div className="form-group">
                <label className="form-label">Category</label>
                <input name="category" className="form-control" value={form.category} onChange={handleChange} />
              </div>
            </div>

            <div className="apply-form-row">
              <div className="form-group">
                <label className="form-label">Type</label>
                <select name="type" className="form-control" value={form.type} onChange={handleChange}>
                  <option>Full-Time</option>
                  <option>Part-Time</option>
                  <option>Internship</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Experience</label>
                <input name="experience" className="form-control" value={form.experience} onChange={handleChange} />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Skills</label>
              <input name="skills" className="form-control" value={form.skills} onChange={handleChange} placeholder="React, Node.js, MongoDB" />
            </div>

            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea name="description" className="form-control" rows={4} value={form.description} onChange={handleChange} required />
            </div>

            <div className="apply-form-row">
              <div className="form-group">
                <label className="form-label">Responsibilities</label>
                <textarea name="responsibilities" className="form-control" rows={3} value={form.responsibilities} onChange={handleChange} placeholder="Use | between points" />
              </div>
              <div className="form-group">
                <label className="form-label">Requirements</label>
                <textarea name="requirements" className="form-control" rows={3} value={form.requirements} onChange={handleChange} placeholder="Use | between points" />
              </div>
            </div>

            <label className="recruiter-check">
              <input name="remote" type="checkbox" checked={form.remote} onChange={handleChange} />
              Remote job
            </label>

            <button className="auth-submit-btn" type="submit">Publish Job</button>
          </form>
        </section>

        <section className="admin-section">
          <h2 className="section-title">Your Jobs</h2>
          {jobs.length === 0 ? (
            <div className="admin-empty">
              <h3>No jobs posted yet</h3>
              <p>Create the first listing for your company.</p>
            </div>
          ) : (
            <div className="admin-table-wrapper">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Location</th>
                    <th>Type</th>
                    <th>Applications</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {jobs.map((job) => (
                    <tr key={job.id}>
                      <td className="admin-td-job">{job.title}</td>
                      <td>{job.location}</td>
                      <td>{job.type}</td>
                      <td>{applications.filter((app) => app.job?.id === job.id).length}</td>
                      <td>
                        <button className="admin-remove-btn" onClick={() => handleRemoveJob(job.id)}>
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default RecruiterDashboard;
