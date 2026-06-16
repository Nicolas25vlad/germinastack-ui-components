(function () {
  const state = {
    toastRail: null,
  };

  function qs(root, sel) {
    return root.querySelector(sel);
  }

  function qsa(root, sel) {
    return Array.from(root.querySelectorAll(sel));
  }

  function ensureToastRail() {
    if (state.toastRail && document.body.contains(state.toastRail)) return state.toastRail;
    let rail = document.querySelector("[data-gs-toast-rail]");
    if (!rail) {
      rail = document.createElement("div");
      rail.className = "gs-toast-rail";
      rail.setAttribute("data-gs-toast-rail", "");
      document.body.appendChild(rail);
    }
    state.toastRail = rail;
    return rail;
  }

  function escapeHtml(value) {
    return String(value || "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function icon(name) {
    const paths = {
      close: '<path d="M18 6 6 18"></path><path d="m6 6 12 12"></path>',
      more: '<circle cx="12" cy="12" r="1"></circle><circle cx="19" cy="12" r="1"></circle><circle cx="5" cy="12" r="1"></circle>',
      like: '<path d="M19.5 12.6 12 20l-7.5-7.4a5 5 0 0 1 7.1-7.1l.4.4.4-.4a5 5 0 0 1 7.1 7.1Z"></path>',
      comment: '<path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4Z"></path>',
      bookmark: '<path d="M6 4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18l-6-4-6 4Z"></path>',
    };

    return `<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${paths[name] || ""}</svg>`;
  }

  function toggleMenu(trigger) {
    const menu = trigger.closest("[data-gs-menu]");
    if (!menu) return;
    const panel = qs(menu, "[data-gs-menu-panel]");
    const expanded = trigger.getAttribute("aria-expanded") === "true";
    closeMenus();
    if (!expanded) {
      trigger.setAttribute("aria-expanded", "true");
      if (panel) panel.hidden = false;
    }
  }

  function closeMenus() {
    qsa(document, "[data-gs-menu-trigger]").forEach((trigger) => {
      trigger.setAttribute("aria-expanded", "false");
    });
    qsa(document, "[data-gs-menu-panel]").forEach((panel) => {
      panel.hidden = true;
    });
  }

  function activateTab(button, focusPanel) {
    const root = button.closest("[data-gs-tabs]");
    if (!root) return;
    const tabId = button.getAttribute("data-gs-tab");
    qsa(root, "[data-gs-tab]").forEach((item) => {
      const active = item === button;
      item.classList.toggle("is-active", active);
      item.setAttribute("aria-selected", String(active));
      item.tabIndex = active ? 0 : -1;
    });
    qsa(root, "[data-gs-panel]").forEach((panel) => {
      const active = panel.getAttribute("data-gs-panel") === tabId;
      panel.hidden = !active;
      if (active && focusPanel) panel.focus();
    });
  }

  function dismissNode(node) {
    const target = node.closest("[data-gs-dismissible]");
    if (!target) return;
    target.classList.add("gs-hidden");
  }

  function showToast(opts) {
    const cfg = Object.assign(
      {
        title: "Aviso",
        message: "",
        tone: "",
        duration: 3200,
      },
      opts || {}
    );
    const rail = ensureToastRail();
    const item = document.createElement("div");
    item.className = `gs-toast ${cfg.tone ? `is-${cfg.tone}` : ""}`.trim();
    item.innerHTML = `
      <div>
        <strong>${escapeHtml(cfg.title)}</strong>
        <p>${escapeHtml(cfg.message)}</p>
      </div>
      <button class="gs-dismiss" type="button" aria-label="Fechar aviso">${icon("close")}</button>
    `;
    rail.appendChild(item);
    const remove = () => {
      if (item.parentNode) item.parentNode.removeChild(item);
    };
    qs(item, ".gs-dismiss").addEventListener("click", remove);
    window.setTimeout(remove, cfg.duration);
  }

  function copyTarget(button) {
    const sel = button.getAttribute("data-gs-copy");
    if (!sel) return;
    const target = document.querySelector(sel);
    if (!target) return;
    const text = target.textContent || "";
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text).then(() => {
        showToast({ title: "Snippet copiado", message: "O codigo foi enviado para a area de transferencia.", tone: "success" });
      });
      return;
    }
    showToast({ title: "Copia manual", message: "Seu navegador nao liberou a area de transferencia.", tone: "warning" });
  }

  function nextCount(button, delta) {
    const countNode = qs(button, "[data-gs-count]");
    if (!countNode) return;
    const value = Number(countNode.textContent || "0") + delta;
    countNode.textContent = String(Math.max(0, value));
  }

  function bindComposer(root) {
    qsa(root, "[data-gs-compose]").forEach((compose) => {
      const input = qs(compose, "textarea");
      const list = document.querySelector(compose.getAttribute("data-gs-target"));
      const action = qs(compose, "[data-gs-compose-submit]");
      if (!input || !list || !action || action.dataset.bound === "true") return;
      action.dataset.bound = "true";
      action.addEventListener("click", () => {
        const text = input.value.trim();
        if (!text) return;
        const card = document.createElement("article");
        card.className = "gs-post";
        card.innerHTML = `
          <div class="gs-post-body">
            <div class="gs-post-head">
              <span class="gs-avatar" style="background:#ffb347">N</span>
              <div class="gs-post-user">
                <div class="gs-meta">
                  <strong>Novo Post</strong>
                  <span>2a Tec E</span>
                  <span>agora</span>
                </div>
                <div class="gs-post-copy">${escapeHtml(text)}</div>
              </div>
            </div>
          </div>
          <div class="gs-post-foot">
            <button class="gs-action" type="button" data-gs-like>${icon("like")} <span data-gs-count>0</span></button>
            <button class="gs-action" type="button" data-gs-comment-toggle>${icon("comment")} <span data-gs-count>0</span></button>
            <button class="gs-action" type="button" data-gs-save>${icon("bookmark")} <span data-gs-save-label>Salvar</span></button>
          </div>
        `;
        list.prepend(card);
        input.value = "";
        showToast({ title: "Post criado", message: "O exemplo foi atualizado no playground.", tone: "success" });
      });
    });
  }

  function bindFeed(root) {
    qsa(root, "[data-gs-comment-form]").forEach((form) => {
      const input = qs(form, "input");
      const list = form.nextElementSibling;
      const action = qs(form, "[data-gs-comment-submit]");
      if (!input || !action || action.dataset.bound === "true") return;
      action.dataset.bound = "true";
      action.addEventListener("click", () => {
        const text = input.value.trim();
        if (!text || !list) return;
        const item = document.createElement("div");
        item.className = "gs-comment";
        item.innerHTML = `
          <div class="gs-comment-row">
            <span class="gs-avatar-xs" style="background:#ffb347">N</span>
            <div class="gs-comment-content">
              <div class="gs-comment-bubble">
                <div class="gs-meta">
                  <strong>Voce</strong>
                  <span>agora</span>
                </div>
                <p>${escapeHtml(text)}</p>
              </div>
            </div>
          </div>
        `;
        list.appendChild(item);
        input.value = "";
        const trigger = form.closest(".gs-post-comments")?.previousElementSibling?.querySelector("[data-gs-comment-toggle]");
        if (trigger) nextCount(trigger, 1);
      });
    });
  }

  function bindInteractions(root) {
    root.addEventListener("click", (event) => {
      const button = event.target.closest("button, [role='tab']");
      if (!button) return;

      if (button.hasAttribute("data-gs-menu-trigger")) {
        toggleMenu(button);
        return;
      }

      if (button.hasAttribute("data-gs-dismiss")) {
        dismissNode(button);
        return;
      }

      if (button.hasAttribute("data-gs-toast")) {
        showToast({
          title: button.getAttribute("data-gs-toast-title") || "Componente acionado",
          message: button.getAttribute("data-gs-toast-message") || "Exemplo executado com sucesso.",
          tone: button.getAttribute("data-gs-toast-tone") || "",
        });
        return;
      }

      if (button.hasAttribute("data-gs-copy")) {
        copyTarget(button);
        return;
      }

      if (button.hasAttribute("data-gs-like")) {
        const active = button.dataset.state === "on";
        button.dataset.state = active ? "off" : "on";
        button.classList.toggle("is-danger", !active);
        nextCount(button, active ? -1 : 1);
        return;
      }

      if (button.hasAttribute("data-gs-save")) {
        const active = button.dataset.state === "on";
        button.dataset.state = active ? "off" : "on";
        button.classList.toggle("is-active", !active);
        const label = qs(button, "[data-gs-save-label]");
        if (label) label.textContent = active ? "Salvar" : "Salvo";
        return;
      }

      if (button.hasAttribute("data-gs-comment-toggle")) {
        const comments = button.closest(".gs-post")?.querySelector(".gs-post-comments");
        if (comments) comments.classList.toggle("gs-hidden");
        return;
      }

      if (button.hasAttribute("data-gs-tab")) {
        activateTab(button, false);
      }
    });

    root.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        closeMenus();
      }
    });

    document.addEventListener("click", (event) => {
      if (!event.target.closest("[data-gs-menu]")) closeMenus();
    });
  }

  function initSplash(root) {
    qsa(root, "[data-gs-splash]").forEach((splash) => {
      const delay = Number(splash.getAttribute("data-gs-splash-delay") || "2200");
      window.setTimeout(() => {
        splash.classList.add("is-hidden");
        window.setTimeout(() => splash.remove(), 500);
      }, delay);
    });
  }

  function initTabs(root) {
    qsa(root, "[data-gs-tabs]").forEach((tabs) => {
      const active = qs(tabs, "[data-gs-tab].is-active") || qs(tabs, "[data-gs-tab]");
      if (active) activateTab(active, false);
    });
  }

  function init(root) {
    const scope = root || document;
    if (scope === document.body && scope.dataset.gsInit === "true") return;
    initSplash(scope);
    initTabs(scope);
    bindComposer(scope);
    bindFeed(scope);
    bindInteractions(scope);
    if (scope === document.body) scope.dataset.gsInit = "true";
  }

  window.GerminaStackUI = {
    init,
    showToast,
    closeMenus,
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => init(document.body));
  } else {
    init(document.body);
  }
})();
