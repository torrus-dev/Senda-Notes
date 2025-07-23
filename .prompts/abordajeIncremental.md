## Orden de Abordaje Incremental:

### **Fase 1: Eliminar Auto-guardado** (Más simple, menos breaking)
Eliminar el $effect de auto-guardado en LocalStorageAdapter y JsonFileAdapter. 
Implementar guardado manual mediante método save(). 
Para accionar el guardado (me encargo yo)
- Repositories de UI simple (sidebar, theme, collapsibles), llamar save() directamente en los setters del repository. 
- Para repositories de lógica de negocio (notes, properties), NO poner save() en los métodos del repository, sino que los UseCases deben llamar save() explícitamente después de las modificaciones. Esto permite operaciones batch eficientes y transacciones coordinadas entre múltiples repositories en los casos de uso complejos, mientras mantiene la simplicidad para estados de UI básicos.

### **Fase 2: Separar Repository de Adapter** (Refactor estructural)
1. Crear interfaz `PersistenceAdapter` con métodos básicos
2. Repositories dejan de heredar, ahora reciben adapter por constructor
3. Mover `data` de adapter a repository (aún todo en memoria)
4. **Validar**: Misma funcionalidad pero arquitectura más limpia

### **Fase 3: Implementar Cache Parcial** (Más complejo)
1. Crear sistema de cache reactivo básico
2. Modificar repositories para usar cache en vez de `data` completo
3. Implementar carga bajo demanda en métodos de consulta
4. **Validar**: Mejor rendimiento en inicio

### **Fase 4: Optimizar Inicialización** (Refinamiento)
1. Simplificar StartupManager
2. Cargar solo metadatos esenciales al inicio
3. Lazy loading para el resto
4. **Validar**: Inicio más rápido

**Ventaja de este orden**: Cada fase es funcional y probada antes de pasar a la siguiente. Puedes detenerte en cualquier fase si la complejidad no compensa.