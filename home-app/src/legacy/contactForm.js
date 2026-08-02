let form = null
let submitHandler = null

export function initContactForm() {
  destroyContactForm()

  form = document.getElementById('contactForm')
  const thankYou = document.getElementById('thankYouMessage')
  if (!form || !thankYou) return

  submitHandler = async (event) => {
    event.preventDefault()

    try {
      const formData = new FormData(form)
      const response = await fetch('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams(formData).toString(),
      })
      if (!response.ok) throw new Error(`Contact form failed: ${response.status}`)
      form.style.display = 'none'
      thankYou.style.display = 'block'
    } catch {
      window.alert('Something went wrong. Please try again.')
    }
  }

  form.addEventListener('submit', submitHandler)
}

export function destroyContactForm() {
  if (form && submitHandler) form.removeEventListener('submit', submitHandler)
  form = null
  submitHandler = null
}
