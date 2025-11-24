// Referencias a elementos del DOM
const $ = (selector) => document.querySelector(selector);

const permisoSpan = $("#permiso");
const latSpan = $("#lat");
const lngSpan = $("#lng");
const accSpan = $("#acc");
const timestampSpan = $("#timestamp");
const mensajeP = $("#mensaje");
const linkMaps = $("#link-maps");
const btnUbicacion = $("#btn-ubicacion");
const btnDetener = $("#btn-detener");

let watchId = null;

// Mostrar estado inicial de permisos si está disponible
if ("permissions" in navigator && navigator.permissions.query) {
  navigator.permissions.query({ name: "geolocation" }).then((result) => {
    permisoSpan.textContent = result.state;
    result.onchange = () => {
      permisoSpan.textContent = result.state;
    };
  }).catch(() => {
    permisoSpan.textContent = "no disponible (permissions API)";
  });
} else {
  permisoSpan.textContent = "desconocido (sin Permissions API)";
}

// Función para formatear fecha/hora
function formatTimestamp(ts) {
  const date = new Date(ts);
  return date.toLocaleString();
}

// Función que maneja posición exitosa
function onPositionSuccess(position) {
  const { latitude, longitude, accuracy } = position.coords;

  latSpan.textContent = latitude.toFixed(6);
  lngSpan.textContent = longitude.toFixed(6);
  accSpan.textContent = accuracy.toFixed(2);
  timestampSpan.textContent = formatTimestamp(position.timestamp);

  mensajeP.textContent = "Ubicación actualizada correctamente.";

  // Mostrar link a mapas (Google Maps)
  const url = `https://www.google.com/maps?q=${latitude},${longitude}`;
  linkMaps.href = url;
  linkMaps.style.display = "inline-block";
}

// Función que maneja errores de geolocalización
function onPositionError(error) {
  console.error(error);
  switch (error.code) {
    case error.PERMISSION_DENIED:
      mensajeP.textContent = "Permiso denegado. Revisa la configuración del navegador.";
      break;
    case error.POSITION_UNAVAILABLE:
      mensajeP.textContent = "La ubicación no está disponible.";
      break;
    case error.TIMEOUT:
      mensajeP.textContent = "La solicitud de ubicación tardó demasiado.";
      break;
    default:
      mensajeP.textContent = "Ocurrió un error al obtener la ubicación.";
  }
}

// Opciones de la Geolocation API
const geoOptions = {
  enableHighAccuracy: true,  // Intentar usar GPS cuando sea posible
  timeout: 10000,            // Máximo 10s de espera
  maximumAge: 0              // No usar ubicaciones cacheadas
};

// Evento: al hacer clic en "Obtener / Ver ubicación"
btnUbicacion.addEventListener("click", () => {
  if (!("geolocation" in navigator)) {
    mensajeP.textContent = "Este navegador no soporta Geolocation API.";
    return;
  }

  mensajeP.textContent = "Obteniendo ubicación...";

  // Primero, obtener una sola posición
  navigator.geolocation.getCurrentPosition(onPositionSuccess, onPositionError, geoOptions);

  // Luego, iniciar seguimiento continuo
  if (watchId === null) {
    watchId = navigator.geolocation.watchPosition(onPositionSuccess, onPositionError, geoOptions);
    btnDetener.disabled = false;
    mensajeP.textContent = "Seguimiento de ubicación iniciado.";
  }
});

// Evento: al hacer clic en "Detener seguimiento"
btnDetener.addEventListener("click", () => {
  if (watchId !== null) {
    navigator.geolocation.clearWatch(watchId);
    watchId = null;
    mensajeP.textContent = "Seguimiento de ubicación detenido.";
    btnDetener.disabled = true;
  }
});

// Registro básico del Service Worker (para PWA)
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js")
      .then(reg => console.log("Service Worker registrado:", reg.scope))
      .catch(err => console.error("Error al registrar SW:", err));
  });
}
