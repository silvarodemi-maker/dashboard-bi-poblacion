/**
 * data.js - Datos del proyecto BI de Población y Normalización
 * 
 * DATOS SIMULADOS basados en patrones reales del INEGI (2018-2023)
 * Fuente real de referencia: Censos de Población INEGI / CONAPO
 * NOTA: Los valores son simulados con fines académicos.
 */

const DIMENSIONES = {
  tiempo: [
    { id_tiempo: 1, anio: 2018, trimestre: 1, mes: 1, periodo: "2018-T1" },
    { id_tiempo: 2, anio: 2018, trimestre: 1, mes: 2, periodo: "2018-T1" },
    { id_tiempo: 3, anio: 2018, trimestre: 1, mes: 3, periodo: "2018-T1" },
    { id_tiempo: 4, anio: 2018, trimestre: 2, mes: 4, periodo: "2018-T2" },
    { id_tiempo: 5, anio: 2018, trimestre: 2, mes: 5, periodo: "2018-T2" },
    { id_tiempo: 6, anio: 2018, trimestre: 2, mes: 6, periodo: "2018-T2" },
    { id_tiempo: 7, anio: 2018, trimestre: 3, mes: 7, periodo: "2018-T3" },
    { id_tiempo: 8, anio: 2018, trimestre: 3, mes: 8, periodo: "2018-T3" },
    { id_tiempo: 9, anio: 2018, trimestre: 3, mes: 9, periodo: "2018-T3" },
    { id_tiempo: 10, anio: 2018, trimestre: 4, mes: 10, periodo: "2018-T4" },
    { id_tiempo: 11, anio: 2018, trimestre: 4, mes: 11, periodo: "2018-T4" },
    { id_tiempo: 12, anio: 2018, trimestre: 4, mes: 12, periodo: "2018-T4" },
    { id_tiempo: 13, anio: 2019, trimestre: 1, mes: 1, periodo: "2019-T1" },
    { id_tiempo: 14, anio: 2019, trimestre: 1, mes: 2, periodo: "2019-T1" },
    { id_tiempo: 15, anio: 2019, trimestre: 1, mes: 3, periodo: "2019-T1" },
    { id_tiempo: 16, anio: 2019, trimestre: 2, mes: 4, periodo: "2019-T2" },
    { id_tiempo: 17, anio: 2019, trimestre: 2, mes: 5, periodo: "2019-T2" },
    { id_tiempo: 18, anio: 2019, trimestre: 2, mes: 6, periodo: "2019-T2" },
    { id_tiempo: 19, anio: 2019, trimestre: 3, mes: 7, periodo: "2019-T3" },
    { id_tiempo: 20, anio: 2019, trimestre: 3, mes: 8, periodo: "2019-T3" },
    { id_tiempo: 21, anio: 2019, trimestre: 3, mes: 9, periodo: "2019-T3" },
    { id_tiempo: 22, anio: 2019, trimestre: 4, mes: 10, periodo: "2019-T4" },
    { id_tiempo: 23, anio: 2019, trimestre: 4, mes: 11, periodo: "2019-T4" },
    { id_tiempo: 24, anio: 2019, trimestre: 4, mes: 12, periodo: "2019-T4" },
    { id_tiempo: 25, anio: 2020, trimestre: 1, mes: 1, periodo: "2020-T1" },
    { id_tiempo: 26, anio: 2020, trimestre: 1, mes: 2, periodo: "2020-T1" },
    { id_tiempo: 27, anio: 2020, trimestre: 1, mes: 3, periodo: "2020-T1" },
    { id_tiempo: 28, anio: 2020, trimestre: 2, mes: 4, periodo: "2020-T2" },
    { id_tiempo: 29, anio: 2020, trimestre: 2, mes: 5, periodo: "2020-T2" },
    { id_tiempo: 30, anio: 2020, trimestre: 2, mes: 6, periodo: "2020-T2" },
    { id_tiempo: 31, anio: 2020, trimestre: 3, mes: 7, periodo: "2020-T3" },
    { id_tiempo: 32, anio: 2020, trimestre: 3, mes: 8, periodo: "2020-T3" },
    { id_tiempo: 33, anio: 2020, trimestre: 3, mes: 9, periodo: "2020-T3" },
    { id_tiempo: 34, anio: 2020, trimestre: 4, mes: 10, periodo: "2020-T4" },
    { id_tiempo: 35, anio: 2020, trimestre: 4, mes: 11, periodo: "2020-T4" },
    { id_tiempo: 36, anio: 2020, trimestre: 4, mes: 12, periodo: "2020-T4" },
    { id_tiempo: 37, anio: 2021, trimestre: 1, mes: 1, periodo: "2021-T1" },
    { id_tiempo: 38, anio: 2021, trimestre: 1, mes: 2, periodo: "2021-T1" },
    { id_tiempo: 39, anio: 2021, trimestre: 1, mes: 3, periodo: "2021-T1" },
    { id_tiempo: 40, anio: 2021, trimestre: 2, mes: 4, periodo: "2021-T2" },
    { id_tiempo: 41, anio: 2021, trimestre: 2, mes: 5, periodo: "2021-T2" },
    { id_tiempo: 42, anio: 2021, trimestre: 2, mes: 6, periodo: "2021-T2" },
    { id_tiempo: 43, anio: 2021, trimestre: 3, mes: 7, periodo: "2021-T3" },
    { id_tiempo: 44, anio: 2021, trimestre: 3, mes: 8, periodo: "2021-T3" },
    { id_tiempo: 45, anio: 2021, trimestre: 3, mes: 9, periodo: "2021-T3" },
    { id_tiempo: 46, anio: 2021, trimestre: 4, mes: 10, periodo: "2021-T4" },
    { id_tiempo: 47, anio: 2021, trimestre: 4, mes: 11, periodo: "2021-T4" },
    { id_tiempo: 48, anio: 2021, trimestre: 4, mes: 12, periodo: "2021-T4" },
    { id_tiempo: 49, anio: 2022, trimestre: 1, mes: 1, periodo: "2022-T1" },
    { id_tiempo: 50, anio: 2022, trimestre: 1, mes: 2, periodo: "2022-T1" },
    { id_tiempo: 51, anio: 2022, trimestre: 1, mes: 3, periodo: "2022-T1" },
    { id_tiempo: 52, anio: 2022, trimestre: 2, mes: 4, periodo: "2022-T2" },
    { id_tiempo: 53, anio: 2022, trimestre: 2, mes: 5, periodo: "2022-T2" },
    { id_tiempo: 54, anio: 2022, trimestre: 2, mes: 6, periodo: "2022-T2" },
    { id_tiempo: 55, anio: 2022, trimestre: 3, mes: 7, periodo: "2022-T3" },
    { id_tiempo: 56, anio: 2022, trimestre: 3, mes: 8, periodo: "2022-T3" },
    { id_tiempo: 57, anio: 2022, trimestre: 3, mes: 9, periodo: "2022-T3" },
    { id_tiempo: 58, anio: 2022, trimestre: 4, mes: 10, periodo: "2022-T4" },
    { id_tiempo: 59, anio: 2022, trimestre: 4, mes: 11, periodo: "2022-T4" },
    { id_tiempo: 60, anio: 2022, trimestre: 4, mes: 12, periodo: "2022-T4" },
    { id_tiempo: 61, anio: 2023, trimestre: 1, mes: 1, periodo: "2023-T1" },
    { id_tiempo: 62, anio: 2023, trimestre: 1, mes: 2, periodo: "2023-T1" },
    { id_tiempo: 63, anio: 2023, trimestre: 1, mes: 3, periodo: "2023-T1" },
    { id_tiempo: 64, anio: 2023, trimestre: 2, mes: 4, periodo: "2023-T2" },
    { id_tiempo: 65, anio: 2023, trimestre: 2, mes: 5, periodo: "2023-T2" },
    { id_tiempo: 66, anio: 2023, trimestre: 2, mes: 6, periodo: "2023-T2" },
    { id_tiempo: 67, anio: 2023, trimestre: 3, mes: 7, periodo: "2023-T3" },
    { id_tiempo: 68, anio: 2023, trimestre: 3, mes: 8, periodo: "2023-T3" },
    { id_tiempo: 69, anio: 2023, trimestre: 3, mes: 9, periodo: "2023-T3" },
    { id_tiempo: 70, anio: 2023, trimestre: 4, mes: 10, periodo: "2023-T4" },
    { id_tiempo: 71, anio: 2023, trimestre: 4, mes: 11, periodo: "2023-T4" },
    { id_tiempo: 72, anio: 2023, trimestre: 4, mes: 12, periodo: "2023-T4" }
  ],

  entidad: [
    { id_entidad: 1, entidad: "Aguascalientes", clave_entidad: "01", region: "Occidente" },
    { id_entidad: 2, entidad: "Baja California", clave_entidad: "02", region: "Norte" },
    { id_entidad: 3, entidad: "Baja California Sur", clave_entidad: "03", region: "Norte" },
    { id_entidad: 4, entidad: "Campeche", clave_entidad: "04", region: "Oriente" },
    { id_entidad: 5, entidad: "Coahuila", clave_entidad: "05", region: "Norte" },
    { id_entidad: 6, entidad: "Colima", clave_entidad: "06", region: "Occidente" },
    { id_entidad: 7, entidad: "Chiapas", clave_entidad: "07", region: "Sur" },
    { id_entidad: 8, entidad: "Chihuahua", clave_entidad: "08", region: "Norte" },
    { id_entidad: 9, entidad: "Ciudad de México", clave_entidad: "09", region: "Centro" },
    { id_entidad: 10, entidad: "Durango", clave_entidad: "10", region: "Norte" },
    { id_entidad: 11, entidad: "Guanajuato", clave_entidad: "11", region: "Bajío" },
    { id_entidad: 12, entidad: "Guerrero", clave_entidad: "12", region: "Sur" },
    { id_entidad: 13, entidad: "Hidalgo", clave_entidad: "13", region: "Centro" },
    { id_entidad: 14, entidad: "Jalisco", clave_entidad: "14", region: "Occidente" },
    { id_entidad: 15, entidad: "México", clave_entidad: "15", region: "Centro" },
    { id_entidad: 16, entidad: "Michoacán", clave_entidad: "16", region: "Occidente" },
    { id_entidad: 17, entidad: "Morelos", clave_entidad: "17", region: "Centro" },
    { id_entidad: 18, entidad: "Nayarit", clave_entidad: "18", region: "Occidente" },
    { id_entidad: 19, entidad: "Nuevo León", clave_entidad: "19", region: "Norte" },
    { id_entidad: 20, entidad: "Oaxaca", clave_entidad: "20", region: "Sur" },
    { id_entidad: 21, entidad: "Puebla", clave_entidad: "21", region: "Centro" },
    { id_entidad: 22, entidad: "Querétaro", clave_entidad: "22", region: "Bajío" },
    { id_entidad: 23, entidad: "Quintana Roo", clave_entidad: "23", region: "Oriente" },
    { id_entidad: 24, entidad: "San Luis Potosí", clave_entidad: "24", region: "Bajío" },
    { id_entidad: 25, entidad: "Sinaloa", clave_entidad: "25", region: "Norte" },
    { id_entidad: 26, entidad: "Sonora", clave_entidad: "26", region: "Norte" },
    { id_entidad: 27, entidad: "Tabasco", clave_entidad: "27", region: "Oriente" },
    { id_entidad: 28, entidad: "Tamaulipas", clave_entidad: "28", region: "Norte" },
    { id_entidad: 29, entidad: "Tlaxcala", clave_entidad: "29", region: "Centro" },
    { id_entidad: 30, entidad: "Veracruz", clave_entidad: "30", region: "Oriente" },
    { id_entidad: 31, entidad: "Yucatán", clave_entidad: "31", region: "Oriente" },
    { id_entidad: 32, entidad: "Zacatecas", clave_entidad: "32", region: "Bajío" }
  ],

  region: [
    { id_region: 1, region: "Norte" },
    { id_region: 2, region: "Centro" },
    { id_region: 3, region: "Occidente" },
    { id_region: 4, region: "Oriente" },
    { id_region: 5, region: "Sur" },
    { id_region: 6, region: "Bajío" }
  ],

  indicador: [
    { id_indicador: 1, indicador: "Población Total", categoria: "Demográfico", unidad_medida: "Miles de habitantes" },
    { id_indicador: 2, indicador: "Densidad de Población", categoria: "Demográfico", unidad_medida: "Hab/km²" },
    { id_indicador: 3, indicador: "Tasa de Natalidad", categoria: "Demográfico", unidad_medida: "Por mil habitantes" },
    { id_indicador: 4, indicador: "Tasa de Mortalidad", categoria: "Demográfico", unidad_medida: "Por mil habitantes" },
    { id_indicador: 5, indicador: "Índice de Normalización BI", categoria: "Business Intelligence", unidad_medida: "Índice 0-100" },
    { id_indicador: 6, indicador: "Tasa de Urbanización", categoria: "Socioeconómico", unidad_medida: "Porcentaje" }
  ]
};

// Población base 2018 (miles de habitantes) - simulada con base en INEGI
const POBLACION_BASE = {
  1: 1312, 2: 3557, 3: 765, 4: 950, 5: 3055, 6: 744, 7: 5541, 8: 3715,
  9: 9209, 10: 1781, 11: 6021, 12: 3559, 13: 3058, 14: 8304, 15: 17117,
  16: 4844, 17: 1938, 18: 1220, 19: 5386, 20: 4178, 21: 6504, 22: 2471,
  23: 1975, 24: 2811, 25: 3025, 26: 2962, 27: 2500, 28: 3624, 29: 1294,
  30: 8354, 31: 2287, 32: 1619
};

// Superficie por entidad en km² (real aproximada)
const SUPERFICIE = {
  1: 5615, 2: 78492, 3: 74426, 4: 57916, 5: 166997, 6: 5822, 7: 73311,
  8: 247938, 9: 1485, 10: 123482, 11: 30607, 12: 64281, 13: 8909,
  14: 78599, 15: 22353, 16: 59864, 17: 4893, 18: 27815, 19: 64135,
  20: 93793, 21: 34290, 22: 11769, 23: 42361, 24: 60983, 25: 57377,
  26: 179857, 27: 24738, 28: 79384, 29: 3991, 30: 71820, 31: 39614,
  32: 49590
};

// Tasas de crecimiento anual simuladas por entidad
const TASA_CRECIMIENTO = {
  1: 0.009, 2: 0.014, 3: 0.011, 4: 0.007, 5: 0.005, 6: 0.008, 7: 0.004,
  8: 0.006, 9: 0.002, 10: 0.003, 11: 0.010, 12: 0.003, 13: 0.007,
  14: 0.011, 15: 0.006, 16: 0.005, 17: 0.008, 18: 0.009, 19: 0.012,
  20: 0.003, 21: 0.006, 22: 0.016, 23: 0.019, 24: 0.007, 25: 0.006,
  26: 0.008, 27: 0.005, 28: 0.005, 29: 0.004, 30: 0.004, 31: 0.008,
  32: 0.002
};

// Tasa de natalidad base (por mil)
const NATALIDAD_BASE = {
  1: 17.2, 2: 15.8, 3: 14.9, 4: 17.5, 5: 14.3, 6: 15.1, 7: 18.8,
  8: 15.4, 9: 11.2, 10: 16.8, 11: 17.6, 12: 18.4, 13: 16.2, 14: 15.9,
  15: 13.5, 16: 16.7, 17: 14.8, 18: 16.1, 19: 13.8, 20: 16.9, 21: 15.3,
  22: 16.5, 23: 16.2, 24: 17.1, 25: 15.6, 26: 15.2, 27: 17.8, 28: 14.7,
  29: 15.8, 30: 15.9, 31: 17.0, 32: 18.2
};

// Tasa de mortalidad base (por mil)
const MORTALIDAD_BASE = {
  1: 5.8, 2: 4.9, 3: 4.2, 4: 5.1, 5: 5.5, 6: 5.4, 7: 7.2, 8: 5.6,
  9: 5.3, 10: 6.1, 11: 5.4, 12: 7.8, 13: 5.9, 14: 5.1, 15: 5.2,
  16: 6.4, 17: 5.7, 18: 5.5, 19: 4.8, 20: 7.5, 21: 5.8, 22: 4.9,
  23: 4.5, 24: 5.6, 25: 5.7, 26: 5.3, 27: 5.9, 28: 5.3, 29: 6.8,
  30: 6.2, 31: 4.6, 32: 6.9
};

// Tasa de urbanización base (%)
const URBANIZACION_BASE = {
  1: 91.2, 2: 96.5, 3: 83.4, 4: 73.8, 5: 86.9, 6: 87.3, 7: 48.2,
  8: 87.5, 9: 100.0, 10: 80.6, 11: 75.2, 12: 58.3, 13: 69.4, 14: 91.8,
  15: 93.6, 16: 74.5, 17: 86.7, 18: 81.2, 19: 97.2, 20: 59.8, 21: 78.4,
  22: 86.3, 23: 88.1, 24: 77.6, 25: 83.7, 26: 87.9, 27: 73.2, 28: 88.5,
  29: 74.1, 30: 72.6, 31: 85.9, 32: 72.8
};

/**
 * Función pseudoaleatoria con semilla para generar datos reproducibles
 */
function seededRandom(seed) {
  let s = seed;
  return function() {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

/**
 * Generar la tabla de hechos completa
 * DATOS SIMULADOS: basados en tendencias reales del INEGI pero generados matemáticamente
 */
function generarHechos() {
  const hechos = [];
  const rand = seededRandom(42);

  DIMENSIONES.entidad.forEach(ent => {
    const idEnt = ent.id_entidad;
    const pobBase = POBLACION_BASE[idEnt];
    const sup = SUPERFICIE[idEnt];
    const crec = TASA_CRECIMIENTO[idEnt];
    const natBase = NATALIDAD_BASE[idEnt];
    const mortBase = MORTALIDAD_BASE[idEnt];
    const urbBase = URBANIZACION_BASE[idEnt];

    DIMENSIONES.tiempo.forEach(t => {
      const idx = t.id_tiempo - 1;
      const aniosTranscurridos = idx / 12;

      // Población con crecimiento compuesto
      let pob = pobBase * Math.pow(1 + crec, aniosTranscurridos);
      // Ruido aleatorio
      pob = pob * (1 + (rand() - 0.5) * 0.01);
      pob = Math.round(pob);

      const densidad = Math.round((pob / sup) * 1000) / 1000;

      // Natalidad con tendencia decreciente ligera
      let natalidad = natBase * (1 - 0.008 * aniosTranscurridos) + (rand() - 0.5) * 0.4;
      natalidad = Math.round(natalidad * 100) / 100;

      // Mortalidad con tendencia estable/ligero aumento por envejecimiento
      let mortalidad = mortBase * (1 + 0.005 * aniosTranscurridos) + (rand() - 0.5) * 0.3;
      mortalidad = Math.round(mortalidad * 100) / 100;

      // Tasa de urbanización con tendencia creciente
      let urbanizacion = urbBase + 0.3 * aniosTranscurridos + (rand() - 0.5) * 0.5;
      urbanizacion = Math.min(100, Math.round(urbanizacion * 100) / 100);

      // Índice de Normalización BI (composite)
      // Normalización: qué tan "normalizado" está el dato de la entidad vs el promedio nacional
      const normPob = pob / 130000; // normalizado contra población máxima
      const normDens = densidad / 6500;
      const normNatal = natalidad / 20;
      const normMort = mortalidad / 10;
      const normUrb = urbanizacion / 100;
      const indiceNorm = Math.round(((normPob * 0.2 + normDens * 0.2 + normNatal * 0.15 + normMort * 0.15 + normUrb * 0.3) * 100) * 100) / 100;

      // Meta para el índice de normalización
      const meta = 65 + Math.round(rand() * 15 * 100) / 100;

      // Crear registros para cada indicador
      // Indicador 1: Población Total
      hechos.push({
        id_tiempo: t.id_tiempo,
        id_entidad: idEnt,
        id_region: DIMENSIONES.region.find(r => r.region === ent.region).id_region,
        id_indicador: 1,
        valor: pob,
        meta: Math.round(pob * 1.02),
        variacion: 0,
        porcentaje_cumplimiento: 0
      });

      // Indicador 2: Densidad de Población
      hechos.push({
        id_tiempo: t.id_tiempo,
        id_entidad: idEnt,
        id_region: DIMENSIONES.region.find(r => r.region === ent.region).id_region,
        id_indicador: 2,
        valor: densidad,
        meta: Math.round(densidad * 1.05 * 100) / 100,
        variacion: 0,
        porcentaje_cumplimiento: 0
      });

      // Indicador 3: Tasa de Natalidad
      hechos.push({
        id_tiempo: t.id_tiempo,
        id_entidad: idEnt,
        id_region: DIMENSIONES.region.find(r => r.region === ent.region).id_region,
        id_indicador: 3,
        valor: natalidad,
        meta: Math.round(natBase * 0.95 * 100) / 100,
        variacion: 0,
        porcentaje_cumplimiento: 0
      });

      // Indicador 4: Tasa de Mortalidad
      hechos.push({
        id_tiempo: t.id_tiempo,
        id_entidad: idEnt,
        id_region: DIMENSIONES.region.find(r => r.region === ent.region).id_region,
        id_indicador: 4,
        valor: mortalidad,
        meta: Math.round(mortBase * 0.92 * 100) / 100,
        variacion: 0,
        porcentaje_cumplimiento: 0
      });

      // Indicador 5: Índice de Normalización BI
      hechos.push({
        id_tiempo: t.id_tiempo,
        id_entidad: idEnt,
        id_region: DIMENSIONES.region.find(r => r.region === ent.region).id_region,
        id_indicador: 5,
        valor: indiceNorm,
        meta: meta,
        variacion: 0,
        porcentaje_cumplimiento: 0
      });

      // Indicador 6: Tasa de Urbanización
      hechos.push({
        id_tiempo: t.id_tiempo,
        id_entidad: idEnt,
        id_region: DIMENSIONES.region.find(r => r.region === ent.region).id_region,
        id_indicador: 6,
        valor: urbanizacion,
        meta: Math.min(100, Math.round((urbBase + 5) * 100) / 100),
        variacion: 0,
        porcentaje_cumplimiento: 0
      });
    });
  });

  // Calcular variaciones y porcentajes de cumplimiento
  for (let i = 0; i < hechos.length; i++) {
    const h = hechos[i];
    // Buscar el registro anterior para la misma entidad e indicador
    const anterior = hechos.find(
      (x, idx) => idx < i && x.id_entidad === h.id_entidad && x.id_indicador === h.id_indicador
        && DIMENSIONES.tiempo.find(t => t.id_tiempo === x.id_tiempo).anio === DIMENSIONES.tiempo.find(t => t.id_tiempo === h.id_tiempo).anio - 1
        && DIMENSIONES.tiempo.find(t => t.id_tiempo === x.id_tiempo).mes === DIMENSIONES.tiempo.find(t => t.id_tiempo === h.id_tiempo).mes
    );
    if (anterior && anterior.valor !== 0) {
      h.variacion = Math.round(((h.valor - anterior.valor) / anterior.valor) * 10000) / 100;
    }
    if (h.meta && h.meta !== 0) {
      h.porcentaje_cumplimiento = Math.round((h.valor / h.meta) * 10000) / 100;
    }
  }

  return hechos;
}

// Generar y exportar datos
const HECHOS = generarHechos();

// Utilidades de acceso a datos
const DataManager = {
  hechos: HECHOS,
  dimensiones: DIMENSIONES,

  getEntidad(id) {
    return this.dimensiones.entidad.find(e => e.id_entidad === id);
  },

  getTiempo(id) {
    return this.dimensiones.tiempo.find(t => t.id_tiempo === id);
  },

  getRegion(id) {
    return this.dimensiones.region.find(r => r.id_region === id);
  },

  getIndicador(id) {
    return this.dimensiones.indicador.find(i => i.id_indicador === id);
  },

  filtrar({ anio, trimestre, mes, entidad, region, indicador }) {
    return this.hechos.filter(h => {
      const t = this.getTiempo(h.id_tiempo);
      const e = this.getEntidad(h.id_entidad);
      const r = this.getRegion(h.id_region);
      const i = this.getIndicador(h.id_indicador);

      if (anio && t.anio !== parseInt(anio)) return false;
      if (trimestre && t.trimestre !== parseInt(trimestre)) return false;
      if (mes && t.mes !== parseInt(mes)) return false;
      if (entidad && h.id_entidad !== parseInt(entidad)) return false;
      if (region && h.id_region !== parseInt(region)) return false;
      if (indicador && h.id_indicador !== parseInt(indicador)) return false;

      return true;
    });
  },

  agregarPorTiempo(datos) {
    const mapa = {};
    datos.forEach(h => {
      const t = this.getTiempo(h.id_tiempo);
      const clave = `${t.anio}`;
      if (!mapa[clave]) mapa[clave] = { id_tiempo: h.id_tiempo, nombre: clave, suma: 0, count: 0, valores: [] };
      mapa[clave].suma += h.valor;
      mapa[clave].count++;
      mapa[clave].valores.push(h.valor);
    });
    return Object.values(mapa).map(item => {
      item.promedio = item.count > 0 ? item.suma / item.count : 0;
      return item;
    });
  },

  agregarPorRegion(datos) {
    const mapa = {};
    datos.forEach(h => {
      const r = this.getRegion(h.id_region);
      const clave = r.region;
      if (!mapa[clave]) mapa[clave] = { id_region: h.id_region, nombre: clave, suma: 0, count: 0, valores: [] };
      mapa[clave].suma += h.valor;
      mapa[clave].count++;
      mapa[clave].valores.push(h.valor);
    });
    return Object.values(mapa).map(item => {
      item.promedio = item.count > 0 ? item.suma / item.count : 0;
      return item;
    });
  },

  agregarPorEntidad(datos) {
    const mapa = {};
    datos.forEach(h => {
      const e = this.getEntidad(h.id_entidad);
      const clave = e.entidad;
      if (!mapa[clave]) mapa[clave] = { id_entidad: h.id_entidad, nombre: clave, region: e.region, suma: 0, count: 0, valores: [] };
      mapa[clave].suma += h.valor;
      mapa[clave].count++;
      mapa[clave].valores.push(h.valor);
    });
    return Object.values(mapa).map(item => {
      item.promedio = item.count > 0 ? item.suma / item.count : 0;
      const vars = item.valores.map(v => v);
      item.variacionPromedio = vars.length > 1 ? ((vars[vars.length - 1] - vars[0]) / vars[0]) * 100 : 0;
      return item;
    });
  },

  agregarPorIndicador(datos) {
    const mapa = {};
    datos.forEach(h => {
      const i = this.getIndicador(h.id_indicador);
      const clave = i.indicador;
      if (!mapa[clave]) mapa[clave] = { id_indicador: h.id_indicador, nombre: clave, unidad: i.unidad_medida, suma: 0, count: 0, valores: [] };
      mapa[clave].suma += h.valor;
      mapa[clave].count++;
      mapa[clave].valores.push(h.valor);
    });
    return Object.values(mapa).map(item => {
      item.promedio = item.count > 0 ? item.suma / item.count : 0;
      return item;
    });
  },

  calcularEstadisticas(valores) {
    if (!valores.length) return { total: 0, promedio: 0, desviacion: 0, min: 0, max: 0 };
    const n = valores.length;
    const total = valores.reduce((a, b) => a + b, 0);
    const promedio = total / n;
    const varianza = valores.reduce((sum, v) => sum + Math.pow(v - promedio, 2), 0) / n;
    const desviacion = Math.sqrt(varianza);
    return {
      total: Math.round(total * 100) / 100,
      promedio: Math.round(promedio * 100) / 100,
      desviacion: Math.round(desviacion * 100) / 100,
      min: Math.min(...valores),
      max: Math.max(...valores),
      n: n
    };
  },

  calcularZScore(valor, promedio, desviacion) {
    if (desviacion === 0) return 0;
    return Math.round(((valor - promedio) / desviacion) * 100) / 100;
  },

  detectarAnomalias(datos) {
    const anomalias = [];
    // Agrupar por entidad E indicador para Z-score correcto
    const mapa = {};
    datos.forEach(h => {
      const key = h.id_entidad + '_' + h.id_indicador;
      if (!mapa[key]) mapa[key] = { id_entidad: h.id_entidad, id_indicador: h.id_indicador, valores: [] };
      mapa[key].valores.push(h.valor);
    });

    Object.values(mapa).forEach(item => {
      const stats = this.calcularEstadisticas(item.valores);
      if (stats.desviacion === 0) return;

      datos.filter(h => h.id_entidad === item.id_entidad && h.id_indicador === item.id_indicador).forEach(h => {
        const z = this.calcularZScore(h.valor, stats.promedio, stats.desviacion);
        if (Math.abs(z) >= 2) {
          const t = this.getTiempo(h.id_tiempo);
          const i = this.getIndicador(h.id_indicador);
          const e = this.getEntidad(h.id_entidad);
          anomalias.push({
            id_tiempo: h.id_tiempo,
            id_entidad: h.id_entidad,
            id_region: h.id_region,
            id_indicador: h.id_indicador,
            fecha: t.periodo,
            entidad: e.entidad,
            region: e.region,
            indicador: i.indicador,
            valor: h.valor,
            promedio: Math.round(stats.promedio * 100) / 100,
            zScore: z,
            tipo: z > 0 ? "Incremento inusual" : "Disminución inusual"
          });
        }
      });
    });

    return anomalias.sort((a, b) => Math.abs(b.zScore) - Math.abs(a.zScore));
  }
};
