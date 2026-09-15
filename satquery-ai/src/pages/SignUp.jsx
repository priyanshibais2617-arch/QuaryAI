import React from 'react';
import Landing from './Landing';

export default function SignUp({ onNavigate }) {
  return <Landing onNavigate={onNavigate} initialAuthModal="signup" />;
}

