<<<<<<< HEAD
import ProblemStatementComing from '@/app/event/ProblemStatementComing'
=======
import Navbar from '@/components/Navbar'
import PSComing from '@/app/event/PSComing'
>>>>>>> 105b59b533d0afdae96a79c221b9a7e7f2a7af3c

export const metadata = {
  title: 'Problem Statements — Coming Soon | Roborashtra',
  description:
    'Roborashtra 2026-27 Problem Statements and Arena Challenges are undergoing final declassification. Explore autonomous rovers, combat bots, robotic arms, and drone fleet briefs.',
}

export default function ProblemStatementsPage() {
  return (
<<<<<<< HEAD
    <div className="h-screen h-[100dvh] w-full overflow-hidden">
      <ProblemStatementComing />
=======
    <div className="min-h-screen w-full bg-black text-white">
      <Navbar />
      <main>
        <PSComing />
      </main>
>>>>>>> 105b59b533d0afdae96a79c221b9a7e7f2a7af3c
    </div>
  )
}

