/* Portal HTML lokal. Login dan kewenangan di sini merupakan simulasi antarmuka,
   bukan autentikasi server. Semua data contoh tersimpan pada browser pengguna. */
(() => {
  'use strict';
  const DATA_KEY = 'portal-administrasi.demo.v2';
  const SESSION_KEY = 'portal-administrasi.session.v2';
  const FILE_DB = 'portal-administrasi.lampiran.v2';
  const MAX_FILE_SIZE = 5 * 1024 * 1024;
  const USERS = [
    { id: 'KRY-001', name: 'Budi Santoso', email: 'budi.santoso@contoh.co.id', password: 'Budi123!', title: 'Staf Operasional', department: 'Operasional', roles: ['requester'] },
    { id: 'KRY-002', name: 'Siti Handayani', email: 'siti.handayani@contoh.co.id', password: 'Siti123!', title: 'Supervisor', department: 'Operasional', roles: ['requester', 'approver'], stage: 'supervisor' },
    { id: 'KRY-003', name: 'Mira Lestari', email: 'mira.lestari@contoh.co.id', password: 'Mira123!', title: 'Verifikator HR', department: 'Human Resources', roles: ['hr'], stage: 'hr' },
    { id: 'KRY-004', name: 'Nadya Putri', email: 'nadya.putri@contoh.co.id', password: 'Nadya123!', title: 'Verifikator Finance', department: 'Keuangan', roles: ['finance'], stage: 'finance' },
    { id: 'KRY-101', name: 'Wira Aditya', email: 'wira.aditya@contoh.co.id', password: 'Wira123!', title: 'Manager Operasional', department: 'Operasional', roles: ['approver'], stage: 'manager' },
    { id: 'KRY-102', name: 'Laras Utami', email: 'laras.utami@contoh.co.id', password: 'Laras123!', title: 'Direktur', department: 'Direksi', roles: ['approver'], stage: 'director' }
  ];
  const PEOPLE = [...USERS, { id: 'KRY-005', name: 'Arga Putra', department: 'Operasional' }, { id: 'KRY-006', name: 'Dina Arum', department: 'Operasional' }, { id: 'KRY-007', name: 'Tia Laras', department: 'Operasional' }];
  const STAGES = { supervisor: 'Supervisor', manager: 'Manager', director: 'Direktur', hr: 'HR', finance: 'Finance' };
  const ROLES = { requester: ['Pemohon', 'Membuat, memperbaiki, dan memantau pengajuan milik sendiri.'], approver: ['Approver', 'Memeriksa pengajuan tim hanya pada tahap yang ditugaskan.'], hr: ['Pihak terkait · HR', 'Melakukan validasi akhir pada tahap HR, termasuk semua jenis pengajuan pribadi Supervisor.'], finance: ['Pihak terkait · Finance', 'Memverifikasi administrasi keuangan dan menyiapkan laporan akhir.'] };
  const CATEGORIES = { employee: ['Administrasi Karyawan', 'Cuti, lembur, dan izin', 'user'], operational: ['Administrasi Operasional', 'Perjalanan dan kebutuhan kerja', 'briefcase'], finance: ['Administrasi Keuangan', 'Reimbursement dan biaya', 'wallet'] };
  const field = (name, label, type = 'text', options = null) => ({ name, label, type, options });
  const TYPES = {
    cuti: { label: 'Cuti', category: 'employee', fields: [field('subtype', 'Jenis cuti', 'select', ['Cuti tahunan', 'Cuti sakit', 'Cuti melahirkan', 'Cuti lainnya']), field('startDate', 'Tanggal mulai', 'date'), field('endDate', 'Tanggal selesai', 'date')] },
    lembur: { label: 'Lembur', category: 'employee', fields: [field('date', 'Tanggal lembur', 'date'), field('startTime', 'Jam mulai', 'time'), field('endTime', 'Jam selesai', 'time')] },
    izin: { label: 'Izin', category: 'employee', fields: [field('subtype', 'Jenis izin', 'select', ['Keperluan keluarga', 'Keperluan pribadi', 'Sakit', 'Lainnya']), field('startDate', 'Tanggal mulai', 'date'), field('endDate', 'Tanggal selesai', 'date')] },
    perjalanan: { label: 'Perjalanan dinas', category: 'operational', fields: [field('destination', 'Kota tujuan'), field('startDate', 'Tanggal berangkat', 'date'), field('endDate', 'Tanggal kembali', 'date')] },
    pembelian: { label: 'Pembelian barang', category: 'operational', fields: [field('item', 'Nama barang'), field('quantity', 'Jumlah barang', 'number'), field('amount', 'Estimasi total (Rp)', 'number')] },
    operasional: { label: 'Kebutuhan operasional', category: 'operational', fields: [field('need', 'Kebutuhan'), field('quantity', 'Jumlah kebutuhan', 'number'), field('date', 'Tanggal dibutuhkan', 'date')] },
    reimbursement: { label: 'Reimbursement', category: 'finance', fields: [field('date', 'Tanggal transaksi', 'date'), field('expense', 'Jenis pengeluaran', 'select', ['Transportasi', 'Akomodasi', 'Konsumsi', 'Lainnya']), field('amount', 'Nominal klaim (Rp)', 'number')] },
    biaya: { label: 'Pengajuan biaya', category: 'finance', fields: [field('purpose', 'Keperluan biaya'), field('amount', 'Estimasi biaya (Rp)', 'number'), field('date', 'Tanggal kebutuhan', 'date')] }
  };
  const DECISIONS = { approved: 'Setuju', returned: 'Kembalikan', rejected: 'Tolak' };
  const $ = (id) => document.getElementById(id);
  const html = (value = '') => String(value).replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
  const icon = (name) => `<svg class="icon" aria-hidden="true"><use href="#i-${name}"/></svg>`;
  const initials = (name) => name.split(/\s+/).slice(0, 2).map((part) => part[0]).join('');
  const clone = (value) => JSON.parse(JSON.stringify(value));
  const dateFormatter = new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'Asia/Jakarta' });
  const timeFormatter = new Intl.DateTimeFormat('id-ID', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'Asia/Jakarta' });
  const money = (value) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 2 }).format(Number(value) || 0);
  const validDate = (value) => typeof value === 'string' && Number.isFinite(Date.parse(value));
  const dateText = (value) => validDate(value) ? dateFormatter.format(new Date(value)) : '—';
  const dateTime = (value) => validDate(value) ? `${dateText(value)}, ${timeFormatter.format(new Date(value))} WIB` : 'Belum dikirim';
  const localDate = (value) => new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Jakarta', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date(value));
  const waiting = (stage) => `Menunggu ${STAGES[stage] || 'pemeriksa'}`;
  const uuid = () => globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  let storageAvailable = true;
  let storageError = '';
  let user = null;
  let view = '';
  let listTab = 'active';
  let db = loadDatabase();
  let editor = null;
  let review = null;
  let toastTimer;
  let confirmCallback = null;
  let confirmCancel = null;
  let busy = false;
  let fileDatabasePromise;
  let filters = freshFilters();

  // Setiap pengajuan menyimpan salinan jalur saat dikirim. Pemohon tidak dapat
  // menjadi pemeriksa dokumennya sendiri. Akun Siti melewati tahap Supervisor.
  function routeFor(person, type) {
    if (person.stage === 'supervisor') return ['hr'];
    const category = TYPES[type].category;
    const route = category === 'employee' ? ['supervisor', 'hr'] : category === 'finance' ? ['supervisor', 'finance'] : ['supervisor', 'manager', 'director'];
    return route;
  }

  function sample(id, ownerId, type, title, fields, status = 'pending', stageIndex = 0, customRoute = null) {
    const owner = PEOPLE.find((person) => person.id === ownerId);
    const route = customRoute || routeFor(owner, type);
    const received = id === 123 ? '2026-10-22T09:00:00+07:00' : id === 122 ? '2026-10-22T08:30:00+07:00' : id === 124 ? '2026-10-22T09:15:00+07:00' : `2026-10-${id >= 119 ? '21' : id >= 114 ? '19' : '12'}T16:05:00+07:00`;
    const request = { uid: `seed-${id}`, id: status === 'draft' ? 'DRAF-003' : `PA-2026-${String(id).padStart(5, '0')}`, ownerId, applicant: owner.name, department: owner.department, type, title, fields, description: type === 'cuti' ? 'Cuti tahunan untuk keperluan keluarga.' : `Permohonan ${title.toLocaleLowerCase('id-ID')}. Rincian ini merupakan data contoh untuk simulasi pemeriksaan.`, route, routeVersion: 1, stageIndex, status, received: status === 'draft' ? null : received, updatedAt: received, attachments: [], history: [] };
    if (status === 'draft') return request;
    request.history.push({ id: `sent-${id}`, action: 'submitted', actorId: ownerId, actorName: owner.name, stage: '', at: received, note: 'Pengajuan diterima.', from: 'Draft', to: waiting(route[0]) });
    const approvedCount = status === 'approved' ? route.length : stageIndex;
    for (let index = 0; index < approvedCount; index++) {
      const actor = USERS.find((person) => person.stage === route[index]);
      request.history.push({ id: `approved-${id}-${index}`, action: 'approved', actorId: actor.id, actorName: actor.name, stage: route[index], at: new Date(Date.parse(received) + (index + 1) * 3600000).toISOString(), note: route[index] === 'supervisor' ? 'Kebutuhan dan jadwal tim telah dikonfirmasi.' : 'Rincian dan kelengkapan pengajuan telah diperiksa.', from: waiting(route[index]), to: index + 1 < route.length ? waiting(route[index + 1]) : 'Disetujui' });
    }
    if (status === 'returned' || status === 'rejected') {
      const actor = USERS.find((person) => person.stage === route[stageIndex]);
      request.history.push({ id: `${status}-${id}`, action: status, actorId: actor.id, actorName: actor.name, stage: route[stageIndex], at: new Date(Date.parse(received) + (stageIndex + 2) * 3600000).toISOString(), note: status === 'returned' ? 'Mohon unggah bukti transportasi yang menampilkan tanggal dan total transaksi dengan jelas.' : 'Lembur belum disepakati dengan tim.', from: waiting(route[stageIndex]), to: status === 'returned' ? 'Dikembalikan untuk Perbaikan' : 'Ditolak' });
    }
    request.updatedAt = request.history.at(-1).at;
    return request;
  }

  function initialDatabase() {
    return { version: 2, readBy: {}, requests: [
      sample(123, 'KRY-001', 'cuti', 'Pengajuan cuti', { subtype: 'Cuti tahunan', startDate: '2026-10-26', endDate: '2026-10-27' }),
      sample(122, 'KRY-005', 'operasional', 'Penataan rak arsip', { need: 'Penataan rak dan map arsip', quantity: '12', date: '2026-10-29' }),
      sample(121, 'KRY-006', 'perjalanan', 'Perjalanan ke cabang Bogor', { destination: 'Bogor', startDate: '2026-10-27', endDate: '2026-10-28' }),
      sample(124, 'KRY-002', 'cuti', 'Cuti tahunan keluarga', { subtype: 'Cuti tahunan', startDate: '2026-10-29', endDate: '2026-10-30' }),
      sample(119, 'KRY-001', 'reimbursement', 'Transportasi kunjungan klien', { date: '2026-10-19', expense: 'Transportasi', amount: '185000' }, 'returned', 1),
      sample(118, 'KRY-001', 'perjalanan', 'Kunjungan cabang Bandung', { destination: 'Bandung', startDate: '2026-10-27', endDate: '2026-10-28' }, 'pending', 1),
      sample(117, 'KRY-001', 'reimbursement', 'Transportasi rapat vendor', { date: '2026-10-19', expense: 'Transportasi', amount: '240000' }, 'pending', 1),
      sample(116, 'KRY-001', 'pembelian', 'Pengadaan tinta printer', { item: 'Tinta printer hitam', quantity: '4', amount: '680000' }, 'pending', 2),
      sample(115, 'KRY-007', 'izin', 'Izin keluarga', { subtype: 'Keperluan keluarga', startDate: '2026-10-26', endDate: '2026-10-26' }, 'pending', 1),
      sample(114, 'KRY-005', 'lembur', 'Inventarisasi ruang kerja', { date: '2026-10-23', startTime: '18:00', endTime: '20:00' }, 'pending', 1),
      sample(113, 'KRY-006', 'biaya', 'Biaya rapat tim cabang', { purpose: 'Konsumsi rapat', amount: '450000', date: '2026-10-29' }, 'pending', 1),
      sample(111, 'KRY-001', 'izin', 'Izin keperluan keluarga', { subtype: 'Keperluan keluarga', startDate: '2026-10-14', endDate: '2026-10-14' }, 'approved', 1),
      sample(109, 'KRY-001', 'lembur', 'Rekapitulasi stok', { date: '2026-10-12', startTime: '18:00', endTime: '20:00' }, 'rejected'),
      sample(3, 'KRY-001', 'operasional', 'Map arsip tim', { need: 'Map arsip A4', quantity: '12', date: '' }, 'draft')
    ] };
  }

  function validDatabase(value) {
    if (!value || value.version !== 2 || !Array.isArray(value.requests) || value.requests.length > 2000) return false;
    const seen = new Set();
    return value.requests.every((request) => {
      if (!request || typeof request.uid !== 'string' || seen.has(request.uid)) return false;
      seen.add(request.uid);
      return ['id', 'ownerId', 'title', 'description', 'applicant', 'department'].every((key) => typeof request[key] === 'string') && Object.hasOwn(TYPES, request.type) && ['draft', 'pending', 'returned', 'approved', 'rejected'].includes(request.status) && request.fields && typeof request.fields === 'object' && !Array.isArray(request.fields) && Object.values(request.fields).every((item) => typeof item === 'string') && (request.received === null || validDate(request.received)) && validDate(request.updatedAt) && Array.isArray(request.route) && request.route.length > 0 && request.route.every((step) => Object.hasOwn(STAGES, step)) && Number.isInteger(request.stageIndex) && request.stageIndex >= 0 && request.stageIndex < request.route.length && Array.isArray(request.history) && request.history.every((entry) => entry && ['id', 'actorId', 'actorName', 'note', 'from', 'to'].every((key) => typeof entry[key] === 'string') && validDate(entry.at) && ['submitted', 'resubmitted', ...Object.keys(DECISIONS)].includes(entry.action) && (entry.stage === '' || Object.hasOwn(STAGES, entry.stage))) && Array.isArray(request.attachments) && request.attachments.every((item) => item && typeof item.id === 'string' && typeof item.name === 'string' && ['application/pdf', 'image/jpeg'].includes(item.type) && Number.isFinite(item.size) && item.size > 0 && item.size <= MAX_FILE_SIZE);
    });
  }

  function loadDatabase() {
    try {
      const raw = localStorage.getItem(DATA_KEY);
      if (!raw) return initialDatabase();
      const parsed = JSON.parse(raw);
      if (!validDatabase(parsed)) throw new Error('Data contoh tidak dapat dibaca.');
      parsed.readBy = parsed.readBy && typeof parsed.readBy === 'object' ? parsed.readBy : {};
      return parsed;
    } catch (error) {
      storageAvailable = false;
      storageError = 'Penyimpanan browser tidak dapat digunakan. Data hanya berlaku selama halaman terbuka; unduh CSV sebelum keluar.';
      return initialDatabase();
    }
  }

  async function mutate(change) {
    const operation = () => {
      const latest = storageAvailable ? loadDatabase() : clone(db);
      const result = change(latest);
      if (result === false) return false;
      db = latest;
      try { localStorage.setItem(DATA_KEY, JSON.stringify(db)); storageAvailable = true; storageError = ''; }
      catch { storageAvailable = false; storageError = 'Perubahan hanya tersimpan selama halaman ini terbuka. Penyimpanan browser penuh atau tidak diizinkan.'; }
      return result === undefined ? true : result;
    };
    return navigator.locks?.request ? navigator.locks.request(DATA_KEY, operation) : operation();
  }

  function readSession() {
    try { return USERS.find((person) => person.id === sessionStorage.getItem(SESSION_KEY)) || null; }
    catch { return null; }
  }
  function defaultView() { return user.roles.includes('requester') ? 'requests' : 'inbox'; }
  function allowedViews() {
    const allowed = ['profile', 'notifications'];
    if (user.roles.includes('requester')) allowed.push('new', 'requests');
    if (user.stage && !user.roles.includes('requester')) allowed.push('inbox');
    if (user.stage === 'finance') allowed.push('reports');
    return allowed;
  }
  function titleFor(route = view) {
    return ({ new: 'Pengajuan baru', requests: user?.stage ? 'Pengajuan saya' : 'Pengajuan', inbox: ['hr', 'finance'].includes(user?.stage) ? 'Antrian Approval' : 'Pengajuan masuk', reports: 'Laporan akhir', profile: 'Profil saya', notifications: 'Notifikasi' })[route] || 'Portal Administrasi';
  }
  function parseRoute(raw) {
    const [path, query = ''] = raw.split('?');
    const params = new URLSearchParams(query);
    let route = path;
    let tab = params.get('tab') || 'active';
    // Tautan lama tetap bekerja, tetapi mengarah ke tab pada menu gabungan.
    if (route === 'home') route = 'requests';
    if (route === 'history') {
      route = user.roles.includes('requester') && user.stage ? 'requests' : 'inbox';
      tab = route === 'requests' ? 'decisions' : 'history';
    }
    if (route === 'inbox' && user.roles.includes('requester') && user.stage) {
      route = 'requests';
      tab = tab === 'history' ? 'decisions' : 'team';
    }
    return { route, tab };
  }
  function tabsFor(route = view) {
    if (route === 'requests') return user.stage ? ['active', 'history', 'team', 'decisions'] : ['active', 'history'];
    return route === 'inbox' ? ['active', 'history'] : ['active'];
  }
  function routeUrl(route = view, tab = listTab) { return `#/${route}${['requests', 'inbox'].includes(route) && tab !== 'active' ? `?tab=${tab}` : ''}`; }
  function approvalList() { return view === 'inbox' || (view === 'requests' && ['team', 'decisions'].includes(listTab)); }
  function decisionHistory() { return approvalList() && (listTab === 'history' || listTab === 'decisions'); }
  function finished(request) { return ['approved', 'rejected'].includes(request.status); }
  function statusText(request) { return request.status === 'pending' ? waiting(request.route[request.stageIndex]) : ({ draft: 'Draft', approved: 'Disetujui', returned: 'Dikembalikan untuk Perbaikan', rejected: 'Ditolak' })[request.status]; }
  function badge(request) { return `<span class="badge ${html(request.status)}"><span class="dot" aria-hidden="true"></span>${html(statusText(request))}</span>`; }
  function ownRequests() { return db.requests.filter((request) => request.ownerId === user.id); }
  function canReview(request) { return Boolean(user?.stage && request.status === 'pending' && request.ownerId !== user.id && request.route[request.stageIndex] === user.stage && (user.stage !== 'supervisor' || request.department === user.department)); }
  function myDecisions(request) { return request.history.filter((entry) => entry.actorId === user.id && Object.hasOwn(DECISIONS, entry.action)); }
  function canRead(request) { return request.ownerId === user.id || canReview(request) || myDecisions(request).length > 0; }
  function canEdit(request) { return user.roles.includes('requester') && request.ownerId === user.id && ['draft', 'returned'].includes(request.status); }
  function freshFilters() { return { search: '', type: 'all', status: 'all', date: '', order: 'newest' }; }
  function menuLink(route, label, glyph, count = null) {
    const active = view === route || (view === 'new' && route === 'requests');
    return `<a class="nav-link${active ? ' active' : ''}" href="#/${route}"${active ? ` aria-current="${view === route ? 'page' : 'location'}"` : ''}>${icon(glyph)}<span>${html(label)}</span>${count === null ? '' : `<span class="nav-count">${count}</span>`}</a>`;
  }
  function accountGroup() { return `<p class="nav-label">AKUN</p><nav aria-label="Akun">${menuLink('notifications', 'Notifikasi', 'inbox')}${menuLink('profile', 'Profil saya', 'user')}</nav>`; }
  function navigation() {
    let result = '';
    if (user.roles.includes('requester')) {
      result += `<p class="nav-label">RUANG KERJA</p><nav aria-label="Pengajuan">${menuLink('requests', titleFor('requests'), 'file')}</nav>`;
    }
    if (user.stage && !user.roles.includes('requester')) {
      const label = user.stage === 'hr' ? 'VALIDASI HR' : user.stage === 'finance' ? 'VERIFIKASI KEUANGAN' : 'PERSETUJUAN';
      result += `<p class="nav-label">${label}</p><nav aria-label="${label}">${menuLink('inbox', titleFor('inbox'), 'check-file', db.requests.filter(canReview).length)}${user.stage === 'finance' ? menuLink('reports', 'Laporan akhir', 'file') : ''}</nav>`;
    }
    return result + accountGroup();
  }

  function shell(content) {
    const today = new Intl.DateTimeFormat('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Asia/Jakarta' }).format(new Date());
    $('app').innerHTML = `<div class="app-shell"><aside class="sidebar" id="sidebar" aria-label="Navigasi utama"><button class="icon-button mobile-close" data-action="close-navigation" type="button" aria-label="Tutup navigasi">${icon('close')}</button><a class="brand" href="#/${defaultView()}"><span class="brand-mark">${icon('check-file')}</span><span><span class="brand-name">Portal Administrasi</span><span class="brand-caption">Ruang kerja internal</span></span></a>${navigation()}<div class="sidebar-bottom"><section class="help-card"><h2>Keputusan yang tepat.</h2><p>Setiap akun menampilkan menu sesuai kewenangannya.</p><button class="text-button" type="button" data-action="guide">Lihat panduan ↗</button></section><div class="sidebar-profile"><span class="avatar" aria-hidden="true">${initials(user.name)}</span><div><p class="profile-name">${html(user.name)}</p><p class="profile-role">${html(user.title)} · ${html(user.id)}</p></div><button class="icon-button" data-action="logout" type="button" aria-label="Keluar dari akun" title="Keluar">${icon('logout')}</button></div></div></aside><button class="nav-backdrop" id="nav-backdrop" data-action="close-navigation" type="button" aria-label="Tutup navigasi" hidden></button><main id="main-content" tabindex="-1"><header class="topbar"><button class="icon-button mobile-toggle" id="open-navigation" data-action="open-navigation" type="button" aria-label="Buka navigasi" aria-expanded="false" aria-controls="sidebar">${icon('menu')}</button><div class="breadcrumb"><span>Ruang kerja</span>${icon('chevron')}<strong>${titleFor()}</strong></div><div class="topbar-right"><time class="today" datetime="${new Date().toISOString()}">${icon('calendar')}<span>${html(today)}</span></time><div class="topbar-profile"><div class="profile-details"><p class="profile-name">${html(user.name)}</p><p class="profile-role">${html(user.title)}</p></div><span class="avatar" aria-label="${html(user.name)}">${initials(user.name)}</span></div></div></header><div class="page-content">${storageAvailable ? '' : `<p class="inline-alert error storage-warning" role="status">${html(storageError)}</p>`}${content}<footer class="page-footer"><p class="demo-note"><span class="demo-tag">MODE DEMO</span><span>Data contoh tersimpan di browser ini. Akun aktif: ${html(user.id)}.</span></p><button class="text-button" data-action="reset" type="button">Pulihkan data contoh</button></footer></div></main></div>`;
    setNavigation(false, false);
  }

  function heading(title, subtitle, actions = '', eyebrow = null) {
    const controls = actions || (view === 'new' ? '<a class="button back-to-list" href="#/requests">← Kembali ke daftar</a>' : '');
    return `<div class="page-heading"><div><p class="eyebrow">${html(eyebrow || (user.stage ? `RUANG ${STAGES[user.stage].toUpperCase()}` : 'RUANG PEMOHON'))}</p><h1>${html(title)}</h1><p class="subtitle">${html(subtitle)}</p></div>${controls}</div>`;
  }
  function exportButton() { return `<button class="button export-button" type="button" data-action="export" aria-label="Unduh daftar yang ditampilkan sebagai CSV">${icon('download')}<span>Unduh CSV</span></button>`; }
  function stat(label, value, description, glyph, color) { return `<article class="stat"><div class="stat-top"><h2 class="stat-label">${html(label)}</h2><span class="stat-icon ${color}">${icon(glyph)}</span></div><span class="stat-value">${value}</span><p class="stat-description">${html(description)}</p></article>`; }
  function renderLogin(message = '') {
    document.title = 'Masuk — Portal Administrasi';
    $('app').innerHTML = `<main class="login-page" id="main-content" tabindex="-1"><section class="login-hero" aria-labelledby="login-hero-title"><div class="brand"><span class="brand-mark">${icon('check-file')}</span><span><span class="brand-name">Portal Administrasi</span><span class="brand-caption">Ruang kerja internal</span></span></div><div class="login-hero-content"><p class="eyebrow">PORTAL INTERNAL PERUSAHAAN</p><h1 id="login-hero-title">Persetujuan administrasi <span>yang lebih tertata.</span></h1><p>Ajukan kebutuhan, tinjau dokumen tim, dan ikuti setiap keputusan dalam satu tempat.</p><div class="login-workflow" aria-label="Contoh alur pengajuan karyawan"><span>Pemohon</span>${icon('arrow')}<span>Supervisor</span>${icon('arrow')}<span>HR / Finance</span></div></div><p class="login-hero-footer">Menu mengikuti peran akun Anda.<br>Setiap pengajuan memiliki jalur persetujuannya sendiri.</p></section><section class="login-panel" aria-labelledby="login-title"><div class="login-card"><p class="eyebrow">AKSES PENGGUNA</p><h2 id="login-title">Masuk ke akun</h2><p class="subtitle">Gunakan NIP atau email akun Anda. Menu akan tampil sesuai peran yang ditetapkan.</p><form class="login-form" id="login-form"><div class="form-field"><label for="login-identity">NIP atau email</label><input id="login-identity" name="identity" type="text" required maxlength="120" autocomplete="username" placeholder="Contoh: KRY-002" autocapitalize="none" spellcheck="false"></div><div class="form-field"><label for="login-password">Kata sandi</label><div class="password-field"><input id="login-password" name="password" type="password" required maxlength="120" autocomplete="current-password" placeholder="Masukkan kata sandi"><button class="password-toggle" type="button" data-action="toggle-password" aria-label="Tampilkan kata sandi" aria-pressed="false">Lihat</button></div></div><p class="inline-alert error" id="login-error" role="alert"${message ? '' : ' hidden'}>${html(message)}</p><button class="button button-primary" type="submit">Masuk ${icon('arrow')}</button></form><p class="login-help">Kesulitan masuk? Hubungi Admin untuk memeriksa akun atau hak akses Anda.</p><details class="demo-accounts" open><summary>Akun contoh untuk mencoba portal</summary><p>Pilih akun untuk mengisi formulir, lalu tekan Masuk. Setiap akun memiliki menu dan antrean yang berbeda.</p>${USERS.map((person) => `<button class="demo-account" type="button" data-account="${person.id}" aria-label="Isi akun contoh ${html(person.name)}"><span><strong>${html(person.name)}</strong><small>${html(person.id)} · ${html(person.title)}</small></span><code>${html(person.password)}</code>${icon('arrow')}</button>`).join('')}</details><p class="login-disclaimer">Prototipe lokal: akun dan kata sandi di atas hanya untuk simulasi. Data tidak dikirim ke server.</p></div></section></main>`;
  }

  function render() {
    if (!user) { renderLogin(); return; }
    document.title = `${titleFor()} — Portal Administrasi`;
    if (view === 'new') shell(renderRequestForm());
    else if (view === 'profile') shell(renderProfile());
    else if (view === 'notifications') shell(renderNotifications());
    else if (view === 'reports') shell(renderReports());
    else shell(renderListPage());
    if (['inbox', 'requests'].includes(view)) updateTable();
  }

  function setView(next, replace = false) {
    if (!user) { view = 'login'; history.replaceState(null, '', '#/login'); renderLogin(); return; }
    const allowed = allowedViews();
    const parsed = parseRoute(next);
    const target = allowed.includes(parsed.route) ? parsed.route : defaultView();
    if (target !== parsed.route && next !== 'login' && next !== '') showToast('Menu tersebut tidak tersedia untuk akun Anda.');
    const targetTab = tabsFor(target).includes(parsed.tab) ? parsed.tab : 'active';
    const pageChanged = view !== target;
    const changed = pageChanged || listTab !== targetTab;
    if (changed) filters = freshFilters();
    view = target;
    listTab = targetTab;
    closeDialogs();
    const url = routeUrl();
    if (replace) history.replaceState(null, '', url);
    else if (location.hash !== url) history.pushState(null, '', url);
    render();
    if (pageChanged) window.scrollTo(0, 0);
  }

  function navigate(next) {
    if (view === 'new' && editor?.dirty && next !== 'new') {
      ask('Tinggalkan formulir?', 'Perubahan yang belum disimpan sebagai draf akan dibuang.', 'Tinggalkan', () => { editor = null; setView(next); });
    } else {
      if (view === 'new' && next !== 'new') editor = null;
      setView(next);
    }
  }

  function showToast(message) {
    clearTimeout(toastTimer);
    $('toast').hidden = false;
    $('toast-message').textContent = message;
    toastTimer = setTimeout(() => { $('toast').hidden = true; }, 6500);
  }

  // Bagian daftar, formulir, dan dialog menggunakan satu model data bersama.
  // Semua mutasi tetap memeriksa akun aktif, pemilik, dan tahap pengajuan.

  function sourceRequests() {
    if (decisionHistory()) return db.requests.filter((request) => myDecisions(request).length > 0);
    if (approvalList()) return db.requests.filter(canReview);
    return ownRequests().filter((request) => listTab === 'history' ? finished(request) : !finished(request));
  }
  function listTime(request) { return decisionHistory() ? myDecisions(request).at(-1)?.at : listTab === 'history' ? request.updatedAt : request.received || request.updatedAt; }
  function filteredRequests() {
    const query = filters.search.trim().toLocaleLowerCase('id-ID');
    const result = sourceRequests().filter((request) => {
      const decision = decisionHistory() ? myDecisions(request).at(-1) : null;
      return (!query || `${request.title} ${request.id} ${request.applicant}`.toLocaleLowerCase('id-ID').includes(query)) && (filters.type === 'all' || request.type === filters.type) && (filters.status === 'all' || (decisionHistory() ? decision?.action : request.status) === filters.status) && (!filters.date || localDate(listTime(request)) === filters.date);
    }).sort((a, b) => (filters.order === 'oldest' ? 1 : -1) * (Date.parse(listTime(a)) - Date.parse(listTime(b))));
    return result;
  }
  function typeOptions(selected = 'all', available = Object.keys(TYPES)) { return `<option value="all">Semua jenis</option>${available.map((key) => `<option value="${key}"${selected === key ? ' selected' : ''}>${html(TYPES[key].label)}</option>`).join('')}`; }
  function filtersMarkup() {
    const history = decisionHistory();
    const statusOptions = history ? Object.entries(DECISIONS) : listTab === 'history' ? [['approved', 'Disetujui'], ['rejected', 'Ditolak']] : [['draft', 'Draft'], ['pending', 'Sedang diperiksa'], ['returned', 'Perlu perbaikan']];
    const showStatus = !approvalList() || history;
    const dateLabel = history ? 'Tanggal keputusan' : listTab === 'history' ? 'Tanggal selesai diproses' : 'Tanggal pengajuan';
    return `<div class="filters"><div class="search-field"><label class="sr-only" for="search">Cari judul, nomor, atau nama pemohon</label>${icon('search')}<input id="search" type="search" autocomplete="off" placeholder="Cari pengajuan atau nama pemohon..." value="${html(filters.search)}"></div><div class="filter-field"><label class="sr-only" for="type-filter">Jenis pengajuan</label><select id="type-filter">${typeOptions(filters.type)}</select></div>${showStatus ? `<div class="filter-field"><label class="sr-only" for="status-filter">${history ? 'Keputusan saya' : 'Status pengajuan'}</label><select id="status-filter"><option value="all">${history ? 'Semua keputusan' : 'Semua status'}</option>${statusOptions.map(([key, label]) => `<option value="${key}"${filters.status === key ? ' selected' : ''}>${label}</option>`).join('')}</select></div>` : ''}<div class="filter-field"><label class="sr-only" for="date-filter">${dateLabel}</label><input class="date-field filter-date" id="date-filter" type="date" value="${html(filters.date)}" title="${dateLabel} dalam WIB"></div><div class="sort-field"><label class="sr-only" for="sort-order">Urutan tanggal</label><select id="sort-order"><option value="newest"${filters.order === 'newest' ? ' selected' : ''}>Terbaru dahulu</option><option value="oldest"${filters.order === 'oldest' ? ' selected' : ''}>Terlama dahulu</option></select></div></div>`;
  }
  function tableMarkup() {
    const cols = decisionHistory() ? ['Pengajuan', 'Pemohon', 'Keputusan saya', 'Waktu keputusan', 'Status terkini', 'Aksi'] : approvalList() ? ['Pengajuan', 'Pemohon', 'Diterima', 'Tahap', 'Aksi'] : ['Pengajuan', 'Tanggal kirim', 'Status terkini', 'Aksi'];
    return `<div class="table-scroll" role="region" aria-label="Daftar pengajuan, geser untuk melihat semua kolom" tabindex="0"><table><caption class="sr-only">${html(titleFor())} untuk ${html(user.name)}</caption><thead><tr>${cols.map((col) => `<th scope="col">${col}</th>`).join('')}</tr></thead><tbody id="request-rows"></tbody></table></div><div class="empty-state" id="empty-state" hidden>${icon('inbox')}<h3 id="empty-title"></h3><p id="empty-description"></p><button class="text-button" type="button" data-action="clear-filters" id="clear-filters" hidden>Hapus filter pencarian</button></div><div class="queue-footer"><span id="result-count" role="status" aria-live="polite" aria-atomic="true"></span><span>Waktu ditampilkan dalam WIB</span></div>`;
  }
  function requestCell(request) { return `<div class="request-cell"><span class="request-icon${TYPES[request.type].category === 'finance' ? ' finance' : ''}">${icon(TYPES[request.type].category === 'finance' ? 'wallet' : 'file')}</span><div><p class="request-title">${html(request.title)}</p><p class="request-meta">${html(request.id)} · ${html(TYPES[request.type].label)}</p></div></div>`; }
  function personCell(request) { return `<div class="person-cell"><span class="avatar" aria-hidden="true">${html(initials(request.applicant))}</span><div><p class="person-name">${html(request.applicant)}</p><p class="person-dept">${html(request.department)}</p></div></div>`; }
  function timeCell(value) { return `<p class="date-primary">${dateText(value)}</p><p class="date-secondary">${validDate(value) ? `${timeFormatter.format(new Date(value))} WIB` : 'Belum dikirim'}</p>`; }
  function rowMarkup(request) {
    const action = `<button class="button review-button" data-action="review" data-id="${html(request.uid)}" type="button" aria-label="${canReview(request) ? 'Periksa' : 'Lihat detail'} ${html(request.title)}">${canReview(request) ? 'Periksa' : 'Detail'}${icon('arrow')}</button>${canEdit(request) ? `<button class="text-button" style="display:block;margin-top:7px;font-size:10px" data-action="edit" data-id="${html(request.uid)}" type="button">${request.status === 'draft' ? 'Lanjutkan draf' : 'Perbaiki'}</button>` : ''}`;
    if (decisionHistory()) {
      const decision = myDecisions(request).at(-1);
      return `<tr><td>${requestCell(request)}</td><td>${personCell(request)}</td><td><span class="badge ${html(decision.action)}">${DECISIONS[decision.action]}</span><p class="table-note" title="${html(decision.note)}">${html(decision.note)}</p></td><td>${timeCell(decision.at)}</td><td>${badge(request)}</td><td>${action}</td></tr>`;
    }
    return `<tr><td>${requestCell(request)}</td>${approvalList() ? `<td>${personCell(request)}</td>` : ''}<td>${timeCell(request.received)}</td><td>${badge(request)}</td><td>${action}</td></tr>`;
  }
  function updateTable() {
    if (!$('request-rows')) return;
    const records = filteredRequests();
    $('request-rows').innerHTML = records.map(rowMarkup).join('');
    const total = sourceRequests().length;
    $('result-count').innerHTML = `Menampilkan <strong>${records.length}</strong> dari <strong>${total}</strong> pengajuan`;
    $('empty-state').hidden = records.length > 0;
    const filtered = filters.search.trim() || filters.type !== 'all' || filters.status !== 'all' || filters.date;
    $('empty-title').textContent = filtered ? 'Pengajuan tidak ditemukan' : decisionHistory() ? 'Belum ada keputusan' : approvalList() ? 'Antrean sudah selesai' : listTab === 'history' ? 'Belum ada riwayat pengajuan' : 'Belum ada pengajuan aktif';
    $('empty-description').textContent = filtered ? 'Coba kata kunci lain atau ubah filter yang digunakan.' : decisionHistory() ? 'Keputusan yang Anda berikan akan tercatat pada tab ini.' : approvalList() ? 'Tidak ada pengajuan yang menunggu pada tahap Anda.' : listTab === 'history' ? 'Pengajuan yang disetujui akhir atau ditolak akan muncul di sini.' : 'Gunakan tombol Pengajuan baru untuk membuat pengajuan.';
    $('clear-filters').hidden = !filtered;
  }

  function renderListPage() {
    const approval = approvalList();
    const history = decisionHistory();
    const requests = approval ? db.requests.filter((request) => canReview(request) || myDecisions(request).length) : ownRequests();
    const decisions = approval ? requests.flatMap(myDecisions) : [];
    const pendingCount = requests.filter(approval ? canReview : (request) => request.status === 'pending').length;
    const stats = approval ? stat('Perlu ditinjau', pendingCount, 'Menunggu keputusan Anda', 'clock', 'amber') + stat('Persetujuan diberikan', decisions.filter((entry) => entry.action === 'approved').length, 'Keputusan Anda di seluruh tahap', 'check-circle', 'green') + stat('Dikembalikan', decisions.filter((entry) => entry.action === 'returned').length, 'Perbaikan yang Anda minta', 'return', 'purple') + stat('Ditolak', decisions.filter((entry) => entry.action === 'rejected').length, 'Keputusan penolakan Anda', 'close', 'red') : requesterStats(requests);
    const subtitle = view === 'requests' ? user.stage ? 'Kelola pengajuan pribadi dan persetujuan tim dalam satu tempat.' : 'Buat dan pantau seluruh pengajuan administrasi Anda.' : `Tinjau pengajuan pada tahap ${STAGES[user.stage]} dan telusuri riwayat keputusannya.`;
    const welcome = approval ? `<section class="welcome"><span class="welcome-icon">${icon('inbox')}</span><div><h2>${pendingCount ? `Selamat datang, ${user.id === 'KRY-002' ? 'Bu Siti' : html(user.name.split(' ')[0])}.` : 'Semua pengajuan sudah ditinjau.'}</h2><p>${pendingCount ? `Ada ${pendingCount} pengajuan pada tahap ${STAGES[user.stage]} yang menunggu pemeriksaan Anda.` : 'Hasil pemeriksaan tersedia pada tab Riwayat keputusan.'}</p></div><div class="snapshot">AKUN AKTIF<strong>${html(user.name)} · ${html(user.id)}</strong></div></section>` : '';
    const queueTitle = history ? 'Riwayat keputusan' : approval ? 'Antrean pemeriksaan' : listTab === 'history' ? 'Riwayat pengajuan' : 'Daftar pengajuan';
    const description = history ? 'Keputusan Anda tetap tercatat meskipun status dokumen berubah.' : approval ? 'Hanya pengajuan tim yang menunggu pada tahap Anda.' : listTab === 'history' ? 'Pengajuan pribadi yang telah disetujui akhir atau ditolak.' : 'Draf, pengajuan yang sedang diperiksa, dan pengajuan yang perlu diperbaiki.';
    const actions = `<div class="button-row list-actions">${exportButton()}${user.roles.includes('requester') ? `<a class="button button-primary" href="#/new" aria-label="Pengajuan baru">${icon('file')}<span>Pengajuan baru</span></a>` : ''}</div>`;
    return heading(titleFor(), subtitle, actions) + welcome + `
      <section class="stats" aria-label="Ringkasan ${approval ? 'pemeriksaan akun aktif' : 'seluruh pengajuan pribadi'}">${stats}</section>
      <section class="queue-panel" aria-labelledby="queue-title">
        <div class="queue-heading"><div><h2 id="queue-title">${queueTitle}</h2><p>${description}</p></div><span class="small-label"><span class="dot" style="color:#aaa0cc"></span>${html(user.title)}</span></div>
        ${listTabsMarkup()}
        <div id="list-panel" role="tabpanel" aria-labelledby="list-tab-${listTab}" tabindex="0">${filtersMarkup()}${tableMarkup()}</div>
      </section>${approval ? supportCards() : ''}`;
  }
  function listTabsMarkup() {
    const personal = ownRequests();
    const ownTabs = [
      ['active', 'Pengajuan baru', personal.filter((request) => !finished(request)).length],
      ['history', 'Riwayat pengajuan', personal.filter(finished).length]
    ];
    const pending = db.requests.filter(canReview).length;
    const decided = db.requests.filter((request) => myDecisions(request).length).length;
    const tabs = view === 'requests' ? [...ownTabs, ...(user.stage ? [['team', 'Persetujuan tim', pending], ['decisions', 'Riwayat keputusan', decided]] : [])] : [['active', 'Menunggu pemeriksaan', pending], ['history', 'Riwayat keputusan', decided]];
    return `<div class="tabs list-tabs" role="tablist" aria-label="Daftar pengajuan">${tabs.map(([key, label, count]) => `<a class="tab" role="tab" id="list-tab-${key}" href="${routeUrl(view, key)}" aria-controls="list-panel" aria-selected="${listTab === key}" tabindex="${listTab === key ? '0' : '-1'}">${label}<span class="tab-count">${count}</span></a>`).join('')}</div>`;
  }
  function requesterStats(requests) { return stat('Total pengajuan', requests.length, `${requests.filter((request) => request.status === 'draft').length} draf tersimpan`, 'file', 'purple') + stat('Sedang diperiksa', requests.filter((request) => request.status === 'pending').length, 'Menunggu tahap persetujuan', 'clock', 'amber') + stat('Perlu perbaikan', requests.filter((request) => request.status === 'returned').length, 'Lengkapi lalu kirim ulang', 'return', 'red') + stat('Selesai diproses', requests.filter(finished).length, 'Lihat hasil pada riwayat', 'check-circle', 'green'); }
  function supportCards() { return `<div class="support-grid"><section class="support-card"><h2>Alur persetujuan</h2><p>Jalur mengikuti kategori pengajuan dan jabatan pemohon.</p><div class="workflow" aria-label="Pemohon, pemeriksa tahap aktif, pemeriksa berikutnya"><div class="workflow-step"><span class="step-number">1</span><span class="step-name">Pemohon</span></div><span class="step-line" aria-hidden="true"></span><div class="workflow-step current"><span class="step-number">2</span><span class="step-name">${STAGES[user.stage]}</span></div><span class="step-line" aria-hidden="true"></span><div class="workflow-step"><span class="step-number">3</span><span class="step-name">${['hr', 'finance', 'director'].includes(user.stage) ? 'Keputusan akhir' : 'Pemeriksa berikutnya'}</span></div></div></section><section class="support-card guidance">${icon('shield')}<div><h2>Catatan kecil, dampak besar.</h2><p>Sertakan pertimbangan yang jelas. Dokumen hanya dapat diputuskan oleh pemeriksa pada tahap aktif.</p><button class="text-button" data-action="guide" type="button">Panduan pemeriksaan ${icon('arrow')}</button></div></section></div>`; }
  function renderProfile() {
    return heading('Profil saya', 'Lihat identitas dan kewenangan yang diberikan kepada akun Anda.') + `<div class="profile-layout"><section class="form-panel"><div class="profile-intro"><span class="avatar" aria-hidden="true">${initials(user.name)}</span><div><h2>${html(user.name)}</h2><p>${html(user.id)} / ${html(user.title)} / ${html(user.department)}</p></div></div><div class="field-grid">${[['profile-name', 'Nama lengkap', user.name], ['profile-id', 'NIP', user.id], ['profile-email', 'Email kerja', user.email], ['profile-department', 'Departemen', user.department]].map(([id, label, value]) => `<div class="form-field"><label for="${id}">${label}</label><input id="${id}" value="${html(value)}" readonly></div>`).join('')}</div><p class="field-help" style="margin-top:17px">Hubungi Admin untuk memperbarui identitas atau penetapan peran.</p></section><section class="form-panel"><div class="form-panel-header"><h2>Peran akun</h2><span class="account-pill">Dikelola Admin</span></div>${user.roles.map((role) => `<article class="role-card"><h3>${ROLES[role][0]}</h3><p>${ROLES[role][1]}</p></article>`).join('')}${user.stage === 'supervisor' ? '<p class="route-explanation">Semua jenis pengajuan pribadi Anda langsung diperiksa HR, tanpa tahap persetujuan Supervisor.</p>' : ''}</section></div>`;
  }

  function notifications() {
    const own = ownRequests().flatMap((request) => request.history.filter((entry) => entry.actorId !== user.id).map((entry) => ({ key: `${request.uid}-${entry.id}`, uid: request.uid, at: entry.at, title: `${request.title} · ${entry.to}`, description: `${entry.actorName}: ${entry.note}`, id: request.id })));
    const incoming = user.stage ? db.requests.filter(canReview).map((request) => ({ key: `queue-${request.uid}-${request.stageIndex}-${request.updatedAt}`, uid: request.uid, at: request.updatedAt, title: `${request.title} menunggu pemeriksaan`, description: `${request.applicant} · ${waiting(user.stage)}`, id: request.id })) : [];
    return [...own, ...incoming].sort((a, b) => Date.parse(b.at) - Date.parse(a.at));
  }
  function renderNotifications() {
    const read = Array.isArray(db.readBy[user.id]) ? db.readBy[user.id] : [];
    const all = notifications();
    const records = filters.status === 'unread' ? all.filter((item) => !read.includes(item.key)) : all;
    return heading('Notifikasi', 'Perubahan status dan pengajuan yang memerlukan perhatian Anda.') + `<section class="queue-panel"><div class="queue-heading"><div><h2>Pemberitahuan akun Anda</h2><p>${all.filter((item) => !read.includes(item.key)).length} belum dibaca</p></div><button class="button" type="button" data-action="read-all">Tandai semua dibaca</button></div><div class="tabs" role="group" aria-label="Filter notifikasi"><button class="tab" type="button" data-action="all-notifications" aria-pressed="${filters.status !== 'unread'}">Semua</button><button class="tab" type="button" data-action="unread-notifications" aria-pressed="${filters.status === 'unread'}">Belum dibaca</button></div><ul class="notifications-list">${records.map((item) => `<li class="notification${read.includes(item.key) ? '' : ' unread'}"><span class="stat-icon purple">${icon('inbox')}</span><div class="notification-body"><h3>${html(item.title)}</h3><p>${html(item.description)}</p><time datetime="${html(item.at)}">${html(item.id)} · ${dateTime(item.at)}</time><button class="text-button" type="button" data-action="notification" data-id="${html(item.uid)}" data-key="${html(item.key)}">Lihat pengajuan →</button></div></li>`).join('')}</ul>${records.length ? '' : '<div class="empty-state"><h3>Tidak ada notifikasi</h3><p>Perubahan yang berkaitan dengan akun Anda akan muncul di sini.</p></div>'}</section>`;
  }

  function reportRequests() { return db.requests.filter((request) => ['approved', 'rejected'].includes(request.status) && request.history.some((entry) => entry.actorId === user.id && entry.stage === 'finance' && Object.hasOwn(DECISIONS, entry.action))); }
  function renderReports() {
    const records = reportRequests();
    return heading('Laporan akhir dokumen keuangan', 'Rekap keputusan administratif yang telah diselesaikan oleh akun Finance Anda.', records.length ? exportButton() : '') + (records.length ? records.map((request) => `<article class="report-card" data-report="${html(request.uid)}"><div class="report-top"><div><p class="eyebrow">REKAP PERSETUJUAN</p><h2>${html(request.title)}</h2></div>${badge(request)}</div><dl class="report-metadata"><div><dt>Nomor pengajuan</dt><dd>${html(request.id)}</dd></div><div><dt>Pemohon</dt><dd>${html(request.applicant)}</dd></div><div><dt>${request.status === 'approved' ? 'Nominal disetujui' : 'Nominal diajukan'}</dt><dd>${money(request.fields.amount)}</dd></div></dl><h3 class="section-heading">Jejak persetujuan</h3><div class="table-scroll"><table><thead><tr><th scope="col">Tahap</th><th scope="col">Pemeriksa</th><th scope="col">Waktu</th><th scope="col">Hasil</th><th scope="col">Catatan</th></tr></thead><tbody>${request.history.filter((entry) => Object.hasOwn(DECISIONS, entry.action)).map((entry) => `<tr><td>${html(STAGES[entry.stage])}</td><td>${html(entry.actorName)}</td><td>${dateTime(entry.at)}</td><td>${DECISIONS[entry.action]}</td><td style="white-space:pre-wrap;overflow-wrap:anywhere">${html(entry.note)}</td></tr>`).join('')}</tbody></table></div><p class="route-explanation">Laporan mencatat keputusan administratif atas dokumen ini dan bukan bukti pembayaran.</p><div class="dialog-actions"><button class="button" type="button" data-action="review" data-id="${html(request.uid)}">Detail pengajuan</button><button class="button button-primary" type="button" data-action="print-report" data-id="${html(request.uid)}">Cetak laporan</button></div></article>`).join('') : '<section class="queue-panel"><div class="empty-state">' + icon('file') + '<h3>Belum ada laporan akhir</h3><p>Laporan tersedia setelah Anda menyetujui akhir atau menolak dokumen keuangan.</p></div></section>');
  }

  function createEditor(request = null) {
    return { uid: request?.uid || null, baseline: request?.updatedAt || null, type: request?.type || 'cuti', title: request?.title || '', description: request?.description || '', fields: clone(request?.fields || {}), attachments: clone(request?.attachments || []), pendingFiles: [], route: request?.received ? clone(request.route) : null, lockedType: Boolean(request?.received), dirty: false, error: '' };
  }
  function editorRoute() { return editor.route || routeFor(user, editor.type); }
  function routeMarkup(request = null) {
    const route = request ? request.route : editorRoute();
    return `<div class="route-path" aria-label="Jalur persetujuan: ${route.map((step) => STAGES[step]).join(', ')}">${route.map((step, index) => `${index ? icon('chevron') : ''}<span class="route-chip${request?.status === 'approved' || (request && index < request.stageIndex) ? ' done' : (!request || index === request.stageIndex) ? ' current' : ''}">${index + 1}. ${STAGES[step]}</span>`).join('')}</div>`;
  }
  function fieldMarkup(config) {
    const value = editor.fields[config.name] || '';
    const label = `<label for="field-${config.name}">${html(config.label)} <span class="required-mark" aria-hidden="true">*</span></label>`;
    if (config.type === 'select') return `<div class="form-field">${label}<select id="field-${config.name}" name="${config.name}" required><option value="">Pilih ${html(config.label.toLowerCase())}</option>${config.options.map((option) => `<option value="${html(option)}"${value === option ? ' selected' : ''}>${html(option)}</option>`).join('')}</select></div>`;
    const limits = config.type === 'number' ? ` min="${config.name === 'amount' ? '0.01' : '1'}" step="${config.name === 'amount' ? '0.01' : '1'}" inputmode="decimal"` : config.type === 'text' ? ' maxlength="160"' : '';
    return `<div class="form-field">${label}<input id="field-${config.name}" name="${config.name}" type="${config.type}" value="${html(value)}" required${limits}></div>`;
  }
  function editorAttachments() { return [...editor.attachments.map((item) => ({ ...item, pending: false })), ...editor.pendingFiles.map((item) => ({ id: item.id, name: item.file.name, size: item.file.size, type: item.file.type, pending: true }))]; }
  function fileSize(size) { return size >= 1024 * 1024 ? `${(size / 1024 / 1024).toFixed(1)} MB` : `${Math.max(1, Math.round(size / 1024))} KB`; }
  function attachmentEditorMarkup() { return editorAttachments().map((item) => `<div class="attachment-item">${icon('file')}<div class="file-info"><strong>${html(item.name)}</strong><small>${html(fileSize(item.size))} · ${item.pending ? 'Siap disimpan' : 'Tersimpan di browser'}</small></div><button class="text-button" data-action="remove-file" data-id="${html(item.id)}" type="button" aria-label="Hapus lampiran ${html(item.name)}">Hapus</button></div>`).join(''); }
  function renderRequestForm() {
    if (!editor) editor = createEditor();
    const type = TYPES[editor.type];
    const original = editor.uid ? db.requests.find((request) => request.uid === editor.uid) : null;
    const lastReturn = original?.history.filter((entry) => entry.action === 'returned').at(-1);
    return heading(editor.lockedType ? 'Perbaiki pengajuan' : 'Formulir pengajuan', 'Pilih jenis administrasi, isi rincian, dan periksa jalur persetujuannya.') + `<div class="category-grid" role="group" aria-label="Kategori administrasi">${Object.entries(CATEGORIES).map(([key, [label, description, glyph]]) => `<button class="category-button" type="button" data-action="category" data-category="${key}" aria-pressed="${key === type.category}"${editor.lockedType ? ' disabled' : ''}>${icon(glyph)}<span><strong>${label}</strong><small>${description}</small></span></button>`).join('')}</div><div class="form-layout"><section class="form-panel" aria-labelledby="request-form-title"><div class="form-panel-header"><h2 id="request-form-title">Rincian pengajuan</h2><span>* Wajib diisi</span></div>${lastReturn ? `<div class="inline-alert" style="margin:0 0 20px"><strong>Catatan perbaikan dari ${html(lastReturn.actorName)}</strong><p style="white-space:pre-wrap;overflow-wrap:anywhere">${html(lastReturn.note)}</p></div>` : ''}<form id="request-form"><div class="field-grid"><div class="form-field"><label for="request-type">Jenis pengajuan <span class="required-mark" aria-hidden="true">*</span></label><select id="request-type" name="type" required${editor.lockedType ? ' disabled' : ''}>${Object.entries(TYPES).filter(([, item]) => item.category === type.category).map(([key, item]) => `<option value="${key}"${key === editor.type ? ' selected' : ''}>${item.label}</option>`).join('')}</select></div><div class="form-field"><label for="request-title">Judul pengajuan <span class="required-mark" aria-hidden="true">*</span></label><input id="request-title" name="title" type="text" maxlength="120" required placeholder="Tuliskan judul yang jelas" value="${html(editor.title)}"></div>${type.fields.map(fieldMarkup).join('')}<div class="form-field full"><label for="request-description">Keterangan <span class="required-mark" aria-hidden="true">*</span></label><textarea id="request-description" name="description" maxlength="4000" required placeholder="Jelaskan kebutuhan dan tujuan pengajuan...">${html(editor.description)}</textarea></div></div><section class="upload-area" id="upload-area" aria-labelledby="upload-title">${icon('paperclip')}<h3 class="section-heading" id="upload-title">Dokumen pendukung</h3><label class="text-button" for="request-files" tabindex="0">Pilih berkas</label><input class="sr-only" id="request-files" type="file" accept=".pdf,.jpg,.jpeg,application/pdf,image/jpeg" multiple><p>atau tarik ke sini · PDF/JPG, maksimal 5 MB per berkas</p><p>Lampiran opsional. Berkas disimpan di browser ini.</p></section><div id="editor-files">${attachmentEditorMarkup()}</div><p class="inline-alert error" id="request-error" role="alert"${editor.error ? '' : ' hidden'}>${html(editor.error)}</p><div class="form-actions"><span>${editor.lockedType ? 'Kirim ulang ke tahap yang meminta perbaikan.' : 'Draf dapat dilengkapi kembali.'}</span><div class="button-row">${editor.lockedType ? '' : '<button class="button" type="button" data-action="save-draft">Simpan draf</button>'}<button class="button button-primary" type="submit">${editor.lockedType ? 'Kirim ulang' : 'Ajukan'} ${icon('arrow')}</button></div></div></form></section><aside class="form-side" aria-label="Ringkasan jalur dan pemohon"><section class="support-card"><h2>Jalur persetujuan</h2><p>Setelah pengajuan dikirim</p>${routeMarkup()}<p class="route-explanation">${user.stage === 'supervisor' ? 'Semua jenis pengajuan pribadi supervisor langsung masuk ke HR, tanpa persetujuan diri sendiri.' : 'Dokumen berpindah ke tahap berikutnya setelah pemeriksa memberi persetujuan.'}</p>${editor.lockedType ? '<p class="route-explanation">Jenis dan jalur tetap mengikuti pengiriman pertama.</p>' : ''}</section><section class="support-card"><h2>Data pemohon</h2><dl class="requester-data"><dt>Nama / NIP</dt><dd>${html(user.name)} / ${html(user.id)}</dd><dt>Departemen</dt><dd>${html(user.department)}</dd><dt>Jabatan</dt><dd>${html(user.title)}</dd></dl></section></aside></div>`;
  }
  function captureEditor() {
    if (!editor || !$('request-form')) return;
    editor.title = $('request-title').value;
    editor.description = $('request-description').value;
    for (const config of TYPES[editor.type].fields) editor.fields[config.name] = $(`field-${config.name}`).value;
  }
  function formError(message) {
    if (editor) editor.error = message;
    if ($('request-error')) { $('request-error').textContent = message; $('request-error').hidden = !message; }
  }
  function validateRequest() {
    const form = $('request-form');
    form.querySelectorAll('input,textarea,select').forEach((element) => element.setCustomValidity(''));
    captureEditor();
    for (const element of form.querySelectorAll('[required]')) {
      if (!element.disabled && !element.value.trim()) element.setCustomValidity('Isian wajib tidak boleh kosong atau hanya berisi spasi.');
    }
    const values = editor.fields;
    if (values.startDate && values.endDate && values.endDate < values.startDate) $('field-endDate')?.setCustomValidity('Tanggal selesai tidak boleh lebih awal dari tanggal mulai.');
    if (editor.type === 'lembur' && values.startTime && values.endTime && values.endTime <= values.startTime) $('field-endTime').setCustomValidity('Jam selesai harus setelah jam mulai pada tanggal yang sama.');
    for (const config of TYPES[editor.type].fields.filter((item) => item.type === 'number')) {
      const number = Number(values[config.name]);
      if (!Number.isFinite(number) || number <= 0 || (config.name === 'quantity' && !Number.isInteger(number))) $(`field-${config.name}`).setCustomValidity(config.name === 'quantity' ? 'Jumlah harus berupa bilangan bulat lebih dari nol.' : 'Nominal harus lebih dari nol.');
    }
    if (!form.reportValidity()) { formError('Periksa kembali isian yang ditandai sebelum mengajukan.'); return false; }
    formError('');
    return true;
  }

  function openFileDatabase() {
    if (!fileDatabasePromise) fileDatabasePromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(FILE_DB, 1);
      request.onupgradeneeded = () => request.result.createObjectStore('files');
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(new Error('Penyimpanan lampiran tidak tersedia pada browser ini.'));
      request.onblocked = () => reject(new Error('Tutup tab portal lain sebelum membuka penyimpanan lampiran.'));
    }).catch((error) => { fileDatabasePromise = null; throw error; });
    return fileDatabasePromise;
  }
  async function fileTransaction(mode, work) {
    const database = await openFileDatabase();
    return new Promise((resolve, reject) => {
      const transaction = database.transaction('files', mode);
      let result;
      work(transaction.objectStore('files'), (value) => { result = value; });
      transaction.oncomplete = () => resolve(result);
      transaction.onerror = () => reject(new Error('Lampiran gagal disimpan atau dibaca. Penyimpanan browser mungkin penuh.'));
      transaction.onabort = () => reject(new Error('Penyimpanan lampiran dibatalkan.'));
    });
  }
  async function addFiles(files) {
    if (!editor || busy) return;
    const expectedEditor = editor;
    const accepted = [];
    const errors = [];
    busy = true;
    try {
      for (const file of files) {
        const pdf = /\.pdf$/i.test(file.name);
        const jpeg = /\.jpe?g$/i.test(file.name);
        if ((!pdf && !jpeg) || file.size > MAX_FILE_SIZE || file.size === 0) { errors.push(`${file.name}: gunakan PDF/JPG yang tidak kosong, maksimal 5 MB.`); continue; }
        const signature = new Uint8Array(await file.slice(0, 5).arrayBuffer());
        const valid = pdf ? String.fromCharCode(...signature) === '%PDF-' : signature[0] === 255 && signature[1] === 216 && signature[2] === 255;
        if (!valid || (file.type && file.type !== (pdf ? 'application/pdf' : 'image/jpeg'))) { errors.push(`${file.name}: isi berkas tidak sesuai format PDF/JPG.`); continue; }
        accepted.push({ id: uuid(), file });
      }
      if (editor !== expectedEditor) return;
      editor.pendingFiles.push(...accepted);
      if (accepted.length) editor.dirty = true;
      $('editor-files').innerHTML = attachmentEditorMarkup();
      formError(errors.join(' '));
      $('request-files').value = '';
    } finally { busy = false; }
  }
  async function saveEditorFiles() {
    if (!editor.pendingFiles.length) return clone(editor.attachments);
    const items = editor.pendingFiles.slice();
    await fileTransaction('readwrite', (store) => items.forEach((item) => store.put(item.file, item.id)));
    return [...clone(editor.attachments), ...items.map((item) => ({ id: item.id, name: item.file.name, type: /\.pdf$/i.test(item.file.name) ? 'application/pdf' : 'image/jpeg', size: item.file.size }))];
  }

  function newNumber(data) {
    const year = new Intl.DateTimeFormat('en', { year: 'numeric', timeZone: 'Asia/Jakarta' }).format(new Date());
    const prefix = `PA-${year}-`;
    const maximum = Math.max(0, ...data.requests.filter((request) => request.id.startsWith(prefix)).map((request) => Number(request.id.slice(prefix.length)) || 0));
    return prefix + String(maximum + 1).padStart(5, '0');
  }
  async function saveRequest(asDraft) {
    if (!user.roles.includes('requester') || !editor) throw new Error('Akun ini tidak memiliki kewenangan mengajukan dokumen.');
    captureEditor();
    const attachments = await saveEditorFiles();
    const currentEditor = editor;
    const now = new Date().toISOString();
    let saved;
    await mutate((data) => {
      const original = currentEditor.uid ? data.requests.find((request) => request.uid === currentEditor.uid) : null;
      if (currentEditor.uid && (!original || !canEdit(original) || original.updatedAt !== currentEditor.baseline)) throw new Error('Pengajuan berubah di tab lain atau sudah tidak dapat diedit. Buka ulang dari riwayat.');
      if (asDraft && original?.received) throw new Error('Pengajuan yang telah dikirim tidak dapat diubah menjadi draf.');
      const route = original?.received ? clone(original.route) : routeFor(user, currentEditor.type);
      const request = { uid: original?.uid || uuid(), id: asDraft ? (original?.id || `DRAF-${uuid().slice(0, 8).toUpperCase()}`) : (original?.received ? original.id : newNumber(data)), ownerId: user.id, applicant: user.name, department: user.department, type: original?.received ? original.type : currentEditor.type, title: currentEditor.title.trim() || `Draf ${TYPES[currentEditor.type].label}`, description: currentEditor.description.trim(), fields: clone(currentEditor.fields), route, routeVersion: original?.routeVersion || 1, stageIndex: original?.received ? original.stageIndex : 0, status: asDraft ? 'draft' : 'pending', received: asDraft ? null : (original?.received || now), updatedAt: now, attachments, history: clone(original?.history || []) };
      if (!asDraft) request.history.push({ id: uuid(), action: original?.received ? 'resubmitted' : 'submitted', actorId: user.id, actorName: user.name, stage: '', at: now, note: original?.received ? 'Dokumen diperbaiki dan dikirim ulang ke pemeriksa yang meminta perbaikan.' : 'Pengajuan diterima.', from: original ? statusText(original) : 'Draft', to: waiting(route[request.stageIndex]) });
      if (original) data.requests[data.requests.findIndex((item) => item.uid === original.uid)] = request;
      else data.requests.push(request);
      saved = request;
    });
    editor = null;
    setView('requests');
    showToast(asDraft ? 'Draf berhasil disimpan ke daftar pada tab Pengajuan baru.' : `${saved.id} berhasil dikirim. ${statusText(saved)}.${storageAvailable ? '' : ' Data hanya tersimpan selama halaman terbuka.'}`);
    return true;
  }
  function submitRequest(event) {
    event.preventDefault();
    if (busy || !user.roles.includes('requester') || !validateRequest()) return;
    const route = editorRoute();
    const target = editor.lockedType ? route[db.requests.find((item) => item.uid === editor.uid).stageIndex] : route[0];
    ask(editor.lockedType ? 'Kirim ulang pengajuan?' : 'Ajukan dokumen ini?', `${editor.title.trim()} akan dikirim ke ${STAGES[target]}. ${editorAttachments().length} lampiran akan disertakan.`, editor.lockedType ? 'Ya, kirim ulang' : 'Ya, ajukan', () => saveRequest(false));
  }
  function editRequest(uid) {
    const request = db.requests.find((item) => item.uid === uid);
    if (!request || !canEdit(request)) { showToast('Pengajuan ini tidak dapat diedit oleh akun Anda.'); return; }
    editor = createEditor(request);
    setView('new');
  }

  function initializeDialogs() {
    $('dialog-root').innerHTML = `<dialog id="review-dialog" aria-labelledby="review-title" aria-describedby="review-number"><div class="dialog-header"><div><p class="eyebrow" id="review-eyebrow">PEMERIKSAAN PENGAJUAN</p><h2 id="review-title"></h2><p id="review-number"></p></div><button class="icon-button" type="button" data-close-dialog aria-label="Tutup detail pengajuan" autofocus>${icon('close')}</button></div><div class="dialog-body" id="review-details"></div><section class="decision-history" id="request-activity" aria-label="Riwayat pengajuan"></section><form class="decision-form" id="decision-form"><fieldset><legend>Keputusan pemeriksaan</legend><div class="decision-options"><label class="decision-option"><input type="radio" name="decision" value="approved" required><span><strong id="approve-label">Setujui</strong><small id="approve-description">Teruskan pengajuan</small></span></label><label class="decision-option"><input type="radio" name="decision" value="returned" required><span><strong>Kembalikan</strong><small>Minta perbaikan</small></span></label><label class="decision-option"><input type="radio" name="decision" value="rejected" required><span><strong>Tolak</strong><small>Akhiri pengajuan</small></span></label></div></fieldset><div id="review-checklist"></div><label class="note-label" for="decision-note">Catatan pemeriksa <span>Wajib · <span id="note-count">0</span>/1.000</span></label><textarea id="decision-note" name="note" maxlength="1000" required placeholder="Tuliskan pertimbangan atau instruksi perbaikan..." aria-describedby="note-help decision-error"></textarea><p class="note-help" id="note-help">Catatan, nama pemeriksa, dan waktu akan dicatat bersama keputusan.</p><p class="inline-alert error" id="decision-error" role="alert" hidden></p><div class="dialog-actions"><button class="button" type="button" data-close-dialog>Batal</button><button class="button button-primary" id="save-decision" type="submit">Tinjau keputusan ${icon('arrow')}</button></div></form><div class="dialog-body" id="review-readonly-actions" hidden></div></dialog><dialog class="info-dialog" id="info-dialog" aria-labelledby="info-title"><div class="dialog-header"><h2 id="info-title"></h2><button class="icon-button" type="button" data-close-dialog aria-label="Tutup informasi" autofocus>${icon('close')}</button></div><div class="dialog-body" id="info-content"></div><div class="dialog-actions"><button class="button button-primary" type="button" data-close-dialog>Mengerti</button></div></dialog><dialog class="info-dialog" id="confirm-dialog" aria-labelledby="confirm-title" aria-describedby="confirm-description"><div class="dialog-header"><h2 id="confirm-title"></h2><button class="icon-button" type="button" data-close-dialog aria-label="Batalkan" autofocus>${icon('close')}</button></div><div class="dialog-body"><p id="confirm-description"></p><div class="confirmation-preview" id="confirm-preview" hidden></div><p class="inline-alert error" id="confirm-error" role="alert" hidden></p></div><div class="dialog-actions"><button class="button" type="button" data-close-dialog>Batal</button><button class="button button-primary" type="button" id="confirm-action"></button></div></dialog>`;
    $('dialog-root').querySelectorAll('dialog').forEach((dialog) => {
      dialog.addEventListener('click', (event) => {
        const rect = dialog.getBoundingClientRect();
        if (!busy && event.target === dialog && (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom)) dialog.close('cancel');
      });
      dialog.addEventListener('cancel', (event) => { if (busy) event.preventDefault(); });
      dialog.addEventListener('close', () => {
        if (dialog.id === 'review-dialog') review = null;
        if (dialog.id === 'confirm-dialog' && dialog.returnValue !== 'confirmed') {
          const cancel = confirmCancel;
          confirmCallback = null;
          confirmCancel = null;
          if (cancel) cancel();
        }
        document.body.style.overflow = document.querySelector('dialog[open]') || $('sidebar')?.classList.contains('is-open') ? 'hidden' : '';
        const source = dialog.restoreTarget;
        if (source?.isConnected && !source.closest('[hidden]') && !source.closest('[inert]')) source.focus({ preventScroll: true });
        else if (!document.querySelector('dialog[open]')) $('main-content')?.focus({ preventScroll: true });
      });
    });
  }
  function openDialog(dialog) {
    dialog.restoreTarget = document.activeElement;
    dialog.returnValue = '';
    $('toast').hidden = true;
    if (!dialog.open) dialog.showModal();
    document.body.style.overflow = 'hidden';
  }
  function closeDialogs() {
    document.querySelectorAll('dialog[open]').forEach((dialog) => dialog.close('confirmed'));
    review = null;
    document.body.style.overflow = '';
  }
  function ask(title, description, label, callback, preview = '', danger = false) {
    $('confirm-title').textContent = title;
    $('confirm-description').textContent = description;
    $('confirm-action').textContent = label;
    $('confirm-action').className = `button ${danger ? 'button-danger' : 'button-primary'}`;
    $('confirm-action').disabled = false;
    $('confirm-preview').textContent = preview;
    $('confirm-preview').hidden = !preview;
    $('confirm-error').hidden = true;
    confirmCallback = callback;
    confirmCancel = null;
    openDialog($('confirm-dialog'));
  }
  function activityMarkup(request) {
    return `<h3>Riwayat aktivitas</h3>${request.history.length ? `<ol class="activity-list">${request.history.map((entry) => `<li><p class="activity-title">${html(entry.actorName)} · ${Object.hasOwn(DECISIONS, entry.action) ? DECISIONS[entry.action] : entry.action === 'resubmitted' ? 'Kirim ulang' : 'Diajukan'}${entry.stage ? ` (${html(STAGES[entry.stage])})` : ''}</p><p class="activity-meta">${dateTime(entry.at)}</p><p class="activity-note">${html(entry.note)}</p><p class="activity-status">${html(entry.from)} → ${html(entry.to)}</p></li>`).join('')}</ol>` : '<p class="route-explanation">Draf belum dikirim ke pemeriksa.</p>'}`;
  }
  function openReview(uid) {
    const request = db.requests.find((item) => item.uid === uid);
    if (!request || !canRead(request)) { showToast('Pengajuan ini tidak tersedia untuk akun Anda.'); return; }
    const actionable = canReview(request);
    review = { uid, baseline: request.updatedAt };
    $('review-title').textContent = request.title;
    $('review-number').textContent = `${request.id} · ${TYPES[request.type].label}`;
    $('review-eyebrow').textContent = actionable ? `PEMERIKSAAN ${STAGES[user.stage].toUpperCase()}` : 'DETAIL PENGAJUAN';
    const fields = [['Nama / NIP', `${request.applicant} / ${request.ownerId}`], ['Departemen', request.department], ...TYPES[request.type].fields.map((config) => [config.label, config.name === 'amount' ? money(request.fields[config.name]) : ['date', 'startDate', 'endDate'].includes(config.name) ? dateText(request.fields[config.name]) : request.fields[config.name] || 'Belum diisi']), ['Dikirim', request.received ? dateTime(request.received) : 'Belum dikirim']];
    $('review-details').innerHTML = `<div class="detail-status">${personCell(request)}${badge(request)}</div><dl class="detail-grid">${fields.map(([label, value]) => `<div><dt>${html(label)}</dt><dd>${html(value)}</dd></div>`).join('')}</dl><div class="detail-description"><h3>Keterangan pemohon</h3><p style="white-space:pre-wrap;overflow-wrap:anywhere">${html(request.description || 'Belum diisi.')}</p></div><section class="review-attachments"><h3>Dokumen pendukung</h3>${request.attachments.length ? request.attachments.map((item) => `<div class="attachment-item">${icon('file')}<div class="file-info"><strong>${html(item.name)}</strong><small>${html(fileSize(item.size))}</small></div><button class="text-button" type="button" data-action="download-file" data-request="${html(request.uid)}" data-id="${html(item.id)}">Unduh</button></div>`).join('') : '<p class="attachment-note">Tidak ada lampiran pada pengajuan ini. Lampiran bersifat opsional.</p>'}</section><section class="review-route"><h3 class="section-heading">Jalur persetujuan · versi ${Number(request.routeVersion) || 1}</h3>${routeMarkup(request)}${request.ownerId === 'KRY-002' ? '<p class="route-explanation">Pengajuan pribadi supervisor langsung ke HR untuk semua jenis administrasi.</p>' : ''}</section>`;
    $('request-activity').innerHTML = activityMarkup(request);
    $('decision-form').hidden = !actionable;
    $('review-readonly-actions').hidden = actionable;
    $('review-readonly-actions').innerHTML = `<div class="dialog-actions">${canEdit(request) ? `<button class="button button-primary" data-action="edit" data-id="${html(request.uid)}" type="button">${request.status === 'draft' ? 'Lanjutkan draf' : 'Perbaiki pengajuan'}</button>` : ''}<button class="button" data-close-dialog type="button">Tutup</button></div>`;
    $('decision-form').reset();
    $('decision-note').setCustomValidity('');
    $('decision-note').removeAttribute('aria-invalid');
    $('decision-error').hidden = true;
    $('note-count').textContent = '0';
    const final = request.stageIndex === request.route.length - 1;
    $('approve-label').textContent = final ? 'Setujui akhir' : 'Setujui';
    $('approve-description').textContent = final ? 'Selesaikan pengajuan' : `Ke ${STAGES[request.route[request.stageIndex + 1]]}`;
    const checks = user.stage === 'hr' ? ['Identitas dan jenis pengajuan sesuai', 'Rincian serta periode pengajuan benar', 'Kelengkapan dan keterbacaan lampiran diperiksa'] : user.stage === 'finance' ? ['Tanggal dan identitas transaksi terbaca', 'Nominal bukti sesuai dengan klaim', 'Dokumen pendukung lengkap'] : [];
    $('review-checklist').innerHTML = actionable && checks.length ? `<fieldset class="review-checklist"><legend>Daftar periksa ${STAGES[user.stage]}</legend>${checks.map((label, index) => `<label class="checklist-item"><input type="checkbox" name="check-${index}" value="yes">${label}</label>`).join('')}<p class="checklist-message">Seluruh daftar periksa wajib dicentang untuk persetujuan akhir. Penolakan atau pengembalian tetap memerlukan catatan.</p></fieldset>` : '';
    openDialog($('review-dialog'));
  }

  function submitDecision(event) {
    event.preventDefault();
    if (busy || !review) return;
    const note = $('decision-note').value.trim();
    const action = new FormData($('decision-form')).get('decision');
    const error = $('decision-error');
    error.hidden = true;
    if (!note) {
      error.textContent = 'Catatan pemeriksa wajib diisi dan tidak boleh hanya berisi spasi.';
      error.hidden = false;
      $('decision-note').setAttribute('aria-invalid', 'true');
      $('decision-note').setCustomValidity('Catatan pemeriksa wajib diisi.');
      $('decision-note').reportValidity();
      return;
    }
    const checks = [...$('review-checklist').querySelectorAll('input[type="checkbox"]')];
    if (action === 'approved' && checks.some((input) => !input.checked)) {
      error.textContent = 'Lengkapi seluruh daftar periksa sebelum memberikan persetujuan akhir.';
      error.hidden = false;
      checks.find((input) => !input.checked).focus();
      return;
    }
    if (!Object.hasOwn(DECISIONS, action)) return;
    const request = db.requests.find((item) => item.uid === review.uid);
    if (!request || !canReview(request)) { closeDialogs(); render(); showToast('Pengajuan sudah tidak menunggu keputusan akun Anda.'); return; }
    const final = request.stageIndex === request.route.length - 1;
    const next = final ? 'Disetujui' : waiting(request.route[request.stageIndex + 1]);
    const title = action === 'approved' ? final ? 'Setujui akhir pengajuan?' : `Teruskan ke ${STAGES[request.route[request.stageIndex + 1]]}?` : action === 'returned' ? 'Minta perbaikan?' : 'Tolak pengajuan?';
    const description = action === 'approved' ? `${request.id} akan berubah dari ${statusText(request)} menjadi ${next}.` : action === 'returned' ? 'Pemohon dapat memperbaiki dokumen yang sama dan mengirimnya kembali ke tahap ini.' : 'Pengajuan akan berakhir dengan status Ditolak. Pemohon dapat membaca alasan Anda pada riwayat.';
    const payload = { uid: review.uid, baseline: review.baseline, action, note, checks: checks.map((input) => input.checked) };
    ask(title, description, action === 'approved' ? 'Ya, setujui' : action === 'returned' ? 'Ya, kembalikan' : 'Ya, tolak', () => applyDecision(payload), note, action === 'rejected');
  }
  async function applyDecision(payload) {
    let nextStatus = '';
    await mutate((data) => {
      const request = data.requests.find((item) => item.uid === payload.uid);
      if (!request || !canReview(request) || request.updatedAt !== payload.baseline) throw new Error('Pengajuan telah berubah atau sudah diperiksa di tab lain. Tutup detail lalu buka kembali antrean.');
      if (!payload.note.trim() || payload.note.length > 1000) throw new Error('Catatan pemeriksa wajib diisi, maksimal 1.000 karakter.');
      if (payload.action === 'approved' && ['hr', 'finance'].includes(user.stage) && (payload.checks.length !== 3 || !payload.checks.every(Boolean))) throw new Error('Daftar periksa belum lengkap.');
      const from = statusText(request);
      const stage = request.route[request.stageIndex];
      if (payload.action === 'approved') {
        if (request.stageIndex === request.route.length - 1) request.status = 'approved';
        else request.stageIndex++;
      } else request.status = payload.action;
      request.updatedAt = new Date().toISOString();
      nextStatus = statusText(request);
      request.history.push({ id: uuid(), action: payload.action, actorId: user.id, actorName: user.name, stage, at: request.updatedAt, note: payload.note.trim(), from, to: nextStatus, checks: payload.checks });
    });
    closeDialogs();
    render();
    showToast(`Keputusan dicatat. Status terkini: ${nextStatus}.${storageAvailable ? '' : ' Hanya tersimpan selama halaman terbuka.'}`);
    return true;
  }
  async function downloadFile(uid, fileId) {
    const request = db.requests.find((item) => item.uid === uid);
    const attachment = request?.attachments.find((item) => item.id === fileId);
    if (!request || !attachment || !canRead(request)) { showToast('Lampiran ini tidak tersedia untuk akun Anda.'); return; }
    try {
      const blob = await fileTransaction('readonly', (store, resolve) => { const operation = store.get(fileId); operation.onsuccess = () => resolve(operation.result); });
      if (!(blob instanceof Blob)) throw new Error('Berkas tidak ditemukan pada browser ini. Minta pemohon mengunggah ulang lampiran.');
      downloadBlob(blob, attachment.name);
    } catch (error) { showToast(error.message); }
  }
  function downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.append(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 2000);
  }
  function csvCell(value) {
    let safe = String(value ?? '');
    if (/^[\s\uFEFF]*[=+@-]/.test(safe)) safe = "'" + safe;
    return `"${safe.replace(/"/g, '""')}"`;
  }
  function exportCsv() {
    const records = view === 'reports' ? reportRequests() : filteredRequests();
    if (!records.length) { showToast('Tidak ada pengajuan pada daftar ini untuk diunduh.'); return; }
    const header = ['Nomor pengajuan', 'Judul', 'Pemohon', 'Jenis', 'Dikirim (WIB)', 'Status terkini', 'Keputusan saya', 'Catatan saya', 'Nominal (Rp)', 'Waktu keputusan (WIB)'];
    const rows = records.map((request) => {
      const decision = myDecisions(request).at(-1);
      return [request.id, request.title, request.applicant, TYPES[request.type].label, request.received ? dateTime(request.received) : '', statusText(request), decision ? DECISIONS[decision.action] : '', decision?.note || '', request.fields.amount || '', decision ? dateTime(decision.at) : ''];
    });
    downloadBlob(new Blob(['\uFEFF' + [header, ...rows].map((row) => row.map(csvCell).join(',')).join('\r\n')], { type: 'text/csv;charset=utf-8;' }), `pengajuan-${user.id}-${view}${['requests', 'inbox'].includes(view) ? `-${listTab}` : ''}.csv`);
    showToast(`${records.length} pengajuan berhasil diekspor ke CSV.`);
  }
  function printReport(uid) {
    if (user.stage !== 'finance' || !reportRequests().some((request) => request.uid === uid)) return;
    const reports = [...document.querySelectorAll('[data-report]')];
    reports.forEach((report) => { report.hidden = report.dataset.report !== uid; });
    try { window.print(); } finally { reports.forEach((report) => { report.hidden = false; }); }
  }

  const mobileQuery = matchMedia('(max-width: 1040px)');
  function setNavigation(open, restoreFocus = true) {
    const sidebar = $('sidebar');
    if (!sidebar) return;
    const active = open && mobileQuery.matches;
    const wasOpen = sidebar.classList.contains('is-open');
    sidebar.classList.toggle('is-open', active);
    sidebar.inert = mobileQuery.matches && !active;
    $('main-content').inert = active;
    $('nav-backdrop').hidden = !active;
    $('open-navigation').setAttribute('aria-expanded', String(active));
    document.body.style.overflow = active || document.querySelector('dialog[open]') ? 'hidden' : '';
    if (active) {
      sidebar.setAttribute('role', 'dialog');
      sidebar.setAttribute('aria-modal', 'true');
      sidebar.querySelector('.mobile-close').focus();
    } else {
      sidebar.removeAttribute('role');
      sidebar.removeAttribute('aria-modal');
      if (wasOpen && restoreFocus) $('open-navigation').focus();
    }
  }
  function showGuide() {
    setNavigation(false);
    $('info-title').textContent = 'Panduan ruang kerja';
    $('info-content').innerHTML = `<ol><li>Pemohon menggunakan menu <strong>Pengajuan</strong>; Supervisor menggunakan <strong>Pengajuan saya</strong>. Formulir dibuka lewat tombol <strong>Pengajuan baru</strong> pada halaman daftar.</li><li>Tab <strong>Pengajuan baru</strong> memuat draf, pengajuan yang sedang diperiksa, dan yang perlu diperbaiki. Tab <strong>Riwayat pengajuan</strong> memuat pengajuan yang telah disetujui akhir atau ditolak.</li><li>Supervisor memeriksa tim melalui tab <strong>Persetujuan tim</strong> dan <strong>Riwayat keputusan</strong> di halaman yang sama. Semua jenis pengajuan pribadi supervisor langsung ke HR, tanpa persetujuan diri sendiri.</li><li>HR dan Finance memiliki akun terpisah dengan menu <strong>Antrian Approval</strong>. Manager dan Direktur menggunakan <strong>Pengajuan masuk</strong>. Antrean dan keputusan sebelumnya dipisahkan melalui tab.</li><li>Pengajuan staf mengikuti jenisnya: karyawan melalui Supervisor → HR; keuangan melalui Supervisor → Finance; operasional melalui Supervisor → Manager → Direktur.</li><li>Setiap keputusan wajib memiliki catatan. HR dan Finance wajib melengkapi daftar periksa untuk persetujuan akhir. Dokumen yang dikembalikan dapat diperbaiki pemiliknya lalu dikirim ulang ke tahap yang meminta perbaikan.</li></ol><p style="margin-top:16px">Akun dan data pada portal ini adalah simulasi lokal. Keluar dari akun lalu masuk dengan akun contoh lain untuk mencoba alur lintas peran.</p>`;
    openDialog($('info-dialog'));
  }
  async function resetDemo() {
    const next = initialDatabase();
    await mutate((data) => { data.requests = next.requests; data.readBy = {}; });
    try { await fileTransaction('readwrite', (store) => store.clear()); } catch { /* Reset daftar tetap dapat dilakukan saat penyimpanan lampiran tidak tersedia. */ }
    editor = null;
    filters = freshFilters();
    setView(defaultView());
    showToast('Data contoh dipulihkan. Seluruh perubahan pengajuan demo telah direset.');
    return true;
  }
  function logout() {
    try { sessionStorage.removeItem(SESSION_KEY); } catch { /* Sesi memori tetap ditutup. */ }
    editor = null;
    user = null;
    closeDialogs();
    setView('login', true);
    $('login-identity').focus();
    return true;
  }

  async function handleClick(event) {
    const routeLink = event.target.closest('a[href^="#/"]');
    if (routeLink) {
      event.preventDefault();
      if (busy) return;
      const tabId = routeLink.getAttribute('role') === 'tab' ? routeLink.id : null;
      setNavigation(false);
      navigate(routeLink.getAttribute('href').slice(2));
      if (tabId) {
        const selected = $(tabId);
        selected?.focus({ preventScroll: true });
        selected?.scrollIntoView({ block: 'nearest', inline: 'nearest' });
      }
      return;
    }
    const close = event.target.closest('[data-close-dialog]');
    if (close) { if (!busy) close.closest('dialog').close('cancel'); return; }
    const fillAccount = event.target.closest('[data-account]');
    if (fillAccount && !user) {
      const account = USERS.find((person) => person.id === fillAccount.dataset.account);
      if (!account) return;
      $('login-identity').value = account.id;
      $('login-password').value = account.password;
      $('login-error').hidden = true;
      $('login-form').querySelector('[type="submit"]').focus();
      return;
    }
    const button = event.target.closest('[data-action]');
    if (!button || busy) return;
    const action = button.dataset.action;
    if (action === 'toggle-password' && !user) {
      const show = $('login-password').type === 'password';
      $('login-password').type = show ? 'text' : 'password';
      button.textContent = show ? 'Sembunyikan' : 'Lihat';
      button.setAttribute('aria-pressed', String(show));
      button.setAttribute('aria-label', show ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi');
      return;
    }
    if (!user) return;
    try {
      if (action === 'open-navigation') setNavigation(true);
      else if (action === 'close-navigation') setNavigation(false);
      else if (action === 'guide') showGuide();
      else if (action === 'review') openReview(button.dataset.id);
      else if (action === 'edit') { closeDialogs(); editRequest(button.dataset.id); }
      else if (action === 'export') exportCsv();
      else if (action === 'print-report') printReport(button.dataset.id);
      else if (action === 'download-file') await downloadFile(button.dataset.request, button.dataset.id);
      else if (action === 'clear-filters') { filters = freshFilters(); render(); $('search')?.focus(); }
      else if (action === 'logout') {
        setNavigation(false);
        ask('Keluar dari akun?', `Sesi ${user.name} akan ditutup. Data yang berhasil disimpan tetap tersedia.${editor?.dirty ? ' Perubahan formulir yang belum disimpan akan dibuang.' : ''}`, 'Keluar', logout);
      } else if (action === 'reset') {
        ask('Pulihkan seluruh data contoh?', 'Pengajuan baru, draf, keputusan, catatan, dan lampiran demo pada browser ini akan dihapus. Data awal semua akun akan dipulihkan.', 'Ya, pulihkan', resetDemo, '', true);
      } else if (action === 'category' && editor && !editor.lockedType && user.roles.includes('requester')) {
        captureEditor();
        editor.type = Object.keys(TYPES).find((key) => TYPES[key].category === button.dataset.category) || editor.type;
        editor.fields = {};
        editor.dirty = true;
        editor.error = '';
        render();
      } else if (action === 'remove-file' && editor && user.roles.includes('requester')) {
        editor.pendingFiles = editor.pendingFiles.filter((item) => item.id !== button.dataset.id);
        editor.attachments = editor.attachments.filter((item) => item.id !== button.dataset.id);
        editor.dirty = true;
        $('editor-files').innerHTML = attachmentEditorMarkup();
      } else if (action === 'save-draft' && editor) {
        busy = true;
        button.disabled = true;
        try { await saveRequest(true); } catch (error) { formError(error.message); }
        finally { busy = false; if (button.isConnected) button.disabled = false; }
      } else if (action === 'read-all') {
        await mutate((data) => { data.readBy[user.id] = notifications().map((item) => item.key); });
        render();
      } else if (action === 'all-notifications' || action === 'unread-notifications') {
        filters.status = action === 'unread-notifications' ? 'unread' : 'all';
        render();
      } else if (action === 'notification') {
        const request = db.requests.find((item) => item.uid === button.dataset.id);
        if (!request || !canRead(request)) { showToast('Pengajuan tidak tersedia untuk akun ini.'); return; }
        await mutate((data) => {
          const read = Array.isArray(data.readBy[user.id]) ? data.readBy[user.id] : [];
          data.readBy[user.id] = [...new Set([...read, button.dataset.key])];
        });
        render();
        openReview(request.uid);
      }
    } catch (error) { showToast(error.message || 'Tindakan belum berhasil. Silakan coba lagi.'); }
  }

  document.addEventListener('click', handleClick);
  document.addEventListener('submit', (event) => {
    if (event.target.id === 'login-form') {
      event.preventDefault();
      const identity = $('login-identity').value.trim().toLowerCase();
      const account = USERS.find((person) => person.id.toLowerCase() === identity || person.email.toLowerCase() === identity);
      if (!account || account.password !== $('login-password').value) {
        $('login-error').textContent = 'NIP/email atau kata sandi tidak sesuai. Periksa kembali akun Anda.';
        $('login-error').hidden = false;
        $('login-password').value = '';
        $('login-password').focus();
        return;
      }
      user = account;
      try { sessionStorage.setItem(SESSION_KEY, account.id); } catch { showToast('Sesi hanya berlaku selama halaman terbuka karena penyimpanan sesi tidak tersedia.'); }
      filters = freshFilters();
      setView(defaultView(), true);
    } else if (event.target.id === 'request-form') submitRequest(event);
    else if (event.target.id === 'decision-form') submitDecision(event);
  });
  document.addEventListener('input', (event) => {
    if (event.target.closest('#request-form') && editor && event.target.id !== 'request-files') {
      event.target.setCustomValidity('');
      captureEditor();
      editor.dirty = true;
      formError('');
    }
    if (event.target.id === 'search') { filters.search = event.target.value; updateTable(); }
    if (event.target.id === 'decision-note') {
      event.target.setCustomValidity('');
      event.target.removeAttribute('aria-invalid');
      $('note-count').textContent = event.target.value.length.toLocaleString('id-ID');
      $('decision-error').hidden = true;
    }
  });
  document.addEventListener('change', (event) => {
    const id = event.target.id;
    if (id === 'request-type' && editor && !editor.lockedType && Object.hasOwn(TYPES, event.target.value)) {
      captureEditor();
      editor.type = event.target.value;
      editor.fields = {};
      editor.dirty = true;
      editor.error = '';
      render();
    } else if (id === 'request-files') addFiles(Array.from(event.target.files)).catch((error) => formError(error.message));
    else if (['type-filter', 'status-filter', 'date-filter', 'sort-order'].includes(id)) {
      filters[({ 'type-filter': 'type', 'status-filter': 'status', 'date-filter': 'date', 'sort-order': 'order' })[id]] = event.target.value;
      updateTable();
    }
  });
  document.addEventListener('dragover', (event) => {
    const area = event.target.closest('#upload-area');
    if (area) { event.preventDefault(); area.classList.add('is-dragging'); }
  });
  document.addEventListener('dragleave', (event) => {
    const area = event.target.closest('#upload-area');
    if (area && !area.contains(event.relatedTarget)) area.classList.remove('is-dragging');
  });
  document.addEventListener('drop', (event) => {
    const area = event.target.closest('#upload-area');
    if (area) { event.preventDefault(); area.classList.remove('is-dragging'); addFiles(Array.from(event.dataTransfer.files)).catch((error) => formError(error.message)); }
  });
  document.addEventListener('keydown', (event) => {
    if (event.target.matches('label[for="request-files"]') && ['Enter', ' '].includes(event.key)) { event.preventDefault(); $('request-files').click(); }
    const tab = event.target.closest('[role="tab"]');
    if (tab && ['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) {
      event.preventDefault();
      const tabs = [...tab.closest('[role="tablist"]').querySelectorAll('[role="tab"]')];
      const index = tabs.indexOf(tab);
      const target = event.key === 'Home' ? 0 : event.key === 'End' ? tabs.length - 1 : (index + (event.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length;
      tabs[target].click();
      return;
    }
    const sidebar = $('sidebar');
    if (!sidebar?.classList.contains('is-open')) return;
    if (event.key === 'Escape') { event.preventDefault(); setNavigation(false); }
    if (event.key === 'Tab') {
      const focusable = [...sidebar.querySelectorAll('a,button')].filter((element) => element.getClientRects().length);
      const first = focusable[0], last = focusable.at(-1);
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    }
  });
  $('dismiss-toast').addEventListener('click', () => { clearTimeout(toastTimer); $('toast').hidden = true; });
  document.querySelector('.skip-link').addEventListener('click', (event) => { event.preventDefault(); $('main-content')?.focus(); });
  mobileQuery.addEventListener('change', () => setNavigation(false));
  window.addEventListener('hashchange', () => {
    const target = location.hash.replace(/^#\/?/, '');
    if (view === 'new' && editor?.dirty && target !== 'new') { history.replaceState(null, '', '#/new'); navigate(target); }
    else {
      if (view === 'new' && target !== 'new') editor = null;
      setView(target, true);
    }
  });
  window.addEventListener('beforeunload', (event) => { if (editor?.dirty) { event.preventDefault(); event.returnValue = ''; } });
  window.addEventListener('storage', (event) => {
    if (event.key !== DATA_KEY && event.key !== null) return;
    const baseline = review;
    db = loadDatabase();
    if (baseline) {
      const current = db.requests.find((request) => request.uid === baseline.uid);
      if (!current || current.updatedAt !== baseline.baseline) { closeDialogs(); showToast('Pengajuan diperbarui di tab lain. Buka ulang detail sebelum memberikan keputusan.'); }
    }
    if (user && !busy) render();
  });

  initializeDialogs();
  $('confirm-action').addEventListener('click', async () => {
    if (busy || !confirmCallback) return;
    const callback = confirmCallback;
    busy = true;
    $('confirm-action').disabled = true;
    try {
      const result = await callback();
      if (result !== false && $('confirm-dialog').open) $('confirm-dialog').close('confirmed');
      confirmCallback = null;
    } catch (error) {
      $('confirm-error').textContent = error.message || 'Perubahan belum berhasil disimpan.';
      $('confirm-error').hidden = false;
    } finally { busy = false; $('confirm-action').disabled = false; }
  });
  user = readSession();
  setView(location.hash.replace(/^#\/?/, ''), true);
})();
