import type { Place } from '../types/place';
import { PLACE_TYPE_LABEL } from '../types/placeLabels';

type Props = {
  readonly place: Place;
  readonly onOpen: (place: Place) => void;
  readonly onDelete: (place: Place) => void;
};

export function PlaceCard({ place, onOpen, onDelete }: Props) {
  // Получаем строковое представление типа для отображения
  const typeString = typeof place.type === 'string' ? place.type : place.type.title;
  
  return (
    <div className="card">
      <button
        className="cardBtn"
        type="button"
        onClick={() => onOpen(place)}
        aria-label={`Открыть: ${place.title}`}
      />
      <button
        className="iconBtn"
        type="button"
        aria-label={`Удалить: ${place.title}`}
        onClick={(e) => {
          e.stopPropagation();
          onDelete(place);
        }}
      >
        🗑
      </button>

      <div className="cardTitle">{place.title}</div>
      <div className="cardMeta">
        <span className="pill">{PLACE_TYPE_LABEL[typeString]}</span>
        <span className="muted">★ {place.popularityScore}/5</span>
      </div>
    </div>
  );
}