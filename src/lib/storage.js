// Reemplazo de window.storage (API exclusiva del entorno de artifacts de
// Claude) por localStorage, que sí funciona en cualquier navegador y en
// un sitio desplegado de verdad (Vercel, Netlify, etc.).
//
// Mismo contrato que se usaba antes (set/list/get async), para no tener
// que tocar la lógica del componente más allá de la importación.
//
// Limitación conocida: localStorage es por navegador y por dispositivo,
// igual que la limitación que ya estaba documentada en el spec para
// window.storage (sección 10: "no hay sesión persistente entre
// dispositivos"). No cambia esa decisión de alcance v1, solo el mecanismo.

const storage = {
  async set(key, value) {
    try {
      localStorage.setItem(key, value);
      return true;
    } catch (e) {
      console.error("No se pudo guardar en localStorage:", e);
      return false;
    }
  },

  async list(prefix) {
    try {
      const keys = Object.keys(localStorage).filter((k) => k.startsWith(prefix));
      return { keys };
    } catch (e) {
      console.error("No se pudo listar localStorage:", e);
      return { keys: [] };
    }
  },

  async get(key) {
    try {
      const value = localStorage.getItem(key);
      return value === null ? null : { value };
    } catch (e) {
      console.error("No se pudo leer de localStorage:", e);
      return null;
    }
  },
};

export default storage;
