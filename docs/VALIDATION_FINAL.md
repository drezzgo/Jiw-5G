# Validación final

## 1. Automatizada

Antes de etiquetar la release ejecutar:

```powershell
pnpm run test:phase1
pnpm test
pnpm build
```

Resultado esperado:

```text
sin tests fallidos
sin errores TypeScript
sin errores de producción Next.js
```

El warning local de `engines` con Node 26 no representa por sí mismo un fallo del proyecto si las validaciones anteriores pasan; la configuración estable declara Node 24.x para deployment.

## 2. Dashboard principal

- [ ] carga `/`
- [ ] permite ejecutar una simulación DEMO
- [ ] cambio de escenario funciona
- [ ] seed modifica la realización
- [ ] métricas mMTC aparecen
- [ ] métricas URLLC aparecen cuando existen eventos
- [ ] exportación JSON individual funciona
- [ ] exportación CSV individual funciona
- [ ] popovers conceptuales funcionan
- [ ] hover/focus de términos en inglés funciona
- [ ] tarjetas Blendy abren y cierran
- [ ] Escape cierra el diálogo
- [ ] modo presentación funciona

## 3. REPLAY

- [ ] carga ejemplo normal
- [ ] carga ejemplo de congestión
- [ ] carga archivo local válido
- [ ] rechazo de Replay inválido produce error comprensible
- [ ] misma seed + mismo Replay reproduce métricas

## 4. LIVE

- [ ] `/api/traffic` responde con coordenadas válidas
- [ ] API key no aparece en frontend
- [ ] LIVE usable desde dashboard
- [ ] guardar LIVE como Replay funciona
- [ ] al retirar/invalidar temporalmente la key, LIVE falla de forma explícita
- [ ] DEMO y REPLAY siguen funcionando durante fallo LIVE

## 5. Laboratorio experimental

- [ ] carga `/experimentos`
- [ ] preset matriz principal funciona
- [ ] preset escalabilidad funciona
- [ ] total de ejecuciones mostrado es correcto
- [ ] CSV crudo exporta dos estrategias por ejecución
- [ ] CSV agregado exporta una fila por grupo
- [ ] JSON auditable exporta sin logs masivos
- [ ] gráficos SVG se renderizan

## 6. Revisión académica

- [ ] no se llama “joules” a `energyProxy`
- [ ] no se atribuyen umbrales Jiw a TomTom
- [ ] no se afirma modelado completo 3GPP
- [ ] Ruta A/B se describe como supuesto experimental
- [ ] umbral de reliability se describe como experimental
- [ ] resultados se expresan “bajo los parámetros del modelo”
- [ ] limitación de agregación URLLC sin eventos está documentada

## 7. Vercel

- [ ] Preview de rama final pasa
- [ ] Production carga
- [ ] variable `TOMTOM_API_KEY` configurada en entorno adecuado
- [ ] no existe `NEXT_PUBLIC_TOMTOM_API_KEY`
- [ ] no se expone `.env.local`

## 8. Release

Después de merge a `main`:

```powershell
git switch main
git pull origin main
git status
```

El working tree debe estar limpio.

Crear tag:

```powershell
git tag -a v1.0.0 -m "Jiw 5G academic simulator v1.0.0"
git push origin v1.0.0
```
