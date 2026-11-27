import {defineConfig} from 'astro/config';
const url = new URL(process.env.PAGE_URL || 'https://elfisiologico.github.io/praxis-fisioformacion/');
export default defineConfig({site:url.origin, base:url.pathname, trailingSlash:'always'});
