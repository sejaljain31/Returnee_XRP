import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { ReactNode } from 'react'

export default function Layout({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth()

  return (
    <div>
      <header className="navbar">
        <div className="container">
          <Link to="/" className="logo">Return<span>ee</span></Link>
          <nav>
            {user ? (
              <>
                <Link to="/dashboard">Dashboard</Link>
                {user.is_admin && <Link to="/admin">Admin</Link>}
                <span style={{ color: 'var(--gray-500)' }}>{user.email}</span>
                <button onClick={logout} className="btn btn-secondary">
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login">Login</Link>
                <Link to="/signup" className="btn btn-primary">Sign Up</Link>
              </>
            )}
          </nav>
        </div>
      </header>
      <main className="container">{children}</main>
    </div>
  )
}
