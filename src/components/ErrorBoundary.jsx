import { Component } from "react";

/**
 * A failing section must not unmount the rest of the page.
 * Renders nothing extra while healthy, so desktop markup stays the same.
 */
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error) {
    console.error(this.props.name || "section", error);
  }

  render() {
    if (this.state.error) return this.props.fallback ?? null;
    return this.props.children;
  }
}
