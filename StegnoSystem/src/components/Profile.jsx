// src/components/Profile.js
import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import '../styles/Profile.css';

const Profile = () => {
  const { user, logout } = useContext(AuthContext);
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const token = localStorage.getItem('token');
        
        const response = await fetch('http://localhost:5000/auth/profile', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.message || 'Failed to fetch profile data');
        }
        
        setProfileData(data);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };
    
    fetchProfileData();
  }, []);

  if (loading) {
    return (
      <div className="profile-container">
        <div className="profile-card">
          <div className="loading-spinner">Loading...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="profile-container">
        <div className="profile-card">
          <h2>Error</h2>
          <p className="error-message">{error}</p>
          <button className="auth-button" onClick={logout}>Logout</button>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-container">
      <div className="profile-card">
        <div className="profile-header">
          <h2>Welcome to your Profile</h2>
          <div className="user-avatar">
            {user?.username?.[0]?.toUpperCase() || 'U'}
          </div>
        </div>
        
        <div className="profile-info">
          <h3>Your Information</h3>
          {user && (
            <div className="info-item">
              <span>Username:</span>
              <span>{user.username}</span>
            </div>
          )}
          
          <div className="info-item">
            <span>Status:</span>
            <span className="status-active">Active</span>
          </div>
        </div>
        
        <div className="profile-message">
          {profileData && <p>{profileData.message}</p>}
        </div>
        
        <button className="auth-button logout-button" onClick={logout}>
          Logout
        </button>
      </div>
    </div>
  );
};

export default Profile;