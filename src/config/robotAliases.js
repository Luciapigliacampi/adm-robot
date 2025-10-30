// src/config/robotAliases.js
export const aliasName = {
  R1: "LiftCore-R1 (Fábrica A)",
  R2: "LiftCore-R2 (Almacén B)",
  R3: "ForkBot-3 (Taller)",
};

const LS_KEY = "alias.map.v1";
let _map;

function load() {
  if (_map) return;
  try { _map = JSON.parse(localStorage.getItem(LS_KEY) || "{}"); }
  catch { _map = {}; }
}
function save() {
  try { localStorage.setItem(LS_KEY, JSON.stringify(_map)); } catch {}
}

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
