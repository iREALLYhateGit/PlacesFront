import { useEffect, useState } from 'react';
import { placesApi } from '../api/places';
import type { Place, PlaceCreate } from '../types/place';
import { FabAdd } from '../components/FabAdd';
import { PlaceCard } from '../components/PlaceCard';
import { PlaceModal } from '../components/PlaceModal';

type ModalState =
  | { open: false }
  | { open: true; mode: 'add'; place: null }
  | { open: true; mode: 'view' | 'edit'; place: Place };

export function PlacesPage() {
  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [modal, setModal] = useState<ModalState>({ open: false });

  async function load() {
    setError(null);
    setLoading(true);
    try {
      const data = await placesApi.list();
      setPlaces(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Ошибка загрузки');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  // const modalProps = useMemo(() => {
  //   if (!modal.open) return null;
  //   return modal;
  // }, [modal]);

  async function createPlace(payload: PlaceCreate) {
    const created = await placesApi.create(payload);
    setPlaces((prev) => [...prev, created]);
  }

  async function updatePlace(id: number, payload: PlaceCreate) {
    const updated = await placesApi.update(id, payload);
    setPlaces((prev) => prev.map((p) => (p.id === id ? updated : p)));
  }

  async function deletePlace(id: number) {
    await placesApi.remove(id);
    setPlaces((prev) => prev.filter((p) => p.id !== id));
  }

  return (
    <div className="page">
      <header className="topbar">
        <h1 className="h1">Красивые места Санкт‑Петербурга</h1>
        <button className="btn" type="button" onClick={() => void load()} disabled={loading}>
          Обновить
        </button>
      </header>

      {error && <div className="errorBox">{error}</div>}

      {loading ? (
        <div className="muted">Загрузка...</div>
      ) : places.length === 0 ? (
        <div className="empty">
          <div className="emptyTitle">Пока нет мест</div>
          <div className="muted">Нажми “+”, чтобы добавить первую карточку.</div>
        </div>
      ) : (
        <section className="grid">
          {places.map((p) => (
            <PlaceCard
              key={p.id}
              place={p}
              onOpen={(place) => setModal({ open: true, mode: 'view', place })}
              onDelete={(place) => {
                const ok = confirm(`Удалить "${place.title}"?`);
                if (!ok) return;
                void deletePlace(place.id);
              }}
            />
          ))}
        </section>
      )}

      <FabAdd onClick={() => setModal({ open: true, mode: 'add', place: null })} />

      <PlaceModal
        open={modal.open}
        mode={modal.open ? modal.mode : 'view'}
        place={modal.open ? modal.place : null}
        onClose={() => setModal({ open: false })}
        onCreate={createPlace}
        onUpdate={updatePlace}
        onDelete={deletePlace}
      />
    </div>
  );
}