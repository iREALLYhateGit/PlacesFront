import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PlaceCard } from '../../components/PlaceCard';
import type { Place } from '../../types/place';

const mockPlace: Place = {
  id: 1,
  title: 'Эрмитаж',
  type: { id: 3, title: 'museum' },
  address: 'Дворцовая пл., 2',
  description: 'Крупнейший художественный музей',
  architect: 'Растрелли',
  popularityScore: 5,
};

describe('PlaceCard — отображение', () => {
  it('отображает название места', () => {
    render(<PlaceCard place={mockPlace} onOpen={vi.fn()} onDelete={vi.fn()} />);
    expect(screen.getByText('Эрмитаж')).toBeInTheDocument();
  });

  it('отображает русский лейбл типа через pill', () => {
    render(<PlaceCard place={mockPlace} onOpen={vi.fn()} onDelete={vi.fn()} />);
    expect(screen.getByText('Музей')).toBeInTheDocument();
  });

  it('отображает рейтинг популярности', () => {
    render(<PlaceCard place={mockPlace} onOpen={vi.fn()} onDelete={vi.fn()} />);
    expect(screen.getByText('★ 5/5')).toBeInTheDocument();
  });

  it('корректно обрабатывает тип как строку (обратная совместимость)', () => {
    const placeWithStringType = {
      ...mockPlace,
      type: 'museum' as unknown as Place['type'],
    };
    render(<PlaceCard place={placeWithStringType} onOpen={vi.fn()} onDelete={vi.fn()} />);
    expect(screen.getByText('Музей')).toBeInTheDocument();
  });
});

describe('PlaceCard — взаимодействие', () => {
  it('вызывает onOpen при клике на карточку', async () => {
    const onOpen = vi.fn();
    render(<PlaceCard place={mockPlace} onOpen={onOpen} onDelete={vi.fn()} />);

    const card = screen.getByRole('button', { name: `Открыть: ${mockPlace.title}` });
    await userEvent.click(card);

    expect(onOpen).toHaveBeenCalledWith(mockPlace);
  });

  it('вызывает onOpen при нажатии Enter на карточке', async () => {
    const onOpen = vi.fn();
    render(<PlaceCard place={mockPlace} onOpen={onOpen} onDelete={vi.fn()} />);

    const card = screen.getByRole('button', { name: `Открыть: ${mockPlace.title}` });
    card.focus();
    await userEvent.keyboard('{Enter}');

    expect(onOpen).toHaveBeenCalledWith(mockPlace);
  });

  it('вызывает onOpen при нажатии Space на карточке', async () => {
    const onOpen = vi.fn();
    render(<PlaceCard place={mockPlace} onOpen={onOpen} onDelete={vi.fn()} />);

    const card = screen.getByRole('button', { name: `Открыть: ${mockPlace.title}` });
    card.focus();
    await userEvent.keyboard(' ');

    expect(onOpen).toHaveBeenCalledWith(mockPlace);
  });

  it('вызывает onDelete при клике на кнопку удаления и НЕ вызывает onOpen', async () => {
    const onOpen = vi.fn();
    const onDelete = vi.fn();
    render(<PlaceCard place={mockPlace} onOpen={onOpen} onDelete={onDelete} />);

    const deleteBtn = screen.getByRole('button', { name: `Удалить: ${mockPlace.title}` });
    await userEvent.click(deleteBtn);

    expect(onDelete).toHaveBeenCalledWith(mockPlace);
    expect(onOpen).not.toHaveBeenCalled();
  });
});