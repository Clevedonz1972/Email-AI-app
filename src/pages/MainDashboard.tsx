import React from 'react';
import Dashboard from './Dashboard';

const MainDashboard: React.FC = () => {
  console.log('MainDashboard is rendering Dashboard');
  return (
    <>
      <div style={{ position: 'fixed', top: 70, left: 0, right: 0, zIndex: 9999, backgroundColor: 'green', color: 'white', padding: '5px', textAlign: 'center' }}>
        MainDashboard is forwarding to Dashboard
      </div>
      <Dashboard />
    </>
  );
};

export default MainDashboard; 