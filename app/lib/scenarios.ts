export type Emotion = "Alegría" | "Tristeza" | "Enojo" | "Miedo";
export type Context = "Colegio" | "Hogar" | "Amigos" | "Comunidad";
export type Scenario = {
  id: string; title: string; context: Context; emotion: Emotion;
  description: string; story: string; explanation: string; cause: string;
  status: "published" | "review" | "draft"; scene: number; age: string;
};
export type Activity = { id: string; title: string; emotion: Emotion; answer: string; cause: string; date: string; scenarioId?: string; status?: "completed" | "interrupted" };
export const emotions: Emotion[] = ["Alegría", "Tristeza", "Enojo", "Miedo"];
export const contexts: Context[] = ["Colegio", "Hogar", "Amigos", "Comunidad"];
const rows: [string, Context, Emotion, string, string, string][] = [
  ["Mi torre se cayó", "Colegio", "Enojo", "Diego construye una torre de bloques y un compañero la derriba sin querer. Una oportunidad para reconocer lo que siente.", "Diego construyó una torre con mucho cuidado. Un compañero pasó corriendo y la derribó sin querer.", "Su torre se cayó después de construirla con cuidado."],
  ["Un lugar en el juego", "Amigos", "Alegría", "Lucía llega al patio y sus amigos la invitan a jugar. Exploramos la alegría de compartir y sentirnos parte del grupo.", "Lucía llegó al patio. Sus amigos la llamaron por su nombre y la invitaron a jugar con la pelota.", "Sus amigos la invitaron a jugar."],
  ["¿Dónde está mi peluche?", "Hogar", "Tristeza", "Sofía no encuentra su peluche favorito. Acompañamos la tristeza y la posibilidad de pedir ayuda.", "Sofía quería abrazar a su peluche favorito. Lo buscó en su cama, pero no lo encontró.", "No encuentra su peluche favorito."],
  ["Un sonido inesperado", "Colegio", "Miedo", "Un ruido fuerte sorprende a Mateo en el aula. Reconocemos el miedo y buscamos un espacio tranquilo.", "Mateo dibujaba en el aula. De pronto, una bandeja cayó al suelo e hizo un ruido muy fuerte.", "Escuchó un ruido fuerte que no esperaba."],
  ["Hoy cocinamos juntos", "Hogar", "Alegría", "Preparar una receta en familia también es una forma de conectar. Una historia sobre disfrutar los pequeños momentos.", "Ana preparó galletas con su papá. Él le dijo: Gracias por ayudarme. Me gusta cocinar contigo.", "Compartió una actividad agradable con su papá."],
  ["Un cambio de planes", "Comunidad", "Enojo", "El paseo al parque tendrá que esperar por la lluvia. Practicamos comprender lo que sentimos ante un cambio.", "Tomás quería ir al parque. Empezó a llover y su mamá le explicó que hoy tendrían que quedarse en casa.", "El paseo que esperaba tuvo que cambiar."],
  ["Mi dibujo de colores", "Colegio", "Alegría", "Valeria comparte su dibujo con su profesora y recibe palabras de reconocimiento.", "Valeria terminó un dibujo. Su profesora miró todos sus colores y le dijo que había trabajado con mucho cuidado.", "Su profesora reconoció su esfuerzo."],
  ["Mi amigo se va", "Amigos", "Tristeza", "Una despedida después de jugar nos ayuda a hablar sobre extrañar a alguien.", "Pedro jugó con su amigo toda la tarde. Ahora su amigo debe volver a casa y Pedro quería seguir jugando.", "Su amigo tiene que volver a casa."],
  ["Mi primera visita", "Comunidad", "Miedo", "Conocer un lugar nuevo puede despertar muchas emociones. Podemos pedir que nos acompañen.", "Sara llegó por primera vez a una biblioteca muy grande. No sabía dónde estaba la sala infantil y se acercó a su mamá.", "Está en un lugar que todavía no conoce."],
  ["Esperar mi turno", "Amigos", "Enojo", "Esperar para usar un juguete puede ser difícil. Identificamos lo que ocurre y cómo pedir apoyo.", "Luis quería usar el columpio. Otro niño acababa de subir y Luis tendría que esperar su turno.", "Tiene que esperar para usar el columpio."],
  ["Una tarde con la abuela", "Hogar", "Alegría", "Una visita esperada y un momento para compartir historias en familia.", "La abuela de Elena llegó a visitarla. Trajo un cuento para que lo leyeran juntas en el sofá.", "Su abuela llegó para pasar tiempo con ella."],
  ["La planta del salón", "Colegio", "Tristeza", "La planta que cuidaba el grupo se ha marchitado. Conversamos sobre cuidar y sentir.", "Nicolás regaba la planta del salón cada semana. Hoy vio que sus hojas se habían secado.", "La planta que cuidaba se secó."],
  ["Una noche de lluvia", "Hogar", "Miedo", "Un trueno durante la noche y la tranquilidad de contar con alguien cerca.", "María estaba en su cama cuando escuchó un trueno fuerte. Llamó a su papá para que la acompañara.", "Escuchó un trueno fuerte durante la noche."],
  ["Compartir la merienda", "Amigos", "Alegría", "Un gesto amable en el recreo nos invita a reconocer la alegría.", "A Andrés se le olvidó su merienda. Su amiga le ofreció compartir la suya y se sentaron juntos.", "Su amiga tuvo un gesto amable con él."],
  ["El rompecabezas", "Hogar", "Enojo", "Una pieza que no encaja nos permite practicar una pausa y pedir ayuda.", "Camila intentó poner una pieza varias veces. No encajaba y ella quería terminar su rompecabezas.", "La pieza no encaja aunque lo ha intentado."],
  ["El perro del vecino", "Comunidad", "Miedo", "Encontrarse con un perro desconocido puede dar miedo. Podemos mantener distancia y buscar compañía.", "Bruno caminaba con su mamá. Un perro grande que no conocía empezó a ladrar cerca de ellos.", "Un perro desconocido empezó a ladrar cerca."],
];
export const initialScenarios: Scenario[] = rows.map((row, index) => ({
  id: `scenario-${index + 1}`, title: row[0], context: row[1], emotion: row[2],
  description: row[3], story: row[4], cause: row[5],
  explanation: `En esta historia, ${row[2].toLowerCase()} es una posibilidad. ${row[5]} Otras personas podrían sentirse de otra manera, y podemos conversar sobre ello.`,
  status: [3, 5, 8].includes(index) ? "review" : index === 14 ? "draft" : "published",
  scene: index % 6, age: index % 3 === 0 ? "8–10 años" : "8–12 años",
}));
