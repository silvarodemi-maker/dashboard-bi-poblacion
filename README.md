# Sistema de Inteligencia de Negocios para el Análisis Multidimensional de Indicadores de Población de México

## Descripción
Sistema de Business Intelligence que analiza indicadores demográficos de las 32 entidades federativas de México mediante un Dashboard interactivo, Cubo OLAP simulado, detección de anomalías y modelo matemático.

## Estructura del Proyecto
```
dashboard_bi/
├── index.html          # Dashboard principal (abrir este archivo)
├── report.html         # Informe académico completo
├── style.css           # Estilos del dashboard
├── data.js             # Datos simulados y DataManager
├── app.js              # Lógica de la aplicación (filtros, KPIs, OLAP, gráficas)
└── README.md           # Este archivo
```

## Requisitos
- Navegador web moderno (Chrome, Firefox, Edge, Safari)
- Conexión a internet (para cargar Chart.js desde CDN)
- No se requiere servidor local ni instalación

## Instrucciones de Ejecución

### Opción 1: Abrir directamente
1. Navegar hasta la carpeta `dashboard_bi/`
2. Hacer doble clic en `index.html`
3. El dashboard se abrirá en el navegador predeterminado

### Opción 2: Desde la línea de comandos
```bash
# Windows
start index.html

# macOS
open index.html

# Linux
xdg-open index.html
```

### Opción 3: Servidor local (opcional)
```bash
# Con Python
python -m http.server 8000

# Luego abrir en el navegador:
# http://localhost:8000
```

## Funcionalidades del Dashboard

### Pestañas
- **Dashboard Ejecutivo**: KPIs, gráficas y análisis general
- **Cubo OLAP**: Tabla pivote con operaciones drill-down, roll-up, slice, dice, pivot
- **Anomalías**: Detección automática de valores atípicos mediante Z-score
- **Informe**: Hallazgos, interpretación y matriz de decisiones

### Filtros
- Año (2018-2023)
- Trimestre (1-4)
- Mes (1-12)
- Entidad Federativa (32 estados)
- Región (Norte, Centro, Occidente, Oriente, Sur, Bajío)
- Indicador (6 indicadores)
- Botón "Limpiar Filtros" para resetear

### KPIs
1. Valor Total
2. Promedio
3. Meta
4. Cumplimiento (%)
5. Variación (%)
6. Mejor Región
7. Peor Región
8. Mejor Entidad
9. Entidad con Menor Desempeño

### Gráficas
1. Evolución Temporal (líneas)
2. Comparación por Región (barras)
3. Top 15 Entidades (barras horizontales)
4. Comparación de Indicadores (radar)
5. Distribución de Cumplimiento (dona)
6. Variación por Entidad (barras)

## Informe Académico
Abrir `report.html` en el navegador para ver el informe completo con:
- Portada editable
- Introducción teórica
- Problemática empresarial
- Modelo dimensional (esquema estrella)
- Documentación ETL
- Modelo matemático
- Referencias APA 7

## Datos
Los datos son **SIMULADOS** con fines académicos, basados en patrones reales del INEGI (Instituto Nacional de Estadística y Geografía). La estructura y metodología son representativas de un proyecto real de Business Intelligence.

## Tecnologías Utilizadas
- HTML5 / CSS3 / JavaScript (ES6+)
- Chart.js (vía CDN) para visualización de datos
- Diseño responsive (escritorio y tablet)
- Sin dependencias de framework ( Vanilla JS)

## Autor
Proyecto académico - Agosto 2026
