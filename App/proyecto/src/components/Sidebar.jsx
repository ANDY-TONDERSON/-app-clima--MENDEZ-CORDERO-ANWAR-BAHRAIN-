// frontend/src/Sidebar.jsx
import React, { useState, useRef, useEffect } from "react";

const Sidebar = ({ onLocationChange }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [listOpen, setListOpen] = useState(false);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [errorSuggestions, setErrorSuggestions] = useState("");
  const listRef = useRef(null);
  const searchRef = useRef(null);

  // Cuando cambia el texto, lanzamos una búsqueda con debounce
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSuggestions([]);
      setListOpen(false);
      return;
    }

    setErrorSuggestions("");
    setLoadingSuggestions(true);

    const timer = setTimeout(async () => {
      try {
        const res = await fetch(
          `http://localhost:4000/api/search?query=${encodeURIComponent(
            searchQuery.trim()
          )}`
        );

        if (!res.ok) {
          throw new Error("Error al buscar lugares");
        }

        const data = await res.json();
        setSuggestions(data);
        setListOpen(true);
      } catch (err) {
        console.error(err);
        setErrorSuggestions("No se pudieron cargar sugerencias");
        setSuggestions([]);
      } finally {
        setLoadingSuggestions(false);
      }
    }, 300); // 300ms de debounce

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleSuggestionClick = (place) => {
    setSearchQuery(place.name);
    setListOpen(false);
    // Por ahora solo usamos el nombre; el backend vuelve a geocodificar
    onLocationChange(place.name);
  };

  const handleSearchClick = () => {
    if (searchQuery.trim()) {
      onLocationChange(searchQuery.trim());
      setListOpen(false);
    } else {
      setListOpen((prev) => !prev);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (searchQuery.trim()) {
        onLocationChange(searchQuery.trim());
        setListOpen(false);
      }
    } else if (e.key === "Escape") {
      setListOpen(false);
    }
  };

  // Cerrar lista si se hace click fuera
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        listRef.current &&
        !listRef.current.contains(e.target) &&
        searchRef.current &&
        !searchRef.current.contains(e.target)
      ) {
        setListOpen(false);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  return (
    <aside className="sidebar">
      <div className="side-header">
        <div className="brand">
          <div className="brand-logo">☁️</div>
          <div>TECNM - Clima</div>
        </div>

        <div className="search" role="search" ref={searchRef}>
          <input
            type="text"
            placeholder="Escribe ciudad"
            autoComplete="off"
            aria-label="Buscar ciudad, estado o país"
            value={searchQuery}
            onChange={handleSearchChange}
            onKeyDown={handleKeyDown}
          />
          <button onClick={handleSearchClick} aria-expanded={listOpen}>
            Buscar
          </button>
        </div>
      </div>

      {listOpen && (
        <div ref={listRef} className="suggestions" aria-live="polite">
          {loadingSuggestions && (
            <div className="city-item">Buscando lugares...</div>
          )}

          {errorSuggestions && (
            <div className="city-item" style={{ color: "red" }}>
              {errorSuggestions}
            </div>
          )}

          {!loadingSuggestions && !errorSuggestions && suggestions.length > 0 && (
            <>
              {suggestions.map((place, index) => (
                <div
                  key={`${place.name}-${index}`}
                  className="city-item"
                  onClick={() => handleSuggestionClick(place)}
                >
                  {place.name}
                </div>
              ))}
            </>
          )}

          {!loadingSuggestions &&
            !errorSuggestions &&
            suggestions.length === 0 &&
            searchQuery.trim() && (
              <div
                className="city-item add"
                onClick={() => {
                  onLocationChange(searchQuery.trim());
                  setListOpen(false);
                }}
              >
                Usar "{searchQuery.trim()}"
              </div>
            )}
        </div>
      )}
    </aside>
  );
};

export default Sidebar;
