document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('charm-builder-app');
  if (!container) return;

  // Configuration & Dynamic State
  let basePrice = parseInt(container.dataset.basePrice, 10) || 149;
  let currentBaseVariantId = container.dataset.variantId || '49708673466595';
  let selectedBaseType = 'Phone Charm Cord';
  let selectedTheme = 'Pastel Dream';
  let selectedCordColor = 'Classic Black';
  let selectedCharms = [];
  const MAX_CHARMS = 4;

  // DOM Elements
  const cordSlot = document.getElementById('charms-render-slot');
  const visualCord = document.getElementById('visual-cord');
  const charmCounter = document.getElementById('charm-counter');
  const clearBtn = document.getElementById('clear-charms-btn');
  const submitBtn = document.getElementById('submit-custom-charm-btn');
  const statusMsg = document.getElementById('cart-status-msg');
  const customNotesInput = document.getElementById('custom-notes-input');

  // Preview Card Elements
  const previewBaseName = document.getElementById('preview-base-name');
  const previewThemeName = document.getElementById('preview-theme-name');
  const previewNameBadge = document.getElementById('preview-name-badge');
  const nameInput = document.getElementById('personalized-name-input');
  const ledgerBasePrice = document.getElementById('ledger-base-price');
  const ledgerAddonsPrice = document.getElementById('ledger-addons-price');
  const totalPriceTag = document.getElementById('total-price-tag');

  // ---------------------------------------------------------
  // 1. Base Item Selection
  // ---------------------------------------------------------
  document.querySelectorAll('input[name="base-type"]').forEach((radio) => {
    if (radio.checked) {
      selectedBaseType = radio.value;
      basePrice = parseInt(radio.dataset.price, 10) || basePrice;

      if (radio.dataset.variantId) {
        currentBaseVariantId = radio.dataset.variantId;
      }
    }

    radio.addEventListener('change', (e) => {
      document
        .querySelectorAll('.base-option-card')
        .forEach((c) => c.classList.remove('active'));

      const parentCard = e.target.closest('.base-option-card');

      if (parentCard) {
        parentCard.classList.add('active');
      }

      selectedBaseType = e.target.value;
      basePrice = parseInt(e.target.dataset.price, 10) || 149;

      if (e.target.dataset.variantId) {
        currentBaseVariantId = e.target.dataset.variantId;
      }

      if (previewBaseName) {
        previewBaseName.textContent =
          e.target.dataset.displayName || selectedBaseType;
      }

      if (visualCord) {
        if (selectedBaseType === 'Bag Clip Charm') {
          visualCord.classList.add('is-bag-clip');
        } else {
          visualCord.classList.remove('is-bag-clip');
        }
      }

      updateCanvasAndTotal();
    });
  });

  // ---------------------------------------------------------
  // 2. Theme / Colour Palette
  // ---------------------------------------------------------
  document.querySelectorAll('input[name="theme-palette"]').forEach((radio) => {
    if (radio.checked) {
      selectedTheme = radio.value;
    }

    radio.addEventListener('change', (e) => {
      document
        .querySelectorAll('.theme-pill-btn')
        .forEach((p) => p.classList.remove('active'));

      const parentPill = e.target.closest('.theme-pill-btn');

      if (parentPill) {
        parentPill.classList.add('active');
      }

      selectedTheme = e.target.value;

      if (previewThemeName) {
        previewThemeName.textContent = `${selectedTheme} Palette`;
      }
    });
  });

  // ---------------------------------------------------------
  // 3. Personalized Name
  // ---------------------------------------------------------
  if (nameInput && previewNameBadge) {
    nameInput.addEventListener('input', (e) => {
      const val = e.target.value.trim().toUpperCase();

      if (val.length > 0) {
        previewNameBadge.style.display = 'inline-block';
        previewNameBadge.textContent = val;
      } else {
        previewNameBadge.style.display = 'none';
      }
    });
  }

  // ---------------------------------------------------------
  // 4. Special Add-ons
  // ---------------------------------------------------------
  document.querySelectorAll('.special-addon-cb').forEach((cb) => {
    cb.addEventListener('change', () => {
      updateCanvasAndTotal();
    });
  });

  // ---------------------------------------------------------
  // 5. Add Charm
  // ---------------------------------------------------------
  document
    .querySelectorAll('.charm-card:not(.is-sold-out) .add-charm-btn')
    .forEach((btn) => {
      btn.addEventListener('click', (e) => {
        if (selectedCharms.length >= MAX_CHARMS) {
          alert(
            `You can string a maximum of ${MAX_CHARMS} charms on this piece!`
          );
          return;
        }

        const card = e.target.closest('.charm-card');

        if (!card) return;

        const charmData = {
          id: card.dataset.charmId,
          name: card.dataset.charmName,
          price: parseInt(card.dataset.price, 10) || 0,
          img: card.dataset.img || null,
          emoji: card.dataset.emoji || '✨'
        };

        selectedCharms.push(charmData);

        updateCanvasAndTotal();

        // Mobile-friendly feedback
        if (window.innerWidth <= 600) {
          card.classList.add('is-added');

          setTimeout(() => {
            card.classList.remove('is-added');
          }, 500);
        }
      });
    });

  // ---------------------------------------------------------
  // 6. Remove Charm
  // ---------------------------------------------------------
  if (cordSlot) {
    cordSlot.addEventListener('click', (e) => {
      const deleteBtn = e.target.closest('.remove-charm-tag');

      if (!deleteBtn) return;

      const index = parseInt(deleteBtn.dataset.index, 10);

      if (!Number.isNaN(index)) {
        selectedCharms.splice(index, 1);
        updateCanvasAndTotal();
      }
    });
  }

  // ---------------------------------------------------------
  // 7. Reset All Charms
  // ---------------------------------------------------------
  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      selectedCharms = [];
      updateCanvasAndTotal();
    });
  }

  // ---------------------------------------------------------
  // 8. Update Preview & Pricing
  // ---------------------------------------------------------
  function updateCanvasAndTotal() {
    if (charmCounter) {
      charmCounter.textContent = selectedCharms.length;
    }

    if (cordSlot) {
      if (selectedCharms.length === 0) {
        cordSlot.innerHTML =
          `<span class="empty-state-hint">Tap charms to attach them to your piece!</span>`;
      } else {
        cordSlot.innerHTML = selectedCharms
          .map(
            (item, idx) => `
              <div class="rendered-charm-item">
                ${
                  item.img
                    ? `<img src="${item.img}" alt="${item.name}" class="strung-charm-img">`
                    : `<span class="charm-bead">${item.emoji}</span>`
                }

                <span class="charm-name-tag">${item.name}</span>

                <button
                  type="button"
                  class="remove-charm-tag"
                  data-index="${idx}"
                  title="Remove"
                  aria-label="Remove ${item.name}"
                >
                  ×
                </button>
              </div>
            `
          )
          .join('');
      }
    }

    const charmsPrice = selectedCharms.reduce(
      (acc, curr) => acc + curr.price,
      0
    );

    let specialAddonsPrice = 0;

    document
      .querySelectorAll('.special-addon-cb:checked')
      .forEach((cb) => {
        specialAddonsPrice += parseInt(cb.dataset.price, 10) || 0;
      });

    const totalAddonsPrice = charmsPrice + specialAddonsPrice;
    const finalCalculatedPrice = basePrice + totalAddonsPrice;

    if (ledgerBasePrice) {
      ledgerBasePrice.textContent = `₹${basePrice}.00`;
    }

    if (ledgerAddonsPrice) {
      ledgerAddonsPrice.textContent = `₹${totalAddonsPrice}.00`;
    }

    if (totalPriceTag) {
      totalPriceTag.textContent = `₹${finalCalculatedPrice}.00`;
    }

    // Keep mobile sticky price updated if present
    const mobileTotal = document.getElementById('mobile-total-price');

    if (mobileTotal) {
      mobileTotal.textContent = `₹${finalCalculatedPrice}.00`;
    }

    const mobileCharmCount = document.getElementById(
      'mobile-charm-counter'
    );

    if (mobileCharmCount) {
      mobileCharmCount.textContent = selectedCharms.length;
    }
  }

  // ---------------------------------------------------------
  // 9. Submit to Shopify Cart
  // ---------------------------------------------------------
  if (submitBtn) {
    submitBtn.addEventListener('click', async (e) => {
      e.preventDefault();

      submitBtn.disabled = true;
      submitBtn.textContent = 'Adding to Bag...';

      if (statusMsg) {
        statusMsg.textContent = '';
      }

      const charmSummary = selectedCharms
        .map(
          (c, i) =>
            `${i + 1}. ${c.name} (+₹${c.price})`
        )
        .join(' | ');

      const note = customNotesInput
        ? customNotesInput.value.trim()
        : '';

      const personalizedName = nameInput
        ? nameInput.value.trim().toUpperCase()
        : '';

      const selectedAddonsList = [];

      document
        .querySelectorAll('.special-addon-cb:checked')
        .forEach((cb) => {
          selectedAddonsList.push(cb.dataset.name);
        });

      const bundleId = 'bundle_' + Date.now();

      const parsedBaseVariantId = parseInt(
        currentBaseVariantId,
        10
      );

      if (Number.isNaN(parsedBaseVariantId)) {
        alert('Please select a valid base product.');

        submitBtn.disabled = false;
        submitBtn.textContent = 'Add Custom Design To Bag';

        return;
      }

      const itemsPayload = [
        {
          id: parsedBaseVariantId,
          quantity: 1,
          properties: {
            '_bundle_id': bundleId,
            'Base Item': selectedBaseType,
            'Theme Palette': selectedTheme,
            'Personalized Name': personalizedName || 'None',
            'Selected Charms':
              charmSummary || 'None (Plain Base)',
            'Special Add-ons':
              selectedAddonsList.length > 0
                ? selectedAddonsList.join(', ')
                : 'None',
            'Custom Note / Instructions':
              note || 'None'
          }
        }
      ];

      // Add charm variants
      selectedCharms.forEach((charm) => {
        if (charm.id && !Number.isNaN(Number(charm.id))) {
          itemsPayload.push({
            id: parseInt(charm.id, 10),
            quantity: 1,
            properties: {
              '_bundle_id': bundleId,
              '_bundle_child': 'true'
            }
          });
        }
      });

      // Add special add-on variants
      document
        .querySelectorAll('.special-addon-cb:checked')
        .forEach((cb) => {
          const addonVariantId = cb.dataset.variantId;

          if (
            addonVariantId &&
            !Number.isNaN(Number(addonVariantId))
          ) {
            itemsPayload.push({
              id: parseInt(addonVariantId, 10),
              quantity: 1,
              properties: {
                '_bundle_id': bundleId,
                '_bundle_child': 'true'
              }
            });
          }
        });

      try {
        const res = await fetch('/cart/add.js', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json'
          },
          body: JSON.stringify({
            items: itemsPayload
          })
        });

        const data = await res.json();

        if (res.ok) {
          if (statusMsg) {
            statusMsg.style.color = '#712423';
            statusMsg.textContent =
              'Added to Bag! Redirecting to cart...';
          }

          window.location.href = '/cart';
        } else {
          throw new Error(
            data.description ||
              data.message ||
              'Could not add to cart.'
          );
        }
      } catch (err) {
        console.error('Cart submission error:', err);

        alert('Cart Error: ' + err.message);

        if (statusMsg) {
          statusMsg.style.color = '#712423';
          statusMsg.textContent = err.message;
        }

        submitBtn.disabled = false;
        submitBtn.textContent =
          'Add Custom Design To Bag';
      }
    });
  }

  // ---------------------------------------------------------
  // 10. Initial State
  // ---------------------------------------------------------
  updateCanvasAndTotal();
});

// ---------------------------------------------------------
// Shop Collection Reveal
// ---------------------------------------------------------
document.addEventListener('DOMContentLoaded', () => {
  const triggerBtn = document.getElementById(
    'shop-collection-trigger'
  );

  const drawer = document.getElementById(
    'shop-collection-drawer'
  );

  const closeBtn = document.getElementById(
    'close-tray-btn'
  );

  if (triggerBtn && drawer) {
    triggerBtn.addEventListener('click', (e) => {
      e.preventDefault();

      const isOpen = drawer.classList.toggle('open');

      triggerBtn.classList.toggle(
        'is-active',
        isOpen
      );

      triggerBtn.setAttribute(
        'aria-expanded',
        isOpen
      );

      if (isOpen) {
        drawer.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest'
        });
      }
    });

    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        drawer.classList.remove('open');

        triggerBtn.classList.remove(
          'is-active'
        );

        triggerBtn.setAttribute(
          'aria-expanded',
          'false'
        );
      });
    }
  }
});

// ---------------------------------------------------------
// Mobile Header Drawer
// ---------------------------------------------------------
document.addEventListener('DOMContentLoaded', () => {
  const openBtn = document.getElementById(
    'mobile-menu-open-btn'
  );

  const closeBtn = document.getElementById(
    'mobile-menu-close-btn'
  );

  const backdrop = document.getElementById(
    'mobile-menu-close-backdrop'
  );

  const drawer = document.getElementById(
    'titli-nav-flyout'
  );

  function openMenu() {
    if (drawer) {
      if (drawer.parentElement !== document.body) {
        document.body.appendChild(drawer);
      }
      drawer.classList.add('is-active');
      document.body.classList.add(
        'mobile-menu-open'
      );
    }
  }

  function closeMenu() {
    if (drawer) {
      drawer.classList.remove('is-active');
      document.body.classList.remove(
        'mobile-menu-open'
      );
    }
  }

  if (openBtn) {
    openBtn.addEventListener('click', openMenu);
  }

  if (closeBtn) {
    closeBtn.addEventListener('click', closeMenu);
  }

  if (backdrop) {
    backdrop.addEventListener('click', closeMenu);
  }

  // Close menu when clicking links inside drawer
  if (drawer) {
    const flyoutLinks = drawer.querySelectorAll('.flyout-links a');
    flyoutLinks.forEach((link) => {
      link.addEventListener('click', closeMenu);
    });
  }

  // Close menu when Escape is pressed
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeMenu();
    }
  });
});

// ---------------------------------------------------------
// Product Catalog Smooth Scroll & Filtering
// ---------------------------------------------------------
document.addEventListener('DOMContentLoaded', () => {
  const shopBtn =
    document.getElementById(
      'hero-shop-collection-btn'
    ) ||
    document.querySelector(
      'a[href="#product-catalog"]'
    );

  if (shopBtn) {
    shopBtn.addEventListener('click', (e) => {
      const target = document.getElementById(
        'product-catalog'
      );

      if (target) {
        e.preventDefault();

        target.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    });
  }

  const pills = document.querySelectorAll(
    '.catalog-filter-pill'
  );

  const searchInput = document.getElementById(
    'catalog-search-input'
  );

  const cards = document.querySelectorAll(
    '#catalog-products-grid .titli-product-card'
  );

  function applyFilters() {
    const activePill = document.querySelector(
      '.catalog-filter-pill.active'
    );

    const filter = activePill
      ? activePill.dataset.filter
      : 'all';

    const query = searchInput
      ? searchInput.value.trim().toLowerCase()
      : '';

    cards.forEach((card) => {
      const title =
        card.dataset.title || '';

      const type =
        card.dataset.type || '';

      const matchesFilter =
        filter === 'all' ||
        type.includes(filter);

      const matchesSearch =
        query === '' ||
        title.includes(query);

      card.style.display =
        matchesFilter && matchesSearch
          ? 'flex'
          : 'none';
    });
  }

  pills.forEach((pill) => {
    pill.addEventListener('click', () => {
      pills.forEach((p) =>
        p.classList.remove('active')
      );

      pill.classList.add('active');

      applyFilters();
    });
  });

  if (searchInput) {
    searchInput.addEventListener(
      'input',
      applyFilters
    );
  }
});

// ---------------------------------------------------------
// Collection Live Search (Dynamic for Infinite Scroll)
// ---------------------------------------------------------
document.addEventListener('DOMContentLoaded', () => {
  const searchInput = document.getElementById('collection-live-search');

  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      const term = e.target.value.trim().toLowerCase();
      const currentCards = document.querySelectorAll(
        '#collection-products-grid .titli-product-card'
      );

      currentCards.forEach((card) => {
        const title = (card.getAttribute('data-title') || '').toLowerCase();
        card.style.display =
          term === '' || title.includes(term) ? 'flex' : 'none';
      });
    });
  }
});

// ---------------------------------------------------------
// Collection Infinite Scroll & "Load More" Controller
// ---------------------------------------------------------
document.addEventListener('DOMContentLoaded', () => {
  const paginationContainer = document.getElementById('collection-pagination-container');
  const productGrid = document.getElementById('collection-products-grid');
  const loadMoreBtn = document.getElementById('titli-load-more-btn');
  const sentinel = document.getElementById('infinite-scroll-sentinel');
  const countSpan = document.getElementById('pagination-loaded-count');
  const progressFill = document.getElementById('pagination-progress-fill');
  const completedMsg = document.getElementById('pagination-completed-msg');
  const searchInput = document.getElementById('collection-live-search');

  if (!paginationContainer || !productGrid) return;

  let isLoading = false;
  let observer = null;

  function getLoadedCount() {
    return productGrid.querySelectorAll('.titli-product-card').length;
  }

  function getTotalItems() {
    return parseInt(paginationContainer.getAttribute('data-total-items'), 10) || 0;
  }

  function updateProgress() {
    const loaded = getLoadedCount();
    const total = getTotalItems();
    if (countSpan) {
      countSpan.textContent = loaded > total ? total : loaded;
    }
    if (progressFill && total > 0) {
      const pct = Math.min(100, Math.round((loaded / total) * 100));
      progressFill.style.width = pct + '%';
    }
  }

  function finishPagination() {
    if (observer) {
      observer.disconnect();
    }
    if (loadMoreBtn) {
      loadMoreBtn.style.display = 'none';
    }
    if (completedMsg) {
      completedMsg.style.display = 'flex';
    }
    updateProgress();
  }

  async function loadNextPage() {
    if (isLoading) return;
    const nextUrl = paginationContainer.getAttribute('data-next-url');
    if (!nextUrl) {
      finishPagination();
      return;
    }

    isLoading = true;
    if (loadMoreBtn) {
      loadMoreBtn.classList.add('is-loading');
      const textEl = loadMoreBtn.querySelector('.btn-text');
      if (textEl) textEl.textContent = 'Curating more treasures...';
    }

    try {
      const response = await fetch(nextUrl);
      if (!response.ok) throw new Error('Network error loading products');
      const htmlText = await response.text();
      const parser = new DOMParser();
      const doc = parser.parseFromString(htmlText, 'text/html');

      const incomingCards = Array.from(doc.querySelectorAll('#collection-products-grid .titli-product-card'));
      if (incomingCards.length > 0) {
        const searchTerm = searchInput ? searchInput.value.trim().toLowerCase() : '';

        incomingCards.forEach((card, index) => {
          card.classList.add('scroll-animate');
          if (searchTerm) {
            const title = (card.getAttribute('data-title') || '').toLowerCase();
            card.style.display = title.includes(searchTerm) ? 'flex' : 'none';
          }
          productGrid.appendChild(card);
          
          // Smooth staggered reveal animation
          setTimeout(() => {
            card.classList.add('is-visible');
          }, 35 * (index % 6));
        });
      }

      // Check for next page URL from fetched container
      const nextContainer = doc.getElementById('collection-pagination-container');
      const newNextUrl = nextContainer ? nextContainer.getAttribute('data-next-url') : null;

      if (newNextUrl) {
        paginationContainer.setAttribute('data-next-url', newNextUrl);
        updateProgress();
      } else {
        paginationContainer.removeAttribute('data-next-url');
        finishPagination();
      }

      // Update browser history URL query parameter unobtrusively
      try {
        const nextUrlObj = new URL(nextUrl, window.location.origin);
        window.history.replaceState(null, '', nextUrlObj.search || window.location.pathname);
      } catch (e) {
        // Safe fallback
      }

    } catch (err) {
      console.error('Failed to load next page products:', err);
      if (loadMoreBtn) {
        const textEl = loadMoreBtn.querySelector('.btn-text');
        if (textEl) textEl.textContent = 'Retry Loading Pieces ↻';
      }
    } finally {
      isLoading = false;
      if (loadMoreBtn && paginationContainer.getAttribute('data-next-url')) {
        loadMoreBtn.classList.remove('is-loading');
        const textEl = loadMoreBtn.querySelector('.btn-text');
        if (textEl) textEl.textContent = 'Load More Treasures ✨';
      }
    }
  }

  // Click on Load More button
  if (loadMoreBtn) {
    loadMoreBtn.addEventListener('click', (e) => {
      e.preventDefault();
      loadNextPage();
    });
  }

  // Smooth Intersection Observer for Auto-Loading when user scrolls near the bottom
  if (sentinel && 'IntersectionObserver' in window) {
    observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && !isLoading) {
          loadNextPage();
        }
      });
    }, {
      rootMargin: '300px 0px 300px 0px',
      threshold: 0.05
    });

    observer.observe(sentinel);
  }

  // Initial progress sync
  updateProgress();
});

// ---------------------------------------------------------
// Homepage Featured Catalog Filter + Sort
// ---------------------------------------------------------
document.addEventListener('DOMContentLoaded', () => {
  const pills = document.querySelectorAll(
    '.catalog-filter-pill'
  );

  const searchInput = document.getElementById(
    'catalog-search-input'
  );

  const sortSelect = document.getElementById(
    'catalog-sort-select'
  );

  const grid = document.getElementById(
    'catalog-products-grid'
  );

  if (!grid) return;

  function runFilterAndSort() {
    const cards = Array.from(
      grid.querySelectorAll(
        '.titli-product-card'
      )
    );

    const activePill =
      document.querySelector(
        '.catalog-filter-pill.active'
      );

    const filter = activePill
      ? activePill.dataset.filter
      : 'all';

    const query = searchInput
      ? searchInput.value
          .trim()
          .toLowerCase()
      : '';

    cards.forEach((card) => {
      const title =
        card.dataset.title || '';

      const type =
        card.dataset.type || '';

      const matchesFilter =
        filter === 'all' ||
        type.includes(filter);

      const matchesSearch =
        query === '' ||
        title.includes(query);

      card.style.display =
        matchesFilter && matchesSearch
          ? 'flex'
          : 'none';
    });

    if (sortSelect) {
      const val = sortSelect.value;

      cards.sort((a, b) => {
        const priceA =
          parseFloat(
            a.dataset.price
          ) || 0;

        const priceB =
          parseFloat(
            b.dataset.price
          ) || 0;

        const titleA =
          a.dataset.title || '';

        const titleB =
          b.dataset.title || '';

        if (val === 'price-low') {
          return priceA - priceB;
        }

        if (val === 'price-high') {
          return priceB - priceA;
        }

        if (val === 'newest') {
          return titleA.localeCompare(
            titleB
          );
        }

        return 0;
      });

      cards.forEach((card) => {
        grid.appendChild(card);
      });
    }
  }

  pills.forEach((pill) => {
    pill.addEventListener('click', () => {
      pills.forEach((p) =>
        p.classList.remove('active')
      );

      pill.classList.add('active');

      runFilterAndSort();
    });
  });

  if (searchInput) {
    searchInput.addEventListener(
      'input',
      runFilterAndSort
    );
  }

  if (sortSelect) {
    sortSelect.addEventListener(
      'change',
      runFilterAndSort
    );
  }
});

// ---------------------------------------------------------
// Price Colour Enforcer
// ---------------------------------------------------------
(function enforceRubyPriceColors() {
  function applyColor() {
    const priceNodes =
      document.querySelectorAll(`
        [class*="price"],
        [id*="price"],
        [class*="total"],
        [id*="total"],
        .cart-item-price,
        .subtotal-price,
        .subtotal-amount
      `);

    priceNodes.forEach((node) => {
      if (
        !node.classList.contains(
          'price-compare-large'
        )
      ) {
        node.style.setProperty(
          'color',
          '#712423',
          'important'
        );

        node.style.setProperty(
          'font-weight',
          '800',
          'important'
        );
      }
    });

    document
      .querySelectorAll('*')
      .forEach((el) => {
        if (
          el.children.length === 0 &&
          (
            el.textContent.includes('Rs.') ||
            el.textContent.includes('₹')
          )
        ) {
          el.style.setProperty(
            'color',
            '#712423',
            'important'
          );

          el.style.setProperty(
            'font-weight',
            '800',
            'important'
          );
        }
      });
  }

  if (
    document.readyState ===
    'loading'
  ) {
    document.addEventListener(
      'DOMContentLoaded',
      applyColor
    );
  } else {
    applyColor();
  }

  const observer =
    new MutationObserver(applyColor);

  observer.observe(
    document.documentElement,
    {
      childList: true,
      subtree: true
    }
  );
})();

// ---------------------------------------------------------
// Type Switch: Bag Clip vs Phone Charm
// ---------------------------------------------------------
document.addEventListener('DOMContentLoaded', () => {
  const typeButtons =
    document.querySelectorAll(
      '.type-switch-row .type-btn'
    );

  const bagClipStage =
    document.getElementById(
      'bagClipAssembly'
    );

  const phoneCharmStage =
    document.getElementById(
      'phoneCharmAssembly'
    );

  const stageTitle =
    document.getElementById(
      'stageMainTitle'
    );

  // Only run if this part of the builder exists and titliCustomizerApp is not managing it
  if (document.getElementById('titliCustomizerApp') || !typeButtons.length) return;

  typeButtons.forEach((btn) => {
    btn.addEventListener(
      'click',
      function () {
        typeButtons.forEach((b) =>
          b.classList.remove('active')
        );

        btn.classList.add('active');

        const chosenType =
          btn.getAttribute(
            'data-type'
          );

        if (
          chosenType ===
          'bag-clip'
        ) {
          if (typeof state !== 'undefined') {
            state.modelType =
              'Bag Clip Charm';

            state.basePrice = 299;
          }

          if (bagClipStage) {
            bagClipStage.style.display =
              'flex';
          }

          if (phoneCharmStage) {
            phoneCharmStage.style.display =
              'none';
          }

          if (stageTitle) {
            stageTitle.textContent =
              'Multi-Strand Bag Clip Builder';
          }
        } else {
          if (typeof state !== 'undefined') {
            state.modelType =
              'Phone Strap Charm';

            state.basePrice = 249;
          }

          if (bagClipStage) {
            bagClipStage.style.display =
              'none';
          }

          if (phoneCharmStage) {
            phoneCharmStage.style.display =
              'flex';
          }

          if (stageTitle) {
            stageTitle.textContent =
              'Custom Phone Strap Builder';
          }
        }

        if (
          typeof updatePrice ===
          'function'
        ) {
          updatePrice();
        }
      }
    );
  });

  // Support URL query parameter
  // Example:
  // /pages/customizer?type=bag-clip
  const urlParams =
    new URLSearchParams(
      window.location.search
    );

  const typeParam =
    urlParams.get('type');

  if (
    typeParam ===
    'bag-clip'
  ) {
    const bagClipBtn =
      document.querySelector(
        '.type-btn[data-type="bag-clip"]'
      );

    if (bagClipBtn) {
      bagClipBtn.click();
    }
  }
});