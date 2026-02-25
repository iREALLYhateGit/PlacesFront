import { describe, it, expect, vi, beforeAll } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PlaceModal } from '../../components/PlaceModal';
import type { Place, PlaceCreate } from '../../types/place';

// jsdom не реализует HTMLDialogElement.showModal/close — мокаем с реальным поведением атрибута open
beforeAll(() => {
  HTMLDialogElement.prototype.showModal = vi.fn(function (this: HTMLDialogElement) {
    this.setAttribute('open', '');
  });
  HTMLDialogElement.prototype.close = vi.fn(function (this: HTMLDialogElement) {
    this.removeAttribute('open');
  });
});

const mockPlace: Place = {
  id: 42,
  title: 'Эрмитаж',
  type: { id: 3, title: 'museum' },
  address: 'Дворцовая пл., 2',
  description: 'Крупнейший художественный музей',
  architect: 'Растрелли',
  popularityScore: 5,
};

const defaultProps = {
  open: true,
  onClose: vi.fn(),
  onCreate: vi.fn().mockResolvedValue(undefined),
  onUpdate: vi.fn().mockResolvedValue(undefined),
  onDelete: vi.fn().mockResolvedValue(undefined),
};

describe('PlaceModal — режим add', () => {
  it('показывает заголовок "Добавить место"', () => {
    render(<PlaceModal {...defaultProps} mode="add" place={null} />);
    expect(screen.getByText('Добавить место')).toBeInTheDocument();
  });

  it('показывает кнопку "Сохранить"', () => {
    render(<PlaceModal {...defaultProps} mode="add" place={null} />);
    expect(screen.getByRole('button', { name: 'Сохранить' })).toBeInTheDocument();
  });

  it('показывает кнопку "Отмена"', () => {
    render(<PlaceModal {...defaultProps} mode="add" place={null} />);
    expect(screen.getByRole('button', { name: 'Отмена' })).toBeInTheDocument();
  });

  it('НЕ показывает кнопки "Редактировать" и "Удалить"', () => {
    render(<PlaceModal {...defaultProps} mode="add" place={null} />);
    expect(screen.queryByRole('button', { name: 'Редактировать' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Удалить' })).not.toBeInTheDocument();
  });

  it('поля формы активны (не disabled)', () => {
    render(<PlaceModal {...defaultProps} mode="add" place={null} />);
    // Ищем поле "Название" по его label
    const titleInput = screen.getByRole('textbox', { name: 'Название' });
    expect(titleInput).not.toBeDisabled();
  });

  it('вызывает onCreate при нажатии "Сохранить"', async () => {
    const onCreate = vi.fn().mockResolvedValue(undefined);
    render(<PlaceModal {...defaultProps} onCreate={onCreate} mode="add" place={null} />);

    await userEvent.click(screen.getByRole('button', { name: 'Сохранить' }));

    await waitFor(() => {
      expect(onCreate).toHaveBeenCalledOnce();
    });
  });

  it('показывает errorBox при ошибке onCreate', async () => {
    const onCreate = vi.fn().mockRejectedValue(new Error('Сервер недоступен'));
    render(<PlaceModal {...defaultProps} onCreate={onCreate} mode="add" place={null} />);

    await userEvent.click(screen.getByRole('button', { name: 'Сохранить' }));

    await waitFor(() => {
      expect(screen.getByText('Сервер недоступен')).toBeInTheDocument();
    });
  });

  it('показывает "Сохранение..." во время запроса', async () => {
    let resolveSave!: () => void;
    const onCreate = vi.fn().mockReturnValue(
      new Promise<void>((resolve) => {
        resolveSave = resolve;
      })
    );
    render(<PlaceModal {...defaultProps} onCreate={onCreate} mode="add" place={null} />);

    await userEvent.click(screen.getByRole('button', { name: 'Сохранить' }));

    expect(screen.getByRole('button', { name: 'Сохранение...' })).toBeDisabled();

    resolveSave();

    await waitFor(() => { expect(onCreate).toHaveBeenCalled(); });
  });
});

describe('PlaceModal — режим view', () => {
  it('показывает название места как заголовок', () => {
    render(<PlaceModal {...defaultProps} mode="view" place={mockPlace} />);
    expect(screen.getByText('Эрмитаж')).toBeInTheDocument();
  });

  it('поля формы disabled (readOnly)', () => {
    render(<PlaceModal {...defaultProps} mode="view" place={mockPlace} />);
    const titleInput = screen.getByDisplayValue('Эрмитаж');
    expect(titleInput).toBeDisabled();
  });

  it('показывает кнопки "Редактировать" и "Удалить"', () => {
    render(<PlaceModal {...defaultProps} mode="view" place={mockPlace} />);
    expect(screen.getByRole('button', { name: 'Редактировать' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Удалить' })).toBeInTheDocument();
  });

  it('НЕ показывает кнопку "Сохранить"', () => {
    render(<PlaceModal {...defaultProps} mode="view" place={mockPlace} />);
    expect(screen.queryByRole('button', { name: /Сохранить/i })).not.toBeInTheDocument();
  });

  it('клик "Редактировать" переводит в режим edit', async () => {
    render(<PlaceModal {...defaultProps} mode="view" place={mockPlace} />);

    await userEvent.click(screen.getByRole('button', { name: 'Редактировать' }));

    // В режиме edit поле должно быть активным
    const titleInput = screen.getByDisplayValue('Эрмитаж');
    expect(titleInput).not.toBeDisabled();
    expect(screen.getByRole('button', { name: 'Сохранить' })).toBeInTheDocument();
  });
});

describe('PlaceModal — режим edit', () => {
  it('поля формы активны', () => {
    render(<PlaceModal {...defaultProps} mode="edit" place={mockPlace} />);
    const titleInput = screen.getByDisplayValue('Эрмитаж');
    expect(titleInput).not.toBeDisabled();
  });

  it('показывает кнопки "Сохранить" и "Отмена"', () => {
    render(<PlaceModal {...defaultProps} mode="edit" place={mockPlace} />);
    expect(screen.getByRole('button', { name: 'Сохранить' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Отмена' })).toBeInTheDocument();
  });

  it('вызывает onUpdate при нажатии "Сохранить"', async () => {
    const onUpdate = vi.fn().mockResolvedValue(undefined);
    render(<PlaceModal {...defaultProps} onUpdate={onUpdate} mode="edit" place={mockPlace} />);

    await userEvent.click(screen.getByRole('button', { name: 'Сохранить' }));

    await waitFor(() => {
      expect(onUpdate).toHaveBeenCalledWith(mockPlace.id, expect.any(Object));
    });
  });

  it('клик "Отмена" возвращает в режим view', async () => {
    render(<PlaceModal {...defaultProps} mode="edit" place={mockPlace} />);

    await userEvent.click(screen.getByRole('button', { name: 'Отмена' }));

    // В режиме view поле должно быть disabled
    const titleInput = screen.getByDisplayValue('Эрмитаж');
    expect(titleInput).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Редактировать' })).toBeInTheDocument();
  });
});

describe('PlaceModal — удаление', () => {
  it('вызывает onDelete при подтверждении', async () => {
    vi.stubGlobal('confirm', () => true);
    const onDelete = vi.fn().mockResolvedValue(undefined);
    render(<PlaceModal {...defaultProps} onDelete={onDelete} mode="view" place={mockPlace} />);

    await userEvent.click(screen.getByRole('button', { name: 'Удалить' }));

    await waitFor(() => {
      expect(onDelete).toHaveBeenCalledWith(mockPlace.id);
    });

    vi.unstubAllGlobals();
  });

  it('НЕ вызывает onDelete при отмене confirm', async () => {
    vi.stubGlobal('confirm', () => false);
    const onDelete = vi.fn();
    render(<PlaceModal {...defaultProps} onDelete={onDelete} mode="view" place={mockPlace} />);

    await userEvent.click(screen.getByRole('button', { name: 'Удалить' }));

    expect(onDelete).not.toHaveBeenCalled();

    vi.unstubAllGlobals();
  });
});

describe('PlaceModal — закрытие', () => {
  it('вызывает onClose при клике на кнопку "✕"', async () => {
    const onClose = vi.fn();
    render(<PlaceModal {...defaultProps} onClose={onClose} mode="add" place={null} />);

    await userEvent.click(screen.getByRole('button', { name: 'Закрыть' }));

    expect(onClose).toHaveBeenCalledOnce();
  });
});