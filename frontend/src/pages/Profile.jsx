import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import '../styles/Profile.css';

export default function Profile() {
  const { user } = useAuth();
  
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  const [profileData, setProfileData] = useState({
    name: user?.name || 'Loading Student...',
    email: user?.email || 'N/A',
    udid: user?.udid || 'Not Provided',
    disabilityType: user?.disabilityType || 'Not Categorized',
    parentName: '',
    parentEmail: '',
    parentMobile: ''
  });

  // 🔄 Fetch profile records from backend anytime the user object updates or mounts
  useEffect(() => {
    const fetchProfileData = async () => {
      const userId = user?._id || user?.id;
      if (!userId) return;
      
      try {
        setIsLoading(true);
        const response = await fetch(`https://thirannexus.onrender.com/api/users/profile/${userId}`);
        
        if (!response.ok) {
          throw new Error('Could not pull backend database profile values.');
        }
        
        const data = await response.json();
        
        setProfileData(prev => ({
          ...prev,
          name: data.name || prev.name,
          email: data.email || prev.email,
          udid: data.udid || prev.udid,
          disabilityType: data.disabilityType || prev.disabilityType,
          parentName: data.parentName || '',
          parentEmail: data.parentEmail || '',
          parentMobile: data.parentMobile || ''
        }));
      } catch (error) {
        console.error("Database sync failure:", error);
        setErrorMessage("Unable to safely load profile values from server.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfileData();
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    const userId = user?._id || user?.id;
    
    try {
      const response = await fetch(`https://thirannexus.onrender.com/api/users/profile/update/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          parentName: profileData.parentName,
          parentEmail: profileData.parentEmail,
          parentMobile: profileData.parentMobile
        })
      });

      if (!response.ok) {
        throw new Error('Database updates rejected by express controller runtime pipeline');
      }

      setIsEditing(false);
      alert("Parent information successfully saved to MongoDB!");
    } catch (error) {
      console.error("Backend pipeline preservation failure:", error);
      alert("Error: Failed to register custom values directly to database.");
    }
  };

  if (isLoading) {
    return <div className="profile-container"><p>Loading profile configurations securely...</p></div>;
  }

  return (
    <div className="profile-container">
      {errorMessage && <div style={{ color: 'red', marginBottom: '15px' }}>{errorMessage}</div>}
      
      <div className="profile-header-card">
        <img 
          src={`https://api.dicebear.com/7.x/adventurer/svg?seed=${profileData.name}`} 
          alt="Student Avatar badge" 
          className="profile-avatar-large"
        />
        <div className="profile-title-text">
          <h1>{profileData.name}</h1>
          <p className="badge-udid">UDID: {profileData.udid}</p>
        </div>
        
        <button 
          type="button"
          className={`profile-action-btn ${isEditing ? 'cancel-btn' : 'edit-btn'}`}
          onClick={() => setIsEditing(!isEditing)}
        >
          {isEditing ? '❌ Cancel' : '⚙️ Edit Parent Info'}
        </button>
      </div>

      <form onSubmit={handleSave} className="profile-grid">
        
        <div className="profile-section-card">
          <h2>🎒 Student Information</h2>
          <hr />
          <div className="info-row">
            <span className="info-label">Full Name:</span>
            <span className="info-value">{profileData.name}</span>
          </div>
          <div className="info-row">
            <span className="info-label">Email Address:</span>
            <span className="info-value">{profileData.email}</span>
          </div>
          <div className="info-row">
            <span className="info-label">Disability Category:</span>
            <span className="info-value" style={{ textTransform: 'capitalize' }}>
              {profileData.disabilityType}
            </span>
          </div>
        </div>

        <div className="profile-section-card">
          <h2>👨‍👩‍👦 Parent / Guardian Details</h2>
          <hr />
          
          <div className="info-row interactive">
            <label className="info-label" htmlFor="parentName">Parent Name:</label>
            {isEditing ? (
              <input
                type="text"
                id="parentName"
                name="parentName"
                value={profileData.parentName}
                onChange={handleChange}
                placeholder="Enter Parent Name"
                required
                className="profile-input-field"
              />
            ) : (
              <span className="info-value">{profileData.parentName || <em className="placeholder-text">Not configured yet</em>}</span>
            )}
          </div>

          <div className="info-row interactive">
            <label className="info-label" htmlFor="parentEmail">Email Address:</label>
            {isEditing ? (
              <input
                type="email"
                id="parentEmail"
                name="parentEmail"
                value={profileData.parentEmail}
                onChange={handleChange}
                placeholder="parent@example.com"
                required
                className="profile-input-field"
              />
            ) : (
              <span className="info-value">{profileData.parentEmail || <em className="placeholder-text">Not configured yet</em>}</span>
            )}
          </div>

          <div className="info-row interactive">
            <label className="info-label" htmlFor="parentMobile">Mobile Number:</label>
            {isEditing ? (
              <input
                type="tel"
                id="parentMobile"
                name="parentMobile"
                value={profileData.parentMobile}
                onChange={handleChange}
                placeholder="Enter 10 digit number"
                pattern="[0-9]{10,}"
                title="Enter clean digit chains"
                required
                className="profile-input-field"
              />
            ) : (
              <span className="info-value">{profileData.parentMobile || <em className="placeholder-text">Not configured yet</em>}</span>
            )}
          </div>

          {isEditing && (
            <button type="submit" className="profile-save-btn">
              💾 Save Changes
            </button>
          )}
        </div>
        
      </form>
    </div>
  );
}