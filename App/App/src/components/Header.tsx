type Props = { onSearch: (value: string) => void };

export default function Header({ onSearch }: Props) {
  return (
    <header className="hdr" role="banner">
      <div className="brand" aria-label="TECNM Clima">☁️ TECNM Clima</div>
      <form
        className="search"
        role="search"
        aria-label="Buscar ciudad, estado o país"
        onSubmit={(e) => {
          e.preventDefault();
          const data = new FormData(e.currentTarget);
          const value = String(data.get("q") || "").trim();
          if (value) onSearch(value);
        }}
      >
        <input name="q" type="text" placeholder="Escribe una ciudad o país" aria-label="Caja de búsqueda" />
        <button type="submit">Buscar</button>
      </form>
    </header>
  );
}
