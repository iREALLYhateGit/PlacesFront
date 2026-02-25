import { describe, it, expect } from 'vitest';
import { PLACE_TYPE_BY_ID, PLACE_TYPE_TO_ID } from '../../types/place';

describe('PLACE_TYPE_BY_ID', () => {
  it('содержит ровно 16 типов', () => {
    expect(Object.keys(PLACE_TYPE_BY_ID)).toHaveLength(16);
  });

  it('содержит корректные spot-check значения', () => {
    expect(PLACE_TYPE_BY_ID[1]).toBe('cathedral');
    expect(PLACE_TYPE_BY_ID[3]).toBe('museum');
    expect(PLACE_TYPE_BY_ID[5]).toBe('park');
    expect(PLACE_TYPE_BY_ID[16]).toBe('other');
  });

  it('все значения являются непустыми строками', () => {
    Object.values(PLACE_TYPE_BY_ID).forEach((value) => {
      expect(typeof value).toBe('string');
      expect(value.length).toBeGreaterThan(0);
    });
  });
});

describe('PLACE_TYPE_TO_ID', () => {
  it('содержит ровно 16 типов', () => {
    expect(Object.keys(PLACE_TYPE_TO_ID)).toHaveLength(16);
  });

  it('содержит корректные spot-check значения', () => {
    expect(PLACE_TYPE_TO_ID['cathedral']).toBe(1);
    expect(PLACE_TYPE_TO_ID['museum']).toBe(3);
    expect(PLACE_TYPE_TO_ID['park']).toBe(5);
    expect(PLACE_TYPE_TO_ID['other']).toBe(16);
  });

  it('все значения являются положительными числами', () => {
    Object.values(PLACE_TYPE_TO_ID).forEach((id) => {
      expect(typeof id).toBe('number');
      expect(id).toBeGreaterThan(0);
    });
  });
});

describe('двунаправленная согласованность маппингов', () => {
  it('PLACE_TYPE_TO_ID[PLACE_TYPE_BY_ID[id]] === id для всех id', () => {
    Object.entries(PLACE_TYPE_BY_ID).forEach(([idStr, typeString]) => {
      const id = Number(idStr);
      expect(PLACE_TYPE_TO_ID[typeString]).toBe(id);
    });
  });

  it('PLACE_TYPE_BY_ID[PLACE_TYPE_TO_ID[type]] === type для всех типов', () => {
    Object.entries(PLACE_TYPE_TO_ID).forEach(([typeString, id]) => {
      expect(PLACE_TYPE_BY_ID[id]).toBe(typeString);
    });
  });
});