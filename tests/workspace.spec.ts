import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test("filters, searches, and paginates the library", async ({ page }) => {
  await page.goto("/adultos");
  if (await page.getByRole("button", { name: "Abrir navegación" }).isVisible()) await page.getByRole("button", { name: "Abrir navegación" }).click();
  await page.getByRole("button", { name: "Biblioteca de escenarios", exact: false }).click();
  await expect(page.getByRole("heading", { name: "Biblioteca de escenarios." })).toBeVisible();
  await expect(page.locator(".scenario-card")).toHaveCount(6);
  await page.getByRole("button", { name: "Hogar", exact: true }).click();
  await expect(page.locator(".scenario-card")).toHaveCount(5);
  await page.getByRole("combobox", { name: "Filtrar por emoción" }).selectOption("Tristeza");
  await expect(page.locator(".scenario-card")).toHaveCount(1);
  await expect(page.getByRole("heading", { name: "¿Dónde está mi peluche?" })).toBeVisible();
  await page.getByRole("textbox", { name: "Buscar escenarios" }).fill("inexistente");
  await expect(page.getByRole("heading", { name: "No encontramos esa historia" })).toBeVisible();
  await page.getByRole("button", { name: "Limpiar filtros" }).click();
  await page.getByRole("button", { name: "Página 3", exact: true }).click();
  await expect(page.locator(".scenario-card")).toHaveCount(4);
});

test("requires review before publication and persists changes", async ({ page }) => {
  await page.goto("/adultos");
  if (await page.getByRole("button", { name: "Abrir navegación" }).isVisible()) await page.getByRole("button", { name: "Abrir navegación" }).click();
  await page.getByRole("button", { name: "Biblioteca de escenarios", exact: false }).click();
  await page.getByRole("main").getByRole("button", { name: "Crear escenario", exact: true }).click();
  const dialog = page.getByRole("dialog");
  await dialog.getByLabel("Título del escenario").fill("Una historia de prueba");
  await dialog.getByLabel("¿Qué ocurre en la historia?").fill("Ana recibe una visita y sonríe.");
  await dialog.getByLabel("¿Por qué podría sentirse así?").fill("Recibe una visita que esperaba.");
  await dialog.getByLabel("Explicación para acompañar").fill("Ana podría sentir alegría al recibir la visita.");
  await dialog.getByRole("button", { name: "Aprobar y publicar" }).click();
  await expect(dialog.getByRole("alert")).toContainText("Confirma la revisión");
  await dialog.getByRole("button", { name: "Guardar borrador" }).click();
  await page.getByRole("button", { name: "Borradores", exact: true }).click();
  const draft = page.locator(".scenario-card").filter({ hasText: "Una historia de prueba" });
  await expect(draft.getByRole("button", { name: "Ver historia" })).toHaveCount(0);
  await draft.getByRole("button", { name: "Revisar borrador" }).click();
  await dialog.getByRole("checkbox").check();
  await dialog.getByRole("button", { name: "Aprobar y publicar" }).click();
  await page.reload();
  await page.getByRole("button", { name: "Biblioteca de escenarios" }).click();
  await page.getByRole("textbox", { name: "Buscar escenarios" }).fill("Una historia de prueba");
  await expect(page.locator(".scenario-card")).toHaveCount(1);
  await expect(page.locator(".scenario-card").getByRole("button", { name: "Ver historia" })).toBeVisible();
});

test("child completes a non-punitive activity and progress is recorded", async ({ page }) => {
  await page.goto("/adultos");
  if (await page.getByRole("button", { name: "Abrir navegación" }).isVisible()) await page.getByRole("button", { name: "Abrir navegación" }).click();
  await page.getByRole("button", { name: "Biblioteca de escenarios", exact: false }).click();
  await page.locator(".scenario-card").first().getByRole("button", { name: "Ver historia" }).click();
  await page.getByRole("button", { name: "Preparar esta historia" }).click();
  await page.getByRole("checkbox").check();
  await page.getByRole("button", { name: "Abrir espacio infantil" }).click();
  await page.getByRole("button", { name: "Empezar", exact: true }).click();
  await page.getByRole("button", { name: "Continuar", exact: true }).click();
  await expect(page.getByRole("button", { name: "Continuar", exact: true })).toBeDisabled();
  await page.getByRole("button", { name: "Alegría", exact: true }).click();
  await expect(page.locator(".child-feedback")).toContainText("Gracias por compartir tu idea");
  await page.getByRole("button", { name: "Continuar", exact: true }).click();
  await page.getByRole("button", { name: "Todavía no lo sé. Quiero hablarlo." }).click();
  await page.getByRole("button", { name: "Terminar sesión" }).click();
  await expect(page.getByRole("heading", { name: "Terminamos por hoy." })).toBeVisible();
  await page.getByRole("button", { name: "Ver resumen" }).click();
  await page.getByRole("link", { name: "Volver al espacio adulto" }).click();
  await page.getByRole("button", { name: "Progreso y seguimiento" }).click();
  await expect(page.locator(".activity-list")).toContainText("Mi torre se cayó");
  await expect(page.locator(".activity-list")).toContainText("Respuesta: Alegría");
  await expect(page.locator(".activity-list")).toContainText("Todavía no lo sé");
});

test("dialog restores keyboard focus and sensory preferences persist", async ({ page }) => {
  await page.goto("/adultos");
  if (await page.getByRole("button", { name: "Abrir navegación" }).isVisible()) await page.getByRole("button", { name: "Abrir navegación" }).click();
  await page.getByRole("button", { name: "Biblioteca de escenarios", exact: false }).click();
  const trigger = page.getByRole("button", { name: "Preferencias sensoriales" });
  await trigger.click();
  await page.getByRole("switch", { name: "Texto más grande" }).check();
  await page.keyboard.press("Escape");
  await expect(trigger).toBeFocused();
  await page.reload();
  await expect(page.locator(".app-shell")).toHaveClass(/large-text/);
});

test("library meets automated accessibility checks", async ({ page }) => {
  await page.goto("/adultos");
  if (await page.getByRole("button", { name: "Abrir navegación" }).isVisible()) await page.getByRole("button", { name: "Abrir navegación" }).click();
  await page.getByRole("button", { name: "Biblioteca de escenarios", exact: false }).click();
  const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze();
  expect(results.violations.map(v => ({ id: v.id, nodes: v.nodes.map(n => ({ target: n.target, summary: n.failureSummary })) }))).toEqual([]);
  await page.screenshot({ path: "/tmp/opencode/emocontex-desktop.png", fullPage: true });
});

test("library and activity reflow at 320px", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 800 });
  await page.goto("/adultos");
  if (await page.getByRole("button", { name: "Abrir navegación" }).isVisible()) await page.getByRole("button", { name: "Abrir navegación" }).click();
  await page.getByRole("button", { name: "Biblioteca de escenarios", exact: false }).click();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBeTruthy();
  await page.screenshot({ path: "/tmp/opencode/emocontex-mobile.png", fullPage: true });
  await page.locator(".scenario-card").first().getByRole("button", { name: "Ver historia" }).click();
  await page.getByRole("button", { name: "Preparar esta historia" }).click();
  await page.getByRole("checkbox").check();
  await page.getByRole("button", { name: "Abrir espacio infantil" }).click();
  await page.getByRole("button", { name: "Empezar", exact: true }).click();
  await page.getByRole("button", { name: "Continuar", exact: true }).click();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBeTruthy();
  await page.getByRole("button", { name: "Enojo", exact: true }).click();
  await expect(page.getByRole("button", { name: "Continuar", exact: true })).toBeEnabled();
  const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze();
  expect(results.violations.map(v => ({ id: v.id, nodes: v.nodes.map(n => ({ target: n.target, summary: n.failureSummary })) }))).toEqual([]);
});


test("landing explains scope and sends adults to preparation", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Comprender emociones");
  await expect(page.getByRole("button", { name: "Crear escenario" })).toHaveCount(0);
  expect((await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze()).violations).toEqual([]);
  await page.screenshot({ path: "/tmp/emocontex-landing.png", fullPage: true });
  await page.getByRole("link", { name: "Preparar una sesión" }).click();
  await expect(page).toHaveURL(/adultos$/);
  await page.getByRole("button", { name: "Preparar una sesión" }).click();
  await page.getByRole("button", { name: "Abrir espacio infantil" }).click();
  await expect(page.getByRole("alert")).toContainText("Confirma");
  await expect(page.getByRole("option", { name: "Un sonido inesperado" })).toHaveCount(0);
  await page.getByRole("checkbox").check();
  await page.getByRole("button", { name: "Abrir espacio infantil" }).click();
  await expect(page).toHaveURL(/practicar$/);
  await page.getByRole("button", { name: "Empezar", exact: true }).click();
  await expect(page.getByRole("navigation", { name: "Navegación principal" })).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Crear escenario" })).toHaveCount(0);
  await page.getByRole("button", { name: "Hacer una pausa" }).click();
  await page.getByRole("button", { name: "Terminar por hoy" }).click();
  await page.getByRole("button", { name: "Ver resumen" }).click();
  await page.getByRole("link", { name: "Volver al espacio adulto" }).click();
  await page.goto("/practicar");
  await expect(page.getByRole("heading", { name: "Preparemos una historia juntos." })).toBeVisible();
});

test("child entry rejects unpublished scenarios and caregiver hides editing", async ({ page }) => {
  await page.goto("/adultos");
  await page.getByLabel("Voy a acompañar como").selectOption("caregiver");
  await expect(page.getByRole("button", { name: "Crear escenario" })).toHaveCount(0);
  await expect(page.getByRole("button", { name: /pendientes de revisión/ })).toHaveCount(0);
  await page.evaluate(() => sessionStorage.setItem("emocontex-session-v1", JSON.stringify({ scenarioId: "scenario-4", id: "unpublished" })));
  await page.goto("/practicar");
  await page.getByRole("button", { name: "Empezar" }).click();
  await expect(page.getByRole("heading", { name: "Esta historia no está disponible." })).toBeVisible();
  await expect(page.locator("body")).not.toContainText("Un sonido inesperado");
});

test("landing and preparation reflow on a narrow screen", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 800 });
  await page.goto("/");
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBeTruthy();
  await page.screenshot({ path: "/tmp/emocontex-landing-mobile.png", fullPage: true });
  await page.getByRole("link", { name: "Preparar una sesión" }).click();
  await page.getByRole("button", { name: "Preparar una sesión" }).click();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBeTruthy();
  expect((await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze()).violations).toEqual([]);
});


for (const finish of ["complete", "exit"] as const) {
  test(`caregiver presentation survives child session ${finish}`, async ({ page }) => {
    await page.goto("/adultos");
    await page.getByLabel("Voy a acompañar como").selectOption("caregiver");
    await page.getByRole("button", { name: "Preparar una sesión" }).click();
    await page.getByRole("checkbox").check();
    await page.getByRole("button", { name: "Abrir espacio infantil" }).click();
    await expect(page).toHaveURL(/practicar$/);
    await page.getByRole("button", { name: "Empezar", exact: true }).click();
    if (finish === "complete") {
      await page.getByRole("button", { name: "Continuar", exact: true }).click();
      await page.getByRole("button", { name: "Enojo", exact: true }).click();
      await page.getByRole("button", { name: "Continuar", exact: true }).click();
      await page.getByRole("button", { name: "Todavía no lo sé. Quiero hablarlo." }).click();
      await page.getByRole("button", { name: "Terminar sesión" }).click();
      await page.getByRole("button", { name: "Ver resumen" }).click();
      await page.getByRole("link", { name: "Volver al espacio adulto", exact: true }).click();
    } else {
      await page.getByRole("button", { name: "Hacer una pausa" }).click();
      await page.getByRole("button", { name: "Terminar por hoy" }).click();
      await page.getByRole("button", { name: "Ver resumen" }).click();
      await page.getByRole("link", { name: "Volver al espacio adulto" }).click();
    }
    await expect(page).toHaveURL(/adultos$/);
    await expect(page.getByLabel("Voy a acompañar como")).toHaveValue("caregiver");
    await expect(page.getByRole("button", { name: "Crear escenario" })).toHaveCount(0);
    await expect(page.getByRole("button", { name: /pendientes de revisión/ })).toHaveCount(0);
    await page.reload();
    await expect(page.getByLabel("Voy a acompañar como")).toHaveValue("caregiver");
  });
}

test("invalid stored adult role falls back to the professional presentation", async ({ page }) => {
  await page.goto("/adultos");
  await page.evaluate(() => sessionStorage.setItem("emocontex-adult-role-v1", JSON.stringify({ role: "invalid" })));
  await page.reload();
  await expect(page.getByLabel("Voy a acompañar como")).toHaveValue("professional");
});

test("professional copy avoids prototype announcements and retains usage guidance", async ({ page }) => {
  const announcement = /\b(prototipo|demostración|demo)\b/i;
  await page.goto("/");
  await expect(page.locator("body")).not.toContainText(announcement);
  await page.getByText("¿Dónde se guarda la información?", { exact: true }).click();
  await expect(page.getByText(/No ingreses datos personales de niños/)).toBeVisible();
  await page.getByRole("link", { name: "Preparar una sesión", exact: true }).click();
  await expect(page.locator("body")).not.toContainText(announcement);
  if (await page.getByRole("button", { name: "Abrir navegación" }).isVisible()) await page.getByRole("button", { name: "Abrir navegación" }).click();
  await page.getByRole("button", { name: "Ayuda y orientación" }).click();
  await expect(page.getByRole("dialog")).toContainText("No hay cuentas, permisos de acceso ni sincronización");
  await expect(page.getByRole("dialog")).toContainText("publicarlas no constituye una validación clínica");
  await expect(page.getByRole("dialog")).not.toContainText(announcement);
  await page.keyboard.press("Escape");
  await page.getByRole("button", { name: "Crear escenario", exact: true }).click();
  await expect(page.getByRole("button", { name: "Usar plantilla", exact: true })).toBeVisible();
  await expect(page.getByRole("dialog")).toContainText("sin generación con IA");
  await expect(page.getByRole("dialog")).not.toContainText(announcement);
});

test("interrupted activity is recorded without inflating completed counts", async ({ page }) => {
  await page.goto("/adultos");
  await page.getByRole("button", { name: "Preparar una sesión", exact: true }).click();
  await page.getByRole("checkbox").check();
  await page.getByRole("button", { name: "Abrir espacio infantil" }).click();
  await page.getByRole("button", { name: "Empezar", exact: true }).click();
  await page.getByRole("button", { name: "Continuar", exact: true }).click();
  await page.getByRole("button", { name: "Enojo", exact: true }).click();
  await page.getByRole("button", { name: "Hacer una pausa" }).click();
  await page.getByRole("button", { name: "Terminar por hoy" }).click();
  await page.getByRole("button", { name: "Ver resumen" }).click();
  await page.getByRole("link", { name: "Volver al espacio adulto" }).click();
  await expect(page.locator(".activity-list")).toContainText("Interrumpida");
  await expect(page.locator(".activity-list")).toContainText("Respuesta: Enojo");
  await expect(page.locator(".dashboard-stat").filter({ hasText: "Actividades completadas" }).locator("strong")).toHaveText("0");
  await expect(page.locator(".dashboard-stat").filter({ hasText: "Actividades interrumpidas" }).locator("strong")).toHaveText("1");
  await page.reload();
  await expect(page.locator(".activity-list")).toContainText("Interrumpida");
});

test("professional saves and exports usability feedback without sending it remotely", async ({ page }) => {
  await page.goto("/adultos");
  if (await page.getByRole("button", { name: "Abrir navegación" }).isVisible()) await page.getByRole("button", { name: "Abrir navegación" }).click();
  await page.getByRole("button", { name: "Compartir comentarios" }).click();
  await page.getByLabel("Pantalla o actividad").selectOption("Actividad infantil");
  await page.getByLabel("¿Qué ocurrió?").fill("La instrucción de la emoción fue clara.");
  await page.getByLabel("¿Qué mejorarías? (opcional)").fill("Revisar las alternativas de causa.");
  await page.getByRole("button", { name: "Guardar comentario" }).click();
  await expect(page.getByRole("status").filter({ hasText: "Comentario guardado" })).toBeVisible();
  await page.getByText("Comentarios guardados (1)", { exact: true }).click();
  await expect(page.locator(".feedback-list")).toContainText("Revisar las alternativas de causa.");
  const download = page.waitForEvent("download");
  await page.getByRole("button", { name: "Exportar comentarios" }).click();
  expect((await download).suggestedFilename()).toBe("emocontex-comentarios.json");
  await page.keyboard.press("Escape");
  await page.reload();
  if (await page.getByRole("button", { name: "Abrir navegación" }).isVisible()) await page.getByRole("button", { name: "Abrir navegación" }).click();
  await page.getByRole("button", { name: "Compartir comentarios" }).click();
  await expect(page.getByText("Comentarios guardados (1)", { exact: true })).toBeVisible();
});

test("scenario editor rejects whitespace-only content", async ({ page }) => {
  await page.goto("/adultos");
  if (await page.getByRole("button", { name: "Abrir navegación" }).isVisible()) await page.getByRole("button", { name: "Abrir navegación" }).click();
  await page.getByRole("button", { name: "Crear escenario", exact: true }).click();
  await page.getByRole("button", { name: "Usar plantilla", exact: true }).click();
  await page.getByLabel("Título del escenario").fill("   ");
  await page.getByRole("button", { name: "Guardar borrador" }).click();
  await expect(page.getByRole("alert")).toContainText("Completa todos los campos");
});

test("completed session reload stays finished and history exports without duplicates", async ({ page }) => {
  await page.goto("/adultos");
  await page.getByRole("button", { name: "Preparar una sesión", exact: true }).click();
  await page.getByRole("checkbox").check();
  await page.getByRole("button", { name: "Abrir espacio infantil" }).click();
  await page.getByRole("button", { name: "Empezar", exact: true }).click();
  await page.getByRole("button", { name: "Continuar", exact: true }).click();
  await page.getByRole("button", { name: "Enojo", exact: true }).click();
  await page.getByRole("button", { name: "Continuar", exact: true }).click();
  await page.getByRole("button", { name: "Todavía no lo sé. Quiero hablarlo." }).click();
  await page.getByRole("button", { name: "Terminar sesión" }).click();
  await page.reload();
  await expect(page.getByRole("heading", { name: "Terminamos por hoy." })).toBeVisible();
  await page.getByRole("button", { name: "Ver resumen" }).click();
  await page.getByRole("link", { name: "Volver al espacio adulto", exact: true }).click();
  if (await page.getByRole("button", { name: "Abrir navegación" }).isVisible()) await page.getByRole("button", { name: "Abrir navegación" }).click();
  await page.getByRole("button", { name: "Progreso y seguimiento" }).click();
  await expect(page.locator(".activity-list article")).toHaveCount(1);
  const download = page.waitForEvent("download");
  await page.getByRole("button", { name: "Exportar seguimiento" }).click();
  expect((await download).suggestedFilename()).toBe("emocontex-actividades.json");
});

test("adult orders two stories, child resumes and returns device before summary", async ({ page }) => {
  await page.goto("/adultos");
  await page.getByRole("button", { name: "Preparar una sesión", exact: true }).click();
  await page.getByLabel("Añadir historia").selectOption("scenario-2");
  await page.getByRole("button", { name: "Subir Un lugar en el juego", exact: true }).click();
  await expect(page.locator(".session-selection li").first()).toContainText("Un lugar en el juego");
  await page.getByRole("checkbox").check();
  await page.getByRole("button", { name: "Abrir espacio infantil" }).click();
  await expect(page.getByRole("heading", { name: "Vamos a explorar 2 historias." })).toBeVisible();
  await page.getByRole("button", { name: "Empezar", exact: true }).click();
  await expect(page.locator(".session-position")).toHaveText("Historia 1 de 2");
  await page.getByRole("button", { name: "Continuar", exact: true }).click();
  await page.getByRole("button", { name: "Miedo", exact: true }).click();
  await page.reload();
  await expect(page.getByRole("button", { name: "Miedo", exact: true })).toHaveAttribute("aria-pressed", "true");
  await page.getByRole("button", { name: "Hacer una pausa" }).click();
  await page.getByRole("button", { name: "Continuar mi historia" }).click();
  await page.getByRole("button", { name: "Continuar", exact: true }).click();
  await page.getByRole("button", { name: "Todavía no lo sé. Quiero hablarlo." }).click();
  await page.getByRole("button", { name: "Siguiente historia" }).click();
  await expect(page.getByRole("heading", { name: "Mi torre se cayó" })).toBeVisible();
  await expect(page.locator(".session-position")).toHaveText("Historia 2 de 2");
  await expect(page.getByRole("button", { name: "Ver resumen" })).toHaveCount(0);
  await page.reload();
  await expect(page.locator(".session-position")).toHaveText("Historia 2 de 2");
  await page.getByRole("button", { name: "Continuar", exact: true }).click();
  await page.getByRole("button", { name: "Alegría", exact: true }).click();
  await page.getByRole("button", { name: "Continuar", exact: true }).click();
  await page.getByRole("button", { name: "Todavía no lo sé. Quiero hablarlo." }).click();
  await page.getByRole("button", { name: "Terminar sesión" }).click();
  await expect(page.getByText("Dale el dispositivo a tu acompañante.")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Resumen de la sesión" })).toHaveCount(0);
  await page.reload();
  await expect(page.getByRole("heading", { name: "Terminamos por hoy." })).toBeVisible();
  await page.getByRole("button", { name: "Ver resumen" }).click();
  await expect(page.locator(".session-summary")).toContainText("2 de 2 historias completadas · 0 pendientes");
  await expect(page.locator(".session-summary li")).toHaveCount(2);
  const records = await page.evaluate(() => JSON.parse(localStorage.getItem("emocontex-sessions-v2")!));
  expect(records).toHaveLength(1);
  expect(records[0].activities).toHaveLength(2);
});

test("early ending a set preserves pending stories and partial answers", async ({ page }) => {
  await page.goto("/adultos");
  await page.getByRole("button", { name: "Preparar una sesión", exact: true }).click();
  await page.getByLabel("Añadir historia").selectOption("scenario-2");
  await page.getByRole("checkbox").check();
  await page.getByRole("button", { name: "Abrir espacio infantil" }).click();
  await page.getByRole("button", { name: "Empezar" }).click();
  await page.getByRole("button", { name: "Continuar", exact: true }).click();
  await page.getByRole("button", { name: "Enojo", exact: true }).click();
  await page.getByRole("button", { name: "Hacer una pausa" }).click();
  await page.getByRole("button", { name: "Terminar por hoy" }).click();
  await expect(page.getByText("Dale el dispositivo a tu acompañante.")).toBeVisible();
  await page.getByRole("button", { name: "Ver resumen" }).click();
  await expect(page.locator(".session-summary")).toContainText("0 de 2 historias completadas · 2 pendientes");
  await expect(page.locator(".session-summary")).toContainText("Emoción elegida: Enojo");
});

test("withdrawn selected story never renders and remains unavailable in summary", async ({ page }) => {
  await page.goto("/adultos");
  await page.getByRole("button", { name: "Preparar una sesión", exact: true }).click();
  await page.getByRole("checkbox").check();
  await page.getByRole("button", { name: "Abrir espacio infantil" }).click();
  await page.evaluate(() => localStorage.setItem("emocontex-scenarios-v1", "[]"));
  await page.reload();
  await page.getByRole("button", { name: "Empezar" }).click();
  await expect(page.getByRole("heading", { name: "Esta historia no está disponible." })).toBeVisible();
  await expect(page.locator("body")).not.toContainText("Mi torre se cayó");
  await page.getByRole("button", { name: "Continuar sin esta historia" }).click();
  await page.getByRole("button", { name: "Ver resumen" }).click();
  await expect(page.locator(".session-summary")).toContainText("0 de 1 historias completadas · 0 pendientes · 1 no disponibles");
});

test("storage failure does not prevent handoff or exporting unsaved responses", async ({ page }) => {
  page.on("dialog", dialog => dialog.accept());
  await page.goto("/adultos");
  await page.getByRole("button", { name: "Preparar una sesión", exact: true }).click();
  await page.getByRole("checkbox").check();
  await page.getByRole("button", { name: "Abrir espacio infantil" }).click();
  await page.getByRole("button", { name: "Empezar" }).click();
  await page.evaluate(() => { Storage.prototype.setItem = () => { throw new DOMException("Blocked", "QuotaExceededError"); }; });
  await page.getByRole("button", { name: "Hacer una pausa" }).click();
  await page.getByRole("button", { name: "Terminar por hoy" }).click();
  await expect(page.getByRole("heading", { name: "Terminamos por hoy." })).toBeVisible();
  await expect(page.getByText(/No se pudo guardar el progreso/)).toBeVisible();
  await page.getByRole("button", { name: "Ver resumen" }).click();
  await expect(page.getByRole("alert")).toContainText("Esta sesión no está guardada");
  const download = page.waitForEvent("download");
  await page.getByRole("button", { name: "Descargar sesión" }).click();
  expect((await download).suggestedFilename()).toBe("emocontex-sesion.json");
  await page.getByRole("link", { name: "Volver al espacio adulto" }).click();
  await expect(page).toHaveURL(/adultos$/);
});
