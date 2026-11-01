'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Logo } from '@/components/Logo';
import { supabaseBrowser } from '@/lib/supabase-browser';

export default function StaffLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const { error: signInError } = await supabaseBrowser.auth.signInWithPassword({ email, password });
    setLoading(false);
    // On success the dashboard picks up the new session by itself.
    if (signInError) setError('Wrong email or password.');
  };

  return (
    <div className="staff-gate">
      <Logo className="staff-gate__logo" alt="The Courtyard Cafe" sizes="56px" />
      <p className="staff-gate__brand">The Courtyard Cafe</p>
      <h1>Staff sign in</h1>
      {error && <div className="staff-error">{error}</div>}
      <form onSubmit={handleSubmit}>
        <label htmlFor="staff-email">Email</label>
        <input
          id="staff-email"
          type="email"
          autoComplete="username"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <label htmlFor="staff-password">Password</label>
        <input
          id="staff-password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit" className="btn-s btn-s--go btn-s--block" disabled={loading}>
          {loading ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
      <p className="staff-gate__help">
        Forgot your password? Ask the manager to set a new one for you.
      </p>
      <Link href="/" className="staff-gate__back">
        ← Back to the website
      </Link>
    </div>
  );
}
