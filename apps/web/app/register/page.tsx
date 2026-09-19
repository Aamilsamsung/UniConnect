'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name:'', username:'', email:'', password:'' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setBusy(true); setError('');
    try {
      const response = await fetch(`${API}/auth/register`, {
        method:'POST', headers:{'content-type':'application/json'}, body:JSON.stringify(form)
      });
      const data = await response.json();
      if (!response.ok) throw new Error(Array.isArray(data.message) ? data.message.join(', ') : data.message || 'Registration failed.');
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed.');
    } finally { setBusy(false); }
  }

  if (done) return <main className="authWrap"><section className="authCard">
    <span className="badge">UniConnect</span><h1>Check your university email</h1>
    <p className="muted">Your account was created. Open the verification email we sent you, then sign in.</p>
    <button className="primary" onClick={()=>router.push('/login')}>Go to sign in</button>
  </section></main>;

  return <main className="authWrap"><form className="authCard" onSubmit={submit}>
    <span className="badge">UniConnect</span><h1>Create your account</h1>
    <p className="muted">Use your approved university email. Your university determines your private campus environment.</p>
    <label>Name<input value={form.name} onChange={e=>setForm({...form,name:e.target.value})} required /></label>
    <label>Username<input value={form.username} onChange={e=>setForm({...form,username:e.target.value})} minLength={3} required /></label>
    <label>University email<input type="email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} required /></label>
    <label>Password<input type="password" value={form.password} onChange={e=>setForm({...form,password:e.target.value})} minLength={8} required /></label>
    {error && <p className="error">{error}</p>}
    <button className="primary" disabled={busy}>{busy ? 'Creating account…' : 'Create account'}</button>
    <button type="button" className="linkButton" onClick={()=>router.push('/login')}>Already have an account? Sign in</button>
  </form></main>;
}
