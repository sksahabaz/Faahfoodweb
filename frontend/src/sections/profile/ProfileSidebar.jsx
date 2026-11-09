import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router'
import UserAvatar from '@/components/ui/UserAvatar'
import { AVATAR_ACCEPT, prepareAvatar } from '@/lib/profile'

const NAV = [
  { id: 'profile', label: 'My Profile', to: '/profile', icon: <><circle cx="12" cy="8" r="4" /><path d="M4.5 20.5c1-4 4-6 7.5-6s6.5 2 7.5 6" /></> },
  { id: 'orders', label: 'My Orders', to: '/my-orders', icon: <><rect x="4" y="5" width="16" height="16" rx="3" /><path d="M9 3.5h6v3H9zM8 11h8M8 15h5" /></> },
  { id: 'addresses', label: 'Saved Addresses', to: '/profile/addresses', icon: <><path d="M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0 1 13 0c0 5.4-6.5 11-6.5 11z" /><circle cx="12" cy="10" r="2.4" /></> },
]

/**
 * Left column: picture (with the camera button to change it), name, email, the account
 * links (existing routes) and Logout (the existing POST /api/auth/logout).
 */
export default function ProfileSidebar({ user, current, actions, onLogout, loggingOut }) {
  const inputRef = useRef()
  const [preview, setPreview] = useState(null) // { blob, url }
  const [problem, setProblem] = useState(null)
  const [notice, setNotice] = useState(null)

  useEffect(() => () => { if (preview) URL.revokeObjectURL(preview.url) }, [preview])

  const choose = async (event) => {
    const file = event.target.files?.[0]
    event.target.value = '' // the same file can be chosen again
    if (!file) return
    setProblem(null)
    setNotice(null)
    try {
      const blob = await prepareAvatar(file)
      setPreview({ blob, url: URL.createObjectURL(blob) })
    } catch (failure) {
      setProblem(failure.message)
    }
  }

  const save = () => {
    actions.upload.mutate(preview.blob, {
      onSuccess: () => { setPreview(null); setNotice('Profile picture updated.') },
      onError: (failure) => setProblem(failure.message),
    })
  }

  const remove = () => {
    setProblem(null)
    actions.remove.mutate(undefined, {
      onSuccess: () => setNotice('Profile picture removed.'),
      onError: (failure) => setProblem(failure.message),
    })
  }

  return (
    <aside className="rounded-[30px] bg-white/75 px-5 py-6 shadow-[0_28px_60px_-36px_rgb(110_52_16/0.55)] ring-1 ring-[#f3dccb] sm:px-6 lg:py-8" aria-label="Your account" data-testid="profile-sidebar">
      <div className="flex items-center gap-5 lg:flex-col lg:gap-0 lg:text-center">
        <div className="relative shrink-0">
          <div className="h-[96px] w-[96px] overflow-hidden rounded-full bg-gradient-to-b from-[#ff8a3a] to-[#e9520f] text-white shadow-[0_18px_34px_-16px_rgb(207_78_24/0.75)] ring-4 ring-white sm:h-[112px] sm:w-[112px] lg:h-[132px] lg:w-[132px]" data-testid="profile-avatar">
            <UserAvatar user={user} textClassName="text-[34px] font-bold tracking-tight sm:text-[40px] lg:text-[46px]" />
          </div>
          <button type="button" onClick={() => inputRef.current?.click()} disabled={actions.upload.isPending}
            className="absolute -bottom-0.5 -right-0.5 grid h-10 w-10 place-items-center rounded-full bg-white text-espresso shadow-[0_8px_18px_-8px_rgb(110_52_16/0.6)] ring-1 ring-[#f0d8c6] transition hover:bg-[#fff3ea] hover:text-orange-deep focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-espresso"
            aria-label="Change profile picture" data-testid="avatar-change">
            <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true"><path d="M4 8.5A2.5 2.5 0 0 1 6.5 6h1.6l1.3-1.8h5.2L15.9 6h1.6A2.5 2.5 0 0 1 20 8.5v8A2.5 2.5 0 0 1 17.5 19h-11A2.5 2.5 0 0 1 4 16.5z" fill="currentColor" /><circle cx="12" cy="12.4" r="3.4" fill="#fff" /><circle cx="12" cy="12.4" r="2" fill="currentColor" /></svg>
          </button>
          <input ref={inputRef} type="file" accept={AVATAR_ACCEPT} className="sr-only" tabIndex={-1} aria-hidden="true" onChange={choose} data-testid="avatar-input" />
        </div>

        <div className="min-w-0 lg:mt-5 lg:w-full">
          <p className="truncate text-[clamp(20px,1.6vw,25px)] font-bold text-espresso" data-testid="sidebar-name">{user.name}</p>
          <p className="truncate text-[15px] text-espresso-soft" title={user.email} data-testid="sidebar-email">{user.email}</p>
          {user.avatarUrl && (
            <button type="button" onClick={remove} disabled={actions.remove.isPending}
              className="mt-1 text-[13px] font-semibold text-espresso-soft underline underline-offset-2 hover:text-orange-deep disabled:opacity-60" data-testid="avatar-remove">
              {actions.remove.isPending ? 'Removing…' : 'Remove photo'}
            </button>
          )}
        </div>
      </div>

      {(problem || notice) && (
        <p role={problem ? 'alert' : 'status'} data-testid={problem ? 'avatar-error' : 'avatar-notice'}
          className={`mt-4 rounded-2xl px-4 py-2.5 text-[14px] font-medium ${problem ? 'bg-[#fff0ea] text-[#b3261e]' : 'bg-[#eef8ea] text-[#2f6b2a]'}`}>
          {problem || notice}
        </p>
      )}

      <nav className="mt-6 lg:mt-7" aria-label="Account">
        {/* phones and tablets: a 2 × 2 grid, so every link is in view; desktop: a list */}
        <ul className="grid grid-cols-2 gap-1 sm:grid-cols-4 lg:flex lg:flex-col">
          {NAV.map((item) => {
            const active = item.id === current
            return (
              <li key={item.id} className="min-w-0">
                <Link to={item.to} aria-current={active ? 'page' : undefined} data-testid={`side-${item.id}`}
                  className={`relative flex h-full items-center gap-2.5 rounded-2xl px-3 py-3 text-[15px] leading-tight sm:whitespace-nowrap font-semibold transition sm:gap-3 sm:px-4 sm:text-[16px] lg:text-[17px] ${
                    active ? 'bg-[#fde3cf] text-[#d4501a] lg:before:absolute lg:before:-left-[2px] lg:before:top-2 lg:before:bottom-2 lg:before:w-[4px] lg:before:rounded-full lg:before:bg-[#e8622a]' : 'text-espresso hover:bg-[#fdf0e6]'}`}>
                  <svg viewBox="0 0 24 24" className={`h-6 w-6 shrink-0 ${active ? 'text-[#e0561c]' : 'text-espresso'}`} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{item.icon}</svg>
                  {item.label}
                </Link>
              </li>
            )
          })}
          <li className="min-w-0 lg:mt-3 lg:border-t lg:border-[#f0dccd] lg:pt-3">
            <button type="button" onClick={onLogout} disabled={loggingOut} data-testid="side-logout"
              className="flex h-full w-full items-center gap-2.5 rounded-2xl px-3 py-3 text-[15px] leading-tight sm:whitespace-nowrap font-semibold text-[#d4501a] transition hover:bg-[#fdf0e6] disabled:opacity-60 sm:gap-3 sm:px-4 sm:text-[16px] lg:text-[18px]">
              <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M14 4.5H7a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2h7M10.5 12H20M16.5 8l4 4-4 4" /></svg>
              {loggingOut ? 'Logging out…' : 'Logout'}
            </button>
          </li>
        </ul>
      </nav>

      {preview && (
        <AvatarPreview url={preview.url} saving={actions.upload.isPending} onSave={save}
          onCancel={() => setPreview(null)} onChooseAnother={() => inputRef.current?.click()} />
      )}
    </aside>
  )
}

/** Shows the picture as it will appear before anything is uploaded. */
function AvatarPreview({ url, saving, onSave, onCancel, onChooseAnother }) {
  const saveRef = useRef()
  useEffect(() => {
    saveRef.current?.focus()
    const onKey = (event) => { if (event.key === 'Escape' && !saving) onCancel() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onCancel, saving])
  return (
    <div className="fixed inset-0 z-50 grid place-items-center p-4" role="dialog" aria-modal="true" aria-labelledby="avatar-preview-title" data-testid="avatar-preview">
      <button type="button" className="absolute inset-0 bg-espresso/40 backdrop-blur-[2px]" onClick={() => !saving && onCancel()} aria-label="Cancel" tabIndex={-1} />
      <div className="relative w-full max-w-sm rounded-[28px] bg-[#fffaf4] p-6 text-center shadow-2xl">
        <h2 id="avatar-preview-title" className="text-xl font-bold text-espresso">New profile picture</h2>
        <img src={url} alt="Preview of your new profile picture" className="mx-auto mt-5 h-[180px] w-[180px] rounded-full object-cover ring-4 ring-white shadow-[0_18px_34px_-16px_rgb(110_52_16/0.6)]" />
        <p className="mt-3 text-[14px] text-espresso-soft">This is how it will look across FAah!! FOOD.</p>
        <div className="mt-6 flex flex-col gap-2">
          <button ref={saveRef} type="button" onClick={onSave} disabled={saving} className="pill-button justify-center" data-testid="avatar-save">
            {saving ? 'Saving…' : 'Save photo'}
          </button>
          <button type="button" onClick={onChooseAnother} disabled={saving} className="rounded-full px-5 py-2.5 font-semibold text-espresso ring-1 ring-espresso/15 hover:bg-espresso/5 disabled:opacity-60">Choose another</button>
          <button type="button" onClick={onCancel} disabled={saving} className="rounded-full px-5 py-2 text-[14px] font-semibold text-espresso-soft hover:text-espresso disabled:opacity-60" data-testid="avatar-cancel">Cancel</button>
        </div>
      </div>
    </div>
  )
}
