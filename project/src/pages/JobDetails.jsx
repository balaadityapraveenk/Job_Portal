import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../config/api';
import './jobdetails.css';

const JobDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    fetch(`${API_BASE_URL}/jobs/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error('Job not found');
        return res.json();
      })
      .then((data) => {
        const fixedJob = {
          ...data,
          skills: data.skills ? data.skills.split(',').map((s) => s.trim()) : [],
          responsibilities: data.responsibilities
            ? data.responsibilities.split('|').map((r) => r.trim())
            : [],
          requirements: data.requirements
            ? data.requirements.split('|').map((r) => r.trim())
            : [],
          type: data.type || 'Full-Time',
          category: data.category || 'Engineering',
          experience: data.experience || '0-1 years',
          description: data.description || 'No description available',
        };
        setJob(fixedJob);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError('Failed to load job details. Please try again.');
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <div className="page-loading">
        <div className="page-spinner" />
        <p className="loading-text">Loading job details…</p>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="jd-not-found">
        <h2>Job Not Found</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '16px' }}>
          {error || 'This job listing may have been removed.'}
        </p>
        <Link to="/jobs" className="btn-primary">Browse All Jobs</Link>
      </div>
    );
  }

  return (
    <div className="jd-page">
      <button className="jd-back-btn" onClick={() => navigate('/jobs')}>
        ← Back to Jobs
      </button>

      <div className="jd-layout">
        <div className="jd-main">
          <div className="jd-hero-card">
            <div className="jd-hero-top">
              <div className="jd-company-logo">
                {job.company?.slice(0, 2).toUpperCase()}
              </div>
              <div className="jd-hero-meta">
                <h1 className="jd-title">{job.title}</h1>
                <p className="jd-company">{job.company}</p>
              </div>
            </div>

            <div className="jd-info-grid">
              <div className="jd-info-item">📍 {job.location}</div>
              <div className="jd-info-item">💰 {job.salary}</div>
              <div className="jd-info-item">🎓 {job.experience}</div>
              <div className="jd-info-item">📂 {job.category}</div>
              <div className="jd-info-item">⏳ {job.type}</div>
              {job.remote && <div className="jd-info-item">🌐 Remote</div>}
            </div>
          </div>

          <div className="jd-section-card">
            <h2 className="jd-section-title">📋 About the Role</h2>
            <p className="jd-description">{job.description}</p>
          </div>

          {job.responsibilities && job.responsibilities.length > 0 && (
            <div className="jd-section-card">
              <h2 className="jd-section-title">✅ Responsibilities</h2>
              <ul className="jd-list">
                {job.responsibilities.map((r, i) => (
                  <li key={i}>{r}</li>
                ))}
              </ul>
            </div>
          )}

          {job.requirements && job.requirements.length > 0 && (
            <div className="jd-section-card">
              <h2 className="jd-section-title">📌 Requirements</h2>
              <ul className="jd-list">
                {job.requirements.map((r, i) => (
                  <li key={i}>{r}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="jd-section-card">
            <h2 className="jd-section-title">🛠 Skills Required</h2>
            <div className="jd-skills">
              {job.skills.map((skill) => (
                <span key={skill} className="skill-tag">{skill}</span>
              ))}
            </div>
          </div>
        </div>

        <aside className="jd-sidebar">
          <div className="jd-apply-card">
            <h3 className="jd-apply-title">Ready to Apply?</h3>
            <p className="jd-apply-subtitle">
              Apply for this job at {job.company}.
            </p>
            <Link to={`/apply/${job.id}`} className="jd-apply-btn">
              Apply Now
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default JobDetails;
