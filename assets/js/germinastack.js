(function () {
  const state = {
    toastRail: null,
    lastFocusedElement: null,
    focusTrapStack: [],
  };

  function qs(root, sel) {
    return root.querySelector(sel);
  }

  function qsa(root, sel) {
    return Array.from(root.querySelectorAll(sel));
  }

  function escapeHtml(value) {
    return String(value || "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function ensureToastRail() {
    if (state.toastRail && document.body.contains(state.toastRail)) return state.toastRail;
    let rail = document.querySelector("[data-gs-toast-rail]");
    if (!rail) {
      rail = document.createElement("div");
      rail.className = "gs-toast-rail";
      rail.setAttribute("data-gs-toast-rail", "");
      rail.setAttribute("role", "region");
      rail.setAttribute("aria-live", "polite");
      rail.setAttribute("aria-label", "Notificações");
      document.body.appendChild(rail);
    }
    state.toastRail = rail;
    return rail;
  }

  function icon(name) {
    const paths = {
      close: '<path d="M18 6 6 18"></path><path d="m6 6 12 12"></path>',
      like: '<path d="M19.5 12.6 12 20l-7.5-7.4a5 5 0 0 1 7.1-7.1l.4.4.4-.4a5 5 0 0 1 7.1 7.1Z"></path>',
      comment: '<path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4Z"></path>',
      bookmark: '<path d="M6 4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18l-6-4-6 4Z"></path>',
    };

    return `<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${paths[name] || ""}</svg>`;
  }

  function closeMenus() {
    qsa(document, "[data-gs-menu-trigger]").forEach((trigger) => {
      trigger.setAttribute("aria-expanded", "false");
    });
    qsa(document, "[data-gs-menu-panel]").forEach((panel) => {
      panel.hidden = true;
    });
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
      // Focus first menu item
      const firstItem = qs(panel, "[role='menuitem'], button, a");
      if (firstItem) firstItem.focus();
    }
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
    if (target) target.classList.add("gs-hidden");
  }

  function announceToScreenReader(message, priority = "polite") {
    const liveRegion = document.getElementById("gs-live-region") || createLiveRegion();
    liveRegion.setAttribute("aria-live", priority);
    liveRegion.textContent = message;
    // Clear after announcement to allow repeated messages
    setTimeout(() => {
      liveRegion.textContent = "";
    }, 1000);
  }

  function createLiveRegion() {
    const region = document.createElement("div");
    region.id = "gs-live-region";
    region.className = "gs-sr-only";
    region.setAttribute("aria-live", "polite");
    region.setAttribute("aria-atomic", "true");
    document.body.appendChild(region);
    return region;
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
    item.setAttribute("role", cfg.tone === "danger" || cfg.tone === "error" ? "alert" : "status");
    item.setAttribute("aria-live", cfg.tone === "danger" || cfg.tone === "error" ? "assertive" : "polite");
    item.setAttribute("aria-atomic", "true");
    item.innerHTML = `
      <div>
        <strong>${escapeHtml(cfg.title)}</strong>
        <p>${escapeHtml(cfg.message)}</p>
      </div>
      <button class="gs-dismiss" type="button" aria-label="Fechar aviso">${icon("close")}</button>
    `;
    rail.appendChild(item);
    // Announce to screen readers
    announceToScreenReader(`${cfg.title}: ${cfg.message}`, cfg.tone === "danger" || cfg.tone === "error" ? "assertive" : "polite");
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
        showToast({
          title: "Snippet copiado",
          message: "O codigo foi enviado para a area de transferencia.",
          tone: "success",
        });
      });
      return;
    }
    showToast({
      title: "Copia manual",
      message: "Seu navegador nao liberou a area de transferencia.",
      tone: "warning",
    });
  }

  function nextCount(button, delta) {
    const countNode = qs(button, "[data-gs-count]");
    if (!countNode) return;
    const value = Number(countNode.textContent || "0") + delta;
    countNode.textContent = String(Math.max(0, value));
  }

  function trapFocus(element) {
    const focusableElements = element.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"]), [role="button"], [role="tab"], [role="menuitem"]'
    );
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    function handleTabKey(e) {
      if (e.key !== "Tab") return;
      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    }

    element.addEventListener("keydown", handleTabKey);
    return () => element.removeEventListener("keydown", handleTabKey);
  }

  function openModal(id) {
    const modal = document.querySelector(`[data-gs-modal="${id}"]`);
    if (!modal) return;
    // Store last focused element for restoration
    state.lastFocusedElement = document.activeElement;
    modal.hidden = false;
    document.body.style.overflow = "hidden";
    // Add to focus trap stack
    const cleanup = trapFocus(modal);
    state.focusTrapStack.push({ modal, cleanup });
    const focusTarget = qs(modal, "[data-gs-modal-close]") || qs(modal, "button, [href], input, select, textarea, [tabindex]:not([tabindex='-1'])");
    if (focusTarget) focusTarget.focus();
    // Announce modal opening
    const modalTitle = qs(modal, "[aria-labelledby]") || qs(modal, "h1, h2, h3, h4");
    if (modalTitle) {
      announceToScreenReader(`Diálogo aberto: ${modalTitle.textContent}`, "polite");
    }
  }

  function closeModal(node) {
    const modal = node.closest("[data-gs-modal]");
    if (!modal) return;
    modal.hidden = true;
    document.body.style.overflow = "";
    // Remove from focus trap stack and cleanup
    const trapIndex = state.focusTrapStack.findIndex((t) => t.modal === modal);
    if (trapIndex !== -1) {
      state.focusTrapStack[trapIndex].cleanup();
      state.focusTrapStack.splice(trapIndex, 1);
    }
    // Restore focus to trigger element
    if (state.lastFocusedElement && document.body.contains(state.lastFocusedElement)) {
      state.lastFocusedElement.focus();
    }
  }

  function toggleAccordion(trigger) {
    const item = trigger.closest("[data-gs-accordion-item]");
    if (!item) return;
    const panel = qs(item, "[data-gs-accordion-panel]");
    const expanded = trigger.getAttribute("aria-expanded") === "true";
    trigger.setAttribute("aria-expanded", String(!expanded));
    if (panel) panel.hidden = expanded;
    const iconNode = qs(trigger, "[data-gs-accordion-icon]");
    if (iconNode) iconNode.textContent = expanded ? "+" : "−";
    // Announce state change
    announceToScreenReader(expanded ? "Seção recolhida" : "Seção expandida", "polite");
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
          <div class="gs-post-comments gs-hidden">
            <div class="gs-input-shell" data-gs-comment-form>
              <input type="text" placeholder="Responder post" />
              <button class="gs-btn gs-btn-ghost" type="button" data-gs-comment-submit>Enviar</button>
            </div>
            <div></div>
          </div>
        `;
        list.prepend(card);
        input.value = "";
        showToast({
          title: "Post criado",
          message: "O exemplo foi atualizado no playground.",
          tone: "success",
        });
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
    if (root.dataset.gsInteractiveBound === "true") return;
    root.dataset.gsInteractiveBound = "true";

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
          tone: button.getAttribute("data-gs-toast-tone") || "info",
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
        return;
      }

      if (button.hasAttribute("data-gs-modal-open")) {
        openModal(button.getAttribute("data-gs-modal-open"));
        return;
      }

      if (button.hasAttribute("data-gs-modal-close")) {
        closeModal(button);
        return;
      }

      if (button.hasAttribute("data-gs-accordion-trigger")) {
        toggleAccordion(button);
      }
    });

    // Keyboard navigation for tabs, menus, accordions
    root.addEventListener("keydown", (event) => {
      const target = event.target;

      // Escape key handling
      if (event.key === "Escape") {
        closeMenus();
        qsa(document, "[data-gs-modal]").forEach((modal) => {
          if (!modal.hidden) modal.hidden = true;
        });
        document.body.style.overflow = "";
        return;
      }

      // Tab keyboard navigation (Arrow keys, Home, End)
      if (target.hasAttribute("data-gs-tab")) {
        const tabs = qsa(target.closest("[data-gs-tabs]"), "[data-gs-tab]");
        const currentIndex = tabs.indexOf(target);
        let newIndex = currentIndex;

        switch (event.key) {
          case "ArrowRight":
            event.preventDefault();
            newIndex = (currentIndex + 1) % tabs.length;
            break;
          case "ArrowLeft":
            event.preventDefault();
            newIndex = (currentIndex - 1 + tabs.length) % tabs.length;
            break;
          case "Home":
            event.preventDefault();
            newIndex = 0;
            break;
          case "End":
            event.preventDefault();
            newIndex = tabs.length - 1;
            break;
          default:
            return;
        }
        activateTab(tabs[newIndex], true);
        return;
      }

      // Menu keyboard navigation
      if (target.hasAttribute("data-gs-menu-trigger")) {
        const menu = target.closest("[data-gs-menu]");
        const panel = qs(menu, "[data-gs-menu-panel]");
        const expanded = target.getAttribute("aria-expanded") === "true";

        if (event.key === "ArrowDown" || event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          if (!expanded) {
            toggleMenu(target);
          } else {
            const firstItem = qs(panel, "[role='menuitem'], button, a");
            if (firstItem) firstItem.focus();
          }
          return;
        }

        if (event.key === "ArrowUp" && expanded) {
          event.preventDefault();
          const items = qsa(panel, "[role='menuitem'], button, a");
          const lastItem = items[items.length - 1];
          if (lastItem) lastItem.focus();
          return;
        }
      }

      // Menu panel keyboard navigation
      if (target.closest("[data-gs-menu-panel]") && (target.hasAttribute("role") === "menuitem" || target.tagName === "BUTTON" || target.tagName === "A")) {
        const panel = target.closest("[data-gs-menu-panel]");
        const items = qsa(panel, "[role='menuitem'], button, a");
        const currentIndex = items.indexOf(target);

        if (event.key === "ArrowDown") {
          event.preventDefault();
          const nextIndex = (currentIndex + 1) % items.length;
          items[nextIndex].focus();
          return;
        }

        if (event.key === "ArrowUp") {
          event.preventDefault();
          const prevIndex = (currentIndex - 1 + items.length) % items.length;
          items[prevIndex].focus();
          return;
        }

        if (event.key === "Escape" || event.key === "Tab") {
          event.preventDefault();
          const trigger = qs(panel.closest("[data-gs-menu]"), "[data-gs-menu-trigger]");
          if (trigger) {
            trigger.setAttribute("aria-expanded", "false");
            panel.hidden = true;
            trigger.focus();
          }
          return;
        }

        if (event.key === "Home") {
          event.preventDefault();
          items[0].focus();
          return;
        }

        if (event.key === "End") {
          event.preventDefault();
          items[items.length - 1].focus();
          return;
        }
      }

      // Accordion keyboard navigation
      if (target.hasAttribute("data-gs-accordion-trigger")) {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          toggleAccordion(target);
          return;
        }
      }
    });

    document.addEventListener("click", (event) => {
      if (!event.target.closest("[data-gs-menu]")) closeMenus();
      const backdrop = event.target.closest("[data-gs-modal]");
      if (backdrop && event.target === backdrop) {
        backdrop.hidden = true;
        document.body.style.overflow = "";
      }
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
      // Set up ARIA roles
      tabs.setAttribute("role", "tablist");
      qsa(tabs, "[data-gs-tab]").forEach((tab) => {
        tab.setAttribute("role", "tab");
        const panelId = tab.getAttribute("data-gs-tab");
        const panel = qs(tabs, `[data-gs-panel="${panelId}"]`);
        if (panel) {
          tab.setAttribute("aria-controls", panelId);
          panel.setAttribute("role", "tabpanel");
          panel.setAttribute("aria-labelledby", tab.id || `tab-${panelId}`);
          if (!tab.id) tab.id = `tab-${panelId}`;
        }
      });
      const active = qs(tabs, "[data-gs-tab].is-active") || qs(tabs, "[data-gs-tab]");
      if (active) activateTab(active, false);
    });
  }

  function initAccordions(root) {
    qsa(root, "[data-gs-accordion-trigger]").forEach((trigger) => {
      const expanded = trigger.getAttribute("aria-expanded") === "true";
      const panel = trigger.closest("[data-gs-accordion-item]")?.querySelector("[data-gs-accordion-panel]");
      if (panel) panel.hidden = !expanded;
      // Set up ARIA attributes
      trigger.setAttribute("aria-controls", panel?.id || "");
      if (panel && !panel.id) {
        panel.id = `accordion-panel-${Math.random().toString(36).substr(2, 9)}`;
        trigger.setAttribute("aria-controls", panel.id);
      }
    });
  }

  function initMenus(root) {
    qsa(root, "[data-gs-menu]").forEach((menu) => {
      const trigger = qs(menu, "[data-gs-menu-trigger]");
      const panel = qs(menu, "[data-gs-menu-panel]");
      if (trigger && panel) {
        trigger.setAttribute("aria-haspopup", "true");
        trigger.setAttribute("aria-expanded", "false");
        panel.setAttribute("role", "menu");
        panel.hidden = true;
        qsa(panel, "button, a").forEach((item) => {
          item.setAttribute("role", "menuitem");
        });
      }
    });
  }

  function init(root) {
    const scope = root || document.body;
    if (scope === document.body && scope.dataset.gsInit === "true") return;
    initSplash(scope);
    initTabs(scope);
    initAccordions(scope);
    initMenus(scope);
    bindComposer(scope);
    bindFeed(scope);
    bindInteractions(scope);
    if (scope === document.body) scope.dataset.gsInit = "true";
  }

  window.GerminaStackUI = {
    init,
    showToast,
    closeMenus,
    announceToScreenReader: (message, priority) => {
      const liveRegion = document.getElementById("gs-live-region") || createLiveRegion();
      liveRegion.setAttribute("aria-live", priority || "polite");
      liveRegion.textContent = message;
      setTimeout(() => { liveRegion.textContent = ""; }, 1000);
    },
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => init(document.body));
  } else {
    init(document.body);
  }
})();
