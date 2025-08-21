// Mock data for multi-select functionality
export const mockTrashedNotes = [
  {
    id: 1,
    title: "Meeting Notes",
    content: "Discussed project timeline and deliverables for Q1 2024. Need to follow up on budget approval and resource allocation.",
    type: "note",
    color: "#fef08a",
    createdAt: "2024-01-15T10:30:00Z",
    status: "trashed",
    pinned: false,
    labels: [{ id: 1, name: "Work", color: "#3b82f6" }]
  },
  {
    id: 2,
    title: "Shopping List",
    content: "",
    type: "list",
    color: "#d9f99d",
    createdAt: "2024-01-14T15:20:00Z",
    status: "trashed",
    pinned: false,
    listItems: [
      { id: 1, text: "Milk", checked: false },
      { id: 2, text: "Bread", checked: true },
      { id: 3, text: "Eggs", checked: false },
      { id: 4, text: "Apples", checked: false },
      { id: 5, text: "Cheese", checked: true }
    ],
    labels: [{ id: 2, name: "Personal", color: "#10b981" }]
  },
  {
    id: 3,
    title: "Recipe Ideas",
    content: "Collection of healthy dinner recipes to try this week. Focus on Mediterranean and Asian cuisines.",
    type: "note",
    color: "#fecaca",
    createdAt: "2024-01-13T09:15:00Z",
    status: "trashed",
    pinned: true,
    labels: [{ id: 3, name: "Cooking", color: "#f59e0b" }]
  },
  {
    id: 4,
    title: "Travel Plans",
    content: "Summer vacation planning - destinations, budget, and activities to research.",
    type: "note",
    color: "#bfdbfe",
    createdAt: "2024-01-12T14:45:00Z",
    status: "trashed",
    pinned: false,
    labels: [
      { id: 2, name: "Personal", color: "#10b981" },
      { id: 4, name: "Travel", color: "#8b5cf6" }
    ]
  },
  {
    id: 5,
    title: "Book Recommendations",
    content: "",
    type: "list",
    color: "#e9d5ff",
    createdAt: "2024-01-11T11:30:00Z",
    status: "trashed",
    pinned: false,
    listItems: [
      { id: 1, text: "The Midnight Library", checked: true },
      { id: 2, text: "Atomic Habits", checked: false },
      { id: 3, text: "The Seven Husbands of Evelyn Hugo", checked: false }
    ],
    labels: [{ id: 5, name: "Reading", color: "#ec4899" }]
  },
  {
    id: 6,
    title: "Project Ideas",
    content: "Brainstorming session results for new product features and improvements.",
    type: "note",
    color: "#fed7aa",
    createdAt: "2024-01-10T16:20:00Z",
    status: "trashed",
    pinned: false,
    labels: [
      { id: 1, name: "Work", color: "#3b82f6" },
      { id: 6, name: "Ideas", color: "#06b6d4" }
    ]
  }
];

export const mockSelectedNotes = [1, 3, 5]; // Array of selected note IDs

export const mockSelectionState = {
  isSelectionMode: true,
  selectedNoteIds: [1, 3, 5],
  allNotesSelected: false
};

export const mockBulkActionProps = {
  selectedCount: 0,
  onBulkDelete: (noteIds) => {
    console.log('Bulk delete:', noteIds);
    return Promise.resolve();
  },
  onBulkRestore: (noteIds) => {
    console.log('Bulk restore:', noteIds);
    return Promise.resolve();
  },
  onCancelSelection: () => {
    console.log('Cancel selection');
  },
  onSelectAll: () => {
    console.log('Select all');
  },
  onDeselectAll: () => {
    console.log('Deselect all');
  }
};