import { useState } from "react";

export default function InfoButton() {
  const [open, setOpen] = useState(false);

  const description = `
    **Medipass EMR** – a secure, privacy‑focused Electronic Medical Record system.
    It empowers patients to selectively share health records via cryptographic Smart Consent QR tokens.
    Key benefits include real‑time access notifications, a one‑click revoke button, and a sleek dark‑mode glassmorphism UI.
  `;

  return (
    <>
      {/* Fixed green button */}
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-4 right-4 bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded shadow-lg transition-colors"
      >
        Info
      </button>

      {/* Modal overlay */}
      {open && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-[#0D1117] text-[#F9FAFB] p-6 max-w-lg w-full rounded-lg shadow-lg overflow-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">About Medipass EMR</h2>
              <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-white">
                ✕
              </button>
            </div>
            <div className="prose prose-invert" dangerouslySetInnerHTML={{ __html: description.replace(/\n/g, "<br/>") }} />
          </div>
        </div>
      )}
    </>
  );
}
