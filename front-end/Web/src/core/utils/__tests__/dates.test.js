/**
 * Tests unitarios para utilidades de fechas
 * @jest-environment node
 */

import {
  formatDate,
  formatTime,
  formatDateTime,
  getRelativeTime,
  isToday,
  isYesterday,
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  addDays,
  addMonths,
  daysBetween,
  calculateAge,
  parseDate,
  getWeekDays,
  getMonths,
  isDateInRange,
} from '../dates';

describe('dates utilities', () => {
  // ── Date Formatting ──────────────────────────────────────────
  describe('formatDate', () => {
    test('formatea en DD/MM/YYYY por defecto', () => {
      const date = new Date(2026, 8, 3); // 03/09/2026
      expect(formatDate(date)).toBe('03/09/2026');
    });

    test('formatea en YYYY-MM-DD', () => {
      const date = new Date(2026, 8, 3);
      expect(formatDate(date, 'YYYY-MM-DD')).toBe('2026-09-03');
    });

    test('formatea en MM/DD/YYYY', () => {
      const date = new Date(2026, 8, 3);
      expect(formatDate(date, 'MM/DD/YYYY')).toBe('09/03/2026');
    });

    test('maneja fechas inválidas', () => {
      expect(formatDate(null)).toBe('');
      expect(formatDate('invalid')).toBe('');
    });
  });

  describe('formatTime', () => {
    test('formatea hora en HH:mm', () => {
      const date = new Date(2026, 8, 3, 14, 30);
      expect(formatTime(date)).toBe('14:30');
    });

    test('maneja horas con un dígito', () => {
      const date = new Date(2026, 8, 3, 9, 5);
      expect(formatTime(date)).toBe('09:05');
    });
  });

  describe('formatDateTime', () => {
    test('formatea fecha y hora juntos', () => {
      const date = new Date(2026, 8, 3, 14, 30);
      expect(formatDateTime(date)).toBe('03/09/2026 14:30');
    });
  });

  // ── Date Checks ──────────────────────────────────────────────
  describe('isToday', () => {
    test('detecta fecha de hoy', () => {
      const today = new Date();
      expect(isToday(today)).toBe(true);
    });

    test('rechaza fechas pasadas', () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      expect(isToday(yesterday)).toBe(false);
    });
  });

  describe('isYesterday', () => {
    test('detecta fecha de ayer', () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      expect(isYesterday(yesterday)).toBe(true);
    });

    test('rechaza fecha de hoy', () => {
      const today = new Date();
      expect(isYesterday(today)).toBe(false);
    });
  });

  // ── Date Boundaries ──────────────────────────────────────────
  describe('startOfDay', () => {
    test('obtiene inicio del día', () => {
      const date = new Date(2026, 8, 3, 14, 30, 45);
      const start = startOfDay(date);
      expect(start.getHours()).toBe(0);
      expect(start.getMinutes()).toBe(0);
      expect(start.getSeconds()).toBe(0);
      expect(start.getMilliseconds()).toBe(0);
    });
  });

  describe('endOfDay', () => {
    test('obtiene fin del día', () => {
      const date = new Date(2026, 8, 3, 10, 0, 0);
      const end = endOfDay(date);
      expect(end.getHours()).toBe(23);
      expect(end.getMinutes()).toBe(59);
      expect(end.getSeconds()).toBe(59);
    });
  });

  describe('startOfMonth', () => {
    test('obtiene primer día del mes', () => {
      const date = new Date(2026, 8, 15);
      const start = startOfMonth(date);
      expect(start.getDate()).toBe(1);
      expect(start.getMonth()).toBe(8);
    });
  });

  describe('endOfMonth', () => {
    test('obtiene último día del mes', () => {
      const date = new Date(2026, 8, 15); // Septiembre
      const end = endOfMonth(date);
      expect(end.getDate()).toBe(30); // Septiembre tiene 30 días
    });

    test('maneja febrero', () => {
      const date = new Date(2024, 1, 15); // Febrero 2024 (bisiesto)
      const end = endOfMonth(date);
      expect(end.getDate()).toBe(29);
    });
  });

  // ── Date Arithmetic ──────────────────────────────────────────
  describe('addDays', () => {
    test('añade días', () => {
      const date = new Date(2026, 8, 3);
      const result = addDays(date, 7);
      expect(result.getDate()).toBe(10);
    });

    test('resta días con número negativo', () => {
      const date = new Date(2026, 8, 10);
      const result = addDays(date, -5);
      expect(result.getDate()).toBe(5);
    });
  });

  describe('addMonths', () => {
    test('añade meses', () => {
      const date = new Date(2026, 8, 3);
      const result = addMonths(date, 3);
      expect(result.getMonth()).toBe(11); // Diciembre
    });

    test('resta meses con número negativo', () => {
      const date = new Date(2026, 8, 3);
      const result = addMonths(date, -2);
      expect(result.getMonth()).toBe(6); // Julio
    });
  });

  describe('daysBetween', () => {
    test('calcula diferencia en días', () => {
      const date1 = new Date(2026, 8, 1);
      const date2 = new Date(2026, 8, 10);
      expect(daysBetween(date1, date2)).toBe(9);
    });

    test('retorna valor absoluto', () => {
      const date1 = new Date(2026, 8, 10);
      const date2 = new Date(2026, 8, 1);
      expect(daysBetween(date1, date2)).toBe(9);
    });
  });

  describe('calculateAge', () => {
    test('calcula edad correctamente', () => {
      const birthDate = new Date(2000, 0, 1);
      const age = calculateAge(birthDate);
      expect(age).toBeGreaterThan(20); // Debería tener más de 20 en 2026
    });

    test('maneja cumpleaños no alcanzado este año', () => {
      const today = new Date();
      const birthDate = new Date(
        today.getFullYear() - 20,
        today.getMonth() + 1, // Un mes en el futuro
        1
      );
      const age = calculateAge(birthDate);
      expect(age).toBe(19); // Aún no cumple 20
    });
  });

  // ── Date Parsing ─────────────────────────────────────────────
  describe('parseDate', () => {
    test('parsea formato YYYY-MM-DD', () => {
      const result = parseDate('2026-09-03');
      expect(result).toBeInstanceOf(Date);
      expect(result.getFullYear()).toBe(2026);
    });

    test('parsea formato DD/MM/YYYY', () => {
      const result = parseDate('03/09/2026');
      expect(result).toBeInstanceOf(Date);
    });

    test('retorna null para fechas inválidas', () => {
      expect(parseDate('invalid')).toBeNull();
      expect(parseDate('')).toBeNull();
    });
  });

  // ── Date Helpers ─────────────────────────────────────────────
  describe('getWeekDays', () => {
    test('retorna nombres completos', () => {
      const days = getWeekDays();
      expect(days).toHaveLength(7);
      expect(days[0]).toBe('Domingo');
      expect(days[1]).toBe('Lunes');
    });

    test('retorna nombres cortos', () => {
      const days = getWeekDays(true);
      expect(days).toHaveLength(7);
      expect(days[0]).toBe('Dom');
      expect(days[1]).toBe('Lun');
    });
  });

  describe('getMonths', () => {
    test('retorna nombres completos', () => {
      const months = getMonths();
      expect(months).toHaveLength(12);
      expect(months[0]).toBe('Enero');
      expect(months[11]).toBe('Diciembre');
    });

    test('retorna nombres cortos', () => {
      const months = getMonths(true);
      expect(months).toHaveLength(12);
      expect(months[0]).toBe('Ene');
      expect(months[11]).toBe('Dic');
    });
  });

  describe('isDateInRange', () => {
    test('detecta fecha dentro del rango', () => {
      const date = new Date(2026, 8, 15);
      const start = new Date(2026, 8, 1);
      const end = new Date(2026, 8, 30);
      expect(isDateInRange(date, start, end)).toBe(true);
    });

    test('detecta fecha fuera del rango', () => {
      const date = new Date(2026, 7, 15); // Agosto
      const start = new Date(2026, 8, 1); // Septiembre
      const end = new Date(2026, 8, 30);
      expect(isDateInRange(date, start, end)).toBe(false);
    });

    test('incluye límites del rango', () => {
      const start = new Date(2026, 8, 1);
      const end = new Date(2026, 8, 30);
      expect(isDateInRange(start, start, end)).toBe(true);
      expect(isDateInRange(end, start, end)).toBe(true);
    });
  });

  // ── Relative Time ────────────────────────────────────────────
  describe('getRelativeTime', () => {
    test('muestra "hace un momento" para tiempos recientes', () => {
      const now = new Date();
      const recent = new Date(now.getTime() - 30000); // 30 segundos atrás
      expect(getRelativeTime(recent)).toBe('hace un momento');
    });

    test('muestra minutos', () => {
      const now = new Date();
      const minutes = new Date(now.getTime() - 5 * 60000); // 5 minutos atrás
      expect(getRelativeTime(minutes)).toContain('minuto');
    });

    test('muestra horas', () => {
      const now = new Date();
      const hours = new Date(now.getTime() - 2 * 3600000); // 2 horas atrás
      expect(getRelativeTime(hours)).toContain('hora');
    });
  });

  // ── Week Boundaries ──────────────────────────────────────────
  describe('startOfWeek', () => {
    test('obtiene lunes de la semana', () => {
      const date = new Date(2026, 8, 3); // Jueves
      const start = startOfWeek(date);
      expect(start.getDay()).toBe(1); // Lunes
    });
  });

  describe('endOfWeek', () => {
    test('obtiene domingo de la semana', () => {
      const date = new Date(2026, 8, 3); // Jueves
      const end = endOfWeek(date);
      expect(end.getDay()).toBe(0); // Domingo
    });
  });
});
