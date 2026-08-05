import type { Metadata } from 'next'

const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'https://fearinsight.com').replace(/\/$/, '')

export const metadata: Metadata = {
  title: 'Upcoming',
  description: 'The next Fear Insight drop is coming soon.',
  alternates: { canonical: `${siteUrl}/upcoming` },
  openGraph: {
    title: 'Upcoming | Fear Insight',
    description: 'The next Fear Insight drop is coming soon.',
    url: `${siteUrl}/upcoming`,
    type: 'website',
  },
}

export default function UpcomingLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
