type Props = { onClick: () => void };

export function FabAdd({ onClick }: Props) {
  return (
    <button className="fab" type="button" onClick={onClick} aria-label="Добавить место">
      +
    </button>
  );
}