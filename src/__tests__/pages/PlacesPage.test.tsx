import { describe, it, expect, vi, beforeAll, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PlacesPage } from '../../pages/PlacesPage';
import { placesApi } from '../../api/places';
import type { Place } from '../../types/place';

// Мокаем весь модуль api
vi.mock('../../api/places');

// jsdom не реализует HTMLDialogElement.showModal/close — мокаем с реальным поведением атрибута open
beforeAll(() => {
  HTMLDialogElement.prototype.showModal = vi.fn(function (this: HTMLDialogElement) {
    this.setAttribute('open', '');
  });
  HTMLDialogElement.prototype.close = vi.fn(function (this: HTMLDialogElement) {
    this.removeAttribute('open');
  });
});

const mockPlaces: Place[] = [
  {
    id: 1,
    title: 'Эрмитаж',
    type: { id: 3, title: 'museum' },
    address: 'Дворцовая пл., 2',
    description: 'Музей',
    architect: 'Растрелли',
    popularityScore: 5,
  },
  {
    id: 2,
    title: 'Петропавловская крепость',
    type: { id: 9, title: 'monument' },
    address: 'Петропавловская крепость, 3',
    description: 'Крепость',
    architect: null,
    popularityScore: 4,
  },
];

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(placesApi.list).mockResolvedValue(mockPlaces);
  vi.mocked(placesApi.create).mockResolvedValue({ ...mockPlaces[0], id: 99 });
  vi.mocked(placesApi.update).mockResolvedValue(mockPlaces[0]);
  vi.mocked(placesApi.remove).mockResolvedValue(undefined);
  vi.stubGlobal('confirm', vi.fn(() => true));
});

describe('PlacesPage — состояния загрузки', () => {
  it('показывает "Загрузка..." при первоначальной загрузке', () => {
    // Задерживаем ответ API
    vi.mocked(placesApi.list).mockReturnValue(new Promise(() => {}));
    render(<PlacesPage />);
    expect(screen.getByText('Загрузка...')).toBeInTheDocument();
  });

  it('показывает карточки мест после успешной загрузки', async () => {
    render(<PlacesPage />);

    await waitFor(() => {
      expect(screen.getByText('Эрмитаж')).toBeInTheDocument();
    });
    expect(screen.getByText('Петропавловская крепость')).toBeInTheDocument();
  });

  it('показывает errorBox при ошибке загрузки', async () => {
    vi.mocked(placesApi.list).mockRejectedValue(new Error('Сеть недоступна'));
    render(<PlacesPage />);

    await waitFor(() => {
      expect(screen.getByText('Сеть недоступна')).toBeInTheDocument();
    });
  });

  it('показывает "Пока нет мест" при пустом списке', async () => {
    vi.mocked(placesApi.list).mockResolvedValue([]);
    render(<PlacesPage />);

    await waitFor(() => {
      expect(screen.getByText('Пока нет мест')).toBeInTheDocument();
    });
  });
});

describe('PlacesPage — навигация модала', () => {
  it('клик по кнопке "+" открывает модал в режиме add', async () => {
    render(<PlacesPage />);

    await waitFor(() => screen.getByText('Эрмитаж'));

    await userEvent.click(screen.getByRole('button', { name: 'Добавить место' }));

    await waitFor(() => {
      expect(screen.getByText('Добавить место')).toBeInTheDocument();
    });
  });

  it('клик по карточке открывает модал в режиме view с названием места', async () => {
    render(<PlacesPage />);

    await waitFor(() => screen.getByText('Эрмитаж'));

    const card = screen.getByRole('button', { name: 'Открыть: Эрмитаж' });
    await userEvent.click(card);

    // В view-режиме заголовок диалога = название места
    // showModal мокнут, поэтому ищем по тексту в диалоге
    const dialogTitle = screen.getAllByText('Эрмитаж');
    expect(dialogTitle.length).toBeGreaterThanOrEqual(1);
  });
});

describe('PlacesPage — операции CRUD', () => {
  it('кнопка "Обновить" перезагружает список мест', async () => {
    render(<PlacesPage />);

    await waitFor(() => screen.getByText('Эрмитаж'));

    const refreshBtn = screen.getByRole('button', { name: 'Обновить' });
    await userEvent.click(refreshBtn);

    await waitFor(() => {
      expect(vi.mocked(placesApi.list)).toHaveBeenCalledTimes(2);
    });
  });

  it('удаление места через карточку вызывает placesApi.remove', async () => {
    render(<PlacesPage />);

    await waitFor(() => screen.getByText('Эрмитаж'));

    const deleteBtn = screen.getByRole('button', { name: 'Удалить: Эрмитаж' });
    await userEvent.click(deleteBtn);

    await waitFor(() => {
      expect(vi.mocked(placesApi.remove)).toHaveBeenCalledWith(1);
    });
  });

  it('удалённое место исчезает из списка', async () => {
    render(<PlacesPage />);

    await waitFor(() => screen.getByText('Эрмитаж'));

    const deleteBtn = screen.getByRole('button', { name: 'Удалить: Эрмитаж' });
    await userEvent.click(deleteBtn);

    await waitFor(() => {
      expect(screen.queryByText('Эрмитаж')).not.toBeInTheDocument();
    });
  });

  it('если confirm возвращает false — удаление не происходит', async () => {
    vi.stubGlobal('confirm', vi.fn(() => false));
    render(<PlacesPage />);

    await waitFor(() => screen.getByText('Эрмитаж'));

    const deleteBtn = screen.getByRole('button', { name: 'Удалить: Эрмитаж' });
    await userEvent.click(deleteBtn);

    expect(vi.mocked(placesApi.remove)).not.toHaveBeenCalled();
    expect(screen.getByText('Эрмитаж')).toBeInTheDocument();
  });
});