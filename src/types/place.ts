export type PlaceType = {
  id: number;
  title: string;  // здесь будет значение типа 'cathedral', 'museum' и т.д.
};

export type Place = {
  id: number;
  title: string;
  type: PlaceType;  // теперь это объект, а не строка
  address: string;
  description: string;
  architect: string | null;
  popularityScore: 1 | 2 | 3 | 4 | 5;
};

export type PlaceCreate = Omit<Place, 'id'>;
export type PlaceUpdate = PlaceCreate;

// Для обратной совместимости с компонентами, которым нужны строковые типы
export type PlaceTypeString = PlaceType['title']; // 'cathedral' | 'museum' | ...

// Маппинг id → строка типа
export const PLACE_TYPE_BY_ID: Record<number, PlaceTypeString> = {
  1: 'cathedral',
  2: 'church',
  3: 'museum',
  4: 'theatre',
  5: 'park',
  6: 'garden',
  7: 'palace',
  8: 'bridge',
  9: 'monument',
  10: 'embankment',
  11: 'viewpoint',
  12: 'street',
  13: 'cafe',
  14: 'restaurant',
  15: 'bar',
  16: 'other',
};

// Маппинг строки типа → id
export const PLACE_TYPE_TO_ID: Record<PlaceTypeString, number> = {
  cathedral: 1,
  church: 2,
  museum: 3,
  theatre: 4,
  park: 5,
  garden: 6,
  palace: 7,
  bridge: 8,
  monument: 9,
  embankment: 10,
  viewpoint: 11,
  street: 12,
  cafe: 13,
  restaurant: 14,
  bar: 15,
  other: 16,
};