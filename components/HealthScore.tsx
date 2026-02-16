export default function HealthScore({ score }: { score: number }) {
  let color = 'text-green-400'
  if (score < 70) color = 'text-yellow-400'
  if (score < 40) color = 'text-red-400'

  return (
    <span className={`font-semibold ${color}`}>
      {score}%
    </span>
  )
}
