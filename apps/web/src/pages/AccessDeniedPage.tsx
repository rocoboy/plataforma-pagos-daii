import React from 'react';
import AccessDenied from '../components/AccessDenied';

const AccessDeniedPage: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <AccessDenied />
    </div>
  );
};

export default AccessDeniedPage;
