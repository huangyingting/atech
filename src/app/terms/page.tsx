export default function TermsPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 space-y-6">
      <div className="text-xs font-mono uppercase tracking-widest text-teal-600">LEGAL</div>
      <h1 className="text-3xl font-display font-bold">Terms of Service</h1>
      <div className="space-y-4 text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
        <p>
          Welcome to Atech. By accessing the Atech Storefront or AI Firmware Studio, you agree
          to these Terms of Service.
        </p>
        <h2 className="text-sm font-bold text-zinc-900 dark:text-white">
          1. Invite-Only Studio Access & Fair Use
        </h2>
        <p>
          Registration requires a valid invitation code issued by an administrator. Accounts
          receive a monthly credit allocation for AI hardware and firmware synthesis.
        </p>
        <h2 className="text-sm font-bold text-zinc-900 dark:text-white">
          2. Open Ownership of Generated Firmware
        </h2>
        <p>
          You retain full ownership and commercial rights to all C++ firmware sketches, JSON
          hardware topologies, and 3D layouts you generate in Atech Studio.
        </p>
        <h2 className="text-sm font-bold text-zinc-900 dark:text-white">
          3. Hardware Safety & Warranty
        </h2>
        <p>
          Atech hardware kits carry a 2-year warranty against manufacturing defects under
          normal 3.3V/5V USB-C operation.
        </p>
      </div>
    </div>
  );
}
