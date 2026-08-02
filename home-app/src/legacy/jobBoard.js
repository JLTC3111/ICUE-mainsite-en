const JOBS = [
  {
    title: 'Head of Technology Assistant',
    department: 'Technology',
    location: 'Hanoi, Vietnam',
    description: 'We’re looking for a tech-savvy, organized pro to support our CTO and tech leadership. Help manage projects, streamline workflows, and keep our tech teams firing on all cylinders.',
    tags: ['Tech understanding + admin/project skills', 'Great communication & organization', 'Proactive, solution-oriented mindset', 'Full-time'],
  },
  {
    title: 'Research Intern',
    department: 'Administration',
    location: 'Hanoi, Vietnam',
    description: 'Join our team to explore new technologies, support innovative projects, and learn from top experts in the field. This is a part-time internship with flexible hours.',
    tags: ['Curiosity and passion for research', 'Willingness to learn and contribute', 'Strong analytical and problem-solving skills', 'Part-time'],
  },
  {
    title: 'Data Analyst',
    department: 'Data & Analytics',
    location: 'Ho Chi Minh City, Vietnam',
    description: 'Analyze energy data to optimize performance and predict trends. Use Python, SQL, and machine learning tools.',
    tags: ['Python', 'SQL', 'Machine Learning', 'Analytics', 'Full-time'],
  },
]

let abortController = null
let searchTimer = null

function escapeHtml(value) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;')
}

function highlight(value, term) {
  const safe = escapeHtml(value)
  if (!term) return safe
  const escapedTerm = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  return safe.replace(new RegExp(`(${escapedTerm})`, 'gi'), '<mark class="search-highlight">$1</mark>')
}

function renderJobs(jobs, term = '') {
  const container = document.getElementById('jobs-container')
  if (!container) return

  container.replaceChildren(...jobs.map((job) => {
    const card = document.createElement('article')
    card.className = 'job-card'
    card.innerHTML = `
      <h3 class="job-title">${highlight(job.title, term)}</h3>
      <div class="job-department">${highlight(job.department, term)}</div>
      <div class="job-location" aria-label="Location: ${escapeHtml(job.location)}">⌖ ${highlight(job.location, term)}</div>
      <div class="job-description">${highlight(job.description, term)}</div>
      <div class="job-tags">${job.tags.map((tag) => `<span class="job-tag">${highlight(tag, term)}</span>`).join('')}</div>
    `
    return card
  }))
}

function showSearchMessage(message) {
  document.querySelector('.search-result-message')?.remove()
  if (!message) return
  const container = document.getElementById('jobs-container')
  if (!container?.parentNode) return
  const result = document.createElement('p')
  result.className = 'search-result-message'
  result.setAttribute('aria-live', 'polite')
  result.textContent = message
  container.parentNode.insertBefore(result, container)
}

function performSearch({ scroll = false } = {}) {
  const input = document.getElementById('job-search')
  if (!input) return
  const term = input.value.trim().toLowerCase()
  const matches = term
    ? JOBS.filter((job) => [job.title, job.department, job.location, job.description, ...job.tags]
      .some((value) => value.toLowerCase().includes(term)))
    : JOBS

  renderJobs(matches, term)
  showSearchMessage(term
    ? `${matches.length} position${matches.length === 1 ? '' : 's'} found for “${input.value.trim()}”.`
    : '')

  if (scroll && matches.length) {
    document.getElementById('open-positions')?.scrollIntoView({
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
      block: 'start',
    })
  }
}

export function clearJobSearch() {
  const input = document.getElementById('job-search')
  if (input) input.value = ''
  renderJobs(JOBS)
  showSearchMessage('')
}

export function initJobBoard() {
  destroyJobBoard()
  abortController = new AbortController()
  const { signal } = abortController
  const form = document.querySelector('.job-search-form')
  const input = document.getElementById('job-search')
  const clearButton = document.querySelector('.clear-button')
  const cta = document.querySelector('.cta-button')

  form?.removeAttribute('onsubmit')
  clearButton?.removeAttribute('onclick')
  form?.addEventListener('submit', (event) => {
    event.preventDefault()
    performSearch({ scroll: true })
  }, { signal })
  input?.addEventListener('input', () => {
    window.clearTimeout(searchTimer)
    searchTimer = window.setTimeout(performSearch, 250)
  }, { signal })
  clearButton?.addEventListener('click', clearJobSearch, { signal })
  cta?.addEventListener('click', (event) => {
    event.preventDefault()
    document.getElementById('open-positions')?.scrollIntoView({
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
    })
  }, { signal })

  window.searchJobs = (event) => {
    event?.preventDefault?.()
    performSearch({ scroll: true })
  }
  window.clearJobSearch = clearJobSearch
  renderJobs(JOBS)
}

export function destroyJobBoard() {
  abortController?.abort()
  abortController = null
  window.clearTimeout(searchTimer)
  searchTimer = null
  delete window.searchJobs
  delete window.clearJobSearch
}
