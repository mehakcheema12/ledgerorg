import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { AnimatePresence, motion } from "framer-motion";
import {
  Activity, ArrowLeft, ArrowUpRight, BarChart3, CalendarDays, Check, Edit3,
  Flame, ListTodo, LogOut, Plus, RefreshCcw, Save, Settings, Sparkles,
  Trash2, X, BookOpen, SmilePlus, Award, ChevronRight, Heart, Send, Star, Smile
} from "lucide-react";
import {
  Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis,
  Line, LineChart
} from "recharts";

const api = axios.create({ baseURL: "/api" });
const categories = ["health", "productivity", "learning", "fitness", "mindfulness", "other"];
const colors = ["#FFDA40", "#FF684F", "#BEA9FF", "#7CDEA7", "#78A2FF", "#FF9BC8"];
const moods = ["😞", "😕", "😐", "🙂", "😌"];

function todayKey() { return toDateKey(new Date()); }
function toDateKey(date) {
  const d = new Date(date);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
function dateFromKey(key) { return new Date(`${key}T12:00:00`); }
function daysAgo(days) { const d = new Date(); d.setDate(d.getDate() - days); return toDateKey(d); }
function friendlyDate(key) { return new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric" }).format(dateFromKey(key)); }
function fullDate(key) { return new Intl.DateTimeFormat(undefined, { weekday: "long", month: "long", day: "numeric", year: "numeric" }).format(dateFromKey(key)); }
function emptyHabit() { return { name: "", description: "", category: "health", frequency: "daily", color: colors[0], icon: "flame", goalCount: 1, notes: [] }; }

export default function App() {
  const [token, setToken] = useState(() => localStorage.getItem("ledger_token"));
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem("ledger_user") || "null"));
  const [view, setView] = useState(() => token ? "dashboard" : "landing");
  const [habits, setHabits] = useState([]);
  const [logs, setLogs] = useState([]);
  const [dailyEntries, setDailyEntries] = useState([]);
  const [plannerTasks, setPlannerTasks] = useState([]);
  const [stamps, setStamps] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [monthly, setMonthly] = useState(null);
  const [selectedHabitId, setSelectedHabitId] = useState("");
  const [selectedDate, setSelectedDate] = useState(todayKey());
  const [calendarRange, setCalendarRange] = useState(90);
  const [calendarHabit, setCalendarHabit] = useState("all");
  const [editingHabit, setEditingHabit] = useState(null);
  const [form, setForm] = useState(emptyHabit());
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [burstHabitId, setBurstHabitId] = useState("");

  useEffect(() => {
    if (token) {
      api.defaults.headers.common.Authorization = `Bearer ${token}`;
      refreshAll();
    } else {
      delete api.defaults.headers.common.Authorization;
    }
  }, [token]);

  async function refreshAll() {
    setLoading(true); setMessage("");
    try {
      const [habitRes, logRes, dashboardRes, monthlyRes, personalRes, userRes] = await Promise.all([
        api.get("/habits"),
        api.get("/habits/logs", { params: { startDate: daysAgo(364), endDate: todayKey() } }),
        api.get("/analytics/dashboard"),
        api.get("/analytics/monthly"),
        api.get("/auth/personal"),
        api.get("/auth/me"),
      ]);
      setHabits(habitRes.data);
      setLogs(logRes.data);
      setAnalytics(dashboardRes.data);
      setMonthly(monthlyRes.data);
      setDailyEntries(personalRes.data.dailyEntries || []);
      setPlannerTasks(personalRes.data.plannerTasks || []);
      setStamps(personalRes.data.stamps || []);
      setUser(userRes.data);
      localStorage.setItem("ledger_user", JSON.stringify(userRes.data));
      if (!selectedHabitId && habitRes.data[0]) setSelectedHabitId(habitRes.data[0]._id);
    } catch (error) {
      setMessage(error.response?.data?.message || "Could not load Ledger.");
      if (error.response?.status === 401) logout();
    } finally { setLoading(false); }
  }

  async function authenticate(mode, payload) {
    setLoading(true); setMessage("");
    try {
      const { data } = await api.post(`/auth/${mode}`, payload);
      localStorage.setItem("ledger_token", data.token);
      localStorage.setItem("ledger_user", JSON.stringify(data.user));
      api.defaults.headers.common.Authorization = `Bearer ${data.token}`;
      setToken(data.token); setUser(data.user); setView("dashboard");
    } catch (error) { setMessage(error.response?.data?.message || "Authentication failed."); }
    finally { setLoading(false); }
  }

  function logout() {
    localStorage.removeItem("ledger_token"); localStorage.removeItem("ledger_user");
    delete api.defaults.headers.common.Authorization;
    setToken(null); setUser(null); setHabits([]); setLogs([]); setView("landing");
  }

  function startEdit(habit) {
    setEditingHabit(habit);
    setForm({ name: habit.name, description: habit.description || "", category: habit.category, frequency: habit.frequency, color: habit.color, icon: habit.icon || "flame", goalCount: habit.goalCount || 1, notes: habit.notes || [] });
    setView("habits");
  }
  function startCreate() { setEditingHabit(null); setForm(emptyHabit()); setView("habits"); }

  async function saveHabit(event) {
    event.preventDefault(); setLoading(true); setMessage("");
    try {
      const payload = { ...form };
      if (editingHabit) await api.put(`/habits/${editingHabit._id}`, payload);
      else await api.post("/habits", payload);
      setEditingHabit(null); setForm(emptyHabit()); await refreshAll();
    } catch (error) { setMessage(error.response?.data?.message || "Could not save habit."); }
    finally { setLoading(false); }
  }

  async function deleteHabit(id) {
    if (!window.confirm("Delete this habit and its history?")) return;
    setLoading(true);
    try { await api.delete(`/habits/${id}`); setSelectedHabitId(""); await refreshAll(); }
    catch (error) { setMessage(error.response?.data?.message || "Could not delete habit."); }
    finally { setLoading(false); }
  }

  async function toggleCompletion(habit, date = todayKey()) {
    const completed = logs.some(l => l.habitId === habit._id && toDateKey(new Date(l.date)) === date && l.completed);
    setLoading(true);
    try {
      if (completed) await api.post("/habits/log/uncomplete", { habitId: habit._id, date });
      else {
        await api.post("/habits/log/complete", { habitId: habit._id, date, count: 1 });
        setBurstHabitId(habit._id); window.setTimeout(() => setBurstHabitId(""), 950);
      }
      await refreshAll();
    } catch (error) { setMessage(error.response?.data?.message || "Could not update completion."); }
    finally { setLoading(false); }
  }

  async function saveDayEntry(mood, note, date = todayKey()) {
    try {
      const { data } = await api.put("/auth/day", { date, mood, note });
      setDailyEntries(prev => [...prev.filter(e => e.date !== date), data.entry]);
    } catch (error) { setMessage(error.response?.data?.message || "Could not save your day."); }
  }

  async function addTask(text, priority = "medium", date = todayKey()) {
    if (!text.trim()) return;
    try {
      const { data } = await api.post("/auth/tasks", { date, text, priority });
      setPlannerTasks(prev => [...prev, data]);
    } catch (error) { setMessage(error.response?.data?.message || "Could not add task."); }
  }

  async function toggleTask(task) {
    try {
      const { data } = await api.put(`/auth/tasks/${task._id}`, { completed: !task.completed });
      setPlannerTasks(prev => prev.map(t => t._id === task._id ? data : t));
    } catch (error) { setMessage(error.response?.data?.message || "Could not update task."); }
  }

  async function removeTask(id) {
    try { await api.delete(`/auth/tasks/${id}`); setPlannerTasks(prev => prev.filter(t => t._id !== id)); }
    catch (error) { setMessage(error.response?.data?.message || "Could not delete task."); }
  }

  async function saveHabitNote(habit, text) {
    const notes = [...(habit.notes || []), { date: todayKey(), text: text.trim() }].filter(n => n.text);
    try {
      const { data } = await api.put(`/habits/${habit._id}`, { ...habit, notes });
      setHabits(prev => prev.map(h => h._id === habit._id ? data : h));
    } catch (error) { setMessage(error.response?.data?.message || "Could not save habit note."); }
  }

  async function saveStamps(nextKeys) {
    const existing = new Set(stamps.map(s => s.key));
    const fresh = nextKeys.filter(k => !existing.has(k));
    if (!fresh.length) return;
    const merged = [...stamps, ...fresh.map(key => ({ key, unlockedAt: new Date().toISOString() }))];
    try {
      const { data } = await api.put("/auth/profile", { name: user?.name, bio: user?.bio || "", theme: "light", stamps: merged });
      setStamps(data.user.stamps || merged);
      setUser(data.user); localStorage.setItem("ledger_user", JSON.stringify(data.user));
    } catch { setStamps(merged); }
  }

  const todayLogs = useMemo(() => new Set(logs.filter(l => toDateKey(new Date(l.date)) === todayKey() && l.completed).map(l => String(l.habitId))), [logs]);
  const completedToday = habits.filter(h => todayLogs.has(String(h._id))).length;
  const selectedHabit = habits.find(h => h._id === selectedHabitId) || habits[0];
  const currentStamps = useMemo(() => calculateStamps(habits, logs), [habits, logs]);
  const todayEntry = dailyEntries.find(e => e.date === todayKey()) || { mood: "", note: "" };
  const todayTasks = plannerTasks.filter(t => t.date === todayKey());

  useEffect(() => {
    if (token && currentStamps.length) saveStamps(currentStamps);
  }, [token, currentStamps.join("|")]);

  if (!token) {
    if (view === "landing") return <LandingPage onLogin={() => setView("login")} onSignup={() => setView("signup")} />;
    return <AuthScreen mode={view} loading={loading} message={message} onSubmit={authenticate} onBack={() => setView("landing")} />;
  }

  return (
    <div className="min-h-screen text-ink">
      <DesktopRail view={view} setView={setView} loading={loading} onRefresh={refreshAll} onLogout={logout} user={user} />
      <MobileNav view={view} setView={setView} />
      <main className="px-4 pb-28 pt-5 md:ml-64 md:px-8 md:pb-10 lg:px-12">
        {message && <Status message={message} />}
        <AnimatePresence mode="wait">
          <motion.div key={view} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.18 }}>
            {view === "dashboard" && (
              <Dashboard
                habits={habits} logs={logs} analytics={analytics} user={user} loading={loading}
                burstHabitId={burstHabitId} completedToday={completedToday} todayLogs={todayLogs}
                todayEntry={todayEntry} todayTasks={todayTasks}
                onCreate={startCreate} onEdit={startEdit} onToggle={toggleCompletion}
                onSaveDay={saveDayEntry} onTaskToggle={toggleTask} onTaskDelete={removeTask}
                onGoPlanner={() => setView("planner")}
              />
            )}
            {view === "habits" && (
              <HabitsView habits={habits} logs={logs} editingHabit={editingHabit} form={form} loading={loading}
                onCancel={() => { setEditingHabit(null); setForm(emptyHabit()); }} onChange={setForm}
                onDelete={deleteHabit} onEdit={startEdit} onSave={saveHabit} onDetail={(id) => { setSelectedHabitId(id); setView("habitDetail"); }} />
            )}
            {view === "habitDetail" && selectedHabit && (
              <HabitDetail habit={selectedHabit} logs={logs} onBack={() => setView("habits")} onToggle={toggleCompletion} loading={loading} onSaveNote={saveHabitNote} />
            )}
            {view === "calendar" && (
              <CalendarView habits={habits} logs={logs} dailyEntries={dailyEntries} plannerTasks={plannerTasks}
                range={calendarRange} setRange={setCalendarRange} habitFilter={calendarHabit} setHabitFilter={setCalendarHabit}
                selectedDate={selectedDate} setSelectedDate={setSelectedDate} onToggle={toggleCompletion} />
            )}
            {view === "analytics" && <AnalyticsView habits={habits} logs={logs} analytics={analytics} monthly={monthly} />}
            {view === "planner" && <PlannerView tasks={plannerTasks} onAdd={addTask} onToggle={toggleTask} onDelete={removeTask} />}
            {view === "recap" && <RecapView habits={habits} logs={logs} dailyEntries={dailyEntries} weeklyRate={weeklyRate(habits, logs)} currentStamps={currentStamps} />}
            {view === "settings" && <SettingsView user={user} onSave={async (data) => {
              try { const res = await api.put("/auth/profile", data); setUser(res.data.user); localStorage.setItem("ledger_user", JSON.stringify(res.data.user)); }
              catch (e) { setMessage(e.response?.data?.message || "Could not save settings."); }
            }} onLogout={logout} />}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}

function LandingPage({ onLogin, onSignup }) {
  return (
    <main className="relative min-h-screen overflow-hidden px-5 py-6 sm:px-8 lg:px-12">
      <GraphicMarks interactive />
      <motion.nav className="relative z-10 mx-auto flex max-w-7xl items-center justify-between border-b-[3px] border-border pb-5" initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
        <div className="flex items-center gap-3"><motion.span whileHover={{ rotate: -8, scale: 1.06 }} transition={{ type: "spring", stiffness: 350 }} className="ink-border grid h-11 w-11 place-items-center bg-yellow hard-shadow-sm"><Flame /></motion.span><span className="font-display text-3xl font-black">LEDGER</span></div>
        <div className="flex gap-2"><button className="outline-button px-4" onClick={onLogin}>Login</button><button className="physical-button px-4" onClick={onSignup}>Get started</button></div>
      </motion.nav>
      <motion.section className="relative z-10 mx-auto grid min-h-[calc(100vh-6rem)] max-w-7xl items-center gap-10 py-14 lg:grid-cols-[1.05fr_0.95fr]" initial="hidden" animate="visible" variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.12, delayChildren: 0.12 } } }}>
        <motion.div variants={{ hidden: { opacity: 0, x: -24 }, visible: { opacity: 1, x: 0 } }} transition={{ duration: 0.5 }}>
          <p className="editorial-label mb-5 text-coral">habit journal / personal system</p>
          <h1 className="display-stack text-[5.5rem] sm:text-[8rem] lg:text-[10rem]">SHOW<br />UP</h1>
          <p className="mt-8 max-w-xl text-xl font-semibold leading-relaxed">Ledger turns your habits, plans, moods and tiny daily wins into one honest picture of how consistently you show up.</p>
          <div className="mt-9 flex flex-wrap gap-3"><button className="physical-button px-6" onClick={onSignup}>Start tracking <ArrowUpRight className="h-5 w-5" /></button><button className="outline-button px-6" onClick={onLogin}>I already have a Ledger</button></div>
          </motion.div>
        <motion.div className="relative" variants={{ hidden: { opacity: 0, y: 24, rotate: 2 }, visible: { opacity: 1, y: 0, rotate: 0 } }} transition={{ duration: 0.55 }}>
          <motion.div whileHover={{ y: -10, rotate: 0 }} transition={{ type: "spring", stiffness: 260, damping: 18 }} className="paper-panel rotate-2 bg-yellow p-6"><p className="editorial-label">today</p><div className="mt-3 font-display text-7xl font-black">05 / 06</div><div className="mt-4 h-7 border-[3px] border-border bg-surface"><motion.div className="h-full w-[83%] bg-mint" initial={{ width: 0 }} animate={{ width: "83%" }} transition={{ delay: 0.65, duration: 0.8 }} /></div><p className="mt-5 font-display text-3xl font-black">KEEP THE STREAK ALIVE.</p></motion.div>
          <motion.div whileHover={{ y: 8, rotate: 0 }} transition={{ type: "spring", stiffness: 260, damping: 18 }} className="paper-panel -mt-5 -rotate-2 bg-surface p-6"><p className="editorial-label">what lives here</p><div className="mt-4 grid grid-cols-2 gap-3 text-lg font-black">{[["HABITS", "bg-lavender"], ["MOOD", "bg-coral"], ["PLANNER", "bg-mint"], ["RECAPS", "bg-yellow"]].map(([label, color], index) => <motion.div key={label} whileHover={{ y: -4, rotate: index % 2 ? 2 : -2 }} transition={{ type: "spring", stiffness: 400 }} className={`ink-border ${color} p-3`}>{label}</motion.div>)}</div></motion.div>
          </motion.div>
      </motion.section>
        <p className="absolute inset-x-0 bottom-3 z-10 text-center font-mono text-[0.55rem] font-bold uppercase tracking-[0.16em] text-ink-muted"> just a little thing by mehak ♡</p>
    </main>
  );
}

function AuthScreen({ mode, loading, message, onSubmit, onBack }) {
  const [currentMode, setCurrentMode] = useState(mode);
  const [form, setForm] = useState({ name: "", email: "", password: "", confirmPassword: "" });
  function submit(e) { e.preventDefault(); onSubmit(currentMode === "signup" ? "register" : "login", form); }
  return (
    <main className="relative min-h-screen overflow-hidden px-4 py-6 sm:px-8 lg:px-12">
      <GraphicMarks />
      <div className="relative z-10 mx-auto grid min-h-[calc(100vh-3rem)] max-w-6xl items-center lg:grid-cols-[1fr_0.7fr] gap-10">
        <section><button className="outline-button mb-10 px-4" onClick={onBack}><ArrowLeft className="h-4 w-4" /> Back</button><p className="editorial-label mb-4 text-coral">Ledger / habit journal</p><h1 className="display-stack text-[5.5rem] sm:text-[7rem] lg:text-[8.5rem]">BUILD<br />BETTER<br /><span className="bg-coral px-3 text-surface ink-border hard-shadow-sm">DAYS.</span></h1></section>
        <motion.form onSubmit={submit} className="paper-panel bg-surface p-6 sm:p-8" initial={{ rotate: 1.5, y: 12 }} animate={{ rotate: 0.5, y: 0 }}>
          <div className="mb-6 flex gap-2"><button type="button" className={segmentClass(currentMode === "login")} onClick={() => setCurrentMode("login")}>LOGIN</button><button type="button" className={segmentClass(currentMode === "signup")} onClick={() => setCurrentMode("signup")}>SIGNUP</button></div>
          <h2 className="display-stack mb-6 text-5xl">{currentMode === "login" ? "WELCOME." : "LET’S GO."}</h2>
          {currentMode === "signup" && <Field label="Your name" value={form.name} onChange={name => setForm({...form,name})} />}
          <Field label="Email" type="email" value={form.email} onChange={email => setForm({...form,email})} />
          <Field label="Password" type="password" value={form.password} onChange={password => setForm({...form,password})} />
          {currentMode === "signup" && <Field label="Confirm password" type="password" value={form.confirmPassword} onChange={confirmPassword => setForm({...form,confirmPassword})} />}
          {message && <Status message={message} />}
          <button className="physical-button mt-2 w-full px-5" disabled={loading}>{loading ? "WORKING..." : currentMode === "login" ? "ENTER LEDGER" : "CREATE LEDGER"} <ArrowUpRight className="h-5 w-5" /></button>
        </motion.form>
      </div>
    </main>
  );
}

function DesktopRail({ loading, onLogout, onRefresh, setView, user, view }) {
  const items = [["dashboard","Today"],["habits","Habits"],["calendar","Calendar"],["analytics","Analytics"],["planner","Planner"],["recap","Recap"]];
  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r-[3px] border-border bg-surface/95 px-5 py-6 md:flex md:flex-col">
      <button onClick={() => setView("dashboard")} className="mb-10 flex items-center justify-between border-b-[3px] border-border pb-5 text-left"><span className="font-display text-3xl font-black">LEDGER</span><ArrowUpRight className="h-6 w-6" /></button>
      <nav className="space-y-2">{items.map(([key,label], i) => <RailItem key={key} number={`0${i+1}`} label={label} active={view===key} onClick={() => setView(key)} />)}</nav>
      <div className="mt-auto border-t-[3px] border-border pt-5">
        <button onClick={() => setView("settings")} className={`mb-4 grid w-full grid-cols-[2.5rem_1fr] items-center border-[3px] border-border px-3 py-3 text-left font-black ${view==="settings" ? "bg-yellow hard-shadow-sm" : "bg-surface hover:bg-surface-raised"}`}><Settings className="h-4 w-4" /><span>SETTINGS</span></button>
        <div className="mb-5 grid grid-cols-2 gap-2"><IconButton title="Refresh" onClick={onRefresh} disabled={loading}><RefreshCcw className="h-4 w-4" /></IconButton><IconButton title="Log out" onClick={onLogout}><LogOut className="h-4 w-4" /></IconButton></div>
        <p className="editorial-label text-ink-muted">user</p><p className="truncate font-display text-2xl font-bold">{user?.name || "Ledger"}</p>
      </div>
    </aside>
  );
}

function MobileNav({ setView, view }) {
  const items = [["dashboard",Activity],["habits",Check],["calendar",CalendarDays],["analytics",BarChart3],["planner",ListTodo],["recap",Award]];
  return <nav className="fixed inset-x-2 bottom-2 z-40 grid grid-cols-6 gap-1 bg-surface p-2 ink-border hard-shadow md:hidden">{items.map(([name,Icon],i)=><button key={name} onClick={()=>setView(name)} className={`min-h-12 border-2 border-border ${view===name?"bg-yellow":"bg-surface"}`}><span className="editorial-label block text-[0.48rem]">0{i+1}</span><Icon className="mx-auto h-4 w-4" /></button>)}</nav>;
}

function Dashboard({ habits, logs, analytics, user, loading, burstHabitId, completedToday, todayLogs, todayEntry, todayTasks, onCreate, onEdit, onToggle, onSaveDay, onTaskToggle, onTaskDelete, onGoPlanner }) {
  const total = habits.length; const percent = total ? Math.round(completedToday / total * 100) : 0;
  const hour = new Date().getHours(); const greeting = hour < 12 ? <>GOOD<br />MORNING.</> : hour < 18 ? <>GOOD<br />AFTERNOON.</> : <>GOOD<br />EVENING.</>;
  return <div className="space-y-12">
    <section className="grid min-h-[420px] gap-7 lg:grid-cols-[1.15fr_0.85fr]"><div className="relative flex min-w-0 flex-col justify-between py-4"><div><p className="editorial-label mb-5 text-coral">{friendlyDate(todayKey())} / {user?.name || "Ledger"}</p><h1 className="display-stack text-[clamp(4.4rem,7vw,7rem)]">{greeting}</h1><p className="mt-7 max-w-xl text-xl font-semibold">Let's keep the streak alive. One clean check at a time.</p></div><button onClick={onCreate} className="physical-button mt-8 w-fit px-5"><Plus className="h-5 w-5" /> New habit</button><HandArrow className="absolute bottom-8 right-8 hidden rotate-12 lg:block" /></div><ScoreBlock completed={completedToday} total={total} percent={percent} /></section>
    <section><SectionHeader kicker="today's list" title="HABITS FOR TODAY" />{habits.length ? <div className="border-y-[3px] border-border">{habits.map((habit,i)=><HabitRow key={habit._id} burst={burstHabitId===habit._id} completed={todayLogs.has(String(habit._id))} habit={habit} index={i} loading={loading} onEdit={onEdit} onToggle={onToggle} />)}</div> : <EmptyState onCreate={onCreate} />}</section>
    <section className="grid gap-5 lg:grid-cols-3"><StreakObject label="active habits" value={analytics?.totalHabits || 0} color="bg-lavender" icon={Activity} /><StreakObject label="live streaks" value={analytics?.activeStreaks || 0} color="bg-coral" icon={Flame} /><StreakObject label="avg rate" value={`${analytics?.avgCompletionRate || 0}%`} color="bg-mint" icon={BarChart3} /></section>
    <section className="grid gap-6 lg:grid-cols-2"><DayReflection entry={todayEntry} onSave={onSaveDay} /><PlannerPreview tasks={todayTasks} onToggle={onTaskToggle} onDelete={onTaskDelete} onOpen={onGoPlanner} /></section>
  </div>;
}

function DayReflection({ entry, onSave }) {
  const [mood,setMood]=useState(entry.mood||""); const [note,setNote]=useState(entry.note||"");
  useEffect(()=>{setMood(entry.mood||"");setNote(entry.note||"")},[entry.mood,entry.note]);
  return <motion.section whileHover={{ y: -5, rotate: -0.4 }} transition={{ type: "spring", stiffness: 260, damping: 20 }} className="paper-panel bg-surface p-5 sm:p-6"><div className="mb-4 flex items-center justify-between"><div><p className="editorial-label text-coral">daily reflection</p><h2 className="display-stack mt-2 text-4xl">HOW WAS<br/>TODAY?</h2></div><SmilePlus className="h-8 w-8"/></div><div className="flex flex-wrap gap-2">{moods.map(m=><motion.button whileHover={{ y: -3, rotate: 5, scale: 1.08 }} whileTap={{ scale: .92 }} key={m} type="button" onClick={()=>setMood(m)} className={`grid h-12 w-12 place-items-center border-[3px] border-border text-xl ${mood===m?"bg-yellow hard-shadow-sm":"bg-surface"}`}>{m}</motion.button>)}</div><textarea className="field-box mt-4 min-h-24" value={note} onChange={e=>setNote(e.target.value)} placeholder="Anything worth remembering?" /><button className="physical-button mt-3 px-4" onClick={()=>onSave(mood,note)}><Save className="h-4 w-4"/>Save day</button></motion.section>;
}

function PlannerPreview({tasks,onToggle,onDelete,onOpen}) {
  return <motion.section whileHover={{ y: -5, rotate: 0.4 }} transition={{ type: "spring", stiffness: 260, damping: 20 }} className="paper-panel bg-yellow p-5 sm:p-6"><div className="mb-5 flex items-center justify-between"><div><p className="editorial-label">today / planner</p><h2 className="display-stack mt-2 text-4xl">THE PLAN.</h2></div><button className="outline-button px-3" onClick={onOpen}>OPEN <ChevronRight className="h-4 w-4"/></button></div>{tasks.length ? <div className="space-y-2">{tasks.slice(0,5).map(t=><motion.div whileHover={{ x: 4 }} key={t._id} className="flex items-center gap-3 border-[3px] border-border bg-surface p-3"><input type="checkbox" checked={t.completed} onChange={()=>onToggle(t)} className="h-5 w-5"/><span className={`flex-1 font-bold ${t.completed?"line-through opacity-50":""}`}>{t.text}</span><button onClick={()=>onDelete(t._id)} className="font-black">×</button></motion.div>)}</div> : <p className="font-semibold">No tasks yet. Give today a shape.</p>}</motion.section>;
}

function HabitsView({habits,editingHabit,form,loading,onCancel,onChange,onDelete,onEdit,onSave,onDetail}) {
  return <div className="grid gap-10 xl:grid-cols-[0.8fr_1.2fr]"><section><SectionHeader kicker={editingHabit?"adjust the ritual":"new ritual"} title={editingHabit?"EDIT HABIT":"NEW HABIT"}/><form onSubmit={onSave} className="paper-panel bg-surface p-5 sm:p-7">{editingHabit&&<button type="button" className="outline-button mb-5 px-3" onClick={onCancel}><X className="h-4 w-4"/>Cancel edit</button>}<Field label="What are you building?" value={form.name} onChange={name=>onChange({...form,name})}/><label className="mb-5 block"><span className="editorial-label mb-2 block text-ink-muted">Description</span><textarea className="field-box min-h-28" value={form.description} onChange={e=>onChange({...form,description:e.target.value})}/></label><ChoiceGroup label="Category" options={categories} value={form.category} onChange={category=>onChange({...form,category})}/><ChoiceGroup label="How often?" options={["daily","weekly","monthly"]} value={form.frequency} onChange={frequency=>onChange({...form,frequency})}/><label className="mb-5 block"><span className="editorial-label mb-2 block text-ink-muted">Color</span><div className="flex gap-2">{colors.map(c=><button key={c} type="button" aria-label={c} className={`h-10 w-10 border-[3px] border-border ${form.color===c?"hard-shadow-sm":""}`} style={{backgroundColor:c}} onClick={()=>onChange({...form,color:c})}/>)}</div></label><Field label="Goal count" type="number" min="1" value={form.goalCount} onChange={goalCount=>onChange({...form,goalCount:Number(goalCount)||1})}/><button className="physical-button mt-2 w-full px-5" disabled={loading}><Save className="h-5 w-5"/>Save habit</button></form></section><section><SectionHeader kicker="your archive" title="ALL HABITS"/><div className="space-y-4">{habits.map((habit,i)=><article key={habit._id} onClick={()=>onDetail(habit._id)} className="grid cursor-pointer gap-4 border-b-[3px] border-border pb-4 sm:grid-cols-[3rem_1fr_auto] sm:items-center hover:bg-surface-raised/40"><span className="font-mono text-xl font-bold">{String(i+1).padStart(2,"0")}</span><div><h2 className="font-display text-4xl font-black leading-none">{habit.name}</h2><p className="mt-2 editorial-label text-ink-muted">{habit.frequency} / {habit.category} / {habit.currentStreak} days / {habit.completionRate}%</p></div><div className="flex gap-2" onClick={e=>e.stopPropagation()}><IconButton title="Edit" onClick={()=>onEdit(habit)}><Edit3 className="h-4 w-4"/></IconButton><IconButton title="Delete" onClick={()=>onDelete(habit._id)}><Trash2 className="h-4 w-4"/></IconButton></div></article>)}</div></section></div>;
}

function HabitDetail({habit,logs,onBack,onToggle,loading,onSaveNote}) {
  const habitLogs=logs.filter(l=>String(l.habitId)===String(habit._id)&&l.completed); const recent=habitLogs.slice(-14);
  const [note,setNote]=useState("");
  const graph=recent.map(l=>({date:friendlyDate(toDateKey(new Date(l.date))),count:l.count||1}));
  return <div className="space-y-10"><button className="outline-button px-4" onClick={onBack}><ArrowLeft className="h-4 w-4"/> All habits</button><section className="grid gap-7 lg:grid-cols-[0.9fr_1.1fr]"><div className="paper-panel p-6" style={{backgroundColor:habit.color}}><p className="editorial-label">{habit.category} / {habit.frequency}</p><h1 className="display-stack mt-5 text-[5.5rem]">{habit.name}</h1><div className="mt-8 grid grid-cols-2 gap-3"><PosterMetric label="current streak" value={habit.currentStreak}/><PosterMetric label="best streak" value={habit.longestStreak}/><PosterMetric label="consistency" value={`${habit.completionRate}%`}/><PosterMetric label="total checks" value={habit.totalCompletions}/></div><button className="physical-button mt-5 w-full" onClick={()=>onToggle(habit)} disabled={loading}>{habitLogs.some(l=>toDateKey(new Date(l.date))===todayKey())?"MARK INCOMPLETE":"COMPLETE TODAY"}</button></div><div className="paper-panel bg-surface p-5"><p className="editorial-label mb-3">last 14 checks</p><div className="h-72"><ResponsiveContainer width="100%" height="100%"><BarChart data={graph}><CartesianGrid stroke="rgb(var(--color-border))" vertical={false}/><XAxis dataKey="date" stroke="rgb(var(--color-border))"/><YAxis allowDecimals={false} stroke="rgb(var(--color-border))"/><Tooltip/><Bar dataKey="count" fill="rgb(var(--color-coral))"/></BarChart></ResponsiveContainer></div></div></section><section className="grid gap-7 lg:grid-cols-2"><div><SectionHeader kicker="history" title="COMPLETION MAP"/><div className="grid grid-cols-7 gap-2">{Array.from({length:30},(_,i)=>{const key=daysAgo(29-i);const done=habitLogs.some(l=>toDateKey(new Date(l.date))===key);return <div key={key} title={friendlyDate(key)} className={`aspect-square border-[3px] border-border ${done?"bg-mint":"bg-surface"}`}/>})}</div></div><div><SectionHeader kicker="habit journal" title="NOTES"/><textarea className="field-box min-h-28" value={note} onChange={e=>setNote(e.target.value)} placeholder="Add a note about this habit..."/><button className="physical-button mt-3 px-4" onClick={()=>{if(note.trim()){onSaveNote(habit,note);setNote("")}}}>Save note</button>{(habit.notes||[]).slice().reverse().slice(0,5).map((n,i)=><div key={i} className="mt-3 border-[3px] border-border bg-surface p-3"><span className="editorial-label text-ink-muted">{n.date}</span><p className="mt-1 font-semibold">{n.text}</p></div>)}</div></section></div>;
}

function CalendarView({habits,logs,dailyEntries,plannerTasks,range,setRange,habitFilter,setHabitFilter,selectedDate,setSelectedDate}) {
  const days=Array.from({length:range},(_,i)=>daysAgo(range-1-i));
  const activeHabits=habits.filter(h=>h.isActive!==false);
  const selected=selectedDate;
  const selectedEntry=dailyEntries.find(e=>e.date===selected)||{};
  const selectedTasks=plannerTasks.filter(t=>t.date===selected);
  const dayLogs=logs.filter(l=>toDateKey(new Date(l.date))===selected&&l.completed);
  const countFor=(day)=>{const ids=new Set(logs.filter(l=>toDateKey(new Date(l.date))===day&&l.completed&&(habitFilter==="all"||String(l.habitId)===habitFilter)).map(l=>String(l.habitId)));return ids.size};
  const denominator=habitFilter==="all"?Math.max(1,activeHabits.length):1;
  return <div className="space-y-8"><div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end"><div><p className="editorial-label mb-3 text-coral">visual consistency map / all habits</p><h1 className="display-stack text-[4.8rem] sm:text-[7rem]">{range===365?"YEAR.":`${range} DAYS.`}</h1></div><div className="flex flex-wrap gap-2"><button className={segmentClass(range===30)} onClick={()=>setRange(30)}>30 DAYS</button><button className={segmentClass(range===90)} onClick={()=>setRange(90)}>90 DAYS</button><button className={segmentClass(range===365)} onClick={()=>setRange(365)}>YEAR</button></div></div><div className="flex flex-wrap gap-2"><button className={segmentClass(habitFilter==="all")} onClick={()=>setHabitFilter("all")}>ALL HABITS</button>{habits.map(h=><button key={h._id} className={segmentClass(habitFilter===h._id)} onClick={()=>setHabitFilter(h._id)}>{h.name.toUpperCase()}</button>)}</div><div className="paper-panel bg-surface p-4 sm:p-6"><div className="mb-5 flex items-center justify-between border-b-[3px] border-border pb-4"><span className="editorial-label">{habitFilter==="all"?"all habits":habits.find(h=>h._id===habitFilter)?.name}</span><span className="editorial-label text-ink-muted">{range} day view</span></div><div className="grid grid-cols-10 gap-1.5 sm:grid-cols-15 md:grid-cols-20 lg:grid-cols-30">{days.map(day=>{const count=countFor(day);const ratio=Math.min(1,count/denominator);return <button key={day} title={`${friendlyDate(day)} — ${count}/${denominator}`} onClick={()=>setSelectedDate(day)} className={`aspect-square border-2 border-border ${day===selected?"ring-4 ring-coral":""}`} style={{backgroundColor:heatColor(ratio)}}/>})}</div><div className="mt-5 flex items-center gap-3 editorial-label"><span>LESS</span>{[0,.25,.5,.75,1].map(v=><span key={v} className="h-4 w-4 border-2 border-border" style={{backgroundColor:heatColor(v)}}/>)}<span>MORE</span></div></div><section className="grid gap-7 lg:grid-cols-[0.8fr_1.2fr]"><div className="paper-panel bg-yellow p-6"><p className="editorial-label">{fullDate(selected)}</p><h2 className="display-stack mt-3 text-5xl">{dayLogs.length}/{activeHabits.length}<br/>CHECKED.</h2><div className="mt-5 text-4xl">{selectedEntry.mood || "—"}</div><p className="mt-3 font-semibold">{selectedEntry.note || "No note for this day."}</p></div><div className="paper-panel bg-surface p-6"><p className="editorial-label mb-4">what happened</p><div className="space-y-2">{activeHabits.map(h=>{const done=dayLogs.some(l=>String(l.habitId)===String(h._id));return <div key={h._id} className="flex items-center justify-between border-b-2 border-border py-3"><span className="font-bold">{h.name}</span><span className={`ink-border px-2 py-1 font-mono ${done?"bg-mint":"bg-surface"}`}>{done?"DONE":"MISSED"}</span></div>})}</div>{selectedTasks.length>0&&<p className="mt-5 editorial-label">{selectedTasks.filter(t=>t.completed).length}/{selectedTasks.length} planner tasks done</p>}</div></section></div>;
}

function AnalyticsView({habits,logs,analytics}) {
  const graph=Array.from({length:30},(_,i)=>{const key=daysAgo(29-i);const done=new Set(logs.filter(l=>toDateKey(new Date(l.date))===key&&l.completed).map(l=>String(l.habitId))).size;return {date:friendlyDate(key),rate:habits.length?Math.round(done/habits.length*100):0};});
  const sorted=[...habits].sort((a,b)=>b.completionRate-a.completionRate); const best=sorted.slice(0,3); const weak=sorted.slice(-3).reverse();
  return <div className="space-y-10"><section className="grid gap-7 lg:grid-cols-[0.8fr_1.2fr]"><div className="paper-panel bg-lavender p-6"><p className="editorial-label mb-4">your consistency</p><p className="font-display text-[7rem] font-black leading-none">{analytics?.avgCompletionRate||0}%</p><p className="mt-4 text-lg font-semibold">Real completion history across your active habits.</p></div><div className="paper-panel bg-surface p-5"><div className="mb-5 flex items-center justify-between"><h1 className="font-display text-4xl font-black">30 DAY TREND -&gt;</h1><Sparkles className="h-7 w-7 text-coral"/></div><div className="h-80"><ResponsiveContainer width="100%" height="100%"><LineChart data={graph}><CartesianGrid stroke="rgb(var(--color-border))" vertical={false}/><XAxis dataKey="date" stroke="rgb(var(--color-border))" fontSize={11}/><YAxis domain={[0,100]} unit="%" stroke="rgb(var(--color-border))"/><Tooltip/><Line type="monotone" dataKey="rate" stroke="rgb(var(--color-coral))" strokeWidth={4} dot={false}/></LineChart></ResponsiveContainer></div></div></section><section className="grid gap-7 lg:grid-cols-2"><InsightPanel title="WHAT'S WORKING ->" habits={best} color="bg-mint"/><InsightPanel title="WHERE YOU'RE SLIPPING ->" habits={weak} color="bg-coral"/></section><section className="grid gap-4 sm:grid-cols-3"><StreakObject label="total checks" value={habits.reduce((s,h)=>s+(h.totalCompletions||0),0)} color="bg-yellow" icon={Check}/><StreakObject label="best streak" value={Math.max(0,...habits.map(h=>h.longestStreak||0))} color="bg-coral" icon={Flame}/><StreakObject label="active habits" value={habits.length} color="bg-mint" icon={Activity}/></section><section className="paper-panel bg-surface p-6"><SectionHeader kicker="behavioral signal" title="YOUR PATTERNS"/><p className="text-lg font-semibold">{generateInsight(habits,logs)}</p></section></div>;
}

function PlannerView({tasks,onAdd,onToggle,onDelete}) {
  const [text,setText]=useState(""); const [priority,setPriority]=useState("medium"); const [date,setDate]=useState(todayKey());
  const grouped=tasks.filter(t=>t.date===date); const done=grouped.filter(t=>t.completed).length;
  return <div className="space-y-8"><SectionHeader kicker="make the day tangible" title="PLANNER"/><div className="grid gap-7 lg:grid-cols-[0.75fr_1.25fr]"><div className="paper-panel bg-yellow p-6"><p className="editorial-label">date</p><Field label="Plan for" type="date" value={date} onChange={setDate}/><p className="font-display text-6xl font-black">{done}/{grouped.length}</p><p className="editorial-label mt-2">tasks done</p></div><div className="paper-panel bg-surface p-6"><p className="editorial-label mb-4">add a task</p><div className="flex gap-2"><input className="field-box" value={text} onChange={e=>setText(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"){onAdd(text,priority,date);setText("")}}} placeholder="What needs to happen?"/><button className="physical-button px-4" onClick={()=>{onAdd(text,priority,date);setText("")}}><Plus/></button></div><div className="mt-3 flex gap-2">{["low","medium","high"].map(p=><button key={p} className={segmentClass(priority===p)} onClick={()=>setPriority(p)}>{p.toUpperCase()}</button>)}</div><div className="mt-6 space-y-2">{grouped.length?grouped.map(t=><div key={t._id} className="flex items-center gap-3 border-[3px] border-border bg-surface p-3"><input type="checkbox" checked={t.completed} onChange={()=>onToggle(t)}/><span className={`flex-1 font-bold ${t.completed?"line-through opacity-50":""}`}>{t.text}</span><span className="editorial-label">{t.priority}</span><button onClick={()=>onDelete(t._id)}><Trash2 className="h-4 w-4"/></button></div>):<p className="font-semibold text-ink-muted">Nothing planned yet.</p>}</div></div></div></div>;
}

function RecapView({habits,logs,dailyEntries,weeklyRate,currentStamps}) {
  const week=Array.from({length:7},(_,i)=>daysAgo(6-i)); const total=habits.length*7; const completions=week.reduce((s,d)=>s+new Set(logs.filter(l=>toDateKey(new Date(l.date))===d&&l.completed).map(l=>String(l.habitId))).size,0); const best=[...habits].sort((a,b)=>b.completionRate-a.completionRate)[0]; const moods=week.map(d=>dailyEntries.find(e=>e.date===d)?.mood).filter(Boolean);
  return <div className="space-y-10"><section className="grid gap-7 lg:grid-cols-[1fr_0.8fr]"><div><p className="editorial-label mb-4 text-coral">weekly report / last 7 days</p><h1 className="display-stack text-[5.5rem] sm:text-[8rem]">YOUR<br/>WEEK.</h1><p className="mt-6 max-w-xl text-xl font-semibold">A small report on how you showed up — habits, mood and momentum.</p></div><div className="paper-panel bg-yellow p-6"><p className="editorial-label">consistency</p><p className="font-display text-[7rem] font-black leading-none">{weeklyRate}%</p><p className="mt-4 font-semibold">{completions} checks across the week.</p></div></section><section className="grid gap-4 sm:grid-cols-4"><StreakObject label="best habit" value={best?.name||"—"} color="bg-mint" icon={Flame}/><StreakObject label="checks" value={completions} color="bg-lavender" icon={Check}/><StreakObject label="mood logs" value={moods.length} color="bg-coral" icon={SmilePlus}/><StreakObject label="stamps" value={currentStamps.length} color="bg-yellow" icon={Award}/></section><section className="grid gap-7 lg:grid-cols-2"><div className="paper-panel bg-surface p-6"><SectionHeader kicker="the signal" title="ONE THING WE NOTICED"/><p className="text-xl font-bold">{generateInsight(habits,logs)}</p></div><div className="paper-panel bg-surface p-6"><SectionHeader kicker="earned" title="YOUR STAMPS"/><div className="grid grid-cols-2 gap-3">{currentStamps.length?currentStamps.map(k=><Stamp key={k} stampKey={k}/>):<p className="font-semibold text-ink-muted">Keep showing up. Your first stamp is close.</p>}</div></div></section></div>;
}

function SettingsView({user,onSave,onLogout}) {
  const [name,setName]=useState(user?.name||""); const [bio,setBio]=useState(user?.bio||"");
  return <div className="max-w-3xl space-y-8"><SectionHeader kicker="your account" title="SETTINGS"/><section className="paper-panel bg-surface p-6"><Field label="Name" value={name} onChange={setName}/><label className="mb-5 block"><span className="editorial-label mb-2 block text-ink-muted">Bio</span><textarea className="field-box min-h-24" value={bio} onChange={e=>setBio(e.target.value)}/></label><button className="physical-button px-5" onClick={()=>onSave({name,bio})}><Save className="h-5 w-5"/>Save settings</button></section><section className="border-t-[3px] border-border pt-6"><p className="editorial-label mb-3 text-coral">account</p><button className="outline-button px-4" onClick={onLogout}><LogOut className="h-4 w-4"/>Sign out</button></section></div>;
}

function Stamp({stampKey}) {
  const labels={first_habit:"FIRST HABIT",seven_day:"7 DAY STREAK",thirty_day:"30 DAY STREAK",hundred_checks:"100 CHECKS",perfect_week:"PERFECT WEEK",perfect_month:"PERFECT MONTH"};
  return <div className="stamp-card rotate-[-1deg] border-[3px] border-border bg-yellow p-4 text-center hard-shadow-sm"><Award className="mx-auto mb-2 h-8 w-8"/><p className="font-mono text-sm font-black">{labels[stampKey]||stampKey.replaceAll("_"," ").toUpperCase()}</p></div>;
}

function calculateStamps(habits,logs) {
  const keys=[]; if(habits.length) keys.push("first_habit");
  if(Math.max(0,...habits.map(h=>h.longestStreak||0))>=7) keys.push("seven_day");
  if(Math.max(0,...habits.map(h=>h.longestStreak||0))>=30) keys.push("thirty_day");
  if(logs.filter(l=>l.completed).length>=100) keys.push("hundred_checks");
  const all=habits.filter(h=>h.isActive!==false); const seven=Array.from({length:7},(_,i)=>daysAgo(i)).every(d=>{const ids=new Set(logs.filter(l=>toDateKey(new Date(l.date))===d&&l.completed).map(l=>String(l.habitId)));return all.length>0&&ids.size>=all.length}); if(seven) keys.push("perfect_week");
  const month=Array.from({length:30},(_,i)=>daysAgo(i)).every(d=>{const ids=new Set(logs.filter(l=>toDateKey(new Date(l.date))===d&&l.completed).map(l=>String(l.habitId)));return all.length>0&&ids.size>=all.length}); if(month) keys.push("perfect_month");
  return keys;
}
function weeklyRate(habits,logs){if(!habits.length)return 0;const checks=Array.from({length:7},(_,i)=>daysAgo(i)).reduce((s,d)=>s+new Set(logs.filter(l=>toDateKey(new Date(l.date))===d&&l.completed).map(l=>String(l.habitId))).size,0);return Math.round(checks/(habits.length*7)*100);}
function generateInsight(habits,logs){if(!habits.length)return "Add your first habit and Ledger will start finding patterns.";const sorted=[...habits].sort((a,b)=>b.completionRate-a.completionRate);if(sorted[0]?.completionRate>=80)return `${sorted[0].name} is your strongest habit at ${sorted[0].completionRate}% consistency. Keep that one steady.`;const bestDay=Array.from({length:7},(_,i)=>{const key=daysAgo(i);return {key,count:new Set(logs.filter(l=>toDateKey(new Date(l.date))===key&&l.completed).map(l=>String(l.habitId))).size};}).sort((a,b)=>b.count-a.count)[0];return `You completed the most habits on ${new Intl.DateTimeFormat(undefined,{weekday:"long"}).format(dateFromKey(bestDay.key))}. That's a pattern worth noticing.`;}

function ScoreBlock({completed,total,percent}){return <motion.div whileHover={{ y: -7, rotate: -0.6, scale: 1.01 }} transition={{ type: "spring", stiffness: 240, damping: 18 }} className="paper-panel relative bg-yellow p-6 sm:p-8"><div className="absolute -left-4 top-8 -rotate-6 bg-coral px-3 py-2 text-surface editorial-label ink-border">today's score</div><div className="flex h-full flex-col justify-between gap-8 pt-10"><div><p className="editorial-label">completed</p><div className="mt-2 flex items-end gap-3"><span className="font-display text-[6rem] font-black leading-none sm:text-[8rem]">{String(completed).padStart(2,"0")}</span><span className="mb-5 font-display text-5xl font-black">/ {String(total).padStart(2,"0")}</span></div></div><div><div className="mb-3 flex items-center justify-between editorial-label"><span>progress</span><span>{percent}%</span></div><div className="h-10 border-[3px] border-border bg-surface"><motion.div className="h-full bg-mint border-r-[3px] border-border" animate={{width:`${percent}%`}}/></div></div></div></motion.div>;}
function HabitRow({burst,completed,habit,index,loading,onEdit,onToggle}){return <motion.article layout whileHover={{ x: completed ? 10 : 4, y: -2 }} animate={{x:completed?8:0,backgroundColor:completed?"rgb(124 222 167 / .24)":"rgb(255 252 245 / 0)"}} transition={{ type: "spring", stiffness: 260, damping: 20 }} className="relative grid gap-3 border-b-[3px] border-border px-2 py-5 last:border-b-0 sm:grid-cols-[4rem_1fr_auto_auto] sm:items-center sm:px-4"><span className="font-mono text-2xl font-bold">{String(index+1).padStart(2,"0")}</span><div><h3 className="font-display text-3xl font-black leading-none">{habit.name}</h3><p className="mt-2 editorial-label text-ink-muted">{habit.category} / {habit.frequency}</p></div><div className="w-fit border-[3px] border-border bg-surface-raised px-3 py-2 text-center"><p className="editorial-label">streak</p><p className="font-display text-3xl font-black text-coral">{String(habit.currentStreak).padStart(2,"0")}</p></div><div className="flex gap-2"><IconButton title="Edit habit" onClick={()=>onEdit(habit)}><Edit3 className="h-4 w-4"/></IconButton><motion.button whileHover={{ y: -2 }} whileTap={{scale:.92}} disabled={loading} onClick={()=>onToggle(habit)} className={`grid h-12 w-12 place-items-center border-[3px] border-border ${completed?"bg-mint":"bg-surface"}`}>{completed?<Check className="h-6 w-6 stroke-[4]"/>:<Flame className="h-5 w-5"/>}</motion.button></div><AnimatePresence>{burst&&<motion.div initial={{opacity:0,y:12,rotate:-8}} animate={{opacity:1,y:-12,rotate:4}} exit={{opacity:0,y:-22}} className="absolute right-20 top-1 bg-coral px-3 py-1 text-surface editorial-label ink-border">+1 day</motion.div>}</AnimatePresence></motion.article>;}
function StreakObject({color,icon:Icon,label,value}){return <motion.div whileHover={{ y: -6, rotate: 1.2, scale: 1.02 }} transition={{ type: "spring", stiffness: 260, damping: 18 }} className={`ink-border hard-shadow-sm ${color} p-5`}><div className="mb-6 flex items-center justify-between"><p className="editorial-label">{label}</p><Icon className="h-6 w-6"/></div><p className="font-display text-5xl font-black leading-none break-words">{value}</p></motion.div>;}
function InsightPanel({color,habits,title}){return <div className="border-t-[3px] border-border pt-5"><h2 className="mb-5 font-display text-4xl font-black">{title}</h2>{habits.length?<div className="space-y-3">{habits.map(h=><div key={h._id} className="grid grid-cols-[1fr_auto] items-center gap-3 border-[3px] border-border bg-surface p-3"><span className="font-bold">{h.name}</span><span className={`${color} border-[3px] border-border px-2 py-1 font-mono font-bold`}>{h.completionRate}%</span></div>)}</div>:<p className="text-lg font-semibold text-ink-muted">Not enough data yet.</p>}</div>;}
function SectionHeader({kicker,title}){return <div className="mb-5 flex flex-col gap-2 border-b-[3px] border-border pb-4 sm:flex-row sm:items-end sm:justify-between"><h2 className="font-display text-4xl font-black leading-none sm:text-5xl">{title}</h2><p className="editorial-label text-coral">{kicker}</p></div>;}
function ChoiceGroup({label,onChange,options,value}){return <div className="mb-5"><span className="editorial-label mb-2 block text-ink-muted">{label}</span><div className="flex flex-wrap gap-2">{options.map(o=><button key={o} type="button" onClick={()=>onChange(o)} className={segmentClass(value===o)}>{o}</button>)}</div></div>;}
function Field({label,onChange,type="text",value,...props}){return <label className="mb-5 block"><span className="editorial-label mb-2 block text-ink-muted">{label}</span><input className="field-box" type={type} value={value} onChange={e=>onChange(e.target.value)} {...props}/></label>;}
function IconButton({children,disabled,onClick,title}){return <button aria-label={title} disabled={disabled} title={title} type="button" onClick={onClick} className="grid h-11 w-11 place-items-center border-[3px] border-border bg-surface transition hover:-translate-x-0.5 hover:-translate-y-0.5 disabled:opacity-50">{children}</button>;}
function RailItem({active,label,number,onClick}){return <button onClick={onClick} className={`grid w-full grid-cols-[2.5rem_1fr] items-center border-[3px] border-border px-3 py-3 text-left font-black ${active?"bg-yellow hard-shadow-sm":"bg-surface hover:bg-surface-raised"}`}><span className="font-mono text-sm">{number}</span><span>{label.toUpperCase()}</span></button>;}
function EmptyState({onCreate}){return <div className="paper-panel grid min-h-72 place-items-center bg-surface p-8 text-center"><div><Sparkles className="mx-auto mb-4 h-10 w-10 text-coral"/><h2 className="display-stack text-5xl">NO<br/>HABITS.</h2><button onClick={onCreate} className="physical-button mt-6 px-5"><Plus className="h-5 w-5"/>Make one</button></div></div>;}
function Status({message}){return <div className="mb-5 border-[3px] border-border bg-coral px-4 py-3 font-bold text-surface hard-shadow-sm">{message}</div>;}
function PosterMetric({label,value}){return <div className="ink-border bg-surface px-4 py-3 hard-shadow-sm"><div className="font-display text-4xl font-black leading-none">{value}</div><div className="editorial-label text-ink-muted">{label}</div></div>;}
function GraphicMarks({ interactive = false }){
  const doodleClass = interactive ? "pointer-events-auto" : "";
  return <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
    <motion.div whileHover={interactive ? { rotate: 22, scale: 1.12, y: -5 } : undefined} transition={{ type: "spring", stiffness: 220 }} className={`${doodleClass} absolute right-[8%] top-[11%] h-20 w-20 rotate-12 border-[3px] border-border bg-lavender`} />
    <motion.div whileHover={interactive ? { y: -10, scale: 1.08 } : undefined} transition={{ type: "spring", stiffness: 220 }} className={`${doodleClass} absolute bottom-[10%] left-[6%] h-16 w-16 rounded-full border-[3px] border-border bg-mint`} />
    <motion.div whileHover={interactive ? { rotate: 0, scaleX: 1.08 } : undefined} transition={{ type: "spring", stiffness: 220 }} className={`${doodleClass} absolute right-[38%] top-[22%] h-4 w-32 -rotate-6 bg-yellow ink-border`} />
    {interactive && <>
      <motion.div whileHover={{ scale: 1.2, rotate: -8 }} className="pointer-events-auto absolute left-[40%] top-[53%] rotate-12 text-coral sm:left-[39%] sm:top-[49%]"><Heart className="h-6 w-6 fill-coral sm:h-9 sm:w-9" /></motion.div>
      <motion.div whileHover={{ rotate: -12, scale: 1.16 }} className="pointer-events-auto absolute right-3 top-[18%] rotate-12 sm:right-[3%] sm:top-[23%]"><Heart className="h-7 w-7 sm:h-10 sm:w-10" /></motion.div>
      <motion.div whileHover={{ rotate: 10, scale: 1.14 }} className="pointer-events-auto absolute right-[18%] bottom-[12%] text-coral sm:right-[28%] sm:bottom-[8%]"><Star className="h-6 w-6 fill-yellow sm:h-8 sm:w-8" /></motion.div>
      <motion.div whileHover={{ scale: 1.12, rotate: 8 }} className="pointer-events-auto absolute left-[8%] bottom-[15%] text-coral sm:left-[15%] sm:bottom-[10%]"><Smile className="h-7 w-7 sm:h-9 sm:w-9" /></motion.div>
      <motion.div whileHover={{ x: 8, y: -5, rotate: -8 }} className="pointer-events-auto absolute right-4 bottom-[4%] rotate-6 sm:right-[5%]"><Send className="h-8 w-8 sm:h-10 sm:w-10" /><span className="absolute -left-16 top-6 h-6 w-16 -rotate-12 border-b-2 border-dashed border-border sm:-left-24 sm:top-7 sm:h-8 sm:w-24" /></motion.div>
    </>}
  </div>;
}
function HandArrow({className=""}){return <svg className={className} width="120" height="80" viewBox="0 0 120 80" fill="none"><path d="M7 38C35 12 72 14 101 38" stroke="currentColor" strokeWidth="4" strokeLinecap="round"/><path d="M89 20L104 40L78 43" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/></svg>;}
function heatColor(ratio){if(!ratio)return "rgb(var(--color-surface))";const a=Math.min(.2+ratio*.8,1);return `rgb(var(--color-mint) / ${a})`;}
function segmentClass(active){return `border-[3px] border-border px-3 py-2 font-black transition ${active?"bg-yellow hard-shadow-sm":"bg-surface hover:bg-surface-raised"}`;}
