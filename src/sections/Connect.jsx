import { ArrowUpRight, Mail, MessageCircle } from 'lucide-react'
import Reveal from '../components/Reveal'
import { GitHubIcon, LinkedInIcon } from '../components/Icons'
import ResumeLink from '../components/ResumeLink'
import { useContent } from '../content/store'
import { mailto, whatsappLink } from '../lib/assets'
import './Connect.css'

export default function Connect() {
  const { connect, profile } = useContent()

  const socials = [
    { label: 'LinkedIn', href: profile.linkedin, icon: <LinkedInIcon /> },
    { label: 'GitHub', href: profile.github, icon: <GitHubIcon /> },
    { label: 'WhatsApp', href: whatsappLink(profile.phone), icon: <MessageCircle size={20} /> },
  ].filter((s) => s.href)

  return (
    <section className="section connect" id="connect">
      <div className="connect__glow" aria-hidden="true" />
      <div className="container connect__inner">
        <Reveal>
          <span className="kicker">Contact</span>
        </Reveal>
        <Reveal as="h2" className="connect__title" delay={0.08}>
          {connect.title}
        </Reveal>
        <Reveal as="p" className="connect__text" delay={0.14}>
          {connect.text}
        </Reveal>

        <Reveal delay={0.2}>
          <a className="connect__mail" href={mailto(profile.email, connect.emailSubject)}>
            <Mail size={26} />
            <span>{profile.email}</span>
            <ArrowUpRight size={28} />
          </a>
        </Reveal>

        <Reveal className="connect__socials" delay={0.26}>
          {socials.map((s) => (
            <a key={s.label} className="btn btn--ghost" href={s.href} target="_blank" rel="noreferrer">
              {s.icon}
              {s.label}
            </a>
          ))}
          <ResumeLink iconSize={20} />
        </Reveal>
      </div>
    </section>
  )
}
