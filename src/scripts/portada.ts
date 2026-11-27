const canAnimate = () => !matchMedia('(prefers-reduced-motion: reduce)').matches;
const rows = [...document.querySelectorAll<HTMLAnchorElement>('.agenda [data-category]')];

function revealRows(visibleRows: HTMLAnchorElement[]) {
  if (!canAnimate() || !Element.prototype.animate) return;
  visibleRows.forEach((row, index) => row.animate(
    [{ opacity: 0.55, transform: 'translateY(12px)' }, { opacity: 1, transform: 'translateY(0)' }],
    { duration: 290, delay: index * 55, easing: 'ease-out', fill: 'backwards' },
  ));
}

const filters = document.querySelector<HTMLElement>('.agenda-filters');
const status = document.querySelector('#agenda-status');
const buttons = [...(filters?.querySelectorAll<HTMLButtonElement>('button') ?? [])];

buttons.forEach((button, index) => {
  button.addEventListener('click', () => {
    buttons.forEach(item => item.setAttribute('aria-pressed', String(item === button)));
    filters?.style.setProperty('--filter-index', String(index));
    const category = button.dataset.filter;
    for (const row of rows) row.hidden = category !== 'todas' && row.dataset.category !== category;
    const visibleRows = rows.filter(row => !row.hidden);
    if (status) status.textContent = visibleRows.length === 1 ? '1 curso visible' : visibleRows.length + ' cursos visibles';
    revealRows(visibleRows);
  });
});

if (filters && buttons.length) filters.hidden = false;

if ('IntersectionObserver' in window) {
  const container = document.querySelector('.agenda');
  const counter = document.querySelector<HTMLElement>('[data-count]');
  const observer = new IntersectionObserver(entries => {
    for (const { target, isIntersecting } of entries) {
      if (!isIntersecting) continue;
      observer.unobserve(target);
      if (target === container) revealRows(rows.filter(row => !row.hidden));
      if (counter && target === counter && canAnimate()) {
        const total = Number(counter.dataset.count);
        const start = performance.now();
        const count = (now: number) => {
          const elapsed = Math.min(1, (now - start) / 550);
          counter.textContent = String(Math.floor(elapsed * total));
          if (elapsed < 1) requestAnimationFrame(count);
        };
        requestAnimationFrame(count);
      }
    }
  });
  if (container) observer.observe(container);
  if (counter) observer.observe(counter);
}

const form = document.querySelector<HTMLFormElement>('#enrollment-alert');
const confirmation = document.querySelector<HTMLElement>('#alert-confirmation');
if (form && confirmation) {
  const button = form.querySelector<HTMLButtonElement>('button[type="submit"]');
  const error = form.querySelector('.form-error');
  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (!button || button.disabled) return;
    const data = new FormData(form);
    button.disabled = true;
    button.textContent = 'Enviando solicitud…';
    if (error) error.textContent = '';
    try {
      const response = await fetch(form.action, {
        method: 'POST',
        body: data,
        headers: { Accept: 'application/json' },
      });
      if (!response.ok) throw new Error();
      form.hidden = true;
      confirmation.hidden = false;
      confirmation.focus();
    } catch {
      if (error) error.textContent = 'No se ha podido confirmar la solicitud. Puedes volver a intentarlo.';
    } finally {
      button.disabled = false;
      button.textContent = 'Recibir aviso de matrícula';
    }
  });
}

const copyCalendar = document.querySelector<HTMLButtonElement>('[data-calendar-copy]');
const calendarUrl = document.querySelector<HTMLInputElement>('#calendar-url');
const calendarCopyStatus = document.querySelector('#calendar-copy-status');

if (copyCalendar && calendarUrl && calendarCopyStatus && navigator.clipboard) {
  copyCalendar.hidden = false;
  copyCalendar.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(calendarUrl.value);
      calendarCopyStatus.textContent = 'Enlace copiado.';
    } catch {
      calendarUrl.select();
      calendarCopyStatus.textContent = 'Enlace seleccionado. Puedes copiarlo manualmente.';
    }
  });
}
