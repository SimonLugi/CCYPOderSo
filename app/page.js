'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

// Pre-configured Credentials
const SUPABASE_URL = 'https://mfrmgtjprzziithqyxob.supabase.co';
const SUPABASE_KEY = 'sb_publishable_1eDXt6RT6XK2mzwuFssRgg_EqEYUM_M'; // Using your provided key
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

export default function page() {
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ title: '', link: '', description: '', tag: 'Info' });

  // Sync data and listen for live changes
  useEffect(() => {
    fetchCards();

    const channel = supabase
        .channel('board-updates')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'cards' }, () => {
          fetchCards();
        })
        .subscribe();

    return () => supabase.removeChannel(channel);
  }, []);

  async function fetchCards() {
    const { data } = await supabase
        .from('cards')
        .select('*')
        .order('id', { ascending: false });
    setCards(data || []);
    setLoading(false);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!formData.title) return;

    const { error } = await supabase.from('cards').insert([formData]);
    if (!error) {
      setFormData({ title: '', link: '', description: '', tag: 'Info' });
      setShowForm(false);
    }
  }

  async function deleteCard(id) {
    await supabase.from('cards').delete().eq('id', id);
  }

  return (
      <div className="bg-slate-950 text-slate-200 min-h-screen p-8 font-sans">
        <header className="mb-10 text-center">
          <h1 className="text-4xl font-bold tracking-tight text-white">Jungs Board</h1>
          <p className="text-slate-400 mt-2">Team Overview & Project Status</p>

          <button
              onClick={() => setShowForm(!showForm)}
              className="mt-6 px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium transition-all shadow-lg active:scale-95"
          >
            {showForm ? 'Close' : '+ New Card'}
          </button>
        </header>

        <main className="max-w-6xl mx-auto">
          {/* Form to add new cards */}
          {showForm && (
              <form onSubmit={handleSubmit} className="mb-12 bg-slate-900 border border-slate-800 p-6 rounded-xl max-w-lg mx-auto grid grid-cols-2 gap-4 shadow-2xl">
                <input
                    className="bg-slate-800 border border-slate-700 p-2 rounded col-span-1 outline-none focus:border-blue-500 text-white"
                    placeholder="Title"
                    value={formData.title}
                    onChange={e => setFormData({...formData, title: e.target.value})}
                    required
                />
                <select
                    className="bg-slate-800 border border-slate-700 p-2 rounded col-span-1 outline-none text-white font-medium"
                    value={formData.tag}
                    onChange={e => setFormData({...formData, tag: e.target.value})}
                >
                  <option value="Info">Info (Blue)</option>
                  <option value="Online">Online (Green)</option>
                  <option value="Pending">Pending (Amber)</option>
                </select>
                <input
                    className="bg-slate-800 border border-slate-700 p-2 rounded col-span-2 outline-none focus:border-blue-500 text-white"
                    placeholder="URL (https://...)"
                    value={formData.link}
                    onChange={e => setFormData({...formData, link: e.target.value})}
                />
                <textarea
                    className="bg-slate-800 border border-slate-700 p-2 rounded col-span-2 outline-none focus:border-blue-500 text-white h-24"
                    placeholder="Description"
                    value={formData.description}
                    onChange={e => setFormData({...formData, description: e.target.value})}
                />
                <button type="submit" className="col-span-2 bg-emerald-600 hover:bg-emerald-500 py-2 rounded font-bold transition-colors text-white">
                  Add Card
                </button>
              </form>
          )}

          {/* The Grid of Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {cards.map((card) => (
                <div key={card.id} className={`bg-slate-900 border border-slate-800 rounded-xl p-6 transition-all shadow-xl hover:scale-[1.02] flex flex-col justify-between ${
                    card.tag === 'Online' ? 'hover:border-emerald-500' :
                        card.tag === 'Pending' ? 'hover:border-amber-500' : 'hover:border-blue-500'
                }`}>
                  <div>
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-lg font-semibold text-white">{card.title}</h3>
                      <span className={`text-xs px-2 py-1 rounded font-medium ${
                          card.tag === 'Online' ? 'bg-emerald-500/10 text-emerald-400' :
                              card.tag === 'Pending' ? 'bg-amber-500/10 text-amber-400' : 'bg-blue-500/10 text-blue-400'
                      }`}>
                    {card.tag}
                  </span>
                    </div>
                    <p className="text-slate-400 text-sm mb-6 leading-relaxed">
                      {card.description || 'No description provided.'}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    {card.link && (
                        <a
                            href={card.link}
                            target="_blank"
                            rel="noreferrer"
                            className="flex-1 text-center py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-sm font-medium transition-colors border border-slate-700"
                        >
                          Open Link
                        </a>
                    )}
                    <button
                        onClick={() => deleteCard(card.id)}
                        className="px-3 py-2 bg-slate-800 hover:bg-red-900/40 text-slate-500 hover:text-red-500 rounded-lg text-sm transition-colors border border-slate-700"
                    >
                      ✕
                    </button>
                  </div>
                </div>
            ))}
          </div>

          {loading && <div className="text-center text-slate-500 animate-pulse mt-10 italic">Checking the board...</div>}
          {!loading && cards.length === 0 && (
              <div className="text-center text-slate-600 mt-20 border-2 border-dashed border-slate-800 rounded-xl p-10">
                No cards yet. Click "+ New Card" to get started.
              </div>
          )}
        </main>
      </div>
  );
}