import courses from '../data/cursos.json';
export function GET({site}) {
 const base=new URL(import.meta.env.BASE_URL.replace(/\/$/,'')+'/',site);
 return new Response('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'+['',...courses.map(c=>'cursos/'+c.slug+'/')].map(path=>'<url><loc>'+new URL(path,base)+'</loc></url>').join('')+'</urlset>');
}
