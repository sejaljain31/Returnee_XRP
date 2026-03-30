import { Link, Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

const PROMISES = [
  {
    classSuffix: 'security',
    kicker: 'Your worry',
    title: 'Security',
    body: "You should not have to guess whether your payment or parcel details are safe. We use trusted checkout, keep a clear record of your return, and treat your shipment as something worth protecting—because for you, it is.",
  },
  {
    classSuffix: 'convenience',
    kicker: 'Your time',
    title: 'Convenience',
    body: 'Returns too often mean a scavenger hunt through retailer emails, carrier sites, and fine print. We put labels, payment, and status in one flow so the runaround is not your problem.',
  },
] as const

const STEPS = [
  {
    title: 'Start your return',
    text: 'Add your packages and deadlines in one place—no tab overload.',
  },
  {
    title: 'Label & pay',
    text: 'Upload your label and check out securely when you are ready.',
  },
  {
    title: 'Track to done',
    text: 'Follow status updates until your return is completed.',
  },
] as const

export default function HomePage() {
  const { user, isLoading } = useAuth()

  if (isLoading) {
    return <div className="container text-center mt-4">Loading...</div>
  }

  if (user) {
    return <Navigate to="/dashboard" replace />
  }

  return (
    <div className="home-page">
      <section className="home-intro" aria-label="Welcome">
        <p className="home-motto">
          <span className="home-motto-line1">We take it</span>
          <span className="home-motto-line2">
            from <span className="home-motto-accent">here.</span>
          </span>
        </p>
        <p className="home-tagline">
          Create returns, upload labels, pay securely, and track every step until completion—all in one place.
        </p>
        <div className="home-actions-row">
          <Link to="/signup" className="btn btn-primary">
            Sign up
          </Link>
          <Link to="/login" className="btn btn-secondary">
            Log in
          </Link>
        </div>
      </section>

      <h2 className="home-section-title">What we stand behind</h2>
      <ul className="home-promises">
        {PROMISES.map((item) => (
          <li
            key={item.title}
            className={`card home-promise-card home-promise-card--${item.classSuffix}`}
          >
            <p className="home-promise-kicker">{item.kicker}</p>
            <h2>{item.title}</h2>
            <p>{item.body}</p>
          </li>
        ))}
      </ul>

      <h2 className="home-section-title">How it works</h2>
      <div className="home-steps">
        {STEPS.map((step, i) => (
          <div key={step.title} className="home-step">
            <div className="home-step-num" aria-hidden>
              {i + 1}
            </div>
            <h3>{step.title}</h3>
            <p>{step.text}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
