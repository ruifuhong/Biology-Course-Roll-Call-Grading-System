import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { 
  generateSemesterOptions, 
  academicToCalendarYear, 
  calendarToAcademicYear,
  getCurrentAcademicYear,
  getCurrentSemesterNumber 
} from '../../utils/semesterUtils.js';

describe('Semester Utils - Unit Tests', () => {
  
  describe('academicToCalendarYear', () => {
    it('should convert academic year 113 to calendar year 2024', () => {
      expect(academicToCalendarYear(113)).toBe(2024);
    });

    it('should convert academic year 114 to calendar year 2025', () => {
      expect(academicToCalendarYear(114)).toBe(2025);
    });

    it('should handle edge case academic years', () => {
      expect(academicToCalendarYear(100)).toBe(2011);
      expect(academicToCalendarYear(120)).toBe(2031);
    });
  });

  describe('calendarToAcademicYear', () => {
    it('should convert calendar year 2024 to academic year 113', () => {
      expect(calendarToAcademicYear(2024)).toBe(113);
    });

    it('should convert calendar year 2025 to academic year 114', () => {
      expect(calendarToAcademicYear(2025)).toBe(114);
    });

    it('should handle edge case calendar years', () => {
      expect(calendarToAcademicYear(2011)).toBe(100);
      expect(calendarToAcademicYear(2031)).toBe(120);
    });
  });

  describe('getCurrentAcademicYear', () => {
    it('should return correct academic year for August (start of fall semester)', () => {
      const augustDate = new Date('2024-08-01');
      expect(getCurrentAcademicYear(augustDate)).toBe(113);
    });

    it('should return correct academic year for January (spring semester)', () => {
      const januaryDate = new Date('2024-01-15');
      expect(getCurrentAcademicYear(januaryDate)).toBe(112);
    });

    it('should return correct academic year for July (end of spring semester)', () => {
      const julyDate = new Date('2024-07-31');
      expect(getCurrentAcademicYear(julyDate)).toBe(112);
    });

    it('should return correct academic year for September (fall semester)', () => {
      const septemberDate = new Date('2024-09-15');
      expect(getCurrentAcademicYear(septemberDate)).toBe(113);
    });

    it('should handle February transition correctly', () => {
      const februaryDate = new Date('2025-02-01');
      expect(getCurrentAcademicYear(februaryDate)).toBe(113);
    });
  });

  describe('getCurrentSemesterNumber', () => {
    it('should return 1 for August (fall semester start)', () => {
      const augustDate = new Date('2024-08-01');
      expect(getCurrentSemesterNumber(augustDate)).toBe(1);
    });

    it('should return 1 for January (fall semester end)', () => {
      const januaryDate = new Date('2024-01-31');
      expect(getCurrentSemesterNumber(januaryDate)).toBe(1);
    });

    it('should return 2 for February (spring semester start)', () => {
      const februaryDate = new Date('2024-02-01');
      expect(getCurrentSemesterNumber(februaryDate)).toBe(2);
    });

    it('should return 2 for July (spring semester end)', () => {
      const julyDate = new Date('2024-07-31');
      expect(getCurrentSemesterNumber(julyDate)).toBe(2);
    });

    it('should return 1 for December (fall semester)', () => {
      const decemberDate = new Date('2024-12-15');
      expect(getCurrentSemesterNumber(decemberDate)).toBe(1);
    });
  });

  describe('generateSemesterOptions', () => {
    let mockDate;

    beforeEach(() => {
      mockDate = new Date('2025-11-06');
      vi.setSystemTime(mockDate);
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('should generate semester options starting from year 113', () => {
      const options = generateSemesterOptions();
      
      const semester1131 = options.find(opt => opt.value === '1131');
      expect(semester1131).toBeDefined();
      expect(semester1131.label).toBe('113-1 (Fall 2024)');
    });

    it('should generate semester options up to current academic year and semester', () => {
      const options = generateSemesterOptions();
      
      const semester1141 = options.find(opt => opt.value === '1141');
      const semester1142 = options.find(opt => opt.value === '1142');
      
      expect(semester1141).toBeDefined();
      expect(semester1142).toBeUndefined();
    });

    it('should return options in reverse chronological order (newest first)', () => {
      const options = generateSemesterOptions();
      
      expect(options[0].value).toBe('1141');
      
      const values = options.map(opt => opt.value);
      expect(values[0]).toBe('1141');
      expect(values[1]).toBe('1132');
      expect(values[2]).toBe('1131');
    });

    it('should format semester labels correctly', () => {
      const options = generateSemesterOptions();
      
      const fallSemester = options.find(opt => opt.value === '1131');
      const springSemester = options.find(opt => opt.value === '1132');
      
      expect(fallSemester.label).toBe('113-1 (Fall 2024)');
      expect(springSemester.label).toBe('113-2 (Spring 2025)');
    });

    it('should handle spring semester testing (February)', () => {
      const springDate = new Date('2025-03-15');
      vi.setSystemTime(springDate);
      
      const options = generateSemesterOptions();
      
      const semester1132 = options.find(opt => opt.value === '1132');
      expect(semester1132).toBeDefined();
      expect(semester1132.label).toBe('113-2 (Spring 2025)');
      
      const semester1141 = options.find(opt => opt.value === '1141');
      expect(semester1141).toBeUndefined();
    });

    it('should handle August transition correctly', () => {
      const augustDate = new Date('2025-08-01');
      vi.setSystemTime(augustDate);
      
      const options = generateSemesterOptions();
      
      const semester1141 = options.find(opt => opt.value === '1141');
      expect(semester1141).toBeDefined();
      expect(semester1141.label).toBe('114-1 (Fall 2025)');
    });
  });
});