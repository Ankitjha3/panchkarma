/* ===================================================
   SHARED COMPONENTS — Reusable UI components
   Renders sidebar, navbar, notifications, calendar
   Uses Lucide icons (loaded via CDN in HTML)
   =================================================== */

/**
 * SVG icon helper — returns Lucide icon markup
 * @param {string} name - Lucide icon name
 * @param {number} size - icon size in px (default 18)
 */
function icon(name, size = 18) {
  return `<i data-lucide="${name}" style="width:${size}px;height:${size}px;"></i>`;
}

/**
 * Reinitialize Lucide icons after dynamic content injection
 */
function refreshIcons() {
  if (typeof lucide !== 'undefined') {
    lucide.createIcons();
  }
}

/**
 * Render the sidebar navigation
 * @param {string} role - 'patient' | 'practitioner' | 'admin'
 * @param {string} activePage - current active page identifier
 */
function renderSidebar(role, activePage) {
  const user = getCurrentUser();
  const initials = user ? user.displayName.split(' ').map(n => n[0]).join('').toUpperCase() : 'U';

  const navItems = {
    patient: [
      { section: 'Overview', items: [
        { id: 'overview', icon: 'layout-dashboard', label: 'Dashboard' },
        { id: 'practitioners', icon: 'users', label: 'Practitioners' },
        { id: 'book', icon: 'search', label: 'Book Therapy' },
        { id: 'sessions', icon: 'calendar-days', label: 'My Sessions' },
        { id: 'analytics', icon: 'line-chart', label: 'Analytics' },
        { id: 'feedback', icon: 'star', label: 'Feedback' }
      ]}
    ],
    practitioner: [
      { section: 'Overview', items: [
        { id: 'overview', icon: 'layout-dashboard', label: 'Dashboard' }
      ]},
      { section: 'Management', items: [
        { id: 'schedule', icon: 'calendar-plus', label: 'Daily Schedule' },
        { id: 'patients', icon: 'users', label: 'My Patients' },
        { id: 'messages', icon: 'message-square', label: 'Messages' },
        { id: 'feedback', icon: 'star', label: 'Patient Feedback' }
      ]}
    ],
    admin: [
      { section: 'Overview', items: [
        { id: 'overview', icon: 'layout-dashboard', label: 'Dashboard' },
        { id: 'analytics', icon: 'bar-chart-3', label: 'Clinic Analytics' },
      ]}
    ]
  };

  const items = navItems[role] || navItems.patient;

  let html = `
    <a href="index.html" class="sidebar-header" style="text-decoration:none;color:inherit;">
      <div class="sidebar-logo-icon">${icon('leaf', 18)}</div>
      <div class="sidebar-logo-text">Pancha<span>karma</span></div>
    </a>
    <nav class="sidebar-nav">
      <div class="sidebar-section">
        <a href="index.html" class="sidebar-link" style="text-decoration:none;color:inherit;">
          <span class="sidebar-link-icon">${icon('home', 18)}</span>
          Home
        </a>
      </div>
  `;

  items.forEach(section => {
    html += `<div class="sidebar-section">
      <div class="sidebar-section-label">${section.section}</div>`;
    section.items.forEach(item => {
      const isActive = item.id === activePage ? ' active' : '';
      html += `
        <button class="sidebar-link${isActive}" data-page="${item.id}" onclick="handleNavClick('${item.id}')">
          <span class="sidebar-link-icon">${icon(item.icon, 18)}</span>
          ${item.label}
        </button>`;
    });
    html += '</div>';
  });

  html += `
    </nav>
    <div class="sidebar-footer">
      <div class="sidebar-user">
        <div class="sidebar-user-avatar">${initials}</div>
        <div class="sidebar-user-info">
          <div class="sidebar-user-name">${user ? user.displayName : 'User'}</div>
          <div class="sidebar-user-role">${role}</div>
        </div>
      </div>
      <button class="sidebar-logout" onclick="logout()">
        <span>${icon('log-out', 16)}</span> Log Out
      </button>
    </div>
  `;

  document.getElementById('sidebar').innerHTML = html;
  refreshIcons();
}

/**
 * Render top navbar
 */
function renderTopNavbar(pageTitle, pageSubtitle) {
  const html = `
    <div class="top-navbar-left">
      <button class="mobile-sidebar-toggle" onclick="toggleSidebar()" aria-label="Toggle sidebar">
        ${icon('menu', 20)}
      </button>
      <div>
        <div class="page-title">${pageTitle}</div>
        ${pageSubtitle ? `<div class="page-subtitle">${pageSubtitle}</div>` : ''}
      </div>
    </div>
    <div class="top-navbar-right">
      <div class="navbar-search">
        <span class="navbar-search-icon">${icon('search', 14)}</span>
        <input type="text" placeholder="Search..." id="navSearch">
      </div>
      <div style="position:relative; margin-right: var(--space-2);">
        <button class="notification-btn" onclick="handleNavClick('messages')" id="msgNavBtn" aria-label="Messages">
          ${icon('message-square', 20)}
        </button>
      </div>
      <div style="position:relative;">
        <button class="notification-btn" onclick="toggleNotifications()" id="notifBtn" aria-label="Notifications">
          ${icon('bell', 20)}
          <span class="notification-dot" id="notifDot" style="display:none;"></span>
        </button>
        <div class="notification-dropdown" id="notifDropdown">
          ${renderNotificationDropdown()}
        </div>
      </div>
    </div>
  `;
  document.getElementById('topNavbar').innerHTML = html;
  refreshIcons();
}

/**
 * Render notification dropdown — empty state when no data
 */
function renderNotificationDropdown() {
  return `
    <div class="notification-dropdown-header">
      <h3>Notifications</h3>
      <button class="panel-action" onclick="markAllRead()">Mark all read</button>
    </div>
    <div class="notification-list" id="notificationList">
      <div class="empty-state-small">
        <p style="padding:var(--space-8) var(--space-5);text-align:center;color:var(--color-text-muted);font-size:var(--text-sm);">
          No notifications yet
        </p>
      </div>
    </div>
  `;
}

/**
 * Add a notification dynamically
 */
function addNotification(iconName, iconClass, text) {
  const list = document.getElementById('notificationList');
  if (!list) return;

  // Remove empty state if present
  const emptyState = list.querySelector('.empty-state-small');
  if (emptyState) emptyState.remove();

  // Show notification dot
  const dot = document.getElementById('notifDot');
  if (dot) dot.style.display = 'block';

  const now = new Date();
  const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const item = document.createElement('div');
  item.className = 'notification-item unread';
  item.innerHTML = `
    <div class="notification-icon ${iconClass}">${icon(iconName, 16)}</div>
    <div class="notification-text">
      <p>${text}</p>
      <span class="notification-time">${timeStr}</span>
    </div>
  `;
  list.prepend(item);
  refreshIcons();
}

function markAllRead() {
  document.querySelectorAll('.notification-item.unread').forEach(item => {
    item.classList.remove('unread');
  });
  const dot = document.getElementById('notifDot');
  if (dot) dot.style.display = 'none';
}

/**
 * Render mini calendar
 */
function renderMiniCalendar(containerId, sessionDays) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const today = now.getDate();

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];
  const dayLabels = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrev = new Date(year, month, 0).getDate();

  // Default: no session days unless passed
  sessionDays = sessionDays || [];

  let html = `
    <div class="calendar-header">
      <span class="calendar-title">${monthNames[month]} ${year}</span>
      <div class="calendar-nav">
        <button aria-label="Previous month">${icon('chevron-left', 14)}</button>
        <button aria-label="Next month">${icon('chevron-right', 14)}</button>
      </div>
    </div>
    <div class="calendar-grid">
  `;

  dayLabels.forEach(d => {
    html += `<div class="calendar-day-label">${d}</div>`;
  });

  for (let i = firstDay - 1; i >= 0; i--) {
    html += `<div class="calendar-day other-month">${daysInPrev - i}</div>`;
  }

  for (let d = 1; d <= daysInMonth; d++) {
    let classes = 'calendar-day';
    if (d === today) classes += ' today';
    if (sessionDays.includes(d)) classes += ' has-session';
    html += `<div class="${classes}">${d}</div>`;
  }

  const totalCells = firstDay + daysInMonth;
  const remaining = 7 - (totalCells % 7);
  if (remaining < 7) {
    for (let d = 1; d <= remaining; d++) {
      html += `<div class="calendar-day other-month">${d}</div>`;
    }
  }

  html += '</div>';
  container.innerHTML = html;
  refreshIcons();
}

/**
 * Render a simple bar chart
 */
function renderBarChart(containerId, data) {
  const container = document.getElementById(containerId);
  if (!container) return;

  if (!data || data.length === 0) {
    container.innerHTML = `
      <div style="display:flex;align-items:center;justify-content:center;height:200px;color:var(--color-text-muted);font-size:var(--text-sm);">
        No data available yet
      </div>
    `;
    return;
  }

  const maxVal = Math.max(...data.map(d => d.value));

  let html = '<div class="bar-chart">';
  data.forEach(d => {
    const height = maxVal > 0 ? (d.value / maxVal) * 160 : 0;
    html += `
      <div class="bar-item">
        <div class="bar${d.secondary ? ' secondary' : ''}" style="height: ${height}px;" title="${d.label}: ${d.value}"></div>
        <span class="bar-label">${d.label}</span>
      </div>
    `;
  });
  html += '</div>';
  container.innerHTML = html;
}

/**
 * Render an empty state message
 */
function renderEmptyState(containerId, iconName, title, description) {
  const container = document.getElementById(containerId);
  if (!container) return;

  container.innerHTML = `
    <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;padding:var(--space-12);text-align:center;">
      <div style="width:56px;height:56px;border-radius:var(--radius-lg);background:var(--color-sage-light);display:flex;align-items:center;justify-content:center;margin-bottom:var(--space-4);color:var(--color-herbal);">
        ${icon(iconName, 24)}
      </div>
      <h3 style="font-size:var(--text-md);font-weight:var(--weight-semibold);margin-bottom:var(--space-2);">${title}</h3>
      <p style="font-size:var(--text-sm);color:var(--color-text-muted);max-width:280px;line-height:var(--leading-relaxed);">${description}</p>
    </div>
  `;
  refreshIcons();
}

// ---- UI Interactions ----

function toggleSidebar() {
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('sidebarOverlay');
  sidebar.classList.toggle('open');
  overlay.classList.toggle('active');
}

function closeSidebar() {
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('sidebarOverlay');
  sidebar.classList.remove('open');
  overlay.classList.remove('active');
}

function toggleNotifications() {
  const dropdown = document.getElementById('notifDropdown');
  dropdown.classList.toggle('open');
}

// Close notifications on outside click
document.addEventListener('click', (e) => {
  const dropdown = document.getElementById('notifDropdown');
  const btn = document.getElementById('notifBtn');
  if (dropdown && btn && !btn.contains(e.target) && !dropdown.contains(e.target)) {
    dropdown.classList.remove('open');
  }
});

// Handle sidebar nav click — switches active page content
function handleNavClick(pageId) {
  document.querySelectorAll('.sidebar-link').forEach(link => {
    link.classList.toggle('active', link.dataset.page === pageId);
  });
  closeSidebar();

  // Show/hide page sections
  document.querySelectorAll('[data-section]').forEach(section => {
    section.style.display = section.dataset.section === pageId ? 'block' : 'none';
  });

  // Trigger page-specific content update if handler exists
  if (typeof onPageChange === 'function') {
    onPageChange(pageId);
  }
}

/**
 * Show all sections (default view on dashboard load)
 */
function showAllSections() {
  document.querySelectorAll('[data-section]').forEach(section => {
    section.style.display = 'block';
  });
}
