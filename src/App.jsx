import React, { useState, useEffect, useRef } from "react";
import {
  Plane, MapPin, Wallet, Users, ShieldAlert, UtensilsCrossed,
  Car, FileText, Download, History, ChevronRight, ChevronLeft, PawPrint,
  CloudSun, Baby, CheckCircle2, XCircle, Ticket
} from "lucide-react";
import storage from "./lib/storage.js";

/* ---------------------------------------------------------------------- */
/* Datos de destino investigados por Claude vía búsqueda web.             */
/* Fecha de la investigación: 2026-07-13. No es una API en vivo — para    */
/* actualizar estos datos hay que repetir la búsqueda (spec, sección 7,   */
/* adaptado: el sandbox de ejecución no tiene salida a internet).         */
/* Campos marcados "(sin verificar hoy)" ya estaban en el catálogo y no   */
/* formaron parte de esta ronda de investigación.                        */
/* ---------------------------------------------------------------------- */

const DESTINOS = {
  cartagena: {
    nombre: "Cartagena", pais: "Colombia", tipo: "nacional",
    categoria: "Playa y centro histórico",
    clima: "33°C/26°C (máx/mín) en julio. El 'veranillo de San Juan' reduce las lluvias en la segunda mitad del mes; se esperan entre 8 y 15 días de lluvia.",
    riesgoSeguridad: "Colombia está en Nivel 3 ('Reconsiderar viaje') según el Departamento de Estado de EE. UU. desde abril de 2026, por crimen y disturbios a nivel nacional. En las zonas turísticas de Cartagena (Centro Histórico, Bocagrande) hay presencia policial constante; el hurto menor es el incidente más común contra turistas (~78% de los casos reportados).",
    eventos: "Festival de Cine de Cartagena (marzo) satura hoteles del centro. (sin verificar hoy)",
    petFriendly: true,
    documentacion: "Solo documento de identidad nacional.",
    transporte: "1h 10m en avión desde Bogotá · ~19h por carretera.",
    agencias: ["Localiza Cartagena", "National Rent A Car Cartagena"],
    alojamiento: { bajo: "Hostal Media Luna — Getsemaní", medio: "Hotel Monterrey — Centro Histórico", alto: "Sofitel Legend Santa Clara" },
    comidaPresupuesto: "$80.000–120.000 COP/día",
    comidaLugares: ["La Cevichería — Centro Histórico", "Carmen Restaurante — San Diego"],
    imagen: { url: "https://commons.wikimedia.org/wiki/Special:FilePath/Cartagena,_Colombia_-_Laslovarga_(83).jpg?width=800", alt: "Vista de Cartagena, Colombia", fuente: "Wikimedia Commons" },
  },
  sanandres: {
    nombre: "San Andrés", pais: "Colombia", tipo: "nacional",
    categoria: "Isla y playa",
    clima: "Cálido tropical, 27°C–30°C. Mejor época dic–abr (cielos despejados, mar tranquilo). Temporada de huracanes jun–nov, con pico en sep–oct.",
    riesgoSeguridad: "Bajo estructural en la isla, dentro del mismo contexto de advisory Nivel 3 de EE. UU. para Colombia (abril 2026). Riesgo climático estacional jun–nov: para la temporada se esperan entre 13 y 19 tormentas tropicales, de las cuales 6 a 10 podrían convertirse en huracanes.",
    eventos: "Ninguno relevante fuera de temporada ciclónica. (sin verificar hoy)",
    petFriendly: false,
    documentacion: "Tarjeta de turismo obligatoria al ingresar a la isla (aplica aunque sea viaje nacional).",
    transporte: "2h 20m en avión desde Bogotá (único medio, es isla).",
    agencias: ["Sunrise Rent a Car San Andrés", "Toñito Tours (motos y carritos de golf)"],
    alojamiento: { bajo: "Hostal Sunset Hammock", medio: "Hotel Casa Harb", alto: "Decameron San Luis" },
    comidaPresupuesto: "$100.000–150.000 COP/día",
    comidaLugares: ["Fisherman's Place", "La Regatta"],
    riesgoEstacional: { meses: [6, 7, 8, 9, 10, 11], mensaje: "Tus fechas caen en temporada de huracanes del Caribe (junio–noviembre, pico en septiembre–octubre). Se recomienda mover el viaje o elegir otro destino." },
    imagen: { url: "https://commons.wikimedia.org/wiki/Special:FilePath/Isla_acuario._San_Andres_Islas_Colombia.JPG?width=800", alt: "Isla del Acuario, San Andrés, Colombia", fuente: "Wikimedia Commons" },
  },
  cusco: {
    nombre: "Cusco", pais: "Perú", tipo: "internacional",
    categoria: "Cultural y aventura (Machu Picchu)",
    clima: "Muy frío en julio (temporada seca): días de 20°C–21°C, noches bajo cero (promedio 1°C, heladas frecuentes). Solo ~4 días de lluvia en el mes. Se recomienda ropa de abrigo, guantes y bufanda. Riesgo de soroche por la altura (3.400 msnm).",
    riesgoSeguridad: "Perú está en Nivel 2 ('Ejercer cautela aumentada') según el Departamento de Estado de EE. UU. desde marzo de 2026. El hurto menor es el principal riesgo: ~3–4 denuncias diarias de carterismo cerca del Mercado San Pedro y las terminales de transporte. Indecopi recomienda no viajar sin escolta más allá de Pisac y Ollantaytambo, y verificar la formalidad de los operadores turísticos antes de pagar.",
    eventos: "El Inti Raymi 2026 se celebró el 24 de junio en Sacsayhuamán — para la fecha de esta consulta (13 de julio de 2026) ya pasó; la próxima edición sería en junio de 2027. Durante esa semana se satura el hospedaje y el transporte a Machu Picchu.",
    petFriendly: false,
    documentacion: "Pasaporte vigente mínimo 6 meses. Sin visa para colombianos en estadías <90 días. Seguro de viaje internacional recomendado.",
    transporte: "4h–5h en avión desde Bogotá, con escala en Lima (único medio, es internacional).",
    agencias: ["Peru Rent a Car Cusco", "InkaRent"],
    alojamiento: { bajo: "Pariwana Hostel Cusco", medio: "Casa Andina Standard Cusco", alto: "Belmond Hotel Monasterio" },
    comidaPresupuesto: "60–90 PEN/día",
    comidaLugares: ["Chicha por Gastón Acurio", "Mercado San Pedro (comida local)"],
    imagen: { url: "https://commons.wikimedia.org/wiki/Special:FilePath/Machu_Picchu,_Peru.jpg?width=800", alt: "Machu Picchu, Cusco, Perú", fuente: "Wikimedia Commons" },
  },
  valle: {
    nombre: "Valle Sagrado (Urubamba)", pais: "Perú", tipo: "internacional",
    categoria: "Alternativa a Cusco ciudad — cultural y naturaleza",
    clima: "Templado, 2.870 msnm (menor altura que Cusco, ideal para aclimatarse). Días de 21°C–23°C, noches de 4°C–8°C con heladas frecuentes en temporada seca (abr–oct). Menor riesgo de soroche que en Cusco ciudad.",
    riesgoSeguridad: "Mismo contexto de Perú en Nivel 2 ('Ejercer cautela aumentada', marzo 2026). Zona más rural que Cusco ciudad, con menos hurtos reportados.",
    eventos: "Mismo Inti Raymi regional en junio — ya pasó para la fecha de esta consulta (ver nota en Cusco).",
    petFriendly: false,
    documentacion: "Igual que Cusco: pasaporte vigente mínimo 6 meses, sin visa para colombianos <90 días.",
    transporte: "4h–5h a Cusco + 1h por carretera al Valle.",
    agencias: ["Peru Rent a Car Cusco", "InkaRent"],
    alojamiento: { bajo: "Hospedaje Munay Urubamba", medio: "Casa Andina Standard Valle Sagrado", alto: "Aranwa Sacred Valley" },
    comidaPresupuesto: "50–80 PEN/día",
    comidaLugares: ["Huacatay Restaurant — Urubamba", "El Huacatay Cocina Orgánica"],
    imagen: { url: "https://commons.wikimedia.org/wiki/Special:FilePath/Urubamba_-_Valle_Sagrado_3.JPG?width=800", alt: "Valle Sagrado, Urubamba, Perú", fuente: "Wikimedia Commons" },
  },
};

/* Tasa de cambio fija aproximada — referencial, no transaccional.        */
/* Fuente: búsqueda web, 11 de julio de 2026 (1 PEN ≈ 975 COP).           */
const TASA_COP_A_PEN = { pais: "Perú", tasa: 1 / 975, fechaReferencia: "11 jul 2026" };

function convertirCOPaPEN(presupuestoCOP) {
  const n = parseInt(String(presupuestoCOP).replace(/[^\d]/g, ""), 10) || 0;
  const pen = Math.round(n * TASA_COP_A_PEN.tasa);
  return pen.toLocaleString("es-PE");
}

const NOMBRES_CONOCIDOS = {
  cartagena: ["cartagena"],
  sanandres: ["san andres", "san andrés", "sanandres"],
  cusco: ["cusco", "machu picchu", "machupicchu"],
  valle: ["valle sagrado", "urubamba"],
};

// Lista mínima de demo — en producción reemplazar por una API de moderación real (ver spec, sección 4).
const TERMINOS_CORTE = ["servicio sexual", "servicios sexuales", "prostitu", "turismo sexual", "acompañante sexual"];

function chequeaContenido(texto) {
  if (!texto) return false;
  const t = texto.toLowerCase();
  return TERMINOS_CORTE.some((term) => t.includes(term));
}

function buscaDestinoConocido(texto) {
  if (!texto) return null;
  const t = texto.toLowerCase().trim();
  for (const [id, nombres] of Object.entries(NOMBRES_CONOCIDOS)) {
    if (nombres.some((n) => t.includes(n))) return id;
  }
  return null;
}

function elegirDestinos(form) {
  if (form.tipoViaje === "internacional") {
    return { primary: "cusco", secondary: "valle", secondaryNota: "Misma línea de viaje, zona más tranquila del Valle Sagrado en vez de Cusco ciudad." };
  }
  if (form.mascota) {
    return { primary: "cartagena", secondary: "sanandres", secondaryNota: "Alternativa isla — confirmar restricciones de mascotas con la aerolínea." };
  }
  if (form.conQuien === "pareja") {
    return { primary: "sanandres", secondary: "cartagena", secondaryNota: "Alternativa continental con más opciones culturales." };
  }
  return { primary: "cartagena", secondary: "sanandres", secondaryNota: "Alternativa isla, ideal si buscan playa remota." };
}

function chequeaRiesgoEstacional(destId, fechaInicio) {
  const d = DESTINOS[destId];
  if (!d.riesgoEstacional || !fechaInicio) return null;
  const mes = new Date(fechaInicio + "T00:00:00").getMonth() + 1;
  if (d.riesgoEstacional.meses.includes(mes)) return d.riesgoEstacional.mensaje;
  return null;
}

function tierPresupuesto(presupuesto) {
  const n = parseInt(String(presupuesto).replace(/[^\d]/g, ""), 10) || 0;
  if (n < 1500000) return "bajo";
  if (n < 4000000) return "medio";
  return "alto";
}

/* ------------------------------- UI atoms ------------------------------ */

const mono = { fontFamily: "'Space Mono', monospace" };
const display = { fontFamily: "'Fraunces', serif" };

function Choice({ label, sub, selected, onClick, Icon }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={`flex items-center gap-3 w-full text-left px-5 py-4 rounded-2xl border transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0A0A14] ${
        selected ? "border-amber-400 bg-amber-400/10" : "border-[#666690] bg-[#131320] hover:border-[#8484B8]"
      }`}
    >
      {Icon && <Icon size={20} aria-hidden="true" className={selected ? "text-amber-400" : "text-[#9797AC]"} />}
      <div>
        <div className="text-[#F3F1EC] text-sm font-medium">{label}</div>
        {sub && <div className="text-[#9797AC] text-xs mt-0.5">{sub}</div>}
      </div>
      <span className="sr-only">{selected ? " (seleccionado)" : ""}</span>
    </button>
  );
}

function Field({ label, children, hint, error, id }) {
  const fieldId = id || `field-${label.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
  const hintId = hint ? `${fieldId}-hint` : undefined;
  const errorId = error ? `${fieldId}-error` : undefined;
  const child = React.isValidElement(children)
    ? React.cloneElement(children, {
        id: fieldId,
        "aria-describedby": [hintId, errorId].filter(Boolean).join(" ") || undefined,
        "aria-invalid": error ? "true" : undefined,
      })
    : children;
  return (
    <label htmlFor={fieldId} className="block mb-4">
      <span className="block text-xs uppercase tracking-wider text-[#9797AC] mb-1.5" style={mono}>{label}</span>
      {child}
      {hint && <span id={hintId} className="block text-[#9797AC] text-xs mt-1.5">{hint}</span>}
      {error && <span id={errorId} role="alert" className="block text-red-300 text-xs mt-1.5">{error}</span>}
    </label>
  );
}

const inputCls = "w-full px-4 py-3 rounded-xl bg-[#131320] border border-[#666690] text-[#F3F1EC] placeholder-[#5C5C74] focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus:border-amber-400";

function ProgressStub({ index, total, stepLabel }) {
  return (
    <div
      className="flex items-center gap-1.5 mb-8"
      role="progressbar"
      aria-valuemin={1}
      aria-valuemax={total}
      aria-valuenow={index + 1}
      aria-label={stepLabel ? `Paso ${index + 1} de ${total}: ${stepLabel}` : `Paso ${index + 1} de ${total}`}
    >
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} aria-hidden="true" className={`h-1 flex-1 rounded-full ${i <= index ? "bg-amber-400" : "bg-[#666690]"}`} />
      ))}
    </div>
  );
}

function BoardingPass({ destId, form, tier }) {
  const d = DESTINOS[destId];
  const alojamiento = d.alojamiento[tier];
  const [imagenFallo, setImagenFallo] = useState(false);
  return (
    <div role="group" aria-label={`Detalle del destino ${d.nombre}, ${d.pais}`} className="relative bg-[#131320] border border-[#666690] rounded-[20px] overflow-hidden">
      <div aria-hidden="true" className="absolute left-[-12px] top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-[#0A0A14]" />
      <div aria-hidden="true" className="absolute right-[-12px] top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-[#0A0A14]" />

      {d.imagen && !imagenFallo && (
        <img
          src={d.imagen.url}
          alt={d.imagen.alt}
          onError={() => setImagenFallo(true)}
          className="w-full h-40 object-cover"
          loading="lazy"
        />
      )}

      <div className="p-6 flex items-center justify-between">
        <div>
          <div className="text-[10px] uppercase tracking-widest text-[#9797AC]" style={mono}>Origen → Destino</div>
          <div className="text-lg text-[#F3F1EC] mt-1" style={display}>{form.origen || "—"} → {d.nombre}, {d.pais}</div>
        </div>
        <Ticket size={28} aria-hidden="true" className="text-amber-400 shrink-0" />
      </div>

      <div className="mx-6 border-t-2 border-dashed border-[#3A3A52]" />

      <div className="p-6 grid sm:grid-cols-2 gap-5 text-sm">
        <div>
          <div className="flex items-center gap-2 text-[#9797AC] text-[10px] uppercase tracking-widest mb-1" style={mono}><CloudSun size={14}/>Clima</div>
          <p className="text-[#F3F1EC]">{d.clima}</p>
        </div>
        <div>
          <div className="flex items-center gap-2 text-[#9797AC] text-[10px] uppercase tracking-widest mb-1" style={mono}><ShieldAlert size={14}/>Riesgo de seguridad</div>
          <p className="text-[#F3F1EC]">{d.riesgoSeguridad}</p>
          <p className="text-[#9797AC] text-xs mt-1">{d.eventos}</p>
        </div>
        <div>
          <div className="flex items-center gap-2 text-[#9797AC] text-[10px] uppercase tracking-widest mb-1" style={mono}><FileText size={14}/>Documentación</div>
          <p className="text-[#F3F1EC]">{d.documentacion}</p>
        </div>
        <div>
          <div className="flex items-center gap-2 text-[#9797AC] text-[10px] uppercase tracking-widest mb-1" style={mono}><Plane size={14}/>Transporte</div>
          <p className="text-[#F3F1EC]">{d.transporte}</p>
          <div className="flex items-center gap-2 text-[#9797AC] text-xs mt-2"><Car size={13}/>Alquiler en destino:</div>
          <p className="text-[#F3F1EC] text-xs">{d.agencias.join(" · ")}</p>
        </div>
        <div>
          <div className="text-[#9797AC] text-[10px] uppercase tracking-widest mb-1" style={mono}>Alojamiento sugerido</div>
          <p className="text-[#F3F1EC]">{alojamiento}</p>
          {d.petFriendly !== undefined && (
            <p className="text-xs mt-1 flex items-center gap-1 text-[#9797AC]">
              <PawPrint size={12}/> {d.petFriendly ? "Pet friendly" : "No recomendado para mascotas"}
            </p>
          )}
        </div>
        <div>
          <div className="flex items-center gap-2 text-[#9797AC] text-[10px] uppercase tracking-widest mb-1" style={mono}><UtensilsCrossed size={14}/>Alimentación diaria</div>
          <p className="text-[#F3F1EC]">{d.comidaPresupuesto}</p>
          <p className="text-[#9797AC] text-xs mt-1">{d.comidaLugares.join(" · ")}</p>
        </div>
        {d.tipo === "internacional" && form.presupuesto && (
          <div className="sm:col-span-2">
            <div className="flex items-center gap-2 text-[#9797AC] text-[10px] uppercase tracking-widest mb-1" style={mono}><Wallet size={14}/>Presupuesto convertido</div>
            <p className="text-[#F3F1EC]">{form.presupuesto} COP ≈ {convertirCOPaPEN(form.presupuesto)} {TASA_COP_A_PEN.pais === "Perú" ? "PEN" : ""}</p>
            <p className="text-[#9797AC] text-xs mt-1">Conversión referencial con tasa fija ({TASA_COP_A_PEN.fechaReferencia}), no es una tasa transaccional.</p>
          </div>
        )}
      </div>
    </div>
  );
}

/* --------------------------- Modal de identificación --------------------- */

function ModalIdentificacion({ form, set, onCompletar }) {
  const [errores, setErrores] = useState({});
  const firstFieldRef = useRef(null);
  const dialogRef = useRef(null);

  useEffect(() => {
    firstFieldRef.current?.focus();
  }, []);

  function onKeyDownTrap(e) {
    if (e.key !== "Tab" || !dialogRef.current) return;
    const focusables = dialogRef.current.querySelectorAll('input, button, [href], select, textarea, [tabindex]:not([tabindex="-1"])');
    if (focusables.length === 0) return;
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }

  function validarYContinuar() {
    const nuevosErrores = {};
    if (!form.nombre.trim()) nuevosErrores.nombre = "Escribe tu nombre.";
    if (!form.apellido.trim()) nuevosErrores.apellido = "Escribe tu apellido.";
    const edadNum = parseInt(form.edad, 10);
    if (!form.edad || isNaN(edadNum) || edadNum <= 0) nuevosErrores.edad = "Ingresa una edad válida.";
    const correoValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.correoElectronico.trim());
    if (!correoValido) nuevosErrores.correoElectronico = "Ingresa un correo con formato válido.";
    setErrores(nuevosErrores);
    if (Object.keys(nuevosErrores).length === 0) onCompletar();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-6"
      onKeyDown={onKeyDownTrap}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-identificacion-titulo"
        aria-describedby="modal-identificacion-nota"
        className="w-full max-w-sm bg-[#131320] border border-[#666690] rounded-2xl p-6"
      >
        <h2 id="modal-identificacion-titulo" className="text-xl text-[#F3F1EC] mb-2" style={display}>Queremos conocer más de ti</h2>
        <p id="modal-identificacion-nota" className="text-[#9797AC] text-xs mb-5">Esta información es solo para guardar el registro de tu viaje.</p>

        <Field label="Nombre" error={errores.nombre}>
          <input ref={firstFieldRef} className={inputCls} value={form.nombre} onChange={(e) => set("nombre", e.target.value)} placeholder="Gloria" />
        </Field>
        <Field label="Apellido" error={errores.apellido}>
          <input className={inputCls} value={form.apellido} onChange={(e) => set("apellido", e.target.value)} placeholder="Rodríguez" />
        </Field>
        <Field label="Edad" error={errores.edad}>
          <input type="number" className={inputCls} value={form.edad} onChange={(e) => set("edad", e.target.value)} placeholder="33" />
        </Field>
        <Field label="Correo electrónico" error={errores.correoElectronico}>
          <input type="email" className={inputCls} value={form.correoElectronico} onChange={(e) => set("correoElectronico", e.target.value)} placeholder="gloria@ejemplo.com" />
        </Field>

        <button
          type="button"
          onClick={validarYContinuar}
          className="mt-2 w-full py-3 rounded-xl bg-amber-400 text-[#0A0A14] font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#131320] flex items-center justify-center gap-2"
        >
          Continuar <ChevronRight size={16} aria-hidden="true"/>
        </button>
      </div>
    </div>
  );
}

/* --------------------------------- App ---------------------------------- */

export default function App() {
  // Las fuentes (Fraunces, Inter, Space Mono) se cargan como <link> en
  // index.html en esta versión desplegable, en vez de inyectarse en
  // tiempo de ejecución — evita el parpadeo de fuente sin estilo (FOUC)
  // y es el patrón estándar fuera del entorno de artifacts de Claude.

  const [step, setStep] = useState("landing");
  const [identificado, setIdentificado] = useState(false);
  const [form, setForm] = useState({
    nombre: "", apellido: "", edad: "", correoElectronico: "", motivo: "", conQuien: "", ninos: false, mascota: false,
    tipoViaje: "", origen: "", fechaInicio: "", fechaFin: "", presupuesto: "",
    destinoDeseado: "", notas: "",
  });
  const [destinoNoEncontrado, setDestinoNoEncontrado] = useState(false);
  const [resultado, setResultado] = useState(null);
  const [riesgoMsg, setRiesgoMsg] = useState(null);
  const [historial, setHistorial] = useState(null);
  const [guardado, setGuardado] = useState(false);
  const [vioSegunda, setVioSegunda] = useState(false);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const STEP_ORDER = ["motivo", "conquien", "tipoviaje", "logistica", "resultado", "segunda", "resumen"];
  const STEP_LABELS = { motivo: "Motivo del viaje", conquien: "Con quién viajas", tipoviaje: "Nacional o internacional", logistica: "Datos base del viaje", resultado: "Destino sugerido", segunda: "Segunda opción", detalleSegunda: "Segunda opción, detalle", resumen: "Resumen", landing: "Portada", historial: "Viajes guardados", detenido: "Sesión terminada" };
  const stepIndex = STEP_ORDER.indexOf(step);

  const [anuncioPaso, setAnuncioPaso] = useState("");
  useEffect(() => {
    if (!identificado) return;
    setAnuncioPaso(STEP_LABELS[step] || "");
  }, [step, identificado]);

  function avanzarDesdeLogistica() {
    if (chequeaContenido(form.notas) || chequeaContenido(form.destinoDeseado)) {
      setStep("detenido");
      return;
    }
    const destId = buscaDestinoConocido(form.destinoDeseado);
    setDestinoNoEncontrado(Boolean(form.destinoDeseado) && !destId);
    const pick = elegirDestinos(form);
    setResultado(pick);
    setRiesgoMsg(chequeaRiesgoEstacional(pick.primary, form.fechaInicio));
    setStep("resultado");
  }

  async function guardarEnHistorial(destinos) {
    if (guardado) return;
    setGuardado(true);
    const record = {
      nombre_completo: `${form.nombre} ${form.apellido}`.trim(),
      edad: form.edad,
      correo_electronico: form.correoElectronico,
      motivo: form.motivo,
      con_quien: form.conQuien,
      viaja_con_ninos: form.ninos,
      viaja_con_mascota: form.mascota,
      origen: form.origen,
      destino: DESTINOS[destinos.primary].nombre,
      tipo_viaje: form.tipoViaje,
      fecha_inicio: form.fechaInicio,
      fecha_fin: form.fechaFin,
      presupuesto_total: form.presupuesto,
      opcion_comparada: destinos.vistaSegunda ? DESTINOS[destinos.secondary].nombre : null,
      fecha_creacion_registro: Date.now(),
    };
    try {
      await storage.set(`viaje:${record.fecha_creacion_registro}`, JSON.stringify(record));
    } catch (e) {
      console.error("No se pudo guardar el historial:", e);
    }
  }

  async function cargarHistorial() {
    try {
      const list = await storage.list("viaje:");
      if (!list || !list.keys) { setHistorial([]); return; }
      const items = [];
      for (const k of list.keys) {
        try {
          const r = await storage.get(k);
          if (r) items.push(JSON.parse(r.value));
        } catch (e) { /* clave sin datos, se ignora */ }
      }
      items.sort((a, b) => b.fecha_creacion_registro - a.fecha_creacion_registro);
      setHistorial(items);
    } catch (e) {
      console.error(e);
      setHistorial([]);
    }
  }

  function descargarItinerario(destinos, incluirSegunda) {
    const tier = tierPresupuesto(form.presupuesto);
    const bloque = (id) => {
      const d = DESTINOS[id];
      return `
        <h2>${form.origen} → ${d.nombre}, ${d.pais}</h2>
        <p><b>Clima:</b> ${d.clima}</p>
        <p><b>Riesgo de seguridad:</b> ${d.riesgoSeguridad} ${d.eventos}</p>
        <p><b>Documentación:</b> ${d.documentacion}</p>
        <p><b>Transporte:</b> ${d.transporte}</p>
        <p><b>Alquiler en destino:</b> ${d.agencias.join(" · ")}</p>
        <p><b>Alojamiento sugerido:</b> ${d.alojamiento[tier]}</p>
        <p><b>Alimentación diaria:</b> ${d.comidaPresupuesto} — ${d.comidaLugares.join(" · ")}</p>
        ${d.tipo === "internacional" && form.presupuesto ? `<p><b>Presupuesto convertido:</b> ${form.presupuesto} COP ≈ ${convertirCOPaPEN(form.presupuesto)} PEN (referencial, tasa fija del ${TASA_COP_A_PEN.fechaReferencia}, no transaccional)</p>` : ""}
      `;
    };
    const html = `<!doctype html><html><head><meta charset="utf-8"><title>Itinerario ${DESTINOS[destinos.primary].nombre}</title>
      <style>body{font-family:Georgia,serif;max-width:700px;margin:40px auto;color:#1a1a1a} h1{font-size:22px} h2{font-size:18px;margin-top:28px;border-top:2px dashed #ccc;padding-top:16px} p{line-height:1.5}</style>
      </head><body>
      <h1>Itinerario de viaje — ${form.nombre} ${form.apellido}</h1>
      <p><b>Motivo:</b> ${form.motivo} · <b>Con quién:</b> ${form.conQuien} · <b>Fechas:</b> ${form.fechaInicio} a ${form.fechaFin} · <b>Presupuesto:</b> ${form.presupuesto}</p>
      ${bloque(destinos.primary)}
      ${incluirSegunda ? bloque(destinos.secondary) : ""}
      <p style="margin-top:32px;color:#777;font-size:12px">Abre este archivo en el navegador e imprime a PDF si necesitas ese formato.</p>
      </body></html>`;
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `itinerario-${DESTINOS[destinos.primary].nombre.replace(/\s+/g, "-").toLowerCase()}.html`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function reiniciar() {
    setForm((f) => ({
      nombre: f.nombre, apellido: f.apellido, edad: f.edad, correoElectronico: f.correoElectronico,
      motivo: "", conQuien: "", ninos: false, mascota: false, tipoViaje: "", origen: "",
      fechaInicio: "", fechaFin: "", presupuesto: "", destinoDeseado: "", notas: "",
    }));
    setResultado(null);
    setRiesgoMsg(null);
    setGuardado(false);
    setDestinoNoEncontrado(false);
    setVioSegunda(false);
    setStep("landing");
  }

  const tier = tierPresupuesto(form.presupuesto);

  return (
    <div className="min-h-screen bg-[#0A0A14] relative" style={{ fontFamily: "'Inter', sans-serif" }}>
      <div aria-hidden="true" className="fixed inset-0 pointer-events-none opacity-70" style={{
        background: "radial-gradient(circle at 15% 20%, #7C6FFF44, transparent 40%), radial-gradient(circle at 85% 25%, #2FE0C044, transparent 45%), radial-gradient(circle at 50% 90%, #E94FA833, transparent 45%)",
        filter: "blur(70px)",
      }} />

      {!identificado && (
        <ModalIdentificacion form={form} set={set} onCompletar={() => setIdentificado(true)} />
      )}

      <div aria-live="polite" aria-atomic="true" className="sr-only" style={{ position: "absolute", width: "1px", height: "1px", overflow: "hidden", clip: "rect(0,0,0,0)" }}>
        {anuncioPaso}
      </div>

      <div className="relative max-w-2xl mx-auto px-6 py-14" aria-hidden={!identificado}>

        {/* LANDING */}
        {step === "landing" && (
          <div className="text-center pt-16">
            <div className="text-amber-400 text-xs uppercase tracking-[0.2em] mb-4" style={mono}>Planeador de viajes</div>
            <h1 className="text-4xl sm:text-5xl text-[#F3F1EC] leading-tight mb-5" style={display}>
              Cuéntame el viaje y armo el resto
            </h1>
            <p className="text-[#9797AC] mb-10 max-w-md mx-auto">
              Motivo, con quién viajas, presupuesto y fechas. Yo cruzo destino, riesgos, transporte y alojamiento — y te dejo comparar dos opciones antes de decidir.
            </p>
            <button disabled={!identificado} onClick={() => setStep("motivo")} className="px-8 py-4 rounded-full bg-[#F3F1EC] text-[#0A0A14] font-medium hover:bg-white transition-colors disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0A0A14]">
              Empezar a planear
            </button>
            <div className="mt-6">
              <button onClick={() => { setStep("historial"); cargarHistorial(); }} className="text-[#9797AC] text-xs hover:text-amber-400 inline-flex items-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 rounded">
                <History size={13} aria-hidden="true"/> Ver mis viajes guardados
              </button>
            </div>
          </div>
        )}

        {/* HISTORIAL */}
        {step === "historial" && (
          <div>
            <button onClick={() => setStep("landing")} className="text-[#9797AC] text-sm flex items-center gap-1 mb-6 hover:text-amber-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 rounded"><ChevronLeft size={16} aria-hidden="true"/>Volver</button>
            <h2 className="text-2xl text-[#F3F1EC] mb-6" style={display}>Viajes guardados</h2>
            {historial === null && <p role="status" className="text-[#9797AC] text-sm">Cargando…</p>}
            {historial && historial.length === 0 && <p role="status" className="text-[#9797AC] text-sm">Todavía no hay viajes guardados en este navegador.</p>}
            <div className="space-y-3">
              {historial && historial.map((h, i) => (
                <div key={i} className="border border-[#666690] rounded-xl p-4 bg-[#131320]">
                  <div className="text-[#F3F1EC] text-sm font-medium">{h.nombre_completo} → {h.destino}</div>
                  <div className="text-[#9797AC] text-xs mt-1" style={mono}>{h.fecha_inicio} a {h.fecha_fin} · {h.presupuesto_total} · {h.tipo_viaje}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* DETENIDO por contenido */}
        {step === "detenido" && (
          <div className="text-center pt-24" role="alert">
            <XCircle size={40} aria-hidden="true" className="mx-auto text-red-400 mb-4" />
            <h2 className="text-2xl text-[#F3F1EC] mb-3" style={display}>Esta sesión terminó aquí</h2>
            <p className="text-[#9797AC] max-w-sm mx-auto">Este planeador no ayuda a conseguir servicios sexuales ni turismo sexual en ningún destino.</p>
            <button onClick={reiniciar} className="mt-8 px-6 py-3 rounded-full border border-[#666690] text-[#F3F1EC] text-sm hover:border-amber-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400">Empezar un viaje nuevo</button>
          </div>
        )}

        {/* WIZARD */}
        {["motivo", "conquien", "tipoviaje", "logistica"].includes(step) && (
          <div>
            <ProgressStub index={stepIndex} total={STEP_ORDER.length} stepLabel={STEP_LABELS[step]} />

            {step === "motivo" && (
              <div>
                <h2 className="text-2xl text-[#F3F1EC] mb-6" style={display}>¿Cuál es el motivo del viaje?</h2>
                <div className="space-y-3 mb-6">
                  <Choice label="Vacaciones" selected={form.motivo === "vacaciones"} onClick={() => set("motivo", "vacaciones")} Icon={Plane}/>
                  <Choice label="Trabajo" sub="Aprovechando también para descansar" selected={form.motivo === "trabajo"} onClick={() => set("motivo", "trabajo")} Icon={Wallet}/>
                  <Choice label="Diversión" sub="Un plan puntual, sin más motivo" selected={form.motivo === "diversion"} onClick={() => set("motivo", "diversion")} Icon={Ticket}/>
                </div>
                <div className="flex gap-3">
                  <button onClick={() => setStep("landing")} aria-label="Volver a la portada" className="px-5 py-3 rounded-xl border border-[#666690] text-[#9797AC] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"><ChevronLeft size={16} aria-hidden="true"/></button>
                  <button disabled={!form.motivo} onClick={() => setStep("conquien")} className="flex-1 py-3 rounded-xl bg-amber-400 text-[#0A0A14] font-medium disabled:opacity-30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400">Continuar</button>
                </div>
              </div>
            )}

            {step === "conquien" && (
              <div>
                <h2 className="text-2xl text-[#F3F1EC] mb-6" style={display}>¿Con quién viajas?</h2>
                <div className="space-y-3 mb-4">
                  <Choice label="Solo" selected={form.conQuien === "solo"} onClick={() => set("conQuien", "solo")} Icon={Users}/>
                  <Choice label="En pareja" selected={form.conQuien === "pareja"} onClick={() => set("conQuien", "pareja")} Icon={Users}/>
                  <Choice label="Familiar" selected={form.conQuien === "familiar"} onClick={() => set("conQuien", "familiar")} Icon={Users}/>
                  <Choice label="Con amigos" selected={form.conQuien === "amigos"} onClick={() => set("conQuien", "amigos")} Icon={Users}/>
                </div>
                {form.conQuien === "familiar" && (
                  <label className="flex items-center gap-2 text-sm text-[#F3F1EC] mb-3">
                    <input type="checkbox" checked={form.ninos} onChange={(e) => set("ninos", e.target.checked)} className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400" />
                    <Baby size={16} aria-hidden="true" className="text-[#9797AC]"/> Viajan niños
                  </label>
                )}
                <label className="flex items-center gap-2 text-sm text-[#F3F1EC] mb-6">
                  <input type="checkbox" checked={form.mascota} onChange={(e) => set("mascota", e.target.checked)} className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400" />
                  <PawPrint size={16} aria-hidden="true" className="text-[#9797AC]"/> Viajan con mascota
                </label>
                <div className="flex gap-3">
                  <button onClick={() => setStep("motivo")} aria-label="Volver al motivo del viaje" className="px-5 py-3 rounded-xl border border-[#666690] text-[#9797AC] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"><ChevronLeft size={16} aria-hidden="true"/></button>
                  <button disabled={!form.conQuien} onClick={() => setStep("tipoviaje")} className="flex-1 py-3 rounded-xl bg-amber-400 text-[#0A0A14] font-medium disabled:opacity-30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400">Continuar</button>
                </div>
              </div>
            )}

            {step === "tipoviaje" && (
              <div>
                <h2 className="text-2xl text-[#F3F1EC] mb-6" style={display}>¿Nacional o internacional?</h2>
                <div className="space-y-3 mb-6">
                  <Choice label="Nacional" selected={form.tipoViaje === "nacional"} onClick={() => set("tipoViaje", "nacional")} Icon={MapPin}/>
                  <Choice label="Internacional" selected={form.tipoViaje === "internacional"} onClick={() => set("tipoViaje", "internacional")} Icon={Plane}/>
                </div>
                <div className="flex gap-3">
                  <button onClick={() => setStep("conquien")} aria-label="Volver a con quién viajas" className="px-5 py-3 rounded-xl border border-[#666690] text-[#9797AC] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"><ChevronLeft size={16} aria-hidden="true"/></button>
                  <button disabled={!form.tipoViaje} onClick={() => setStep("logistica")} className="flex-1 py-3 rounded-xl bg-amber-400 text-[#0A0A14] font-medium disabled:opacity-30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400">Continuar</button>
                </div>
              </div>
            )}

            {step === "logistica" && (
              <div>
                <h2 className="text-2xl text-[#F3F1EC] mb-6" style={display}>Los datos base del viaje</h2>
                <Field label="Ciudad de origen"><input className={inputCls} value={form.origen} onChange={(e) => set("origen", e.target.value)} placeholder="Bogotá" /></Field>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Fecha inicio"><input type="date" className={inputCls} value={form.fechaInicio} onChange={(e) => set("fechaInicio", e.target.value)} /></Field>
                  <Field label="Fecha fin"><input type="date" className={inputCls} value={form.fechaFin} onChange={(e) => set("fechaFin", e.target.value)} /></Field>
                </div>
                <Field label="Presupuesto total (COP)"><input className={inputCls} value={form.presupuesto} onChange={(e) => set("presupuesto", e.target.value)} placeholder="3.000.000" /></Field>
                <Field label="¿Destino en mente? (opcional)"><input className={inputCls} value={form.destinoDeseado} onChange={(e) => set("destinoDeseado", e.target.value)} placeholder="Déjalo vacío si quieres que te sugiera" /></Field>
                <Field label="Algo más que deba saber (opcional)"><textarea className={inputCls} rows={2} value={form.notas} onChange={(e) => set("notas", e.target.value)} /></Field>
                <p className="text-[#9797AC] text-xs mb-2" role="note">Ciudad de origen, fechas y presupuesto son obligatorios para ver la sugerencia.</p>
                <div className="flex gap-3 mt-2">
                  <button onClick={() => setStep("tipoviaje")} aria-label="Volver a nacional o internacional" className="px-5 py-3 rounded-xl border border-[#666690] text-[#9797AC] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"><ChevronLeft size={16} aria-hidden="true"/></button>
                  <button disabled={!form.origen || !form.fechaInicio || !form.fechaFin || !form.presupuesto} onClick={avanzarDesdeLogistica} className="flex-1 py-3 rounded-xl bg-amber-400 text-[#0A0A14] font-medium disabled:opacity-30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400">Ver sugerencia</button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* RESULTADO PRINCIPAL */}
        {step === "resultado" && resultado && (
          <div>
            <ProgressStub index={stepIndex} total={STEP_ORDER.length} stepLabel={STEP_LABELS.resultado} />
            <h2 className="text-2xl text-[#F3F1EC] mb-2" style={display}>Tu destino sugerido</h2>
            {destinoNoEncontrado && (
              <p role="status" className="text-amber-400 text-xs mb-4 flex items-center gap-1.5"><ShieldAlert size={14} aria-hidden="true"/>No tenemos información verificada de "{form.destinoDeseado}". Te muestro la mejor alternativa que sí tenemos.</p>
            )}
            {riesgoMsg && (
              <div role="alert" className="mb-4 p-3 rounded-xl border border-red-400/40 bg-red-400/10 text-red-300 text-sm flex gap-2">
                <ShieldAlert size={16} aria-hidden="true" className="shrink-0 mt-0.5"/> {riesgoMsg}
              </div>
            )}
            <BoardingPass destId={resultado.primary} form={form} tier={tier} />
            <button onClick={() => setStep("segunda")} className="mt-6 w-full py-3 rounded-xl bg-amber-400 text-[#0A0A14] font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400">Continuar</button>
          </div>
        )}

        {/* PREGUNTA SEGUNDA OPCIÓN */}
        {step === "segunda" && resultado && (
          <div className="text-center pt-10">
            <h2 className="text-2xl text-[#F3F1EC] mb-3" style={display}>¿Quieres ver una segunda opción?</h2>
            <p className="text-[#9797AC] mb-8 text-sm">Mismas fechas, mismas condiciones, mismo presupuesto.</p>
            <div className="flex gap-3 justify-center">
              <button onClick={() => { setVioSegunda(true); setStep("detalleSegunda"); }} className="px-6 py-3 rounded-full bg-[#F3F1EC] text-[#0A0A14] font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0A0A14]">Sí, muéstrala</button>
              <button onClick={() => { setVioSegunda(false); setStep("resumen"); }} className="px-6 py-3 rounded-full border border-[#666690] text-[#F3F1EC] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400">No, ir al resumen</button>
            </div>
          </div>
        )}

        {/* DETALLE SEGUNDA OPCIÓN */}
        {step === "detalleSegunda" && resultado && (
          <div>
            <h2 className="text-2xl text-[#F3F1EC] mb-2" style={display}>Segunda opción</h2>
            <p className="text-[#9797AC] text-sm mb-4">{resultado.secondaryNota}</p>
            <BoardingPass destId={resultado.secondary} form={form} tier={tier} />
            <button onClick={() => setStep("resumen")} className="mt-6 w-full py-3 rounded-xl bg-amber-400 text-[#0A0A14] font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400">Ir al resumen</button>
          </div>
        )}

        {/* RESUMEN FINAL */}
        {step === "resumen" && resultado && (
          <ResumenFinal
            form={form} resultado={resultado} tier={tier}
            vistaSegunda={vioSegunda}
            onGuardar={guardarEnHistorial}
            onDescargar={descargarItinerario}
            onReiniciar={reiniciar}
          />
        )}
      </div>
    </div>
  );
}

function ResumenFinal({ form, resultado, tier, vistaSegunda, onGuardar, onDescargar, onReiniciar }) {
  useEffect(() => { onGuardar({ ...resultado, vistaSegunda }); }, []); // eslint-disable-line

  return (
    <div>
      <div className="flex items-center gap-2 text-amber-400 mb-3"><CheckCircle2 size={18} aria-hidden="true"/><span className="text-xs uppercase tracking-widest" style={mono}>Resumen del viaje</span></div>
      <h2 className="text-2xl text-[#F3F1EC] mb-6" style={display}>{form.nombre} {form.apellido}, esto es lo que armamos</h2>

      <div className="space-y-6">
        <div>
          <div className="text-xs uppercase tracking-widest text-[#9797AC] mb-2" style={mono}>Opción elegida</div>
          <BoardingPass destId={resultado.primary} form={form} tier={tier} />
          <button onClick={() => onDescargar(resultado, false)} className="mt-3 text-sm text-[#F3F1EC] flex items-center gap-2 hover:text-amber-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 rounded"><Download size={15} aria-hidden="true"/>Descargar este itinerario (.html, imprimible a PDF)</button>
        </div>

        {vistaSegunda && (
          <div>
            <div className="text-xs uppercase tracking-widest text-[#9797AC] mb-2" style={mono}>Opción comparada</div>
            <BoardingPass destId={resultado.secondary} form={form} tier={tier} />
            <button onClick={() => onDescargar(resultado, true)} className="mt-3 text-sm text-[#F3F1EC] flex items-center gap-2 hover:text-amber-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 rounded"><Download size={15} aria-hidden="true"/>Descargar ambas opciones (.html, imprimible a PDF)</button>
          </div>
        )}
      </div>

      <div className="mt-8 p-4 rounded-xl border border-[#666690] bg-[#131320] text-xs text-[#9797AC]">
        Guardado en tu historial: nombre, edad, correo, motivo, acompañantes, origen/destino, presupuesto, fechas y tipo de viaje.
      </div>

      <button onClick={onReiniciar} className="mt-8 w-full py-3 rounded-xl border border-[#666690] text-[#F3F1EC] hover:border-amber-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400">Planear otro viaje</button>
    </div>
  );
}
