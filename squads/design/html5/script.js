/**
 * CaminhãoBR — script.js
 * Vanilla JS · performance first · sem frameworks
 *
 * Funcionalidades:
 * 1. Theme Toggle (dark/light)
 * 2. Mobile Menu (hamburger)
 * 3. Filter Tabs (caminhões em destaque)
 * 4. FAQ Accordion
 * 5. Marquee (duplica itens para loop infinito)
 * 6. Animate on scroll (Intersection Observer)
 * 7. Cookie Banner (LGPD)
 * 8. Navbar scroll behavior
 * 9. Search form — populate modelos por marca
 * 10. Form validation básica
 */

'use strict';

/* ================================================================
   UTILS
   ================================================================ */
const $ = (selector, context = document) => context.querySelector(selector);
const $$ = (selector, context = document) => [...context.querySelectorAll(selector)];

/** Salva/carrega do localStorage com fallback seguro */
const storage = {
  get(key, fallback = null) {
    try { return localStorage.getItem(key) ?? fallback; }
    catch { return fallback; }
  },
  set(key, value) {
    try { localStorage.setItem(key, value); }
    catch { /* ignora em modo privado */ }
  }
};

/* ================================================================
   1. THEME TOGGLE
   Persiste preferência no localStorage
   Respeita prefers-color-scheme como padrão
   ================================================================ */
(function initTheme() {
  const html = document.documentElement;
  const btn = $('#themeToggle');
  if (!btn) return;

  // Determina tema inicial: localStorage > media query > dark
  const savedTheme = storage.get('theme');
  const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const theme = savedTheme || (systemDark ? 'dark' : 'light');

  html.setAttribute('data-theme', theme);

  btn.addEventListener('click', () => {
    const current = html.getAttribute('data-theme');
    const next = current === 'dark' ? 'light' : 'dark';
    html.setAttribute('data-theme', next);
    storage.set('theme', next);
    btn.setAttribute('aria-label', next === 'dark' ? 'Ativar tema claro' : 'Ativar tema escuro');
  });
})();

/* ================================================================
   2. MOBILE MENU
   Toggle com aria-expanded e focus trap básico
   ================================================================ */
(function initMobileMenu() {
  const btn = $('#mobileMenuBtn');
  const menu = $('#mobileMenu');
  if (!btn || !menu) return;

  function openMenu() {
    menu.classList.add('is-open');
    btn.classList.add('is-active');
    btn.setAttribute('aria-expanded', 'true');
    menu.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    // Foca primeiro link do menu (acessibilidade)
    const firstLink = $('a', menu);
    if (firstLink) firstLink.focus();
  }

  function closeMenu() {
    menu.classList.remove('is-open');
    btn.classList.remove('is-active');
    btn.setAttribute('aria-expanded', 'false');
    menu.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    btn.focus();
  }

  btn.addEventListener('click', () => {
    const isOpen = btn.getAttribute('aria-expanded') === 'true';
    isOpen ? closeMenu() : openMenu();
  });

  // Fecha com Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && menu.classList.contains('is-open')) {
      closeMenu();
    }
  });

  // Fecha ao clicar fora
  document.addEventListener('click', (e) => {
    if (menu.classList.contains('is-open') &&
        !menu.contains(e.target) &&
        !btn.contains(e.target)) {
      closeMenu();
    }
  });

  // Fecha ao clicar em link do menu
  $$('a', menu).forEach(link => {
    link.addEventListener('click', closeMenu);
  });
})();

/* ================================================================
   3. FILTER TABS — Caminhões em destaque
   Filtra cards por data-type e data-condition
   ================================================================ */
(function initFilterTabs() {
  const tabs = $$('.filter-tab');
  const cards = $$('.truck-card');
  if (!tabs.length || !cards.length) return;

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const filter = tab.dataset.filter;

      // Atualiza estado dos tabs (aria-selected)
      tabs.forEach(t => {
        t.classList.remove('active');
        t.setAttribute('aria-selected', 'false');
      });
      tab.classList.add('active');
      tab.setAttribute('aria-selected', 'true');

      // Filtra cards
      cards.forEach(card => {
        const type = card.dataset.type;
        const condition = card.dataset.condition;

        let show = false;
        switch (filter) {
          case 'all':    show = true; break;
          case 'novo':   show = condition === 'novo'; break;
          case 'usado':  show = condition === 'usado' || condition === 'semi-novo'; break;
          case 'leve':   show = type === 'leve'; break;
          case 'pesado': show = type === 'pesado' || type === 'extra-pesado'; break;
          default:       show = true;
        }

        if (show) {
          card.classList.remove('is-hidden');
          // Anima entrada
          card.style.opacity = '0';
          card.style.transform = 'translateY(12px)';
          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              card.style.transition = 'opacity 0.25s ease, transform 0.25s ease';
              card.style.opacity = '1';
              card.style.transform = 'translateY(0)';
            });
          });
        } else {
          card.classList.add('is-hidden');
          card.style.opacity = '';
          card.style.transform = '';
          card.style.transition = '';
        }
      });

      // Anúncia para leitores de tela
      const visibleCount = cards.filter(c => !c.classList.contains('is-hidden')).length;
      announceToSR(`${visibleCount} caminhões encontrados`);
    });
  });

  /** Anuncia mensagem para screen readers via live region */
  function announceToSR(message) {
    let live = $('#sr-live');
    if (!live) {
      live = document.createElement('div');
      live.id = 'sr-live';
      live.setAttribute('aria-live', 'polite');
      live.setAttribute('aria-atomic', 'true');
      live.className = 'sr-only';
      document.body.appendChild(live);
    }
    live.textContent = '';
    requestAnimationFrame(() => { live.textContent = message; });
  }
})();

/* ================================================================
   4. FAQ ACCORDION
   Padrão acessível: aria-expanded + hidden
   ================================================================ */
(function initFAQ() {
  const items = $$('.faq-item');
  if (!items.length) return;

  items.forEach(item => {
    const trigger = $('.faq-item__trigger', item);
    const answer = $('.faq-item__answer', item);
    if (!trigger || !answer) return;

    trigger.addEventListener('click', () => {
      const isExpanded = trigger.getAttribute('aria-expanded') === 'true';

      // Fecha todos os outros (comportamento accordion)
      items.forEach(other => {
        const otherTrigger = $('.faq-item__trigger', other);
        const otherAnswer = $('.faq-item__answer', other);
        if (otherTrigger && otherAnswer && other !== item) {
          otherTrigger.setAttribute('aria-expanded', 'false');
          otherAnswer.hidden = true;
        }
      });

      // Toggle o atual
      trigger.setAttribute('aria-expanded', String(!isExpanded));
      answer.hidden = isExpanded;
    });

    // Keyboard: Enter e Space abrem/fecham
    trigger.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        trigger.click();
      }
    });
  });
})();

/* ================================================================
   5. MARQUEE — Duplica itens para loop infinito suave
   ================================================================ */
(function initMarquee() {
  const track = $('#marqueeTrack');
  if (!track) return;

  // Pausa se o usuário prefere menos movimento
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    track.style.animation = 'none';
    return;
  }

  // Duplica o conteúdo para loop contínuo
  const clone = track.cloneNode(true);
  clone.setAttribute('aria-hidden', 'true');
  track.parentElement.appendChild(clone);
})();

/* ================================================================
   6. ANIMATE ON SCROLL (Intersection Observer)
   Adiciona classe .animate-in aos elementos e .is-visible quando visíveis
   ================================================================ */
(function initAnimateOnScroll() {
  // Respeita prefers-reduced-motion
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const targets = $$('.truck-card, .category-card, .guide-card, .benefit-card, .blog-card, .brand-card, .faq-item');

  if (!targets.length || !('IntersectionObserver' in window)) return;

  targets.forEach(el => el.classList.add('animate-in'));

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target); // Remove observer após animar
        }
      });
    },
    {
      threshold: 0.1,
      rootMargin: '0px 0px -40px 0px'
    }
  );

  targets.forEach(el => observer.observe(el));
})();

/* ================================================================
   7. COOKIE BANNER (LGPD)
   ================================================================ */
(function initCookieBanner() {
  const banner = $('#cookieBanner');
  const acceptBtn = $('#cookieAccept');
  const rejectBtn = $('#cookieReject');
  if (!banner) return;

  const consent = storage.get('cookie_consent');
  if (!consent) {
    // Mostra o banner com delay para evitar CLS
    setTimeout(() => {
      banner.classList.add('is-visible');
      banner.setAttribute('aria-hidden', 'false');
    }, 1500);
  }

  function hideBanner() {
    banner.classList.remove('is-visible');
    banner.setAttribute('aria-hidden', 'true');
    setTimeout(() => { banner.style.display = 'none'; }, 300);
  }

  acceptBtn?.addEventListener('click', () => {
    storage.set('cookie_consent', 'accepted');
    hideBanner();
    // Aqui você ativaria Google Analytics, etc.
  });

  rejectBtn?.addEventListener('click', () => {
    storage.set('cookie_consent', 'rejected');
    hideBanner();
  });
})();

/* ================================================================
   8. NAVBAR — Comportamento ao rolar
   Adiciona sombra/border quando a página rola
   ================================================================ */
(function initNavbarScroll() {
  const navbar = $('.navbar');
  if (!navbar) return;

  let ticking = false;

  function updateNavbar() {
    if (window.scrollY > 20) {
      navbar.style.borderBottomColor = 'var(--color-border-strong)';
    } else {
      navbar.style.borderBottomColor = 'var(--color-border)';
    }
    ticking = false;
  }

  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(updateNavbar);
      ticking = true;
    }
  }, { passive: true });
})();

/* ================================================================
   9. SEARCH FORM — Populate modelos dinamicamente por marca
   ================================================================ */
(function initSearchModelos() {
  const marcaSelect = $('#searchMarca');
  const modeloSelect = $('#searchModelo');
  if (!marcaSelect || !modeloSelect) return;

  /** Mapa marca → modelos disponíveis */
  const modelosPorMarca = {
    scania: ['R 450', 'R 540', 'R 650', 'P 320', 'P 360', 'G 500', 'S 650', 'XT 540'],
    volvo: ['FH 540', 'FH 460', 'FH 420', 'FM 450', 'VM 330', 'VM 270', 'FMX 540'],
    'mercedes-benz': ['Actros 2651', 'Actros 2548', 'Atego 2430', 'Atego 2426', 'Axor 2544', 'Accelo 1016', 'Arocs 3351'],
    man: ['TGX 29.480', 'TGX 33.540', 'TGS 33.440', 'TGM 26.290', 'TGL 12.220'],
    daf: ['XF 530', 'XF 480', 'CF 410', 'CF 340', 'LF 210'],
    iveco: ['S-Way 570', 'S-Way 480', 'Hi-Way 480', 'Tector 240E28', 'Tector 170E22', 'Daily 70C17'],
    volkswagen: ['Constellation 25.460', 'Constellation 19.360', 'Delivery 13.180', 'Delivery 11.180', 'Meteor 29.520', 'Worker 17.250']
  };

  marcaSelect.addEventListener('change', () => {
    const marca = marcaSelect.value;
    const modelos = modelosPorMarca[marca] || [];

    // Limpa opções anteriores
    modeloSelect.innerHTML = '<option value="">Modelo</option>';
    modeloSelect.disabled = !modelos.length;

    modelos.forEach(modelo => {
      const option = document.createElement('option');
      option.value = modelo.toLowerCase().replace(/\s+/g, '-');
      option.textContent = modelo;
      modeloSelect.appendChild(option);
    });
  });

  // Mesmo comportamento para o formulário de venda
  const sellMarca = $('#sellMarca');
  if (sellMarca) {
    sellMarca.addEventListener('change', () => {
      const modeloInput = $('#sellModelo');
      if (modeloInput) {
        const marca = sellMarca.value;
        const modelos = modelosPorMarca[marca] || [];
        if (modelos.length) {
          modeloInput.placeholder = `Ex: ${modelos[0]}`;
        }
      }
    });
  }
})();

/* ================================================================
   10. FORM VALIDATION — Sell form básico
   ================================================================ */
(function initFormValidation() {
  const form = $('.sell__form');
  if (!form) return;

  const phoneInput = $('#sellTelefone');

  // Máscara de telefone
  phoneInput?.addEventListener('input', (e) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 11) value = value.slice(0, 11);

    if (value.length > 10) {
      value = value.replace(/^(\d{2})(\d{5})(\d{4})$/, '($1) $2-$3');
    } else if (value.length > 6) {
      value = value.replace(/^(\d{2})(\d{4,5})(\d{0,4})$/, '($1) $2-$3');
    } else if (value.length > 2) {
      value = value.replace(/^(\d{2})(\d+)$/, '($1) $2');
    } else if (value.length > 0) {
      value = value.replace(/^(\d+)$/, '($1');
    }

    e.target.value = value;
  });

  // Validação ao submeter
  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const nome = $('#sellNome')?.value.trim();
    const telefone = phoneInput?.value.trim();
    const marca = $('#sellMarca')?.value;

    let errors = [];

    if (!nome || nome.length < 2) {
      errors.push('Por favor, insira seu nome completo.');
      $('#sellNome')?.focus();
    }
    if (!telefone || telefone.length < 14) {
      errors.push('Por favor, insira um telefone válido com DDD.');
      if (!nome || nome.length < 2) { /* já focou */ } else { phoneInput?.focus(); }
    }
    if (!marca) {
      errors.push('Por favor, selecione a marca do caminhão.');
    }

    if (errors.length) {
      // Exibe erro acessível
      showFormError(form, errors[0]);
      return;
    }

    // Sucesso — redireciona para página de vender
    const params = new URLSearchParams({
      nome: nome,
      telefone: telefone,
      marca: marca,
      modelo: $('#sellModelo')?.value || ''
    });

    // Na implementação real, submeter via fetch/API
    // Por ora, redireciona com params
    window.location.href = `/vender-caminhao/?${params.toString()}`;
  });

  function showFormError(form, message) {
    // Remove erro anterior
    const prev = form.querySelector('.form-error');
    if (prev) prev.remove();

    const error = document.createElement('div');
    error.className = 'form-error';
    error.setAttribute('role', 'alert');
    error.setAttribute('aria-live', 'assertive');
    error.style.cssText = `
      background: #FF3B3B;
      color: #fff;
      padding: 12px 16px;
      font-size: 14px;
      font-weight: 600;
      margin-bottom: 16px;
      border: 2px solid #CC0000;
    `;
    error.textContent = message;

    // Insere antes do primeiro campo
    const fieldset = form.querySelector('.sell__fieldset');
    if (fieldset) {
      form.insertBefore(error, fieldset);
    }

    error.focus();

    // Remove após 5s
    setTimeout(() => error.remove(), 5000);
  }
})();

/* ================================================================
   DROPDOWN NAVBAR — Acessível com teclado
   ================================================================ */
(function initNavDropdowns() {
  const dropdowns = $$('.navbar__dropdown');

  dropdowns.forEach(dropdown => {
    const trigger = $('.navbar__link', dropdown);
    const submenu = $('.navbar__submenu', dropdown);
    if (!trigger || !submenu) return;

    // Fecha dropdown ao pressionar Escape
    submenu.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        trigger.focus();
        submenu.style.opacity = '0';
        submenu.style.pointerEvents = 'none';
      }
    });
  });
})();

/* ================================================================
   LAZY LOAD IMAGES — Fallback para navegadores antigos
   ================================================================ */
(function initLazyLoad() {
  if ('loading' in HTMLImageElement.prototype) return; // Nativo suportado

  const images = $$('img[loading="lazy"]');
  if (!('IntersectionObserver' in window)) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          if (img.dataset.src) {
            img.src = img.dataset.src;
          }
          observer.unobserve(img);
        }
      });
    },
    { rootMargin: '200px' }
  );

  images.forEach(img => observer.observe(img));
})();

/* ================================================================
   SMOOTH SCROLL para âncoras internas
   ================================================================ */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', (e) => {
    const target = document.querySelector(anchor.getAttribute('href'));
    if (!target) return;

    e.preventDefault();
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });

    // Atualiza URL sem reload
    history.pushState(null, '', anchor.getAttribute('href'));

    // Foca o target (acessibilidade)
    if (!target.hasAttribute('tabindex')) {
      target.setAttribute('tabindex', '-1');
    }
    target.focus({ preventScroll: true });
  });
});

/* ================================================================
   PERFORMANCE — Preload de páginas ao hover (prefetch)
   Melhora navegação percebida sem prejudicar LCP
   ================================================================ */
(function initPrefetch() {
  if (!('IntersectionObserver' in window)) return;

  const links = new Set();

  function prefetchLink(href) {
    if (links.has(href)) return;
    links.add(href);

    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = href;
    document.head.appendChild(link);
  }

  // Prefetch ao hover em links internos
  document.addEventListener('mouseover', (e) => {
    const anchor = e.target.closest('a');
    if (!anchor) return;

    const href = anchor.getAttribute('href');
    if (!href || href.startsWith('http') || href.startsWith('#') || href.startsWith('mailto')) return;

    prefetchLink(href);
  }, { passive: true });
})();

/* ================================================================
   GDPR / LGPD — Desabilita scripts de terceiros se não consentiu
   Na implementação real, integrar com Google Tag Manager
   ================================================================ */
(function checkConsent() {
  const consent = storage.get('cookie_consent');
  if (consent === 'accepted') {
    // Aqui você carregaria Google Analytics, Google AdSense, etc.
    // Ex: loadGoogleAnalytics('G-XXXXXXXX');
    // Ex: loadAdSense();
    console.log('Cookies aceitos — analytics pode ser inicializado');
  } else if (!consent) {
    // Aguarda consentimento
    document.addEventListener('cookie_accepted', () => {
      console.log('Consentimento obtido — inicializando analytics');
    });
  }
})();

/* ================================================================
   LOG DE DESEMPENHO (apenas em dev)
   ================================================================ */
if (window.performance && window.location.hostname === 'localhost') {
  window.addEventListener('load', () => {
    const timing = performance.getEntriesByType('navigation')[0];
    if (timing) {
      console.log(
        `%c[CaminhãoBR Perf]%c LCP: ~${Math.round(timing.loadEventEnd)}ms | DOMContentLoaded: ${Math.round(timing.domContentLoadedEventEnd)}ms`,
        'color: #FF4D00; font-weight: bold',
        'color: inherit'
      );
    }
  });
}
