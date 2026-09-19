'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useRouter } from 'next/navigation';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export default function VerifyEmailPage() {
  const params = useSearchParams();
  const router = useRouter();
  const [state, setState] = useState<'loading'|'success'|'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const token = params.get('token');
    if (!token) { setState('error'); setMessage('Verification token is missing.'); return; }
    fetch(`${API}/auth/verify-email?token=${encodeURIComponent(token)}`)
      .then(async r => { const data = await r.json(); if (!r.ok) throw new Error(data.message || 'Verification failed.'); return data; })
      .then(data => { setState('success'); setMessage(data.message); })
      .catch(err => { setState('error'); setMessage(err instanceof Error ? err.message : 'Verification failed.'); });
  }, [params]);

  return <main className="authWrap"><section className="authCard">
    <span className="badge">UniConnect</span>
    <h1>{state === 'loading' ? 'Verifying your email…' : state === 'success' ? 'Email verified' : 'Verification failed'}</h1>
    <p className={state === 'error' ? 'error' : 'muted'}>{message}</p>
    {state !== 'loading' && <button className="primary" onClick={()=>router.push('/login')}>Continue to sign in</button>}
  </section></main>;
}
