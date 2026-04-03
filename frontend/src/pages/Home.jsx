import React from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Legend
} from 'recharts';
import '../styles/Home.css';

// Data
const revenueData = [
  { month: 'Jan', revenue: 20000, comparison: 15000 },
  { month: 'Feb', revenue: 30000, comparison: 22000 },
  { month: 'Mar', revenue: 38000, comparison: 26000 },
  { month: 'Apr', revenue: 45000, comparison: 30000 },
  { month: 'May', revenue: 52000, comparison: 35000 },
  { month: 'Jun', revenue: 60000, comparison: 40000 },
];

const placementData = [
  { month: 'Jan', success: 30, pending: 10 },
  { month: 'Feb', success: 45, pending: 12 },
  { month: 'Mar', success: 50, pending: 9 },
  { month: 'Apr', success: 65, pending: 8 },
  { month: 'May', success: 70, pending: 6 },
  { month: 'Jun', success: 80, pending: 5 },
];

const beneficiaries = [
  { name: 'Ravi Kumar', status: 'Active', scheme: 'Mobility Aid', enrolled: '12/02/2025', progress: 70 },
  { name: 'Anita Devi', status: 'Active', scheme: 'Skill Training', enrolled: '05/03/2025', progress: 85 },
  { name: 'Suresh Babu', status: 'Pending', scheme: 'Financial Aid', enrolled: '18/03/2025', progress: 40 },
  { name: 'Lakshmi Rao', status: 'Active', scheme: 'Rehabilitation', enrolled: '25/01/2025', progress: 90 },
];

const activities = [
  { title: 'Wheelchair Camp', date: '10 May 2025' },
  { title: 'Skill Workshop', date: '18 May 2025' },
  { title: 'Health Camp', date: '25 May 2025' },
];

const Home = () => {
  return (
    <div className="page-content">

      {/* ===== WELCOME SECTION ===== */}
      <div className="welcome-card">
        <h2>Welcome User 👋</h2>
        <p>
          Empowering individuals with disabilities through education, support schemes,
          and interactive tools for a better future.
        </p>
      </div>

      {/* LEFT */}
      <div>

        {/* Stats */}
        <div className="stats-row">
          <div className="stat-card">
            <div>
              <div className="stat-num">1500</div>
              <div className="stat-label">Beneficiaries</div>
            </div>
          </div>

          <div className="stat-card">
            <div>
              <div className="stat-num">850</div>
              <div className="stat-label">Schemes Active</div>
            </div>
          </div>

          <div className="stat-card">
            <div>
              <div className="stat-num">420</div>
              <div className="stat-label">New Registrations</div>
            </div>
          </div>

          <div className="stat-card">
            <div>
              <div className="stat-num">300</div>
              <div className="stat-label">Rehabilitated</div>
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className="charts-row">

          <div className="glass-card">
            <div className="card-head">
              <h3>Support Funds</h3>
            </div>

            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Area type="monotone" dataKey="revenue" stroke="#4c3de3" />
                <Area type="monotone" dataKey="comparison" stroke="#f44bab" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="glass-card">
            <div className="card-head">
              <h3>Rehabilitation Progress</h3>
            </div>

            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={placementData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="success" fill="#4c3de3" />
                <Bar dataKey="pending" fill="#f44bab" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Table */}
        <div className="table-card">
          <h3>Beneficiary Details</h3>

          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Status</th>
                <th>Scheme</th>
                <th>Enrolled</th>
                <th>Progress</th>
              </tr>
            </thead>

            <tbody>
              {beneficiaries.map((b, i) => (
                <tr key={i}>
                  <td>{b.name}</td>
                  <td>{b.status}</td>
                  <td>{b.scheme}</td>
                  <td>{b.enrolled}</td>
                  <td>{b.progress}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>

      {/* RIGHT */}
      <div className="right-sidebar">

        <div className="trainers-card">
          <h3>Recent Activities</h3>
          {activities.map((a, i) => (
            <div key={i} className="trainer-row">
              <div className="trainer-info">
                <div className="trainer-name">{a.title}</div>
                <div className="trainer-role">{a.date}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="courses-card">
          <h3>Government Schemes</h3>

          <div className="course-item">
            <div className="course-title">Accessible India Campaign</div>
          </div>

          <div className="course-item">
            <div className="course-title">ADIP Scheme</div>
          </div>

          <div className="course-item">
            <div className="course-title">Skill Development</div>
          </div>

        </div>
      </div>

    </div>
  );
};

export default Home;