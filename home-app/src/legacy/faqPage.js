const FAQ_DATA = {
  services: [
    ['Question - What types of consulting services do you provide?', 'Answer: We provide consulting in planning, design, project management, supervision, and legal procedure support.'],
    ['Question - Do you take on small residential projects?', 'Answer: Yes, we handle everything from residential housing to commercial and industrial buildings.'],
  ],
  process: [
    ['Question - What is the collaboration process like?', 'Answer: The process includes: initial consultation → site survey → preliminary design → finalized drawings → construction support.'],
    ['Question - Can I make changes to the design during the process?', 'Answer: Yes, clients have the right to request revisions at different stages before finalizing the drawings.'],
  ],
  costs: [
    ['Question - How are service fees calculated?', 'Answer: Fees can be charged as a package, as a percentage of total investment, or hourly depending on the project type.'],
    ['Question - Do you allow payment in installments?', 'Answer: Yes, we accept flexible payments according to project phases.'],
  ],
  legal: [
    ['Question - Do you assist with building permits?', 'Answer: Yes, we provide full support from preparing documents to submitting them to the authorities.'],
    ['Question - What documents do clients need to provide?', 'Answer: Typically: land ownership papers, current site drawings, and relevant legal documents.'],
  ],
  timeline: [
    ['Question - How long does it take to complete a project?', 'Answer: Depending on scale, usually 2-6 months for design and 6-18 months for construction.'],
    ['Question - What if the project is delayed?', 'Answer: We immediately report delays, propose solutions, and commit to catching up when possible.'],
  ],
  technology: [
    ['Question - Do you use BIM technology?', 'Answer: Yes, we use BIM and 3D modeling to help clients clearly visualize the design.'],
    ['Question - Do you offer green design solutions?', 'Answer: Yes, we prioritize sustainable materials and energy-saving solutions.'],
  ],
  clients: [
    ['Question - Who are your main clients?', 'Answer: We serve individuals, businesses, and government agencies.'],
    ['Question - Do you provide maintenance support after handover?', 'Answer: Yes, we offer after-sales service and maintenance upon request.'],
  ],
  general: [
    ['Question - Can I see your past projects?', 'Answer: Yes, please contact us to receive our portfolio and project list.'],
    ['Question - What’s the fastest way to contact you?', 'Answer: You can call our hotline directly or send an email, we respond within 24 hours.'],
  ],
}

let abortController = null
let currentCategory = null
let currentCard = null
let currentSection = null

function categoryFromCard(card) {
  const inlineHandler = card.getAttribute('onclick') || ''
  return card.dataset.faqCategory || inlineHandler.match(/openCategory\(['"]([^'"]+)/)?.[1] || null
}

function closeCurrent() {
  currentCard?.classList.remove('active')
  currentCard?.setAttribute('aria-expanded', 'false')
  currentSection?.remove()
  currentCard = null
  currentSection = null
}

function toggleAnswer(question) {
  const answer = question.nextElementSibling
  if (!answer?.classList.contains('faq-answer-text')) return
  const willOpen = answer.hidden
  answer.hidden = !willOpen
  question.classList.toggle('expanded', willOpen)
  question.setAttribute('aria-expanded', String(willOpen))
  if (willOpen && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    answer.animate(
      [{ opacity: 0, transform: 'translateY(-4px)' }, { opacity: 1, transform: 'translateY(0)' }],
      { duration: 220, easing: 'ease-out' },
    )
  }
}

function openCategory(category, card) {
  if (!FAQ_DATA[category] || !card) return
  const shouldClose = currentCategory === category
  closeCurrent()
  if (shouldClose) {
    currentCategory = null
    return
  }

  currentCategory = category
  currentCard = card
  card.classList.add('active')
  card.setAttribute('aria-expanded', 'true')

  const section = document.createElement('div')
  section.className = 'faq-answer-section'
  section.setAttribute('aria-live', 'polite')
  FAQ_DATA[category].forEach(([questionText, answerText]) => {
    const item = document.createElement('div')
    item.className = 'faq-answer'
    const question = document.createElement('h4')
    question.className = 'faq-question'
    question.tabIndex = 0
    question.setAttribute('role', 'button')
    question.setAttribute('aria-expanded', 'false')
    question.textContent = questionText
    const answer = document.createElement('div')
    answer.className = 'faq-answer-text'
    answer.hidden = true
    answer.textContent = answerText
    question.addEventListener('click', () => toggleAnswer(question), { signal: abortController.signal })
    question.addEventListener('keydown', (event) => {
      if (event.key !== 'Enter' && event.key !== ' ') return
      event.preventDefault()
      toggleAnswer(question)
    }, { signal: abortController.signal })
    item.append(question, answer)
    section.appendChild(item)
  })
  card.insertAdjacentElement('afterend', section)
  currentSection = section

  if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    section.animate(
      [{ opacity: 0, transform: 'translateY(-8px)' }, { opacity: 1, transform: 'translateY(0)' }],
      { duration: 280, easing: 'ease-out' },
    )
  }
}

export function initFaqPage() {
  destroyFaqPage()
  abortController = new AbortController()
  const { signal } = abortController

  document.querySelectorAll('.faq-card').forEach((card) => {
    const category = categoryFromCard(card)
    if (!category) return
    card.removeAttribute('onclick')
    card.dataset.faqCategory = category
    card.tabIndex = 0
    card.setAttribute('role', 'button')
    card.setAttribute('aria-expanded', 'false')
    card.addEventListener('click', () => openCategory(category, card), { signal })
    card.addEventListener('keydown', (event) => {
      if (event.key !== 'Enter' && event.key !== ' ') return
      event.preventDefault()
      openCategory(category, card)
    }, { signal })
  })

  window.__icueFaqData = Object.fromEntries(
    Object.entries(FAQ_DATA).map(([category, entries]) => [
      category,
      entries.map(([q, a]) => ({ q, a })),
    ]),
  )
  window.__icueFaqLang = 'en'
}

export function destroyFaqPage() {
  abortController?.abort()
  abortController = null
  closeCurrent()
  currentCategory = null
}
