interface Props {
  celsius: number | null;
}

export function TempGauge({ celsius }: Props) {
  if (celsius === null) return <span className="text-gray-500">N/A</span>;
  const cls =
    celsius < 40
      ? "text-green-400"
      : celsius <= 55
        ? "text-yellow-400"
        : "text-red-400";
  return <span className={cls}>{celsius.toFixed(1)}°C</span>;
}
