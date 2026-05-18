import React from 'react';
import './Topbar.css';
import NotificationBell from '../components/NotificationBell';
import { useAuth } from '../context/AuthContext'; // ✅ Added to check disability type
import { useAccessibility } from '../context/AccessibilityContext'; // ✅ Added for color accessibility

export default function Topbar() {
  const { user } = useAuth(); // ✅ Fetch user directly from global context
  const { visionProfile, setVisionProfile } = useAccessibility();

  // 🔍 Gatekeeping Logic: Evaluates true if user profile tags indicate visual impairment
  const isVisuallyImpaired = 
    user?.udid?.toUpperCase().startsWith('VIS') || 
    user?.disabilityType?.toLowerCase().includes('visual') ||
    user?.disabilityType?.toLowerCase().includes('blind');

  return (
    <header className="topbar">
      <h2 className="topbar-title">ThiranNexus</h2>
      <div className="topbar-right">
        
        {/* ✅ DEDICATED COLOR PROFILE SELECTOR (Only rendered for targeted vision profiles) */}
        {isVisuallyImpaired && (
          <div className="color-accessibility-control" style={{ display: 'flex', gap: '8px', alignItems: 'center', marginRight: '10px' }}>
            <label htmlFor="vision-select" style={{ fontSize: '13px', fontWeight: '500' }}>👁️ Mode:</label>
            <select
              id="vision-select"
              value={visionProfile}
              onChange={(e) => setVisionProfile(e.target.value)}
              aria-label="Select vision configuration based on color blindness or low vision"
              style={{ 
                padding: '4px 8px', 
                borderRadius: '6px', 
                cursor: 'pointer',
                fontWeight: '600',
                border: '1px solid #cbd5e1',
                backgroundColor: 'var(--bg-surface)',
                color: 'var(--text-primary)'
              }}
            >
              <option value="standard">Standard Theme</option>
              <option value="low-vision">Low Vision (High Contrast Yellow)</option>
              <option value="protanopia">Red-Blind (Protanopia)</option>
              <option value="deuteranopia">Green-Blind (Deuteranopia)</option>
              <option value="tritanopia">Blue-Yellow Blind (Tritanopia)</option>
              <option value="monochrome">Monochrome Mode</option>
            </select>
          </div>
        )}

        <input type="text" placeholder="Search..." className="search-bar" />
        <div className="user-avatar">
          <img
            src={`https://api.dicebear.com/7.x/adventurer/svg?seed=${user?.name || 'Guest'}`}
            alt="user"
          />
        </div>
        <NotificationBell />
      </div>
    </header>
  );
}