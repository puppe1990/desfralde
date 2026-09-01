import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'

import { PecsCard } from '../components/pecs-card'
import {
  nextRoutineIndex,
  previousRoutineIndex,
} from '../domains/routine-cursor'
import { speakPortuguese } from '../lib/speak-portuguese'
import { getChildBoardFn } from '../server/child-board'

export const Route = createFileRoute('/criancas/$childId/passos')({
  loader: ({ params }) =>
    getChildBoardFn({ data: { childId: params.childId } }),
  component: PassosPage,
})

function PassosPage() {
  const board = Route.useLoaderData()
  const steps = board.rotina
  const [index, setIndex] = useState(0)
  const current = steps.at(index)

  if (!current) {
    return <p className="p-8">Rotina vazia.</p>
  }

  return (
    <main className="mx-auto flex max-w-xl flex-col items-center gap-5 px-4 py-8">
      <h2 className="font-serif text-4xl">Um passo de cada vez</h2>
      <div className="flex flex-wrap justify-center gap-2">
        {steps.map((step, stepIndex) => (
          <button
            key={step.id}
            type="button"
            aria-label={`Passo ${stepIndex + 1}`}
            onClick={() => {
              setIndex(stepIndex)
              speakPortuguese(step.speak)
            }}
            className={`size-4 rounded-full border-2 border-[#2a2118] ${
              stepIndex === index ? 'bg-[#e0a03a]' : 'bg-transparent'
            }`}
          />
        ))}
      </div>
      <div key={current.id} className="pecs-step w-full max-w-sm">
        <PecsCard {...current} number={index + 1} avatar={board.child.avatar} />
      </div>
      <div className="flex gap-3">
        <button
          type="button"
          disabled={index === 0}
          onClick={() => setIndex(previousRoutineIndex(index, steps.length))}
          className="min-h-14 min-w-36 rounded-2xl border-2 border-[#2a2118] font-bold disabled:opacity-35"
        >
          Voltar
        </button>
        <button
          type="button"
          onClick={() => {
            const next = nextRoutineIndex(index, steps.length)
            setIndex(next)
            const step = steps.at(next)
            if (step) speakPortuguese(step.speak)
          }}
          className="min-h-14 min-w-36 rounded-2xl bg-[#2a2118] font-bold text-[#fff8ec]"
        >
          {index === steps.length - 1 ? 'De novo' : 'Próximo'}
        </button>
      </div>
    </main>
  )
}
