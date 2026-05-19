import { useState, useEffect } from 'react';
import { Plus, Search, Trash2, Edit2, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface Note {
  id: string;
  title: string;
  content: string;
  timestamp: number;
  color: string;
}

const NOTE_COLORS = [
  'bg-white',
  'bg-red-50',
  'bg-orange-50',
  'bg-yellow-50',
  'bg-green-50',
  'bg-blue-50',
  'bg-purple-50',
  'bg-pink-50',
];

export default function App() {
  const [notes, setNotes] = useState<Note[]>(() => {
    const saved = localStorage.getItem('kotlin-notes');
    return saved ? JSON.parse(saved) : [
      { id: '1', title: '✨ Welcome!', content: 'This is your enhanced Note App. Tap a note to edit or use the colors below to organize!', timestamp: Date.now(), color: 'bg-indigo-50' },
      { id: '2', title: 'Shopping List', content: '• Milk\n• Eggs\n• Avocados\n• Coffee beans', timestamp: Date.now() - 1000 * 60 * 5, color: 'bg-green-50' },
      { id: '3', title: 'Ideas', content: 'Build a native Android app using Jetpack Compose and Kotlin.', timestamp: Date.now() - 1000 * 60 * 60, color: 'bg-blue-50' }
    ];
  });

  const [search, setSearch] = useState('');
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    localStorage.setItem('kotlin-notes', JSON.stringify(notes));
  }, [notes]);

  const filteredNotes = notes.filter(n => 
    n.title.toLowerCase().includes(search.toLowerCase()) || 
    n.content.toLowerCase().includes(search.toLowerCase())
  ).sort((a, b) => b.timestamp - a.timestamp);

  const addNote = (title: string, content: string, color: string) => {
    const newNote: Note = {
      id: Math.random().toString(36).substr(2, 9),
      title,
      content,
      timestamp: Date.now(),
      color: color || 'bg-white'
    };
    setNotes([newNote, ...notes]);
  };

  const updateNote = (id: string, title: string, content: string, color: string) => {
    setNotes(notes.map(n => n.id === id ? { ...n, title, content, color, timestamp: Date.now() } : n));
  };

  const deleteNote = (id: string) => {
    setNotes(notes.filter(n => n.id !== id));
  };

  return (
    <div className="relative h-screen bg-[#F8F9FA] flex flex-col font-sans text-slate-900 overflow-hidden">
      {/* App Bar */}
      <header className="px-6 pt-10 pb-4 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-semibold tracking-tight text-slate-800">Notes</h1>
          <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold">
            A
          </div>
        </div>
        
        <div className="relative group">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors">
            <Search className="w-5 h-5" />
          </div>
          <input 
            type="text" 
            placeholder="Search your notes"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-3.5 bg-white rounded-2xl shadow-sm border-none focus:ring-2 focus:ring-indigo-500/20 text-base placeholder:text-slate-400 transition-all outline-none"
          />
        </div>
      </header>

      {/* Note Grid */}
      <main className="flex-1 overflow-y-auto px-4 pb-32 pt-2">
        {filteredNotes.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center opacity-30 px-12 text-center">
            <div className="w-20 h-20 bg-slate-200 rounded-full flex items-center justify-center mb-4">
              <Edit2 className="w-8 h-8" />
            </div>
            <p className="text-lg font-medium">No notes found</p>
            <p className="text-sm">Try searching for something else or add a new note</p>
          </div>
        ) : (
          <div className="columns-2 gap-3 space-y-3">
            <AnimatePresence mode="popLayout">
              {filteredNotes.map(note => (
                <motion.div
                  key={note.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  onClick={() => setEditingNote(note)}
                  className={cn(
                    "break-inside-avoid p-4 rounded-2xl shadow-sm border border-slate-100 cursor-pointer hover:shadow-md transition-all group relative",
                    note.color || 'bg-white'
                  )}
                >
                  {note.title && (
                    <h3 className="font-bold text-base mb-1 line-clamp-2 text-slate-800 leading-tight">
                      {note.title}
                    </h3>
                  )}
                  <p className="text-slate-600 text-sm line-clamp-6 leading-relaxed whitespace-pre-wrap">
                    {note.content}
                  </p>
                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                      {new Date(note.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </main>

      {/* FAB */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsAdding(true)}
        className="fixed bottom-8 right-8 w-16 h-16 bg-white text-indigo-600 rounded-[24px] shadow-xl shadow-indigo-100 flex items-center justify-center z-20 border border-slate-100"
      >
        <Plus className="w-8 h-8" strokeWidth={2.5} />
      </motion.button>

      {/* Editor Modal */}
      <AnimatePresence>
        {(isAdding || editingNote) && (
          <NoteEditor 
            note={editingNote} 
            onClose={() => {
              setIsAdding(false);
              setEditingNote(null);
            }}
            onDelete={editingNote ? () => {
              deleteNote(editingNote.id);
              setEditingNote(null);
            } : undefined}
            onSave={(t, c, clr) => {
              if (editingNote) {
                updateNote(editingNote.id, t, c, clr);
              } else {
                addNote(t, c, clr);
              }
              setIsAdding(false);
              setEditingNote(null);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function NoteEditor({ 
  note, 
  onClose, 
  onSave, 
  onDelete 
}: { 
  note?: Note | null, 
  onClose: () => void, 
  onSave: (t: string, c: string, clr: string) => void,
  onDelete?: () => void
}) {
  const [title, setTitle] = useState(note?.title || '');
  const [content, setContent] = useState(note?.content || '');
  const [color, setColor] = useState(note?.color || 'bg-white');

  return (
    <motion.div 
      initial={{ opacity: 0, y: 100 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 100 }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      className={cn("fixed inset-0 z-30 flex flex-col", color)}
    >
      <header className="px-4 py-3 flex items-center justify-between">
        <button onClick={onClose} className="p-2 rounded-full hover:bg-black/5">
          <ArrowLeft className="w-6 h-6 text-slate-700" />
        </button>
        <div className="flex items-center gap-2">
          {onDelete && (
            <button onClick={onDelete} className="p-2 rounded-full hover:bg-red-50 text-red-500">
              <Trash2 className="w-5 h-5" />
            </button>
          )}
          <button 
            onClick={() => onSave(title, content, color)}
            className="px-6 py-2 bg-slate-900 text-white rounded-full text-sm font-bold shadow-lg active:scale-95 transition-transform"
          >
            Save
          </button>
        </div>
      </header>

      <div className="flex-1 flex flex-col p-6 pt-2">
        <input 
          autoFocus
          type="text" 
          placeholder="Title"
          value={title}
          onChange={e => setTitle(e.target.value)}
          className="text-2xl font-bold bg-transparent focus:outline-none mb-4 placeholder:text-slate-400"
        />
        <textarea 
          placeholder="Note"
          value={content}
          onChange={e => setContent(e.target.value)}
          className="flex-1 text-lg bg-transparent focus:outline-none resize-none placeholder:text-slate-400 leading-relaxed overflow-y-auto"
        />
      </div>

      {/* Color Picker */}
      <div className="p-6 pb-10 border-t border-black/5 bg-black/5 backdrop-blur-sm">
        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-3">Background Color</p>
        <div className="flex items-center gap-3 overflow-x-auto no-scrollbar">
          {NOTE_COLORS.map(c => (
            <button
              key={c}
              onClick={() => setColor(c)}
              className={cn(
                "w-10 h-10 rounded-full border-2 transition-all flex-shrink-0",
                c,
                color === c ? "border-indigo-500 scale-110 shadow-lg" : "border-transparent"
              )}
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
}
