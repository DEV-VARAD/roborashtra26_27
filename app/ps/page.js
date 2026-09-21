import ProblemStatementComing from '@/app/event/ProblemStatementComing'

export const metadata = {
  title: 'Problem Statements — Coming Soon | Roborashtra',
  description:
    'Roborashtra 2026-27 Problem Statements and Arena Challenges are undergoing final declassification. Explore autonomous rovers, combat bots, robotic arms, and drone fleet briefs.',
}

export default function ProblemStatementsPage() {
  return (
    <div className="h-screen h-[100dvh] w-full overflow-hidden">
      <ProblemStatementComing />
    </div>
  )
}

