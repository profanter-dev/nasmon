interface Props {
  celsius: number | null;
}

export function TempGauge({ celsius }: Props) {
  if (celsius === null)
    return <span className="text-xs text-slate-600 tnum">— °C</span>;

  const { text, dot } =
    celsius < 40
      ? { text: "text-emerald-300", dot: "bg-emerald-400" }
      : celsius <= 55
        ? { text: "text-amber-300", dot: "bg-amber-400" }
        : { text: "text-red-300", dot: "bg-red-400" };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full bg-white/5 px-2 py-0.5 text-xs font-semibold tnum ${text}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${dot}`} />
      {celsius.toFixed(1)}°C
    </span>
  );
}
