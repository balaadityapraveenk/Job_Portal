import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/Authenticate';
import { API_BASE_URL } from '../config/api';
import './applications.css';

const Applications = () => {
  const { user, authenticatedFetch } = useAuth();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      authenticatedFetch(`${API_BASE_URL}/applications/user/${user.id}`)
        .then((res) => {
          if (!res.ok) throw new Error('Failed to fetch applications');
          return res.json();
        })
        .then((data) => {
          setApplications(data);
          setLoading(false);
        })
        .catch((err) => {
          console.error(err);
          setApplications([]);
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, [user]);

  const handleWithdraw = (appId) => {
    authenticatedFetch(`${API_BASE_URL}/applications/${appId}`, {
      method: 'DELETE',
    })
      .then((res) => {
        if (res.ok) {
          setApplications(applications.filter((app) => app.id !== appId));
        } else {
          alert('Failed to withdraw application. Please try again.');
        }
      })
      .catch((err) => {
        console.error('Withdraw error:', err);
        alert('Failed to withdraw application.');
      });
  };

  if (loading) {
    return (
      <div className="page-loading">
        <div className="page-spinner" />
        <p className="loading-text">Loading applications…</p>
      </div>
    );
  }

  return (
    <div className="apps-page">
      <div className="apps-header">
        <div className="section-tag">My Applications</div>
        <h1 className="apps-title">Application Tracker</h1>
        <p className="apps-subtitle">
          Track the status of all your submitted applications
        </p>
      </div>

      {applications.length === 0 ? (
        <div className="apps-empty">
          <div className="apps-empty-icon">📋</div>
          <h3>No Applications Yet</h3>
          <p>You haven't applied for any jobs yet.</p>
          <Link to="/jobs" className="btn-primary">
            🔍 Browse Jobs
          </Link>
        </div>
      ) : (
        <div className="apps-list">
          {applications.map((app, index) => (
            <div key={app.id || index} className="app-card">
              <div className="app-card-left">
                <div className="app-company-logo">
                  {app.job?.company
                    ? app.job.company.slice(0, 2).toUpperCase()
                    : 'JP'}
                </div>

                <div className="app-card-info">
                  <div className="app-job-title">
                    {app.job?.title || `Job ID: ${app.job?.id}`}
                  </div>

                  <div className="app-company">
                    {app.job?.company || 'Company'}
                  </div>

                  <div className="app-meta-row">
                    <span className="app-meta-item">
                      📍 {app.job?.location || 'Location'}
                    </span>
                    <span className="app-meta-item">
                      💰 {app.job?.salary || 'Salary'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="app-card-right" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
                <span className={`badge ${app.status === 'Shortlisted' ? 'badge-emerald' : app.status === 'Rejected' ? 'badge-rose' : 'badge-amber'}`}>
                  🔍 {app.status || 'Applied'}
                </span>
                <button 
                  className="app-withdraw-btn" 
                  onClick={() => handleWithdraw(app.id)}
                >
                  Withdraw
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Applications;
