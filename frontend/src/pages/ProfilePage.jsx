import { useCallback, useEffect } from 'react'
import { useNavigate } from 'react-router'
import CornerRibbons from '@/components/decor/CornerRibbons'
import SiteNav from '@/components/layout/SiteNav'
import { useProfileActions } from '@/hooks/useProfile'
import { useAuth, useLogout } from '@/hooks/useSession'
import { appUrl } from '@/lib/paths'
import { ProfileDetails, SavedAddress } from '@/sections/profile/ProfileContent'
import ProfileSidebar from '@/sections/profile/ProfileSidebar'
import '@/sections/home/story/story.css' // navigation styles (shared with the homepage)
import '@/sections/profile/profile.css'

const SECTIONS = {
  profile: { title: 'My Profile', subtitle: 'View and update your personal information.', path: 'profile' },
  addresses: { title: 'Saved Addresses', subtitle: 'The delivery address saved on your account.', path: 'profile/addresses' },
}

/**
 * My Profile (/profile) and Saved Addresses (/profile/addresses). ProfileController serves
 * them to logged-in users (guests go to /login first). The user shown is the shared user
 * query (GET /api/auth/me), the same one the navbar reads; changes go through /api/profile
 * and replace it (see useProfileActions).
 */
export default function ProfilePage({ section = 'profile' }) {
  const navigate = useNavigate()
  const auth = useAuth()
  const actions = useProfileActions()
  const logout = useLogout()
  const user = auth.data?.authenticated ? auth.data.user : null
  const page = SECTIONS[section]

  useEffect(() => { document.title = `${page.title} | FAah!! FOOD` }, [page])
  const onNavigate = useCallback((target) => navigate(target === 'top' ? '/' : `/#${target}`), [navigate])
  const onLogout = () => logout.mutate(undefined, { onSettled: () => navigate('/') })

  let content
  if (auth.isPending) {
    content = (
      <div className="grid grid-cols-[minmax(0,1fr)] gap-6 lg:grid-cols-[320px_minmax(0,1fr)] xl:grid-cols-[350px_minmax(0,1fr)]" aria-busy="true" aria-label="Loading your profile" data-testid="profile-loading">
        <div className="h-[460px] animate-pulse rounded-[30px] bg-white/55" />
        <div className="h-[460px] animate-pulse rounded-[30px] bg-white/55" />
      </div>
    )
  } else if (auth.isError) {
    content = (
      <Message testId="profile-load-error" title="We couldn't load your profile." text={auth.error?.message}
        action={<button type="button" className="pill-button" onClick={() => auth.refetch()}>Try again</button>} />
    )
  } else if (!user) {
    content = (
      <Message testId="profile-login" title="Please log in to see your profile." text="After logging in you'll come straight back here."
        action={<a className="pill-button" href={appUrl(page.path)}>Log in</a>} />
    )
  } else {
    content = (
      <div className="grid grid-cols-[minmax(0,1fr)] items-start gap-6 lg:grid-cols-[320px_minmax(0,1fr)] xl:grid-cols-[350px_minmax(0,1fr)] xl:gap-8">
        <ProfileSidebar user={user} current={section} actions={actions} onLogout={onLogout} loggingOut={logout.isPending} />
        <div className="min-w-0">
          <Heading title={page.title} subtitle={page.subtitle} />
          <div className="mt-6">
            {section === 'addresses'
              ? <SavedAddress key={`address-${user.userId}`} user={user} update={actions.update} />
              : <ProfileDetails key={`profile-${user.userId}`} user={user} update={actions.update} />}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="faah-home profile-page">
      <div className="home-bg" aria-hidden="true" />
      <CornerRibbons />
      <SiteNav solid onNavigate={onNavigate} onSearch={() => navigate('/#restaurants')} />

      <div className="relative z-[1] mx-auto w-full max-w-[1500px] flex-1 px-4 pb-10 pt-[96px] sm:px-8 sm:pt-[112px]">
        {content}
      </div>

      {/* rider and storefront from the order confirmation page, in the bottom corners (wide screens) */}
      <div className="profile-art" aria-hidden="true">
        <img src={appUrl('confirmation/scooter.webp')} alt="" className="profile-art-scooter" />
        <img src={appUrl('confirmation/store.webp')} alt="" className="profile-art-store" />
      </div>
    </div>
  )
}

function Heading({ title, subtitle }) {
  return (
    <div className="flex items-center gap-4 px-1">
      <svg viewBox="0 0 24 24" className="h-[clamp(42px,3.4vw,56px)] w-[clamp(42px,3.4vw,56px)] shrink-0 self-start text-orange" aria-hidden="true">
        <circle cx="12" cy="7.5" r="4.5" fill="currentColor" /><path d="M3.5 21.5c.6-5 4.2-8 8.5-8s7.9 3 8.5 8z" fill="currentColor" />
      </svg>
      <div>
        <h1 className="relative inline-block text-[clamp(30px,3vw,44px)] font-extrabold leading-tight tracking-tight text-espresso" data-testid="profile-heading">
          {title}
          <svg viewBox="0 0 60 60" className="absolute -right-11 -top-3 h-10 w-10" fill="none" stroke="#f07a22" strokeWidth="6" strokeLinecap="round" aria-hidden="true">
            <path d="M14 4 L 8 22 M 36 10 L 20 30 M 52 34 L 30 40" />
          </svg>
        </h1>
        <p className="text-[clamp(15px,1.3vw,19px)] text-espresso-soft">{subtitle}</p>
      </div>
    </div>
  )
}

function Message({ title, text, action, testId }) {
  return (
    <div className="mx-auto mt-10 flex max-w-xl flex-col items-center gap-3 rounded-[28px] bg-white/75 px-6 py-14 text-center shadow-[0_24px_50px_-34px_rgb(110_52_16/0.5)] ring-1 ring-[#f3dccb]" data-testid={testId}>
      <p className="text-xl font-semibold text-espresso">{title}</p>
      {text && <p className="text-sm text-espresso-soft">{text}</p>}
      {action}
    </div>
  )
}
