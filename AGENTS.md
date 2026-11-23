# AGENTS.md

Sitio web estático (HTML/CSS/JS), sin build, sin gestor de paquetes, sin tests ni linter.

## Convenciones
- Código (variables, funciones, ids, clases de datos, comentarios) y mensajes de commit en inglés; textos visibles para el usuario en español.

## Estructura
- `index.html`: página principal ("En Construcción"). Estilos inline en `<style>`, Tailwind y Lucide por CDN.
- `style.css`, `script.js`: estilos y scripts globales (scroll suave para enlaces `#ancla`, `lucide.createIcons()`).
- `playground/*.html`: páginas independientes, no enlazadas desde el index.
- `design/`, `assets/`: recursos (ver contenido antes de asumir su uso).

## Despliegue
- `.cpanel.yml` copia con `cp -R *` todo el contenido de la raíz a `/home/melodico/public_html` en cPanel.
- Cualquier archivo que añadas a la raíz se publica. No dejes ahí material privado ni temporal.

## Verificación
- No hay comandos de build, test ni lint. Para verificar, abre el HTML en el navegador.
- Los CDN (Tailwind, Lucide, Google Fonts) requieren conexión a internet.
