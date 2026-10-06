import React, { useEffect, useRef, useState } from 'react';
import { MessageSquare, Send, X } from 'lucide-react';
import { createLiveChat, endLiveChat, markChatRead, sendLiveChatMessage, subscribeChatSession, subscribeLiveChat, type LiveChatMessage } from '../lib/liveChat';

export const LiveChatWidget: React.FC = () => {
  const [open,setOpen]=useState(false), [chatId,setChatId]=useState<string|null>(null), [name,setName]=useState(''), [email,setEmail]=useState(''), [text,setText]=useState(''), [messages,setMessages]=useState<LiveChatMessage[]>([]), [ended,setEnded]=useState(false), [error,setError]=useState(''), [busy,setBusy]=useState(false);
  const bottom=useRef<HTMLDivElement>(null);
  const previousMessageCount=useRef<number|null>(null);
  const playNotification=()=>{ try { const AC=(window.AudioContext || (window as any).webkitAudioContext); if(!AC)return; const ctx=new AC(); const osc=ctx.createOscillator(); const gain=ctx.createGain(); osc.connect(gain); gain.connect(ctx.destination); osc.frequency.value=720; gain.gain.setValueAtTime(0.06,ctx.currentTime); gain.gain.exponentialRampToValueAtTime(0.001,ctx.currentTime+0.16); osc.start(); osc.stop(ctx.currentTime+0.16); } catch {} };
  useEffect(()=>{ const saved=localStorage.getItem('bafin_live_chat_id'); if(saved)setChatId(saved); },[]);
  useEffect(()=>{ if(!chatId)return; previousMessageCount.current=null; const a=subscribeLiveChat(chatId,m=>{ const prev=previousMessageCount.current; setMessages(m); if(prev!==null && m.length>prev && m[m.length-1]?.sender==='admin'){ playNotification(); void markChatRead(chatId,'visitor'); } previousMessageCount.current=m.length; }); const b=subscribeChatSession(chatId,s=>{ if(!s){ localStorage.removeItem('bafin_live_chat_id'); setChatId(null); return; } setName(s.name||''); setEmail(s.email||''); const isEnded=s.status==='ended'; setEnded(isEnded); if(isEnded)localStorage.removeItem('bafin_live_chat_id'); else { localStorage.setItem('bafin_live_chat_id',chatId); if(s.unreadForVisitor)void markChatRead(chatId,'visitor'); } }); return()=>{a();b();}; },[chatId]);
  useEffect(()=>{
    // Some browsers/device-emulation environments may expose the ref before
    // scrollIntoView is available. Never let auto-scroll crash the chat UI.
    const el = bottom.current;
    if (el && typeof el.scrollIntoView === 'function') {
      el.scrollIntoView({behavior:'smooth'});
    }
  },[messages]);
  const start=async(e:React.FormEvent)=>{e.preventDefault();setError('');setBusy(true);try{const id=await createLiveChat(name,email);localStorage.setItem('bafin_live_chat_id',id);setChatId(id);}catch(err:any){setError(err?.code==='auth/operation-not-allowed'?'Live chat requires Anonymous sign-in to be enabled in Firebase Authentication.':'Unable to start chat. Please try again.');}finally{setBusy(false)}};
  const send=async(e:React.FormEvent)=>{e.preventDefault();if(!chatId||!text.trim()||ended)return;const v=text;setText('');try{await sendLiveChatMessage(chatId,'visitor',v)}catch{setText(v);setError('Message could not be sent.')}};
  const end=async()=>{if(chatId)await endLiveChat(chatId)};
  return <>
    <button onClick={()=>setOpen(true)} className="fixed bottom-8 right-8 z-40 w-14 h-14 bg-[#F5C400] hover:bg-[#FFD000] text-[#0B0B0C] rounded-full shadow-2xl shadow-[#F5C400]/30 border border-[#F5C400] flex items-center justify-center" aria-label="Live chat"><MessageSquare className="w-6 h-6"/></button>
    {open&&<div className="fixed inset-0 z-[80] pointer-events-none flex items-end justify-end p-3 sm:p-6"><div className="pointer-events-auto w-full sm:w-[390px] h-[min(620px,82vh)] bg-[#111112] border border-[#343438] rounded-2xl shadow-2xl flex flex-col overflow-hidden">
      <div className="p-4 border-b border-[#29292C] flex items-center justify-between"><div><div className="font-bold text-white">Bafin Solution Live Support</div><div className="text-[11px] text-[#A9A9AD]">Direct chat with our support team</div></div><button onClick={()=>setOpen(false)} className="p-2 text-[#A9A9AD] hover:text-white"><X className="w-5 h-5"/></button></div>
      {!chatId?<form onSubmit={start} className="p-5 space-y-4 my-auto"><div><label className="text-xs text-[#A9A9AD]">Full Name</label><input required value={name} onChange={e=>setName(e.target.value)} className="mt-1 w-full bg-[#1C1C1E] border border-[#343438] rounded-xl px-4 py-3 text-white"/></div><div><label className="text-xs text-[#A9A9AD]">Email Address</label><input required type="email" value={email} onChange={e=>setEmail(e.target.value)} className="mt-1 w-full bg-[#1C1C1E] border border-[#343438] rounded-xl px-4 py-3 text-white"/></div>{error&&<div className="text-xs text-red-400">{error}</div>}<button disabled={busy} className="w-full bg-[#F5C400] text-black font-bold rounded-xl py-3 disabled:opacity-60">{busy?'Starting…':'Start Chat'}</button></form>:
      <><div className="flex-1 overflow-y-auto p-4 space-y-3">{messages.length===0&&<div className="text-center text-xs text-[#737378] mt-8">Chat started. Send your first message.</div>}{messages.map(m=><div key={m.id} className={`flex ${m.sender==='visitor'?'justify-end':'justify-start'}`}><div className={`max-w-[82%] px-3 py-2 rounded-xl text-sm ${m.sender==='visitor'?'bg-[#F5C400] text-black':'bg-[#242427] text-white'}`}>{m.text}</div></div>)}<div ref={bottom}/></div>{error&&<div className="px-4 pb-2 text-xs text-red-400">{error}</div>}{ended?<div className="p-4 border-t border-[#29292C] text-center text-sm text-[#A9A9AD]">This chat has ended.</div>:<form onSubmit={send} className="p-3 border-t border-[#29292C] flex gap-2"><input value={text} onChange={e=>setText(e.target.value)} placeholder="Write a message…" className="flex-1 min-w-0 bg-[#1C1C1E] border border-[#343438] rounded-xl px-3 py-2.5 text-white"/><button className="w-11 rounded-xl bg-[#F5C400] text-black flex items-center justify-center"><Send className="w-4 h-4"/></button></form>}<button onClick={end} disabled={ended} className="mx-3 mb-3 text-xs text-red-400 disabled:text-[#737378]">End Chat</button></>}
    </div></div>}
  </>;
};
