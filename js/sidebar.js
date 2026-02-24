/* sidebar.js — injeta sidebar + toggle mobile em todas as páginas */
(function() {
  const page = window.location.pathname.split('/').pop() || 'index.html';

  const nav = [
    { href: 'index.html',            icon: 'fa-chart-pie',          label: 'Dashboard',           group: 'Visão Geral' },
    { href: 'aprovacoes.html',       icon: 'fa-clipboard-check',    label: 'Aprovações',          group: 'Visão Geral', badge: 'approval', roles: ['admin','gestor','supervisor'] },
    { href: 'solicitacoes.html',     icon: 'fa-paper-plane',        label: 'Minhas Solicitações', group: 'Visão Geral', roles: ['vendedor'] },
    { href: 'funil.html',            icon: 'fa-filter',             label: 'Funil de Vendas',     group: 'Comercial' },
    { href: 'clientes.html',         icon: 'fa-users',              label: 'Base de Clientes',    group: 'Comercial' },
    { href: 'clientes-cadastro.html',icon: 'fa-user-plus',          label: 'Novo Cliente',        group: 'Comercial' },
    { href: 'metas.html',            icon: 'fa-bullseye',           label: 'Metas & Comissões',   group: 'Comercial' },
    { href: 'analytics.html',        icon: 'fa-chart-line',         label: 'Análise de Vendas',   group: 'Relatórios' },
    { href: 'financeiro.html',       icon: 'fa-file-invoice-dollar',label: 'Financeiro',          group: 'Relatórios' },
    { href: 'configuracoes.html',    icon: 'fa-gear',               label: 'Configurações',       group: 'Sistema',    roles: ['admin','gestor'] },
  ];

  const user = Auth.current();
  if (!user && !page.includes('login')) { window.location.href = 'login.html'; return; }

  const pending = Approvals.list.filter(a => a.status === 'pending').length;

  let sideHtml = `
    <aside class="sidebar" id="main-sidebar">
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
          <div class="user-name sidebar-user-name">${(user?.name||'').split(' ')[0]} ${(user?.name||'').split(' ').slice(-1)[0]}</div>
          <div class="user-role sidebar-user-role">${Auth.roleLabels[user?.role]||''}</div>
        </div>
        <div class="role-badge">${(user?.role||'').toUpperCase()}</div>
      </div>
      <nav>`;

  let lastGroup = null;
  for (const item of nav) {
    if (item.roles && !item.roles.includes(user?.role)) continue;
    if (item.group !== lastGroup) {
      if (lastGroup !== null) sideHtml += `</div>`;
      sideHtml += `<div class="nav-section"><div class="nav-label">${item.group}</div>`;
      lastGroup = item.group;
    }
    const isActive = page === item.href;
    const badge = (item.badge === 'approval' && pending > 0) ? `<span class="nav-badge">${pending}</span>` : '';
    sideHtml += `<a href="${item.href}" class="nav-item ${isActive?'active':''}">`
              + `<i class="fa-solid ${item.icon}"></i><span>${item.label}</span>${badge}</a>`;
  }
  if (lastGroup !== null) sideHtml += `</div>`;

  sideHtml += `
      </nav>
      <div class="sidebar-footer">
        <button class="btn-logout" onclick="Auth.logout()">
          <i class="fa-solid fa-right-from-bracket"></i> Sair do Sistema
        </button>
      </div>
    </aside>
    <div class="sidebar-backdrop" id="sidebar-backdrop"></div>`;

  document.body.insertAdjacentHTML('afterbegin', sideHtml);

  /* ── Mobile toggle (injetado no topbar após DOMContentLoaded) ── */
  function injectToggle() {
    const topbar = document.querySelector('.topbar');
    if (!topbar) return;

    /* Hamburger */
    const toggle = document.createElement('button');
    toggle.className = 'sidebar-toggle';
    toggle.setAttribute('aria-label', 'Menu');
    toggle.innerHTML = '<i class="fa-solid fa-bars"></i>';
    topbar.insertBefore(toggle, topbar.firstChild);

    /* Lupa mobile */
    const searchToggle = document.createElement('button');
    searchToggle.className = 'search-toggle';
    searchToggle.setAttribute('aria-label', 'Buscar');
    searchToggle.innerHTML = '<i class="fa-solid fa-search"></i>';
    const actions = topbar.querySelector('.topbar-actions');
    if (actions) actions.insertBefore(searchToggle, actions.firstChild);

    const sidebar  = document.getElementById('main-sidebar');
    const backdrop = document.getElementById('sidebar-backdrop');

    function openSidebar()  { sidebar.classList.add('open');    backdrop.classList.add('show');    document.body.style.overflow='hidden'; }
    function closeSidebar() { sidebar.classList.remove('open'); backdrop.classList.remove('show'); document.body.style.overflow=''; }

    toggle.addEventListener('click', () => sidebar.classList.contains('open') ? closeSidebar() : openSidebar());
    backdrop.addEventListener('click', closeSidebar);
    sidebar.querySelectorAll('.nav-item').forEach(a => a.addEventListener('click', () => { if(window.innerWidth<=768) closeSidebar(); }));
    window.addEventListener('resize', () => { if(window.innerWidth>768) closeSidebar(); });

    /* Swipe para fechar */
    let tx = 0;
    sidebar.addEventListener('touchstart', e => { tx = e.touches[0].clientX; }, {passive:true});
    sidebar.addEventListener('touchend',   e => { if(tx - e.changedTouches[0].clientX > 60) closeSidebar(); }, {passive:true});

    /* Lupa expande search */
    const searchWrap = topbar.querySelector('.topbar-search');
    if (searchWrap) {
      searchToggle.addEventListener('click', () => {
        searchWrap.classList.toggle('visible');
        if (searchWrap.classList.contains('visible')) searchWrap.querySelector('input')?.focus();
      });
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', injectToggle);
  else setTimeout(injectToggle, 0);
})();
