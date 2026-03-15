function sidebarLayout({ role, title, subtitle, content, active }) {
  const links =
    role === "admin"
      ? [
          { href: "dashboard.html", label: "Dashboard", key: "dashboard" },
          { href: "collectors.html", label: "Cobradores", key: "collectors" },
          { href: "clients.html", label: "Clientes", key: "clients" },
          { href: "credits.html", label: "Créditos", key: "credits" },
        ]
      : [
          { href: "dashboard.html", label: "Dashboard", key: "dashboard" },
          { href: "clients.html", label: "Clientes", key: "clients" },
          { href: "credits.html", label: "Créditos", key: "credits" },
        ];

  const user = JSON.parse(localStorage.getItem("user") || "null");

  document.body.innerHTML = `
    <div id="toastContainer" class="toast-container"></div>

    <div class="page">
      <aside class="sidebar">
        <div class="brand">Préstamos<span>Pro</span></div>
        <nav class="nav">
          ${links
            .map(
              (link) =>
                `<a href="${link.href}" class="${active === link.key ? "active" : ""}">${link.label}</a>`,
            )
            .join("")}
          <button onclick="logout()" class="btn-muted">Cerrar sesión</button>
        </nav>
      </aside>

      <main class="main">
        <div class="topbar">
          <div class="title">
            <h1>${title}</h1>
            <p>${subtitle}</p>
          </div>
          <div class="user-badge">
            ${user?.name || "Usuario"} · ${user?.role || ""}<br>
            <span style="font-size:12px;color:#9fb4d1;">${user?.officeName || ""}</span>
          </div>
        </div>

        ${content}
      </main>
    </div>
  `;
}

function money(value) {
  return Number(value || 0).toLocaleString("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  });
}

function formatDate(date) {
  if (!date) return "-";
  return new Date(date).toLocaleDateString("es-CO");
}

function showToast(message, type = "success") {
  const container = document.getElementById("toastContainer") || document.body;
  const toast = document.createElement("div");
  toast.className = `toast toast-${type}`;
  toast.textContent = message;
  container.appendChild(toast);

  setTimeout(() => {
    toast.classList.add("toast-hide");
  }, 2600);

  setTimeout(() => {
    toast.remove();
  }, 3200);
}
