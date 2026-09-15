import React from 'react';
import Landing from './Landing';

export default function SignIn({ onNavigate }) {
  return <Landing onNavigate={onNavigate} initialAuthModal="signin" />;
}

