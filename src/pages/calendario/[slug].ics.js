import courses from '../../data/cursos.json';
export function getStaticPaths(){return courses.map(c=>({params:{slug:c.slug},props:{c}}))}
export function GET({props:{c}}){
 const compact=d=>d.toISOString().slice(0,10).replaceAll('-','');
 const end=new Date(c.end);end.setUTCDate(end.getUTCDate()+1);
 return new Response(['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//Praxis//Cursos//ES','BEGIN:VEVENT','UID:'+c.code+'-2027@praxis','DTSTAMP:'+new Date().toISOString().replace(/[-:]/g,'').replace(/\.\d{3}/,''),'DTSTART;VALUE=DATE:'+compact(new Date(c.start)),'DTEND;VALUE=DATE:'+compact(end),'SUMMARY:'+c.short,'LOCATION:Facultad de Ciencias de la Salud UMA','END:VEVENT','END:VCALENDAR',''].join('\r\n'));
}
