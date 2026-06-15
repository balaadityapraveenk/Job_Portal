import React from 'react';
import './contact.css';

const teamMembers = [
  {
    name: 'Teja Kiran',
    role: 'Frontend Developer',
    contact: '1593578246',
    email: 'frontendpro26@gmail.com',
    address: 'KL University, Vaddeswaram, C-block C008',
    initials: 'TK',
    gradient: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
    links: [
      {
        label: 'Instagram',
        icon: '📸',
        url: 'https://www.instagram.com/teja__kiran_/',
        display: '@teja__kiran_',
      },
      {
        label: 'LinkedIn',
        icon: '💼',
        url: 'https://www.linkedin.com/in/teja-kiran-84b044386/',
        display: 'Teja Kiran',
      },
    ],
  },
  {
    name: 'K.Bala Aditya Praveen',
    role: 'Backend and Database',
    contact: '944079897',
    email: 'praveenkuchibhotla2007@gmail.com',
    address: 'KL University, Vaddeswaram, C-block C008',
    initials: 'BP',
    gradient: 'linear-gradient(135deg, #10b981, #059669)',
    links: [
      {
        label: 'Instagram',
        icon: '📸',
        url: 'https://www.instagram.com/baladitya.praveen/',
        display: '@baladitya.praveen',
      },
    ],
  },
  {
    name: 'Shaik Abdulla',
    role: 'Backend Developer',
    contact: '9390971929',
    email: 'abdullask@gmail.com',
    address: 'KL University, Vaddeswaram, C-block C008',
    initials: 'SA',
    gradient: 'linear-gradient(135deg, #f59e0b, #d97706)',
    links: [
      {
        label: 'Instagram',
        icon: '📸',
        url: 'https://www.instagram.com/shaik_._abdulla/',
        display: '@shaik_._abdulla',
      },
    ],
  },
];

const Contact = () => {
  return (
    <div className="contact-page">
      {/* Header */}
      <div className="contact-header">
        <div className="section-tag">Meet the Team</div>
        <h1 className="contact-title">The People Behind JobPortal</h1>
        <p className="contact-subtitle">
          Built with LOVE❤️ at KL University, Vaddeswaram — PS-13 Group Project
        </p>
      </div>

      {/* Team Grid */}
      <div className="contact-grid">
        {teamMembers.map((member) => (
          <div key={member.name} className="contact-card">
            {/* Avatar */}
            <div className="contact-avatar-wrapper">
              <div
                className="contact-avatar"
                style={{ background: member.gradient }}
              >
                {member.initials}
              </div>
              <div className="contact-avatar-ring" style={{ background: member.gradient }} />
            </div>

            {/* Info */}
            <div className="contact-info">
              <h3 className="contact-name">{member.name}</h3>
              <p className="contact-role">{member.role}</p>

              <div className="contact-details">
                <div className="contact-detail-item">
                  <span className="contact-detail-icon">📱</span>
                  <span>{member.contact}</span>
                </div>
                <div className="contact-detail-item">
                  <span className="contact-detail-icon">📧</span>
                  <a href={`mailto:${member.email}`}>{member.email}</a>
                </div>
                <div className="contact-detail-item">
                  <span className="contact-detail-icon">📍</span>
                  <span>{member.address}</span>
                </div>
              </div>

              {/* Social links */}
              <div className="contact-links">
                {member.links.map((link) => (
                  <a
                    key={link.label}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="contact-social-btn"
                  >
                    <span>{link.icon}</span>
                    <span>{link.display}</span>
                  </a>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};

export default Contact;