const deadlineLabels = {
  'preinscripcion-apertura': 'Apertura de preinscripción',
  'preinscripcion-cierre': 'Cierre de preinscripción',
  'matricula-apertura': 'Apertura de matrícula',
  'matricula-cierre': 'Cierre de matrícula',
  'pago-limite': 'Fecha límite de pago',
};

const enrollmentPortal = 'https://www.titulacionespropias.uma.es/';
const dateFormat = new Intl.DateTimeFormat('es-ES', { dateStyle: 'long', timeZone: 'UTC' });
const compact = date => date.replaceAll('-', '');

function dayAfter(date) {
  const next = new Date(date);
  next.setUTCDate(next.getUTCDate() + 1);
  return next.toISOString().slice(0, 10);
}

export function deadlinesFor(course) {
  return Object.entries(deadlineLabels).map(([key, label]) => ({ key, label, date: course.deadlines?.[key] }));
}

export function deadlineList(course) {
  const items = deadlinesFor(course).map(({ label, date }) =>
    '- **' + label + '** · ' + (date ? dateFormat.format(new Date(date)) : 'Fecha pendiente'),
  );
  return '**Plazos previstos**\n\n' + items.join('\n');
}

function escapeText(text) {
  return text.replaceAll('\\', '\\\\').replace(/\r?\n/g, '\\n').replaceAll(';', '\\;').replaceAll(',', '\\,');
}

function foldLine(line) {
  let bytes = 0;
  let folded = '';
  for (const char of line) {
    const size = Buffer.byteLength(char);
    if (bytes + size > 75) {
      folded += '\r\n ';
      bytes = 1;
    }
    folded += char;
    bytes += size;
  }
  return folded;
}

export function calendarResponse(courses, base, { classes = true, deadlines = true } = {}) {
  const timestamp = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
  const entries = courses.flatMap(course => {
    const year = course.start.slice(0, 4);
    const uid = course.code + '-' + year;
    const courseUrl = new URL('cursos/' + course.slug + '/', base).href;
    const classEvent = {
      uid: uid + '@praxis',
      date: course.start,
      end: course.end,
      title: course.short,
      location: 'Facultad de Ciencias de la Salud, Universidad de Málaga',
      description: 'Consulta la ficha del curso para ver horarios y modalidad.\n' + courseUrl,
      url: courseUrl,
    };
    const deadlineEvents = deadlinesFor(course).filter(item => item.date).map(({ key, label, date }) => ({
      uid: uid + '-' + key + '@praxis',
      date,
      title: label + ' · Fecha prevista · ' + course.short,
      description: 'Fecha prevista. Comprueba el plazo antes de inscribirte.\nFicha: ' + courseUrl + '#acceso\nPortal de la UMA: ' + enrollmentPortal,
      url: courseUrl + '#acceso',
      tentative: true,
    }));
    return [...(classes ? [classEvent] : []), ...(deadlines ? deadlineEvents : [])];
  }).sort((left, right) => left.date.localeCompare(right.date));

  const lines = [
    'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Praxis//Calendario//ES', 'CALSCALE:GREGORIAN',
    'X-WR-CALNAME:Praxis Fisioformación',
    ...entries.flatMap(event => [
      'BEGIN:VEVENT', 'UID:' + event.uid, 'DTSTAMP:' + timestamp,
      'DTSTART;VALUE=DATE:' + compact(event.date), 'DTEND;VALUE=DATE:' + compact(dayAfter(event.end ?? event.date)),
      'SUMMARY:' + escapeText(event.title), 'DESCRIPTION:' + escapeText(event.description), 'URL:' + event.url,
      ...(event.location ? ['LOCATION:' + escapeText(event.location)] : []),
      ...(event.tentative ? ['STATUS:TENTATIVE', 'TRANSP:TRANSPARENT'] : []),
      'END:VEVENT',
    ]),
    'END:VCALENDAR', '',
  ];
  return new Response(lines.map(foldLine).join('\r\n'), {
    headers: { 'Content-Type': 'text/calendar; charset=utf-8' },
  });
}

export function calendarBase(site) {
  return new URL(import.meta.env.BASE_URL.replace(/\/$/, '') + '/', site);
}
