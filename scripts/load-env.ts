/**
 * Skriptlər üçün `.env` yükləyicisi.
 *
 * Next.js `.env`-i özü oxuyur, lakin `tsx` ilə işləyən skriptlər oxumur.
 * Fayl yoxdursa və ya oxunmursa heç nə etmir — Hostinger-də dəyişənlər artıq
 * mühitdə təyin olunub.
 */

import { existsSync } from 'node:fs';
import { resolve } from 'node:path';

const envPath = resolve(process.cwd(), '.env');

if (existsSync(envPath) && typeof process.loadEnvFile === 'function') {
  try {
    process.loadEnvFile(envPath);
  } catch {
    // Zədələnmiş `.env` skripti dayandırmasın — mühit dəyişənləri kifayət edə bilər.
  }
}

export {};
