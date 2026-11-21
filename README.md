# Cancionero

Aplicación web ligera y adaptada a móviles para elegir una canción por su número y leer la letra cómodamente mientras se canta en grupo.

## Características

- **Acceso rápido por número o título**: escribe el número de la canción (por ejemplo `4`) o busca por título desde la portada.
- **Índice numerado**: lista de canciones ordenadas y fáciles de pulsar en teléfonos y tabletas.
- **Controles de lectura al cantar**:
  - Ajuste de tamaño de letra (`A-` / `A+`) guardado automáticamente en el navegador.
  - Modo día y modo noche cálido guardado entre sesiones.
  - Bloqueo de pantalla encendida (*Screen Wake Lock API*, en navegadores compatibles).
  - Navegación directa entre canciones (`Anterior` / `Siguiente`, atajos de teclado `←` / `→` y selector rápido `#N`).
  - Enlaces directos compartibles por canción (por ejemplo `#/4`).

## Desarrollo local

```bash
npm install
npm run dev
```

Para comprobar los tests y generar la versión estática de producción:

```bash
npm test
npm run build
```

## Cómo añadir o editar canciones

Todas las canciones se encuentran en [`src/data/songs.json`](src/data/songs.json). Cada elemento sigue esta estructura:

```json
{
  "number": 29,
  "title": "Mi nueva canción",
  "chorusStanzas": [1],
  "stanzas": [
    [
      "Primer verso de la primera estrofa,",
      "segundo verso de la primera estrofa."
    ],
    [
      "Primer verso del estribillo,",
      "segundo verso del estribillo."
    ]
  ]
}
```

1. Añade un objeto nuevo al arreglo JSON con un `number` único, `title`, `stanzas` (arreglo de arreglos de versos) y opcionalmente `chorusStanzas` (índices basados en 0 de las estrofas de estribillo).
2. Guarda el archivo y vuelve a ejecutar `npm run build`.

## Despliegue estático

La configuración de Vite usa `base: './'`, por lo que la carpeta `dist/` generada por `npm run build` funciona directamente en **GitHub Pages** (incluso bajo una subruta de repositorio), **Netlify** o **Vercel** sin pasos adicionales.
