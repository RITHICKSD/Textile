// --- AuraWeave Studio JS Logic --- //

// 1. Initial State Initialization
document.addEventListener("DOMContentLoaded", () => {
  // Load saved theme
  const savedTheme = localStorage.getItem("theme") || "light-theme";
  document.body.className = savedTheme;
  updateThemeToggleIcon(savedTheme);

  // Load saved direction
  const savedDir = localStorage.getItem("dir") || "ltr";
  document.documentElement.setAttribute("dir", savedDir);
  const dirTexts = document.querySelectorAll(".direction-text");
  const dirIndicators = document.querySelectorAll(".direction-circle-indicator");
  if (savedDir === "rtl") {
    dirTexts.forEach(txt => txt.textContent = "RTL");
    dirIndicators.forEach(ind => ind.style.backgroundColor = "var(--accent-gold)");
  } else {
    dirTexts.forEach(txt => txt.textContent = "LTR");
    dirIndicators.forEach(ind => ind.style.backgroundColor = "var(--accent-color)");
  }

  // Initialize interactive components
  initLoomSimulator();
  recalculatePrice();
  handleBeforeAfterSlider(50); // Set restoration slider in middle
  initLeafletMap();
});

// 2. Dynamic View Switching
function switchView(viewId) {
  // Hide all views
  const views = document.querySelectorAll(".view-container");
  views.forEach(view => view.classList.remove("active"));

  // Show active view
  const activeView = document.getElementById(`${viewId}-view`);
  if (activeView) {
    activeView.classList.add("active");
  }

  // Header and footer should be visible on all active views
  const header = document.getElementById("site-header");
  const footer = document.getElementById("site-footer");
  if (header) header.style.display = "";
  if (footer) footer.style.display = "";

  // Update navigation active states
  updateNavActiveState(viewId);

  // If switching to contact view, trigger leaflet map recalculation
  if (viewId === 'contact' && window.contactMap) {
    setTimeout(() => {
      window.contactMap.invalidateSize();
    }, 150);
  }

  // Scroll to top of the page
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function updateNavActiveState(viewId) {
  // Clear previous active states on navigation links
  const links = document.querySelectorAll(".nav-link, .dropdown-item");
  links.forEach(link => link.classList.remove("active"));

  // Find matching links and apply active highlight
  const targetLink = document.getElementById(`link-${viewId}`);
  if (targetLink) {
    targetLink.classList.add("active");
  }

  // Highlight parent dropdown links if children are active
  const homeDropdown = document.getElementById("home-menu-link");

  if (viewId === "home1" || viewId === "home2") {
    if (homeDropdown) homeDropdown.classList.add("active");
  } else {
    if (homeDropdown) homeDropdown.classList.remove("active");
  }
}

// 3. Dark/Light Theme Switcher
function toggleTheme() {
  const currentTheme = document.body.className;
  let newTheme = "light-theme";

  if (currentTheme === "light-theme") {
    newTheme = "dark-theme";
  }

  document.body.className = newTheme;
  localStorage.setItem("theme", newTheme);
  updateThemeToggleIcon(newTheme);
}

function updateThemeToggleIcon(theme) {
  const sunIcons = document.querySelectorAll(".sun-icon");
  const moonIcons = document.querySelectorAll(".moon-icon");
  if (theme === "dark-theme") {
    sunIcons.forEach(icon => icon.style.display = "block");
    moonIcons.forEach(icon => icon.style.display = "none");
  } else {
    sunIcons.forEach(icon => icon.style.display = "none");
    moonIcons.forEach(icon => icon.style.display = "block");
  }
}

// 4. LTR/RTL Layout Switching
function toggleDirection() {
  const htmlEl = document.documentElement;
  const dirTexts = document.querySelectorAll(".direction-text");
  const dirIndicators = document.querySelectorAll(".direction-circle-indicator");
  const currentDir = htmlEl.getAttribute("dir") || "ltr";

  if (currentDir === "ltr") {
    htmlEl.setAttribute("dir", "rtl");
    localStorage.setItem("dir", "rtl");
    dirTexts.forEach(txt => txt.textContent = "RTL");
    dirIndicators.forEach(ind => ind.style.backgroundColor = "var(--accent-gold)");
    showNoticeToast("Layout switched to RTL (Right-to-Left) mode.");
  } else {
    htmlEl.setAttribute("dir", "ltr");
    localStorage.setItem("dir", "ltr");
    dirTexts.forEach(txt => txt.textContent = "LTR");
    dirIndicators.forEach(ind => ind.style.backgroundColor = "var(--accent-color)");
    showNoticeToast("Layout switched to LTR (Left-to-Right) mode.");
  }
}

// 5. Loom Shuttle Simulator
let loomWarpCount = 18;
let currentWeftColor = "#c96b4c";

function initLoomSimulator() {
  const warpsContainer = document.getElementById("mini-loom-warps");
  if (!warpsContainer) return;

  warpsContainer.innerHTML = "";
  for (let i = 0; i < loomWarpCount; i++) {
    const thread = document.createElement("div");
    thread.classList.add("warp-thread");
    if (i % 2 === 0) thread.classList.add("tense");
    warpsContainer.appendChild(thread);
  }
}

function triggerLoomCycle(event) {
  event.preventDefault();
  const shuttle = document.getElementById("mini-loom-shuttle");
  const weftsContainer = document.getElementById("mini-loom-wefts");

  if (!shuttle || !weftsContainer) return;

  // Move shuttle across
  shuttle.style.left = "90%";

  setTimeout(() => {
    // Add woven row
    const row = document.createElement("div");
    row.classList.add("weft-row");
    row.style.backgroundColor = currentWeftColor;
    weftsContainer.appendChild(row);

    // Swap warp tensions for visual effect
    const warps = document.querySelectorAll(".warp-thread");
    warps.forEach(warp => warp.classList.toggle("tense"));

    // Return shuttle
    setTimeout(() => {
      shuttle.style.left = "-60px";
    }, 300);
  }, 400);
}

function updateSkeinColor(color) {
  currentWeftColor = color;
  const drawSkein = document.getElementById("yarn-skein-draw");
  const selectors = document.querySelectorAll(".hue-selector");

  // Update SVG colors
  if (drawSkein) {
    const ellipses = drawSkein.querySelectorAll("ellipse");
    if (ellipses.length >= 2) {
      ellipses[0].setAttribute("stroke", color);
    }
  }

  // Update swatch buttons
  selectors.forEach(sel => {
    sel.classList.remove("active");
    if (sel.style.backgroundColor === color || rgbToHex(sel.style.backgroundColor) === color) {
      sel.classList.add("active");
    }
  });

  showNoticeToast(`Weaving yarns updated to botanical dye shade: ${color}`);
}

// 6. Tour Steps Selection (Heritage process)
function selectTourStep(stepNum) {
  const stepItems = document.querySelectorAll(".step-item");
  const stepTitle = document.getElementById("tour-step-title");
  const stepDesc = document.getElementById("tour-step-desc");
  const imgEl = document.getElementById("tour-step-image");

  // Reset steps
  stepItems.forEach(item => item.classList.remove("active"));
  document.getElementById(`step-btn-${stepNum}`).classList.add("active");

  const stepsData = {
    1: {
      title: "Warping the Loom",
      desc: "Warping is the critical first stage. High-tensile cotton cords are wound meticulously onto the structural steel or wood frame loom, creating the vertical foundation of the tapestry. Equal tension across all warp cords is paramount to prevent distortions in the final wall hanging.",
      imgSrc: "t7.webp"
    },
    2: {
      title: "Weft Interlacing",
      desc: "Horizontal yarns (weft) are threaded over and under the vertical warps. Weavers utilize bone or wooden shuttles to slide threads, beating them downwards with heavy metal weaving combs to compact the rows and build solid block patterns.",
      imgSrc: "t8.webp"
    },
    3: {
      title: "Knotting & Tufting",
      desc: "To construct organic pile depth, we hand-tie complex Rya loops and heavy unspun wool roving directly onto the warp cords. Shearing these loops creates dense, soft-cut surfaces contrasted by long, flat-woven details.",
      imgSrc: "t9.webp"
    }
  };

  const currentStep = stepsData[stepNum];
  stepTitle.textContent = currentStep.title;
  stepDesc.textContent = currentStep.desc;
  if (imgEl) {
    imgEl.src = currentStep.imgSrc;
    imgEl.alt = currentStep.title;
  }
}

// 7. Commission Pricing Configurator
let selectedWidth = 36;
let selectedHeight = 48;
let selectedPaletteName = "Desert Sunset";
let selectedPaletteGradient = "linear-gradient(to right, #c86a4b, #d99f59, #e8dfd5)";

function updateCommissionPrice(width, height, btnElement) {
  selectedWidth = width;
  selectedHeight = height;

  // Update active dim buttons
  const buttons = btnElement.parentElement.querySelectorAll(".dim-btn");
  buttons.forEach(btn => btn.classList.remove("active"));
  btnElement.classList.add("active");

  recalculatePrice();
}

function selectPalette(name, swatchElement) {
  selectedPaletteName = name;
  selectedPaletteGradient = swatchElement.style.background;

  const swatches = swatchElement.parentElement.querySelectorAll(".palette-swatch");
  swatches.forEach(sw => sw.classList.remove("active"));
  swatchElement.classList.add("active");

  document.getElementById("selected-palette-label").textContent = name;

  // Apply colors to mock canvas preview (tinting the background texture)
  const canvas = document.getElementById("preview-art-canvas");
  if (canvas) {
    const colorMatch = selectedPaletteGradient.match(/#([0-9a-fA-F]{3,6})/);
    if (colorMatch) {
      canvas.style.backgroundColor = colorMatch[0];
    } else {
      if (name === "Desert Sunset") canvas.style.backgroundColor = "#c86a4b";
      else if (name === "Nordic Frost") canvas.style.backgroundColor = "#60524c";
      else if (name === "Sage Garden") canvas.style.backgroundColor = "#4b6a5a";
    }
  }

  recalculatePrice();
}

function recalculatePrice() {
  const densitySelect = document.getElementById("commission-density");
  const priceDisplay = document.getElementById("commission-est-price");
  if (!priceDisplay) return;

  const densityVal = parseFloat(densitySelect ? densitySelect.value : 1.0);

  // Compute mock cost: base area calculation * density factor
  const area = selectedWidth * selectedHeight;
  const baseRate = 0.55; // per sq inch
  const calculatedCost = Math.round(area * baseRate * densityVal);

  priceDisplay.textContent = `$${calculatedCost.toLocaleString()} USD`;
}

function startCommissionRequest() {
  showNoticeToast(`Commission Request started for a ${selectedWidth}"x${selectedHeight}" piece with "${selectedPaletteName}" colors!`);
  switchView("contact");
}

// 8. Before/After Restoration Slider
function handleBeforeAfterSlider(value) {
  const afterImg = document.getElementById("ba-after");
  const divider = document.getElementById("ba-divider");
  if (!afterImg || !divider) return;

  afterImg.style.clipPath = `inset(0 0 0 ${value}%)`;
  divider.style.left = `${value}%`;
}

// 9. Interactive Sourcing Map & Dye Lab (Home 2)
function showMapTooltip(title, text) {
  const tooltip = document.getElementById("map-tooltip");
  if (!tooltip) return;

  tooltip.innerHTML = `<strong>${title}</strong>: ${text}`;
  tooltip.style.borderColor = "var(--accent-color)";
  tooltip.style.backgroundColor = "var(--accent-soft)";

  showNoticeToast(`Sourcing node queried: ${title}`);
}

// Dye Lab Simulator
function updateDyeLab(ingredient, color, description) {
  const skeinColor1 = document.getElementById("skein-color-1");
  const skeinColor2 = document.getElementById("skein-color-2");
  const dyeFact = document.getElementById("dye-fact-text");
  
  if (skeinColor1) skeinColor1.setAttribute("stroke", color);
  if (skeinColor2) skeinColor2.setAttribute("stroke", color);
  if (dyeFact) {
    dyeFact.innerHTML = `<strong>${ingredient}:</strong> ${description}`;
  }

  // Update active state on buttons
  const buttons = document.querySelectorAll(".dye-lab-btn");
  buttons.forEach(btn => {
    btn.classList.remove("active");
    // Match first word
    if (btn.textContent.trim().toLowerCase() === ingredient.split(" ")[0].toLowerCase()) {
      btn.classList.add("active");
    }
  });

  showNoticeToast(`Botanical Dye Lab: Yarn dyed with ${ingredient}`);
}

// 9b. Home 2 Gallery Slider & Interactive Residency
let currentSlideIndex = 0;
function rotateSlide(direction) {
  const slides = document.querySelectorAll("#editorial-slider-div .slide");
  if (slides.length === 0) return;

  slides[currentSlideIndex].classList.remove("active");
  currentSlideIndex = (currentSlideIndex + direction + slides.length) % slides.length;
  slides[currentSlideIndex].classList.add("active");
}

function selectExhibitionItem(itemIndex, element) {
  const titleEl = document.getElementById("exhibit-item-title");
  const descEl = document.getElementById("exhibit-item-desc");
  const materialsEl = document.getElementById("exhibit-item-materials");
  const dimsEl = document.getElementById("exhibit-item-dims");
  const acousticsEl = document.getElementById("exhibit-item-acoustics");

  // Highlight selected card
  const cards = document.querySelectorAll(".exhibit-card");
  cards.forEach(card => card.classList.remove("active"));
  element.classList.add("active");

  const exhibitionData = {
    1: {
      title: "Monolithic Shadows",
      desc: "A deep, dramatic study of high-contrast texture intersections. Using heavy unspun charcoal wool roving woven into structured linen warps, this piece absorbs light and sound, transforming spatial acoustics.",
      materials: "Charcoal Roving, Jute & Linen",
      dims: "60\" x 84\"",
      acoustics: "NRC 0.90 (Excellent)"
    },
    2: {
      title: "Tectonic Plates",
      desc: "An earthy, segmented tapestry reflecting shifting soil lines and clay layers. Woven with organic terracotta cotton rope and structured hemp warp cords to evoke rugged geologies.",
      materials: "Terracotta Cotton & Belgian Hemp",
      dims: "48\" x 72\"",
      acoustics: "NRC 0.80 (Very Good)"
    },
    3: {
      title: "Aether Rhythms",
      desc: "A lightweight, highly ethereal linen panels series featuring delicate weaving overlays and floating metallic accents. Captures ambient sunlight and generates subtle breeze shadows.",
      materials: "Linen, Metallic Threads & Silk",
      dims: "36\" x 96\" (Triptych)",
      acoustics: "NRC 0.50 (Moderate)"
    }
  };

  const selected = exhibitionData[itemIndex];
  if (selected) {
    if (titleEl) titleEl.textContent = selected.title;
    if (descEl) descEl.textContent = selected.desc;
    if (materialsEl) materialsEl.textContent = selected.materials;
    if (dimsEl) dimsEl.textContent = selected.dims;
    if (acousticsEl) acousticsEl.textContent = selected.acoustics;
    showNoticeToast(`Curator panel updated: ${selected.title}`);
  }
}

// 9c. Acoustic Lab Weave Pattern tester
function selectAcousticWeave(pattern, rating, description, type, element) {
  const nrcLabel = document.getElementById("acoustic-nrc-label");
  const descEl = document.getElementById("acoustic-pattern-desc");
  const wave1 = document.getElementById("freq-wave-1");
  const wave2 = document.getElementById("freq-wave-2");

  // Highlight selected card
  const cards = document.querySelectorAll(".acoustic-card");
  cards.forEach(c => c.classList.remove("active"));
  element.classList.add("active");

  if (nrcLabel) nrcLabel.textContent = rating;
  if (descEl) descEl.textContent = description;

  // Animate frequencies based on density
  if (wave1 && wave2) {
    if (type === 'plain') {
      wave1.setAttribute("d", "M 0 60 Q 25 10, 50 60 T 100 60 T 150 60 T 200 60 T 250 60 T 300 60 T 350 60 T 400 60");
      wave2.setAttribute("d", "M 0 60 Q 25 90, 50 60 T 100 60 T 150 60 T 200 60 T 250 60 T 300 60 T 350 60 T 400 60");
    } else if (type === 'twill') {
      wave1.setAttribute("d", "M 0 60 Q 25 35, 50 60 T 100 60 T 150 60 T 200 60 T 250 60 T 300 60 T 350 60 T 400 60");
      wave2.setAttribute("d", "M 0 60 Q 25 85, 50 60 T 100 60 T 150 60 T 200 60 T 250 60 T 300 60 T 350 60 T 400 60");
    } else if (type === 'tufted') {
      // Almost flatline representation
      wave1.setAttribute("d", "M 0 60 L 400 60");
      wave2.setAttribute("d", "M 0 60 L 400 60");
    }
  }

  showNoticeToast(`Acoustic Test: Applied ${pattern} frequency absorption`);
}

// 9d. Space Visualizer Simulator
let currentVisualizerSpace = "lobby";
function selectVisualizerSpace(spaceType, element) {
  currentVisualizerSpace = spaceType;

  // Update tabs
  const buttons = document.querySelectorAll(".space-btn");
  buttons.forEach(btn => btn.classList.remove("active"));
  element.classList.add("active");

  // Show selected space group in SVG
  const lobbyBg = document.getElementById("space-lobby-bg");
  const loftBg = document.getElementById("space-loft-bg");
  const boardroomBg = document.getElementById("space-boardroom-bg");

  if (lobbyBg) lobbyBg.style.display = spaceType === "lobby" ? "block" : "none";
  if (loftBg) loftBg.style.display = spaceType === "loft" ? "block" : "none";
  if (boardroomBg) boardroomBg.style.display = spaceType === "boardroom" ? "block" : "none";

  // Customize art color per space for premium context matching
  const artFill = document.getElementById("visualizer-art-fill");
  if (artFill) {
    if (spaceType === "lobby") artFill.setAttribute("fill", "#c96b4c");
    else if (spaceType === "loft") artFill.setAttribute("fill", "#d79c5c");
    else if (spaceType === "boardroom") artFill.setAttribute("fill", "#4b6a5a");
  }

  // Sync artwork status
  toggleVisualizerArt();

  showNoticeToast(`Space Visualizer: Switched scene to ${spaceType}`);
}

function toggleVisualizerArt() {
  const checkbox = document.getElementById("visualizer-art-toggle");
  const artGroup = document.getElementById("visualizer-tapestry-art");
  const lobbyWall = document.getElementById("lobby-wall-color");
  const loftWall = document.getElementById("loft-wall-color");
  const boardroomWall = document.getElementById("boardroom-wall-color");

  if (!artGroup) return;

  if (checkbox && checkbox.checked) {
    artGroup.style.opacity = "1";
    artGroup.style.transform = "translateY(0) scale(1)";
    
    // Warm up the room walls
    if (lobbyWall) lobbyWall.setAttribute("fill", "#dedad2");
    if (loftWall) loftWall.setAttribute("fill", "#efeae1");
    if (boardroomWall) boardroomWall.setAttribute("fill", "#cbd3d6");
  } else {
    artGroup.style.opacity = "0";
    artGroup.style.transform = "translateY(-15px) scale(0.95)";
    
    // Cold room walls
    if (lobbyWall) lobbyWall.setAttribute("fill", "#d1cdc5");
    if (loftWall) loftWall.setAttribute("fill", "#e2ded7");
    if (boardroomWall) boardroomWall.setAttribute("fill", "#bdc6c9");
  }
}


// 10. Forms, Accordions and Modals Toggling
function toggleAccordion(btn) {
  const item = btn.parentElement;
  const isActive = item.classList.contains("active");

  // Reset accordion items
  const allItems = document.querySelectorAll(".acc-item");
  allItems.forEach(i => i.classList.remove("active"));

  if (!isActive) {
    item.classList.add("active");
  }
}

function switchSpaceTab(tabId, btn) {
  const tabButtons = btn.parentElement.querySelectorAll(".space-tab");
  const descBox = document.getElementById("space-desc-content");
  const imgEl = document.getElementById("space-tour-img");

  tabButtons.forEach(b => b.classList.remove("active"));
  btn.classList.add("active");

  const tabContents = {
    dye: "A warm, humid workshop smelling of lavender and marigolds. Dozens of organic linen and wool hanks bubble in natural dye pots, changing color in real time.",
    weaving: "Sunlight streams across our tall maple floor looms. Here, four master weavers work concurrently, throwing shuttles and compacting threads.",
    gallery: "A high-ceilinged quiet showroom. Finished tapestries hang along concrete walls, accentuating fiber textures under focused architectural spot lights."
  };

  const tabImages = {
    dye: "t17.webp",
    weaving: "t4.jpg",
    gallery: "t3.webp"
  };

  descBox.textContent = tabContents[tabId];
  if (imgEl) {
    imgEl.src = tabImages[tabId];
    imgEl.alt = tabId + " Space";
  }
}

// Global modal overlays

function openInteractiveDetail(title, desc) {
  const artModal = document.getElementById("art-modal");
  const modalTitle = document.getElementById("art-modal-title");
  const modalDesc = document.getElementById("art-modal-desc");

  if (!artModal) return;

  modalTitle.textContent = title;
  modalDesc.textContent = desc;
  artModal.classList.add("active");
}

function closeArtModal() {
  document.getElementById("art-modal").classList.remove("active");
}

// Form Submission handlers
function handleFormSubmit(event, formType) {
  event.preventDefault();
  event.target.reset();

  if (formType === "newsletter") {
    showNoticeToast("Thank you for joining the AuraWeave Guild newsletter!");
  } else if (formType === "contact") {
    showNoticeToast("Message received successfully! We will contact you within 24 hours.");
  }
}

// 11. Custom Actions and Notifications
function showNoticeToast(message) {
  // Create beautiful overlay toast notice dynamically
  let toast = document.getElementById("app-toast-notice");
  if (!toast) {
    toast = document.createElement("div");
    toast.id = "app-toast-notice";
    // Inline stylings for high-end temporary toast alerts
    Object.assign(toast.style, {
      position: "fixed",
      bottom: "24px",
      right: "24px",
      zIndex: "3000",
      backgroundColor: "var(--text-primary)",
      color: "var(--bg-primary)",
      padding: "16px 28px",
      borderRadius: "12px",
      fontWeight: "600",
      fontSize: "0.9rem",
      boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
      opacity: "0",
      transform: "translateY(10px)",
      transition: "all 0.3s cubic-bezier(0.16, 1, 0.3, 1)"
    });
    document.body.appendChild(toast);
  }

  toast.textContent = message;
  toast.style.opacity = "1";
  toast.style.transform = "translateY(0)";

  setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transform = "translateY(10px)";
  }, 4000);
}

// Helper utility commands
function scrollToElement(id) {
  const el = document.getElementById(id);
  if (el) {
    el.scrollIntoView({ behavior: "smooth" });
  }
}

function copyText(text, btnElement) {
  navigator.clipboard.writeText(text).then(() => {
    const origText = btnElement.textContent;
    btnElement.textContent = "Copied!";
    btnElement.style.borderColor = "var(--accent-color)";
    btnElement.style.color = "var(--accent-color)";
    setTimeout(() => {
      btnElement.textContent = origText;
      btnElement.style.borderColor = "";
      btnElement.style.color = "";
    }, 2000);
  });
}

function triggerCatalogDownload() {
  showNoticeToast("Catalog PDF download initiated.");
}



// Convert CSS RGB color string to Hex
function rgbToHex(rgb) {
  if (!rgb.startsWith("rgb")) return rgb;
  const matches = rgb.match(/\d+/g);
  if (!matches) return rgb;
  return "#" + matches.map(x => {
    const hex = parseInt(x).toString(16);
    return hex.length === 1 ? "0" + hex : hex;
  }).slice(0, 3).join("");
}

// 15. Leaflet Map Initialization
function initLeafletMap() {
  const mapContainer = document.getElementById("map");
  if (!mapContainer) return;

  // Portland, OR coordinates (Maritime District)
  const lat = 45.5340;
  const lng = -122.6860;

  try {
    // Initialize map
    const map = L.map("map", {
      center: [lat, lng],
      zoom: 15,
      scrollWheelZoom: false
    });
    window.contactMap = map;

    // Add Voyager tiles (minimalist and extremely aesthetic light maps matching style guides)
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
      subdomains: 'abcd',
      maxZoom: 20
    }).addTo(map);

    // Custom marker
    const marker = L.marker([lat, lng]).addTo(map);
    marker.bindPopup("<b>AuraWeave Studio</b><br>108 Artisans Way, Portland, OR").openPopup();
  } catch (err) {
    console.error("Leaflet map initialization failed: ", err);
  }
}

// 16. Mobile Navigation Controls
function toggleMobileMenu() {
  const overlay = document.getElementById("mobile-menu-overlay");
  if (overlay) {
    overlay.classList.toggle("active");
  }
}

function toggleMobileAccordion(el) {
  el.classList.toggle("active");
  const subMenu = el.nextElementSibling;
  if (subMenu) {
    if (subMenu.style.display === "flex") {
      subMenu.style.display = "none";
    } else {
      subMenu.style.display = "flex";
    }
  }
}
