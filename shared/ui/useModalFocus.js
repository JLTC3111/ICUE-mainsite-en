import { useEffect } from 'react'

const FOCUSABLE = 'button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'

/** The modal is a direct body portal, outside the inert app root. */
export default function useModalFocus(open, dialogRef, returnFocusRef, close) {
  useEffect(() => {
    const dialog = dialogRef.current
    if (!open || !dialog) return
    const previous = returnFocusRef.current || document.activeElement
    const background = [...document.body.children].filter(element => element !== dialog && !element.contains(dialog))
    const inert = background.map(element => element.inert)
    background.forEach(element => { element.inert = true })
    const overflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const focusable = () => [...dialog.querySelectorAll(FOCUSABLE)].filter(element => !element.hidden && !element.closest('[inert]'))
    const focusFirst = () => (focusable()[0] || dialog).focus()
    const keydown = event => {
      if (event.key === 'Escape') { event.preventDefault(); event.stopPropagation(); close(); return }
      if (event.key !== 'Tab') return
      const items = focusable()
      const first = items[0] || dialog
      const last = items[items.length - 1] || dialog
      if (!dialog.contains(document.activeElement) || items.length === 0
        || (event.shiftKey && document.activeElement === first)
        || (!event.shiftKey && document.activeElement === last)) {
        event.preventDefault()
        ;(event.shiftKey ? last : first).focus()
      }
    }
    const focusin = event => { if (!dialog.contains(event.target)) focusFirst() }
    document.addEventListener('keydown', keydown, true)
    document.addEventListener('focusin', focusin)
    focusFirst()
    return () => {
      document.removeEventListener('keydown', keydown, true)
      document.removeEventListener('focusin', focusin)
      background.forEach((element, index) => { element.inert = inert[index] })
      document.body.style.overflow = overflow
      if (previous?.isConnected) previous.focus()
    }
  }, [open, dialogRef, returnFocusRef, close])
}
