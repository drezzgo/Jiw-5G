# FASE 9A — Dashboard pedagógico de Jiw 5G

## Objetivo

La interfaz de Jiw 5G debe ser legible por dos públicos simultáneos:

1. una persona sin formación previa en redes 5G, que necesita entender qué ocurre y por qué importa;
2. una persona técnica, que necesita inspeccionar el modelo, los supuestos y el código que implementa cada mecanismo.

Esta fase **no modifica el Simulation Engine** ni las fórmulas experimentales. Añade una capa de explicación sobre resultados ya calculados.

## Dos niveles de explicación

### Popovers de términos

Los términos técnicos principales se muestran con una ayuda contextual que contiene:

- una explicación en palabras simples;
- una explicación técnica específica de Jiw 5G;
- la categoría académica de la información.

Las categorías utilizadas son:

- `CONCEPTO`;
- `DATO_EXTERNO`;
- `PARAMETRO_EXPERIMENTAL`;
- `RESULTADO_SIMULADO`;
- `SUPUESTO_MODELO`.

### Tarjetas expandibles

Los módulos centrales incluyen `Explorar cómo funciona`. La tarjeta original se transforma en una explicación ampliada mediante **Blendy**.

Cada explicación contiene:

- resumen para audiencia general;
- descripción técnica;
- flujo paso a paso;
- fragmento curado de código real;
- enlace al archivo completo en GitHub;
- evidencia de la ejecución actualmente visible;
- supuestos o parámetros que deben distinguirse académicamente.

## Módulos explicables

La primera iteración cubre:

1. contexto de tráfico y mapping;
2. detección de riesgo;
3. mMTC baseline/proposed;
4. URLLC baseline/proposed;
5. comparación experimental beneficio/costo.

## Por qué los snippets son curados

El dashboard no intenta reemplazar el repositorio ni mostrar archivos completos. Para una sustentación, el objetivo es mostrar únicamente las líneas que explican el mecanismo seleccionado. El archivo original permanece enlazado desde GitHub para auditoría completa.

## Blendy

Blendy se utiliza únicamente en la capa visual. No participa en simulación, generación de métricas, tráfico LIVE/REPLAY ni reproducibilidad.

La implementación respeta la estructura `data-blendy-from` / `data-blendy-to` y mantiene una alternativa sin animación cuando el sistema indica `prefers-reduced-motion`.

## Accesibilidad

- los términos usan controles nativos `details/summary` operables por teclado;
- la explicación expandida utiliza `role="dialog"` y `aria-modal="true"`;
- `Escape` cierra el diálogo;
- se bloquea el scroll de fondo mientras el diálogo está abierto;
- `prefers-reduced-motion` evita depender de la animación para usar la función.

## Restricción académica

La capa pedagógica no debe convertir parámetros experimentales en estándares ni resultados de simulación en mediciones reales. Las explicaciones conservan explícitamente la distinción entre dato externo, parámetro, supuesto y resultado.
