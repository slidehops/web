// ==========================
// MAIN SCRIPT
// ==========================
window.addEventListener('load', () => {
  const gallery = document.getElementById('gallery');
  const searchInput = document.getElementById('search-input');
  const rarityFilter = document.getElementById('rarity-filter');
  const typeFilter = document.getElementById('type-filter');
  const sortSelect = document.getElementById('sort-select');

  if (!window.skins || !Array.isArray(window.skins)) {
    gallery.innerHTML = '<p>Failed to load skins data.</p>';
    return;
  }

  const rarityLabels = [
    'Free', 'Uncommon', 'Rare', 'Epic', 'Legendary',
    'Relic', 'Contraband', 'Unobtainable', 'NFT'
  ];

  // ==========================
  // Process skins
  // ==========================
  const processedSkins = window.skins.map(skin => {
    const weaponId = Number(skin.weapon);
    const typeId = Number(skin.type);

    const skinType = (window.skinTypes?.[weaponId] || window.itemTypes?.[typeId] || "Unknown");
    const rarityIndex = (typeof skin.rarity === "number" && skin.rarity >= 0 && skin.rarity <= 8) ? skin.rarity : 0;
    const rarityLabel = rarityLabels[rarityIndex];

    return {
      ...skin,
      skinType,
      rarityIndex,
      rarityLabel,
      rarityClass: rarityLabel.toLowerCase()
    };
  });

  // ==========================
  // Populate type filter
  // ==========================
  const typeSet = [...new Set(processedSkins.map(s => s.skinType))].sort();
  typeSet.forEach(t => {
    const opt = document.createElement('option');
    opt.value = t.toLowerCase();
    opt.textContent = t;
    typeFilter.appendChild(opt);
  });

  // ==========================
  // POPUP ELEMENTS
  // ==========================
  const popupHolder = document.getElementById("popupHolder");
  const popupBack = document.getElementById("popupBack");
  const itemNameEl = document.getElementById("itemViewName");
  const itemTypeEl = document.getElementById("itemViewType");
  const itemFrame = document.getElementById("itemViewFrame");
  const itemImage = document.getElementById("itemViewImage");
  const itemInfoBtn = document.getElementById("itemInfoBtn");
  const itemViewPop = document.getElementById("itemViewPop");

  function showSkinPopup(skin) {
    popupHolder.style.display = "flex";

    // Immediately clear previous content to prevent flash
    itemNameEl.textContent = '';
    itemTypeEl.textContent = '';
    itemFrame.src = ''; // clear iframe
    itemImage.src = ''; // clear image

    // Remove old rarity classes
    itemTypeEl.className = "";
    itemViewPop.className = "";

    // Add new rarity classes
    itemTypeEl.classList.add(`itemViewType-${skin.rarityClass}`);
    itemViewPop.classList.add(`itemViewPop-${skin.rarityClass}`);

    // Set new content
    itemNameEl.textContent = skin.name;
    itemTypeEl.textContent = skin.skinType;

    // Paints don't have a 3D showcase - use their texture thumbnail directly
    const isPaint = skin.skinType === "Paint";

    if (isPaint) {
      itemFrame.style.display = "none";
      itemImage.style.display = "block";
      itemImage.src = skin.thumbnail;
    } else {
      itemImage.style.display = "none";
      itemFrame.style.display = "block";
      // Load iframe after a tiny delay to ensure clearing worked
      setTimeout(() => {
        itemFrame.src = `https://krunker.io/viewer.html?nobg&showcase=${skin.id}`;
      }, 0);
    }

    // More info button
    itemInfoBtn.onclick = () => {
      window.open(`https://krunker.io/social.html?p=itemsales&i=${skin.id}`, "_blank");
    };
  }

  popupBack.onclick = () => popupHolder.style.display = "none";

  // ==========================
  // Render gallery
  // ==========================
  function render(skins) {
    gallery.innerHTML = '';
    if (!skins.length) {
      gallery.innerHTML = '<p>No skins found.</p>';
      return;
    }

    skins.forEach(skin => {
      const card = document.createElement('div');
      card.className = `skin-card ${skin.rarityClass}`;

      // Name and type above the image
      card.innerHTML = `
        <div class="skin-name-type">
          <div class="skin-name">${skin.name}</div>
          <div class="skin-details">${skin.skinType}</div>
        </div>
        <img loading="lazy" src="${skin.thumbnail}" alt="${skin.name}" class="skin-img" />
      `;

      // Open popup on click
      card.addEventListener('click', () => showSkinPopup(skin));

      gallery.appendChild(card);
    });
  }

  // ==========================
  // Filter + Sort
  // ==========================
  function applyFilters() {
    const term = searchInput.value.toLowerCase();
    const rarity = rarityFilter.value;
    const type = typeFilter.value;
    const sort = sortSelect.value;

    let filtered = processedSkins.filter(s =>
      s.name.toLowerCase().includes(term) ||
      s.skinType.toLowerCase().includes(term) ||
      s.rarityLabel.toLowerCase().includes(term)
    );

    if (rarity) filtered = filtered.filter(s => s.rarityClass === rarity);
    if (type) filtered = filtered.filter(s => s.skinType.toLowerCase() === type);

    filtered.sort((a, b) => {
      if (sort === "name") return a.name.localeCompare(b.name);
      if (sort === "type") return a.skinType.localeCompare(b.skinType);
      if (sort === "id") return Number(a.id) - Number(b.id);
      return b.rarityIndex - a.rarityIndex; // default: rarity descending
    });

    render(filtered);
  }

  // Initial render
  applyFilters();

  // Event listeners
  searchInput.addEventListener("input", applyFilters);
  rarityFilter.addEventListener("change", applyFilters);
  typeFilter.addEventListener("change", applyFilters);
  sortSelect.addEventListener("change", applyFilters);
});
