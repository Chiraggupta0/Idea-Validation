import { LayoutDashboard, Users, FileText, Landmark, Mail, Briefcase, BarChart3, ClipboardCheck, Settings } from 'lucide-react'
import PageHead from '../../components/dash/PageHead'

const GUIDE = [
  { icon: LayoutDashboard, title: 'Dashboard', body: 'A snapshot of your startup — mentor, current stage, latest announcement, and your most recent validation.' },
  { icon: Users, title: 'Community', body: 'An open chat for everyone in the incubation centre. Ask questions, share wins, find collaborators.' },
  { icon: FileText, title: 'Documents', body: 'Upload documents about your startup. Your mentor and admin can view them, and the admin can request specific ones.' },
  { icon: Landmark, title: 'Schemes & Grants', body: 'Common government schemes for every startup, plus schemes and grants matched specifically to your validated idea.' },
  { icon: Mail, title: 'Contact', body: 'Your mentor’s details, message thread, and meeting scheduler in one place.' },
  { icon: Briefcase, title: 'Portfolio', body: 'Every idea validation you’ve run, saved so you can reopen the full report anytime.' },
  { icon: BarChart3, title: 'Leaderboard', body: 'All startups ranked by funding raised and how far they’ve progressed.' },
  { icon: ClipboardCheck, title: 'Evaluation', body: 'Reviews, scores, and notices from your mentor.' },
  { icon: Settings, title: 'Settings', body: 'Change your name, phone, photo, and password.' },
]

export default function Help() {
  return (
    <div>
      <PageHead eyebrow="help" title="Help & guide">
        What each section does. Still stuck? Reach out in Community or contact your mentor.
      </PageHead>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {GUIDE.map(({ icon: Icon, title, body }) => (
          <div key={title} className="brutal flex gap-3 p-4">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg" style={{ background: 'var(--blue)', color: '#fff' }}>
              <Icon size={18} />
            </div>
            <div>
              <div className="font-display font-bold">{title}</div>
              <p className="mt-0.5 text-sm text-[var(--ink-soft)]">{body}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="brutal mt-6 p-5">
        <div className="eyebrow mb-2">need more help?</div>
        <p className="text-sm text-[var(--ink-soft)]">
          Email the incubation team at <a className="font-semibold text-[var(--blue)]" href="mailto:support@sivp.in">support@sivp.in</a> or post in the Community tab.
        </p>
      </div>
    </div>
  )
}
