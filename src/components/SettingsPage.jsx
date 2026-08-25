import PageHero from './PageHero.jsx'
import SyncPanel from './SyncPanel.jsx'
import NotificationsPanel from './NotificationsPanel.jsx'

function SettingsPage({ sync, onBack }) {
  return (
    <div className="page">
      <PageHero view="settings" title="Settings" onBack={onBack} closeIcon />

      <div className="page-body">
        <h2 className="label-sm">Backup</h2>
        <SyncPanel
          session={sync.session}
          ready={sync.ready}
          status={sync.status}
          message={sync.message}
          syncedAt={sync.syncedAt}
          onSignIn={sync.signIn}
          onSignUp={sync.signUp}
          onSetPassword={sync.setPassword}
          onSignOut={sync.signOut}
        />

        <h2 className="label-sm">Reminders</h2>
        <NotificationsPanel session={sync.session} />
      </div>
    </div>
  )
}

export default SettingsPage
