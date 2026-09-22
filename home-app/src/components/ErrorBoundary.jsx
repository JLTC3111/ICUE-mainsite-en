import { Component } from 'react'
import { subscribeToPageResume } from '../../../shared/resilience/pageResume.js'

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error, info) {
    console.error('[ErrorBoundary]', error, info)
  }

  componentDidMount() {
    this.unsubscribe = subscribeToPageResume(() => {
      if (this.state.hasError) this.setState({ hasError: false })
    }, { minHiddenMs: 0 })
  }

  componentWillUnmount() { this.unsubscribe?.() }

  render() {
    if (this.state.hasError) {
      return this.props.fallback ?? null
    }
    return this.props.children
  }
}
