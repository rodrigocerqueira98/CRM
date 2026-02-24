/* sidebar.js — injeta sidebar em todas as páginas */
(function() {
  const page = window.location.pathname.split('/').pop() || 'index.html';

  const nav = [
    { href: 'index.html',       icon: 'fa-chart-pie',         label: 'Dashboard',         group: 'Visão Geral' },
    { href: 'aprovacoes.html',  icon: 'fa-clipboard-check',   label: 'Aprovações',        group: 'Visão Geral', badge: 'approval', roles: ['admin','gestor','supervisor'] },
    { href: 'solicitacoes.html',icon: 'fa-paper-plane',        label: 'Minhas Solicitações', group: 'Visão Geral', roles: ['vendedor'] },
    { href: 'funil.html',       icon: 'fa-filter',            label: 'Funil de Vendas',   group: 'Comercial' },
    { href: 'clientes.html',    icon: 'fa-users',             label: 'Base de Clientes',  group: 'Comercial' },
    { href: 'clientes-cadastro.html', icon:'fa-user-plus',    label: 'Novo Cliente',      group: 'Comercial' },
    { href: 'metas.html',       icon: 'fa-bullseye',          label: 'Metas & Comissões', group: 'Comercial' },
    { href: 'analytics.html',   icon: 'fa-chart-line',        label: 'Análise de Vendas', group: 'Relatórios' },
    { href: 'financeiro.html',  icon: 'fa-file-invoice-dollar',label: 'Financeiro',       group: 'Relatórios' },
    { href: 'configuracoes.html',icon:'fa-gear',              label: 'Configurações',     group: 'Sistema',    roles: ['admin','gestor'] },
  ];

  const user = Auth.current();
  if (!user && !page.includes('login')) {
    window.location.href = 'login.html'; return;
  }

  const pending = Approvals.list.filter(a => a.status === 'pending').length;
  const groups = [...new Set(nav.map(n => n.group))];

  let html = `
    <aside class="sidebar">
      <div class="sidebar-logo">
        <div class="logo-icon"><i class="fa-solid fa-network-wired"></i></div>
        <div class="logo-text">
          <div class="logo-name">Conecta CRM</div>
          <div class="logo-tagline">Telecom & Provedores</div>
        </div>
      </div>
      <div class="sidebar-profile">
        <div class="sidebar-avatar sidebar-user-initial" style="background:${user?.color||'#2563EB'}">${user?.initials||'?'}</div>
        <div class="sidebar-profile-info">
          <div class="user-name sidebar-user-name">${user?.name?.split(' ')[0]||''} ${user?.name?.split(' ').slice(-1)[0]||''}</div>
          <div class="user-role sidebar-user-role">${Auth.roleLabels[user?.role]||''}</div>
        </div>
        <div class="role-badge">${(user?.role||'').toUpperCase()}</div>
      </div>
      <nav>
  `;

  let lastGroup = null;
  for (const item of nav) {
    if (item.roles && !item.roles.includes(user?.role)) continue;
    if (item.group !== lastGroup) {
      html += `<div class="nav-section"><div class="nav-label">${item.group}</div>`;
      lastGroup = item.group;
    }
    const isActive = page === item.href;
    let badgeHtml = '';
    if (item.badge === 'approval' && pending > 0) {
      badgeHtml = `<span class="nav-badge">${pending}</span>`;
    }
    html += `<a href="${item.href}" class="nav-item ${isActive ? 'active' : ''}">
      <i class="fa-solid ${item.icon}"></i>
      <span>${item.label}</span>
      ${badgeHtml}
    </a>`;
  }

  html += `</nav>
    <div class="sidebar-footer">
      <button class="btn-logout" onclick="Auth.logout()">
        <i class="fa-solid fa-right-from-bracket"></i> Sair do Sistema
      </button>
    </div>
  </aside>`;

  document.body.insertAdjacentHTML('afterbegin', html);
})();
