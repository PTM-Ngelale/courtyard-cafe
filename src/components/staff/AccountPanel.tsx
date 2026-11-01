'use client';

import { useEffect, useRef, useState } from 'react';
import { supabaseBrowser } from '@/lib/supabase-browser';

const MIN_PASSWORD = 8;

/**
 * The signed-in person's own account: who they are, change their password,
 * sign out. Changing the password asks for the current one first, so someone
 * who picks up an unlocked tablet can't lock the owner out.
 */
export default function AccountPanel({ email, onClose }: { email: string; onClose: () => void }) {
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [again, setAgain] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const first = useRef<HTMLInputElement>(null);

  useEffect(() => {
    first.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (next.length < MIN_PASSWORD) return setError(`Your new password needs at least ${MIN_PASSWORD} characters.`);
    if (next !== again) return setError("The two new passwords don't match.");
    if (next === current) return setError('Choose a password different from your current one.');

    setBusy(true);
    // Check the current password by signing in with it (same account, fresh session).
    const check = await supabaseBrowser.auth.signInWithPassword({ email, password: current });
    if (check.error) {
      setBusy(false);
      return setError('Your current password is wrong.');
    }
    const { error: updateError } = await supabaseBrowser.auth.updateUser({ password: next });
    setBusy(false);
    if (updateError) {
      console.error('password change failed', updateError);
      return setError("Couldn't change your password. Try again.");
    }
    setDone(true);
    setCurrent('');
    setNext('');
    setAgain('');
  };

  return (
    <div className="sheet-backdrop" onClick={onClose}>
      <div
        className="sheet"
        role="dialog"
        aria-modal="true"
        aria-labelledby="account-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sheet__head">
          <div>
            <h2 id="account-title">Your account</h2>
            <p>{email}</p>
          </div>
          <button className="btn-s btn-s--quiet" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>

        {done ? (
          <div className="added" role="status">
            <p>
              <strong>Password changed.</strong> Use the new one next time you sign in.
            </p>
            <div className="added__actions">
              <button className="btn-s btn-s--on" onClick={onClose}>
                Done
              </button>
            </div>
          </div>
        ) : (
          <form className="sheet__form" onSubmit={submit}>
            <h3>Change my password</h3>
            {error && <div className="staff-error">{error}</div>}
            <label htmlFor="pw-current">Current password</label>
            <input
              ref={first}
              id="pw-current"
              type="password"
              autoComplete="current-password"
              value={current}
              onChange={(e) => setCurrent(e.target.value)}
              required
            />
            <label htmlFor="pw-new">New password</label>
            <input
              id="pw-new"
              type="password"
              autoComplete="new-password"
              value={next}
              onChange={(e) => setNext(e.target.value)}
              required
            />
            <label htmlFor="pw-again">New password again</label>
            <input
              id="pw-again"
              type="password"
              autoComplete="new-password"
              value={again}
              onChange={(e) => setAgain(e.target.value)}
              required
            />
            <p className="manage__hint">At least {MIN_PASSWORD} characters.</p>
            <button type="submit" className="btn-s btn-s--go btn-s--block" disabled={busy}>
              {busy ? 'Saving…' : 'Change password'}
            </button>
          </form>
        )}

        <button className="btn-s btn-s--quiet btn-s--block sheet__signout" onClick={() => supabaseBrowser.auth.signOut()}>
          Sign out
        </button>
      </div>
    </div>
  );
}
