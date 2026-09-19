'use client';
import { useEffect, useState } from 'react';

type Conversation={id:string;members:{user:{id:string;username:string;name:string}}[];messages:{content:string;sender:{username:string}}[]};
const API=process.env.NEXT_PUBLIC_API_URL||'http://localhost:4000';

export default function MessagesPage(){
 const [items,setItems]=useState<Conversation[]>([]); const [active,setActive]=useState<Conversation|null>(null);
 const [history,setHistory]=useState<any[]>([]); const [username,setUsername]=useState(''); const [content,setContent]=useState(''); const [error,setError]=useState('');
 const token=typeof window!=='undefined'?localStorage.getItem('token'):'';
 const headers={Authorization:`Bearer ${token}`,'Content-Type':'application/json'};
 async function load(){const r=await fetch(`${API}/messages/conversations`,{headers}); if(r.ok)setItems(await r.json());}
 async function open(c:Conversation){setActive(c); const r=await fetch(`${API}/messages/${c.id}`,{headers}); if(r.ok)setHistory(await r.json());}
 async function start(){setError(''); const r=await fetch(`${API}/messages/direct`,{method:'POST',headers,body:JSON.stringify({username})}); const d=await r.json(); if(!r.ok){setError(d.message||'Unable to start conversation');return;} setUsername(''); await load(); open(d);}
 async function send(){if(!active||!content.trim())return; const r=await fetch(`${API}/messages/${active.id}`,{method:'POST',headers,body:JSON.stringify({content})}); if(r.ok){setHistory(x=>[...x,await r.json()]);setContent('');}}
 useEffect(()=>{if(token)load()},[]);
 return <main className="page"><div className="pageHeader"><div><span className="eyebrow">PRIVATE MESSAGING</span><h1>Messages</h1><p>Connect directly with classmates and approved connections.</p></div></div>
 <div className="messageShell"><aside className="conversationList"><div className="startChat"><input placeholder="username" value={username} onChange={e=>setUsername(e.target.value)}/><button className="primary" onClick={start}>New chat</button>{error&&<small className="error">{error}</small>}</div>{items.map(c=><button className="conversation" key={c.id} onClick={()=>open(c)}>{c.members.map(m=>m.user.name).join(', ')}</button>)}</aside>
 <section className="chatPanel">{active?<><div className="chatHeader"><strong>{active.members.map(m=>m.user.name).join(' · ')}</strong></div><div className="chatHistory">{history.map(m=><div className="bubble" key={m.id}><b>@{m.sender.username}</b><span>{m.content}</span></div>)}</div><div className="chatComposer"><input placeholder="Write a message…" value={content} onChange={e=>setContent(e.target.value)} onKeyDown={e=>e.key==='Enter'&&send()}/><button className="primary" onClick={send}>Send</button></div></>:<div className="emptyState"><h2>Your conversations</h2><p>Select a conversation or start a new chat.</p></div>}</section></div></main>
}
