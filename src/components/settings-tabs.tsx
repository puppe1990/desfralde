import { useState } from 'react'
import type { ReactNode } from 'react'

export const SETTINGS_TABS = [
  { id: 'senha', label: 'Senha', activeClass: 'bg-[#c45c3e] text-white' },
  {
    id: 'terapeuta',
    label: 'Terapeuta',
    activeClass: 'bg-[#335648] text-white',
  },
  {
    id: 'professora',
    label: 'Professora',
    activeClass: 'bg-[#9a3d28] text-white',
  },
] as const

export type SettingsTabId = (typeof SETTINGS_TABS)[number]['id']

export function settingsTabClass(isActive: boolean, activeClass: string) {
  if (isActive) {
    return `rounded-full px-4 py-2 text-sm font-bold ${activeClass}`
  }
  return 'rounded-full bg-[#2a2118]/10 px-4 py-2 text-sm font-bold text-[#2a2118]'
}

type SettingsTabsProps = {
  senha: ReactNode
  terapeuta: ReactNode
  professora: ReactNode
}

export function SettingsTabs({
  senha,
  terapeuta,
  professora,
}: SettingsTabsProps) {
  const [tab, setTab] = useState<SettingsTabId>('senha')
  const panels: Record<SettingsTabId, ReactNode> = {
    senha,
    terapeuta,
    professora,
  }

  return (
    <div className="mt-8">
      <div
        role="tablist"
        aria-label="Configuração"
        className="flex flex-wrap gap-2"
      >
        {SETTINGS_TABS.map((item) => {
          const selected = item.id === tab
          return (
            <button
              key={item.id}
              type="button"
              role="tab"
              id={`tab-${item.id}`}
              aria-selected={selected}
              aria-controls={`panel-${item.id}`}
              tabIndex={selected ? 0 : -1}
              className={settingsTabClass(selected, item.activeClass)}
              onClick={() => setTab(item.id)}
            >
              {item.label}
            </button>
          )
        })}
      </div>
      <div
        role="tabpanel"
        id={`panel-${tab}`}
        aria-labelledby={`tab-${tab}`}
        className="mt-4"
      >
        {panels[tab]}
      </div>
    </div>
  )
}
