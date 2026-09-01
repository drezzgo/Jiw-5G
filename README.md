## Sobre el nombre Jiw 5G

Jiw 5G adopta su nombre como una referencia al pueblo Jiw presente en la
región del Guaviare, Colombia. El nombre busca darle al proyecto una identidad
territorial y latinoamericana, en lugar de recurrir innecesariamente a una
denominación íntegramente en inglés.

La relación con el proyecto también parte del concepto de movilidad peatonal,
ya que el sistema estudia un escenario de protección de personas que transitan
por un cruce escolar.

## Estado

**FASE 1 implementada:** motor determinista TypeScript, PRNG con seed, escenarios configurables, detección de evento crítico, EventBus local, logs reproducibles y preview web.

Las estrategias de red mMTC/URLLC están especificadas, pero su simulación detallada corresponde a FASES 2 y 3.

## Requisitos

- Node.js 20.9 o superior.
- npm.

## Ejecución local

```bash
npm install
npm run dev
```

Abrir `http://localhost:3000`.

## Pruebas

Después de `npm install`:

```bash
npm test
```

También existe una validación de FASE 1 sin Vitest en tiempo de ejecución:

```bash
npm run test:phase1
```

## Variables de entorno

Copiar `.env.example` a `.env.local` únicamente cuando se implemente LIVE:

```bash
TOMTOM_API_KEY=
```

Nunca usar `NEXT_PUBLIC_TOMTOM_API_KEY` ni subir claves al repositorio.

## Modos de datos

- `DEMO`: datos sintéticos reproducibles.
- `REPLAY`: snapshot/archivo previamente guardado.
- `LIVE`: proveedor externo por `/api/traffic`; integración TomTom se realizará en FASE 7.

Todos implementan el mismo contrato `TrafficDataProvider`.

## Estructura

- `src/simulation`: núcleo TypeScript puro.
- `src/traffic`: proveedores y tipos de contexto vial.
- `src/app`: interfaz Next.js y API routes.
- `docs/MODEL_SPEC.md`: decisiones, métricas y supuestos académicos.

## Nota sobre `package-lock.json`

Este entorno de generación no tuvo acceso al registry de npm para resolver el árbol transitivo. Se incluye el lockfile raíz solicitado; al ejecutar `npm install` con conectividad, npm completará/normalizará el árbol transitivo. Después de esa primera instalación, debe versionarse el `package-lock.json` resultante para congelar exactamente dependencias del proyecto.
