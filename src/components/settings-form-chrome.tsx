export const pecsTextFieldClass =
  'rounded-2xl border-2 border-[#2a2118] bg-[#fff8ec] px-4 py-3'

export function SettingsFormStatus({
  error,
  done,
}: {
  error: string | null
  done: string | null
}) {
  if (error) return <p className="mt-3 text-[#9a3d28]">{error}</p>
  if (done) return <p className="mt-3 text-[#335648]">{done}</p>
  return null
}
