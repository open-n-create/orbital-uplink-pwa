// ============================================================
// Hardware Antenna Alignment Engine
// Uses DeviceOrientation API (gyroscope + magnetometer)
// ============================================================

import { getRandomSatelliteConfig } from "./satellite-ips.js";

// Hardcoded geostationary target vectors (example for mid-latitude North America)
// Real deployments would compute these from user lat/lon + satellite ephemeris.
const TARGET_VECTORS = [
  { name: "Galaxy 19 (97°W)", az: 185.4, el: 42.1 },
  { name: "SES-2 (87°W)",     az: 172.8, el: 44.6 },
  { name: "Anik F1R (107.3°W)", az: 198.2, el: 39.8 },
  { name: "Echostar 17 (107.1°W)", az: 197.9, el: 39.9 },
  { name: "AMC-18 (105°W)",   az: 195.1, el: 40.7 }
];

const LOCK_THRESHOLD_DEG = 3.5; // degrees of error for "lock"
const LOCK_HOLD_MS = 1800;      // must hold lock this long

let currentTarget = null;
let orientationHandler = null;
let lockTimer = null;
let isLocked = false;
let onLockCallback = null;

// ---------- DOM ----------
const $ = (sel) => document.querySelector(sel);

function updateUI(az, el, errorAz, errorEl, locked) {
  const azEl = $("#current-az");
  const elEl = $("#current-el");
  const errEl = $("#alignment-error");
  const statusEl = $("#lock-status");
  const progress = $("#lock-progress");

  if (azEl) azEl.textContent = az.toFixed(1) + "°";
  if (elEl) elEl.textContent = el.toFixed(1) + "°";
  if (errEl) {
    const totalErr = Math.sqrt(errorAz * errorAz + errorEl * errorEl);
    errEl.textContent = totalErr.toFixed(1) + "°";
    errEl.className = totalErr < LOCK_THRESHOLD_DEG ? "good" : "bad";
  }
  if (statusEl) {
    statusEl.textContent = locked ? "LOCKED" : "SEEKING";
    statusEl.className = locked ? "status-locked" : "status-seeking";
  }
  if (progress) {
    const totalErr = Math.sqrt(errorAz * errorAz + errorEl * errorEl);
    const pct = Math.max(0, Math.min(100, 100 - (totalErr / 45) * 100));
    progress.style.width = pct + "%";
  }
}

// Normalize angle difference to [-180, 180]
function angleDiff(a, b) {
  let d = a - b;
  while (d > 180) d -= 360;
  while (d < -180) d += 360;
  return d;
}

function handleOrientation(event) {
  // iOS / modern browsers: absolute values when available
  let heading = event.webkitCompassHeading; // iOS Safari
  if (heading === undefined || heading === null) {
    // Alpha is compass heading when absolute is true
    heading = event.absolute ? event.alpha : null;
  }

  // Beta ≈ elevation (pitch)
  let elevation = event.beta;
  if (elevation === null || elevation === undefined) return;

  let mappedEl = Math.max(0, Math.min(90, elevation));

  if (heading === null || heading === undefined) {
    heading = 0;
  }

  const target = currentTarget;
  if (!target) return;

  const errAz = Math.abs(angleDiff(heading, target.az));
  const errEl = Math.abs(mappedEl - target.el);

  const withinLock = errAz < LOCK_THRESHOLD_DEG && errEl < LOCK_THRESHOLD_DEG;

  updateUI(heading, mappedEl, errAz, errEl, isLocked);

  if (withinLock && !isLocked) {
    if (!lockTimer) {
      lockTimer = setTimeout(() => {
        isLocked = true;
        updateUI(heading, mappedEl, errAz, errEl, true);
        if (typeof onLockCallback === "function") {
          onLockCallback();
        }
      }, LOCK_HOLD_MS);
    }
  } else if (!withinLock) {
    clearTimeout(lockTimer);
    lockTimer = null;
    if (isLocked) {
      isLocked = false;
    }
  }
}

/**
 * Request permission (required on iOS 13+) and start listening.
 */
export async function startAlignmentEngine(callback) {
  onLockCallback = callback;
  isLocked = false;
  clearTimeout(lockTimer);
  lockTimer = null;

  // Pick a random target for this session
  currentTarget = TARGET_VECTORS[Math.floor(Math.random() * TARGET_VECTORS.length)];
  $("#target-name").textContent = currentTarget.name;
  $("#target-az").textContent = currentTarget.az.toFixed(1) + "°";
  $("#target-el").textContent = currentTarget.el.toFixed(1) + "°";

  // iOS permission
  if (typeof DeviceOrientationEvent !== "undefined" &&
      typeof DeviceOrientationEvent.requestPermission === "function") {
    try {
      const perm = await DeviceOrientationEvent.requestPermission();
      if (perm !== "granted") {
        alert("Orientation permission denied. Alignment requires device sensors.");
        return false;
      }
    } catch (err) {
      console.error("Permission error:", err);
      alert("Unable to access device orientation.");
      return false;
    }
  }

  orientationHandler = handleOrientation;
  window.addEventListener("deviceorientation", orientationHandler, true);
  return true;
}

export function stopAlignmentEngine() {
  if (orientationHandler) {
    window.removeEventListener("deviceorientation", orientationHandler, true);
    orientationHandler = null;
  }
  clearTimeout(lockTimer);
  lockTimer = null;
  isLocked = false;
}

/**
 * Called when lock is achieved – deliver IP config
 */
export function onAlignmentLock() {
  const config = getRandomSatelliteConfig();
  return config;
}
