import Link from "next/link";
import { Logo } from "./components/shared";
import Scene from "./components/scene";
import Icon from "./components/app-icon";

export default function Home() {
  return <div className="landing">
    <a className="skip-link" href="#landing-content">Saltar al contenido</a>
    <header className="landing-header"><Logo/><nav aria-label="Navegación de presentación"><a href="#como-funciona">Cómo funciona</a><Link className="button secondary" href="/adultos">Espacio adulto<Icon name="arrow" size={16}/></Link></nav></header>
    <main id="landing-content">
      <section className="landing-hero">
        <div><span className="eyebrow">PEQUEÑAS HISTORIAS. GRANDES CONVERSACIONES.</span><h1>Comprender emociones empieza por compartir una historia<span className="heading-dot">.</span></h1><p>Una herramienta de apoyo para profesionales de Psicología: prepara historias, acompaña la práctica de emociones y consulta las respuestas de cada actividad.</p><Link className="button primary" href="/adultos">Preparar una sesión<Icon name="arrow" size={20}/></Link><span className="landing-note">Para profesionales de Psicología y familias</span></div>
        <figure className="landing-story"><div className="landing-story-label"><Icon name="book" size={18}/>Una historia para conversar</div><Scene variant={1} title="Una ilustración de ejemplo para acompañar una historia cotidiana." large/><figcaption><span className="eyebrow">EN EL PATIO</span><h2>Un lugar en el juego</h2><p>Lucía llega al patio. Sus amigos la invitan a jugar.</p><span className="story-question">¿Cómo podría sentirse Lucía?</span></figcaption></figure>
      </section>
      <section className="landing-process" id="como-funciona"><span className="eyebrow">UN PASO A LA VEZ</span><h2>Dos espacios, un mismo acompañamiento.</h2><p>La preparación es del adulto. La exploración es del niño.</p><div className="landing-steps">
        <article><span className="step-number">1</span><h3>Prepara con cuidado</h3><p>El adulto elige una historia y revisa su contenido antes de iniciar. El profesional también puede editar y publicar escenarios.</p></article>
        <article><span className="step-number">2</span><h3>Exploren a su ritmo</h3><p>En el espacio infantil solo aparecen la historia y una pregunta a la vez. Audio opcional, botones grandes y pausas cuando las necesiten.</p></article>
        <article><span className="step-number">3</span><h3>Conversa y observa</h3><p>Una explicación invita a conversar, sin puntos ni castigos. El adulto puede consultar las respuestas al terminar.</p></article>
      </div></section>
      <section className="landing-purpose"><div><span className="eyebrow">DISEÑADO PARA ACOMPAÑAR</span><h2>Menos distracciones.<br/>Más espacio para comprender.</h2></div><div><p>EMOCONTEX está dirigido inicialmente a niños de 8 a 12 años con TEA nivel de apoyo 1, acompañados por un familiar, cuidador o profesional.</p><p>Exploramos alegría, tristeza, enojo y miedo. No hay una única manera de sentir: cada historia es una oportunidad para escuchar.</p><p><strong>Una herramienta de práctica, no de diagnóstico.</strong> No sustituye la atención psicológica ni demuestra eficacia terapéutica.</p></div></section>
      <section className="landing-faq"><h2>Antes de comenzar</h2><details><summary>¿Cómo apoya el trabajo profesional?</summary><p>Puedes preparar sesiones, editar y publicar escenarios y consultar las respuestas registradas en este navegador. Las historias incluidas requieren revisión profesional antes de usarse con niños; publicarlas no constituye una validación clínica. Para crear contenido puedes partir de plantillas locales, sin generación con IA.</p></details><details><summary>¿Dónde se guarda la información?</summary><p>Solo en este navegador. No hay cuentas, permisos reales ni sincronización. No ingreses datos personales de niños. Borrar los datos del navegador elimina los registros.</p></details><details><summary>¿Puede usarlo el niño sin acompañamiento?</summary><p>El recorrido está pensado para realizarse junto a un adulto, que revisa la historia y prepara la sesión. Pueden hacer una pausa o finalizar en cualquier momento.</p></details></section>
    </main>
    <footer className="landing-footer"><Logo/><p>Proyecto interdisciplinario · Psicología y Computación<br/>Universidad Nacional de San Agustín de Arequipa</p><Link href="/adultos">Entrar al espacio adulto →</Link></footer>
  </div>;
}
