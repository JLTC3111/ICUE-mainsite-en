import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from 'react'
import { createPortal } from 'react-dom'
import { connectAccount, getAccountSnapshot, subscribeAccount } from './account.js'
import { getLiveChatClient, liveChatRpc } from '../chatbot/lib/liveChat.js'
import useModalFocus from '../ui/useModalFocus.js'
import './CustomerAccountDialog.css'

const PORTAL = 'https://icue.vn/newsroom/portal?lang=en'

function accountError(error) {
  if (error?.code === 'invalid_credentials') return 'The email or password is incorrect.'
  if (error?.code === 'email_not_confirmed') return 'Confirm your email, then return here to sign in.'
  if (error?.code === 'weak_password') return 'Use a password with at least 8 characters.'
  if (/rate_limit/.test(error?.code || '')) return 'Too many attempts. Please try again later.'
  return 'Unable to connect. Please try again.'
}

/** Sign in on the English origin so the current guest capability can be claimed. */
export default function CustomerAccountDialog({ onClose }) {
  const account = useSyncExternalStore(subscribeAccount, getAccountSnapshot, getAccountSnapshot)
  const live = getLiveChatClient()
  const chat = useSyncExternalStore(live.subscribe, live.getSnapshot, live.getSnapshot)
  const [mode, setMode] = useState('login')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [chats, setChats] = useState([])
  const [listStatus, setListStatus] = useState('loading')
  const [revision, setRevision] = useState(0)
  const dialogRef = useRef(null)
  const triggerRef = useRef(document.activeElement)
  const busyRef = useRef(false)
  const mountedRef = useRef(true)
  const close = useCallback(() => { if (!busyRef.current) onClose() }, [onClose])
  useModalFocus(true, dialogRef, triggerRef, close)

  useEffect(() => {
    mountedRef.current = true
    void connectAccount().catch(() => { if (mountedRef.current) setError('Unable to connect. Please try again.') })
    return () => { mountedRef.current = false }
  }, [])

  useEffect(() => {
    if (!account.user) { setChats([]); return undefined }
    let active = true
    setListStatus('loading')
    void live.syncAccount(account.user).then(() => liveChatRpc('customer_chats')).then(data => {
      if (active) { setChats(data?.conversations || []); setListStatus('ready') }
    }).catch(() => { if (active) setListStatus('error') })
    return () => { active = false }
  }, [account.user?.id, chat.conversation?.account_saved, revision, live])

  async function submit(event) {
    event.preventDefault()
    if (busyRef.current) return
    const fields = new FormData(event.currentTarget)
    const email = String(fields.get('email') || '').trim()
    const password = String(fields.get('password') || '')
    if (mode === 'signup' && password !== fields.get('confirmPassword')) {
      setError('The passwords do not match.')
      event.currentTarget.elements.confirmPassword.focus()
      return
    }
    busyRef.current = true
    setBusy(true); setError(''); setNotice('')
    try {
      const client = await connectAccount()
      const result = mode === 'signup'
        ? await client.auth.signUp({ email, password, options: { data: { display_name: String(fields.get('name') || '').trim() }, emailRedirectTo: 'https://icue.vn/newsroom/portal?lang=en' } })
        : await client.auth.signInWithPassword({ email, password })
      if (result.error) throw result.error
      if (!result.data.session) {
        if (mountedRef.current) setNotice('Check your inbox to confirm your email, then return here to sign in.')
        return
      }
      await live.syncAccount(result.data.session.user)
      if (mountedRef.current) setRevision(value => value + 1)
    } catch (failure) { if (mountedRef.current) setError(accountError(failure)) }
    finally { busyRef.current = false; if (mountedRef.current) setBusy(false) }
  }

  async function logout() {
    if (busyRef.current) return
    busyRef.current = true; setBusy(true); setError('')
    try {
      const client = await connectAccount()
      const result = await client.auth.signOut()
      if (result.error) throw result.error
      await live.syncAccount(null)
      if (mountedRef.current) setChats([])
    } catch (failure) { if (mountedRef.current) setError(accountError(failure)) }
    finally { busyRef.current = false; if (mountedRef.current) setBusy(false) }
  }

  return createPortal(
    <div className="icue-account" ref={dialogRef} tabIndex={-1} role="dialog" aria-modal="true" aria-labelledby="icue-account-title" data-icue-chat-theme="light" onClick={event => { if (event.target === event.currentTarget) close() }}>
      <section className="icue-account__panel">
        <header><span>ICUE · Customer portal</span><button type="button" aria-label="Close customer portal" disabled={busy} onClick={close}>×</button></header>
        <h2 id="icue-account-title">{account.user ? 'Your conversations' : mode === 'signup' ? 'Keep your conversations together.' : 'Sign in to keep your chat.'}</h2>
        {error && <p role="alert" className="icue-account__error">{error}</p>}
        {notice && <p role="status">{notice}</p>}
        {account.user ? <>
          <p>{account.user.email}</p>
          {chat.accountError ? <p role="alert">Could not save this conversation. <button type="button" onClick={() => live.syncAccount(account.user, { force: true })}>Retry</button></p> : chat.conversation?.account_saved && <p role="status">Your conversation and files are saved to your account.</p>}
          <button className="icue-account__primary" type="button" onClick={close} disabled={busy}>Continue chatting</button>
          {listStatus === 'loading' && <p role="status">Loading conversations…</p>}
          {listStatus === 'error' && <p role="alert">Could not load your conversations. <button type="button" onClick={() => setRevision(value => value + 1)}>Retry</button></p>}
          <div className="icue-account__chats">
            {chats.map(thread => <button key={thread.id} type="button" aria-pressed={chat.conversation?.id === thread.id} onClick={async () => { await live.selectConversation(thread.id); onClose() }}><strong>{thread.preview || 'Documents and photos'}</strong><small>{new Intl.DateTimeFormat('en', { dateStyle: 'medium' }).format(new Date(thread.updated_at))}</small></button>)}
          </div>
          <button type="button" disabled={busy} onClick={logout}>Sign out</button>
        </> : <>
          <p>Save your conversation and private files, and continue with our team on another device.</p>
          <form onSubmit={submit}>
            {mode === 'signup' && <label>Your name<input name="name" autoComplete="name" maxLength={100} required /></label>}
            <label>Email<input name="email" type="email" autoComplete="username" autoCapitalize="none" required /></label>
            <label>Password<input name="password" type="password" autoComplete={mode === 'signup' ? 'new-password' : 'current-password'} minLength={mode === 'signup' ? 8 : undefined} required /></label>
            {mode === 'signup' && <label>Confirm password<input name="confirmPassword" type="password" autoComplete="new-password" required /></label>}
            <button className="icue-account__primary" disabled={busy} type="submit">{busy ? 'Connecting…' : mode === 'signup' ? 'Create account' : 'Sign in'}</button>
          </form>
          <button type="button" disabled={busy} onClick={() => { setMode(value => value === 'login' ? 'signup' : 'login'); setError(''); setNotice('') }}>{mode === 'login' ? 'Create an account' : 'Already have an account? Sign in'}</button>
          <a href={PORTAL}>Forgot your password?</a>
        </>}
      </section>
    </div>, document.body,
  )
}
