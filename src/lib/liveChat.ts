import { addDoc, collection, deleteDoc, doc, getDocs, onSnapshot, orderBy, query, serverTimestamp, setDoc, updateDoc, writeBatch } from 'firebase/firestore';
import { signInAnonymously } from 'firebase/auth';
import { auth, db } from '../firebase';

export interface LiveChatSession { id: string; visitorUid: string; name: string; email: string; status: 'open'|'ended'; createdAt?: any; updatedAt?: any; lastMessage?: string; lastSender?: 'visitor'|'admin'; unreadForAdmin?: boolean; unreadForVisitor?: boolean; }
export interface LiveChatMessage { id: string; sender: 'visitor'|'admin'; text: string; createdAt?: any; }

export async function ensureChatIdentity() {
  if (auth.currentUser) return auth.currentUser;
  const cred = await signInAnonymously(auth);
  return cred.user;
}
export async function createLiveChat(name: string, email: string) {
  const u = await ensureChatIdentity();
  const ref = doc(collection(db, 'chatSessions'));
  await setDoc(ref, { visitorUid: u.uid, name: name.trim(), email: email.trim(), status: 'open', createdAt: serverTimestamp(), updatedAt: serverTimestamp(), lastMessage: '', unreadForAdmin: false, unreadForVisitor: false });
  return ref.id;
}
export async function sendLiveChatMessage(chatId: string, sender: 'visitor'|'admin', text: string) {
  const clean = text.trim(); if (!clean) return;
  await addDoc(collection(db, 'chatSessions', chatId, 'messages'), { sender, text: clean, createdAt: serverTimestamp() });
  await updateDoc(doc(db, 'chatSessions', chatId), {
    lastMessage: clean,
    lastSender: sender,
    unreadForAdmin: sender === 'visitor',
    unreadForVisitor: sender === 'admin',
    updatedAt: serverTimestamp()
  });
}
export function subscribeLiveChat(chatId: string, cb: (m: LiveChatMessage[]) => void) {
  return onSnapshot(query(collection(db, 'chatSessions', chatId, 'messages'), orderBy('createdAt', 'asc')), s => cb(s.docs.map(d => ({ id:d.id, ...d.data() } as LiveChatMessage))));
}
export function subscribeChatSession(chatId: string, cb: (s: LiveChatSession|null) => void) {
  return onSnapshot(doc(db, 'chatSessions', chatId), d => cb(d.exists()?({id:d.id,...d.data()} as LiveChatSession):null));
}
export function subscribeAllLiveChats(cb: (s: LiveChatSession[]) => void) {
  return onSnapshot(query(collection(db, 'chatSessions'), orderBy('updatedAt','desc')), s => cb(s.docs.map(d=>({id:d.id,...d.data()} as LiveChatSession))));
}
export async function markChatRead(chatId: string, side: 'admin'|'visitor') {
  await updateDoc(doc(db, 'chatSessions', chatId), side === 'admin' ? { unreadForAdmin: false } : { unreadForVisitor: false });
}
export async function endLiveChat(chatId: string) { await updateDoc(doc(db,'chatSessions',chatId), {status:'ended', unreadForAdmin:false, unreadForVisitor:false, updatedAt:serverTimestamp()}); }

export async function deleteLiveChat(chatId: string) {
  const messagesRef = collection(db, 'chatSessions', chatId, 'messages');
  const snapshot = await getDocs(messagesRef);
  const docs = snapshot.docs;
  for (let i = 0; i < docs.length; i += 450) {
    const batch = writeBatch(db);
    docs.slice(i, i + 450).forEach(messageDoc => batch.delete(messageDoc.ref));
    await batch.commit();
  }
  await deleteDoc(doc(db, 'chatSessions', chatId));
}
