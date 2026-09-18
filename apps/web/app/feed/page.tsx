'use client';

import Link from 'next/link';
import { FormEvent, useEffect, useState } from 'react';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

type Post = {
  id: string;
  content: string;
  createdAt: string;
  author: { name: string; username: string };
  community?: { name: string } | null;
};

export default function FeedPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [content, setContent] = useState('');
  const [error, setError] = useState('');

  function token() { return typeof window === 'undefined' ? '' : localStorage.getItem('uniconnect_token') || ''; }

  async function load() {
    const response = await fetch(`${API}/feed`, { headers: { authorization: `Bearer ${token()}` } });
    if (response.status === 401) { setError('Please sign in to view your university feed.'); return; }
    const data = await response.json();
    if (!response.ok) { setError(data.message || 'Unable to load feed.'); return; }
    setPosts(data);
  }

  useEffect(() => { void load(); }, []);

  async function publish(event: FormEvent) {
    event.preventDefault();
    if (!content.trim()) return;
    const response = await fetch(`${API}/feed`, {
      method: 'POST',
      headers: { authorization: `Bearer ${token()}`, 'content-type': 'application/json' },
      body: JSON.stringify({ content }),
    });
    const data = await response.json();
    if (!response.ok) { setError(data.message || 'Unable to publish.'); return; }
    setContent('');
    setPosts(current => [data, ...current]);
  }

  return <div className="shell">
    <aside className="sidebar">
      <div className="brand">UC · UniConnect</div>
      <nav className="nav"><Link href="/feed">Feed</Link><Link href="/communities">Communities</Link><Link href="/events">Events</Link><Link href="/profile/me">Profile</Link></nav>
    </aside>
    <main className="main">
      <section className="card composer">
        <span className="badge">University feed</span>
        <h1>What’s happening on campus?</h1>
        <form onSubmit={publish}><textarea value={content} onChange={e=>setContent(e.target.value)} maxLength={5000} placeholder="Share an update with your university…" /><button className="primary">Post</button></form>
      </section>
      {error && <p className="error">{error}</p>}
      <section className="feedList">
        {posts.map(post => <article className="card post" key={post.id}>
          <div className="postHead"><strong>{post.author.name}</strong><span className="muted">@{post.author.username}</span>{post.community && <span className="badge">{post.community.name}</span>}</div>
          <p>{post.content}</p>
          <small className="muted">{new Date(post.createdAt).toLocaleString()}</small>
        </article>)}
      </section>
    </main>
  </div>;
}
