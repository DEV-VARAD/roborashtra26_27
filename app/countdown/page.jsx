import Countdown from '@/app/countdown/Countdown'

export default function CountdownPage() {
  return (
    <div className="h-screen h-[100dvh] w-full overflow-hidden">
      <Countdown targetDate={new Date('2027-02-01T00:00:00+05:30')} />
    </div>
  )
}
