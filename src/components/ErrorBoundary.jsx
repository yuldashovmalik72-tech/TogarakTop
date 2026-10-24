import { Component } from "react";
import { Link } from "react-router-dom";
import BrandMark from "./BrandMark.jsx";

/**
 * Runtime xatoliklar (JS crash) uchun Error Boundary.
 * React Router 404 dan tashqari kutilmagan xatoliklarni ushlaydi.
 */
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error("ErrorBoundary:", error, info);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="mx-auto flex min-h-[70vh] max-w-lg flex-col items-center justify-center px-4 py-16 text-center">
          <div className="mb-6 flex items-center gap-2 opacity-80">
            <BrandMark size={32} />
            <span className="font-display text-xl font-extrabold text-ink">PathFinder</span>
          </div>

          <p className="font-mono text-6xl font-bold tracking-tight text-danger/30 sm:text-7xl">
            500
          </p>

          <h1 className="mt-3 font-display text-2xl font-extrabold text-ink sm:text-3xl">
            Kutilmagan xatolik
          </h1>

          <p className="mt-3 max-w-md text-sm leading-relaxed text-muted sm:text-base">
            Sahifada xatolik yuz berdi. Sahifani yangilab ko‘ring yoki bosh sahifaga qayting.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={this.handleRetry}
              className="inline-flex items-center rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-dark"
            >
              Qayta urinish
            </button>
            <Link
              to="/"
              onClick={this.handleRetry}
              className="inline-flex items-center rounded-xl border border-line bg-paper-raised px-5 py-2.5 text-sm font-semibold text-ink-soft transition hover:border-primary/40 hover:text-primary"
            >
              Bosh sahifa
            </Link>
          </div>

          {import.meta.env.DEV && this.state.error && (
            <pre className="mt-10 max-h-40 w-full overflow-auto rounded-xl border border-line bg-paper-raised p-3 text-left text-xs text-muted">
              {String(this.state.error?.stack || this.state.error)}
            </pre>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}
