import { Link } from 'react-router-dom'
import { Lock } from 'lucide-react'
import { useContent } from '../content/store'
import './Footer.css'

export default function Footer() {
  const { profile, connect } = useContent()
  return (
    <footer className="footer">
      <div className="container footer__row">
        <p>
          © {new Date().getFullYear()} {profile.name}. {connect.footerNote}
        </p>
        <p className="footer__meta">
          Built with React
          {/* quiet link to the content dashboard */}
          <Link to="/admin" className="footer__lock" aria-label="Content dashboard" title="Content dashboard">
            <Lock size={13} />
          </Link>
        </p>
      </div>
    </footer>
  )
}
