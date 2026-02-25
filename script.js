let ramadanData = [];
let cityConfig = [];
let cityLookupByFile = {};
let currentDayIndex = -1;
let countdownInterval = null;
let quoteInterval = null;
let selectedCityFile = "";
let activeModalId = "";
let lastFocusedElement = null;
let daysModalScrollTimer = null;
const THEME_STORAGE_KEY = "ramadan_theme";
const MAIN_CARD_ORNAMENT_PATH = "assets/icons/main-card-bg.png";
const FOCUSABLE_SELECTOR = 'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';
const EVENT_PRE_WINDOW_SECONDS = 59;
const EVENT_POST_WINDOW_SECONDS = 59;
const EVENT_POST_WINDOW_DURATION_MS = (EVENT_POST_WINDOW_SECONDS + 1) * 1000;
const DAYS_MODAL_SCROLL_DELAY_MS = 160;
let currentTheme = "light";

document.addEventListener("DOMContentLoaded", initApp);

async function initApp() {
    applyMainCardOrnament(MAIN_CARD_ORNAMENT_PATH);
    wireEvents();
    initTheme();
    updateTodayDateDisplay();

    if (typeof randomQuote === "function") {
        randomQuote();
        if (!quoteInterval) quoteInterval = setInterval(randomQuote, 30000);
    }

    try {
        cityConfig = await loadCityConfig();
        cityLookupByFile = Object.fromEntries(cityConfig.map(city => [city.file, city]));

        initCitySelector();

        const savedFile = localStorage.getItem("ramadan_city_file");
        const initialFile = cityLookupByFile[savedFile] ? savedFile : cityConfig[0].file;
        setSelectedCity(initialFile, { load: true, persist: false });
    } catch (error) {
        ramadanData = [];
        setMainCardEventMode(false);
        setStatus("Unable to load city list. Check data/citys.csv.");
        document.getElementById("ramadanDay").innerText = "Unable to load";
        document.getElementById("sehriTime").innerText = "--";
        document.getElementById("iftarTime").innerText = "--";
        document.getElementById("countdown").innerText = "--:--:--";
        document.getElementById("currentCity").innerText = "";
        buildDaysList();
    }
}

function wireEvents() {
    document.getElementById("duaBtn")?.addEventListener("click", () => openModal("duaModal"));
    document.getElementById("daysBtn")?.addEventListener("click", () => openModal("daysModal"));
    document.getElementById("cityHelpBtn")?.addEventListener("click", () => openModal("cityHelpModal"));
    document.getElementById("themeToggle")?.addEventListener("click", toggleTheme);

    const cityToggle = document.getElementById("cityToggle");
    cityToggle?.addEventListener("click", () => {
        const isOpen = document.getElementById("cityDropdown")?.classList.contains("open");
        setCityMenuOpen(!isOpen);
    });
    cityToggle?.addEventListener("keydown", handleCityToggleKeydown);
    document.getElementById("cityMenu")?.addEventListener("keydown", handleCityMenuKeydown);

    document.querySelectorAll("[data-close-modal]").forEach(button => {
        button.addEventListener("click", closeAllModals);
    });

    document.querySelectorAll(".modal").forEach(modal => {
        modal.addEventListener("click", event => {
            if (event.target === modal) closeAllModals();
        });
    });

    document.addEventListener("click", event => {
        const dropdown = document.getElementById("cityDropdown");
        if (!dropdown) return;
        if (!dropdown.contains(event.target)) setCityMenuOpen(false);
    });

    document.addEventListener("keydown", event => {
        trapModalFocus(event);
        if (event.key === "Escape") {
            if (activeModalId) {
                event.preventDefault();
                closeAllModals();
                return;
            }

            setCityMenuOpen(false);
        }
    });

}

function initTheme() {
    const savedTheme = readStorage(THEME_STORAGE_KEY);
    const prefersDark = getSystemPrefersDark();
    const initialTheme =
        savedTheme === "dark" || savedTheme === "light"
            ? savedTheme
            : prefersDark
                ? "dark"
                : "light";

    applyTheme(initialTheme, { persist: false });
}

function toggleTheme() {
    const nextTheme = currentTheme === "dark" ? "light" : "dark";
    applyTheme(nextTheme, { persist: true });
}

function applyTheme(theme, options = {}) {
    const { persist = true } = options;
    const normalizedTheme = theme === "dark" ? "dark" : "light";
    const isDark = normalizedTheme === "dark";

    currentTheme = normalizedTheme;
    document.documentElement.setAttribute("data-theme", normalizedTheme);
    document.body.setAttribute("data-theme", normalizedTheme);
    updateThemeColor(isDark);

    const toggle = document.getElementById("themeToggle");
    const icon = document.getElementById("themeToggleIcon");

    if (toggle) {
        const label = isDark ? "Switch to light theme" : "Switch to dark theme";
        toggle.setAttribute("aria-pressed", isDark ? "true" : "false");
        toggle.setAttribute("aria-label", label);
        toggle.setAttribute("title", label);
    }

    if (icon) {
        icon.innerText = isDark ? "☀" : "☾";
    }

    if (persist) writeStorage(THEME_STORAGE_KEY, normalizedTheme);
}

function updateThemeColor(isDark) {
    const themeColor = isDark ? "#06162d" : "#eaf0e8";
    let themeColorMeta = document.querySelector('meta[name="theme-color"]');

    if (!themeColorMeta) {
        themeColorMeta = document.createElement("meta");
        themeColorMeta.setAttribute("name", "theme-color");
        document.head.appendChild(themeColorMeta);
    }

    themeColorMeta.setAttribute("content", themeColor);
}

function getSystemPrefersDark() {
    try {
        if (!window.matchMedia) return false;
        return window.matchMedia("(prefers-color-scheme: dark)").matches;
    } catch {
        return false;
    }
}

function readStorage(key) {
    try {
        return localStorage.getItem(key);
    } catch {
        return null;
    }
}

function writeStorage(key, value) {
    try {
        localStorage.setItem(key, value);
    } catch {
        // Ignore storage failures; theme still applies for current session.
    }
}

function applyMainCardOrnament(imagePath) {
    const normalizedPath = String(imagePath || "").trim();
    if (!normalizedPath) {
        document.body.classList.remove("has-main-card-ornament");
        document.body.style.setProperty("--main-card-ornament", "none");
        return;
    }

    const testImage = new Image();

    testImage.onload = () => {
        document.body.classList.add("has-main-card-ornament");
        document.body.style.setProperty("--main-card-ornament", `url('${normalizedPath}')`);
    };

    testImage.onerror = () => {
        document.body.classList.remove("has-main-card-ornament");
        document.body.style.setProperty("--main-card-ornament", "none");
    };

    testImage.src = normalizedPath;
}

function setCityMenuOpen(open) {
    const dropdown = document.getElementById("cityDropdown");
    const toggle = document.getElementById("cityToggle");
    const menu = document.getElementById("cityMenu");
    if (!dropdown || !toggle || !menu) return;

    dropdown.classList.toggle("open", open);
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
    menu.setAttribute("aria-hidden", open ? "false" : "true");
    setCityOptionTabOrder(open);

    if (!open && menu.contains(document.activeElement)) {
        toggle.focus();
    }
}

function setCityOptionTabOrder(open) {
    document.querySelectorAll(".city-option").forEach(option => {
        option.tabIndex = open ? 0 : -1;
    });
}

function getCityOptions() {
    return Array.from(document.querySelectorAll(".city-option"));
}

function focusCityOption(index) {
    const options = getCityOptions();
    if (!options.length) return;

    const safeIndex = ((index % options.length) + options.length) % options.length;
    options[safeIndex].focus();
}

function focusSelectedCityOption() {
    const options = getCityOptions();
    if (!options.length) return;

    const selectedIndex = options.findIndex(option => option.dataset.file === selectedCityFile);
    focusCityOption(selectedIndex >= 0 ? selectedIndex : 0);
}

function handleCityToggleKeydown(event) {
    const key = event.key;

    if (key === "ArrowDown") {
        event.preventDefault();
        setCityMenuOpen(true);
        focusSelectedCityOption();
        return;
    }

    if (key === "ArrowUp") {
        event.preventDefault();
        setCityMenuOpen(true);
        focusCityOption(getCityOptions().length - 1);
        return;
    }

    if (key === "Enter" || key === " ") {
        event.preventDefault();
        const isOpen = document.getElementById("cityDropdown")?.classList.contains("open");
        setCityMenuOpen(!isOpen);
        if (!isOpen) focusSelectedCityOption();
    }
}

function handleCityMenuKeydown(event) {
    const options = getCityOptions();
    if (!options.length) return;

    const currentIndex = options.indexOf(document.activeElement);

    if (event.key === "ArrowDown") {
        event.preventDefault();
        focusCityOption(currentIndex < 0 ? 0 : currentIndex + 1);
        return;
    }

    if (event.key === "ArrowUp") {
        event.preventDefault();
        focusCityOption(currentIndex < 0 ? options.length - 1 : currentIndex - 1);
        return;
    }

    if (event.key === "Home") {
        event.preventDefault();
        focusCityOption(0);
        return;
    }

    if (event.key === "End") {
        event.preventDefault();
        focusCityOption(options.length - 1);
        return;
    }

    if (event.key === "Escape") {
        event.preventDefault();
        setCityMenuOpen(false);
    }

    if (event.key === "Tab") {
        const dropdown = document.getElementById("cityDropdown");
        const toggle = document.getElementById("cityToggle");
        const menu = document.getElementById("cityMenu");
        if (!dropdown || !toggle || !menu) return;

        dropdown.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
        menu.setAttribute("aria-hidden", "true");
        setCityOptionTabOrder(false);
    }
}

function loadCityConfig() {
    return fetch("data/citys.csv")
        .then(response => {
            if (!response.ok) {
                throw new Error("Could not load citys.csv");
            }
            return response.text();
        })
        .then(text => {
            const rows = parseCSV(text);
            const cities = rows
                .map((row, index) => mapCityRow(row, index))
                .filter(Boolean);

            if (!cities.length) {
                throw new Error("citys.csv has no valid rows");
            }

            return sortCitiesByCountryAndCity(cities);
        });
}

function sortCitiesByCountryAndCity(cities) {
    const collator = new Intl.Collator(undefined, { sensitivity: "base" });

    return [...cities].sort((a, b) => {
        const countryA = String(a.country || "").trim();
        const countryB = String(b.country || "").trim();

        if (countryA && !countryB) return -1;
        if (!countryA && countryB) return 1;

        const countryCompare = collator.compare(countryA, countryB);
        if (countryCompare !== 0) return countryCompare;

        const cityCompare = collator.compare(a.city, b.city);
        if (cityCompare !== 0) return cityCompare;

        return collator.compare(a.file, b.file);
    });
}

function mapCityRow(row, index) {
    const city = String(row.city || row.City || "").trim();
    const country = String(row.country || row.Country || "").trim();
    const file = String(row.file || row.File || "").trim();
    const bgRaw = String(row.bg || row.Bg || row.background || row.Background || "").trim();

    if (!city || !file) return null;

    const normalizedFile = normalizeCityFileName(file);
    const key = getCityKey(normalizedFile, city, index);
    const csvPath = normalizedFile.includes("/") ? normalizedFile : `data/${normalizedFile}`;
    const bgPath = bgRaw || `assets/cities/${key}.jpg`;
    const displayLabel = country ? `${city}, ${country}` : city;

    return {
        id: key,
        city,
        country,
        displayLabel,
        file: normalizedFile,
        csv: csvPath,
        bg: bgPath
    };
}

function normalizeCityFileName(fileName) {
    const trimmed = String(fileName).trim();
    if (!trimmed) return trimmed;
    return /\.csv$/i.test(trimmed) ? trimmed : `${trimmed}.csv`;
}

function getCityKey(fileName, cityName, index) {
    const base = String(fileName)
        .split("/")
        .pop()
        .replace(/\.csv$/i, "")
        .replace(/^ramadan_/i, "");

    const fromFile = base.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    if (fromFile) return fromFile;

    const fromCity = String(cityName).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    if (fromCity) return fromCity;

    return `city-${index + 1}`;
}

function initCitySelector() {
    const select = document.getElementById("citySelect");
    const menu = document.getElementById("cityMenu");

    if (!select || !menu) return;

    select.innerHTML = "";
    menu.innerHTML = "";

    cityConfig.forEach(city => {
        const option = document.createElement("option");
        option.value = city.file;
        option.textContent = city.displayLabel;
        select.appendChild(option);

        const item = document.createElement("button");
        item.type = "button";
        item.className = "city-option";
        item.setAttribute("role", "option");
        item.setAttribute("aria-label", city.displayLabel);
        item.setAttribute("aria-selected", "false");
        item.tabIndex = -1;
        item.dataset.file = city.file;

        const cityName = document.createElement("span");
        cityName.className = "city-option-city";
        cityName.innerText = city.city;
        item.appendChild(cityName);

        if (city.country) {
            const countryName = document.createElement("span");
            countryName.className = "city-option-country";
            countryName.innerText = `, ${city.country}`;
            item.appendChild(countryName);
        }

        item.addEventListener("click", () => {
            setSelectedCity(city.file, { load: true, persist: true });
            setCityMenuOpen(false);
        });

        menu.appendChild(item);
    });

    setCityOptionTabOrder(false);
}

function setSelectedCity(fileName, options = {}) {
    const { load = true, persist = true } = options;
    const city = cityLookupByFile[fileName];
    if (!city) return;

    selectedCityFile = city.file;

    const select = document.getElementById("citySelect");
    if (select) select.value = city.file;

    const text = document.getElementById("cityToggleText");
    if (text) text.innerText = city.displayLabel;

    document.querySelectorAll(".city-option").forEach(option => {
        const isSelected = option.dataset.file === city.file;
        option.classList.toggle("active", isSelected);
        option.setAttribute("aria-selected", isSelected ? "true" : "false");
    });

    if (persist) localStorage.setItem("ramadan_city_file", city.file);
    if (load) loadCityData(city.file);
}

function loadCityData(fileName) {
    const city = cityLookupByFile[fileName];
    if (!city) return;

    closeAllModals();
    applyCityBackground(city.bg);
    document.getElementById("currentCity").innerText = city.city;
    setStatus("Loading timetable...");
    setMainCardEventMode(false);
    ramadanData = [];
    currentDayIndex = -1;

    if (countdownInterval) {
        clearInterval(countdownInterval);
        countdownInterval = null;
    }

    fetch(city.csv)
        .then(response => {
            if (!response.ok) {
                throw new Error(`Failed to load ${city.csv}`);
            }
            return response.text();
        })
        .then(text => {
            const parsed = parseCSV(text);
            if (!parsed.length) {
                throw new Error("No rows found in CSV");
            }

            ramadanData = parsed;
            localStorage.setItem("ramadan_city_file", city.file);

            updateCurrentDayIndex();
            renderStaticSections();
            buildDaysList();
            runCountdown();
            countdownInterval = setInterval(runCountdown, 1000);
        })
        .catch(() => {
            ramadanData = [];
            currentDayIndex = -1;
            setMainCardEventMode(false);
            document.getElementById("ramadanDay").innerText = "Unable to load";
            document.getElementById("sehriTime").innerText = "--";
            document.getElementById("iftarTime").innerText = "--";
            document.getElementById("countdown").innerText = "--:--:--";
            setStatus(`Could not load ${city.file} from data folder.`);
            buildDaysList();
        });
}

function parseCSV(text) {
    const lines = text.trim().split("\n");
    if (lines.length < 2) return [];

    const headers = lines[0].split(",").map(col => col.trim());

    return lines.slice(1).filter(Boolean).map(line => {
        const cols = line.split(",").map(col => col.trim());
        const row = {};

        headers.forEach((header, index) => {
            row[header] = cols[index] || "";
        });

        return row;
    });
}

function getTodayDateString() {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, "0");
    const d = String(now.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
}

function updateCurrentDayIndex() {
    const today = getTodayDateString();
    const exactIndex = ramadanData.findIndex(day => day.Date === today);

    if (exactIndex >= 0) {
        currentDayIndex = exactIndex;
        return;
    }

    if (today < ramadanData[0].Date) {
        currentDayIndex = 0;
        return;
    }

    currentDayIndex = ramadanData.length - 1;
}

function renderStaticSections() {
    const day = ramadanData[currentDayIndex];
    if (!day) return;

    updateTodayDateDisplay();
    document.getElementById("ramadanDay").innerText = getRamadanDayLabel(day);
    document.getElementById("sehriTime").innerText = formatToAmPm(day.Sehri);
    document.getElementById("iftarTime").innerText = formatToAmPm(day.Iftar);
}

function getRamadanDayLabel(day) {
    const today = getTodayDateString();
    const firstDayDate = ramadanData[0]?.Date;

    if (firstDayDate && today < firstDayDate) {
        const daysToStart = getDateDiffInDays(today, firstDayDate);
        const dayWord = daysToStart === 1 ? "Day" : "Days";
        return `${daysToStart} ${dayWord} Until Ramadan`;
    }

    return `Day ${day.Day} Ramadan`;
}

function getDateDiffInDays(fromDate, toDate) {
    const from = parseDateOnly(fromDate);
    const to = parseDateOnly(toDate);
    const oneDayMs = 24 * 60 * 60 * 1000;
    return Math.round((to - from) / oneDayMs);
}

function parseDateOnly(dateStr) {
    const [y, m, d] = String(dateStr).split("-").map(Number);
    return new Date(y, (m || 1) - 1, d || 1);
}

function runCountdown() {
    if (!ramadanData.length) return;

    updateTodayDateDisplay();
    const previousDayIndex = currentDayIndex;
    updateCurrentDayIndex();
    if (currentDayIndex < 0) return;

    if (currentDayIndex !== previousDayIndex) {
        renderStaticSections();
        buildDaysList();
    }

    const now = new Date();
    const day = ramadanData[currentDayIndex];
    if (!day) return;

    const sehriCurrent = toDateTime(day.Date, day.Sehri);
    const iftarCurrent = toDateTime(day.Date, day.Iftar);
    const sehriMoment = getEventMomentState(now, sehriCurrent, "sehri");
    if (sehriMoment) {
        renderEventCountdown(sehriMoment);
        return;
    }

    const iftarMoment = getEventMomentState(now, iftarCurrent, "iftar");
    if (iftarMoment) {
        renderEventCountdown(iftarMoment);
        return;
    }

    setMainCardEventMode(false);

    let target = iftarCurrent;
    let status = "Time until Iftar";

    if (now < sehriCurrent) {
        target = sehriCurrent;
        status = "Time until Sehri";
    } else if (now >= iftarCurrent) {
        const nextDay = ramadanData[currentDayIndex + 1];
        if (nextDay) {
            target = toDateTime(nextDay.Date, nextDay.Sehri);
            status = "Time until Sehri";
        } else {
            setStatus("Ramadan timetable complete");
            const countdown = document.getElementById("countdown");
            if (countdown) countdown.innerText = "00h 00m 00s";
            return;
        }
    }

    const diffMs = Math.max(0, target - now);
    const countdown = document.getElementById("countdown");
    if (countdown) countdown.innerText = formatDuration(diffMs);
    setStatus(status);
}

function getEventMomentState(now, eventDate, eventType) {
    if (!(eventDate instanceof Date) || Number.isNaN(eventDate.getTime())) return null;

    const msUntilEvent = eventDate.getTime() - now.getTime();
    if (msUntilEvent > 0 && msUntilEvent <= EVENT_PRE_WINDOW_SECONDS * 1000) {
        return {
            eventType,
            phase: "before",
            secondsRemaining: Math.ceil(msUntilEvent / 1000)
        };
    }

    const msSinceEvent = now.getTime() - eventDate.getTime();
    if (msSinceEvent >= 0 && msSinceEvent < EVENT_POST_WINDOW_DURATION_MS) {
        return {
            eventType,
            phase: "after",
            secondsRemaining: EVENT_POST_WINDOW_SECONDS - Math.floor(msSinceEvent / 1000)
        };
    }

    return null;
}

function renderEventCountdown(moment) {
    const countdown = document.getElementById("countdown");
    if (!countdown) return;

    const isPostEventWindow = moment.phase === "after";
    const duaType = isPostEventWindow ? moment.eventType : "";

    if (moment.eventType === "iftar") {
        setStatus(moment.phase === "before" ? "Iftar starts in" : "It's Iftar time");
    } else {
        setStatus(moment.phase === "before" ? "Suhoor ends in" : "Suhoor is over");
    }

    if (!isPostEventWindow) {
        countdown.innerText = formatSecondsCountdown(moment.secondsRemaining);
    }

    setMainCardEventMode(true, { messageOnly: isPostEventWindow, duaType });
}

function buildDaysList() {
    const container = document.getElementById("daysList");
    if (!container) return;

    container.innerHTML = "";

    if (!ramadanData.length) {
        const empty = document.createElement("div");
        empty.className = "day-item";
        empty.textContent = "No timetable data available for this city.";
        container.appendChild(empty);
        return;
    }

    ramadanData.forEach((day, index) => {
        const item = document.createElement("div");
        item.className = "day-item";
        if (index === currentDayIndex) item.classList.add("current");

        const dayLabel = document.createElement("span");
        dayLabel.className = "day-label";
        dayLabel.innerText = `Day ${day.Day}`;

        const timing = document.createElement("span");
        timing.innerText = `${formatListDate(day.Date)} | Sehri: ${formatToAmPm(day.Sehri)} | Iftar: ${formatToAmPm(day.Iftar)}`;

        item.appendChild(dayLabel);
        item.appendChild(timing);
        container.appendChild(item);
    });

    if (activeModalId === "daysModal") {
        scrollDaysListToCurrent({ behavior: "auto" });
    }
}

function formatListDate(dateStr) {
    const date = parseDateOnly(dateStr);
    if (Number.isNaN(date.getTime())) return String(dateStr || "");

    const parts = new Intl.DateTimeFormat("en-GB", {
        weekday: "short",
        day: "numeric",
        month: "short",
        year: "numeric"
    }).formatToParts(date);

    const dateParts = {};
    parts.forEach(part => {
        if (part.type !== "literal") dateParts[part.type] = part.value;
    });

    if (!dateParts.weekday || !dateParts.day || !dateParts.month || !dateParts.year) {
        return String(dateStr || "");
    }

    return `${dateParts.weekday} ${dateParts.day} ${dateParts.month} ${dateParts.year}`;
}

function toDateTime(dateStr, timeStr) {
    return new Date(`${dateStr}T${timeStr}:00`);
}

function formatToAmPm(timeStr) {
    const [hourStr, minuteStr] = String(timeStr).split(":");
    const hour24 = Number(hourStr);
    const minute = minuteStr || "00";

    if (!Number.isFinite(hour24)) return timeStr;

    const period = hour24 >= 12 ? "PM" : "AM";
    const hour12 = hour24 % 12 || 12;
    return `${hour12}:${minute} ${period}`;
}

function formatDuration(ms) {
    const totalSeconds = Math.floor(ms / 1000);
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;

    return `${pad2(h)}h ${pad2(m)}m ${pad2(s)}s`;
}

function formatSecondsCountdown(seconds) {
    const safeSeconds = Math.max(0, Math.floor(seconds));
    return `${safeSeconds} ${safeSeconds === 1 ? "second" : "seconds"}`;
}

function pad2(value) {
    return String(value).padStart(2, "0");
}

function updateTodayDateDisplay() {
    const el = document.getElementById("todayLabel");
    if (!el) return;

    const formatted = new Intl.DateTimeFormat("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric"
    }).format(new Date());

    el.innerText = `Today - ${formatted}`;
}

function setStatus(text) {
    const el = document.getElementById("statusText");
    if (el && el.innerText !== text) el.innerText = text;
}

function setMainCardEventMode(active, options = {}) {
    const { messageOnly = false, duaType = "" } = options;
    const mainCard = document.querySelector(".main-card");
    if (!mainCard) return;
    const body = document.body;

    const isActive = Boolean(active);
    const isMessageOnly = isActive && Boolean(messageOnly);
    const showIftarDua = isActive && duaType === "iftar";
    const showSuhoorDua = isActive && duaType === "sehri";
    const isIftarDuaMode = showIftarDua || showSuhoorDua;
    mainCard.classList.toggle("is-moment-mode", isActive);
    mainCard.classList.toggle("is-message-only", isMessageOnly);
    mainCard.classList.toggle("is-iftar-dua-mode", isIftarDuaMode);
    if (body) body.classList.toggle("has-main-card-focus", isActive);

    const countdown = document.getElementById("countdown");
    if (countdown) countdown.setAttribute("aria-hidden", isMessageOnly || isIftarDuaMode ? "true" : "false");

    const iftarDua = document.getElementById("iftarDuaMoment");
    if (iftarDua) {
        iftarDua.classList.toggle("is-visible", showIftarDua);
        iftarDua.setAttribute("aria-hidden", showIftarDua ? "false" : "true");
    }

    const suhoorDua = document.getElementById("suhoorDuaMoment");
    if (suhoorDua) {
        suhoorDua.classList.toggle("is-visible", showSuhoorDua);
        suhoorDua.setAttribute("aria-hidden", showSuhoorDua ? "false" : "true");
    }
}

function applyCityBackground(imagePath) {
    const fallback = "none";
    const candidates = getBackgroundCandidates(imagePath);
    tryNextBackground(candidates, 0, fallback);
}

function getBackgroundCandidates(imagePath) {
    const input = String(imagePath || "").trim();
    if (!input) return [];

    const hasExtension = /\.(jpg|jpeg|png|webp)$/i.test(input);
    if (hasExtension) return [input];

    return [`${input}.jpg`, `${input}.jpeg`, `${input}.png`, `${input}.webp`];
}

function tryNextBackground(candidates, index, fallback) {
    if (index >= candidates.length) {
        document.body.style.setProperty("--city-bg-image", fallback);
        return;
    }

    const src = candidates[index];
    const testImage = new Image();

    testImage.onload = () => {
        document.body.style.setProperty("--city-bg-image", `url('${src}')`);
    };

    testImage.onerror = () => {
        tryNextBackground(candidates, index + 1, fallback);
    };

    testImage.src = src;
}

function openModal(id) {
    const modal = document.getElementById(id);
    if (!modal) return;

    closeAllModals({ restoreFocus: false });
    lastFocusedElement = document.activeElement instanceof HTMLElement ? document.activeElement : null;

    modal.style.display = "block";
    modal.setAttribute("aria-hidden", "false");
    modal.classList.remove("is-open");
    requestAnimationFrame(() => {
        if (modal.style.display === "block") modal.classList.add("is-open");
    });
    activeModalId = id;
    document.body.classList.add("modal-open");

    const focusables = getModalFocusableElements(modal);
    const firstFocusable = focusables[0] || modal.querySelector(".modal-content");
    if (firstFocusable instanceof HTMLElement) {
        if (focusables.length === 0) firstFocusable.setAttribute("tabindex", "-1");
        firstFocusable.focus();
    }

    if (id === "daysModal") scheduleDaysListAutoScroll();
}

function closeAllModals(options = {}) {
    const { restoreFocus = true } = options;
    const hasOpenModal = Array.from(document.querySelectorAll(".modal")).some(modal => modal.style.display === "block");

    if (daysModalScrollTimer) {
        clearTimeout(daysModalScrollTimer);
        daysModalScrollTimer = null;
    }

    document.querySelectorAll(".modal").forEach(modal => {
        modal.classList.remove("is-open");
        modal.style.display = "none";
        modal.setAttribute("aria-hidden", "true");
    });

    activeModalId = "";
    document.body.classList.remove("modal-open");

    if (restoreFocus && hasOpenModal && lastFocusedElement && document.contains(lastFocusedElement)) {
        lastFocusedElement.focus();
    }

    lastFocusedElement = null;
}

function getModalFocusableElements(modal) {
    return Array.from(modal.querySelectorAll(FOCUSABLE_SELECTOR)).filter(node => {
        if (!(node instanceof HTMLElement)) return false;
        if (node.getAttribute("aria-hidden") === "true") return false;
        if (node.hasAttribute("disabled")) return false;
        return true;
    });
}

function scheduleDaysListAutoScroll() {
    if (daysModalScrollTimer) {
        clearTimeout(daysModalScrollTimer);
        daysModalScrollTimer = null;
    }

    const smoothScroll = !prefersReducedMotion();
    const behavior = smoothScroll ? "smooth" : "auto";
    const delay = smoothScroll ? DAYS_MODAL_SCROLL_DELAY_MS : 0;

    daysModalScrollTimer = setTimeout(() => {
        scrollDaysListToCurrent({ behavior });
        daysModalScrollTimer = null;
    }, delay);
}

function scrollDaysListToCurrent(options = {}) {
    const { behavior = "auto" } = options;
    const list = document.getElementById("daysList");
    if (!list) return;

    const currentItem = list.querySelector(".day-item.current");
    if (!(currentItem instanceof HTMLElement)) return;

    const maxScrollTop = Math.max(0, list.scrollHeight - list.clientHeight);
    const centeredTop = currentItem.offsetTop - (list.clientHeight - currentItem.offsetHeight) / 2;
    const targetTop = Math.min(maxScrollTop, Math.max(0, centeredTop));

    list.scrollTo({ top: targetTop, behavior });
}

function prefersReducedMotion() {
    try {
        return Boolean(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches);
    } catch {
        return false;
    }
}

function trapModalFocus(event) {
    if (event.key !== "Tab" || !activeModalId) return;

    const modal = document.getElementById(activeModalId);
    if (!modal || modal.style.display !== "block") return;

    const focusables = getModalFocusableElements(modal);
    if (!focusables.length) {
        event.preventDefault();
        return;
    }

    const first = focusables[0];
    const last = focusables[focusables.length - 1];

    if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
        return;
    }

    if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
    }
}
