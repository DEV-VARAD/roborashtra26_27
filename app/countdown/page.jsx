import Countdown from '@/app/countdown/Countdown'

export default function CountdownPage() {
  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-[#060A12]">
      <Countdown targetDate={new Date('2027-02-01T00:00:00+05:30')} />
    </div>
  )
}
