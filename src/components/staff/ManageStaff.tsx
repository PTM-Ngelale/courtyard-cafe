'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { Logo } from '@/components/Logo';
import StaffLogin from './StaffLogin';
import { authHeader, useStaffAccess } from './useStaffAccess';
import { ago } from './time';

interface Member {
  user_id: string;
  name: string;
  role: 'staff' | 'manager';
  email: string;
  last_sign_in_at: string | null;
}

const MIN_PASSWORD = 8;
const DASHBOARD_URL = 'courtyardcafeph.vercel.app/admin/orders/';

/** Easy to read out or type: 12 lowercase letters and digits in three groups, without look-alikes (0/o, 1/l/i). */
function makePassword() {
  const chars = 'abcdefghjkmnpqrstuvwxyz23456789';
  const bytes = crypto.getRandomValues(new Uint8Array(12));
  const s = Array.from(bytes, (b) => chars[b % chars.length]).join('');
  return `${s.slice(0, 4)}-${s.slice(4, 8)}-${s.slice(8, 12)}`;
}

async function api(method: 'GET' | 'POST' | 'PATCH' | 'DELETE', body?: unknown) {
  const res = await fetch('/api/staff/', {
    method,
    headers: { 'Content-Type': 'application/json', ...(await authHeader()) },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Something went wrong. Try again.');
  return data;
}

export default function ManageStaff() {
  const { session, access } = useStaffAccess();

  if (session === undefined) return <p className="staff-wait">Loading…</p>;
  if (!session) return <StaffLogin />;
  if (access === 'checking') return <p className="staff-wait">Checking your account…</p>;
  if (access !== 'manager') {
    return (
      <div className="staff-gate">
        <h1>Managers only</h1>
        <p>Only managers can add or remove staff. Ask the manager if someone needs access.</p>
        <Link href="/admin/orders/" className="btn-s btn-s--quiet">
          Back to orders
        </Link>
      </div>
    );
  }
  return <StaffList />;
}

function StaffList() {
  const [me, setMe] = useState('');
  const [members, setMembers] = useState<Member[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const data = await api('GET');
      setMe(data.me);
      setMembers(data.staff);
      setError(null);
    } catch (e) {
      setError((e as Error).message);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (!toast) return;
    const id = setTimeout(() => setToast(null), 5000);
    return () => clearTimeout(id);
  }, [toast]);

  const managers = members?.filter((m) => m.role === 'manager').length ?? 0;

  return (
    <div className="staff staff--narrow">
      <header className="staff-bar">
        <Link href="/admin/orders/" className="staff-bar__brand" title="Back to orders">
          <Logo alt="" sizes="40px" className="staff-bar__logo" />
          <span>
            <small>The Courtyard Cafe</small>
            <strong>Manage staff</strong>
          </span>
        </Link>
        <div className="staff-bar__right">
          <Link href="/admin/orders/" className="btn-s btn-s--quiet">
            ← Orders
          </Link>
        </div>
      </header>

      <AddStaff onAdded={load} />

      <section className="manage">
        <h2 className="manage__title">
          Who has access <span className="staff-count">{members?.length ?? 0}</span>
        </h2>
        <p className="manage__hint">
          Managers can open this page. Staff can only see and move orders.
        </p>

        {error && (
          <div className="staff-error">
            {error}{' '}
            <button className="btn-s btn-s--quiet" onClick={() => void load()}>
              Try again
            </button>
          </div>
        )}

        {members === null && !error ? (
          <div className="lane__empty">Loading…</div>
        ) : (
          <ul className="people">
            {members?.map((m) => (
              <Person
                key={m.user_id}
                member={m}
                isMe={m.user_id === me}
                lastManager={m.role === 'manager' && managers <= 1}
                onChanged={(msg) => {
                  setToast(msg);
                  void load();
                }}
              />
            ))}
          </ul>
        )}
      </section>

      {toast && (
        <div className="staff-toast" role="status">
          {toast}
        </div>
      )}
    </div>
  );
}

function AddStaff({ onAdded }: { onAdded: () => Promise<void> }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'staff' as Member['role'] });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [added, setAdded] = useState<{ name: string; email: string; password: string } | null>(null);
  const [copied, setCopied] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (form.password.length < MIN_PASSWORD) return setError(`The password needs at least ${MIN_PASSWORD} characters.`);
    setBusy(true);
    try {
      await api('POST', form);
      setAdded({ name: form.name.trim(), email: form.email.trim().toLowerCase(), password: form.password });
      setForm({ name: '', email: '', password: '', role: 'staff' });
      setOpen(false);
      await onAdded();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const message = added
    ? `Hi ${added.name.split(' ')[0]}, you can now see Courtyard delivery orders.\n\nOpen: ${DASHBOARD_URL}\nEmail: ${added.email}\nPassword: ${added.password}`
    : '';

  return (
    <section className="manage manage--add">
      {added && (
        <div className="added" role="status">
          <p>
            <strong>{added.name}</strong> can sign in now. Send them their login:
          </p>
          <pre className="added__msg">{message}</pre>
          <div className="added__actions">
            <button
              className="btn-s btn-s--on"
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(message);
                  setCopied(true);
                } catch {
                  setCopied(false);
                }
              }}
            >
              {copied ? 'Copied' : 'Copy message'}
            </button>
            <button
              className="btn-s btn-s--quiet"
              onClick={() => {
                setAdded(null);
                setCopied(false);
              }}
            >
              Done
            </button>
          </div>
        </div>
      )}

      {!open ? (
        !added && (
          <button
            className="btn-s btn-s--go btn-s--block"
            onClick={() => {
              setOpen(true);
              setForm((f) => ({ ...f, password: f.password || makePassword() }));
            }}
          >
            + Add someone
          </button>
        )
      ) : (
        <form className="add-form" onSubmit={submit}>
          <h2 className="manage__title">Add someone</h2>
          {error && <div className="staff-error">{error}</div>}
          <label htmlFor="add-name">Name</label>
          <input
            id="add-name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            autoComplete="off"
            required
          />
          <label htmlFor="add-email">Email</label>
          <input
            id="add-email"
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            autoComplete="off"
            required
          />
          <label htmlFor="add-password">Password</label>
          <div className="add-form__row">
            <input
              id="add-password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              autoComplete="new-password"
              spellCheck={false}
              required
            />
            <button type="button" className="btn-s btn-s--quiet" onClick={() => setForm({ ...form, password: makePassword() })}>
              New
            </button>
          </div>
          <p className="manage__hint">You&apos;ll get a message with their login to send them.</p>
          <fieldset className="add-form__roles">
            <legend>Access</legend>
            <label>
              <input
                type="radio"
                name="role"
                checked={form.role === 'staff'}
                onChange={() => setForm({ ...form, role: 'staff' })}
              />
              <span>
                <strong>Staff</strong> Sees and moves orders
              </span>
            </label>
            <label>
              <input
                type="radio"
                name="role"
                checked={form.role === 'manager'}
                onChange={() => setForm({ ...form, role: 'manager' })}
              />
              <span>
                <strong>Manager</strong> Also adds and removes staff
              </span>
            </label>
          </fieldset>
          <div className="add-form__actions">
            <button type="submit" className="btn-s btn-s--go" disabled={busy}>
              {busy ? 'Adding…' : 'Add'}
            </button>
            <button type="button" className="btn-s btn-s--quiet" onClick={() => setOpen(false)}>
              Cancel
            </button>
          </div>
        </form>
      )}
    </section>
  );
}

function Person({
  member,
  isMe,
  lastManager,
  onChanged,
}: {
  member: Member;
  isMe: boolean;
  lastManager: boolean;
  onChanged: (message: string) => void;
}) {
  const [mode, setMode] = useState<'idle' | 'password' | 'remove'>('idle');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const first = member.name.split(' ')[0];
  const passwordMessage = newPassword
    ? `Hi ${first}, your new password for Courtyard orders is: ${newPassword}

Sign in at ${DASHBOARD_URL}`
    : '';

  const run = async (fn: () => Promise<unknown>, message: string) => {
    setBusy(true);
    setError(null);
    try {
      await fn();
      setMode('idle');
      onChanged(message);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <li className="person">
      <div className="person__main">
        <div className="person__who">
          <strong>
            {member.name}
            {isMe && <span className="person__you">You</span>}
          </strong>
          <span>{member.email}</span>
          <span className="person__seen">
            {member.last_sign_in_at ? `Last signed in ${ago(member.last_sign_in_at, Date.now())}` : 'Never signed in'}
          </span>
        </div>
        <span className={`person__role person__role--${member.role}`}>
          {member.role === 'manager' ? 'Manager' : 'Staff'}
        </span>
      </div>

      {error && <div className="staff-error">{error}</div>}

      {newPassword && (
        <div className="added" role="status">
          <p>Send {first} their new password:</p>
          <pre className="added__msg">{passwordMessage}</pre>
          <div className="added__actions">
            <button
              className="btn-s btn-s--on"
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(passwordMessage);
                  setCopied(true);
                } catch {
                  setCopied(false);
                }
              }}
            >
              {copied ? 'Copied' : 'Copy message'}
            </button>
            <button className="btn-s btn-s--quiet" onClick={() => setNewPassword(null)}>
              Done
            </button>
          </div>
        </div>
      )}

      {mode === 'password' ? (
        <form
          className="person__panel"
          onSubmit={(e) => {
            e.preventDefault();
            if (password.length < MIN_PASSWORD) return setError(`The password needs at least ${MIN_PASSWORD} characters.`);
            const chosen = password;
            void run(async () => {
              await api('PATCH', { user_id: member.user_id, password: chosen });
              setNewPassword(chosen);
              setCopied(false);
            }, `New password set for ${first}.`);
          }}
        >
          <label htmlFor={`pw-${member.user_id}`}>New password for {first}</label>
          <div className="add-form__row">
            <input
              id={`pw-${member.user_id}`}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
              spellCheck={false}
            />
            <button type="button" className="btn-s btn-s--quiet" onClick={() => setPassword(makePassword())}>
              New
            </button>
          </div>
          <div className="add-form__actions">
            <button type="submit" className="btn-s btn-s--go" disabled={busy}>
              {busy ? 'Saving…' : 'Set password'}
            </button>
            <button type="button" className="btn-s btn-s--quiet" onClick={() => setMode('idle')}>
              Cancel
            </button>
          </div>
        </form>
      ) : mode === 'remove' ? (
        <div className="person__panel person__panel--danger" role="alert">
          <p>
            Remove {member.name}? They won&apos;t be able to sign in any more. Their past orders stay.
          </p>
          <div className="add-form__actions">
            <button
              className="btn-s btn-s--danger"
              disabled={busy}
              onClick={() => void run(() => api('DELETE', { user_id: member.user_id }), `${first} was removed.`)}
            >
              {busy ? 'Removing…' : 'Yes, remove'}
            </button>
            <button className="btn-s btn-s--quiet" onClick={() => setMode('idle')}>
              Keep
            </button>
          </div>
        </div>
      ) : (
        <div className="person__actions">
          <button
            className="btn-s btn-s--quiet"
            disabled={busy || (lastManager && member.role === 'manager')}
            title={lastManager ? 'There has to be at least one manager' : undefined}
            onClick={() =>
              void run(
                () => api('PATCH', { user_id: member.user_id, role: member.role === 'manager' ? 'staff' : 'manager' }),
                member.role === 'manager' ? `${first} is now staff.` : `${first} is now a manager.`
              )
            }
          >
            {member.role === 'manager' ? 'Make staff' : 'Make manager'}
          </button>
          <button
            className="btn-s btn-s--quiet"
            onClick={() => {
              setPassword(makePassword());
              setMode('password');
            }}
          >
            Set password
          </button>
          {!isMe && (
            <button
              className="btn-s btn-s--quiet btn-s--warn"
              disabled={lastManager}
              title={lastManager ? 'There has to be at least one manager' : undefined}
              onClick={() => setMode('remove')}
            >
              Remove
            </button>
          )}
        </div>
      )}
    </li>
  );
}

