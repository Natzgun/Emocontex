import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const read = path => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
const paths = ["app/page.tsx", "app/components/workspace.tsx", "app/components/session-setup.tsx"];

test("entry and adult copy do not announce a prototype or demonstration", () => {
  for (const path of paths) {
    // Retain the existing export schema: it is not a user-facing announcement.
    const copy = read(path).replace('mode: "demo"', "");
    assert.doesNotMatch(copy, /\b(prototipo|demostración|demo)\b/i, path);
  }
});

test("professional copy preserves local-storage limits and review requirements", () => {
  const landing = read(paths[0]);
  const workspace = read(paths[1]);
  const preparation = read(paths[2]);
  assert.match(landing, /Preparar una sesión</);
  assert.match(landing, /No hay cuentas, permisos reales ni sincronización/);
  assert.match(workspace, /No ingreses datos personales de niños/);
  assert.match(workspace, /publicarlas no constituye una validación clínica/);
  assert.match(workspace, /Plantillas locales editables, sin generación con IA/);
  assert.match(workspace, /mode: "demo"/);
  assert.match(preparation, /según lo acordado con el profesional/);
  assert.match(preparation, /He revisado estas historias y acompañaré la sesión/);
});
