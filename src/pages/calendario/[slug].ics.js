import courses from '../../data/cursos.json';
import { calendarBase, calendarResponse } from '../../lib/calendar.js';

export function getStaticPaths() {
  return courses.flatMap(course => [
    { params: { slug: course.slug }, props: { course, includeDeadlines: false } },
    { params: { slug: course.slug + '-inscripcion' }, props: { course, includeDeadlines: true } },
  ]);
}

export function GET({ props: { course, includeDeadlines }, site }) {
  return calendarResponse([course], calendarBase(site), { classes: !includeDeadlines, deadlines: includeDeadlines });
}
