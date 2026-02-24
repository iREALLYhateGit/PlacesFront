import type { PlaceTypeString } from './place';

export const PLACE_TYPE_LABEL: Record<PlaceTypeString, string> = {
  cathedral: 'Собор',
  church: 'Храм',
  museum: 'Музей',
  theatre: 'Театр',
  park: 'Парк',
  garden: 'Сад',
  palace: 'Дворец',
  bridge: 'Мост',
  monument: 'Памятник',
  embankment: 'Набережная',
  viewpoint: 'Смотровая площадка',
  street: 'Улица / проспект',
  cafe: 'Кафе',
  restaurant: 'Ресторан',
  bar: 'Бар',
  other: 'Другое',
};

// Для сортировки или других нужд
export const PLACE_TYPE_OPTIONS: PlaceTypeString[] = Object.keys(PLACE_TYPE_LABEL) as PlaceTypeString[];