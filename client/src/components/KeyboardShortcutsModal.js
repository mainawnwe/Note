import React from 'react';

export default function KeyboardShortcutsModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  const shortcutGroups = [
    {
      title: "Navigation",
      shortcuts: [
        { keys: ["j", "k"], description: "Navigate to next/previous note" },
        { keys: ["Shift + j", "Shift + k"], description: "Move note to next/previous position" },
        { keys: ["Ctrl + o", "Ctrl + p"], description: "Navigate to next/previous list item" },
        { keys: ["Ctrl + Shift + o", "Ctrl + Shift + p"], description: "Move list item to next/previous position" }
      ]
    },
    {
      title: "Application",
      shortcuts: [
        { keys: ["c"], description: "Compose a new note" },
        { keys: ["l"], description: "Compose a new list" },
        { keys: ["/"], description: "Search notes" },
        { keys: ["Ctrl + a"], description: "Select all notes" },
        { keys: ["?", "Ctrl + /"], description: "Open keyboard shortcut help" },
        { keys: ["@"], description: "Send feedback" }
      ]
    },
    {
      title: "Actions",
      shortcuts: [
        { keys: ["e"], description: "Archive note" },
        { keys: ["#"], description: "Trash note" },
        { keys: ["f"], description: "Pin or unpin notes" },
        { keys: ["x"], description: "Select note" },
        { keys: ["Ctrl + g"], description: "Toggle between list and grid view" }
      ]
    },
    {
      title: "Editor",
      shortcuts: [
        { keys: ["Esc", "Ctrl + Enter"], description: "Finish editing" },
        { keys: ["Ctrl + Shift + 8"], description: "Toggle checkboxes" },
        { keys: ["Ctrl + ]", "Ctrl + ["], description: "Indent/dedent list item" },
        { keys: ["Ctrl + b"], description: "Bold" },
        { keys: ["Ctrl + i"], description: "Italic" },
        { keys: ["Ctrl + u"], description: "Underline" },
        { keys: ["Ctrl + Alt + 0"], description: "Normal text" },
        { keys: ["Ctrl + Alt + 1"], description: "Heading 1" },
        { keys: ["Ctrl + Alt + 2"], description: "Heading 2" },
        { keys: ["Ctrl + \\"], description: "Clear formatting" }
      ]
    }
  ];

  return (
    <div
      className="absolute top-full right-0 mt-2 w-72 rounded-xl shadow-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 z-50 overflow-auto max-h-96 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="keyboard-shortcuts-title"
    >
      <div className="flex justify-between items-center mb-4">
        <h2
          id="keyboard-shortcuts-title"
          className="text-lg font-semibold text-gray-900 dark:text-white"
        >
          Keyboard Shortcuts
        </h2>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
          aria-label="Close keyboard shortcuts"
        >
          &#x2715;
        </button>
      </div>

      <div className="space-y-4 text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
        {shortcutGroups.map((group) => (
          <section key={group.title} className="space-y-2">
            <h3 className="font-semibold text-md text-gray-900 dark:text-gray-100">
              {group.title}
            </h3>
            <ul className="space-y-3">
              {group.shortcuts.map((shortcut, index) => (
                <li key={`${group.title}-${index}`} className="flex items-start">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap gap-1 mb-1">
                      {shortcut.keys.map((key, i) => (
                        <React.Fragment key={key}>
                          <kbd className="px-2 py-1 text-xs font-mono bg-gray-100 dark:bg-gray-700 rounded-md">
                            {key}
                          </kbd>
                          {i < shortcut.keys.length - 1 && (
                            <span className="self-center text-gray-500 dark:text-gray-400 text-xs">or</span>
                          )}
                        </React.Fragment>
                      ))}
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      {shortcut.description}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}