/**
 * Tests unitarios para utilidades de validación
 * @jest-environment node
 */

import {
  isValidEmail,
  isRequired,
  minLength,
  maxLength,
  isNumber,
  isInRange,
  isValidUrl,
  isValidPhone,
  isValidDate,
  isAdult,
  isStrongPassword,
  isValidStudentCode,
  validate,
  validators,
} from '../validation';

describe('validation utilities', () => {
  // ── Email Validation ─────────────────────────────────────────
  describe('isValidEmail', () => {
    test('valida emails correctos', () => {
      expect(isValidEmail('user@example.com')).toBe(true);
      expect(isValidEmail('test.user@example.com')).toBe(true);
      expect(isValidEmail('user+tag@example.co.uk')).toBe(true);
    });

    test('rechaza emails inválidos', () => {
      expect(isValidEmail('invalid')).toBe(false);
      expect(isValidEmail('invalid@')).toBe(false);
      expect(isValidEmail('@example.com')).toBe(false);
      expect(isValidEmail('user@')).toBe(false);
      expect(isValidEmail('')).toBe(false);
      expect(isValidEmail(null)).toBe(false);
    });
  });

  // ── Required Validation ──────────────────────────────────────
  describe('isRequired', () => {
    test('valida valores no vacíos', () => {
      expect(isRequired('hello')).toBe(true);
      expect(isRequired('0')).toBe(true);
      expect(isRequired(0)).toBe(true);
      expect(isRequired(false)).toBe(true);
    });

    test('rechaza valores vacíos', () => {
      expect(isRequired('')).toBe(false);
      expect(isRequired('   ')).toBe(false);
      expect(isRequired(null)).toBe(false);
      expect(isRequired(undefined)).toBe(false);
    });
  });

  // ── Length Validation ────────────────────────────────────────
  describe('minLength', () => {
    test('valida longitud mínima', () => {
      expect(minLength('hello', 3)).toBe(true);
      expect(minLength('hello', 5)).toBe(true);
      expect(minLength(12345, 4)).toBe(true);
    });

    test('rechaza longitud insuficiente', () => {
      expect(minLength('hi', 5)).toBe(false);
      expect(minLength('', 1)).toBe(false);
      expect(minLength(null, 1)).toBe(false);
    });
  });

  describe('maxLength', () => {
    test('valida longitud máxima', () => {
      expect(maxLength('hello', 10)).toBe(true);
      expect(maxLength('hello', 5)).toBe(true);
      expect(maxLength('', 5)).toBe(true);
    });

    test('rechaza longitud excesiva', () => {
      expect(maxLength('hello world', 5)).toBe(false);
    });
  });

  // ── Number Validation ────────────────────────────────────────
  describe('isNumber', () => {
    test('valida números', () => {
      expect(isNumber(42)).toBe(true);
      expect(isNumber('42')).toBe(true);
      expect(isNumber('3.14')).toBe(true);
      expect(isNumber(-10)).toBe(true);
    });

    test('rechaza no-números', () => {
      expect(isNumber('hello')).toBe(false);
      expect(isNumber('12abc')).toBe(false);
      expect(isNumber(NaN)).toBe(false);
      expect(isNumber(Infinity)).toBe(false);
    });
  });

  describe('isInRange', () => {
    test('valida números en rango', () => {
      expect(isInRange(5, 1, 10)).toBe(true);
      expect(isInRange(1, 1, 10)).toBe(true);
      expect(isInRange(10, 1, 10)).toBe(true);
    });

    test('rechaza números fuera de rango', () => {
      expect(isInRange(0, 1, 10)).toBe(false);
      expect(isInRange(11, 1, 10)).toBe(false);
      expect(isInRange(-5, 1, 10)).toBe(false);
    });
  });

  // ── URL Validation ───────────────────────────────────────────
  describe('isValidUrl', () => {
    test('valida URLs correctas', () => {
      expect(isValidUrl('https://example.com')).toBe(true);
      expect(isValidUrl('http://example.com')).toBe(true);
      expect(isValidUrl('https://example.com/path')).toBe(true);
    });

    test('rechaza URLs inválidas', () => {
      expect(isValidUrl('not a url')).toBe(false);
      expect(isValidUrl('example.com')).toBe(false);
      expect(isValidUrl('')).toBe(false);
    });
  });

  // ── Phone Validation ─────────────────────────────────────────
  describe('isValidPhone', () => {
    test('valida teléfonos correctos', () => {
      expect(isValidPhone('+1 (555) 123-4567')).toBe(true);
      expect(isValidPhone('555-123-4567')).toBe(true);
      expect(isValidPhone('5551234567')).toBe(true);
    });

    test('rechaza teléfonos inválidos', () => {
      expect(isValidPhone('123')).toBe(false);
      expect(isValidPhone('abc-def-ghij')).toBe(false);
      expect(isValidPhone('')).toBe(false);
    });
  });

  // ── Date Validation ──────────────────────────────────────────
  describe('isValidDate', () => {
    test('valida fechas correctas', () => {
      expect(isValidDate('2026-09-03')).toBe(true);
      expect(isValidDate('09/03/2026')).toBe(true);
      expect(isValidDate(new Date())).toBe(true);
    });

    test('rechaza fechas inválidas', () => {
      expect(isValidDate('invalid')).toBe(false);
      expect(isValidDate('')).toBe(false);
      expect(isValidDate(null)).toBe(false);
    });
  });

  describe('isAdult', () => {
    test('valida mayores de edad', () => {
      const birthDate = new Date();
      birthDate.setFullYear(birthDate.getFullYear() - 20);
      expect(isAdult(birthDate)).toBe(true);
    });

    test('rechaza menores de edad', () => {
      const birthDate = new Date();
      birthDate.setFullYear(birthDate.getFullYear() - 15);
      expect(isAdult(birthDate)).toBe(false);
    });
  });

  // ── Password Validation ──────────────────────────────────────
  describe('isStrongPassword', () => {
    test('valida contraseñas fuertes', () => {
      expect(isStrongPassword('Password123')).toBe(true);
      expect(isStrongPassword('MyP@ssw0rd')).toBe(true);
      expect(isStrongPassword('Abc12345')).toBe(true);
    });

    test('rechaza contraseñas débiles', () => {
      expect(isStrongPassword('weak')).toBe(false);
      expect(isStrongPassword('password')).toBe(false);
      expect(isStrongPassword('PASSWORD')).toBe(false);
      expect(isStrongPassword('12345678')).toBe(false);
      expect(isStrongPassword('Pass123')).toBe(false); // muy corta
    });
  });

  // ── Student Code Validation ──────────────────────────────────
  describe('isValidStudentCode', () => {
    test('valida códigos correctos', () => {
      expect(isValidStudentCode('ABC12345')).toBe(true);
      expect(isValidStudentCode('STU123456789')).toBe(true);
      expect(isValidStudentCode('123456')).toBe(true);
    });

    test('rechaza códigos inválidos', () => {
      expect(isValidStudentCode('ABC')).toBe(false); // muy corto
      expect(isValidStudentCode('ABC-123')).toBe(false); // contiene guión
      expect(isValidStudentCode('ABCDEFGHIJKLM')).toBe(false); // muy largo
    });
  });

  // ── Validate Function ────────────────────────────────────────
  describe('validate', () => {
    test('valida con múltiples validadores', () => {
      const result = validate('test@example.com', [
        validators.required(),
        validators.email(),
      ]);
      
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test('retorna errores de validación', () => {
      const result = validate('', [
        validators.required(),
        validators.minLength(5),
      ]);
      
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    test('valida contraseña con validadores predefinidos', () => {
      const result = validate('weak', [
        validators.required(),
        validators.minLength(8),
        validators.strongPassword(),
      ]);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Mínimo 8 caracteres');
    });
  });

  // ── Predefined Validators ────────────────────────────────────
  describe('validators', () => {
    test('validators.required genera validador correcto', () => {
      const validator = validators.required('Campo obligatorio');
      expect(validator.message).toBe('Campo obligatorio');
      expect(validator.fn('test')).toBe(true);
      expect(validator.fn('')).toBe(false);
    });

    test('validators.email genera validador correcto', () => {
      const validator = validators.email();
      expect(validator.fn('test@example.com')).toBe(true);
      expect(validator.fn('invalid')).toBe(false);
    });

    test('validators.minLength genera validador correcto', () => {
      const validator = validators.minLength(5);
      expect(validator.fn('hello')).toBe(true);
      expect(validator.fn('hi')).toBe(false);
    });
  });
});
