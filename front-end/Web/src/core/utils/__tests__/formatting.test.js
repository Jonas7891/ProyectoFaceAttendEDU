/**
 * Tests unitarios para utilidades de formateo
 * @jest-environment node
 */

import {
  formatNumber,
  formatPercentage,
  formatCurrency,
  truncate,
  capitalize,
  titleCase,
  slugify,
  formatFullName,
  formatInitials,
  formatPhone,
  formatFileSize,
  maskEmail,
  maskPhone,
  camelToTitle,
  pluralize,
  getColorFromText,
} from '../formatting';

describe('formatting utilities', () => {
  // ── Number Formatting ────────────────────────────────────────
  describe('formatNumber', () => {
    test('formatea números con separadores', () => {
      expect(formatNumber(1234567)).toBe('1,234,567');
      expect(formatNumber(1234567.89, 2)).toBe('1,234,567.89');
      expect(formatNumber(0)).toBe('0');
    });

    test('maneja valores inválidos', () => {
      expect(formatNumber(null)).toBe('0');
      expect(formatNumber(undefined)).toBe('0');
      expect(formatNumber(NaN)).toBe('0');
    });
  });

  describe('formatPercentage', () => {
    test('formatea porcentajes correctamente', () => {
      expect(formatPercentage(0.8523)).toBe('85.23%');
      expect(formatPercentage(0.5, 0)).toBe('50%');
      expect(formatPercentage(1)).toBe('100.00%');
    });

    test('maneja valores inválidos', () => {
      expect(formatPercentage(null)).toBe('0%');
    });
  });

  describe('formatCurrency', () => {
    test('formatea moneda correctamente', () => {
      expect(formatCurrency(1234.56)).toBe('$1,234.56');
      expect(formatCurrency(0)).toBe('$0.00');
    });

    test('maneja valores inválidos', () => {
      expect(formatCurrency(null)).toBe('$0.00');
    });
  });

  // ── Text Formatting ──────────────────────────────────────────
  describe('truncate', () => {
    test('trunca texto largo', () => {
      expect(truncate('Hello World', 5)).toBe('Hello...');
      expect(truncate('Hello World', 8, '>>')).toBe('Hello Wo>>');
    });

    test('no trunca texto corto', () => {
      expect(truncate('Hello', 10)).toBe('Hello');
      expect(truncate('', 5)).toBe('');
    });
  });

  describe('capitalize', () => {
    test('capitaliza primera letra', () => {
      expect(capitalize('hello world')).toBe('Hello world');
      expect(capitalize('HELLO')).toBe('Hello');
      expect(capitalize('h')).toBe('H');
    });

    test('maneja strings vacíos', () => {
      expect(capitalize('')).toBe('');
      expect(capitalize(null)).toBe('');
    });
  });

  describe('titleCase', () => {
    test('capitaliza cada palabra', () => {
      expect(titleCase('hello world')).toBe('Hello World');
      expect(titleCase('the quick brown fox')).toBe('The Quick Brown Fox');
    });
  });

  describe('slugify', () => {
    test('convierte a slug', () => {
      expect(slugify('Hello World!')).toBe('hello-world');
      expect(slugify('  Multiple   Spaces  ')).toBe('multiple-spaces');
      expect(slugify('Special@#$Characters')).toBe('specialcharacters');
    });

    test('maneja strings vacíos', () => {
      expect(slugify('')).toBe('');
    });
  });

  // ── Name Formatting ──────────────────────────────────────────
  describe('formatFullName', () => {
    test('formatea nombre completo', () => {
      expect(formatFullName('john', 'doe')).toBe('John Doe');
      expect(formatFullName('MARIA', 'GARCIA')).toBe('Maria Garcia');
    });

    test('maneja nombres incompletos', () => {
      expect(formatFullName('John', '')).toBe('John');
      expect(formatFullName('', 'Doe')).toBe('Doe');
    });
  });

  describe('formatInitials', () => {
    test('genera iniciales', () => {
      expect(formatInitials('John', 'Doe')).toBe('JD');
      expect(formatInitials('maria', 'garcia')).toBe('MG');
    });

    test('maneja valores vacíos', () => {
      expect(formatInitials('', '')).toBe('');
      expect(formatInitials('John', '')).toBe('J');
    });
  });

  // ── Phone Formatting ─────────────────────────────────────────
  describe('formatPhone', () => {
    test('formatea teléfonos de 10 dígitos', () => {
      expect(formatPhone('1234567890')).toBe('(123) 456-7890');
      expect(formatPhone('5551234567')).toBe('(555) 123-4567');
    });

    test('no formatea teléfonos no válidos', () => {
      expect(formatPhone('123')).toBe('123');
      expect(formatPhone('')).toBe('');
    });
  });

  // ── File Size Formatting ─────────────────────────────────────
  describe('formatFileSize', () => {
    test('formatea tamaños correctamente', () => {
      expect(formatFileSize(0)).toBe('0 Bytes');
      expect(formatFileSize(1024)).toBe('1 KB');
      expect(formatFileSize(1536)).toBe('1.5 KB');
      expect(formatFileSize(1048576)).toBe('1 MB');
      expect(formatFileSize(1073741824)).toBe('1 GB');
    });
  });

  // ── Masking ──────────────────────────────────────────────────
  describe('maskEmail', () => {
    test('enmascara emails', () => {
      expect(maskEmail('john.doe@example.com')).toBe('j***e@example.com');
      expect(maskEmail('test@example.com')).toBe('t***t@example.com');
    });

    test('no enmascara emails cortos', () => {
      expect(maskEmail('ab@test.com')).toBe('ab@test.com');
    });

    test('maneja valores inválidos', () => {
      expect(maskEmail('')).toBe('');
      expect(maskEmail('invalid')).toBe('invalid');
    });
  });

  describe('maskPhone', () => {
    test('enmascara teléfonos', () => {
      expect(maskPhone('1234567890')).toBe('******7890');
      expect(maskPhone('+1 (555) 123-4567')).toBe('**********4567');
    });

    test('maneja teléfonos cortos', () => {
      expect(maskPhone('123')).toBe('123');
    });
  });

  // ── Utility Functions ────────────────────────────────────────
  describe('camelToTitle', () => {
    test('convierte camelCase a Title Case', () => {
      expect(camelToTitle('firstName')).toBe('First Name');
      expect(camelToTitle('userEmailAddress')).toBe('User Email Address');
    });

    test('maneja strings vacíos', () => {
      expect(camelToTitle('')).toBe('');
    });
  });

  describe('pluralize', () => {
    test('pluraliza correctamente', () => {
      expect(pluralize(1, 'item')).toBe('1 item');
      expect(pluralize(2, 'item')).toBe('2 items');
      expect(pluralize(5, 'persona', 'personas')).toBe('5 personas');
      expect(pluralize(0, 'item')).toBe('0 items');
    });
  });

  describe('getColorFromText', () => {
    test('genera colores consistentes', () => {
      const color1 = getColorFromText('John Doe');
      const color2 = getColorFromText('John Doe');
      expect(color1).toBe(color2);
    });

    test('genera colores diferentes para textos diferentes', () => {
      const color1 = getColorFromText('John Doe');
      const color2 = getColorFromText('Jane Smith');
      expect(color1).not.toBe(color2);
    });

    test('genera color válido en formato hex', () => {
      const color = getColorFromText('Test');
      expect(color).toMatch(/^#[0-9A-F]{6}$/i);
    });

    test('maneja strings vacíos', () => {
      expect(getColorFromText('')).toBe('#64748B');
      expect(getColorFromText(null)).toBe('#64748B');
    });
  });
});
