# Exposición guiada de Jiw 5G

## Propósito

Driver.js se utiliza como capa narrativa de la sustentación, no como reemplazo del dashboard. El objetivo es conducir al público desde la intuición hasta la evidencia experimental sin convertir la presentación en una secuencia de diapositivas separadas del producto.

## Capas pedagógicas

```text
Driver.js          → narrativa y orden de la exposición
Blendy             → profundización en un módulo
Hover / popovers   → vocabulario y definiciones
Dashboard          → ejecución individual
/experimentos      → evidencia replicada
```

## Exposición completa

El recorrido cubre:

1. presentación del problema;
2. alcance del modelo;
3. configuración y comparación justa;
4. mMTC;
5. explicación pedagógica mMTC mediante Blendy;
6. detección de riesgo;
7. URLLC;
8. trade-off;
9. escenarios;
10. LIVE y presets de Bogotá;
11. transformación TomTom → contexto Jiw;
12. REPLAY;
13. transición a `/experimentos`;
14. seeds y réplicas;
15. ejecución de una demostración replicada;
16. resultados y exportación;
17. conclusión.

## Interacciones intencionales

Algunos pasos no muestran botón `Siguiente`: el usuario debe hacer clic en el elemento resaltado. Esto se usa para:

- abrir Blendy;
- cerrar Blendy;
- cambiar a LIVE;
- cambiar a REPLAY;
- ejecutar el laboratorio experimental.

El paso siguiente espera a que aparezca el contenido dinámico cuando sea necesario.

## Navegación entre páginas

El tour principal guarda un indicador efímero en `sessionStorage` antes de navegar a `/experimentos?tour=full`. La página experimental consume dicho indicador, limpia el query string y continúa el segundo capítulo. No se guarda información académica ni resultados en el navegador para esta función.

## Alcance

La capa Driver.js no modifica:

- PRNG;
- mMTC;
- URLLC;
- escenarios;
- métricas;
- TomTom provider;
- Replay;
- resultados experimentales.

Es exclusivamente una capa de presentación.
