'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

type EventItem = { id:string; title:string; description:string; startsAt:string; location?:string|null; _count:{attendees:number} };

export default function EventsPage(){
  const [events,setEvents]=useState<EventItem[]>([]);
  const [error,setError]=useState('');
  const token=()=>localStorage.getItem('uniconnect_token')||'';

  async function load(){
    const response=await fetch(`${API}/events`,{headers:{authorization:`Bearer ${token()}`}});
    const data=await response.json();
    if(!response.ok){setError(data.message||'Unable to load events.');return;}
    setEvents(data);
  }
  useEffect(()=>{void load();},[]);

  async function attend(id:string){
    const response=await fetch(`${API}/events/${id}/attend`,{method:'POST',headers:{authorization:`Bearer ${token()}`}});
    if(response.ok) void load();
  }

  return <div className="shell"><aside className="sidebar"><div className="brand">UC · UniConnect</div><nav className="nav"><Link href="/feed">Feed</Link><Link href="/communities">Communities</Link><Link href="/events">Events</Link></nav></aside><main className="main"><div className="card"><span className="badge">Campus events</span><h1>Upcoming at your university</h1><p className="muted">Events shown here are scoped to your university.</p></div>{error&&<p className="error">{error}</p>}<div className="grid eventGrid">{events.map(event=><article className="card" key={event.id}><h2>{event.title}</h2><p>{event.description}</p><p className="muted">{new Date(event.startsAt).toLocaleString()}{event.location?` · ${event.location}`:''}</p><p>{event._count.attendees} attending</p><button className="primary" onClick={()=>attend(event.id)}>Attend</button></article>)}</div></main></div>;
}
