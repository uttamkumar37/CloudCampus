import { useState } from 'react'
import { PageHeader } from '../../../components/ui/PageHeader'
import { useChangePassword } from '../hooks/useChangePassword'
import { useSendCredentialsOtp } from '../hooks/useSendCredentialsOtp'
import { useUpdateCredentials } from '../hooks/useUpdateCredentials'
import { showToast } from '../../../utils/toast'
import type { NotificationChannel } from '../types'

export function ChangePasswordPage() {
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [channel, setChannel] = useState<NotificationChannel>('EMAIL')
  const [otp, setOtp] = useState('')
  const [newUsername, setNewUsername] = useState('')
  const [credentialPassword, setCredentialPassword] = useState('')
  const [confirmCredentialPassword, setConfirmCredentialPassword] = useState('')
  const changePasswordMutation = useChangePassword()
  const sendOtpMutation = useSendCredentialsOtp()
  const updateCredentialsMutation = useUpdateCredentials()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (newPassword !== confirmPassword) {
      showToast({ title: 'Passwords do not match', tone: 'error' })
      return
    }
    if (newPassword.length < 8) {
      showToast({ title: 'New password must be at least 8 characters', tone: 'error' })
      return
    }
    changePasswordMutation.mutate(
      { currentPassword, newPassword },
      {
        onSuccess: () => {
          showToast({ title: 'Password changed successfully', tone: 'success' })
          setCurrentPassword('')
          setNewPassword('')
          setConfirmPassword('')
        },
        onError: () => {
          showToast({ title: 'Failed to change password. Check your current password.', tone: 'error' })
        },
      },
    )
  }

  const handleSendOtp = () => {
    sendOtpMutation.mutate(
      { channel },
      {
        onSuccess: () => showToast({ title: 'OTP sent', description: `Check your ${channel.toLowerCase()} inbox.`, tone: 'success' }),
        onError: () => showToast({ title: 'Failed to send OTP', tone: 'error' }),
      },
    )
  }

  const handleUpdateCredentials = (e: React.FormEvent) => {
    e.preventDefault()
    if (credentialPassword !== confirmCredentialPassword) {
      showToast({ title: 'Passwords do not match', tone: 'error' })
      return
    }
    updateCredentialsMutation.mutate(
      {
        channel,
        otp,
        newUsername,
        newPassword: credentialPassword,
      },
      {
        onSuccess: () => {
          showToast({ title: 'Credentials updated', description: 'Your username/password are updated.', tone: 'success' })
          setOtp('')
          setNewUsername('')
          setCredentialPassword('')
          setConfirmCredentialPassword('')
        },
        onError: () => showToast({ title: 'Credential update failed', tone: 'error' }),
      },
    )
  }

  return (
    <section className="space-y-6 max-w-2xl">
      <PageHeader title="Change Password" subtitle="Update your account password." />

      <form onSubmit={handleSubmit} className="space-y-4 bg-white rounded-2xl border border-slate-200 p-6">
        <div className="space-y-1">
          <label className="text-sm font-medium text-slate-700">Current Password</label>
          <input
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            required
            autoComplete="current-password"
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium text-slate-700">New Password</label>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            minLength={8}
            autoComplete="new-password"
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium text-slate-700">Confirm New Password</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            minLength={8}
            autoComplete="new-password"
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <button
          type="submit"
          disabled={changePasswordMutation.isPending}
          className="w-full rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
        >
          {changePasswordMutation.isPending ? 'Saving…' : 'Change Password'}
        </button>
      </form>

      <form onSubmit={handleUpdateCredentials} className="space-y-4 bg-white rounded-2xl border border-slate-200 p-6">
        <h3 className="text-base font-semibold text-slate-900">Update Username + Password via OTP</h3>
        <p className="text-sm text-slate-600">Use this flow for first-login credential setup or secure credential updates.</p>

        <div className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-700">OTP Channel</label>
            <select
              value={channel}
              onChange={(e) => setChannel(e.target.value as NotificationChannel)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="EMAIL">Email</option>
              <option value="SMS">SMS</option>
            </select>
          </div>

          <button
            type="button"
            onClick={handleSendOtp}
            disabled={sendOtpMutation.isPending}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-800 hover:bg-slate-50 disabled:opacity-50"
          >
            {sendOtpMutation.isPending ? 'Sending…' : 'Send OTP'}
          </button>
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium text-slate-700">OTP</label>
          <input
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            required
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium text-slate-700">New Username</label>
          <input
            value={newUsername}
            onChange={(e) => setNewUsername(e.target.value)}
            required
            minLength={5}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium text-slate-700">New Password</label>
          <input
            type="password"
            value={credentialPassword}
            onChange={(e) => setCredentialPassword(e.target.value)}
            required
            minLength={8}
            autoComplete="new-password"
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium text-slate-700">Confirm New Password</label>
          <input
            type="password"
            value={confirmCredentialPassword}
            onChange={(e) => setConfirmCredentialPassword(e.target.value)}
            required
            minLength={8}
            autoComplete="new-password"
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <button
          type="submit"
          disabled={updateCredentialsMutation.isPending}
          className="w-full rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-black disabled:opacity-50"
        >
          {updateCredentialsMutation.isPending ? 'Updating…' : 'Update Credentials'}
        </button>
      </form>
    </section>
  )
}
