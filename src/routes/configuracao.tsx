import { createFileRoute } from '@tanstack/react-router'

import {
  AccountSettings,
  loadAccountSettings,
} from '../components/account-settings'
import { FamilyHeader } from '../components/family-header'

export const Route = createFileRoute('/configuracao')({
  loader: loadAccountSettings,
  component: ConfiguracaoPage,
})

function ConfiguracaoPage() {
  const data = Route.useLoaderData()

  return (
    <div>
      <FamilyHeader userName={data.user.name} />
      <AccountSettings {...data} />
    </div>
  )
}
