'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError('');
    try {
      const response = await fetch(`${API}/auth/login`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Sign in failed.');
      localStorage.setItem('uniconnect_token', data.token);
      localStorage.setItem('uniconnect_user', JSON.stringify(data.user));
      router.push('/feed');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign in failed.');
    } finally {
      setBusy(false);
    }
  }

  return <main className="authWrap">
    <form className="authCard" onSubmit={submit}>
      <span className="badge">UniConnect</span>
      <h1>Welcome back</h1>
      <p className="muted">Sign in with your approved university account.</p>
      <label>Email<input type="email" value={email} onChange={e=>setEmail(e.target.value)} required /></label>
      <label>Password<input type="password" value={password} onChange={e=>setPassword(e.target.value)} minLength={8} required /></label>
      {error && <p className="error">{error}</p>}
      <button className="primary" disabled={busy}>{busy ? 'Signing in…' : 'Sign in'}</button>
    </form>
  </main>;
}
