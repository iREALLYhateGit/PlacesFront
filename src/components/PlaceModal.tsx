import { useEffect, useMemo, useRef, useState } from 'react';
import type { Place, PlaceCreate, PlaceTypeString } from '../types/place';
import { PLACE_TYPE_TO_ID } from '../types/place';
import { PLACE_TYPE_LABEL, PLACE_TYPE_OPTIONS } from '../types/placeLabels';

type Mode = 'add' | 'view' | 'edit';

type Props = {
  open: boolean;
  mode: Mode;
  place: Place | null;
  onClose: () => void;
  onCreate: (payload: PlaceCreate) => Promise<void>;
  onUpdate: (id: number, payload: PlaceCreate) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
};

// Вспомогательные функции для конвертации
function typeToString(type: Place['type']): PlaceTypeString {
  return typeof type === 'string' ? type : type.title;
}


function createTypeObject(typeString: PlaceTypeString): Place['type'] {
  return {
    id: PLACE_TYPE_TO_ID[typeString],
    title: typeString,
  };
}

function emptyForm(): PlaceCreate {
  return {
    title: '',
    type: createTypeObject('cathedral'), // объект по умолчанию
    address: '',
    description: '',
    architect: null,
    popularityScore: 3,
  };
}

export function PlaceModal({
  open,
  mode,
  place,
  onClose,
  onCreate,
  onUpdate,
  onDelete,
}: Props) {
  const dialogRef = useRef<HTMLDialogElement | null>(null);
  const titleId = useMemo(
    () => `dlg-title-${Math.random().toString(16).slice(2)}`,
    []
  );

  const [innerMode, setInnerMode] = useState<Mode>(mode);
  const [form, setForm] = useState<PlaceCreate>(emptyForm());
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Получаем строковое представление типа для UI
  const selectedTypeString = typeToString(form.type);

  function syncFormFromPlace(targetMode: Mode) {
    if (targetMode === 'add') {
      setForm(emptyForm());
      return;
    }
    if (place) {
      const { id: _id, ...rest } = place;
      setForm(rest);
    }
  }

  useEffect(() => {
    const dlg = dialogRef.current;
    if (!dlg) return;

    if (open && !dlg.open) dlg.showModal();
    if (!open && dlg.open) dlg.close();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    setInnerMode(mode);
    setBusy(false);
    setError(null);
    syncFormFromPlace(mode);
  }, [open, mode, place?.id]);

  function setField<K extends keyof PlaceCreate>(key: K, value: PlaceCreate[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  // Специальный сеттер для type, работающий со строкой
  function setType(typeString: PlaceTypeString) {
    setField('type', createTypeObject(typeString));
  }

  async function handleSave() {
    setError(null);
    setBusy(true);
    try {
      if (innerMode === 'add') {
        await onCreate(form);
      } else if (place) {
        await onUpdate(place.id, form);
      }
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Ошибка');
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete() {
    if (!place) return;
    const ok = confirm(`Удалить "${place.title}"?`);
    if (!ok) return;

    setError(null);
    setBusy(true);
    try {
      await onDelete(place.id);
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Ошибка');
    } finally {
      setBusy(false);
    }
  }

  function handleCancelEdit() {
    syncFormFromPlace('view');
    setInnerMode('view');
    setError(null);
  }

  const readOnly = innerMode === 'view';

  return (
    <dialog
      ref={dialogRef}
      className="dialog"
      aria-labelledby={titleId}
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      onClose={onClose}
    >
      <div className="dialogHeader">
        <h2 id={titleId} className="dialogTitle">
          {innerMode === 'add' ? 'Добавить место' : place?.title ?? 'Место'}
        </h2>

        <button
          className="iconBtn"
          type="button"
          onClick={onClose}
          aria-label="Закрыть"
          disabled={busy}
        >
          ✕
        </button>
      </div>

      {error && <div className="errorBox">{error}</div>}

      <form className="form" method="dialog" onSubmit={(e) => e.preventDefault()}>
        <label className="field">
          <span className="label">Название</span>
          <input
            value={form.title}
            onChange={(e) => setField('title', e.target.value)}
            disabled={busy || readOnly}
          />
        </label>

        <label className="field">
          <span className="label">Тип</span>
          <select
            value={selectedTypeString}
            onChange={(e) => setType(e.target.value as PlaceTypeString)}
            disabled={busy || readOnly}
          >
            {PLACE_TYPE_OPTIONS.map((t) => (
              <option key={t} value={t}>
                {PLACE_TYPE_LABEL[t]}
              </option>
            ))}
          </select>
        </label>

        <label className="field">
          <span className="label">Адрес</span>
          <input
            value={form.address}
            onChange={(e) => setField('address', e.target.value)}
            disabled={busy || readOnly}
          />
        </label>

        <label className="field">
          <span className="label">Архитектор</span>
          <input
            value={form.architect ?? ''}
            onChange={(e) => setField('architect', e.target.value.trim() ? e.target.value : null)}
            disabled={busy || readOnly}
          />
        </label>

        <label className="field">
          <span className="label">Известность</span>

          <div className="scoreGroup" role="radiogroup" aria-label="Известность от 1 до 5">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                className={form.popularityScore === n ? 'scoreBtn scoreBtnActive' : 'scoreBtn'}
                onClick={() => setField('popularityScore', n as 1 | 2 | 3 | 4 | 5)}
                disabled={busy || readOnly}
                aria-pressed={form.popularityScore === n}
              >
                {n}
              </button>
            ))}
          </div>
        </label>

        <label className="field">
          <span className="label">Описание</span>
          <textarea
            value={form.description}
            onChange={(e) => setField('description', e.target.value)}
            disabled={busy || readOnly}
            rows={6}
          />
        </label>
      </form>

      <div className="dialogFooter">
        {innerMode !== 'add' && (
          <>
            {innerMode === 'view' ? (
              <button
                className="btn"
                type="button"
                onClick={() => {
                  setInnerMode('edit');
                  setError(null);
                }}
                disabled={busy}
              >
                Редактировать
              </button>
            ) : (
              <button
                className="btnGhost"
                type="button"
                onClick={handleCancelEdit}
                disabled={busy}
              >
                Отмена
              </button>
            )}

            <button
              className="btnDanger"
              type="button"
              onClick={handleDelete}
              disabled={busy}
            >
              Удалить
            </button>
          </>
        )}

        {innerMode === 'add' && (
          <button className="btnGhost" type="button" onClick={onClose} disabled={busy}>
            Отмена
          </button>
        )}

        {(innerMode === 'add' || innerMode === 'edit') && (
          <button className="btnPrimary" type="button" onClick={handleSave} disabled={busy}>
            {busy ? 'Сохранение...' : 'Сохранить'}
          </button>
        )}
      </div>
    </dialog>
  );
}