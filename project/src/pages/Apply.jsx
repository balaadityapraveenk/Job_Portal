import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/Authenticate';
import { API_BASE_URL } from '../config/api';
import './apply.css';

const Apply = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, authenticatedFetch } = useAuth();

  const [job, setJob] = useState(null);
  const [loadingJob, setLoadingJob] = useState(true);

  const [formData, setFormData] = useState({
    fullName: user?.username || '',
    email: user?.email || '',
    phone: '',
    experience: '',
    coverLetter: '',
    resumeLink: '',
  });

  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        fullName: prev.fullName || user.username || '',
        email: prev.email || user.email || '',
      }));
    }
  }, [user]);

  const [status, setStatus] = useState('idle');
  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetch(`${API_BASE_URL}/jobs/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error('Job not found');
        return res.json();
      })
      .then((data) => {
        const fixedJob = {
          ...data,
          skills: data.skills ? data.skills.split(',').map((s) => s.trim()) : [],
          type: data.type || 'Full-Time',
          experience: data.experience || '0-1 years',
        };
        setJob(fixedJob);
        setLoadingJob(false);
      })
      .catch(() => {
        setJob(null);
        setLoadingJob(false);
      });
  }, [id]);

  const validate = () => {
    const e = {};
    if (!formData.fullName.trim()) e.fullName = 'Full name is required';
    if (!formData.email.trim()) e.email = 'Email is required';
    if (!formData.phone.trim()) e.phone = 'Phone number is required';
    if (!formData.coverLetter.trim()) e.coverLetter = 'Please add a brief cover letter';
    return e;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setStatus('submitting');

    authenticatedFetch(`${API_BASE_URL}/applications`, {
      method: 'POST',
      body: JSON.stringify({
        status: 'Applied',
        user: { id: user?.id },
        job: { id: Number(id) },
      }),
    })
      .then(async (res) => {
        if (!res.ok) {
          const text = await res.text();
          let msg = text;
          try {
            const parsed = JSON.parse(text);
            msg = parsed.detail || parsed.message || text;
          } catch (e) {}
          throw new Error(msg || 'Application failed');
        }
        return res.json();
      })
      .then(() => setStatus('success'))
      .catch((err) => {
        setStatus('error');
        setErrors({ general: err.message || 'Application submission failed. Please try again.' });
      });
  };

  if (loadingJob) {
    return (
      <div className="page-loading">
        <div className="page-spinner" />
        <p className="loading-text">Loading application form…</p>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="apply-not-found">
        <div>🔍</div>
        <h2>Job not found</h2>
        <Link to="/jobs" className="btn-primary">Back to Jobs</Link>
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div className="apply-success-page">
        <div className="apply-success-card">
          <div className="apply-success-icon">🎉</div>
          <h2 className="apply-success-title">Application Submitted!</h2>
          <p className="apply-success-msg">
            Your application for <strong>{job.title}</strong> at{' '}
            <strong>{job.company}</strong> has been received.
          </p>
          <div className="apply-success-actions">
            <button className="btn-primary" onClick={() => navigate('/applications')}>
              📋 View My Applications
            </button>
            <button className="btn-secondary" onClick={() => navigate('/jobs')}>
              🔍 Browse More Jobs
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="apply-page">
      <button className="jd-back-btn" onClick={() => navigate(`/job/${id}`)}>
        ← Back to Job Details
      </button>

      <div className="apply-layout">
        <div className="apply-form-container">
          <div className="apply-form-header">
            <div className="section-tag">Application Form</div>
            <h1 className="apply-form-title">Apply for {job.title}</h1>
            <p className="apply-form-subtitle">
              Fill in the details below and submit your application to{' '}
              <strong>{job.company}</strong>.
            </p>
          </div>

          {errors.general && (
            <div className="error-message">⚠️ {errors.general}</div>
          )}

          <form onSubmit={handleSubmit} className="apply-form" noValidate>
            <div className="apply-form-row">
              <div className="form-group">
                <label className="form-label">Full Name *</label>
                <input
                  name="fullName"
                  className="form-control"
                  value={formData.fullName}
                  onChange={handleChange}
                />
                {errors.fullName && <p className="error">{errors.fullName}</p>}
              </div>

              <div className="form-group">
                <label className="form-label">Email Address *</label>
                <input
                  name="email"
                  type="email"
                  className="form-control"
                  value={formData.email}
                  onChange={handleChange}
                />
                {errors.email && <p className="error">{errors.email}</p>}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Phone Number *</label>
              <input
                name="phone"
                className="form-control"
                value={formData.phone}
                onChange={handleChange}
              />
              {errors.phone && <p className="error">{errors.phone}</p>}
            </div>

            <div className="form-group">
              <label className="form-label">Cover Letter *</label>
              <textarea
                name="coverLetter"
                className="form-control"
                rows={5}
                value={formData.coverLetter}
                onChange={handleChange}
              />
              {errors.coverLetter && <p className="error">{errors.coverLetter}</p>}
            </div>

            <button
              type="submit"
              className="apply-submit-btn"
              disabled={status === 'submitting'}
            >
              {status === 'submitting' ? 'Submitting…' : 'Submit Application'}
            </button>
          </form>
        </div>

        <aside className="apply-sidebar">
          <div className="apply-job-summary">
            <h4 className="apply-sidebar-title">Job Summary</h4>
            <h3 className="apply-job-title">{job.title}</h3>
            <p className="apply-job-company">{job.company}</p>
            <p>📍 {job.location}</p>
            <p>💰 {job.salary}</p>
            <p>⏳ {job.type}</p>
            <p>🎓 {job.experience}</p>
            <p>📂 {job.category}</p>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default Apply;
