import courses from '../../data/cursos.json';
import { calendarBase, calendarResponse } from '../../lib/calendar.js';

export function GET({ site }) {
  return calendarResponse(courses, calendarBase(site));
}
