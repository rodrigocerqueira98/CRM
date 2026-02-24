/* ============================================================
   CONECTA CRM — app.js
   Motor de dados, autenticação, aprovações e utilitários
   ============================================================ */

'use strict';

/* ── AUTENTICAÇÃO / SESSÃO ───────────────────────────────── */
const Auth = {
  users: [
    { id: 'u1', name: 'Ricardo Almeida',  initials: 'RA', role: 'admin',      email: 'ricardo@conecta.com.br',   color: '#7C3AED' },
    { id: 'u2', name: 'Fernanda Borges',  initials: 'FB', role: 'gestor',     email: 'fernanda@conecta.com.br',  color: '#1D4ED8' },
    { id: 'u3', name: 'Carlos Mendes',    initials: 'CM', role: 'supervisor', email: 'carlos@conecta.com.br',    color: '#059669' },
    { id: 'u4', name: 'Ana Paula Silva',  initials: 'AS', role: 'vendedor',   email: 'ana@conecta.com.br',       color: '#D97706' },
    { id: 'u5', name: 'Bruno Carvalho',   initials: 'BC', role: 'vendedor',   email: 'bruno@conecta.com.br',     color: '#DC2626' },
    { id: 'u6', name: 'Juliana Rocha',    initials: 'JR', role: 'vendedor',   email: 'juliana@conecta.com.br',   color: '#0284C7' },
    { id: 'u7', name: 'Diego Ferreira',   initials: 'DF', role: 'supervisor', email: 'diego@conecta.com.br',     color: '#EA580C' },
  ],

  roleLabels: {
    admin:      'Administrador',
    gestor:     'Gestor',
    supervisor: 'Supervisor',
    vendedor:   'Vendedor',
  },

  rolePermissions: {
    admin:      ['all'],
    gestor:     ['view_all','approve','reject','manage_targets','view_reports'],
    supervisor: ['view_team','approve_small','view_reports','manage_own_team'],
    vendedor:   ['view_own','create_deal','create_request'],
  },

  login(userId) {
    const user = this.users.find(u => u.id === userId);
    if (!user) return false;
    sessionStorage.setItem('crm_user', JSON.stringify(user));
    return true;
  },

  logout() {
    sessionStorage.removeItem('crm_user');
    window.location.href = 'login.html';
  },

  current() {
    const raw = sessionStorage.getItem('crm_user');
    return raw ? JSON.parse(raw) : null;
  },

  require(page) {
    const user = this.current();
    if (!user) { window.location.href = 'login.html'; return null; }
    return user;
  },

  can(perm) {
    const user = this.current();
    if (!user) return false;
    const perms = this.rolePermissions[user.role] || [];
    return perms.includes('all') || perms.includes(perm);
  },

  isManagerOrAbove() {
    const user = this.current();
    return user && ['admin','gestor','supervisor'].includes(user.role);
  },
};

/* ── DADOS: PLANOS ───────────────────────────────────────── */
const Plans = {
  fiber: [
    { id: 'f200', name: 'Fibra 200 Mbps', speed: '200', type: 'fiber', price: 89.90,  features: ['Wi-Fi 6 incluso','Suporte 24h','Instalação grátis'] },
    { id: 'f400', name: 'Fibra 400 Mbps', speed: '400', type: 'fiber', price: 119.90, features: ['Wi-Fi 6 incluso','Suporte 24h','IP fixo opcional'] },
    { id: 'f1g',  name: 'Fibra 1 Gbps',   speed: '1000',type: 'fiber', price: 169.90, features: ['Wi-Fi 6 PRO','SLA 99.5%','IP fixo incluso','Suporte VIP'] },
  ],
  mobile: [
    { id: 'm15', name: 'Móvel 15GB',   speed: '15GB',  type: 'mobile', price: 49.90,  features: ['4G/5G','Ligações ilimitadas','SMS ilimitado'] },
    { id: 'm40', name: 'Móvel 40GB',   speed: '40GB',  type: 'mobile', price: 69.90,  features: ['4G/5G','Ligações ilimitadas','Roaming nacional'] },
    { id: 'm100',name: 'Móvel 100GB',  speed: '100GB', type: 'mobile', price: 99.90,  features: ['4G/5G PRO','Ligações/SMS ilimitados','Tethering','App gerenciamento'] },
  ],
  b2b: [
    { id: 'b500', name: 'Empresarial 500M', speed: '500',  type: 'b2b', price: 299.90, features: ['IP fixo incluso','SLA 99.8%','Link dedicado','Suporte técnico 24h'] },
    { id: 'b1g',  name: 'Empresarial 1G',   speed: '1000', type: 'b2b', price: 499.90, features: ['IP fixo incluso','SLA 99.9%','Link dedicado','Gerente de conta'] },
    { id: 'b10g', name: 'Datacenter 10G',   speed: '10000',type: 'b2b', price: 1899.90,features: ['IP /29 incluso','SLA 99.99%','Fibra dedicada','NOC 24h'] },
  ],
};

/* ── DADOS: CLIENTES ─────────────────────────────────────── */
const Customers = {
  list: [
    { id: 'cli001', type: 'pj', name: 'Grupo Nortec Ltda',         doc: '12.345.678/0001-90', plan: 'b1g',  status: 'active',   mrr: 499.90, since: '2023-04-12', seller: 'u4', address: 'Av. Paulista, 1000 - SP', phone: '(11) 3000-1234', email: 'ti@nortec.com.br',   segment: 'enterprise' },
    { id: 'cli002', type: 'pf', name: 'Marcos Vinicius Santana',   doc: '234.567.890-12',     plan: 'f400', status: 'active',   mrr: 119.90, since: '2024-01-08', seller: 'u5', address: 'Rua das Flores, 45 - SP', phone: '(11) 98765-4321', email: 'marcos.v@gmail.com', segment: 'residencial' },
    { id: 'cli003', type: 'pj', name: 'Farmácia Saúde Total',      doc: '98.765.432/0001-12', plan: 'f400', status: 'pending',  mrr: 119.90, since: '2024-07-01', seller: 'u6', address: 'Rua Central, 300 - SP',   phone: '(11) 3200-5678', email: 'contato@saudetotal.com', segment: 'pme' },
    { id: 'cli004', type: 'pj', name: 'Construtora Alfa',          doc: '23.456.789/0001-34', plan: 'b500', status: 'active',   mrr: 299.90, since: '2023-09-15', seller: 'u4', address: 'Av. Industrial, 500 - SP', phone: '(11) 3100-9090', email: 'infra@alfa.com.br',  segment: 'enterprise' },
    { id: 'cli005', type: 'pf', name: 'Carla Fernandes Lima',      doc: '345.678.901-23',     plan: 'f200', status: 'inactive', mrr: 89.90,  since: '2022-11-20', seller: 'u5', address: 'Rua dos Lagos, 12 - SP',  phone: '(11) 97654-3210', email: 'carla.lima@hotmail.com', segment: 'residencial' },
    { id: 'cli006', type: 'pj', name: 'TechStart Soluções',        doc: '34.567.890/0001-56', plan: 'b1g',  status: 'active',   mrr: 499.90, since: '2024-03-10', seller: 'u6', address: 'Alameda Santos, 200 - SP', phone: '(11) 4000-2222', email: 'dev@techstart.io',   segment: 'enterprise' },
    { id: 'cli007', type: 'pf', name: 'Roberto Assis Nunes',       doc: '456.789.012-34',     plan: 'm40',  status: 'active',   mrr: 69.90,  since: '2024-05-17', seller: 'u4', address: 'Rua Aurora, 88 - SP',     phone: '(11) 99000-1111', email: 'roberto.n@outlook.com', segment: 'residencial' },
    { id: 'cli008', type: 'pj', name: 'Rede Educar Escolas',       doc: '45.678.901/0001-78', plan: 'b500', status: 'active',   mrr: 299.90, since: '2023-12-01', seller: 'u5', address: 'Av. Educação, 100 - SP',   phone: '(11) 3400-0000', email: 'ti@rededucar.com.br', segment: 'enterprise' },
    { id: 'cli009', type: 'pf', name: 'Patricia Oliveira Santos',  doc: '567.890.123-45',     plan: 'f1g',  status: 'active',   mrr: 169.90, since: '2024-06-05', seller: 'u6', address: 'Rua Progresso, 55 - SP',  phone: '(11) 98888-2222', email: 'pat.santos@gmail.com', segment: 'residencial' },
    { id: 'cli010', type: 'pj', name: 'Grupo Mega Distribuidora',  doc: '56.789.012/0001-90', plan: 'b10g', status: 'active',   mrr: 1899.90,since: '2022-08-30', seller: 'u4', address: 'Rod. Anhanguera km 32 - SP', phone: '(11) 3500-7777', email: 'rede@megadist.com.br', segment: 'enterprise' },
  ],
};

/* ── DADOS: PIPELINE / NEGÓCIOS ──────────────────────────── */
const Deals = {
  columns: [
    { id: 'lead',       title: 'Lead',        color: '#A78BFA' },
    { id: 'qualif',     title: 'Qualificado', color: '#3B82F6' },
    { id: 'proposta',   title: 'Proposta',    color: '#F59E0B' },
    { id: 'negociacao', title: 'Negociação',  color: '#EA580C' },
    { id: 'fechado',    title: 'Fechado',     color: '#059669' },
    { id: 'perdido',    title: 'Perdido',     color: '#DC2626' },
  ],
  list: [
    { id: 'd01', title: 'Nortec — Upgrade 10G',      company: 'Grupo Nortec',       column: 'negociacao', value: 22799,  prob: 75, plan: 'b10g', seller: 'u4', phone: '(11) 3000-1234', note: 'Decisor técnico aprovado, aguardando CFO.' },
    { id: 'd02', title: 'Farmácia Saúde Total — Fibra 400', company: 'Farmácia Saúde',  column: 'proposta',  value: 1439,   prob: 60, plan: 'f400', seller: 'u6', phone: '(11) 3200-5678', note: 'Precisa de desconto de 10% para fechar.' },
    { id: 'd03', title: 'TechStart — Plano B2B 1G',  company: 'TechStart Soluções', column: 'qualif',    value: 5999,   prob: 45, plan: 'b1g',  seller: 'u6', phone: '(11) 4000-2222', note: 'Interesse confirmado, fazendo levantamento interno.' },
    { id: 'd04', title: 'João Alves — Fibra 1G',     company: 'Residencial',        column: 'lead',      value: 2039,   prob: 30, plan: 'f1g',  seller: 'u5', phone: '(11) 91234-5678', note: 'Primeiro contato via site.' },
    { id: 'd05', title: 'Escola Municipal Centro — Internet', company: 'Educ. Municipal', column: 'proposta', value: 3599, prob: 55, plan: 'b500', seller: 'u4', phone: '(11) 3300-8888', note: 'Licitação prevista para o mês que vem.' },
    { id: 'd06', title: 'Distribuidora União — 10G', company: 'União Dist.',        column: 'negociacao', value: 22799, prob: 80, plan: 'b10g', seller: 'u5', phone: '(11) 3600-0000', note: 'Contrato em revisão jurídica.' },
    { id: 'd07', title: 'Maria Silva — Móvel 100GB', company: 'Residencial',        column: 'fechado',   value: 1199,   prob: 100, plan: 'm100', seller: 'u6', phone: '(11) 97777-8888', note: 'Contrato assinado 15/07.' },
    { id: 'd08', title: 'Hotel Central — B2B 500M',  company: 'Hotel Central',      column: 'lead',      value: 3599,   prob: 25, plan: 'b500', seller: 'u4', phone: '(11) 3800-0000', note: 'Renovação de contrato em discussão.' },
    { id: 'd09', title: 'Studio Arq — Fibra 400',    company: 'Studio Arquitetura', column: 'qualif',    value: 1439,   prob: 40, plan: 'f400', seller: 'u5', phone: '(11) 94444-5555', note: '' },
    { id: 'd10', title: 'Petshop Amigo Fiel — Fibra',company: 'Pet Amigo Fiel',     column: 'perdido',   value: 1079,   prob: 0,  plan: 'f200', seller: 'u6', phone: '(11) 93333-2222', note: 'Escolheu concorrente por preço.' },
  ],
};

/* ── DADOS: SOLICITAÇÕES / APROVAÇÕES ────────────────────── */
const Approvals = {
  list: [
    {
      id: 'apr001', type: 'Desconto Especial', status: 'pending',
      sellerId: 'u4', customerId: 'cli002', dealId: 'd02',
      description: 'Desconto de 15% no plano Fibra 400 Mbps por 12 meses. Cliente recebeu oferta da concorrência.',
      requestedValue: 101.92, originalValue: 119.90, planId: 'f400',
      discountPct: 15, duration: 12,
      createdAt: '2025-02-24T09:30:00', updatedAt: '2025-02-24T09:30:00',
      approvedBy: null, approverComment: null,
      priority: 'high', category: 'discount',
    },
    {
      id: 'apr002', type: 'Plano Corporativo Customizado', status: 'pending',
      sellerId: 'u5', customerId: 'cli004', dealId: 'd05',
      description: 'Pacote especial para Escola Municipal: Fibra 500M com desconto progressivo — 10% 1º ano, 5% 2º ano. Volume mínimo de 2 unidades.',
      requestedValue: 269.91, originalValue: 299.90, planId: 'b500',
      discountPct: 10, duration: 24,
      createdAt: '2025-02-23T14:15:00', updatedAt: '2025-02-23T14:15:00',
      approvedBy: null, approverComment: null,
      priority: 'medium', category: 'custom_plan',
    },
    {
      id: 'apr003', type: 'Isenção de Taxa de Instalação', status: 'approved',
      sellerId: 'u6', customerId: 'cli003', dealId: 'd03',
      description: 'Isentar taxa de instalação de R$ 299,00 para TechStart. Cliente já possui infraestrutura adequada e fechamento depende disso.',
      requestedValue: 0, originalValue: 299.00, planId: 'b1g',
      discountPct: 100, duration: 0,
      createdAt: '2025-02-22T11:00:00', updatedAt: '2025-02-22T16:30:00',
      approvedBy: 'u2', approverComment: 'Aprovado. Valor estratégico do cliente justifica. Registrar no CRM.',
      priority: 'low', category: 'fee_waiver',
    },
    {
      id: 'apr004', type: 'Prorrogação de Fidelidade', status: 'rejected',
      sellerId: 'u4', customerId: 'cli010', dealId: 'd01',
      description: 'Cliente Mega Distribuidora solicita redução do prazo de fidelidade de 24 para 12 meses para o upgrade 10G.',
      requestedValue: 1899.90, originalValue: 1899.90, planId: 'b10g',
      discountPct: 0, duration: 12,
      createdAt: '2025-02-21T16:00:00', updatedAt: '2025-02-22T09:00:00',
      approvedBy: 'u2', approverComment: 'Não aprovado. Política mínima de 18 meses para planos 10G. Verificar alternativas.',
      priority: 'high', category: 'contract',
    },
    {
      id: 'apr005', type: 'Migração de Plano Sem Multa', status: 'review',
      sellerId: 'u5', customerId: 'cli005', dealId: null,
      description: 'Cliente Carla Lima deseja migrar de Fibra 200 para Fibra 400 sem pagar multa de fidelidade (restam 4 meses de contrato). Motivo: necessidade de aumento de velocidade por home office.',
      requestedValue: 119.90, originalValue: 89.90, planId: 'f400',
      discountPct: 0, duration: 0,
      createdAt: '2025-02-24T08:00:00', updatedAt: '2025-02-24T10:00:00',
      approvedBy: null, approverComment: 'Aguardando análise do contrato original pelo jurídico.',
      priority: 'medium', category: 'migration',
    },
    {
      id: 'apr006', type: 'Crédito de Serviço', status: 'pending',
      sellerId: 'u6', customerId: 'cli001', dealId: null,
      description: 'Grupo Nortec reportou 4 horas de indisponibilidade em 20/02. Conforme SLA, solicito crédito de R$ 199,96 (1/150 do MRR) na fatura de março.',
      requestedValue: 199.96, originalValue: 499.90, planId: 'b1g',
      discountPct: 0, duration: 0,
      createdAt: '2025-02-24T11:30:00', updatedAt: '2025-02-24T11:30:00',
      approvedBy: null, approverComment: null,
      priority: 'high', category: 'credit',
    },
  ],

  statusLabel: {
    pending:  'Aguardando',
    approved: 'Aprovado',
    rejected: 'Rejeitado',
    review:   'Em Análise',
  },
  statusClass: {
    pending:  'badge-warning',
    approved: 'badge-success',
    rejected: 'badge-danger',
    review:   'badge-blue',
  },
  categoryLabel: {
    discount:    'Desconto',
    custom_plan: 'Plano Customizado',
    fee_waiver:  'Isenção de Taxa',
    contract:    'Condição Contratual',
    migration:   'Migração sem Multa',
    credit:      'Crédito de Serviço',
  },
};

/* ── DADOS: METAS ────────────────────────────────────────── */
const Goals = {
  current: [
    { id: 'g1', seller: 'u4', name: 'Receita Nova',      target: 8000,  current: 5840, unit: 'R$',   period: 'Fev/2025', color: '#2563EB' },
    { id: 'g2', seller: 'u4', name: 'Contratos Fibra',   target: 12,    current: 9,    unit: 'contr', period: 'Fev/2025', color: '#059669' },
    { id: 'g3', seller: 'u4', name: 'NPS',               target: 70,    current: 74,   unit: 'pts',  period: 'Fev/2025', color: '#7C3AED' },
    { id: 'g4', seller: 'u5', name: 'Receita Nova',      target: 8000,  current: 6200, unit: 'R$',   period: 'Fev/2025', color: '#2563EB' },
    { id: 'g5', seller: 'u5', name: 'Contratos Fibra',   target: 12,    current: 11,   unit: 'contr', period: 'Fev/2025', color: '#059669' },
    { id: 'g6', seller: 'u6', name: 'Receita Nova',      target: 8000,  current: 3200, unit: 'R$',   period: 'Fev/2025', color: '#2563EB' },
    { id: 'g7', seller: 'u6', name: 'Contratos Móvel',   target: 20,    current: 8,    unit: 'contr', period: 'Fev/2025', color: '#D97706' },
  ],
  team: [
    { month: 'Set/24', target: 40000, achieved: 36800 },
    { month: 'Out/24', target: 42000, achieved: 44200 },
    { month: 'Nov/24', target: 42000, achieved: 38900 },
    { month: 'Dez/24', target: 45000, achieved: 50100 },
    { month: 'Jan/25', target: 38000, achieved: 41200 },
    { month: 'Fev/25', target: 40000, achieved: 15240 },
  ],
};

/* ── DADOS: FINANCEIRO ───────────────────────────────────── */
const Finance = {
  mrr: 38420,
  arr: 461040,
  churn: 2.1,
  arpu: 268.5,
  newMrr: 4820,
  churnedMrr: 890,
  history: [
    { month: 'Set', mrr: 31200, new: 3400, churned: 420 },
    { month: 'Out', mrr: 33100, new: 3800, churned: 390 },
    { month: 'Nov', mrr: 34200, new: 2900, churned: 510 },
    { month: 'Dez', mrr: 36400, new: 4100, churned: 480 },
    { month: 'Jan', mrr: 37490, new: 3200, churned: 360 },
    { month: 'Fev', mrr: 38420, new: 4820, churned: 890 },
  ],
  invoices: [
    { id: 'NF0821', customer: 'Grupo Mega Distribuidora', value: 1899.90, due: '2025-03-05', status: 'open',    plan: 'b10g' },
    { id: 'NF0822', customer: 'Grupo Nortec Ltda',        value: 499.90,  due: '2025-03-05', status: 'open',    plan: 'b1g' },
    { id: 'NF0823', customer: 'TechStart Soluções',       value: 499.90,  due: '2025-03-05', status: 'open',    plan: 'b1g' },
    { id: 'NF0818', customer: 'Construtora Alfa',         value: 299.90,  due: '2025-02-05', status: 'paid',    plan: 'b500' },
    { id: 'NF0819', customer: 'Rede Educar Escolas',      value: 299.90,  due: '2025-02-05', status: 'paid',    plan: 'b500' },
    { id: 'NF0815', customer: 'Carla Fernandes Lima',     value: 89.90,   due: '2025-01-20', status: 'overdue', plan: 'f200' },
    { id: 'NF0817', customer: 'Patricia Oliveira Santos', value: 169.90,  due: '2025-02-15', status: 'paid',    plan: 'f1g' },
  ],
};

/* ── DADOS: ATIVIDADES / TIMELINE ────────────────────────── */
const Activities = [
  { id: 'act1', type: 'deal_won',  user: 'u6', text: 'Fechou contrato Móvel 100GB — Maria Silva',           time: '10min',  color: '#059669' },
  { id: 'act2', type: 'approval',  user: 'u2', text: 'Aprovou isenção de instalação para TechStart',       time: '45min',  color: '#2563EB' },
  { id: 'act3', type: 'call',      user: 'u4', text: 'Ligação com CFO do Grupo Nortec — upgrade 10G',       time: '1h 20m', color: '#7C3AED' },
  { id: 'act4', type: 'proposal',  user: 'u5', text: 'Enviou proposta para Distribuidora União',           time: '2h',     color: '#F59E0B' },
  { id: 'act5', type: 'request',   user: 'u6', text: 'Criou solicitação de crédito — Grupo Nortec SLA',    time: '3h',     color: '#0284C7' },
  { id: 'act6', type: 'install',   user: 'u3', text: 'Agendou instalação Fibra 1G — Patricia Oliveira',   time: '5h',     color: '#059669' },
  { id: 'act7', type: 'rejection', user: 'u2', text: 'Recusou redução de fidelidade — Mega Distribuidora', time: 'ontem',  color: '#DC2626' },
];

/* ── UTILITÁRIOS ─────────────────────────────────────────── */
const Utils = {
  currency(v, compact = false) {
    if (compact) {
      if (v >= 1000000) return `R$ ${(v/1000000).toFixed(1)}M`;
      if (v >= 1000) return `R$ ${(v/1000).toFixed(1)}k`;
    }
    return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  },

  pct(v, d = 1) { return `${v.toFixed(d)}%`; },

  dateStr(iso) {
    return new Date(iso).toLocaleDateString('pt-BR', { day:'2-digit', month:'2-digit', year:'2-digit', hour:'2-digit', minute:'2-digit' });
  },

  dateBR(iso) {
    return new Date(iso).toLocaleDateString('pt-BR');
  },

  $(sel, ctx = document) { return ctx.querySelector(sel); },
  $$(sel, ctx = document) { return [...ctx.querySelectorAll(sel)]; },

  html(str) {
    const t = document.createElement('template');
    t.innerHTML = str.trim();
    return t.content.firstElementChild;
  },

  debounce(fn, ms) {
    let t; return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); };
  },

  toast(msg, type = 'info', duration = 3500) {
    let container = document.getElementById('toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toast-container';
      container.className = 'toast-container';
      document.body.appendChild(container);
    }
    const icons = { success: 'fa-check-circle', error: 'fa-times-circle', warning: 'fa-exclamation-triangle', info: 'fa-info-circle' };
    const t = Utils.html(`
      <div class="toast ${type}">
        <i class="fa-solid ${icons[type] || icons.info}"></i>
        <span>${msg}</span>
      </div>
    `);
    container.appendChild(t);
    setTimeout(() => t.remove(), duration);
  },

  modal(id) {
    const el = document.getElementById(id);
    return {
      open:  () => el?.classList.add('open'),
      close: () => el?.classList.remove('open'),
    };
  },

  getUserById(id) { return Auth.users.find(u => u.id === id); },

  planName(planId) {
    for (const cat of Object.values(Plans)) {
      const p = cat.find(x => x.id === planId);
      if (p) return p.name;
    }
    return planId;
  },

  customerName(id) {
    return Customers.list.find(c => c.id === id)?.name || id;
  },

  animateCount(el, target, prefix = '', suffix = '') {
    const duration = 900;
    const start = Date.now();
    const tick = () => {
      const p = Math.min((Date.now() - start) / duration, 1);
      const ease = 1 - Math.pow(1 - p, 3);
      el.textContent = prefix + Math.round(target * ease).toLocaleString('pt-BR') + suffix;
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  },
};

/* ── INICIALIZAÇÃO DA PÁGINA ─────────────────────────────── */
function initPage() {
  const user = Auth.current();
  if (!user && !window.location.pathname.includes('login')) {
    window.location.href = 'login.html';
    return null;
  }
  if (user) {
    // Preenche dados do usuário na sidebar
    const nameEls = document.querySelectorAll('.sidebar-user-name');
    const roleEls = document.querySelectorAll('.sidebar-user-role');
    const initEls = document.querySelectorAll('.sidebar-user-initial');
    nameEls.forEach(el => el.textContent = user.name.split(' ')[0] + ' ' + user.name.split(' ').slice(-1)[0]);
    roleEls.forEach(el => el.textContent = Auth.roleLabels[user.role]);
    initEls.forEach(el => el.textContent = user.initials);
    initEls.forEach(el => el.style.background = user.color);

    // Badge de aprovações pendentes
    const pending = Approvals.list.filter(a => a.status === 'pending').length;
    document.querySelectorAll('.approval-pending-count').forEach(el => {
      el.textContent = pending;
      el.style.display = pending > 0 ? '' : 'none';
    });

    // Mostrar/ocultar elementos por role
    document.querySelectorAll('[data-roles]').forEach(el => {
      const roles = el.dataset.roles.split(',');
      if (!roles.includes(user.role)) el.style.display = 'none';
    });
  }
  return user;
}

/* Fechar modais com Escape */
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    document.querySelectorAll('.modal-overlay.open').forEach(m => m.classList.remove('open'));
  }
});

/* Fechar modal ao clicar no overlay */
document.addEventListener('click', e => {
  if (e.target.classList.contains('modal-overlay')) {
    e.target.classList.remove('open');
  }
});

/* Expose globals */
window.Auth = Auth;
window.Utils = Utils;
window.Plans = Plans;
window.Customers = Customers;
window.Deals = Deals;
window.Approvals = Approvals;
window.Goals = Goals;
window.Finance = Finance;
window.Activities = Activities;
window.initPage = initPage;
