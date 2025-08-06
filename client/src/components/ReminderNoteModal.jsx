import React from 'react';
import Modal from 'react-modal';

Modal.setAppElement('#root'); // Adjust if your app root is different

export default function ReminderNoteModal({ isOpen, onRequestClose }) {
  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      contentLabel="Reminder Note Modal"
      className="max-w-3xl mx-auto my-10 bg-white rounded-lg shadow-lg outline-none p-6 max-h-[80vh] overflow-y-auto"
      overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
    >
      {/* Header */}
      <header className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Table a note...</h2>
        <button
          onClick={onRequestClose}
          aria-label="Close modal"
          className="text-2xl font-bold leading-none hover:text-gray-700"
        >
          &times;
        </button>
      </header>

      {/* Body Content */}
      <section className="mb-6">
        <h3 className="font-semibold mb-2">Reinder note with data/time inside</h3>
        <p className="mb-2">Table a note...</p>
        <table className="w-full border border-gray-300 rounded mb-4 text-left">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-gray-300 px-3 py-1"></th>
              <th className="border border-gray-300 px-3 py-1">Reminder</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border border-gray-300 px-3 py-1">Untitled Note</td>
              <td className="border border-gray-300 px-3 py-1">Untitled Note</td>
            </tr>
            <tr>
              <td className="border border-gray-300 px-3 py-1">2022.12.25, 11:22:18</td>
              <td className="border border-gray-300 px-3 py-1">7/20/2025, 11:14:11 AM</td>
            </tr>
          </tbody>
        </table>
        <div className="text-center">
          <button
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
            type="button"
          >
            Set reminder
          </button>
        </div>
      </section>

      <section className="mb-6">
        <h3 className="font-semibold mb-1">Remind me later</h3>
        <p className="mb-2">Untitled Note</p>
        <ul className="list-disc list-inside space-y-1">
          <li>Untitled Note reminder</li>
          <li>Plano piano testing date</li>
          <li>Guitar List Tesing grrrrretrqfgfgsgf date</li>
        </ul>
      </section>

      <section className="mb-6">
        <p>Jul 18, 2025, 01:42 PM</p>
        <p>Jul 18, 2025, 01:40 PM</p>
        <p>Jul 18, 2025, 01:37 PM</p>
        <hr className="my-4" />
        <p>7/20/2025, 11:13:50 AM</p>
        <p>7/20/2025, 11:14:11 AM</p>
      </section>

      <footer className="text-sm text-gray-500 italic">
        *This is also nothinas Imara*
      </footer>
    </Modal>
  );
}
