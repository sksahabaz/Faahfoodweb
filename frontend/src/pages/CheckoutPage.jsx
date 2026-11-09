import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { checkoutApi, ordersApi, restaurantsApi } from '@/api/endpoints'
import CornerRibbons from '@/components/decor/CornerRibbons'
import { useRestaurant } from '@/hooks/useRestaurant'
import { useAuth, useCart, useCartActions } from '@/hooks/useSession'
import { DEFAULT_PAYMENT, EMPTY_DETAILS, FIELDS, cartIssues, composeAddress, fieldForMessage, phoneDigits, splitAddress, validateDetails } from '@/lib/checkout'
import { formatPrice } from '@/lib/format'
import { appUrl } from '@/lib/paths'
import CheckoutHeader from '@/sections/checkout/CheckoutHeader'
import DeliveryDetails from '@/sections/checkout/DeliveryDetails'
import OrderSummary, { PlaceOrderButton } from '@/sections/checkout/OrderSummary'
import PaymentMethods from '@/sections/checkout/PaymentMethods'
import '@/sections/home/story/story.css' // navigation styles (shared with the homepage)
import '@/sections/checkout/checkout.css'

const FORM_ID = 'checkout-form'
const DRAFT_KEY = 'faah-checkout-details'

// What the user typed, kept for this browser tab only, so a reload or a trip to the cart
// page doesn't lose it (city and pincode have no place in the session until the order).
function readDraft(userId) {
  try {
    const draft = JSON.parse(sessionStorage.getItem(DRAFT_KEY))
    return draft?.userId === userId ? { ...EMPTY_DETAILS, ...draft.values } : null
  } catch {
    return null
  }
}
function writeDraft(userId, values) {
  try { sessionStorage.setItem(DRAFT_KEY, JSON.stringify({ userId, values })) } catch { /* storage off */ }
}
function clearDraft() {
  try { sessionStorage.removeItem(DRAFT_KEY) } catch { /* storage off */ }
}

/**
 * Checkout (/checkout; CheckoutController serves this page to logged-in users and sends
 * guests to /login first). Everything comes from the existing backend:
 *   cart            /api/cart (same session cart as the menu and cart pages)
 *   delivery        GET /api/checkout (saved details, else the account's name/phone/address)
 *   place order     POST /api/checkout {details} → POST /api/orders {paymentMethod}
 *                   (the order is priced from the session cart on the server)
 *   confirmation    /order-confirmation/{orderId} (the id POST /api/orders returns)
 */
export default function CheckoutPage() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const auth = useAuth()
  const cart = useCart()
  const actions = useCartActions()
  const user = auth.data?.authenticated ? auth.data.user : null

  const saved = useQuery({ queryKey: ['session', 'checkout'], queryFn: checkoutApi.get, enabled: Boolean(user), staleTime: Infinity, retry: false })
  const restaurantId = cart.data?.restaurantId ?? null
  const restaurant = useRestaurant(restaurantId)
  // Fresh menu (not cached) to catch dishes switched off or repriced since they were added.
  const menu = useQuery({ queryKey: ['menu', restaurantId], queryFn: () => restaurantsApi.menu(restaurantId), enabled: Boolean(restaurantId), staleTime: 0 })

  // Re-check against the menu whenever the cart changes (e.g. after "Update price").
  const refetchMenu = menu.refetch
  const cartUpdatedAt = cart.dataUpdatedAt
  useEffect(() => { if (restaurantId) refetchMenu() }, [restaurantId, cartUpdatedAt, refetchMenu])

  const [values, setValues] = useState(null)
  const [errors, setErrors] = useState({})
  const [payment, setPayment] = useState(DEFAULT_PAYMENT)
  const [placing, setPlacing] = useState(false)
  const [formError, setFormError] = useState(null)
  const submitting = useRef(false)
  const alertRef = useRef()

  useEffect(() => { document.title = 'Checkout | FAah!! FOOD' }, [])

  // Prefill once per user: this tab's draft, else the details from GET /api/checkout.
  useEffect(() => {
    if (!user || values) return
    const draft = readDraft(user.userId)
    if (draft) {
      setValues(draft)
    } else if (saved.data) {
      setValues({ ...EMPTY_DETAILS, customerName: saved.data.customerName || '', phone: saved.data.phone || '', ...splitAddress(saved.data.address) })
    } else if (saved.isError) {
      setValues({ ...EMPTY_DETAILS, customerName: user.name || '', phone: user.phone || '', ...splitAddress(user.address) })
    }
  }, [user, values, saved.data, saved.isError])

  useEffect(() => { if (user && values) writeDraft(user.userId, values) }, [user, values])

  const issues = useMemo(() => cartIssues(cart.data, menu.data), [cart.data, menu.data])
  const issueTypes = [...issues.values()].map((issue) => issue.type)
  const blocked = issueTypes.some((type) => type !== 'price') ? 'Remove the unavailable dishes to place your order.'
    : issueTypes.includes('price') ? 'Update the changed prices to place your order.' : null

  const checkField = useCallback((name, next) => {
    const message = validateDetails(next)[name]
    setErrors((current) => (current[name] === message ? current : { ...current, [name]: message }))
  }, [])

  const onChange = useCallback((name, value) => {
    const next = { ...values, [name]: value }
    setValues(next)
    if (errors[name]) checkField(name, next) // re-check as they fix it
  }, [values, errors, checkField])

  const onBlur = useCallback((name) => {
    if (values && (String(values[name]).trim() || errors[name])) checkField(name, values)
  }, [values, errors, checkField])

  const showError = (message) => {
    setFormError(message)
    requestAnimationFrame(() => alertRef.current?.scrollIntoView({ block: 'center', behavior: 'smooth' }))
  }

  const placeOrder = async (event) => {
    event.preventDefault()
    if (submitting.current || !values) return
    setFormError(null)

    const found = validateDetails(values)
    setErrors(found)
    const first = FIELDS.find((field) => found[field])
    if (first) {
      document.getElementById(`checkout-${first}`)?.focus()
      return
    }
    if (!cart.data?.items?.length) return
    if (blocked) return showError(blocked)
    if (!payment) return showError('Please select a payment method.')

    submitting.current = true
    setPlacing(true)
    try {
      await checkoutApi.save({
        customerName: values.customerName.trim(),
        phone: phoneDigits(values.phone.trim()),
        address: composeAddress(values),
        instructions: saved.data?.instructions || '',
      })
      const { orderId } = await ordersApi.place(payment)
      clearDraft()
      // The order exists and the session cart is cleared: show its confirmation page.
      queryClient.invalidateQueries({ queryKey: ['session'] })
      navigate(`/order-confirmation/${orderId}`, { replace: true })
    } catch (failure) {
      submitting.current = false
      setPlacing(false)
      if (failure.status === 401) {
        queryClient.invalidateQueries({ queryKey: ['session'] })
        return
      }
      if (failure.status === 409) queryClient.invalidateQueries({ queryKey: ['session', 'cart'] })
      const field = failure.status === 400 ? fieldForMessage(failure.message) : null
      if (field) {
        setErrors((current) => ({ ...current, [field]: failure.message }))
        document.getElementById(`checkout-${field}`)?.focus()
      } else {
        showError(failure.message || 'We could not place your order. Please try again.')
      }
    }
  }

  const items = cart.data?.items || []
  const loading = auth.isPending || (user && cart.isPending)
  const failed = auth.isError || (user && cart.isError)
  const step = !user || items.length ? 'checkout' : 'cart'

  return (
    <div className="faah-home">
      <div className="home-bg" aria-hidden="true" />
      <CornerRibbons />
      <CheckoutHeader current={step} />

      <div className="relative z-[1] mx-auto max-w-[1420px] px-4 pb-36 pt-[92px] sm:px-8 sm:pt-[118px] lg:pb-16">
        {loading ? (
          <Skeleton />
        ) : failed ? (
          <Message title="We couldn't load your checkout." text={(auth.error || cart.error)?.message}
            action={<button type="button" className="pill-button" onClick={() => { auth.refetch(); cart.refetch() }}>Try again</button>} testId="checkout-error" />
        ) : !user ? (
          <Message title="Please log in to continue to checkout." text="After logging in you'll come straight back here."
            action={<a className="pill-button" href={appUrl('checkout')}>Log in</a>} testId="checkout-auth" />
        ) : !items.length ? (
          <Message title="Your cart is empty." text="Add some dishes from a restaurant to place an order."
            action={<Link to="/#restaurants" className="pill-button">Browse restaurants</Link>} testId="checkout-empty" />
        ) : (
          <>
            <Heading />
            <div className="mt-6 grid grid-cols-[minmax(0,1fr)] items-start gap-7 lg:grid-cols-[minmax(0,1fr)_400px] xl:grid-cols-[minmax(0,830fr)_minmax(420px,540fr)] xl:gap-8">
              <form id={FORM_ID} noValidate onSubmit={placeOrder} className="flex min-w-0 flex-col gap-6" aria-describedby={formError ? 'checkout-alert' : undefined}>
                {formError && (
                  <div ref={alertRef} id="checkout-alert" role="alert" data-testid="checkout-alert"
                    className="flex items-start gap-3 rounded-[18px] border border-[#f4c3b2] bg-[#fff0ea] px-4 py-3 text-[15px] font-medium text-[#b3261e]">
                    <svg viewBox="0 0 24 24" className="mt-0.5 h-5 w-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><circle cx="12" cy="12" r="9.5" /><path d="M12 7.5v5.5M12 16.4v.1" /></svg>
                    <span className="flex-1">{formError}</span>
                    <button type="button" onClick={() => setFormError(null)} className="text-sm font-semibold text-orange-deep">Dismiss</button>
                  </div>
                )}
                <DeliveryDetails values={values || EMPTY_DETAILS} errors={errors} onChange={onChange} onBlur={onBlur}
                  disabled={!values || placing} loading={!values} />
                <PaymentMethods value={payment} onChange={setPayment} disabled={placing} />
              </form>

              <OrderSummary className="lg:sticky lg:top-[104px]" cart={cart.data} restaurant={restaurant.data} issues={issues}
                actions={actions} placing={placing} blocked={blocked} formId={FORM_ID} />
            </div>

            {/* Phones and tablets: total and Place Order always in reach. */}
            <div className="fixed inset-x-0 bottom-0 z-40 border-t border-[#f0d8c6] bg-[#fdf3ea]/95 px-4 py-3 shadow-[0_-12px_30px_-20px_rgb(110_52_16/0.5)] backdrop-blur lg:hidden" data-testid="mobile-place-bar">
              <div className="mx-auto flex max-w-xl items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-medium text-espresso-soft">Total payable</p>
                  <p className="text-[20px] font-bold text-orange-deep">{formatPrice(cart.data.total)}</p>
                </div>
                <PlaceOrderButton formId={FORM_ID} placing={placing} disabled={Boolean(blocked)} compact />
              </div>
            </div>
          </>
        )}
      </div>

      {actions.error && (
        <div role="alert" className="fixed inset-x-4 bottom-24 z-50 mx-auto flex max-w-md items-center justify-between gap-3 rounded-2xl bg-espresso px-5 py-3 text-sm text-white shadow-xl lg:bottom-6">
          <span>{actions.error}</span>
          <button type="button" onClick={actions.dismissError} className="font-semibold text-[#ffc59a]">Dismiss</button>
        </div>
      )}
    </div>
  )
}

function Heading() {
  return (
    <div className="px-1">
      <h1 className="relative inline-block text-[clamp(32px,3.4vw,48px)] font-extrabold leading-tight tracking-tight text-espresso">
        Checkout
        <svg viewBox="0 0 60 60" className="absolute -right-12 -top-3 h-11 w-11" fill="none" stroke="#f07a22" strokeWidth="6" strokeLinecap="round" aria-hidden="true">
          <path d="M14 4 L 8 22 M 36 10 L 20 30 M 52 34 L 30 40" />
        </svg>
      </h1>
      <p className="mt-1 text-[clamp(15px,1.3vw,19px)] text-espresso-soft">Complete your order in a few simple steps.</p>
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

function Skeleton() {
  const block = 'animate-pulse rounded-[28px] bg-white/55'
  return (
    <div aria-busy="true" aria-label="Loading checkout" data-testid="checkout-loading">
      <div className="h-[86px] w-[320px] max-w-full animate-pulse rounded-2xl bg-white/45" />
      <div className="mt-6 grid grid-cols-[minmax(0,1fr)] gap-7 lg:grid-cols-[minmax(0,1fr)_400px] xl:grid-cols-[minmax(0,830fr)_minmax(420px,540fr)]">
        <div className="flex flex-col gap-6"><div className={`${block} h-[360px]`} /><div className={`${block} h-[280px]`} /></div>
        <div className={`${block} h-[560px]`} />
      </div>
    </div>
  )
}
