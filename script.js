'use strict';
// S.U.Y.O.G – Smart User Yielding Organized Growth
// React + Tailwind + Framer Motion (UMD) via CDN, JSX transpiled by Babel standalone

const { useState, useMemo, useEffect, useRef } = React;
const { createRoot } = ReactDOM;
const { motion, AnimatePresence, useAnimation, useScroll, useTransform } = window.framerMotion || {};

function useLocalStorageState(key, initialValue) {
  const [value, setValue] = useState(() => {
    try {
      const stored = localStorage.getItem(key);
      return stored ? JSON.parse(stored) : (typeof initialValue === 'function' ? initialValue() : initialValue);
    } catch {
      return typeof initialValue === 'function' ? initialValue() : initialValue;
    }
  });
  useEffect(() => {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch {}
  }, [key, value]);
  return [value, setValue];
}

const DEFAULT_USERS = [
  { id: 'raj', name: 'Raj', color: '#F4C430' },
  { id: 'priya', name: 'Priya', color: '#1CA9C9' },
  { id: 'aarav', name: 'Aarav', color: '#E07A5F' },
  { id: 'meera', name: 'Meera', color: '#00A36C' },
];

const SAMPLE_EXPENSES = [
  {
    id: 'e1', title: 'Chai & Samosa', amount: 200, paidBy: 'raj',
    participants: [
      { userId: 'raj', share: 50 },
      { userId: 'priya', share: 50 },
    ],
    splitType: 'equal', createdAt: Date.now() - 1000 * 60 * 60 * 24 * 2
  },
  {
    id: 'e2', title: 'Auto Fare', amount: 240, paidBy: 'priya',
    participants: [
      { userId: 'raj', share: 120 },
      { userId: 'priya', share: 120 },
    ],
    splitType: 'equal', createdAt: Date.now() - 1000 * 60 * 60 * 5
  },
];

function formatCurrency(amount) {
  try {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);
  } catch { return `₹${amount}`; }
}

function computeNetBalances(users, expenses) {
  const netByUserId = Object.fromEntries(users.map(u => [u.id, 0]));
  for (const expense of expenses) {
    const { amount, paidBy, participants } = expense;
    netByUserId[paidBy] += amount;
    for (const part of participants) {
      netByUserId[part.userId] -= part.share;
    }
  }
  return netByUserId; // positive => others owe them; negative => they owe others
}

function computeKarmaPoints(users, expenses) {
  const karma = Object.fromEntries(users.map(u => [u.id, 0]));
  for (const expense of expenses) {
    const { amount, paidBy, participants } = expense;
    const totalShares = participants.reduce((s, p) => s + p.share, 0) || 1;
    for (const p of participants) {
      const fairShare = (amount * p.share) / totalShares;
      if (p.userId === paidBy) {
        karma[p.userId] += Math.round((amount - fairShare) / 10);
      } else {
        karma[paidBy] += Math.round(fairShare / 20);
        karma[p.userId] -= Math.round(fairShare / 50);
      }
    }
  }
  return karma;
}

function useTheme() {
  const [theme, setTheme] = useLocalStorageState('suyog.theme', 'light');
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') root.setAttribute('data-theme', 'dark');
    else root.removeAttribute('data-theme');
  }, [theme]);
  return [theme, setTheme];
}

function Header({ theme, onToggleTheme }) {
  return (
    <header className="sticky top-0 z-40 backdrop-blur bg-white/70 dark:bg-indigo/20 border-b border-amber-200/40">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-saffron to-peacock shadow-glow" aria-hidden />
          <div className="leading-tight">
            <div className="font-serif text-xl">S.U.Y.O.G</div>
            <div className="text-xs text-gray-600 dark:text-gray-300">Smart User Yielding Organized Growth</div>
          </div>
        </div>
        <button className="warli-hover px-3 py-1.5 rounded-full bg-white/70 dark:bg-indigo/40 border border-amber-200/50 text-sm"
                onClick={onToggleTheme} title="Toggle light/dark">
          {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
        </button>
      </div>
    </header>
  );
}

function NavTabs({ active, onChange }) {
  const tabs = [
    { id: 'landing', label: 'Home' },
    { id: 'add', label: 'Add Expense' },
    { id: 'summary', label: 'Summary' },
    { id: 'history', label: 'History' },
    { id: 'karma', label: 'Karma & Leaderboard' },
  ];
  return (
    <nav className="max-w-6xl mx-auto px-4 mt-4">
      <ul className="flex flex-wrap gap-2">
        {tabs.map(t => (
          <li key={t.id}>
            <button
              className={`px-3 py-1.5 rounded-full border text-sm transition ${active===t.id? 'bg-saffron/20 border-saffron text-amber-900':'bg-white/70 dark:bg-indigo/40 border-amber-200/50'}`}
              onClick={() => onChange(t.id)}
            >{t.label}</button>
          </li>
        ))}
      </ul>
    </nav>
  );
}

function Hero() {
  const controls = useAnimation();
  useEffect(() => {
    controls.start({ rotate: 360 }, { duration: 30, ease: 'linear', repeat: Infinity });
  }, []);
  return (
    <div className="max-w-6xl mx-auto px-4 mt-6">
      <div className="ornate-border p-6 grid md:grid-cols-2 gap-6 items-center">
        <div>
          <h1 className="font-serif text-3xl md:text-4xl mb-2">S.U.Y.O.G – Smart User Yielding Organized Growth</h1>
          <p className="text-gray-700 dark:text-gray-200">Where every expense finds harmony, every friendship thrives 🌺</p>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">“S.U.Y.O.G flows like water, aligning every expense, every user, every balance into organized growth.”</p>
          <div className="mt-4 flex gap-3">
            <a href="#app-start" className="warli-hover inline-block px-4 py-2 rounded-full bg-saffron text-amber-900 font-semibold">Enter Flow of Balance</a>
            <span className="inline-block px-4 py-2 rounded-full border border-amber-200/60 bg-white/70 dark:bg-indigo/40 text-sm">Indian art, motion, and philosophy</span>
          </div>
        </div>
        <div className="flex justify-center">
          <motion.div animate={controls} className="w-40 h-40 md:w-56 md:h-56 mandala relative" aria-hidden>
            <div className="mandala-center">
              <div className="text-center">
                <div className="text-xs text-gray-600">S.U.Y.O.G</div>
                <div className="font-serif text-lg">Harmony</div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

function AddExpense({ users, onAdd }) {
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [paidBy, setPaidBy] = useState(users[0]?.id || '');
  const [splitType, setSplitType] = useState('equal'); // 'equal' | 'percentage' | 'custom'
  const [selected, setSelected] = useState(() => new Set(users.map(u => u.id)));
  const [percentages, setPercentages] = useState(() => Object.fromEntries(users.map(u => [u.id, ''])));
  const [customShares, setCustomShares] = useState(() => Object.fromEntries(users.map(u => [u.id, ''])));
  const [message, setMessage] = useState(null);

  function toggleUser(id) {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id); else next.add(id);
    setSelected(next);
  }

  function computeParticipants() {
    const activeIds = [...selected];
    if (activeIds.length === 0) return [];

    if (splitType === 'equal') {
      const per = Math.round((Number(amount || 0) / activeIds.length) * 100) / 100;
      return activeIds.map(id => ({ userId: id, share: per }));
    }
    if (splitType === 'percentage') {
      const totalPct = activeIds.reduce((s, id) => s + Number(percentages[id] || 0), 0);
      return activeIds.map(id => ({
        userId: id,
        share: Math.round(((Number(amount || 0) * Number(percentages[id] || 0)) / Math.max(totalPct, 1)) * 100) / 100
      }));
    }
    // custom amounts
    return activeIds.map(id => ({ userId: id, share: Number(customShares[id] || 0) }));
  }

  function validate() {
    if (!title.trim()) return 'Please enter a title.';
    const amt = Number(amount);
    if (!amt || amt <= 0) return 'Please enter a valid amount.';
    if (!paidBy) return 'Please select who paid.';
    const parts = computeParticipants();
    if (parts.length === 0) return 'Select at least one participant.';
    const sumShares = Math.round(parts.reduce((s, p) => s + Number(p.share || 0), 0));
    const roundedAmt = Math.round(amt);
    if (splitType !== 'custom' && Math.abs(sumShares - roundedAmt) > 1) {
      return 'Shares do not sum to amount. Check percentages.';
    }
    return null;
  }

  function handleSubmit(e) {
    e.preventDefault();
    const err = validate();
    if (err) { setMessage({ type: 'error', text: err }); return; }
    const parts = computeParticipants();
    const payload = {
      id: `e_${Date.now()}`,
      title: title.trim(),
      amount: Number(amount),
      paidBy,
      participants: parts,
      splitType,
      createdAt: Date.now(),
    };
    onAdd(payload);
    setTitle(''); setAmount(''); setSplitType('equal');
    setMessage({ type: 'success', text: 'Expense added successfully! S.U.Y.O.G balance maintained 🌸' });
  }

  return (
    <section id="app-start" className="max-w-6xl mx-auto px-4 mt-8">
      <div className="ornate-border p-6">
        <h2 className="font-serif text-2xl mb-3">Add Expenses</h2>
        <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <div>
              <label className="block text-sm mb-1">Title</label>
              <input className="w-full px-3 py-2 rounded-lg border border-amber-200/60 bg-white/70 dark:bg-indigo/40" value={title} onChange={e=>setTitle(e.target.value)} placeholder="Chai, Dinner, Taxi..." />
            </div>
            <div>
              <label className="block text-sm mb-1">Amount</label>
              <input type="number" className="w-full px-3 py-2 rounded-lg border border-amber-200/60 bg-white/70 dark:bg-indigo/40" value={amount} onChange={e=>setAmount(e.target.value)} placeholder="₹" />
            </div>
            <div>
              <label className="block text-sm mb-1">Who Paid</label>
              <select className="w-full px-3 py-2 rounded-lg border border-amber-200/60 bg-white/70 dark:bg-indigo/40" value={paidBy} onChange={e=>setPaidBy(e.target.value)}>
                {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm mb-1">Participants</label>
              <div className="flex flex-wrap gap-2">
                {users.map(u => (
                  <button type="button" key={u.id}
                          className={`px-3 py-1.5 rounded-full border text-sm ${selected.has(u.id)?'bg-peacock/20 border-peacock':'bg-white/70 dark:bg-indigo/40 border-amber-200/60'}`}
                          onClick={()=>toggleUser(u.id)}>
                    {u.name}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-sm mb-1">Split Logic</label>
              <div className="flex gap-2">
                {['equal','percentage','custom'].map(t => (
                  <label key={t} className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-amber-200/60 bg-white/70 dark:bg-indigo/40 cursor-pointer">
                    <input type="radio" name="split" value={t} checked={splitType===t} onChange={()=>setSplitType(t)} />
                    <span className="capitalize">{t}</span>
                  </label>
                ))}
              </div>
            </div>

            {splitType === 'percentage' && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {[...selected].map(id => (
                  <div key={id}>
                    <label className="block text-xs text-gray-600">% {users.find(u=>u.id===id)?.name}</label>
                    <input type="number" className="w-full px-2 py-1.5 rounded border border-amber-200/60 bg-white/70 dark:bg-indigo/40" value={percentages[id]||''} onChange={e=>setPercentages(s=>({...s, [id]: e.target.value}))} />
                  </div>
                ))}
              </div>
            )}

            {splitType === 'custom' && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {[...selected].map(id => (
                  <div key={id}>
                    <label className="block text-xs text-gray-600">₹ {users.find(u=>u.id===id)?.name}</label>
                    <input type="number" className="w-full px-2 py-1.5 rounded border border-amber-200/60 bg-white/70 dark:bg-indigo/40" value={customShares[id]||''} onChange={e=>setCustomShares(s=>({...s, [id]: e.target.value}))} />
                  </div>
                ))}
              </div>
            )}

            <button className="warli-hover w-full px-4 py-2 rounded-lg bg-saffron text-amber-900 font-semibold">Add Expense</button>
            {message && (
              <div className={`mt-2 text-sm ${message.type==='success' ? 'text-green-700' : 'text-red-600'}`}>{message.text}</div>
            )}
          </div>
        </form>
      </div>
    </section>
  );
}

function MandalaCard({ expense, users, onPay }) {
  const userMap = useMemo(() => Object.fromEntries(users.map(u => [u.id, u])), [users]);
  const total = expense.participants.reduce((s,p)=>s+p.share,0) || 1;
  let pointer = 0;
  const slices = expense.participants.map((p, idx) => {
    const start = pointer;
    const pct = (p.share / total) * 100;
    pointer += pct;
    const end = pointer;
    const color = userMap[p.userId]?.color || '#ccc';
    return { start, end, color, p };
  });
  const conic = slices.map(s => `${s.color} ${s.start}% ${s.end}%`).join(', ');

  return (
    <motion.div layout className="flex flex-col items-center gap-3 p-4">
      <div className="mandala" style={{ backgroundImage: `conic-gradient(${conic})` }} title="Balance maintained by S.U.Y.O.G 🌺">
        <div className="mandala-center">
          <div className="text-center">
            <div className="text-sm font-semibold">{expense.title}</div>
            <div className="text-xs opacity-75">{formatCurrency(expense.amount)}</div>
          </div>
        </div>
      </div>
      <div className="text-xs text-gray-600 dark:text-gray-300">
        Paid by <span className="font-medium">{userMap[expense.paidBy]?.name}</span>
      </div>
      <button onClick={() => onPay(expense)} className="px-3 py-1.5 rounded-full border border-amber-200/60 bg-white/70 dark:bg-indigo/40 text-sm">UPI Pay Now</button>
    </motion.div>
  );
}

function Summary({ expenses, users, onPay }) {
  return (
    <section className="max-w-6xl mx-auto px-4 mt-8">
      <div className="ornate-border p-6">
        <h2 className="font-serif text-2xl mb-4">Mandala Summary</h2>
        <AnimatePresence mode="popLayout">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {expenses.map(e => (
              <MandalaCard key={e.id} expense={e} users={users} onPay={onPay} />
            ))}
          </div>
        </AnimatePresence>
      </div>
    </section>
  );
}

function History({ expenses, users }) {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({ container: containerRef });
  const x = useTransform(scrollYProgress, [0, 1], ['0%', '-15%']);

  return (
    <section className="max-w-6xl mx-auto px-4 mt-8">
      <div className="ornate-border p-0 overflow-hidden">
        <div className="p-6">
          <h2 className="font-serif text-2xl mb-4">Scroll-Painting Timeline</h2>
        </div>
        <div ref={containerRef} className="scroll-canvas max-h-[420px] overflow-y-auto p-6">
          <motion.div style={{ x }} className="relative">
            <div className="absolute left-3 top-0 bottom-0 w-1 bg-gradient-to-b from-saffron to-peacock" />
            <div className="space-y-8 relative z-10 pl-10">
              {expenses.map((e, idx) => (
                <div key={e.id} className="flex items-start gap-4">
                  <div className="timeline-node mt-1" />
                  <div>
                    <div className="font-semibold">{e.title} <span className="text-xs text-gray-600">{new Date(e.createdAt).toLocaleString()}</span></div>
                    <div className="text-sm text-gray-700 dark:text-gray-200">{formatCurrency(e.amount)} — Paid by {users.find(u=>u.id===e.paidBy)?.name}</div>
                    <div className="mt-1 flex flex-wrap gap-1 text-xs opacity-80">
                      {e.participants.map(p => (
                        <span key={p.userId} className="px-2 py-0.5 rounded-full bg-white/70 dark:bg-indigo/40 border border-amber-200/60">{users.find(u=>u.id===p.userId)?.name}: {formatCurrency(p.share)}</span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function KarmaWheel({ users, expenses }) {
  const karma = computeKarmaPoints(users, expenses);
  const total = Object.values(karma).reduce((s,v)=>s+Math.max(v,0),0) || 1;

  let pointer = 0;
  const slices = users.map(u => {
    const val = Math.max(karma[u.id], 0);
    const start = pointer;
    const pct = (val / total) * 100;
    pointer += pct;
    const end = pointer;
    return { start, end, color: u.color, user: u, val };
  });
  const conic = slices.map(s => `${s.color} ${s.start}% ${s.end}%`).join(', ');

  const leaderboard = [...users]
    .map(u => ({ user: u, score: karma[u.id] }))
    .sort((a,b)=>b.score-a.score);

  return (
    <section className="max-w-6xl mx-auto px-4 mt-8">
      <div className="ornate-border p-6">
        <div className="flex flex-col md:flex-row items-center gap-8">
          <div className="flex-1">
            <h2 className="font-serif text-2xl mb-2">S.U.Y.O.G Leaderboard – Grow Together 🌺</h2>
            <ul className="space-y-2">
              {leaderboard.map(({user, score}, i) => (
                <li key={user.id} className="flex items-center justify-between px-3 py-2 rounded-lg bg-white/70 dark:bg-indigo/40 border border-amber-200/60">
                  <div className="flex items-center gap-3">
                    <span className="w-2.5 h-2.5 rounded-full" style={{background:user.color}} />
                    <span className="font-medium">{i+1}. {user.name}</span>
                  </div>
                  <div className="text-sm">Karma: {score}</div>
                </li>
              ))}
            </ul>
          </div>
          <div className="flex-1 grid place-items-center">
            <div className="relative">
              <div className="mandala" style={{ width: 260, height: 260, backgroundImage: `conic-gradient(${conic})` }}>
                <div className="mandala-center">
                  <div className="text-center">
                    <div className="text-xs opacity-75">Karma Chakra</div>
                    <div className="font-serif text-lg">S.U.Y.O.G</div>
                  </div>
                </div>
              </div>
              <PetalConfetti key={leaderboard[0]?.user?.id + ':' + leaderboard[0]?.score} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function PetalConfetti() {
  // Floating lotus petals and peacock feathers
  const petals = Array.from({ length: 14 }).map((_, i) => ({
    id: i,
    x: Math.random() * 220 - 110,
    delay: Math.random() * 1.2,
    duration: 4 + Math.random() * 3,
    rotate: (Math.random() - 0.5) * 80,
    scale: 0.6 + Math.random() * 0.8,
    color: Math.random() > 0.5 ? '#F4C430' : '#1CA9C9'
  }));
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {petals.map(p => (
        <motion.div key={p.id} initial={{ y: -20, opacity: 0 }} animate={{ y: 260, opacity: [0, 1, 0.4, 0] }} transition={{ delay: p.delay, duration: p.duration, repeat: Infinity }}
          style={{ position: 'absolute', left: '50%', transform: `translateX(${p.x}px) rotate(${p.rotate}deg) scale(${p.scale})` }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2 C9 6, 6 8, 6 12 C6 17, 10 20, 12 22 C14 20, 18 17, 18 12 C18 8, 15 6, 12 2 Z" fill={p.color} opacity="0.85"/>
          </svg>
        </motion.div>
      ))}
    </div>
  );
}

function UPIModal({ open, onClose, expense, users }) {
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    if (!open) { setProgress(0); return; }
    setProgress(0);
    const id = setInterval(() => setProgress(p => Math.min(100, p + 8)), 180);
    return () => clearInterval(id);
  }, [open]);
  if (!open || !expense) return null;
  const payer = users.find(u => u.id === expense.paidBy);
  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm grid place-items-center p-4">
      <div className="w-full max-w-md temple-arch-border">
        <div className="temple-arch" style={{ width: '100%', height: 320 }}>
          <div className="p-5">
            <div className="text-center">
              <div className="font-serif text-xl">S.U.Y.O.G Payment Portal</div>
              <div className="text-xs text-gray-600" title="Pay your share and see organized growth flow ✨">Temple-arch UPI mock</div>
            </div>
            <div className="mt-4 text-sm">
              <div className="flex items-center justify-between">
                <span>Expense</span>
                <span className="font-medium">{expense.title}</span>
              </div>
              <div className="flex items-center justify-between mt-1">
                <span>Paid by</span>
                <span className="font-medium">{payer?.name}</span>
              </div>
              <div className="flex items-center justify-between mt-1">
                <span>Total</span>
                <span className="font-medium">{formatCurrency(expense.amount)}</span>
              </div>
            </div>
            <div className="mt-4">
              <div className="feather-progress" style={{ ['--p'] : progress + '%' }} />
              <div className="mt-1 text-right text-xs">{progress}%</div>
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <button onClick={onClose} className="px-3 py-1.5 rounded-full border border-amber-200/60 bg-white/70">Close</button>
              <button onClick={onClose} className="px-3 py-1.5 rounded-full bg-saffron text-amber-900 font-semibold">Done</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function VoiceInput({ onCommand }) {
  const [listening, setListening] = useState(false);
  const recognitionRef = useRef(null);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;
    const rec = new SpeechRecognition();
    rec.lang = 'en-IN';
    rec.interimResults = false;
    rec.maxAlternatives = 1;
    rec.onresult = (e) => {
      const text = e.results[0][0].transcript;
      onCommand(text);
    };
    rec.onend = () => setListening(false);
    recognitionRef.current = rec;
  }, [onCommand]);

  function toggle() {
    const rec = recognitionRef.current;
    if (!rec) {
      // Fallback mock
      const mock = 'Add ₹200 chai by Raj';
      onCommand(mock);
      return;
    }
    if (listening) { rec.stop(); setListening(false); }
    else { setListening(true); rec.start(); }
  }

  return (
    <button type="button" className={`lotus ${listening ? 'pulsing' : ''}`} onClick={toggle} title="Speak: e.g., Add ₹200 chai by Raj">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 3a3 3 0 0 1 3 3v6a3 3 0 1 1-6 0V6a3 3 0 0 1 3-3Z" fill="#7a5e00"/>
        <path d="M5 11a7 7 0 0 0 14 0" stroke="#7a5e00" strokeWidth="2" strokeLinecap="round"/>
        <path d="M12 19v2" stroke="#7a5e00" strokeWidth="2" strokeLinecap="round"/>
      </svg>
    </button>
  );
}

function ShareSummary({ users, expenses }) {
  async function copy() {
    const net = computeNetBalances(users, expenses);
    const lines = [];
    lines.push('S.U.Y.O.G — Smart User Yielding Organized Growth');
    lines.push('Summary (INR):');
    for (const u of users) { lines.push(`- ${u.name}: ${net[u.id] >= 0 ? '+' : ''}${Math.round(net[u.id])}`); }
    lines.push('Expenses:');
    for (const e of expenses) {
      const parts = e.participants.map(p => `${users.find(u=>u.id===p.userId)?.name} ${Math.round(p.share)}`).join(', ');
      lines.push(`• ${e.title} – ₹${Math.round(e.amount)} (by ${users.find(u=>u.id===e.paidBy)?.name}) [${parts}]`);
    }
    const text = lines.join('\n');
    try { await navigator.clipboard.writeText(text); alert('Share summary copied to clipboard.'); } catch {
      const ta = document.createElement('textarea'); ta.value = text; document.body.appendChild(ta); ta.select(); document.execCommand('copy'); document.body.removeChild(ta); alert('Share summary copied.');
    }
  }
  return (
    <button onClick={copy} className="warli-hover px-4 py-2 rounded-full bg-peacock text-white">Share Summary</button>
  );
}

function App() {
  const [theme, setTheme] = useTheme();
  const [users, setUsers] = useLocalStorageState('suyog.users', DEFAULT_USERS);
  const [expenses, setExpenses] = useLocalStorageState('suyog.expenses', SAMPLE_EXPENSES);
  const [active, setActive] = useState('landing');
  const [upiOpen, setUpiOpen] = useState(false);
  const [upiExpense, setUpiExpense] = useState(null);

  const net = useMemo(() => computeNetBalances(users, expenses), [users, expenses]);

  function handleAddExpense(e) {
    setExpenses(prev => [e, ...prev]);
  }

  function handlePay(expense) {
    setUpiExpense(expense);
    setUpiOpen(true);
  }

  function handleVoice(text) {
    // Parse: "Add ₹200 chai by Raj" or "Add 200 chai by Raj"
    const m = text.match(/add\s*₹?(\d+(?:\.\d+)?)\s+([^]+?)\s+by\s+(\w+)/i);
    if (!m) { alert('Could not parse voice input. Try: "Add ₹200 chai by Raj"'); return; }
    const amount = Number(m[1]);
    const title = m[2].trim().replace(/\s+$/, '');
    const name = m[3].toLowerCase();
    const user = users.find(u => u.name.toLowerCase().startsWith(name));
    if (!user) { alert('Unknown payer in voice input.'); return; }
    const parts = users.map(u => ({ userId: u.id, share: Math.round((amount / users.length) * 100) / 100 }));
    handleAddExpense({ id: `v_${Date.now()}`, title, amount, paidBy: user.id, participants: parts, splitType: 'equal', createdAt: Date.now() });
  }

  return (
    <div className="pb-16">
      <Header theme={theme} onToggleTheme={() => setTheme(t => t === 'dark' ? 'light' : 'dark')} />
      <NavTabs active={active} onChange={setActive} />
      {active === 'landing' && <Hero />}
      {active === 'add' && <AddExpense users={users} onAdd={handleAddExpense} />}
      {active === 'summary' && <Summary expenses={expenses} users={users} onPay={handlePay} />}
      {active === 'history' && <History expenses={expenses} users={users} />}
      {active === 'karma' && <KarmaWheel users={users} expenses={expenses} />}

      <section className="max-w-6xl mx-auto px-4 mt-8">
        <div className="ornate-border p-6 flex flex-wrap items-center justify-between gap-4">
          <div className="text-sm">
            <div className="font-serif">S.U.Y.O.G Footer</div>
            <div className="text-gray-700 dark:text-gray-200">Built by Krishna Pandey – Powered by S.U.Y.O.G Philosophy 🌺</div>
          </div>
          <div className="flex items-center gap-4">
            <ShareSummary users={users} expenses={expenses} />
            <VoiceInput onCommand={handleVoice} />
          </div>
        </div>
      </section>

      <UPIModal open={upiOpen} onClose={()=>{ setUpiOpen(false); setUpiExpense(null); }} expense={upiExpense} users={users} />

      <section className="max-w-6xl mx-auto px-4 mt-8 mb-10">
        <div className="h-1 rounded-full gold-shimmer" />
      </section>
    </div>
  );
}

const root = createRoot(document.getElementById('root'));
root.render(<App />);
