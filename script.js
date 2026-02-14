let ramadanData = [];
let cityConfig = [];
let cityLookupByFile = {};
let currentDayIndex = -1;
let countdownInterval = null;
let selectedCityFile = "";
const THEME_STORAGE_KEY = "ramadan_theme";
let currentTheme = "light";

document.addEventListener("DOMContentLoaded", initApp);

async function initApp() {
    wireEvents();
    initTheme();
    updateTodayDateDisplay();

    if (typeof randomQuote === "function") {
        randomQuote();
        setInterval(randomQuote, 30000);
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
    document.getElementById("themeToggle")?.addEventListener("click", toggleTheme);

    const cityToggle = document.getElementById("cityToggle");
    cityToggle?.addEventListener("click", () => {
        const isOpen = document.getElementById("cityDropdown")?.classList.contains("open");
        setCityMenuOpen(!isOpen);
    });

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
        if (event.key === "Escape") {
            closeAllModals();
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
    document.body.setAttribute("data-theme", normalizedTheme);

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

function setCityMenuOpen(open) {
    const dropdown = document.getElementById("cityDropdown");
    const toggle = document.getElementById("cityToggle");
    if (!dropdown || !toggle) return;

    dropdown.classList.toggle("open", open);
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
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

            return cities;
        });
}

function mapCityRow(row, index) {
    const city = String(row.city || row.City || "").trim();
    const file = String(row.file || row.File || "").trim();
    const bgRaw = String(row.bg || row.Bg || row.background || row.Background || "").trim();

    if (!city || !file) return null;

    const normalizedFile = normalizeCityFileName(file);
    const key = getCityKey(normalizedFile, city, index);
    const csvPath = normalizedFile.includes("/") ? normalizedFile : `data/${normalizedFile}`;
    const bgPath = bgRaw || `assets/cities/${key}.jpg`;

    return {
        id: key,
        label: city,
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
        option.textContent = city.label;
        select.appendChild(option);

        const item = document.createElement("button");
        item.type = "button";
        item.className = "city-option";
        item.setAttribute("role", "option");
        item.dataset.file = city.file;
        item.textContent = city.label;

        item.addEventListener("click", () => {
            setSelectedCity(city.file, { load: true, persist: true });
            setCityMenuOpen(false);
        });

        menu.appendChild(item);
    });
}

function setSelectedCity(fileName, options = {}) {
    const { load = true, persist = true } = options;
    const city = cityLookupByFile[fileName];
    if (!city) return;

    selectedCityFile = city.file;

    const select = document.getElementById("citySelect");
    if (select) select.value = city.file;

    const text = document.getElementById("cityToggleText");
    if (text) text.innerText = city.label;

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
    document.getElementById("currentCity").innerText = city.label;
    setStatus("Loading timetable...");

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
        return `Day -${daysToStart} Ramadan`;
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
    if (!ramadanData.length || currentDayIndex < 0) return;

    updateTodayDateDisplay();
    const now = new Date();
    const day = ramadanData[currentDayIndex];
    if (!day) return;

    let target = toDateTime(day.Date, day.Iftar);
    let status = "Time until Iftar";

    const sehriCurrent = toDateTime(day.Date, day.Sehri);
    const iftarCurrent = toDateTime(day.Date, day.Iftar);

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
            document.getElementById("countdown").innerText = "00h 00m 00s";
            return;
        }
    }

    const diffMs = Math.max(0, target - now);
    document.getElementById("countdown").innerText = formatDuration(diffMs);
    setStatus(status);
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
        timing.innerText = `${day.Date} | Sehri: ${formatToAmPm(day.Sehri)} | Iftar: ${formatToAmPm(day.Iftar)}`;

        item.appendChild(dayLabel);
        item.appendChild(timing);
        container.appendChild(item);
    });
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
    if (el) el.innerText = text;
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
    modal.style.display = "block";
    document.body.classList.add("modal-open");
}

function closeAllModals() {
    document.querySelectorAll(".modal").forEach(modal => {
        modal.style.display = "none";
    });
    document.body.classList.remove("modal-open");
}
