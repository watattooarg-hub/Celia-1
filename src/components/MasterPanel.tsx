import React, { useState, useEffect } from 'react';
import { Appointment } from '../types';
import {
  getStoredAppointments,
  deleteAppointmentPermanently,
  updateAppointmentStatus,
  formatFriendlyDate,
  purgeExpiredAppointments,
  getStoredMasterUsers,
  saveMasterUsers,
  authenticateMasterUser,
  getStoredWeeklySchedule,
  saveWeeklySchedule,
  MasterUser
} from '../utils/appointmentStorage';
import { SALON_INFO, DaySchedule } from '../data/services';
import { StudioLogo } from './StudioLogo';
import {
  Lock,
  Unlock,
  KeyRound,
  Search,
  Calendar,
  Clock,
  User,
  Phone,
  MessageCircle,
  Trash2,
  CheckCircle,
  XCircle,
  RefreshCw,
  LogOut,
  ArrowLeft,
  ShieldCheck,
  Eye,
  EyeOff,
  UserPlus,
  Edit2,
  Save,
  Copy,
  Check,
  Download,
  AlertCircle
} from 'lucide-react';

interface MasterPanelProps {
  onNavigateHome: () => void;
}

const MASTER_SESSION_KEY = 'celia_atelier_master_authenticated_v2';
const MASTER_ACTIVE_USER_KEY = 'celia_atelier_master_active_username';

export const MasterPanel: React.FC<MasterPanelProps> = ({ onNavigateHome }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return sessionStorage.getItem(MASTER_SESSION_KEY) === 'true';
  });
  
  // Login form state
  const [userInput, setUserInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [loginError, setLoginError] = useState('');

  // Tab navigation
  const [activeTab, setActiveTab] = useState<'turnos' | 'claves' | 'horarios'>('turnos');

  // Dashboard appointments states
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'cancelled' | 'rescheduled'>('all');
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  // Weekly schedule states (Google Maps sync)
  const [weeklySchedule, setWeeklySchedule] = useState<DaySchedule[]>([]);

  // Credentials management states
  const [masterUsers, setMasterUsers] = useState<MasterUser[]>([]);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [editUsername, setEditUsername] = useState('');
  const [editPassword, setEditPassword] = useState('');
  const [editNotes, setEditNotes] = useState('');
  const [visiblePasswordIds, setVisiblePasswordIds] = useState<{ [id: string]: boolean }>({});
  const [copiedKeyId, setCopiedKeyId] = useState<string | null>(null);

  // New user form states
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newNotes, setNewNotes] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [newUserError, setNewUserError] = useState('');

  const loadData = () => {
    const list = getStoredAppointments();
    setAppointments(list);
    const users = getStoredMasterUsers();
    setMasterUsers(users);
    const schedule = getStoredWeeklySchedule();
    setWeeklySchedule(schedule);
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadData();
    }
  }, [isAuthenticated]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const isValid = authenticateMasterUser(userInput, passwordInput);

    if (isValid) {
      setIsAuthenticated(true);
      sessionStorage.setItem(MASTER_SESSION_KEY, 'true');
      sessionStorage.setItem(MASTER_ACTIVE_USER_KEY, userInput.trim());
      setLoginError('');
      loadData();
    } else {
      setLoginError('Usuario o clave incorrectos. Verificá los datos e intentá nuevamente.');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem(MASTER_SESSION_KEY);
    sessionStorage.removeItem(MASTER_ACTIVE_USER_KEY);
    setUserInput('');
    setPasswordInput('');
  };

  const handleDelete = (id: string) => {
    if (window.confirm(`¿Estás segura de eliminar permanentemente el turno ${id}?`)) {
      deleteAppointmentPermanently(id);
      loadData();
      showNotice(`Turno ${id} eliminado permanentemente.`);
    }
  };

  const handleCancelStatus = (id: string) => {
    updateAppointmentStatus(id, 'cancelled');
    loadData();
    showNotice(`Turno ${id} marcado como cancelado.`);
  };

  const handleRestoreStatus = (id: string) => {
    updateAppointmentStatus(id, 'active');
    loadData();
    showNotice(`Turno ${id} restablecido a estado activo.`);
  };

  const showNotice = (text: string) => {
    setActionNotice(text);
    setTimeout(() => setActionNotice(null), 3500);
  };

  const handleManualPurge = () => {
    const raw = getStoredAppointments();
    const { cleaned, purgedCount } = purgeExpiredAppointments(raw);
    localStorage.setItem('studio_celia_figueredo_appointments_v1', JSON.stringify(cleaned));
    setAppointments(cleaned);
    showNotice(
      purgedCount > 0
        ? `Se eliminaron ${purgedCount} turnos con más de 2 días de antigüedad.`
        : 'Todos los turnos están actualizados (ninguno supera los 2 días de antigüedad).'
    );
  };

  // Credential actions
  const togglePasswordVisibility = (id: string) => {
    setVisiblePasswordIds(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const handleCopyPassword = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKeyId(id);
    setTimeout(() => setCopiedKeyId(null), 2000);
  };

  const startEditUser = (user: MasterUser) => {
    setEditingUserId(user.id);
    setEditUsername(user.username);
    setEditPassword(user.password);
    setEditNotes(user.notes || '');
  };

  const cancelEditUser = () => {
    setEditingUserId(null);
    setEditUsername('');
    setEditPassword('');
    setEditNotes('');
  };

  const saveEditedUser = (id: string) => {
    if (!editUsername.trim() || !editPassword.trim()) {
      alert('El usuario y la clave no pueden estar vacíos.');
      return;
    }

    const updated = masterUsers.map(u => {
      if (u.id === id) {
        return {
          ...u,
          username: editUsername.trim(),
          password: editPassword.trim(),
          notes: editNotes.trim()
        };
      }
      return u;
    });

    saveMasterUsers(updated);
    setMasterUsers(updated);
    cancelEditUser();
    showNotice('Usuario y clave modificados exitosamente.');
  };

  const handleDeleteUser = (id: string, username: string) => {
    if (masterUsers.length <= 1) {
      alert('Debe existir al menos un usuario activo en el sistema.');
      return;
    }
    if (window.confirm(`¿Estás segura de eliminar el acceso del usuario "${username}"?`)) {
      const updated = masterUsers.filter(u => u.id !== id);
      saveMasterUsers(updated);
      setMasterUsers(updated);
      showNotice(`Usuario "${username}" eliminado.`);
    }
  };

  const handleCreateNewUser = (e: React.FormEvent) => {
    e.preventDefault();
    setNewUserError('');

    const cleanU = newUsername.trim().toLowerCase();
    const cleanP = newPassword.trim();

    if (!cleanU || !cleanP) {
      setNewUserError('Completá usuario y clave.');
      return;
    }

    if (masterUsers.some(u => u.username.toLowerCase() === cleanU)) {
      setNewUserError('Ese nombre de usuario ya existe.');
      return;
    }

    const newUser: MasterUser = {
      id: `user-${Date.now()}`,
      username: cleanU,
      password: cleanP,
      notes: newNotes.trim() || 'Operador',
      createdAt: new Date().toISOString()
    };

    const updated = [...masterUsers, newUser];
    saveMasterUsers(updated);
    setMasterUsers(updated);
    setNewUsername('');
    setNewPassword('');
    setNewNotes('');
    showNotice(`Nuevo usuario "${cleanU}" agregado exitosamente.`);
  };

  // Schedule management actions (Google Maps sync)
  const handleUpdateDaySchedule = (dayKey: string, hoursText: string, isClosed: boolean) => {
    const updated = weeklySchedule.map(d => {
      if (d.dayKey === dayKey) {
        return {
          ...d,
          hoursText: isClosed ? 'Cerrado' : hoursText.trim(),
          isClosed
        };
      }
      return d;
    });

    saveWeeklySchedule(updated);
    setWeeklySchedule(updated);
    showNotice(`Horario de ${dayKey.toUpperCase()} actualizado.`);
  };

  // Export CSV
  const handleExportCSV = () => {
    if (appointments.length === 0) {
      alert('No hay turnos para exportar.');
      return;
    }
    const headers = ['ID', 'Cliente', 'Telefono', 'Servicio', 'Fecha', 'Horario', 'Estado', 'Notas'];
    const rows = appointments.map(a => [
      `"${a.id}"`,
      `"${a.clientName}"`,
      `"${a.phone}"`,
      `"${a.serviceName}"`,
      `"${a.date}"`,
      `"${a.time}"`,
      `"${a.status}"`,
      `"${(a.notes || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `turnos_celia_figueredo_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filtered appointments
  const filteredAppointments = appointments.filter(appt => {
    const query = searchQuery.trim().toLowerCase();
    const matchesQuery = !query || (
      appt.clientName.toLowerCase().includes(query) ||
      appt.phone.includes(query) ||
      appt.serviceName.toLowerCase().includes(query) ||
      appt.id.toLowerCase().includes(query)
    );

    const matchesDate = !dateFilter || appt.date === dateFilter;
    const matchesStatus = statusFilter === 'all' || appt.status === statusFilter;

    return matchesQuery && matchesDate && matchesStatus;
  });

  const todayStr = new Date().toISOString().split('T')[0];
  const totalActive = appointments.filter(a => a.status === 'active').length;
  const todayCount = appointments.filter(a => a.date === todayStr && a.status === 'active').length;

  // Primary active user credentials for quick display
  const primaryUser = masterUsers[0] || { username: 'celia', password: '245047' };

  // ================= LOGIN SCREEN =================
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center px-4 py-12">
        <div className="w-full max-w-md bg-[#0a0a0a] border border-[#2a2415] hover:border-[#D4AF37]/50 transition-all rounded-sm p-8 shadow-2xl">
          <div className="flex flex-col items-center text-center mb-8">
            <StudioLogo size={130} showText={false} />
            <span className="text-[10px] tracking-[0.3em] uppercase text-[#D4AF37] font-semibold mt-4 block">
              Portal Master Exclusivo
            </span>
            <h1 className="text-2xl font-serif-luxury text-stone-100 tracking-wide mt-1">
              Administración de Turnos
            </h1>
            <p className="text-xs text-stone-400 mt-2 font-light">
              Ingresá tu usuario y clave master para acceder al panel de control.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            {/* Usuario */}
            <div>
              <label className="block text-xs uppercase tracking-wider text-[#D4AF37] font-semibold mb-1.5">
                Usuario Master
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#777]">
                  <User className="w-4 h-4 text-[#D4AF37]" />
                </div>
                <input
                  type="text"
                  required
                  autoFocus
                  value={userInput}
                  onChange={(e) => {
                    setUserInput(e.target.value);
                    if (loginError) setLoginError('');
                  }}
                  placeholder="Usuario (ej: celia)"
                  className="w-full bg-[#111] border border-[#333] focus:border-[#D4AF37] pl-10 pr-4 py-3 text-sm text-stone-100 rounded focus:outline-none transition-colors"
                />
              </div>
            </div>

            {/* Clave */}
            <div>
              <label className="block text-xs uppercase tracking-wider text-[#D4AF37] font-semibold mb-1.5">
                Clave Master
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#777]">
                  <KeyRound className="w-4 h-4 text-[#D4AF37]" />
                </div>
                <input
                  type={showLoginPassword ? 'text' : 'password'}
                  required
                  value={passwordInput}
                  onChange={(e) => {
                    setPasswordInput(e.target.value);
                    if (loginError) setLoginError('');
                  }}
                  placeholder="Clave de acceso (ej: 245047)"
                  className="w-full bg-[#111] border border-[#333] focus:border-[#D4AF37] pl-10 pr-11 py-3 text-sm text-stone-100 rounded focus:outline-none transition-colors font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowLoginPassword(!showLoginPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-stone-500 hover:text-stone-300 cursor-pointer"
                  title={showLoginPassword ? 'Ocultar clave' : 'Mostrar clave'}
                >
                  {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {loginError && (
                <p className="text-xs text-[#ff5555] mt-2 font-medium">{loginError}</p>
              )}
            </div>

            <button
              type="submit"
              className="w-full mt-2 py-3.5 bg-[#D6001C] hover:bg-[#b00017] text-white text-xs uppercase tracking-[0.2em] font-semibold rounded transition-all duration-300 shadow-[0_0_20px_rgba(214,0,28,0.4)] cursor-pointer flex items-center justify-center gap-2"
            >
              <Unlock className="w-4 h-4" />
              <span>Ingresar al Panel Master</span>
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-[#1c1c1c] text-center">
            <button
              onClick={onNavigateHome}
              className="text-xs text-stone-500 hover:text-stone-300 flex items-center justify-center gap-1.5 mx-auto transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Volver a la página de reservas</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ================= MASTER DASHBOARD =================
  return (
    <div className="min-h-screen bg-[#050505] text-stone-100">
      {/* Top Admin Header */}
      <header className="border-b border-[#222] bg-[#080808]/95 backdrop-blur sticky top-0 z-30 px-4 md:px-8 py-3.5">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <img
              src={SALON_INFO.logoUrl}
              alt="Logo Celia Figueredo"
              className="w-10 h-10 object-contain drop-shadow-[0_2px_8px_rgba(212,175,55,0.3)]"
            />
            <div>
              <div className="flex items-center gap-2">
                <span className="font-serif-luxury text-lg tracking-wider text-[#D4AF37]">
                  STUDIO CELIA FIGUEREDO
                </span>
                <span className="px-2 py-0.5 text-[9px] bg-[#D6001C]/20 border border-[#D6001C] text-[#ff8080] uppercase tracking-widest font-bold rounded">
                  PANEL MASTER
                </span>
              </div>
              <p className="text-[10px] text-stone-400">
                Gestión Privada de Turnos y Claves • celiafigueredo.com.ar/master
              </p>
            </div>
          </div>

          {/* Navigation Tabs in Header */}
          <div className="flex items-center gap-2 bg-[#121212] p-1 border border-[#262626] rounded">
            <button
              onClick={() => setActiveTab('turnos')}
              className={`py-1.5 px-3.5 text-xs uppercase tracking-wider rounded font-medium transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'turnos'
                  ? 'bg-[#D6001C] text-white shadow'
                  : 'text-stone-400 hover:text-white'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Turnos ({appointments.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('claves')}
              className={`py-1.5 px-3.5 text-xs uppercase tracking-wider rounded font-medium transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'claves'
                  ? 'bg-[#D4AF37] text-black font-semibold shadow'
                  : 'text-stone-400 hover:text-[#D4AF37]'
              }`}
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>Claves ({masterUsers.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('horarios')}
              className={`py-1.5 px-3.5 text-xs uppercase tracking-wider rounded font-medium transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'horarios'
                  ? 'bg-stone-200 text-black font-semibold shadow'
                  : 'text-stone-400 hover:text-white'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Horarios Google Maps</span>
            </button>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={onNavigateHome}
              className="py-2 px-3 bg-[#141414] hover:bg-[#222] text-stone-300 hover:text-white border border-[#333] text-xs uppercase tracking-wider rounded transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Web Turnos</span>
            </button>

            <button
              onClick={handleLogout}
              className="py-2 px-3 bg-transparent hover:bg-red-950/40 text-stone-400 hover:text-red-300 border border-[#333] hover:border-red-600/50 text-xs uppercase tracking-wider rounded transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Salir</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 md:px-8 py-8">
        {/* Notice alert */}
        {actionNotice && (
          <div className="mb-6 p-3.5 rounded bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2 animate-fade-in shadow-lg">
            <CheckCircle className="w-4 h-4 flex-shrink-0" />
            <span>{actionNotice}</span>
          </div>
        )}

        {/* ================= TAB 1: TURNOS REGISTRADOS ================= */}
        {activeTab === 'turnos' && (
          <div>
            {/* Quick Credentials Info Banner */}
            <div className="mb-6 p-4 rounded-sm bg-[#120f06] border border-[#D4AF37]/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-[0_0_20px_rgba(212,175,55,0.08)]">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-[#1b160a] border border-[#D4AF37]/60 rounded-full text-[#D4AF37]">
                  <KeyRound className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] uppercase tracking-widest text-[#D4AF37] font-semibold block">
                    Clave para entrar al sistema:
                  </span>
                  <div className="text-sm text-stone-200 mt-0.5 flex flex-wrap items-center gap-3">
                    <span>
                      Usuario: <strong className="text-white font-mono">{primaryUser.username}</strong>
                    </span>
                    <span className="text-stone-500">•</span>
                    <span>
                      Clave: <strong className="text-[#f1d592] font-mono">{primaryUser.password}</strong>
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setActiveTab('claves')}
                className="self-start sm:self-auto py-2 px-3 bg-[#1e1b10] hover:bg-[#D4AF37] hover:text-black text-[#D4AF37] border border-[#D4AF37]/50 rounded text-xs uppercase tracking-wider font-semibold transition-all cursor-pointer flex items-center gap-1.5"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>Modificar clave o agregar más</span>
              </button>
            </div>

            {/* Metrics Row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
              <div className="bg-[#0e0e0e] border border-[#222] p-4 rounded-sm">
                <span className="text-[10px] uppercase text-[#888] tracking-wider block mb-1">
                  Turnos Activos
                </span>
                <span className="text-2xl font-serif-luxury text-[#f1d592] font-semibold">
                  {totalActive}
                </span>
              </div>

              <div className="bg-[#0e0e0e] border border-[#222] p-4 rounded-sm">
                <span className="text-[10px] uppercase text-[#888] tracking-wider block mb-1">
                  Turnos Para Hoy
                </span>
                <span className="text-2xl font-serif-luxury text-[#D6001C] font-semibold">
                  {todayCount}
                </span>
              </div>

              <div className="bg-[#0e0e0e] border border-[#222] p-4 rounded-sm">
                <span className="text-[10px] uppercase text-[#888] tracking-wider block mb-1">
                  Total Registros
                </span>
                <span className="text-2xl font-serif-luxury text-stone-200 font-semibold">
                  {appointments.length}
                </span>
              </div>

              <div className="bg-[#0e0e0e] border border-[#222] p-4 rounded-sm flex flex-col justify-between">
                <div className="flex items-center gap-1 text-[10px] uppercase text-[#888] tracking-wider">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Autolimpieza 2 días</span>
                </div>
                <button
                  onClick={handleManualPurge}
                  className="text-[11px] text-[#D4AF37] hover:underline flex items-center gap-1 mt-1 cursor-pointer"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Depurar ahora</span>
                </button>
              </div>
            </div>

            {/* Search, Filters & Export */}
            <div className="bg-[#0c0c0c] border border-[#222] p-4 sm:p-5 rounded-sm mb-6">
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
                <div className="sm:col-span-5">
                  <label className="block text-[10px] uppercase tracking-wider text-[#D4AF37] font-semibold mb-1">
                    Buscar por Cliente / Teléfono / Servicio / Código
                  </label>
                  <div className="relative">
                    <Search className="w-4 h-4 text-[#777] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Ej: Mariana, 4616, Balayage, CF-8421..."
                      className="w-full bg-[#141414] border border-[#333] focus:border-[#D4AF37] pl-9 pr-3 py-2 text-xs text-stone-100 rounded focus:outline-none"
                    />
                  </div>
                </div>

                <div className="sm:col-span-3">
                  <label className="block text-[10px] uppercase tracking-wider text-[#D4AF37] font-semibold mb-1">
                    Filtrar por Fecha
                  </label>
                  <input
                    type="date"
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value)}
                    className="w-full bg-[#141414] border border-[#333] focus:border-[#D4AF37] px-3 py-2 text-xs text-stone-100 rounded focus:outline-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[10px] uppercase tracking-wider text-[#D4AF37] font-semibold mb-1">
                    Estado
                  </label>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value as any)}
                    className="w-full bg-[#141414] border border-[#333] focus:border-[#D4AF37] px-3 py-2 text-xs text-stone-100 rounded focus:outline-none cursor-pointer"
                  >
                    <option value="all">Todos</option>
                    <option value="active">Activos</option>
                    <option value="rescheduled">Reprogramados</option>
                    <option value="cancelled">Cancelados</option>
                  </select>
                </div>

                <div className="sm:col-span-2 flex gap-2">
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setDateFilter('');
                      setStatusFilter('all');
                    }}
                    className="flex-1 py-2 px-2 bg-[#181818] hover:bg-[#252525] text-stone-400 hover:text-stone-200 border border-[#333] text-[11px] uppercase tracking-wider rounded transition-colors cursor-pointer truncate"
                  >
                    Limpiar
                  </button>

                  <button
                    onClick={handleExportCSV}
                    title="Exportar a CSV / Excel"
                    className="py-2 px-3 bg-[#18140a] hover:bg-[#D4AF37] text-[#D4AF37] hover:text-black border border-[#D4AF37]/50 rounded transition-colors cursor-pointer flex items-center justify-center"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Appointments Table / Cards */}
            {filteredAppointments.length === 0 ? (
              <div className="text-center py-16 bg-[#0a0a0a] border border-[#222] rounded-sm">
                <Calendar className="w-10 h-10 text-stone-600 mx-auto mb-3" />
                <h3 className="text-lg font-serif-luxury text-stone-300 mb-1">
                  No hay turnos registrados con estos criterios
                </h3>
                <p className="text-xs text-stone-500">
                  Probá restableciendo los filtros o registrá un nuevo turno desde la web.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex justify-between items-center text-xs text-stone-400 px-1 mb-2">
                  <span>Mostrando {filteredAppointments.length} turnos</span>
                  <span className="text-[11px] text-[#D4AF37]">
                    * Los turnos con más de 2 días de fecha cumplida se eliminan automáticamente
                  </span>
                </div>

                <div className="grid grid-cols-1 gap-3">
                  {filteredAppointments.map((appt) => {
                    const clientPhoneClean = appt.phone.replace(/\D/g, '');
                    const waClientUrl = `https://wa.me/${clientPhoneClean.startsWith('54') ? clientPhoneClean : `549${clientPhoneClean}`}?text=${encodeURIComponent(
                      `¡Hola ${appt.clientName}! Te escribo desde Studio Celia Figueredo con respecto a tu turno ${appt.id} (${appt.serviceName}) para el ${formatFriendlyDate(appt.date)} a las ${appt.time} hs.`
                    )}`;

                    const isToday = appt.date === todayStr;

                    return (
                      <div
                        key={appt.id}
                        className={`bg-[#0a0a0a] border rounded-sm p-4 sm:p-5 transition-all ${
                          isToday
                            ? 'border-[#D4AF37] bg-[#110e08]/40 shadow-[0_0_15px_rgba(212,175,55,0.1)]'
                            : appt.status === 'cancelled'
                            ? 'border-[#222] opacity-60'
                            : 'border-[#222] hover:border-[#333]'
                        }`}
                      >
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                          {/* Left: ID & Time */}
                          <div className="flex items-start sm:items-center gap-3">
                            <div className="text-center bg-[#141414] border border-[#2c2c2c] px-3 py-2 rounded-sm min-w-[75px]">
                              <span className="block text-[9px] font-mono text-[#D4AF37] uppercase">Código</span>
                              <span className="text-xs font-mono font-bold text-white tracking-wider">{appt.id}</span>
                            </div>

                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className="text-base font-serif-luxury text-stone-100 font-semibold">
                                  {appt.clientName}
                                </h4>
                                <span
                                  className={`text-[9px] uppercase tracking-wider px-2 py-0.5 rounded font-bold ${
                                    appt.status === 'cancelled'
                                      ? 'bg-stone-800 text-stone-400'
                                      : appt.status === 'rescheduled'
                                      ? 'bg-blue-900/30 text-blue-300 border border-blue-700/40'
                                      : 'bg-emerald-900/30 text-emerald-300 border border-emerald-700/40'
                                  }`}
                                >
                                  {appt.status === 'cancelled' ? 'Cancelado' : appt.status === 'rescheduled' ? 'Reprogramado' : 'Confirmado'}
                                </span>
                                {isToday && (
                                  <span className="text-[9px] bg-[#D6001C] text-white px-2 py-0.5 rounded font-bold uppercase tracking-wider animate-pulse">
                                    Hoy
                                  </span>
                                )}
                              </div>

                              <div className="flex flex-wrap items-center gap-3 text-xs text-stone-400 mt-1">
                                <span className="text-stone-300 font-medium">{appt.serviceName}</span>
                                {appt.otherDetails && (
                                  <span className="text-stone-400 italic">({appt.otherDetails})</span>
                                )}
                                <span>•</span>
                                <span className="flex items-center gap-1 text-stone-300 font-mono">
                                  <Phone className="w-3 h-3 text-[#D4AF37]" />
                                  {appt.phone}
                                </span>
                              </div>

                              {appt.notes && (
                                <p className="text-[11px] text-stone-500 mt-1">
                                  <em>Nota: {appt.notes}</em>
                                </p>
                              )}
                            </div>
                          </div>

                          {/* Right: Date & Actions */}
                          <div className="flex flex-wrap items-center justify-between md:justify-end gap-3 pt-3 md:pt-0 border-t md:border-t-0 border-[#1c1c1c]">
                            <div className="text-left md:text-right">
                              <span className="block text-xs font-medium text-[#f1d592]">
                                {formatFriendlyDate(appt.date)}
                              </span>
                              <span className="block text-sm font-mono font-bold text-white">
                                {appt.time} hs
                              </span>
                            </div>

                            {/* Direct WhatsApp button to client */}
                            <a
                              href={waClientUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="py-2 px-3 bg-[#122818] hover:bg-[#25D366] text-emerald-300 hover:text-black border border-emerald-600/40 text-xs font-medium rounded transition-all flex items-center gap-1.5 cursor-pointer"
                            >
                              <MessageCircle className="w-3.5 h-3.5" />
                              <span>WhatsApp</span>
                            </a>

                            {/* Mark Cancelled or Restore */}
                            {appt.status !== 'cancelled' ? (
                              <button
                                onClick={() => handleCancelStatus(appt.id)}
                                title="Marcar como cancelado"
                                className="p-2 bg-[#1a1111] hover:bg-red-950/60 text-stone-400 hover:text-red-300 border border-[#333] hover:border-red-600/50 rounded transition-colors cursor-pointer"
                              >
                                <XCircle className="w-4 h-4" />
                              </button>
                            ) : (
                              <button
                                onClick={() => handleRestoreStatus(appt.id)}
                                title="Restablecer como activo"
                                className="p-2 bg-[#101a12] hover:bg-emerald-950/60 text-stone-400 hover:text-emerald-300 border border-[#333] hover:border-emerald-600/50 rounded transition-colors cursor-pointer"
                              >
                                <CheckCircle className="w-4 h-4" />
                              </button>
                            )}

                            {/* Delete permanently */}
                            <button
                              onClick={() => handleDelete(appt.id)}
                              title="Eliminar permanentemente"
                              className="p-2 bg-[#141414] hover:bg-[#251010] text-stone-500 hover:text-red-400 border border-[#292929] hover:border-red-800 rounded transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ================= TAB 2: CLAVES DE ACCESO ================= */}
        {activeTab === 'claves' && (
          <div className="space-y-8 animate-fade-in">
            {/* Header description */}
            <div className="bg-[#0e0e0e] border border-[#222] p-6 rounded-sm">
              <div className="flex items-center gap-3 mb-2">
                <KeyRound className="w-6 h-6 text-[#D4AF37]" />
                <h2 className="text-xl font-serif-luxury text-stone-100 font-semibold tracking-wide">
                  Gestión de Usuarios y Claves de Acceso
                </h2>
              </div>
              <p className="text-xs text-stone-400 max-w-2xl leading-relaxed">
                Aquí podés consultar las claves activas para entrar al panel, modificar el usuario y la clave actual, o crear nuevos usuarios para miembros de tu equipo.
              </p>
            </div>

            {/* List of active users */}
            <div>
              <h3 className="text-xs uppercase tracking-[0.2em] text-[#D4AF37] font-semibold mb-4">
                Usuarios Autorizados ({masterUsers.length})
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {masterUsers.map((user) => {
                  const isEditing = editingUserId === user.id;
                  const isPasswordVisible = visiblePasswordIds[user.id] || false;
                  const isCopied = copiedKeyId === user.id;

                  return (
                    <div
                      key={user.id}
                      className="bg-[#0a0a0a] border border-[#262626] hover:border-[#D4AF37]/50 transition-colors p-5 rounded-sm relative"
                    >
                      {isEditing ? (
                        /* Editing Form */
                        <div className="space-y-3">
                          <span className="text-[10px] uppercase tracking-wider text-[#D4AF37] font-bold block mb-1">
                            Modificando usuario
                          </span>
                          <div>
                            <label className="block text-[10px] uppercase text-stone-400 mb-1">Usuario:</label>
                            <input
                              type="text"
                              value={editUsername}
                              onChange={(e) => setEditUsername(e.target.value)}
                              className="w-full bg-[#141414] border border-[#444] focus:border-[#D4AF37] px-3 py-2 text-xs text-white rounded font-mono"
                            />
                          </div>

                          <div>
                            <label className="block text-[10px] uppercase text-stone-400 mb-1">Nueva Clave:</label>
                            <input
                              type="text"
                              value={editPassword}
                              onChange={(e) => setEditPassword(e.target.value)}
                              className="w-full bg-[#141414] border border-[#444] focus:border-[#D4AF37] px-3 py-2 text-xs text-[#f1d592] rounded font-mono"
                            />
                          </div>

                          <div>
                            <label className="block text-[10px] uppercase text-stone-400 mb-1">Notas / Rol:</label>
                            <input
                              type="text"
                              value={editNotes}
                              onChange={(e) => setEditNotes(e.target.value)}
                              placeholder="Ej: Celia Atelier"
                              className="w-full bg-[#141414] border border-[#444] focus:border-[#D4AF37] px-3 py-2 text-xs text-stone-200 rounded"
                            />
                          </div>

                          <div className="flex gap-2 pt-2">
                            <button
                              onClick={() => saveEditedUser(user.id)}
                              className="flex-1 py-2 bg-[#D6001C] hover:bg-[#b00017] text-white text-xs uppercase tracking-wider font-semibold rounded transition-colors flex items-center justify-center gap-1 cursor-pointer"
                            >
                              <Save className="w-3.5 h-3.5" />
                              <span>Guardar</span>
                            </button>
                            <button
                              onClick={cancelEditUser}
                              className="py-2 px-3 bg-[#1e1e1e] hover:bg-[#2a2a2a] text-stone-400 hover:text-white text-xs uppercase tracking-wider rounded transition-colors cursor-pointer"
                            >
                              Cancelar
                            </button>
                          </div>
                        </div>
                      ) : (
                        /* Read view */
                        <div>
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-base font-serif-luxury font-bold text-stone-100">
                                  {user.username}
                                </span>
                                <span className="px-2 py-0.5 text-[9px] bg-[#D4AF37]/15 border border-[#D4AF37]/40 text-[#f1d592] uppercase rounded font-bold">
                                  {user.notes || 'Operador'}
                                </span>
                              </div>
                              <span className="text-[10px] text-stone-500 block mt-0.5">
                                Creado el {new Date(user.createdAt).toLocaleDateString('es-AR')}
                              </span>
                            </div>

                            <div className="flex items-center gap-1.5">
                              <button
                                onClick={() => startEditUser(user)}
                                title="Modificar usuario y clave"
                                className="p-1.5 bg-[#141414] hover:bg-[#252525] text-stone-300 hover:text-[#D4AF37] border border-[#333] rounded transition-colors cursor-pointer"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>

                              {masterUsers.length > 1 && (
                                <button
                                  onClick={() => handleDeleteUser(user.id, user.username)}
                                  title="Eliminar usuario"
                                  className="p-1.5 bg-[#141414] hover:bg-red-950/50 text-stone-400 hover:text-red-400 border border-[#333] hover:border-red-800 rounded transition-colors cursor-pointer"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          </div>

                          {/* Credentials display card */}
                          <div className="bg-[#121212] border border-[#222] p-3 rounded space-y-2 mt-3">
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-stone-400">Usuario:</span>
                              <span className="font-mono font-bold text-white bg-[#1a1a1a] px-2 py-0.5 rounded border border-[#333]">
                                {user.username}
                              </span>
                            </div>

                            <div className="flex items-center justify-between text-xs">
                              <span className="text-stone-400">Clave:</span>
                              <div className="flex items-center gap-1.5">
                                <span className="font-mono font-bold text-[#f1d592] bg-[#1a1a1a] px-2.5 py-0.5 rounded border border-[#333]">
                                  {isPasswordVisible ? user.password : '••••••••'}
                                </span>
                                <button
                                  onClick={() => togglePasswordVisibility(user.id)}
                                  className="p-1 text-stone-400 hover:text-white transition-colors cursor-pointer"
                                  title={isPasswordVisible ? 'Ocultar' : 'Mostrar'}
                                >
                                  {isPasswordVisible ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                                </button>
                                <button
                                  onClick={() => handleCopyPassword(user.id, user.password)}
                                  className="p-1 text-stone-400 hover:text-white transition-colors cursor-pointer"
                                  title="Copiar clave"
                                >
                                  {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Create new user and password */}
            <div className="bg-[#0c0c0c] border border-[#262626] p-6 rounded-sm max-w-xl">
              <div className="flex items-center gap-2 mb-4">
                <UserPlus className="w-5 h-5 text-[#D4AF37]" />
                <h3 className="text-sm uppercase tracking-wider text-[#D4AF37] font-semibold">
                  Agregar Más Usuarios y Claves
                </h3>
              </div>

              <form onSubmit={handleCreateNewUser} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] uppercase tracking-wider text-stone-300 font-medium mb-1">
                      Nuevo Usuario: *
                    </label>
                    <input
                      type="text"
                      required
                      value={newUsername}
                      onChange={(e) => setNewUsername(e.target.value)}
                      placeholder="Ej: asistente, lucas"
                      className="w-full bg-[#141414] border border-[#333] focus:border-[#D4AF37] px-3 py-2 text-xs text-white rounded font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] uppercase tracking-wider text-stone-300 font-medium mb-1">
                      Nueva Clave: *
                    </label>
                    <div className="relative">
                      <input
                        type={showNewPassword ? 'text' : 'password'}
                        required
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Ej: 245048"
                        className="w-full bg-[#141414] border border-[#333] focus:border-[#D4AF37] px-3 pr-8 py-2 text-xs text-[#f1d592] rounded font-mono"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-stone-500 hover:text-stone-300 cursor-pointer"
                      >
                        {showNewPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-stone-300 font-medium mb-1">
                    Nombre u Operador (opcional):
                  </label>
                  <input
                    type="text"
                    value={newNotes}
                    onChange={(e) => setNewNotes(e.target.value)}
                    placeholder="Ej: Recepción, Colorista Atelier..."
                    className="w-full bg-[#141414] border border-[#333] focus:border-[#D4AF37] px-3 py-2 text-xs text-stone-200 rounded"
                  />
                </div>

                {newUserError && (
                  <p className="text-xs text-[#ff5555] font-medium">{newUserError}</p>
                )}

                <button
                  type="submit"
                  className="py-3 px-6 bg-[#D6001C] hover:bg-[#b00017] text-white text-xs uppercase tracking-[0.2em] font-semibold rounded transition-all duration-300 shadow-[0_0_15px_rgba(214,0,28,0.4)] cursor-pointer flex items-center justify-center gap-2"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Crear y Guardar Usuario</span>
                </button>
              </form>
            </div>
          </div>
        )}

        {/* ================= TAB 3: HORARIOS GOOGLE MAPS ================= */}
        {activeTab === 'horarios' && (
          <div className="space-y-6">
            <div className="bg-[#0e0e0e] border border-[#222] rounded-sm p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-[#1f1f1f]">
                <div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-[#D4AF37]" />
                    <h2 className="text-xl font-serif-luxury text-stone-100">
                      Sincronización de Horarios (Google Maps)
                    </h2>
                  </div>
                  <p className="text-xs text-stone-400 mt-1 max-w-2xl">
                    Este panel permite configurar el estado de cada día tal como figura en tu ficha oficial de Google Maps. Si en Maps el lunes dice <strong>Cerrado</strong>, activás el botón correspondiente y se reflejará al instante en el recuadro principal de la web.
                  </p>
                </div>

                <a
                  href={SALON_INFO.mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 py-2 px-3.5 bg-[#161616] hover:bg-[#222] border border-[#333] hover:border-[#D4AF37]/50 rounded text-xs text-stone-300 hover:text-[#D4AF37] transition-colors self-start sm:self-auto"
                >
                  <span>Abrir ficha en Google Maps</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>

              {/* List of Days */}
              <div className="mt-6 space-y-3">
                {weeklySchedule.map((day) => {
                  const isClosed = day.isClosed || day.hoursText.toLowerCase().includes('cerrado');
                  return (
                    <div
                      key={day.dayKey}
                      className="bg-[#141414] border border-[#222] rounded p-4 flex flex-col md:flex-row md:items-center justify-between gap-4"
                    >
                      <div className="flex items-center gap-3">
                        <span className="font-serif-luxury text-base text-stone-200 w-24">
                          {day.dayFull}
                        </span>
                        {isClosed ? (
                          <span className="px-2.5 py-1 text-xs font-semibold uppercase bg-red-950/40 text-red-400 border border-red-800/40 rounded">
                            Cerrado en Maps
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 text-xs font-semibold bg-emerald-950/40 text-emerald-400 border border-emerald-800/40 rounded">
                            Abierto ({day.hoursText})
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-3">
                        <input
                          type="text"
                          disabled={isClosed}
                          defaultValue={day.hoursText}
                          placeholder="Ej: de 11 a 18 hs"
                          onBlur={(e) => {
                            if (!isClosed) {
                              handleUpdateDaySchedule(day.dayKey, e.target.value, false);
                            }
                          }}
                          className={`bg-[#0a0a0a] border border-[#333] px-3 py-1.5 text-xs text-stone-200 rounded w-36 ${
                            isClosed ? 'opacity-40 cursor-not-allowed' : 'focus:border-[#D4AF37]'
                          }`}
                        />

                        <button
                          type="button"
                          onClick={() => {
                            if (isClosed) {
                              // Switch to open
                              handleUpdateDaySchedule(day.dayKey, 'de 11 a 18 hs', false);
                            } else {
                              // Switch to closed
                              handleUpdateDaySchedule(day.dayKey, 'Cerrado', true);
                            }
                          }}
                          className={`py-1.5 px-3.5 text-xs font-semibold rounded cursor-pointer transition-colors ${
                            isClosed
                              ? 'bg-[#1b2f1e] hover:bg-[#25462a] text-emerald-300 border border-emerald-700/50'
                              : 'bg-[#351216] hover:bg-[#48181e] text-red-300 border border-red-700/50'
                          }`}
                        >
                          {isClosed ? 'Marcar como Abierto' : 'Marcar como Cerrado'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-6 pt-4 border-t border-[#1c1c1c] text-xs text-stone-400 flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-[#D4AF37]" />
                <span>Los cambios se guardan automáticamente y se muestran en tiempo real en la página principal.</span>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
