import { createFileRoute } from '@tanstack/react-router'

import {
  AccountSettings,
  loadAccountSettings,
} from '../components/account-settings'

export const Route = createFileRoute('/criancas/$childId/configuracao')({
  loader: async ({ params }) => {
    const data = await loadAccountSettings()
    return { ...data, childId: params.childId }
  },
  component: ChildConfiguracaoPage,
})

function ChildConfiguracaoPage() {
  const data = Route.useLoaderData()
  return <AccountSettings {...data} />
}
