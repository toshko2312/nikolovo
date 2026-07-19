import type { Metadata } from 'next';
import { login } from './actions';

export const metadata: Metadata = {
  title: 'Вход',
  // Unlisted page: keep it out of search results and out of sitemap.ts (not in PAGE_ORDER).
  robots: { index: false, follow: false },
};

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <main
      className="fade"
      style={{
        minHeight: '100dvh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '32px 20px',
      }}
    >
      <div style={{ width: '100%', maxWidth: 420 }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <p className="eyebrow" style={{ marginBottom: 10 }}>
            Николово
          </p>
          <h1 className="page-title" style={{ margin: 0 }}>
            Вход
          </h1>
        </div>

        <form action={login} className="info-card">
          <label className="eyebrow" htmlFor="password">
            Парола
          </label>
          <input
            id="password"
            name="password"
            type="password"
            className="field"
            autoComplete="current-password"
            required
            autoFocus
          />

          {error ? (
            <p className="mono" style={{ fontSize: 13, color: '#c2413a', margin: '0 0 18px' }}>
              Грешна парола.
            </p>
          ) : null}

          <button
            type="submit"
            className="btn-accent"
            style={{ width: '100%', border: 0, cursor: 'pointer', fontFamily: 'inherit' }}
          >
            Влез
          </button>
        </form>
      </div>
    </main>
  );
}
