// src/config/robotAliases.js

// === Nombres legibles por ID de robot (puedes editar libremente) ===
export const aliasName = {
  R1: "LiftCore-R1 (Fábrica A)",
  R2: "LiftCore-R2 (Almacén B)",
  R3: "ForkBot-3 (Taller)",
};

// Export adicional para quien importe ROBOT_ALIASES
export const ROBOT_ALIASES = aliasName;

// === Persistencia opcional en LS para nombres legibles ===
// (No interfiere con el mapa alias<->dbId que ya usas)
const LS_ALIAS_NAME_KEY = "alias.names.v1";

function loadAliasNamesFromLS() {
  try {
    const stored = JSON.parse(localStorage.getItem(LS_ALIAS_NAME_KEY) || "{}");
    // Merge no destructivo: LS sobreescribe claves existentes en aliasName
    Object.assign(aliasName, stored);
  } catch {
    // ignorar
  }
}

function saveAliasNamesToLS() {
  try {
    localStorage.setItem(LS_ALIAS_NAME_KEY, JSON.stringify(aliasName));
  } catch {
    // ignorar
  }
}

// Cargar nombres al importar el módulo
loadAliasNamesFromLS();

/**
 * Devuelve un nombre legible para un robotId.
 * Si no existe, retorna el mismo robotId como fallback.
 */
export function getRobotAlias(robotId) {
  if (!robotId) return "";
  return aliasName[robotId] || String(robotId);
}

/**
 * Setea/actualiza el nombre legible de un robotId
 * y lo persiste en localStorage.
 */
export function setRobotAlias(robotId, prettyName) {
  if (!robotId || !prettyName) return;
  aliasName[robotId] = prettyName;
  saveAliasNamesToLS();
}

// ========================================================
// === Mapa alias <-> dbId (tu lógica original) ==========
const LS_KEY = "alias.map.v1";
let _map;

function load() {
  if (_map) return;
  try {
    _map = JSON.parse(localStorage.getItem(LS_KEY) || "{}");
  } catch {
    _map = {};
  }
}
function save() {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(_map));
  } catch {
    // ignorar
  }
}

/**
 * Relaciona un alias "humano" con un ObjectId/DbId.
 * Ej: setAliasDbId("LiftCore-R1 (Fábrica A)", "507f1f77bcf86cd799439011")
 */
export function setAliasDbId(alias, dbId) {
  if (!alias || !dbId) return;
  load();
  _map[alias] = dbId;
  save();
}

export function getDbIdForAlias(alias) {
  load();
  return _map[alias] || null;
}

export function getAliasForDbId(dbId) {
  load();
  const entry = Object.entries(_map).find(([, v]) => v === dbId);
  return entry ? entry[0] : null;
}

export function clearAliasMap() {
  _map = {};
  save();
}
