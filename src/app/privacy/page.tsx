export default function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 space-y-6">
      <div className="text-xs font-mono uppercase tracking-widest text-teal-600">LEGAL</div>
      <h1 className="text-3xl font-display font-bold">Privacy Policy</h1>
      <div className="space-y-4 text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
        <p>
          Atech respects your privacy and provides full transparency and self-service data
          portability.
        </p>
        <h2 className="text-sm font-bold text-zinc-900 dark:text-white">
          1. Data We Collect
        </h2>
        <p>
          We store your account email, display name, invitation redemption record, project
          hardware/firmware trees, and security audit logs required for platform integrity.
        </p>
        <h2 className="text-sm font-bold text-zinc-900 dark:text-white">
          2. Full JSON Export & Account Deletion
        </h2>
        <p>
          You can download a complete JSON archive of your profile and projects or permanently
          delete your account at any time from the Account Settings page (/account).
        </p>
      </div>
    </div>
  );
}
