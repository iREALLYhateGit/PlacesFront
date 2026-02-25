import { describe, it, expect } from 'vitest';
import { PLACE_TYPE_LABEL, PLACE_TYPE_OPTIONS } from '../../types/placeLabels';
import { PLACE_TYPE_TO_ID } from '../../types/place';

describe('PLACE_TYPE_LABEL', () => {
  it('содержит ровно 16 типов', () => {
    expect(Object.keys(PLACE_TYPE_LABEL)).toHaveLength(16);
  });

  it('все значения являются непустыми строками', () => {
    Object.values(PLACE_TYPE_LABEL).forEach((label) => {
      expect(typeof label).toBe('string');
      expect(label.length).toBeGreaterThan(0);
    });
  });

  it('содержит корректные русские переводы', () => {
    expect(PLACE_TYPE_LABEL['museum']).toBe('Музей');
    expect(PLACE_TYPE_LABEL['park']).toBe('Парк');
    expect(PLACE_TYPE_LABEL['cathedral']).toBe('Собор');
    expect(PLACE_TYPE_LABEL['other']).toBe('Другое');
    expect(PLACE_TYPE_LABEL['restaurant']).toBe('Ресторан');
  });

  it('содержит все ключи из PLACE_TYPE_TO_ID', () => {
    const expectedKeys = Object.keys(PLACE_TYPE_TO_ID);
    expectedKeys.forEach((key) => {
      expect(PLACE_TYPE_LABEL).toHaveProperty(key);
    });
  });
});

describe('PLACE_TYPE_OPTIONS', () => {
  it('содержит ровно 16 элементов', () => {
    expect(PLACE_TYPE_OPTIONS).toHaveLength(16);
  });

  it('содержит все ключи из PLACE_TYPE_LABEL', () => {
    const labelKeys = Object.keys(PLACE_TYPE_LABEL);
    labelKeys.forEach((key) => {
      expect(PLACE_TYPE_OPTIONS).toContain(key);
    });
  });

  it('не содержит дубликатов', () => {
    const unique = new Set(PLACE_TYPE_OPTIONS);
    expect(unique.size).toBe(PLACE_TYPE_OPTIONS.length);
  });
});