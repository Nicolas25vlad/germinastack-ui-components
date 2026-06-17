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

  function initSelects(root) {
    qsa(root, "[data-gs-select]").forEach((select) => {
      const trigger = qs(select, "[data-gs-select-trigger]");
      const panel = qs(select, "[data-gs-select-panel]");
      const search = qs(select, "[data-gs-select-search] input");
      const options = qsa(panel, "[data-gs-select-option]");
      
      if (!trigger || !panel) return;
      
      // Set up ARIA attributes
      trigger.setAttribute("aria-haspopup", "listbox");
      trigger.setAttribute("aria-expanded", "false");
      trigger.setAttribute("aria-controls", panel.id || `select-panel-${Math.random().toString(36).substr(2, 9)}`);
      if (!panel.id) panel.id = trigger.getAttribute("aria-controls");
      panel.setAttribute("role", "listbox");
      panel.setAttribute("aria-labelledby", trigger.id || `select-trigger-${Math.random().toString(36).substr(2, 9)}`);
      if (!trigger.id) trigger.id = panel.getAttribute("aria-labelledby");
      
      options.forEach((option) => {
        option.setAttribute("role", "option");
        option.setAttribute("aria-selected", option.getAttribute("aria-selected") || "false");
      });
      
      // Search functionality
      if (search) {
        search.addEventListener("input", () => {
          const query = search.value.toLowerCase();
          options.forEach((option) => {
            const text = option.textContent.toLowerCase();
            option.hidden = !text.includes(query) && option.getAttribute("role") !== "separator";
          });
        });
      }
    });
  }

  function initDatePickers(root) {
    qsa(root, "[data-gs-datepicker]").forEach((datepicker) => {
      const trigger = qs(datepicker, "[data-gs-datepicker-trigger]");
      const panel = qs(datepicker, "[data-gs-datepicker-panel]");
      const grid = qs(panel, "[data-gs-datepicker-grid]");
      const prevBtn = qs(panel, "[data-gs-datepicker-prev]");
      const nextBtn = qs(panel, "[data-gs-datepicker-next]");
      const title = qs(panel, "[data-gs-datepicker-title]");
      const foot = qs(panel, "[data-gs-datepicker-foot]");
      const isRange = datepicker.hasAttribute("data-gs-datepicker-range");
      
      if (!trigger || !panel || !grid) return;
      
      let currentDate = new Date();
      let selectedDate = null;
      let rangeStart = null;
      let rangeEnd = null;
      let selectingStart = true;
      
      // Parse initial value
      const inputValue = trigger.getAttribute("data-gs-value");
      if (inputValue) {
        if (isRange) {
          const [start, end] = inputValue.split(" to ");
          if (start) rangeStart = new Date(start);
          if (end) rangeEnd = new Date(end);
          currentDate = rangeStart || new Date();
        } else {
          selectedDate = new Date(inputValue);
          currentDate = selectedDate || new Date();
        }
      }
      
      // Set up ARIA attributes
      trigger.setAttribute("aria-haspopup", "dialog");
      trigger.setAttribute("aria-expanded", "false");
      trigger.setAttribute("aria-controls", panel.id || `datepicker-panel-${Math.random().toString(36).substr(2, 9)}`);
      if (!panel.id) panel.id = trigger.getAttribute("aria-controls");
      panel.setAttribute("role", "dialog");
      panel.setAttribute("aria-labelledby", trigger.id || `datepicker-trigger-${Math.random().toString(36).substr(2, 9)}`);
      if (!trigger.id) trigger.id = panel.getAttribute("aria-labelledby");
      
      function renderCalendar() {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        
        // Update title
        if (title) {
          title.textContent = currentDate.toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
        }
        
        // Update nav buttons
        if (prevBtn) prevBtn.disabled = false;
        if (nextBtn) nextBtn.disabled = false;
        
        // Generate calendar days
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const startDay = firstDay.getDay(); // 0 = Sunday
        const daysInMonth = lastDay.getDate();
        const prevMonthDays = new Date(year, month, 0).getDate();
        
        let html = "";
        
        // Weekday headers
        const weekdays = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
        weekdays.forEach((day) => {
          html += `<button type="button" class="gs-datepicker-weekday" aria-label="${day}">${day}</button>`;
        });
        
        // Previous month days
        for (let i = startDay - 1; i >= 0; i--) {
          const day = prevMonthDays - i;
          const date = new Date(year, month - 1, day);
          html += `<button type="button" class="gs-datepicker-day is-outside is-disabled" data-date="${date.toISOString().split("T")[0]}" aria-label="${date.toLocaleDateString("pt-BR")}" tabindex="-1">${day}</button>`;
        }
        
        // Current month days
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        for (let day = 1; day <= daysInMonth; day++) {
          const date = new Date(year, month, day);
          date.setHours(0, 0, 0, 0);
          
          let classes = "gs-datepicker-day";
          let attrs = `data-date="${date.toISOString().split("T")[0]}" aria-label="${date.toLocaleDateString("pt-BR")}"`;
          
          if (date.getTime() === today.getTime()) {
            classes += " is-today";
          }
          
          if (isRange) {
            if (rangeStart && date.getTime() === rangeStart.getTime()) {
              classes += " is-range-start";
              attrs += ' aria-selected="true"';
            }
            if (rangeEnd && date.getTime() === rangeEnd.getTime()) {
              classes += " is-range-end";
              attrs += ' aria-selected="true"';
            }
            if (rangeStart && rangeEnd && date > rangeStart && date < rangeEnd) {
              classes += " is-in-range";
            }
          } else if (selectedDate && date.getTime() === selectedDate.getTime()) {
            classes += " is-selected";
            attrs += ' aria-selected="true"';
          }
          
          html += `<button type="button" class="${classes}" ${attrs}>${day}</button>`;
        }
        
        // Next month days
        const totalCells = startDay + daysInMonth;
        const nextMonthCells = Math.ceil(totalCells / 7) * 7 - totalCells;
        for (let day = 1; day <= nextMonthCells; day++) {
          const date = new Date(year, month + 1, day);
          html += `<button type="button" class="gs-datepicker-day is-outside is-disabled" data-date="${date.toISOString().split("T")[0]}" aria-label="${date.toLocaleDateString("pt-BR")}" tabindex="-1">${day}</button>`;
        }
        
        grid.innerHTML = html;
        
        // Add click handlers to day buttons
        qsa(grid, ".gs-datepicker-day:not(.is-disabled)").forEach((dayBtn) => {
          dayBtn.addEventListener("click", () => {
            const dateStr = dayBtn.getAttribute("data-date");
            const date = new Date(dateStr + "T00:00:00");
            
            if (isRange) {
              if (selectingStart || rangeEnd) {
                rangeStart = date;
                rangeEnd = null;
                selectingStart = false;
              } else if (date < rangeStart) {
                rangeStart = date;
              } else {
                rangeEnd = date;
                selectingStart = true;
              }
            } else {
              selectedDate = date;
              closeDatePicker();
            }
            
            renderCalendar();
            updateTriggerValue();
          });
          
          // Keyboard navigation
          dayBtn.addEventListener("keydown", (e) => {
            handleDatePickerKeydown(e, dayBtn, grid);
          });
        });
      }
      
      function updateTriggerValue() {
        if (isRange) {
          if (rangeStart && rangeEnd) {
            trigger.setAttribute("data-gs-value", `${rangeStart.toISOString().split("T")[0]} to ${rangeEnd.toISOString().split("T")[0]}`);
            const startStr = rangeStart.toLocaleDateString("pt-BR");
            const endStr = rangeEnd.toLocaleDateString("pt-BR");
            trigger.querySelector("[data-gs-datepicker-value]").textContent = `${startStr} – ${endStr}`;
            trigger.querySelector("[data-gs-datepicker-value]").classList.remove("gs-select-placeholder");
          } else if (rangeStart) {
            trigger.setAttribute("data-gs-value", rangeStart.toISOString().split("T")[0]);
            trigger.querySelector("[data-gs-datepicker-value]").textContent = rangeStart.toLocaleDateString("pt-BR");
            trigger.querySelector("[data-gs-datepicker-value]").classList.remove("gs-select-placeholder");
          } else {
            trigger.removeAttribute("data-gs-value");
            trigger.querySelector("[data-gs-datepicker-value]").textContent = "Selecionar período";
            trigger.querySelector("[data-gs-datepicker-value]").classList.add("gs-select-placeholder");
          }
        } else {
          if (selectedDate) {
            trigger.setAttribute("data-gs-value", selectedDate.toISOString().split("T")[0]);
            trigger.querySelector("[data-gs-datepicker-value]").textContent = selectedDate.toLocaleDateString("pt-BR");
            trigger.querySelector("[data-gs-datepicker-value]").classList.remove("gs-select-placeholder");
          } else {
            trigger.removeAttribute("data-gs-value");
            trigger.querySelector("[data-gs-datepicker-value]").textContent = "Selecionar data";
            trigger.querySelector("[data-gs-datepicker-value]").classList.add("gs-select-placeholder");
          }
        }
      }
      
      function openDatePicker() {
        trigger.setAttribute("aria-expanded", "true");
        panel.hidden = false;
        renderCalendar();
        // Focus first non-disabled day
        const firstDay = qs(grid, ".gs-datepicker-day:not(.is-disabled):not(.is-outside)");
        if (firstDay) firstDay.focus();
      }
      
      function closeDatePicker() {
        trigger.setAttribute("aria-expanded", "false");
        panel.hidden = true;
        trigger.focus();
      }
      
      function handleDatePickerKeydown(e, target, grid) {
        const days = qsa(grid, ".gs-datepicker-day:not(.is-disabled):not(.is-outside)");
        const currentIndex = days.indexOf(target);
        
        switch (e.key) {
          case "ArrowRight":
            e.preventDefault();
            if (currentIndex < days.length - 1) days[currentIndex + 1].focus();
            break;
          case "ArrowLeft":
            e.preventDefault();
            if (currentIndex > 0) days[currentIndex - 1].focus();
            break;
          case "ArrowDown":
            e.preventDefault();
            if (currentIndex + 7 < days.length) days[currentIndex + 7].focus();
            break;
          case "ArrowUp":
            e.preventDefault();
            if (currentIndex - 7 >= 0) days[currentIndex - 7].focus();
            break;
          case "Home":
            e.preventDefault();
            const weekStart = currentIndex - (currentIndex % 7);
            if (days[weekStart]) days[weekStart].focus();
            break;
          case "End":
            e.preventDefault();
            const weekEnd = Math.min(currentIndex + (6 - (currentIndex % 7)), days.length - 1);
            if (days[weekEnd]) days[weekEnd].focus();
            break;
          case "Enter":
          case " ":
            e.preventDefault();
            target.click();
            break;
          case "Escape":
            e.preventDefault();
            closeDatePicker();
            break;
          case "PageUp":
            e.preventDefault();
            currentDate.setMonth(currentDate.getMonth() - 1);
            renderCalendar();
            break;
          case "PageDown":
            e.preventDefault();
            currentDate.setMonth(currentDate.getMonth() + 1);
            renderCalendar();
            break;
        }
      }
      
      // Trigger click
      trigger.addEventListener("click", (e) => {
        e.stopPropagation();
        const expanded = trigger.getAttribute("aria-expanded") === "true";
        if (expanded) {
          closeDatePicker();
        } else {
          openDatePicker();
        }
      });
      
      // Nav buttons
      if (prevBtn) {
        prevBtn.addEventListener("click", () => {
          currentDate.setMonth(currentDate.getMonth() - 1);
          renderCalendar();
        });
      }
      
      if (nextBtn) {
        nextBtn.addEventListener("click", () => {
          currentDate.setMonth(currentDate.getMonth() + 1);
          renderCalendar();
        });
      }
      
      // Close on outside click
      document.addEventListener("click", (e) => {
        if (!datepicker.contains(e.target)) {
          closeDatePicker();
        }
      });
      
      // Escape key
      trigger.addEventListener("keydown", (e) => {
        if (e.key === "Escape") {
          closeDatePicker();
        }
      });
      
      // Initial render
      updateTriggerValue();
    });
  }

  function initDataTables(root) {
    qsa(root, "[data-gs-datatable]").forEach((datatable) => {
      const table = qs(datatable, "table");
      const toolbar = qs(datatable, "[data-gs-datatable-toolbar]");
      const search = qs(toolbar, "[data-gs-datatable-search] input");
      const pagination = qs(datatable, "[data-gs-datatable-pagination]");
      const prevBtn = qs(pagination, "[data-gs-datatable-prev]");
      const nextBtn = qs(pagination, "[data-gs-datatable-next]");
      const pageInfo = qs(pagination, "[data-gs-datatable-page-info]");
      const rowsPerPage = Number(datatable.getAttribute("data-gs-datatable-page-size") || "10");
      
      if (!table) return;
      
      const tbody = qs(table, "tbody");
      const headers = qsa(table, "th[aria-sort]");
      let allRows = Array.from(qsa(tbody, "tr"));
      let filteredRows = [...allRows];
      let currentPage = 1;
      let sortColumn = null;
      let sortDirection = "none";
      
      function renderRows() {
        const start = (currentPage - 1) * rowsPerPage;
        const end = start + rowsPerPage;
        const pageRows = filteredRows.slice(start, end);
        
        allRows.forEach((row) => row.hidden = true);
        pageRows.forEach((row) => row.hidden = false);
        
        // Update pagination
        const totalPages = Math.ceil(filteredRows.length / rowsPerPage);
        if (prevBtn) prevBtn.disabled = currentPage <= 1;
        if (nextBtn) nextBtn.disabled = currentPage >= totalPages;
        if (pageInfo) pageInfo.textContent = `Página ${currentPage} de ${totalPages || 1}`;
        
        // Update row selection
        qsa(tbody, "tr").forEach((row) => {
          row.classList.remove("is-selected");
        });
      }
      
      function filterRows() {
        if (!search) return;
        const query = search.value.toLowerCase();
        filteredRows = allRows.filter((row) => {
          const text = row.textContent.toLowerCase();
          return text.includes(query);
        });
        currentPage = 1;
        renderRows();
      }
      
      function sortRows(columnIndex, direction) {
        filteredRows.sort((a, b) => {
          const aText = a.cells[columnIndex]?.textContent.trim() || "";
          const bText = b.cells[columnIndex]?.textContent.trim() || "";
          
          // Try numeric comparison
          const aNum = parseFloat(aText.replace(/[^\d.-]/g, ""));
          const bNum = parseFloat(bText.replace(/[^\d.-]/g, ""));
          
          let result = 0;
          if (!isNaN(aNum) && !isNaN(bNum)) {
            result = aNum - bNum;
          } else {
            result = aText.localeCompare(bText, "pt-BR");
          }
          
          return direction === "ascending" ? result : -result;
        });
        renderRows();
      }
      
      // Sort headers
      headers.forEach((header, index) => {
        header.addEventListener("click", () => {
          const currentSort = header.getAttribute("aria-sort");
          let newDirection = "ascending";
          
          if (currentSort === "ascending") {
            newDirection = "descending";
          } else if (currentSort === "descending") {
            newDirection = "none";
          }
          
          headers.forEach((h) => h.setAttribute("aria-sort", "none"));
          header.setAttribute("aria-sort", newDirection);
          
          sortColumn = index;
          sortDirection = newDirection;
          
          if (newDirection === "none") {
            filteredRows = [...allRows];
            if (search) filterRows();
          } else {
            sortRows(index, newDirection);
          }
        });
        
        header.addEventListener("keydown", (e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            header.click();
          }
        });
      });
      
      // Search
      if (search) {
        search.addEventListener("input", filterRows);
      }
      
      // Pagination
      if (prevBtn) {
        prevBtn.addEventListener("click", () => {
          if (currentPage > 1) {
            currentPage--;
            renderRows();
          }
        });
      }
      
      if (nextBtn) {
        nextBtn.addEventListener("click", () => {
          const totalPages = Math.ceil(filteredRows.length / rowsPerPage);
          if (currentPage < totalPages) {
            currentPage++;
            renderRows();
          }
        });
      }
      
      // Row selection
      qsa(tbody, "tr").forEach((row) => {
        row.addEventListener("click", () => {
          qsa(tbody, "tr").forEach((r) => r.classList.remove("is-selected"));
          row.classList.add("is-selected");
        });
        
        row.addEventListener("keydown", (e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            row.click();
          }
        });
      });
      
      // Initial render
      renderRows();
    });
  }

  function initTooltips(root) {
    qsa(root, "[data-gs-tooltip], [data-gs-popover]").forEach((trigger) => {
      const isPopover = trigger.hasAttribute("data-gs-popover");
      const content = trigger.getAttribute("data-gs-tooltip") || trigger.getAttribute("data-gs-popover");
      const placement = trigger.getAttribute("data-gs-placement") || "top";
      const popoverTitle = trigger.getAttribute("data-gs-popover-title");
      const popoverContent = trigger.getAttribute("data-gs-popover-content");
      const popoverFoot = trigger.getAttribute("data-gs-popover-foot");
      
      if (!content && !popoverContent) return;
      
      let tooltip = null;
      let hideTimeout = null;
      let showTimeout = null;
      
      function createTooltip() {
        tooltip = document.createElement("div");
        tooltip.className = isPopover ? "gs-popover" : "gs-tooltip";
        tooltip.setAttribute("role", isPopover ? "dialog" : "tooltip");
        tooltip.setAttribute("data-placement", placement);
        tooltip.hidden = true;
        
        if (isPopover) {
          let html = "";
          if (popoverTitle) {
            html += `
              <div class="gs-popover-header">
                <h4>${escapeHtml(popoverTitle)}</h4>
                <button type="button" class="gs-popover-close" aria-label="Fechar">${icon("close")}</button>
              </div>
            `;
          }
          html += `<div class="gs-popover-body">${escapeHtml(popoverContent || content)}</div>`;
          if (popoverFoot) {
            html += `<div class="gs-popover-foot">${popoverFoot}</div>`;
          }
          tooltip.innerHTML = html;
          
          // Close button
          const closeBtn = qs(tooltip, ".gs-popover-close");
          if (closeBtn) {
            closeBtn.addEventListener("click", hideTooltip);
          }
        } else {
          tooltip.textContent = content;
        }
        
        document.body.appendChild(tooltip);
      }
      
      function positionTooltip() {
        if (!tooltip) return;
        
        const triggerRect = trigger.getBoundingClientRect();
        const tooltipRect = tooltip.getBoundingClientRect();
        const gap = 8;
        
        let top = 0;
        let left = 0;
        
        switch (placement) {
          case "top":
            top = triggerRect.top - tooltipRect.height - gap;
            left = triggerRect.left + (triggerRect.width - tooltipRect.width) / 2;
            break;
          case "bottom":
            top = triggerRect.bottom + gap;
            left = triggerRect.left + (triggerRect.width - tooltipRect.width) / 2;
            break;
          case "left":
            top = triggerRect.top + (triggerRect.height - tooltipRect.height) / 2;
            left = triggerRect.left - tooltipRect.width - gap;
            break;
          case "right":
            top = triggerRect.top + (triggerRect.height - tooltipRect.height) / 2;
            left = triggerRect.right + gap;
            break;
        }
        
        // Keep within viewport
        const viewportPadding = 8;
        if (left < viewportPadding) left = viewportPadding;
        if (left + tooltipRect.width > window.innerWidth - viewportPadding) {
          left = window.innerWidth - tooltipRect.width - viewportPadding;
        }
        if (top < viewportPadding) top = viewportPadding;
        if (top + tooltipRect.height > window.innerHeight - viewportPadding) {
          top = window.innerHeight - tooltipRect.height - viewportPadding;
        }
        
        tooltip.style.top = `${top}px`;
        tooltip.style.left = `${left}px`;
      }
      
      function showTooltip() {
        if (!tooltip) createTooltip();
        clearTimeout(hideTimeout);
        
        showTimeout = setTimeout(() => {
          tooltip.hidden = false;
          positionTooltip();
          requestAnimationFrame(() => {
            tooltip.classList.add("is-visible");
          });
          
          if (isPopover) {
            const closeBtn = qs(tooltip, ".gs-popover-close");
            if (closeBtn) closeBtn.focus();
          }
        }, isPopover ? 0 : 150);
      }
      
      function hideTooltip() {
        clearTimeout(showTimeout);
        
        if (tooltip) {
          tooltip.classList.remove("is-visible");
          hideTimeout = setTimeout(() => {
            tooltip.hidden = true;
          }, 150);
        }
      }
      
      // Event listeners
      if (isPopover) {
        trigger.addEventListener("click", (e) => {
          e.stopPropagation();
          const isVisible = tooltip && tooltip.classList.contains("is-visible");
          if (isVisible) {
            hideTooltip();
          } else {
            showTooltip();
          }
        });
        
        document.addEventListener("click", (e) => {
          if (tooltip && !tooltip.contains(e.target) && e.target !== trigger) {
            hideTooltip();
          }
        });
        
        trigger.addEventListener("keydown", (e) => {
          if (e.key === "Escape") {
            hideTooltip();
          }
        });
      } else {
        trigger.addEventListener("mouseenter", showTooltip);
        trigger.addEventListener("mouseleave", hideTooltip);
        trigger.addEventListener("focus", showTooltip);
        trigger.addEventListener("blur", hideTooltip);
      }
      
      // Reposition on scroll/resize
      window.addEventListener("scroll", positionTooltip, { passive: true });
      window.addEventListener("resize", positionTooltip);
    });
  }

  function init(root) {
    const scope = root || document.body;
    if (scope === document.body && scope.dataset.gsInit === "true") return;
    initSplash(scope);
    initTabs(scope);
    initAccordions(scope);
    initMenus(scope);
    initSelects(scope);
    initDatePickers(scope);
    initDataTables(scope);
    initTooltips(scope);
    bindComposer(scope);
    bindFeed(scope);
    bindInteractions(scope);
    if (scope === document.body) scope.dataset.gsInit = "true";
  }

  window.GerminaStackUI = {
    init,
    showToast,
    closeMenus,
    initSelects,
    initDatePickers,
    initDataTables,
    initTooltips,
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
