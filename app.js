/**
 * app.js - Aplicación principal del Dashboard de Business Intelligence
 * Maneja filtros, KPIs, tablas OLAP, gráficas, detección de anomalías,
 * hallazgos, interpretación y matriz de decisiones.
 */

// ═══════════════════════════════════════════════════════════════
// Paleta de colores para gráficas
// ═══════════════════════════════════════════════════════════════
const COLORES = [
  '#1a237e', '#00897b', '#2e7d32', '#f57f17', '#c62828',
  '#6a1b9a', '#0277bd', '#ff6f00', '#ad1457', '#00695c',
  '#283593', '#bf360c'
];

// ═══════════════════════════════════════════════════════════════
// Instancias de Chart.js para destruir antes de recrear
// ═══════════════════════════════════════════════════════════════
const chartInstances = {};

// ═══════════════════════════════════════════════════════════════
// OLAP – Cubo multidimensional interactivo
// ═══════════════════════════════════════════════════════════════
const olapState = {
  rowAxis: 'tiempo',
  colAxis: 'region',
  pageAxis: 'indicador',
  pageValue: null,
  drillLevel: 0,
  drillPath: [],
  sliceFilter: null,
  diceFilters: {},
};

const OLAP_AXES = [
  { id: 'tiempo', label: 'Tiempo' },
  { id: 'entidad', label: 'Entidad' },
  { id: 'region', label: 'Región' },
  { id: 'indicador', label: 'Indicador' },
];

function olapResolve(d, axis) {
  const t = DataManager.getTiempo(d.id_tiempo);
  const e = DataManager.getEntidad(d.id_entidad);
  const r = DataManager.getRegion(d.id_region);
  const i = DataManager.getIndicador(d.id_indicador);
  switch (axis) {
    case 'tiempo': return { id: String(t.anio), label: String(t.anio), order: t.anio };
    case 'entidad': return { id: String(d.id_entidad), label: e.entidad, order: d.id_entidad };
    case 'region': return { id: String(d.id_region), label: r.region, order: d.id_region };
    case 'indicador': return { id: String(d.id_indicador), label: i.indicador, order: d.id_indicador };
    default: return { id: '?', label: '?', order: 0 };
  }
}

function olapTiempoKey(d) {
  const t = DataManager.getTiempo(d.id_tiempo);
  if (olapState.drillLevel === 0) return String(t.anio);
  if (olapState.drillLevel === 1) return t.anio + '-T' + t.trimestre;
  return t.anio + '-T' + t.trimestre + '-M' + t.mes;
}

function olapTiempoLabel(d) {
  const t = DataManager.getTiempo(d.id_tiempo);
  if (olapState.drillLevel === 0) return String(t.anio);
  if (olapState.drillLevel === 1) return t.anio + ' Trimestre ' + t.trimestre;
  const meses = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
  return meses[t.mes - 1] + ' ' + t.anio;
}

function olapTiempoOrder(d) {
  const t = DataManager.getTiempo(d.id_tiempo);
  if (olapState.drillLevel === 0) return t.anio;
  if (olapState.drillLevel === 1) return t.anio * 10 + t.trimestre;
  return t.anio * 1000 + t.trimestre * 100 + t.mes;
}

function olapApplyFilters(datos) {
  let out = datos;
  if (olapState.pageValue) {
    const pa = olapState.pageAxis;
    if (pa === 'tiempo') {
      out = out.filter(d => String(DataManager.getTiempo(d.id_tiempo).anio) === olapState.pageValue);
    } else {
      const cid = 'id_' + pa;
      out = out.filter(d => String(d[cid]) === olapState.pageValue);
    }
  }
  if (olapState.sliceFilter) {
    const campo = olapState.sliceFilter.campo;
    if (campo === 'tiempo') {
      out = out.filter(d => String(DataManager.getTiempo(d.id_tiempo).anio) === olapState.sliceFilter.valor);
    } else {
      const cid = 'id_' + campo;
      out = out.filter(d => String(d[cid]) === olapState.sliceFilter.valor);
    }
  }
  Object.keys(olapState.diceFilters).forEach(campo => {
    const vals = olapState.diceFilters[campo];
    if (vals && vals.length > 0) {
      if (campo === 'tiempo') {
        const strVals = vals.map(v => String(v));
        out = out.filter(d => strVals.includes(String(DataManager.getTiempo(d.id_tiempo).anio)));
      } else {
        const cid = 'id_' + campo;
        const strVals = vals.map(v => String(v));
        out = out.filter(d => strVals.includes(String(d[cid])));
      }
    }
  });
  olapState.drillPath.forEach(dp => {
    if (dp.level === 0) out = out.filter(d => String(DataManager.getTiempo(d.id_tiempo).anio) === dp.value);
    else if (dp.level === 1) out = out.filter(d => {
      const t = DataManager.getTiempo(d.id_tiempo);
      return (t.anio + '-T' + t.trimestre) === dp.value;
    });
  });
  return out;
}

function renderOLAP(datos) {
  const cont = document.getElementById('olap-table');
  if (!cont) return;

  const datosOLAP = olapApplyFilters(datos);
  if (!datosOLAP.length) {
    cont.innerHTML = '<div class="empty-state"><div class="empty-state__icon">📭</div><div class="empty-state__title">Sin datos</div><div class="empty-state__description">No hay datos para esta combinación de filtros.</div></div>';
    updateOLAPInfo(0);
    return;
  }

  const rowAxis = olapState.rowAxis;
  const colAxis = olapState.colAxis;

  const filasMap = {};
  const colsMap = {};
  const pivote = {};

  datosOLAP.forEach(d => {
    let filaKey, filaLabel, filaOrder;
    if (rowAxis === 'tiempo') {
      filaKey = olapTiempoKey(d);
      filaLabel = olapTiempoLabel(d);
      filaOrder = olapTiempoOrder(d);
    } else {
      const r = olapResolve(d, rowAxis);
      filaKey = r.id; filaLabel = r.label; filaOrder = r.order;
    }
    const c = olapResolve(d, colAxis);
    filasMap[filaKey] = { label: filaLabel, order: filaOrder };
    colsMap[c.id] = { label: c.label, order: c.order };
    const pk = filaKey + '||' + c.id;
    if (!pivote[pk]) pivote[pk] = { total: 0, count: 0, meta: 0 };
    pivote[pk].total += d.valor || 0;
    pivote[pk].count += 1;
    pivote[pk].meta += d.meta || 0;
  });

  const filasArr = Object.entries(filasMap).sort((a, b) => a[1].order - b[1].order);
  const colsArr = Object.entries(colsMap).sort((a, b) => a[1].order - b[1].order);

  let allVals = Object.values(pivote).map(p => p.total);
  let minV = Math.min(...allVals), maxV = Math.max(...allVals);
  let rangeV = maxV - minV || 1;

  function cellColor(val) {
    const t = rangeV > 0 ? (val - minV) / rangeV : 0.5;
    if (t < 0.25) return { bg: 'rgba(30,58,138,' + (0.08 + t * 1.2) + ')', tc: '#fff' };
    if (t < 0.5) return { bg: 'rgba(0,137,123,' + (0.15 + t * 0.9) + ')', tc: '#fff' };
    if (t < 0.75) return { bg: 'rgba(245,127,23,' + (0.2 + t * 0.7) + ')', tc: '#fff' };
    return { bg: 'rgba(198,40,40,' + (0.3 + t * 0.5) + ')', tc: '#fff' };
  }

  let html = '<table class="olap-pivot"><thead><tr>';
  html += '<th class="olap-corner">' + getAxisLabel(rowAxis) + ' ↓ \\ ' + getAxisLabel(colAxis) + ' →</th>';
  colsArr.forEach(([, c]) => { html += '<th class="olap-col-header" data-col="' + c.id + '">' + c.label + '</th>'; });
  html += '<th class="olap-total-header">Total</th></tr></thead><tbody>';

  let totCols = colsArr.map(() => 0);
  let granTotal = 0;

  filasArr.forEach(([fId, f]) => {
    const isDrillable = rowAxis === 'tiempo' && olapState.drillLevel < 2;
    const click = isDrillable ? ' onclick="olapDrillInto(\'' + fId.replace(/'/g, "\\'") + '\')" style="cursor:pointer" title="Clic para desagregar"' : '';

    html += '<tr data-row="' + fId + '"><th class="olap-row-header"' + click + '>';
    if (isDrillable) html += '<span class="olap-drill-icon">▶ </span>';
    html += f.label + '</th>';

    let totalFila = 0;
    colsArr.forEach(([cId], ci) => {
      const p = pivote[fId + '||' + cId];
      const val = p ? p.total : 0;
      const meta = p ? p.meta : 0;
      totalFila += val;
      totCols[ci] += val;

      const colors = cellColor(val);
      const pct = meta > 0 ? ((val / meta) * 100).toFixed(0) + '%' : '';
      const count = p ? p.count : 0;
      const tooltip = val.toLocaleString('es-MX', { maximumFractionDigits: 1 }) + (pct ? ' (' + pct + ' meta)' : '') + ' | ' + count + ' reg';

      html += '<td class="olap-cell" style="background:' + colors.bg + ';color:' + colors.tc + ';" data-val="' + val + '" data-row="' + fId + '" data-col="' + cId + '"';
      if (count > 0) html += ' onclick="olapDrillThrough(\'' + fId.replace(/'/g, "\\'") + '\',\'' + cId.replace(/'/g, "\\'") + '\')" style="cursor:pointer;background:' + colors.bg + ';color:' + colors.tc + ';" title="' + tooltip + '"';
      html += '>';
      html += val !== 0 ? val.toLocaleString('es-MX', { maximumFractionDigits: 1 }) : '—';
      html += '</td>';
    });

    granTotal += totalFila;
    html += '<td class="olap-row-total">' + totalFila.toLocaleString('es-MX', { maximumFractionDigits: 1 }) + '</td></tr>';
  });

  html += '<tr class="olap-grand-total"><td><strong>Total</strong></td>';
  totCols.forEach(tc => {
    html += '<td class="olap-cell-total">' + tc.toLocaleString('es-MX', { maximumFractionDigits: 1 }) + '</td>';
  });
  html += '<td class="olap-grand-total-val">' + granTotal.toLocaleString('es-MX', { maximumFractionDigits: 1 }) + '</td></tr>';
  html += '</tbody></table>';
  cont.innerHTML = html;
  updateOLAPInfo(datosOLAP.length);
  renderCube3D();
}

function updateOLAPInfo(n) {
  const el = document.getElementById('olap-info');
  if (!el) return;
  const dl = ['Año', 'Trimestre', 'Mes'][olapState.drillLevel];
  let t = 'Fila: ' + getAxisLabel(olapState.rowAxis) + ' | Col: ' + getAxisLabel(olapState.colAxis) + ' | Prof: ' + getAxisLabel(olapState.pageAxis) + ' | Drill: ' + dl + ' | Registros: ' + n;
  if (olapState.pageValue) t += ' | Página: ' + olapState.pageValue;
  const path = olapState.drillPath.map(p => p.label).join(' → ');
  if (path) t += ' | Ruta: ' + path;
  if (olapState.sliceFilter) t += ' | Slice: ' + olapState.sliceFilter.label;
  const dc = Object.values(olapState.diceFilters).reduce((s, a) => s + a.length, 0);
  if (dc) t += ' | Dice: ' + dc + ' filtro(s)';
  el.textContent = t;
  updateOLAPBadges();
}

function updateOLAPBadges() {
  const c = document.getElementById('olap-state-badges');
  if (!c) return;
  let b = [];
  const dl = ['Año', 'Trimestre', 'Mes'][olapState.drillLevel];
  b.push('<span class="badge badge--white badge--primary">Drill: ' + dl + '</span>');
  if (olapState.pageValue) b.push('<span class="badge badge--white badge--accent">' + getAxisLabel(olapState.pageAxis) + ': ' + olapState.pageValue + '</span>');
  olapState.drillPath.forEach(p => b.push('<span class="badge badge--white badge--accent">' + p.label + '</span>'));
  if (olapState.sliceFilter) b.push('<span class="badge badge--white badge--warning">Slice: ' + olapState.sliceFilter.label + ' <button class="olap-badge-remove" onclick="olapRemoveSlice()">×</button></span>');
  Object.entries(olapState.diceFilters).forEach(([campo, vals]) => {
    vals.forEach(v => b.push('<span class="badge badge--white badge--danger">Dice: ' + campo + '=' + v + ' <button class="olap-badge-remove" onclick="olapRemoveDice(\'' + campo + '\',\'' + v + '\')">×</button></span>'));
  });
  c.innerHTML = b.join(' ');
}

function olapDrillDown() {
  if (olapState.drillLevel < 2) { olapState.drillLevel++; updateAll(); }
}

function olapRollUp() {
  if (olapState.drillPath.length > 0) olapState.drillPath.pop();
  if (olapState.drillLevel > 0) olapState.drillLevel--;
  updateAll();
}

function olapDrillInto(filaId) {
  if (olapState.rowAxis !== 'tiempo' || olapState.drillLevel >= 2) return;
  if (olapState.drillLevel === 0) {
    olapState.drillPath.push({ level: 0, value: filaId, label: filaId });
  } else {
    olapState.drillPath.push({ level: 1, value: filaId, label: filaId });
  }
  olapState.drillLevel++;
  updateAll();
}

function olapPivot() {
  const tmp = olapState.rowAxis;
  olapState.rowAxis = olapState.colAxis;
  olapState.colAxis = tmp;
  updateAll();
}

function olapSlice() {
  const campo = document.getElementById('olap-slice-field');
  const valor = document.getElementById('olap-slice-value');
  if (campo && valor && valor.value) {
    olapState.sliceFilter = { campo: campo.value, valor: valor.value, label: campo.options[campo.selectedIndex].text + ': ' + valor.options[valor.selectedIndex].text };
    updateAll();
  }
}

function olapDice() {
  const campo = document.getElementById('olap-dice-field');
  const valor = document.getElementById('olap-dice-value');
  if (campo && valor && valor.value) {
    if (!olapState.diceFilters[campo.value]) olapState.diceFilters[campo.value] = [];
    if (!olapState.diceFilters[campo.value].includes(valor.value)) {
      olapState.diceFilters[campo.value].push(valor.value);
    }
    updateAll();
  }
}

function olapRemoveSlice() { olapState.sliceFilter = null; updateAll(); }

function olapRemoveDice(campo, valor) {
  if (olapState.diceFilters[campo]) {
    olapState.diceFilters[campo] = olapState.diceFilters[campo].filter(v => v !== valor);
    if (olapState.diceFilters[campo].length === 0) delete olapState.diceFilters[campo];
  }
  updateAll();
}

function olapDrillThrough(fId, cId) {
  const modal = document.getElementById('olap-drill-modal');
  const body = document.getElementById('olap-drill-body');
  if (!modal || !body) return;

  let datos = olapApplyFilters(DataManager.filtrar(leerFiltros()));
  const registros = datos.filter(d => {
    const rk = olapState.rowAxis === 'tiempo' ? olapTiempoKey(d) : olapResolve(d, olapState.rowAxis).id;
    const ck = olapResolve(d, olapState.colAxis).id;
    return rk === fId && ck === cId;
  });

  let h = '<h4 style="margin-bottom:1rem;">Detalle: ' + fId + ' × ' + cId + '</h4>';
  h += '<p class="text-muted text-sm">' + registros.length + ' registro(s)</p>';
  if (registros.length) {
    h += '<table class="table table--compact"><thead><tr><th>Tiempo</th><th>Entidad</th><th>Región</th><th>Indicador</th><th>Valor</th><th>Meta</th><th>Cumplimiento</th><th>Variación</th></tr></thead><tbody>';
    registros.forEach(d => {
      const t = DataManager.getTiempo(d.id_tiempo);
      const e = DataManager.getEntidad(d.id_entidad);
      const r = DataManager.getRegion(d.id_region);
      const i = DataManager.getIndicador(d.id_indicador);
      const cum = d.meta ? ((d.valor / d.meta) * 100).toFixed(1) + '%' : 'N/A';
      h += '<tr><td>' + t.periodo + '</td><td>' + e.entidad + '</td><td>' + r.region + '</td><td>' + i.indicador + '</td><td class="text-right">' + d.valor.toLocaleString('es-MX', { maximumFractionDigits: 2 }) + '</td><td class="text-right">' + d.meta.toLocaleString('es-MX', { maximumFractionDigits: 2 }) + '</td><td class="text-right">' + cum + '</td><td class="text-right">' + d.variacion.toFixed(2) + '%</td></tr>';
    });
    h += '</tbody></table>';
  }
  body.innerHTML = h;
  modal.classList.add('active');
}

function olapCloseDrillThrough() {
  const m = document.getElementById('olap-drill-modal');
  if (m) m.classList.remove('active');
}

function resetOLAP() {
  olapState.drillLevel = 0;
  olapState.rowAxis = 'tiempo';
  olapState.colAxis = 'region';
  olapState.pageAxis = 'indicador';
  olapState.pageValue = null;
  olapState.sliceFilter = null;
  olapState.diceFilters = {};
  olapState.drillPath = [];
  const sf = document.getElementById('olap-slice-field');
  const sv = document.getElementById('olap-slice-value');
  if (sf) sf.selectedIndex = 0;
  if (sv) sv.selectedIndex = 0;
  const df = document.getElementById('olap-dice-field');
  const dv = document.getElementById('olap-dice-value');
  if (df) df.selectedIndex = 0;
  if (dv) dv.selectedIndex = 0;
  const rs = document.getElementById('olap-row-axis');
  const cs = document.getElementById('olap-col-axis');
  const ps = document.getElementById('olap-page-axis');
  if (rs) rs.value = 'tiempo';
  if (cs) cs.value = 'region';
  if (ps) ps.value = 'indicador';
  poblarOlapPageValues();
  updateAll();
}

function getAxisLabel(axis) {
  const f = OLAP_AXES.find(a => a.id === axis);
  return f ? f.label : axis;
}

function olapChangeRowAxis(v) {
  if (v === olapState.colAxis) { olapState.colAxis = olapState.rowAxis; const cs = document.getElementById('olap-col-axis'); if (cs) cs.value = olapState.colAxis; }
  if (v === olapState.pageAxis) { olapState.pageAxis = olapState.rowAxis; const ps = document.getElementById('olap-page-axis'); if (ps) ps.value = olapState.pageAxis; }
  olapState.rowAxis = v;
  poblarOlapPageValues();
  updateAll();
}

function olapChangeColAxis(v) {
  if (v === olapState.rowAxis) { olapState.rowAxis = olapState.colAxis; const rs = document.getElementById('olap-row-axis'); if (rs) rs.value = olapState.rowAxis; }
  if (v === olapState.pageAxis) { olapState.pageAxis = olapState.colAxis; const ps = document.getElementById('olap-page-axis'); if (ps) ps.value = olapState.pageAxis; }
  olapState.colAxis = v;
  poblarOlapPageValues();
  updateAll();
}

function olapChangePageAxis(v) {
  if (v === olapState.rowAxis) { olapState.rowAxis = olapState.pageAxis; const rs = document.getElementById('olap-row-axis'); if (rs) rs.value = olapState.rowAxis; }
  if (v === olapState.colAxis) { olapState.colAxis = olapState.pageAxis; const cs = document.getElementById('olap-col-axis'); if (cs) cs.value = olapState.colAxis; }
  olapState.pageAxis = v;
  olapState.pageValue = null;
  poblarOlapPageValues();
  updateAll();
}

function olapChangePageValue(v) {
  olapState.pageValue = v || null;
  updateAll();
}

function olapNextPage() {
  const vals = getOlapPageValues();
  if (!vals.length) return;
  const idx = vals.findIndex(v => String(v.valor) === String(olapState.pageValue));
  const next = idx < 0 ? 0 : (idx + 1) % vals.length;
  olapState.pageValue = String(vals[next].valor);
  const pv = document.getElementById('olap-page-value');
  if (pv) pv.value = olapState.pageValue;
  updateAll();
}

function olapPrevPage() {
  const vals = getOlapPageValues();
  if (!vals.length) return;
  const idx = vals.findIndex(v => String(v.valor) === String(olapState.pageValue));
  const prev = idx <= 0 ? vals.length - 1 : idx - 1;
  olapState.pageValue = String(vals[prev].valor);
  const pv = document.getElementById('olap-page-value');
  if (pv) pv.value = olapState.pageValue;
  updateAll();
}

function getOlapPageValues() {
  const pa = olapState.pageAxis;
  if (pa === 'tiempo') {
    const anios = [...new Set(DIMENSIONES.tiempo.map(t => t.anio))].sort((a, b) => a - b);
    return anios.map(a => ({ valor: String(a), texto: String(a) }));
  }
  if (pa === 'entidad') return DIMENSIONES.entidad.map(e => ({ valor: String(e.id_entidad), texto: e.entidad }));
  if (pa === 'region') return DIMENSIONES.region.map(r => ({ valor: String(r.id_region), texto: r.region }));
  if (pa === 'indicador') return DIMENSIONES.indicador.map(i => ({ valor: String(i.id_indicador), texto: i.indicador }));
  return [];
}

function poblarOlapPageValues() {
  const pv = document.getElementById('olap-page-value');
  if (!pv) return;
  const vals = getOlapPageValues();
  pv.innerHTML = '<option value="">Todas</option>';
  vals.forEach(v => {
    const opt = document.createElement('option');
    opt.value = v.valor;
    opt.textContent = v.texto;
    pv.appendChild(opt);
  });
  if (vals.length > 0 && !olapState.pageValue) {
    olapState.pageValue = vals[0].valor;
    pv.value = vals[0].valor;
  }
}

function renderCube3D() {
  const container = document.getElementById('olap-cube-3d');
  if (!container) return;

  const pageVals = getOlapPageValues().slice(0, 6);
  const rowAxis = olapState.rowAxis;
  const colAxis = olapState.colAxis;
  const pageAxis = olapState.pageAxis;

  const datos = DataManager.filtrar(leerFiltros());

  const allFilasMap = {};
  const allColsMap = {};
  const pageData = {};

  datos.forEach(d => {
    let filaKey, filaLabel, filaOrder;
    if (rowAxis === 'tiempo') {
      filaKey = olapTiempoKey(d);
      filaLabel = olapTiempoLabel(d);
      filaOrder = olapTiempoOrder(d);
    } else {
      const r = olapResolve(d, rowAxis);
      filaKey = r.id; filaLabel = r.label; filaOrder = r.order;
    }
    const c = olapResolve(d, colAxis);
    allFilasMap[filaKey] = { label: filaLabel, order: filaOrder };
    allColsMap[c.id] = { label: c.label, order: c.order };

    let pVal;
    if (pageAxis === 'tiempo') pVal = String(DataManager.getTiempo(d.id_tiempo).anio);
    else pVal = String(d['id_' + pageAxis]);
    if (!pageData[pVal]) pageData[pVal] = {};
    const pk = filaKey + '||' + c.id;
    if (!pageData[pVal][pk]) pageData[pVal][pk] = 0;
    pageData[pVal][pk] += d.valor || 0;
  });

  const filasArr = Object.entries(allFilasMap).sort((a, b) => a[1].order - b[1].order).slice(0, 8);
  const colsArr = Object.entries(allColsMap).sort((a, b) => a[1].order - b[1].order).slice(0, 8);

  const allVals = datos.map(d => d.valor || 0);
  const minV = allVals.length ? Math.min(...allVals) : 0;
  const maxV = allVals.length ? Math.max(...allVals) : 1;
  const rangeV = maxV - minV || 1;

  function makeHeatColor(val) {
    const t = rangeV > 0 ? (val - minV) / rangeV : 0.5;
    if (t < 0.25) return 'rgba(30,58,138,' + (0.2 + t * 1.6) + ')';
    if (t < 0.5) return 'rgba(0,137,123,' + (0.3 + t * 1.2) + ')';
    if (t < 0.75) return 'rgba(245,127,23,' + (0.3 + t * 0.9) + ')';
    return 'rgba(198,40,40,' + (0.4 + t * 0.6) + ')';
  }

  function buildFaceHTML(pVal) {
    const pvData = pageData[pVal] || {};
    let total = 0;
    filasArr.forEach(([fId]) => {
      colsArr.forEach(([cId]) => {
        total += pvData[fId + '||' + cId] || 0;
      });
    });

    let h = '<div class="cube-face-header">' + (pVal || 'Todas') + '</div>';
    h += '<div class="cube-face-table">';
    h += '<div class="cube-face-row"><div class="cube-face-cell cube-face-cell--corner"></div>';
    colsArr.forEach(([, c]) => {
      h += '<div class="cube-face-cell cube-face-cell--col">' + c.label.substring(0, 6) + '</div>';
    });
    h += '</div>';
    filasArr.forEach(([fId, f]) => {
      h += '<div class="cube-face-row"><div class="cube-face-cell cube-face-cell--row">' + f.label.substring(0, 7) + '</div>';
      colsArr.forEach(([cId]) => {
        const val = pvData[fId + '||' + cId] || 0;
        h += '<div class="cube-face-cell" style="background:' + makeHeatColor(val) + ';color:' + (val > 0 ? '#fff' : 'transparent') + ';">' + (val ? Math.round(val).toLocaleString('es-MX') : '') + '</div>';
      });
      h += '</div>';
    });
    h += '</div>';
    h += '<div class="cube-face-total">' + total.toLocaleString('es-MX', { maximumFractionDigits: 0 }) + '</div>';
    return h;
  }

  const faceNames = ['front', 'back', 'right', 'left', 'top', 'bottom'];
  let html = '<div class="cube-scene">';
  html += '<div class="cube-spinner" id="cube-spinner">';

  const faceTransforms = {
    front:  'rotateY(0deg) translateZ(140px)',
    back:   'rotateY(180deg) translateZ(140px)',
    right:  'rotateY(90deg) translateZ(140px)',
    left:   'rotateY(-90deg) translateZ(140px)',
    top:    'rotateX(90deg) translateZ(140px)',
    bottom: 'rotateX(-90deg) translateZ(140px)',
  };

  faceNames.forEach((face, i) => {
    const pv = pageVals[i];
    const isSelected = pv && String(pv.valor) === String(olapState.pageValue);
    const activeClass = isSelected ? ' cube-face--active' : '';
    const clickAttr = pv ? ' onclick="olapChangePageValue(\'' + pv.valor + '\')"' : '';
    html += '<div class="cube-face cube-face--' + face + activeClass + '" style="transform:' + faceTransforms[face] + ';"' + clickAttr + '>';
    if (pv) {
      html += buildFaceHTML(String(pv.valor));
    } else {
      html += '<div class="cube-face-header" style="opacity:0.3;">Vac&#237;o</div>';
    }
    html += '</div>';
  });

  html += '</div></div>';

  html += '<div class="cube-legend">';
  html += '<div class="cube-legend__item"><span class="cube-legend__dot" style="background:#1a237e;"></span> 1. ' + getAxisLabel(rowAxis) + ' (Filas)</div>';
  html += '<div class="cube-legend__item"><span class="cube-legend__dot" style="background:#00897b;"></span> 2. ' + getAxisLabel(colAxis) + ' (Columnas)</div>';
  html += '<div class="cube-legend__item"><span class="cube-legend__dot" style="background:#c62828;"></span> 3. ' + getAxisLabel(pageAxis) + ' (Profundidad)</div>';
  html += '<div class="cube-legend__item"><span class="cube-legend__dot" style="background:linear-gradient(135deg,#1e3a8a,#00897b,#f57f17,#c62828);"></span> 4. Color (Heatmap)</div>';
  html += '<div class="cube-legend__hint">Arrastra para rotar &#183; Clic en cara para cambiar p&#225;gina</div>';
  html += '</div>';

  container.innerHTML = html;
  initCubeDrag();
}

let _cubeDragState = null;

function initCubeDrag() {
  const spinner = document.getElementById('cube-spinner');
  if (!spinner) return;

  let rotX = -20, rotY = 30;
  let autoRotate = true;
  let animFrame = null;
  let lastTime = 0;

  function applyRotation() {
    spinner.style.transform = 'rotateX(' + rotX + 'deg) rotateY(' + rotY + 'deg)';
  }

  function autoSpin(ts) {
    if (!autoRotate) return;
    if (lastTime) rotY += 0.15;
    lastTime = ts;
    applyRotation();
    animFrame = requestAnimationFrame(autoSpin);
  }

  applyRotation();
  animFrame = requestAnimationFrame(autoSpin);

  let dragging = false, startX, startY;

  spinner.addEventListener('pointerdown', function(e) {
    dragging = true;
    autoRotate = false;
    if (animFrame) cancelAnimationFrame(animFrame);
    startX = e.clientX;
    startY = e.clientY;
    spinner.style.cursor = 'grabbing';
    e.preventDefault();
  });

  document.addEventListener('pointermove', function(e) {
    if (!dragging) return;
    const dx = e.clientX - startX;
    const dy = e.clientY - startY;
    rotY += dx * 0.5;
    rotX -= dy * 0.5;
    rotX = Math.max(-80, Math.min(80, rotX));
    startX = e.clientX;
    startY = e.clientY;
    applyRotation();
  });

  document.addEventListener('pointerup', function() {
    if (dragging) {
      dragging = false;
      spinner.style.cursor = 'grab';
      setTimeout(function() {
        autoRotate = true;
        lastTime = 0;
        animFrame = requestAnimationFrame(autoSpin);
      }, 3000);
    }
  });
}

// ═══════════════════════════════════════════════════════════════
// Inicialización
// ═══════════════════════════════════════════════════════════════
document.addEventListener('DOMContentLoaded', init);

function init() {
  // Verificar que DataManager y DIMENSIONES/HECHOS existan
  if (typeof DIMENSIONES === 'undefined' || typeof HECHOS === 'undefined' || typeof DataManager === 'undefined') {
    console.error('Faltan datos: DIMENSIONES, HECHOS o DataManager no definidos.');
    return;
  }

  poblarFiltros();
  registrarEventos();
  updateAll();
}

// ═══════════════════════════════════════════════════════════════
// Gestión de filtros
// ═══════════════════════════════════════════════════════════════

/** Pobla los <select> de filtros con los valores de DIMENSIONES */
function poblarFiltros() {
  // Años únicos (ordenados descendente)
  const anios = [...new Set(DIMENSIONES.tiempo.map(t => t.anio))].sort((a, b) => b - a);
  poblarSelect('filtro-anio', anios.map(a => ({ valor: a, texto: a })));

  // Trimestres únicos
  const trimestres = [...new Set(DIMENSIONES.tiempo.map(t => t.trimestre))].sort();
  poblarSelect('filtro-trimestre', trimestres.map(t => ({ valor: t, texto: t })));

  // Meses únicos
  const meses = [...new Set(DIMENSIONES.tiempo.map(t => t.mes))].sort();
  poblarSelect('filtro-mes', meses.map(m => ({ valor: m, texto: m })));

  // Entidades
  poblarSelect('filtro-entidad', DIMENSIONES.entidad.map(e => ({ valor: e.id_entidad, texto: e.entidad })));

  // Regiones
  poblarSelect('filtro-region', DIMENSIONES.region.map(r => ({ valor: r.id_region, texto: r.region })));

  // Indicadores
  poblarSelect('filtro-indicador', DIMENSIONES.indicador.map(i => ({ valor: i.id_indicador, texto: i.indicador })));
}

/** Helper para llenar un <select> con opciones */
function poblarSelect(idSelect, opciones) {
  const select = document.getElementById(idSelect);
  if (!select) return;
  // Mantener primera opción "Todas/Todos"
  const primeraOpcion = select.options[0];
  select.innerHTML = '';
  if (primeraOpcion) select.appendChild(primeraOpcion);
  opciones.forEach(op => {
    const option = document.createElement('option');
    option.value = op.valor;
    option.textContent = op.texto;
    select.appendChild(option);
  });
}

/** Lee los valores actuales de todos los filtros */
function leerFiltros() {
  return {
    anio: leerValorSelect('filtro-anio'),
    trimestre: leerValorSelect('filtro-trimestre'),
    mes: leerValorSelect('filtro-mes'),
    entidad: leerValorSelect('filtro-entidad'),
    region: leerValorSelect('filtro-region'),
    indicador: leerValorSelect('filtro-indicador'),
  };
}

function leerValorSelect(id) {
  const sel = document.getElementById(id);
  return sel ? sel.value : '';
}

/** Registra eventos en filtros y botones */
function registrarEventos() {
  // Cada cambio de filtro actualiza todo
  ['filtro-anio', 'filtro-trimestre', 'filtro-mes', 'filtro-entidad', 'filtro-region', 'filtro-indicador'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('change', updateAll);
  });

  // Botón limpiar filtros
  const btnLimpiar = document.getElementById('btn-limpiar-filtros');
  if (btnLimpiar) btnLimpiar.addEventListener('click', limpiarFiltros);

  // Navegación de pestañas
  document.querySelectorAll('.tab-btn, [data-tab]').forEach(btn => {
    btn.addEventListener('click', () => {
      const tab = btn.dataset.tab || btn.getAttribute('data-tab') || btn.dataset.target;
      if (tab) cambiarTab(tab);
    });
  });

  // Botones OLAP
  const btnDrillDown = document.getElementById('btn-drill-down');
  if (btnDrillDown) btnDrillDown.addEventListener('click', olapDrillDown);

  const btnRollUp = document.getElementById('btn-roll-up');
  if (btnRollUp) btnRollUp.addEventListener('click', olapRollUp);

  const btnPivot = document.getElementById('btn-pivot');
  if (btnPivot) btnPivot.addEventListener('click', olapPivot);

  const btnSlice = document.getElementById('btn-slice');
  if (btnSlice) btnSlice.addEventListener('click', olapSlice);

  const btnDice = document.getElementById('btn-dice');
  if (btnDice) btnDice.addEventListener('click', olapDice);

  const btnResetOLAP = document.getElementById('btn-reset-olap');
  if (btnResetOLAP) btnResetOLAP.addEventListener('click', resetOLAP);

  // Selectores de eje fila/columna
  const rowAxisSel = document.getElementById('olap-row-axis');
  if (rowAxisSel) rowAxisSel.addEventListener('change', function() { olapChangeRowAxis(this.value); });

  const colAxisSel = document.getElementById('olap-col-axis');
  if (colAxisSel) colAxisSel.addEventListener('change', function() { olapChangeColAxis(this.value); });

  // Modal drill-through
  const btnCloseModal = document.getElementById('olap-drill-close');
  if (btnCloseModal) btnCloseModal.addEventListener('click', olapCloseDrillThrough);
  const modalOverlay = document.getElementById('olap-drill-modal');
  if (modalOverlay) modalOverlay.addEventListener('click', function(e) {
    if (e.target === this) olapCloseDrillThrough();
  });

  // Poblar selects de valores OLAP cuando cambia el campo
  const olapSliceField = document.getElementById('olap-slice-field');
  if (olapSliceField) {
    olapSliceField.addEventListener('change', () => poblarOlapValores('olap-slice-field', 'olap-slice-value'));
    poblarOlapValores('olap-slice-field', 'olap-slice-value');
  }
  const olapDiceField = document.getElementById('olap-dice-field');
  if (olapDiceField) {
    olapDiceField.addEventListener('change', () => poblarOlapValores('olap-dice-field', 'olap-dice-value'));
    poblarOlapValores('olap-dice-field', 'olap-dice-value');
  }

  // Page dimension controls
  const pageAxisSel = document.getElementById('olap-page-axis');
  if (pageAxisSel) pageAxisSel.addEventListener('change', function() { olapChangePageAxis(this.value); });

  const pageValSel = document.getElementById('olap-page-value');
  if (pageValSel) pageValSel.addEventListener('change', function() { olapChangePageValue(this.value); });

  const btnPagePrev = document.getElementById('btn-page-prev');
  if (btnPagePrev) btnPagePrev.addEventListener('click', olapPrevPage);

  const btnPageNext = document.getElementById('btn-page-next');
  if (btnPageNext) btnPageNext.addEventListener('click', olapNextPage);

  poblarOlapPageValues();
}

/** Resetea todos los filtros y actualiza */
function limpiarFiltros() {
  ['filtro-anio', 'filtro-trimestre', 'filtro-mes', 'filtro-entidad', 'filtro-region', 'filtro-indicador'].forEach(id => {
    const sel = document.getElementById(id);
    if (sel) sel.selectedIndex = 0;
  });
  updateAll();
}

/** Pobla el select de valores OLAP según el campo seleccionado */
function poblarOlapValores(idCampo, idValor) {
  const campo = document.getElementById(idCampo);
  const valor = document.getElementById(idValor);
  if (!campo || !valor) return;

  const tipo = campo.value;
  let opciones = [];

  if (tipo === 'region') {
    opciones = DIMENSIONES.region.map(r => ({ valor: r.id_region, texto: r.region }));
  } else if (tipo === 'entidad') {
    opciones = DIMENSIONES.entidad.map(e => ({ valor: e.id_entidad, texto: e.entidad }));
  } else if (tipo === 'indicador') {
    opciones = DIMENSIONES.indicador.map(i => ({ valor: i.id_indicador, texto: i.indicador }));
  } else if (tipo === 'tiempo') {
    const anios = [...new Set(DIMENSIONES.tiempo.map(t => t.anio))].sort((a, b) => a - b);
    opciones = anios.map(a => ({ valor: String(a), texto: String(a) }));
  }

  valor.innerHTML = '<option value="">Seleccionar valor...</option>';
  opciones.forEach(op => {
    const option = document.createElement('option');
    option.value = op.valor;
    option.textContent = op.texto;
    valor.appendChild(option);
  });
}

// ═══════════════════════════════════════════════════════════════
// Actualización general
// ═══════════════════════════════════════════════════════════════
function updateAll() {
  const filtros = leerFiltros();
  const datos = DataManager.filtrar(filtros);

  calcularKPIs(datos);
  renderOLAP(datos);
  renderGraficas(datos);
  renderAnomalias(datos);
  renderHallazgos(datos);
  renderInterpretacion(datos);
  renderDecisiones(datos);
}

// ═══════════════════════════════════════════════════════════════
// KPIs
// ═══════════════════════════════════════════════════════════════
function calcularKPIs(datos) {
  if (!datos || datos.length === 0) {
    setKPI('kpi-total', '$0');
    setKPI('kpi-promedio', '$0');
    setKPI('kpi-meta', '$0');
    setKPI('kpi-cumplimiento', '0%');
    setKPI('kpi-variacion', '0%');
    setKPI('kpi-mejor-region', 'N/A');
    setKPI('kpi-peor-region', 'N/A');
    setKPI('kpi-mejor-entidad', 'N/A');
    setKPI('kpi-peor-entidad', 'N/A');
    return;
  }

  // Total
  const total = datos.reduce((s, d) => s + (d.valor || 0), 0);
  setKPI('kpi-total', '$' + total.toLocaleString('es-MX'));

  // Promedio
  const promedio = total / datos.length;
  setKPI('kpi-promedio', '$' + promedio.toLocaleString('es-MX', { maximumFractionDigits: 2 }));

  // Meta promedio
  const metaPromedio = datos.reduce((s, d) => s + (d.meta || 0), 0) / datos.length;
  setKPI('kpi-meta', '$' + metaPromedio.toLocaleString('es-MX', { maximumFractionDigits: 2 }));

  // Cumplimiento global
  const totalMeta = datos.reduce((s, d) => s + (d.meta || 0), 0);
  const cumplimiento = totalMeta !== 0 ? (total / totalMeta) * 100 : 0;
  setKPI('kpi-cumplimiento', cumplimiento.toLocaleString('es-MX', { maximumFractionDigits: 1 }) + '%');

  // Variación promedio
  const variacion = datos.reduce((s, d) => s + (d.variacion || 0), 0) / datos.length;
  setKPI('kpi-variacion', variacion.toLocaleString('es-MX', { maximumFractionDigits: 1 }) + '%');

  // Mejor/peor región
  const porRegion = DataManager.agregarPorRegion(datos);
  if (porRegion && porRegion.length > 0) {
    const mejorRegion = porRegion.reduce((a, b) => (a.promedio || 0) > (b.promedio || 0) ? a : b);
    const peorRegion = porRegion.reduce((a, b) => (a.promedio || 0) < (b.promedio || 0) ? a : b);
    setKPI('kpi-mejor-region', `${mejorRegion.nombre || mejorRegion.id_region} (${(mejorRegion.promedio || 0).toLocaleString('es-MX', { maximumFractionDigits: 0 })})`);
    setKPI('kpi-peor-region', `${peorRegion.nombre || peorRegion.id_region} (${(peorRegion.promedio || 0).toLocaleString('es-MX', { maximumFractionDigits: 0 })})`);
  }

  // Mejor/peor entidad
  const porEntidad = DataManager.agregarPorEntidad(datos);
  if (porEntidad && porEntidad.length > 0) {
    const mejorEntidad = porEntidad.reduce((a, b) => (a.promedio || 0) > (b.promedio || 0) ? a : b);
    const peorEntidad = porEntidad.reduce((a, b) => (a.promedio || 0) < (b.promedio || 0) ? a : b);
    setKPI('kpi-mejor-entidad', `${mejorEntidad.nombre || mejorEntidad.id_entidad} (${(mejorEntidad.promedio || 0).toLocaleString('es-MX', { maximumFractionDigits: 0 })})`);
    setKPI('kpi-peor-entidad', `${peorEntidad.nombre || peorEntidad.id_entidad} (${(peorEntidad.promedio || 0).toLocaleString('es-MX', { maximumFractionDigits: 0 })})`);
  }
}

function setKPI(id, texto) {
  const el = document.getElementById(id);
  if (el) el.textContent = texto;
}

// ═══════════════════════════════════════════════════════════════
// Gráficas (Chart.js)
// ═══════════════════════════════════════════════════════════════
function renderGraficas(datos) {
  if (!datos || datos.length === 0) return;

  graficaTemporal(datos);
  graficaRegion(datos);
  graficaEntidad(datos);
  graficaIndicador(datos);
  graficaCumplimiento(datos);
  graficaVariacion(datos);
}

/** Destruye una instancia de chart si existe */
function destroyChart(id) {
  if (chartInstances[id]) {
    chartInstances[id].destroy();
    chartInstances[id] = null;
  }
}

// 1. Gráfica temporal - Línea: evolución por año (población promedio)
function graficaTemporal(datos) {
  destroyChart('chart-temporal');
  const el = document.getElementById('chart-temporal');
  if (!el) return;

  const porTiempo = DataManager.agregarPorTiempo(datos);
  if (!porTiempo || porTiempo.length === 0) return;

  // Agrupar por año
  const anioMap = {};
  porTiempo.forEach(d => {
    const tiempo = DataManager.getTiempo(d.id_tiempo);
    const anio = tiempo ? tiempo.anio : d.nombre;
    if (!anioMap[anio]) anioMap[anio] = { suma: 0, count: 0 };
    anioMap[anio].suma += d.promedio || 0;
    anioMap[anio].count += 1;
  });

  const labels = Object.keys(anioMap).sort();
  const valores = labels.map(a => +(anioMap[a].suma / anioMap[a].count).toFixed(2));

  chartInstances['chart-temporal'] = new Chart(el, {
    type: 'line',
    data: {
      labels,
      datasets: [{
        label: 'Población promedio',
        data: valores,
        borderColor: COLORES[0],
        backgroundColor: COLORES[0] + '33',
        fill: true,
        tension: 0.3,
        pointRadius: 5,
        pointBackgroundColor: COLORES[0],
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: true } },
      scales: {
        y: { beginAtZero: false }
      }
    }
  });
}

// 2. Gráfica región - Barras verticales
function graficaRegion(datos) {
  destroyChart('chart-region');
  const el = document.getElementById('chart-region');
  if (!el) return;

  const porRegion = DataManager.agregarPorRegion(datos);
  if (!porRegion || porRegion.length === 0) return;

  const labels = porRegion.map(r => r.nombre || r.id_region);
  const valores = porRegion.map(r => r.promedio || r.valor || 0);

  chartInstances['chart-region'] = new Chart(el, {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        label: 'Promedio por región',
        data: valores,
        backgroundColor: COLORES.slice(0, labels.length),
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: true } },
      scales: { y: { beginAtZero: true } }
    }
  });
}

// 3. Gráfica entidad - Barras horizontales (top 15)
function graficaEntidad(datos) {
  destroyChart('chart-entidad');
  const el = document.getElementById('chart-entidad');
  if (!el) return;

  const porEntidad = DataManager.agregarPorEntidad(datos);
  if (!porEntidad || porEntidad.length === 0) return;

  // Ordenar por promedio descendente, tomar top 15
  const top = porEntidad
    .sort((a, b) => (b.promedio || b.valor || 0) - (a.promedio || a.valor || 0))
    .slice(0, 15);

  const labels = top.map(e => e.nombre || e.id_entidad);
  const valores = top.map(e => e.promedio || e.valor || 0);

  chartInstances['chart-entidad'] = new Chart(el, {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        label: 'Top 15 entidades',
        data: valores,
        backgroundColor: COLORES.slice(0, labels.length),
      }]
    },
    options: {
      indexAxis: 'y',
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: true } },
      scales: { x: { beginAtZero: true } }
    }
  });
}

// 4. Gráfica indicador - Radar
function graficaIndicador(datos) {
  destroyChart('chart-indicador');
  const el = document.getElementById('chart-indicador');
  if (!el) return;

  const porIndicador = DataManager.agregarPorIndicador(datos);
  if (!porIndicador || porIndicador.length === 0) return;

  const labels = porIndicador.map(i => i.nombre || i.id_indicador);
  const valores = porIndicador.map(i => i.promedio || i.valor || 0);

  chartInstances['chart-indicador'] = new Chart(el, {
    type: 'radar',
    data: {
      labels,
      datasets: [{
        label: 'Comparación de indicadores',
        data: valores,
        backgroundColor: COLORES[1] + '44',
        borderColor: COLORES[1],
        pointBackgroundColor: COLORES[1],
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: true } },
      scales: { r: { beginAtZero: true } }
    }
  });
}

// 5. Gráfica cumplimiento - Dona
function graficaCumplimiento(datos) {
  destroyChart('chart-cumplimiento');
  const el = document.getElementById('chart-cumplimiento');
  if (!el) return;

  // Distribución: cumplimiento alto (>=80%), medio (50-79%), bajo (<50%)
  let alto = 0, medio = 0, bajo = 0;
  datos.forEach(d => {
    const pc = d.porcentaje_cumplimiento || (d.meta ? (d.valor / d.meta) * 100 : 0);
    if (pc >= 80) alto++;
    else if (pc >= 50) medio++;
    else bajo++;
  });

  chartInstances['chart-cumplimiento'] = new Chart(el, {
    type: 'doughnut',
    data: {
      labels: ['Alto (≥80%)', 'Medio (50-79%)', 'Bajo (<50%)'],
      datasets: [{
        data: [alto, medio, bajo],
        backgroundColor: ['#2e7d32', '#f57f17', '#c62828'],
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { position: 'bottom' } }
    }
  });
}

// 6. Gráfica variación - Barras por entidad
function graficaVariacion(datos) {
  destroyChart('chart-variacion');
  const el = document.getElementById('chart-variacion');
  if (!el) return;

  const porEntidad = DataManager.agregarPorEntidad(datos);
  if (!porEntidad || porEntidad.length === 0) return;

  // Tomar las primeras 20 entidades
  const subset = porEntidad.slice(0, 20);
  const labels = subset.map(e => e.nombre || e.id_entidad);
  const valores = subset.map(e => e.variacionPromedio || e.variacion || 0);

  chartInstances['chart-variacion'] = new Chart(el, {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        label: 'Variación promedio',
        data: valores,
        backgroundColor: valores.map(v => v >= 0 ? COLORES[2] : COLORES[4]),
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: true } },
      scales: { y: { beginAtZero: false } }
    }
  });
}

// ═══════════════════════════════════════════════════════════════
// Detección de anomalías
// ═══════════════════════════════════════════════════════════════
function renderAnomalias(datos) {
  const tbody = document.getElementById('anomalias-table');
  const countEl = document.getElementById('anomalias-count');
  const countDetailEl = document.getElementById('anomalias-count-detail');
  if (!tbody) return;

  if (!datos || datos.length === 0) {
    tbody.innerHTML = '<tr><td colspan="8" class="text-center">No hay datos para analizar.</td></tr>';
    if (countEl) countEl.textContent = '0';
    if (countDetailEl) countDetailEl.textContent = '0';
    return;
  }

  const anomalias = DataManager.detectarAnomalias(datos);

  if (!anomalias || anomalias.length === 0) {
    tbody.innerHTML = '<tr><td colspan="8" class="text-center">No se detectaron anomalías.</td></tr>';
    if (countEl) countEl.textContent = '0';
    if (countDetailEl) countDetailEl.textContent = '0';
    return;
  }

  if (countEl) countEl.textContent = anomalias.length;
  if (countDetailEl) countDetailEl.textContent = anomalias.length;

  let html = '';
  anomalias.forEach(a => {
    const fecha = a.fecha || a.id_tiempo;
    const nombreEntidad = a.entidad || a.id_entidad;
    const nombreRegion = a.region || a.id_region;
    const nombreIndicador = a.indicador || a.id_indicador;
    const valor = a.valor != null ? a.valor.toLocaleString('es-MX', { maximumFractionDigits: 2 }) : 'N/A';
    const promedio = a.promedio != null ? a.promedio.toLocaleString('es-MX', { maximumFractionDigits: 2 }) : 'N/A';
    const zScore = a.zScore != null ? a.zScore.toLocaleString('es-MX', { maximumFractionDigits: 2 }) : 'N/A';
    const tipo = a.tipo || 'Desconocido';

    let claseFila = '';
    if (tipo.includes('Incremento')) {
      claseFila = 'anomaly--positive';
    } else {
      claseFila = 'anomaly--negative';
    }

    html += `<tr class="${claseFila}">
      <td>${fecha}</td>
      <td>${nombreEntidad}</td>
      <td>${nombreRegion}</td>
      <td>${nombreIndicador}</td>
      <td class="text-right">${valor}</td>
      <td class="text-right">${promedio}</td>
      <td class="text-right">${zScore}</td>
      <td>${tipo}</td>
    </tr>`;
  });

  tbody.innerHTML = html;
}

// ═══════════════════════════════════════════════════════════════
// Hallazgos
// ═══════════════════════════════════════════════════════════════
function renderHallazgos(datos) {
  const contenedor = document.getElementById('hallazgos-content');
  if (!contenedor) return;

  if (!datos || datos.length === 0) {
    contenedor.innerHTML = '<p>No hay datos suficientes para generar hallazgos.</p>';
    return;
  }

  const hallazgos = [];

  // Mejor y peor indicador
  const porIndicador = DataManager.agregarPorIndicador(datos);
  if (porIndicador && porIndicador.length > 0) {
    const mejorI = porIndicador.reduce((a, b) => (a.promedio || 0) > (b.promedio || 0) ? a : b);
    const peorI = porIndicador.reduce((a, b) => (a.promedio || 0) < (b.promedio || 0) ? a : b);
    hallazgos.push(`El indicador con mayor rendimiento promedio es <strong>${mejorI.nombre || mejorI.id_indicador}</strong> con ${(mejorI.promedio || 0).toLocaleString('es-MX', { maximumFractionDigits: 0 })}.`);
    hallazgos.push(`El indicador con menor rendimiento promedio es <strong>${peorI.nombre || peorI.id_indicador}</strong> con ${(peorI.promedio || 0).toLocaleString('es-MX', { maximumFractionDigits: 0 })}.`);
  }

  // Mejor y peor región
  const porRegion = DataManager.agregarPorRegion(datos);
  if (porRegion && porRegion.length > 0) {
    const mejorR = porRegion.reduce((a, b) => (a.promedio || 0) > (b.promedio || 0) ? a : b);
    const peorR = porRegion.reduce((a, b) => (a.promedio || 0) < (b.promedio || 0) ? a : b);
    hallazgos.push(`La región con mejor desempeño es <strong>${mejorR.nombre || mejorR.id_region}</strong>.`);
    hallazgos.push(`La región con peor desempeño es <strong>${peorR.nombre || peorR.id_region}</strong>.`);
  }

  // Mejor y peor entidad
  const porEntidad = DataManager.agregarPorEntidad(datos);
  if (porEntidad && porEntidad.length > 0) {
    const mejorE = porEntidad.reduce((a, b) => (a.promedio || 0) > (b.promedio || 0) ? a : b);
    const peorE = porEntidad.reduce((a, b) => (a.promedio || 0) < (b.promedio || 0) ? a : b);
    hallazgos.push(`La entidad con mayor valor es <strong>${mejorE.nombre || mejorE.id_entidad}</strong>.`);
    hallazgos.push(`La entidad con menor valor es <strong>${peorE.nombre || peorE.id_entidad}</strong>.`);
  }

  // Máxima y mínima variación (crecimiento y decrecimiento)
  let maxVariacion = { variacion: -Infinity, entidad: '' };
  let minVariacion = { variacion: Infinity, entidad: '' };
  datos.forEach(d => {
    if (d.variacion != null) {
      const entidad = DataManager.getEntidad(d.id_entidad);
      const nombreE = entidad ? entidad.entidad : d.id_entidad;
      if (d.variacion > maxVariacion.variacion) maxVariacion = { variacion: d.variacion, entidad: nombreE };
      if (d.variacion < minVariacion.variacion) minVariacion = { variacion: d.variacion, entidad: nombreE };
    }
  });
  if (maxVariacion.variacion !== -Infinity) {
    hallazgos.push(`Mayor crecimiento: <strong>${maxVariacion.entidad}</strong> con ${maxVariacion.variacion.toLocaleString('es-MX', { maximumFractionDigits: 1 })}%.`);
  }
  if (minVariacion.variacion !== Infinity) {
    hallazgos.push(`Mayor decrecimiento: <strong>${minVariacion.entidad}</strong> con ${minVariacion.variacion.toLocaleString('es-MX', { maximumFractionDigits: 1 })}%.`);
  }

  // Mayor y menor cumplimiento
  let maxCumplimiento = -Infinity;
  let minCumplimiento = Infinity;
  let entidadMaxCum = '';
  let entidadMinCum = '';
  datos.forEach(d => {
    const pc = d.porcentaje_cumplimiento || (d.meta ? (d.valor / d.meta) * 100 : null);
    if (pc != null) {
      const entidad = DataManager.getEntidad(d.id_entidad);
      const nombreE = entidad ? entidad.entidad : d.id_entidad;
      if (pc > maxCumplimiento) { maxCumplimiento = pc; entidadMaxCum = nombreE; }
      if (pc < minCumplimiento) { minCumplimiento = pc; entidadMinCum = nombreE; }
    }
  });
  if (maxCumplimiento !== -Infinity) {
    hallazgos.push(`Mayor cumplimiento: <strong>${entidadMaxCum}</strong> con ${maxCumplimiento.toLocaleString('es-MX', { maximumFractionDigits: 1 })}%.`);
  }
  if (minCumplimiento !== Infinity) {
    hallazgos.push(`Menor cumplimiento: <strong>${entidadMinCum}</strong> con ${minCumplimiento.toLocaleString('es-MX', { maximumFractionDigits: 1 })}%.`);
  }

  contenedor.innerHTML = '<ul class="list-group list-group-flush">' +
    hallazgos.map(h => `<li class="list-group-item">${h}</li>`).join('') +
    '</ul>';
}

// ═══════════════════════════════════════════════════════════════
// Interpretación de resultados
// ═══════════════════════════════════════════════════════════════
function renderInterpretacion(datos) {
  const contenedor = document.getElementById('interpretacion-content');
  if (!contenedor) return;

  if (!datos || datos.length === 0) {
    contenedor.innerHTML = '<p>No hay datos suficientes para generar interpretación.</p>';
    return;
  }

  // Estadísticas generales
  const total = datos.reduce((s, d) => s + (d.valor || 0), 0);
  const totalMeta = datos.reduce((s, d) => s + (d.meta || 0), 0);
  const cumplimiento = totalMeta !== 0 ? ((total / totalMeta) * 100) : 0;
  const variacionProm = datos.reduce((s, d) => s + (d.variacion || 0), 0) / datos.length;

  // Anomalías
  const anomalias = DataManager.detectarAnomalias(datos);
  const numAnomalias = anomalias ? anomalias.length : 0;

  const promedio = datos.length > 0 ? total / datos.length : 0;
  const stats = DataManager.calcularEstadisticas(datos.map(d => d.valor));

  let html = '';

  // ¿Qué está sucediendo?
  html += `<h5>¿Qué está sucediendo?</h5>`;
  html += `<p>Se analizaron <strong>${datos.length}</strong> registros. El valor total es de <strong>$${total.toLocaleString('es-MX')}</strong> `;
  html += `con un promedio de <strong>$${promedio.toLocaleString('es-MX', { maximumFractionDigits: 2 })}</strong>. `;
  html += `El cumplimiento global es del <strong>${cumplimiento.toLocaleString('es-MX', { maximumFractionDigits: 1 })}%</strong>. `;
  html += `La variación promedio es del <strong>${variacionProm.toLocaleString('es-MX', { maximumFractionDigits: 1 })}%</strong>.</p>`;

  // ¿Qué evidencia lo muestra?
  html += `<h5>¿Qué evidencia lo muestra?</h5>`;
  html += `<p>Se dispone de ${datos.length} registros de datos. `;
  if (stats) {
    html += `La desviación estándar es de <strong>${(stats.desviacion || 0).toLocaleString('es-MX', { maximumFractionDigits: 2 })}</strong>, `;
    html += `lo que indica ${stats.desviacion > promedio * 0.5 ? 'una alta dispersión' : 'una dispersión moderada'} en los datos. `;
  }
  html += `Se detectaron <strong>${numAnomalias}</strong> anomalías estadísticas (valores con z-score significativo).</p>`;

  // ¿Qué evidencia relacionada hay?
  html += `<h5>¿Qué evidencia relacionada hay?</h5>`;
  if (numAnomalias > 0) {
    html += `<p>Las ${numAnomalias} anomalías detectadas pueden indicar registros extraordinarios que requieren atención especial. `;
    html += `Estos valores atípicos pueden representar oportunidades de mejora o situaciones de riesgo.</p>`;
  } else {
    html += `<p>No se detectaron anomalías significativas, lo que sugiere un comportamiento estable en los datos analizados.</p>`;
  }

  // ¿Qué podría suceder?
  html += `<h5>¿Qué podría suceder?</h5>`;
  if (cumplimiento < 70) {
    html += `<p>Con un cumplimiento del ${cumplimiento.toLocaleString('es-MX', { maximumFractionDigits: 1 })}%, `;
    html += `si la tendencia actual continúa, es probable que los objetivos no se alcancen. `;
    html += `Se recomienda implementar acciones correctivas.</p>`;
  } else if (cumplimiento < 90) {
    html += `<p>El cumplimiento es aceptable pero puede mejorar. Con intervención focalizada, `;
    html += `se podrían alcanzar niveles superiores al 90%.</p>`;
  } else {
    html += `<p>Con un cumplimiento del ${cumplimiento.toLocaleString('es-MX', { maximumFractionDigits: 1 })}%, `;
    html += `la tendencia es positiva y se espera mantener o superar los objetivos.</p>`;
  }

  // ¿Qué decisiones se pueden tomar?
  html += `<h5>¿Qué decisiones se pueden tomar?</h5>`;
  html += `<ul>`;
  if (cumplimiento < 80) {
    html += `<li>Revisar estrategias en las áreas con menor cumplimiento.</li>`;
    html += `<li>Asignar recursos adicionales a las regiones/entidades con peor desempeño.</li>`;
  }
  if (numAnomalias > 0) {
    html += `<li>Investigar las anomalías detectadas para determinar causas raíz.</li>`;
  }
  if (variacionProm < 0) {
    html += `<li>Diseñar plan de acción para revertir la tendencia negativa.</li>`;
  } else {
    html += `<li>Mantener las buenas prácticas que están generando crecimiento positivo.</li>`;
  }
  html += `<li>Establecer metas trimestrales de seguimiento.</li>`;
  html += `<li>Realizar análisis comparativo con periodos anteriores.</li>`;
  html += `</ul>`;

  contenedor.innerHTML = html;
}

// ═══════════════════════════════════════════════════════════════
// Matriz de decisiones
// ═══════════════════════════════════════════════════════════════
function renderDecisiones(datos) {
  const tbody = document.getElementById('decisiones-table');
  if (!tbody) return;

  if (!datos || datos.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6" class="text-center">No hay datos suficientes.</td></tr>';
    return;
  }

  const total = datos.reduce((s, d) => s + (d.valor || 0), 0);
  const totalMeta = datos.reduce((s, d) => s + (d.meta || 0), 0);
  const cumplimiento = totalMeta !== 0 ? (total / totalMeta) * 100 : 0;
  const variacionProm = datos.reduce((s, d) => s + (d.variacion || 0), 0) / datos.length;
  const anomalias = DataManager.detectarAnomalias(datos);

  const filas = [];

  // Evidencia 1: Cumplimiento global
  if (cumplimiento < 80) {
    filas.push({
      evidencia: `Cumplimiento global del ${cumplimiento.toLocaleString('es-MX', { maximumFractionDigits: 1 })}%`,
      hallazgo: 'El cumplimiento está por debajo del 80%',
      riesgoOportunidad: 'Riesgo',
      decision: 'Implementar plan de mejora operativa con metas trimestrales',
      responsable: 'Dirección General',
      prioridad: 'Alta'
    });
  } else {
    filas.push({
      evidencia: `Cumplimiento global del ${cumplimiento.toLocaleString('es-MX', { maximumFractionDigits: 1 })}%`,
      hallazgo: 'El cumplimiento es aceptable',
      riesgoOportunidad: 'Oportunidad',
      decision: 'Mantener estrategia actual y buscar optimizaciones',
      responsable: 'Dirección de Operaciones',
      prioridad: 'Media'
    });
  }

  // Evidencia 2: Variación
  if (variacionProm < 0) {
    filas.push({
      evidencia: `Variación promedio de ${variacionProm.toLocaleString('es-MX', { maximumFractionDigits: 1 })}%`,
      hallazgo: 'Tendencia decreciente en los indicadores',
      riesgoOportunidad: 'Riesgo',
      decision: 'Realizar análisis de causa raíz y plan de acción correctivo',
      responsable: 'Gerencia de Análisis',
      prioridad: 'Alta'
    });
  } else {
    filas.push({
      evidencia: `Variación promedio de ${variacionProm.toLocaleString('es-MX', { maximumFractionDigits: 1 })}%`,
      hallazgo: 'Tendencia creciente positiva',
      riesgoOportunidad: 'Oportunidad',
      decision: 'Capitalizar el crecimiento con inversiones estratégicas',
      responsable: 'Dirección Estratégica',
      prioridad: 'Media'
    });
  }

  // Evidencia 3: Anomalías
  if (anomalias && anomalias.length > 0) {
    filas.push({
      evidencia: `${anomalias.length} anomalías detectadas en los datos`,
      hallazgo: 'Existen valores atípicos que requieren investigación',
      riesgoOportunidad: 'Riesgo',
      decision: 'Investigar cada anomalia y determinar acciones específicas',
      responsable: 'Equipo de Análisis de Datos',
      prioridad: 'Alta'
    });
  }

  // Evidencia 4: Región
  const porRegion = DataManager.agregarPorRegion(datos);
  if (porRegion && porRegion.length > 0) {
    const peorR = porRegion.reduce((a, b) => (a.promedio || 0) < (b.promedio || 0) ? a : b);
    const mejorR = porRegion.reduce((a, b) => (a.promedio || 0) > (b.promedio || 0) ? a : b);
    filas.push({
      evidencia: `Región "${mejorR.nombre || mejorR.id_region}" lidera, "${peorR.nombre || peorR.id_region}" se retrasa`,
      hallazgo: 'Existe brecha significativa entre regiones',
      riesgoOportunidad: 'Riesgo/Oportunidad',
      decision: 'Replicar buenas prácticas de la mejor región en la peor',
      responsable: 'Coordinación Regional',
      prioridad: 'Alta'
    });
  }

  // Evidencia 5: Entidad con menor cumplimiento
  const porEntidad = DataManager.agregarPorEntidad(datos);
  if (porEntidad && porEntidad.length > 0) {
    const peorE = porEntidad.reduce((a, b) => (a.promedio || 0) < (b.promedio || 0) ? a : b);
    filas.push({
      evidencia: `Entidad "${peorE.nombre || peorE.id_entidad}" con menor rendimiento`,
      hallazgo: 'Entidad con desempeño inferior al promedio',
      riesgoOportunidad: 'Riesgo',
      decision: 'Diseñar programa de acompañamiento para la entidad',
      responsable: 'Gerencia de Desarrollo Organizacional',
      prioridad: 'Media'
    });
  }

  // Renderizar tabla
  let html = '';
  filas.forEach(f => {
    const clasePrioridad = f.prioridad === 'Alta' ? 'table-danger' : (f.prioridad === 'Media' ? 'table-warning' : 'table-info');
    html += `<tr class="${clasePrioridad}">
      <td>${f.evidencia}</td>
      <td>${f.hallazgo}</td>
      <td>${f.riesgoOportunidad}</td>
      <td>${f.decision}</td>
      <td>${f.responsable}</td>
      <td>${f.prioridad}</td>
    </tr>`;
  });

  tbody.innerHTML = html;
}

// ═══════════════════════════════════════════════════════════════
// Navegación por pestañas
// ═══════════════════════════════════════════════════════════════
function cambiarTab(tabId) {
  // Ocultar todas las secciones de contenido
  const secciones = document.querySelectorAll('.tab-content, .tab-section, [id^="section-"]');
  secciones.forEach(s => {
    s.style.display = 'none';
    s.classList.remove('active');
  });

  // Mostrar la sección seleccionada
  const seccion = document.getElementById('section-' + tabId) || document.getElementById(tabId);
  if (seccion) {
    seccion.style.display = '';
    seccion.classList.add('active');
  }

  // Actualizar estado activo de botones de pestaña
  const botones = document.querySelectorAll('.tab-btn, [data-tab]');
  botones.forEach(b => {
    b.classList.remove('active');
    if ((b.dataset.tab || b.getAttribute('data-tab')) === tabId) {
      b.classList.add('active');
    }
  });
}
