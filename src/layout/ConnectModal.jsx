import { useState } from 'react'
import { ArrowUpRight, Check, Copy, Download, Mail, MessageCircle } from 'lucide-react'
import Modal from '../components/Modal'
import { GitHubIcon, LinkedInIcon } from '../components/Icons'
import { useContent } from '../content/store'
import { mailto, whatsappLink } from '../lib/assets'
import { useResume } from '../lib/resume'
import './ConnectModal.css'

/** Everything a recruiter might want, one click away. Channels with no value are hidden. */
export default function ConnectModal({ open, onClose }) {
  const { profile, connect } = useContent()
  const resume = useResume()
  const [copied, setCopied] = useState(false)

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(profile.email)
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    } catch {
      /* clipboard blocked: the mailto link still works */
    }
  }

  const channels = [
    { key: 'email', icon: <Mail size={20} />, label: 'Email', value: profile.email, href: mailto(profile.email, connect.emailSubject) },
    { key: 'linkedin', icon: <LinkedInIcon />, label: 'LinkedIn', value: 'Let’s connect', href: profile.linkedin },
    { key: 'github', icon: <GitHubIcon />, label: 'GitHub', value: 'See the code', href: profile.github },
    { key: 'whatsapp', icon: <MessageCircle size={20} />, label: 'WhatsApp', value: 'Send a message', href: whatsappLink(profile.phone) },
    ...(resume ? [{ key: 'resume', icon: <Download size={20} />, label: 'CV / Resume', value: 'Download', href: resume.href, download: resume.external ? undefined : resume.filename }] : []),
  ].filter((c) => c.href && c.value)

  return (
    <Modal open={open} onClose={onClose} label="Connect" size="sm">
      <div className="connect-modal">
        <span className="kicker">Connect</span>
        <h3 className="connect-modal__title">Say hello to {profile.firstName}.</h3>
        {profile.availability && <p className="connect-modal__avail">{profile.availability}</p>}

        <ul className="connect-modal__list">
          {channels.map((c) => (
            <li key={c.key}>
              <a href={c.href} target={c.download ? undefined : '_blank'} rel="noreferrer" download={c.download}>
                <span className="connect-modal__icon">{c.icon}</span>
                <span className="connect-modal__text">
                  <strong>{c.label}</strong>
                  <small>{c.value}</small>
                </span>
                <ArrowUpRight size={18} />
              </a>
            </li>
          ))}
        </ul>

        <button className="btn btn--ghost btn--sm connect-modal__copy" onClick={copyEmail}>
          {copied ? <Check size={16} /> : <Copy size={16} />}
          {copied ? 'Email copied' : 'Copy email address'}
        </button>
      </div>
    </Modal>
  )
}
