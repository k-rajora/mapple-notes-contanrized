import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchNotes, createNote, deleteNote } from '../services/api';
import { LogOut, Plus, Trash2, Save, Leaf, PenLine } from 'lucide-react';
// Import your uploaded favicon image
import mapleWatermark from '../assets/mapple.png'; // Ensure this file is in frontend/src/assets/

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [notes, setNotes] = useState([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedNoteId, setSelectedNoteId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      navigate('/login');
    } else {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      loadNotes(parsedUser.userId);
    }
  }, [navigate]);

  const loadNotes = async (userId) => {
    try {
      const data = await fetchNotes(userId);
      setNotes(data);
    } catch (err) {
      console.error("Failed to load notes", err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/login');
  };

  const handleSave = async () => {
    if (!title || !content) return;
    setLoading(true);
    try {
      await createNote(user.userId, title, content);
      setTitle('');
      setContent('');
      await loadNotes(user.userId);
      setSelectedNoteId(null);
    } catch (err) {
      alert("Failed to save note");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (e, noteId) => {
    e.stopPropagation();
    if(!window.confirm("Delete this note?")) return;
    try {
      await deleteNote(noteId, user.userId);
      await loadNotes(user.userId);
    } catch(err) {
      console.error("Delete failed", err);
    }
  };

  return (
    <div className="flex h-screen bg-stone-50">
      {/* Sidebar (No changes here) */}
      <div className="w-72 bg-orange-50/50 border-r border-orange-100 flex flex-col backdrop-blur-sm z-20">
        <div className="p-6 pb-4">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg flex items-center justify-center shadow-md shadow-orange-500/20">
              <Leaf className="text-white w-5 h-5" />
            </div>
            <h2 className="font-serif font-bold text-xl text-gray-800 tracking-tight">Maple Notes</h2>
          </div>
          <button 
            onClick={() => { setTitle(''); setContent(''); setSelectedNoteId(null); }}
            className="w-full bg-white border border-orange-200 hover:border-orange-300 text-gray-600 hover:text-orange-700 py-2.5 px-4 rounded-xl flex items-center justify-center transition-all shadow-sm hover:shadow-md group"
          >
            <Plus size={18} className="mr-2 text-orange-500 group-hover:rotate-90 transition-transform" /> 
            <span className="font-medium text-sm">New Note</span>
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-4 space-y-2 pb-4">
          <h3 className="text-xs font-bold text-amber-900/40 uppercase tracking-wider px-2 mb-2">Your Notes</h3>
          {notes.length === 0 ? (
            <div className="text-center py-10 opacity-50">
              <Leaf className="w-8 h-8 mx-auto text-orange-300 mb-2" />
              <p className="text-xs text-amber-900">No notes yet</p>
            </div>
          ) : (
            notes.map((note) => (
              <div 
                key={note.NoteId} 
                onClick={() => {
                  setTitle(note.title);
                  setContent(note.content);
                  setSelectedNoteId(note.NoteId);
                }}
                className={`
                  group p-3.5 rounded-xl cursor-pointer transition-all border
                  ${selectedNoteId === note.NoteId 
                    ? 'bg-white border-orange-200 shadow-sm ring-1 ring-orange-100' 
                    : 'bg-transparent border-transparent hover:bg-orange-100/50 hover:border-orange-100'
                  }
                `}
              >
                <div className="flex justify-between items-start">
                  <h3 className={`font-semibold text-sm truncate pr-2 ${selectedNoteId === note.NoteId ? 'text-orange-900' : 'text-stone-700'}`}>
                    {note.title}
                  </h3>
                  <button 
                    onClick={(e) => handleDelete(e, note.NoteId)}
                    className="opacity-0 group-hover:opacity-100 text-stone-400 hover:text-red-500 transition-opacity"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
                <p className="text-xs text-stone-500 truncate mt-1 line-clamp-1 opacity-80">
                  {note.content}
                </p>
              </div>
            ))
          )}
        </div>
        <div className="p-4 border-t border-orange-100 bg-orange-50/80">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-200 to-orange-300 flex items-center justify-center text-amber-900 font-bold text-xs border border-white">
                {user?.username?.charAt(0).toUpperCase()}
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-stone-700">{user?.username}</span>
              </div>
            </div>
            <button onClick={handleLogout} className="text-stone-400 hover:text-red-600 p-2 hover:bg-red-50 rounded-lg transition-colors"><LogOut size={16} /></button>
          </div>
        </div>
      </div>

      {/* Main Editor - White Paper feel with Watermark */}
      <div className="flex-1 flex flex-col bg-white relative z-10 overflow-hidden">
        
        {/* --- WATERMARK IMAGE --- */}
        <img 
          src={mapleWatermark}
          alt="Maple Watermark"
          // Position: Absolute, Centered
          // Size: Large (w-96)
          // Opacity: Very light (opacity-10)
          // Pointer Events: None (so you can click through it to type)
          // Mix Blend Mode: Multiply (helps blend the white background of the image)
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 object-contain opacity-10 pointer-events-none mix-blend-multiply grayscale-0 z-0"
        />
        {/* ----------------------- */}

        {/* Editor Toolbar */}
        <div className="h-16 border-b border-stone-100 flex items-center justify-between px-8 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
          <div className="flex items-center text-stone-400 text-sm">
            <PenLine size={14} className="mr-2" />
            <span>Editor</span>
          </div>
          <button 
            onClick={handleSave}
            disabled={loading}
            className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white px-5 py-2 rounded-full text-sm font-medium flex items-center shadow-lg shadow-orange-500/20 transition-all hover:scale-105 active:scale-95 disabled:opacity-70"
          >
            <Save size={16} className="mr-2" /> 
            {loading ? 'Saving...' : 'Save Note'}
          </button>
        </div>

        {/* Writing Area (z-index ensures it's above the watermark) */}
        <div className="flex-1 overflow-y-auto z-10 relative">
          <div className="max-w-3xl mx-auto w-full py-12 px-8">
            <input
              type="text"
              placeholder="Untitled Maple Note"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full text-4xl font-serif font-bold text-stone-800 placeholder-stone-300 outline-none bg-transparent mb-6"
            />
            <textarea
              placeholder="Start typing your thoughts..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full h-[calc(100vh-300px)] resize-none text-lg text-stone-600 leading-relaxed outline-none bg-transparent font-light placeholder-stone-400"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;