# AGENTS.md

Sitio web estático (HTML/CSS/JS), sin build, sin gestor de paquetes, sin tests ni linter.

## Convenciones
- Código (variables, funciones, ids, clases de datos, comentarios) y mensajes de commit en inglés; textos visibles para el usuario en español.

## Estructura
- `index.html`: página principal con el enlace a la tienda (`design.melodico.net`, hospedada aparte). Estilos inline en `<style>` y Google Fonts por CDN.
- `assets/images/`: logos e iconos usados por el index.

## Despliegue
- `.cpanel.yml` copia con `cp -R *` todo el contenido de la raíz a `/home/melodico/public_html` en cPanel.
- Cualquier archivo que añadas a la raíz se publica. No dejes ahí material privado ni temporal.

## Verificación
- No hay comandos de build, test ni lint. Para verificar, abre el HTML en el navegador.
- Los CDN (Google Fonts) requieren conexión a internet.
