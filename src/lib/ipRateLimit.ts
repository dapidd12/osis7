import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';

export interface ResetCycleInfo {
  cycleId: string;       // YYYY-MM-DD corresponding to the cycle start day
  cycleStart: Date;
  nextReset: Date;       // Next 06:00 AM
  msUntilReset: number;
  formattedResetTime: string; // e.g. "06:00 WIB"
}

/**
 * Calculates cycle parameters where the day boundary resets at 06:00 AM every day.
 */
export function getResetCycleInfo(): ResetCycleInfo {
  const now = new Date();
  
  // Boundary for today at 06:00:00.000 local time
  const today6am = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 6, 0, 0, 0);

  let cycleStart: Date;
  let nextReset: Date;

  if (now.getTime() < today6am.getTime()) {
    // Before 06:00 AM today: cycle started yesterday at 06:00 AM, resets today at 06:00 AM
    cycleStart = new Date(today6am.getTime() - 24 * 60 * 60 * 1000);
    nextReset = today6am;
  } else {
    // At or after 06:00 AM today: cycle started today at 06:00 AM, resets tomorrow at 06:00 AM
    cycleStart = today6am;
    nextReset = new Date(today6am.getTime() + 24 * 60 * 60 * 1000);
  }

  const y = cycleStart.getFullYear();
  const m = String(cycleStart.getMonth() + 1).padStart(2, '0');
  const d = String(cycleStart.getDate()).padStart(2, '0');
  const cycleId = `${y}-${m}-${d}`;

  const msUntilReset = Math.max(0, nextReset.getTime() - now.getTime());

  return {
    cycleId,
    cycleStart,
    nextReset,
    msUntilReset,
    formattedResetTime: '06:00 WIB'
  };
}

/**
 * Formats milliseconds remaining into human readable Indonesian string (e.g. "5 jam 20 menit")
 */
export function formatRemainingTime(ms: number): string {
  if (ms <= 0) return '0 menit';
  const totalMinutes = Math.floor(ms / (1000 * 60));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours > 0) {
    return `${hours} jam ${minutes} menit`;
  }
  return `${minutes} menit`;
}

/**
 * Fetches the user's public IP address with fast timeout and persistent browser fallback
 */
export async function getClientIp(): Promise<string> {
  if (typeof window === 'undefined') return 'unknown_ip';

  const cached = sessionStorage.getItem('client_public_ip');
  if (cached && cached.length >= 7) {
    return cached;
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 2500);

    const res = await fetch('https://api.ipify.org?format=json', {
      signal: controller.signal
    });
    clearTimeout(timeout);

    if (res.ok) {
      const data = await res.json();
      if (data && typeof data.ip === 'string') {
        sessionStorage.setItem('client_public_ip', data.ip);
        return data.ip;
      }
    }
  } catch {
    // Secondary fallback service
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 2500);
      const res2 = await fetch('https://api64.ipify.org?format=json', {
        signal: controller.signal
      });
      clearTimeout(timeout);

      if (res2.ok) {
        const data2 = await res2.json();
        if (data2 && typeof data2.ip === 'string') {
          sessionStorage.setItem('client_public_ip', data2.ip);
          return data2.ip;
        }
      }
    } catch {
      // Ignore network errors
    }
  }

  // Device unique identifier fallback stored in localStorage
  let fallbackId = localStorage.getItem('device_client_identifier');
  if (!fallbackId) {
    fallbackId = 'ip_sim_' + Math.random().toString(36).substring(2, 10);
    localStorage.setItem('device_client_identifier', fallbackId);
  }
  return fallbackId;
}

/**
 * Sanitizes IP string for Firestore document ID
 */
export function sanitizeIpForDocId(ip: string): string {
  return ip.replace(/[^a-zA-Z0-9_-]/g, '_');
}

/**
 * Checks whether this IP has already submitted in the current 06:00 AM cycle
 */
export async function checkIpSubmissionLimit(
  ip: string,
  mode: 'evaluation' | 'aspiration'
): Promise<{ limitReached: boolean; cycleInfo: ResetCycleInfo }> {
  const cycleInfo = getResetCycleInfo();
  const safeIp = sanitizeIpForDocId(ip);
  const storageKey = `submission_limit_${mode}_${cycleInfo.cycleId}_${safeIp}`;

  // 1. Quick check localStorage
  try {
    const localVal = localStorage.getItem(storageKey);
    if (localVal) {
      const parsed = JSON.parse(localVal);
      if (parsed && parsed.cycleId === cycleInfo.cycleId) {
        return { limitReached: true, cycleInfo };
      }
    }
  } catch {
    // Ignore JSON parse errors
  }

  // 2. Check Firestore submission_limits collection
  try {
    const docId = `${mode}_${cycleInfo.cycleId}_${safeIp}`;
    const docRef = doc(db, 'submission_limits', docId);
    const snap = await getDoc(docRef);

    if (snap.exists()) {
      const data = snap.data();
      if (data && data.cycleId === cycleInfo.cycleId && (data.count ?? 1) >= 1) {
        // Synchronize to localStorage for instant local checking
        try {
          localStorage.setItem(storageKey, JSON.stringify({ cycleId: cycleInfo.cycleId, ip }));
        } catch {}
        return { limitReached: true, cycleInfo };
      }
    }
  } catch (err) {
    console.warn('Gagal memeriksa limit Firestore:', err);
  }

  return { limitReached: false, cycleInfo };
}

/**
 * Records that this IP has submitted during the current 06:00 AM cycle
 */
export async function recordIpSubmission(
  ip: string,
  mode: 'evaluation' | 'aspiration'
): Promise<void> {
  const cycleInfo = getResetCycleInfo();
  const safeIp = sanitizeIpForDocId(ip);
  const storageKey = `submission_limit_${mode}_${cycleInfo.cycleId}_${safeIp}`;

  // Save to localStorage immediately
  try {
    localStorage.setItem(storageKey, JSON.stringify({ cycleId: cycleInfo.cycleId, ip, timestamp: Date.now() }));
  } catch {}

  // Save to Firestore submission_limits
  try {
    const docId = `${mode}_${cycleInfo.cycleId}_${safeIp}`;
    const docRef = doc(db, 'submission_limits', docId);
    await setDoc(docRef, {
      id: docId,
      ip,
      mode,
      cycleId: cycleInfo.cycleId,
      count: 1,
      submittedAt: serverTimestamp(),
      nextResetTime: cycleInfo.nextReset.toISOString()
    });
  } catch (err) {
    console.warn('Gagal mencatat limit submission ke Firestore:', err);
  }
}
