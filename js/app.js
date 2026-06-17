/**
 * 世界历史地图交互网站 — 主应用逻辑
 * World History Map Interactive Web App
 */

// ===== 分类配置 =====
const CATEGORIES = {
  '文明起源': { class: 'cat-civilization', color: '#d97706', label: '文明起源' },
  '帝国统一': { class: 'cat-empire', color: '#dc2626', label: '帝国统一' },
  '帝国兴衰': { class: 'cat-empire', color: '#dc2626', label: '帝国兴衰' },
  '帝国建立': { class: 'cat-empire', color: '#dc2626', label: '帝国建立' },
  '宗教运动': { class: 'cat-religion', color: '#db2777', label: '宗教运动' },
  '宗教战争': { class: 'cat-religion', color: '#db2777', label: '宗教战争' },
  '征服战争': { class: 'cat-empire', color: '#dc2626', label: '征服战争' },
  '灾难事件': { class: 'cat-civilization', color: '#d97706', label: '灾难事件' },
  '地理大发现': { class: 'cat-exploration', color: '#16a34a', label: '地理大发现' },
  '革命运动': { class: 'cat-revolution', color: '#9333ea', label: '革命运动' },
  '现代化改革': { class: 'cat-revolution', color: '#9333ea', label: '现代化改革' },
  '世界大战': { class: 'cat-empire', color: '#dc2626', label: '世界大战' },
  '冷战终结': { class: 'cat-revolution', color: '#9333ea', label: '冷战终结' },
  '科技里程碑': { class: 'cat-exploration', color: '#16a34a', label: '科技里程碑' },
  '政治创新': { class: 'cat-revolution', color: '#9333ea', label: '政治创新' },
  '科技革命': { class: 'cat-exploration', color: '#16a34a', label: '科技革命' },
  '去殖民化': { class: 'cat-revolution', color: '#9333ea', label: '去殖民化' },
};

// ===== 全局状态 =====
let events = [];
let countries = [];
let countriesInfo = {};
let map;
let activeEventId = null;
let countryLayerGroup;
let markerLayerGroup;
let countryBoundaryCache = {};
let currentHoveredCountry = null;

// ===== 初始化地图 =====
function initMap() {
  map = L.map('map', {
    center: [25, 15],
    zoom: 3,
    zoomControl: true,
    minZoom: 2,
    maxZoom: 8,
    worldCopyJump: true,
  });

  // 使用 CartoDB 浅色底图（Positron）
  L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/">CARTO</a>',
    subdomains: 'abcd',
    maxZoom: 19,
  }).addTo(map);

  countryLayerGroup = L.layerGroup().addTo(map);
  markerLayerGroup = L.layerGroup().addTo(map);

  // 点击地图空白处 → 取消卡片锁定
  map.on('click', (e) => {
    // 检查是否点击在某个国家多边形上（通过检查点击位置是否有 GeoJSON 图层）
    const clickedLayers = [];
    map.eachLayer((layer) => {
      if (layer instanceof L.GeoJSON) {
        layer.eachLayer((feature) => {
          if (feature.getBounds && feature.getBounds().contains(e.latlng)) {
            clickedLayers.push(true);
          }
        });
      }
    });
    if (clickedLayers.length === 0) {
      infoCardPinned = false;
      clearTimeout(infoCardHideTimer);
      document.getElementById('countryInfoCard').classList.remove('visible', 'pinned');
    }
  });
}

// ===== 加载数据 =====
async function loadData() {
  try {
    const [eventsRes, countriesRes, infoRes] = await Promise.all([
      fetch('data/events.json'),
      fetch('data/countries.json'),
      fetch('data/countries-info.json'),
    ]);
    events = await eventsRes.json();
    countries = await countriesRes.json();
    countriesInfo = await infoRes.json();
    
    // 按年份排序
    events.sort((a, b) => a.year - b.year);
    
    renderAll();
  } catch (err) {
    console.error('数据加载失败:', err);
  }
}

// ===== 渲染所有组件 =====
function renderAll() {
  renderTimeline();
  renderMarkers();
  renderFilters();
  renderLegend();
  loadCountryBoundaries();
}

// ===== 渲染时间轴 =====
function renderTimeline(filterCategory = 'all', searchQuery = '') {
  const list = document.getElementById('timelineList');
  let filtered = events;

  // 按分类过滤
  if (filterCategory !== 'all') {
    filtered = filtered.filter(e => e.category === filterCategory);
  }

  // 按搜索词过滤
  if (searchQuery) {
    const q = searchQuery.toLowerCase();
    filtered = filtered.filter(e =>
      e.title.toLowerCase().includes(q) ||
      e.description.toLowerCase().includes(q) ||
      e.location.toLowerCase().includes(q) ||
      e.displayYear.includes(q) ||
      e.region.toLowerCase().includes(q)
    );
  }

  if (filtered.length === 0) {
    list.innerHTML = '<div class="no-results">没有找到匹配的历史事件</div>';
    return;
  }

  // 按世纪分组
  let html = '';
  let lastCentury = null;

  filtered.forEach(event => {
    const century = getCentury(event.year);
    if (century !== lastCentury) {
      html += `<div class="timeline-jump">${century}</div>`;
      lastCentury = century;
    }

    const catConfig = CATEGORIES[event.category] || { class: '', color: '#0284c7' };
    const isActive = event.id === activeEventId;

    html += `
      <div class="timeline-item ${catConfig.class} ${isActive ? 'active' : ''}"
           data-event-id="${event.id}"
           onclick="selectEvent(${event.id})">
        <div class="timeline-dot"></div>
        <div class="timeline-content">
          <div class="timeline-year">${event.displayYear}</div>
          <div class="timeline-title">${event.title}</div>
          <div class="timeline-location">📍 ${event.location}</div>
          <span class="timeline-category">${event.category}</span>
        </div>
      </div>
    `;
  });

  list.innerHTML = html;

  // 滚动到激活项
  if (activeEventId) {
    setTimeout(() => {
      const activeItem = list.querySelector('.timeline-item.active');
      if (activeItem) {
        activeItem.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 100);
  }
}

// ===== 获取世纪标签 =====
function getCentury(year) {
  if (year < 0) {
    const c = Math.ceil(Math.abs(year) / 100);
    return `公元前 ${c} 世纪`;
  }
  const c = Math.ceil(year / 100);
  return `公元 ${c} 世纪`;
}

// ===== 渲染地图标记 =====
function renderMarkers() {
  markerLayerGroup.clearLayers();

  events.forEach(event => {
    const catConfig = CATEGORIES[event.category] || { color: '#0284c7' };
    const color = catConfig.color;

    const icon = L.divIcon({
      className: 'custom-marker',
      html: `
        <div style="
          width: 16px; height: 16px;
          background: ${color};
          border-radius: 50%;
          box-shadow: 0 0 12px ${color}66;
          border: 2px solid #1e293b;
          position: relative;
        ">
          <div style="
            position: absolute; top: -4px; left: -4px;
            width: 24px; height: 24px;
            border-radius: 50%;
            border: 2px solid ${color};
            animation: pulse 2s infinite;
            opacity: 0;
          "></div>
        </div>
      `,
      iconSize: [16, 16],
      iconAnchor: [8, 8],
    });

    const marker = L.marker([event.lat, event.lng], { icon })
      .bindTooltip(`${event.displayYear} — ${event.title}`, {
        direction: 'top',
        offset: [0, -12],
      });

    marker.on('click', () => selectEvent(event.id));
    markerLayerGroup.addLayer(marker);
  });
}

// ===== 选择事件 =====
function selectEvent(eventId) {
  activeEventId = eventId;
  const event = events.find(e => e.id === eventId);
  if (!event) return;

  // 取消国家信息卡片锁定状态
  infoCardPinned = false;
  clearTimeout(infoCardHideTimer);
  document.getElementById('countryInfoCard').classList.remove('visible', 'pinned');

  // 更新时间轴高亮
  document.querySelectorAll('.timeline-item').forEach(item => {
    item.classList.toggle('active', parseInt(item.dataset.eventId) === eventId);
  });

  // 地图飞行（更丝滑的动画）
  const flyDuration = 2200; // ms，与 duration: 2.2 对应
  map.flyTo([event.lat, event.lng], 5, {
    duration: 2.2,
    easeLinearity: [0.25, 0.75],
  });

  // 飞行到达后，再平滑打开详情面板
  const onMoveEnd = () => {
    map.off('moveend', onMoveEnd);
    requestAnimationFrame(() => {
      renderDetail(event);
      panel.classList.add('open');
    });
  };
  map.once('moveend', onMoveEnd);
  // 保险：最长 3 秒后也执行（防止 flyTo 被中断时不打开面板）
  setTimeout(() => {
    map.off('moveend', onMoveEnd);
    if (!panel.classList.contains('open')) {
      renderDetail(event);
      panel.classList.add('open');
    }
  }, 3200);

  // 更新年份指示器（立即更新，无需等待飞行）
  document.getElementById('yearDisplay').textContent = `${event.displayYear} — ${event.title}`;

  // 高亮对应国家（无需等待飞行）
  highlightCountry(event);

  // 滚动时间轴（在下一帧执行，让 panel 类先更新）
  requestAnimationFrame(() => {
    const activeItem = document.querySelector('.timeline-item.active');
    if (activeItem) {
      activeItem.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  });
}

// ===== 渲染详情面板 =====
function renderDetail(event) {
  const panel = document.getElementById('detailPanel');
  const content = document.getElementById('detailContent');
  const title = document.getElementById('detailTitle');

  panel.classList.add('open');
  title.textContent = event.title;

  // 使用简单的 Markdown 渲染
  let html = `
    <h2>${event.title}</h2>
    <div class="detail-meta">
      <span class="detail-meta-item year">${event.displayYear}</span>
      <span class="detail-meta-item">📍 ${event.location}</span>
      <span class="detail-meta-item">🌍 ${event.region}</span>
      <span class="detail-meta-item">🏷 ${event.category}</span>
    </div>
    <div class="detail-body">
      ${renderMarkdown(event.detail)}
    </div>
  `;

  content.innerHTML = html;
  content.classList.add('animating');
  setTimeout(() => content.classList.remove('animating'), 350);
}

// ===== 简单 Markdown 渲染 =====
function renderMarkdown(md) {
  let html = md;

  // 标题
  html = html.replace(/^### (.+)$/gm, '<h3>$1</h3>');
  html = html.replace(/^## (.+)$/gm, '<h2>$1</h2>');

  // 粗体和斜体
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');

  // 引用块
  html = html.replace(/^> (.+)$/gm, '<blockquote>$1</blockquote>');

  // 合并连续的引用块
  html = html.replace(/<\/blockquote>\n<blockquote>/g, '<br>');

  // 无序列表
  html = html.replace(/^- (.+)$/gm, '<li>$1</li>');
  html = html.replace(/((?:<li>.*<\/li>\n?)+)/g, '<ul>$1</ul>');

  // 有序列表
  html = html.replace(/^\d+\. (.+)$/gm, '<li>$1</li>');

  // 段落（用双换行分隔）
  const parts = html.split('\n\n');
  html = parts.map(part => {
    const trimmed = part.trim();
    if (!trimmed) return '';
    if (trimmed.startsWith('<h') || trimmed.startsWith('<ul') ||
        trimmed.startsWith('<ol') || trimmed.startsWith('<blockquote')) {
      return trimmed;
    }
    // 处理单换行
    return '<p>' + trimmed.replace(/\n/g, '<br>') + '</p>';
  }).join('\n');

  return html;
}

// ===== 渲染筛选标签 =====
function renderFilters() {
  const container = document.getElementById('filterTags');
  const categories = [...new Set(events.map(e => e.category))];

  let html = '<button class="tag active" data-category="all" onclick="filterByCategory(\'all\')">全部</button>';
  categories.forEach(cat => {
    html += `<button class="tag" data-category="${cat}" onclick="filterByCategory('${cat}')">${cat}</button>`;
  });

  container.innerHTML = html;
}

// ===== 按分类过滤 =====
function filterByCategory(category) {
  // 更新标签状态
  document.querySelectorAll('.tag').forEach(tag => {
    tag.classList.toggle('active', tag.dataset.category === category);
  });

  const searchQuery = document.getElementById('searchInput').value;
  renderTimeline(category, searchQuery);
  renderMarkersFiltered(category);
}

// ===== 按分类过滤标记 =====
function renderMarkersFiltered(category) {
  markerLayerGroup.clearLayers();

  const filtered = category === 'all' ? events : events.filter(e => e.category === category);

  filtered.forEach(event => {
    const catConfig = CATEGORIES[event.category] || { color: '#0284c7' };
    const color = catConfig.color;

    const icon = L.divIcon({
      className: 'custom-marker',
      html: `
        <div style="
          width: 16px; height: 16px;
          background: ${color};
          border-radius: 50%;
          box-shadow: 0 0 12px ${color}66;
          border: 2px solid #1e293b;
        "></div>
      `,
      iconSize: [16, 16],
      iconAnchor: [8, 8],
    });

    const marker = L.marker([event.lat, event.lng], { icon })
      .bindTooltip(`${event.displayYear} — ${event.title}`, {
        direction: 'top',
        offset: [0, -12],
      });

    marker.on('click', () => selectEvent(event.id));
    markerLayerGroup.addLayer(marker);
  });
}

// ===== 渲染图例 =====
function renderLegend() {
  const container = document.getElementById('legendItems');
  const categories = [...new Set(events.map(e => e.category))];

  let html = '';
  categories.forEach(cat => {
    const config = CATEGORIES[cat] || { color: '#0284c7' };
    html += `
      <div class="legend-item">
        <div class="legend-dot" style="background: ${config.color}; box-shadow: 0 0 6px ${config.color}66;"></div>
        <span class="legend-label">${cat}</span>
      </div>
    `;
  });

  container.innerHTML = html;
}

// ===== 国家边界数据 =====
let countryGeoLayer = null; // 保存 GeoJSON 图层引用，用于标签显隐控制

async function loadCountryBoundaries() {
  try {
    const response = await fetch('https://raw.githubusercontent.com/datasets/geo-countries/master/data/countries.geojson');
    const geojson = await response.json();

    countryLayerGroup.clearLayers();

    // 用 ISO2 代码建立 countries.json 的索引（countries.json 的 code 是 ISO2）
    const countryByIso2 = {};
    countries.forEach(c => { countryByIso2[c.code] = c; });

    // 为每个 feature 挂载中文名 + 历史数据（如有）
    geojson.features.forEach(feature => {
      const props = feature.properties || {};
      const iso3 = props['ISO3166-1-Alpha-3'];
      const iso2 = props['ISO3166-1-Alpha-2'];
      const nameEn = props['name'];
      feature._zhName = getCountryNameZh(iso3, nameEn);
      feature._iso2 = iso2;
      feature._countryData = countryByIso2[iso2] || null;
    });

    const baseStyle = {
      fillColor: '#cbd5e1',
      fillOpacity: 0.5,
      color: '#94a3b8',
      weight: 0.8,
      opacity: 0.6,
    };
    const historyStyle = {
      fillColor: '#bae6fd',
      fillOpacity: 0.45,
      color: '#0284c7',
      weight: 1,
      opacity: 0.7,
    };

    countryGeoLayer = L.geoJSON(geojson, {
      style: (feature) => feature._countryData ? historyStyle : baseStyle,
      onEachFeature: (feature, layer) => {
        const zhName = feature._zhName;

        // 永久中文国名标签（按缩放级别控制显隐）
        layer.bindTooltip(zhName, {
          permanent: true,
          direction: 'center',
          className: 'country-label',
          offset: [0, 0],
        });

        const countryData = feature._countryData;

        // 所有国家都支持悬停高亮 + 信息卡片
        layer.on('mouseover', (e) => {
          showCountryInfoCard(feature._iso2, zhName, countryData);
          layer.setStyle({
            fillOpacity: 0.7,
            color: '#0284c7',
            weight: 2,
            opacity: 0.9,
          });
          layer.bringToFront();
          currentHoveredCountry = feature._iso2;
        });

        // 鼠标移出时不立即隐藏（由定时器控制）
        layer.on('mouseout', () => {
          // 如果没被锁定，定时器会自动隐藏
          layer.setStyle(feature._countryData ? historyStyle : baseStyle);
          currentHoveredCountry = null;
        });

        // 点击 → 锁定信息卡片常驻显示
        layer.on('click', () => {
          pinCountryInfoCard(feature._iso2, zhName, countryData);
          if (countryData) {
            showCountryEvents(countryData);
          }
        });
      },
    });

    countryLayerGroup.addLayer(countryGeoLayer);

    // 初始化标签显隐 + 缩放时动态控制
    updateCountryLabels();
    map.on('zoomend', updateCountryLabels);
  } catch (err) {
    console.error('加载国家边界数据失败:', err);
  }
}

// ===== 根据缩放级别控制国家名标签显隐 =====
function updateCountryLabels() {
  if (!countryGeoLayer) return;
  const zoom = map.getZoom();
  // zoom < 3（全球视图）隐藏标签避免拥挤；zoom >= 3 显示中文国名
  countryGeoLayer.eachLayer(layer => {
    if (zoom >= 3) {
      if (!layer.isTooltipOpen()) layer.openTooltip();
    } else {
      if (layer.isTooltipOpen()) layer.closeTooltip();
    }
  });
}

// ===== 高亮国家 =====
function highlightCountry(event) {
  // 优先按中文名匹配，再按英文名兜底
  const country = countries.find(c =>
    event.location.includes(c.nameZh) || event.location.includes(c.name)
  );

  if (country && countryGeoLayer) {
    countryGeoLayer.eachLayer(feature => {
      if (feature.feature && feature.feature._iso2 === country.code) {
        feature.setStyle({
          fillColor: '#0284c7',
          fillOpacity: 0.55,
          color: '#0284c7',
          weight: 2.5,
          opacity: 1,
        });
        feature.bringToFront();
        setTimeout(() => {
          feature.setStyle({
            fillColor: '#bae6fd',
            fillOpacity: 0.45,
            color: '#0284c7',
            weight: 1,
            opacity: 0.7,
          });
        }, 3000);
      }
    });
  }
}

// ===== 事件时间轴的 hover/click 交互 =====
let activeEventIdInCard = null;   // 三级展开的事件 ID
let eventPreviewTimer = null;

function bindEventInteractions() {
  const eventsContainer = document.getElementById('infoCardEvents');
  if (!eventsContainer) return;

  // 事件委托：hover 显示二级浮层（同期事件预览）
  eventsContainer.addEventListener('mouseover', (e) => {
    const eventEl = e.target.closest('.info-card-event');
    if (!eventEl) return;
    clearTimeout(eventPreviewTimer);
    showEventPreview(eventEl);
    // 高亮当前条目
    eventsContainer.querySelectorAll('.info-card-event').forEach(el => el.classList.remove('active'));
    eventEl.classList.add('active');
  });

  // 鼠标离开事件 → 延迟隐藏二级浮层
  eventsContainer.addEventListener('mouseout', (e) => {
    if (!e.relatedTarget || !eventsContainer.contains(e.relatedTarget)) {
      eventPreviewTimer = setTimeout(hideEventPreview, 200);
      eventsContainer.querySelectorAll('.info-card-event').forEach(el => el.classList.remove('active'));
    }
  });

  // 点击事件 → 三级展开完整详情
  eventsContainer.addEventListener('click', (e) => {
    const eventEl = e.target.closest('.info-card-event');
    if (!eventEl) return;
    const eventId = eventEl.dataset.eventId;
    const eventTitle = eventEl.dataset.eventTitle || '';
    const eventYear = parseInt(eventEl.dataset.year) || 0;
    if (!eventId) return;
    expandEventDetail(eventId, eventEl, { title: eventTitle, year: eventYear });
  });
}

// 查找指定年份 ±30 年内的相关事件
function findRelatedEvents(targetYear, excludeIds) {
  const windowYears = 30;
  return events.filter(ev => {
    if (excludeIds.includes(ev.id)) return false;
    const diff = Math.abs(ev.year - targetYear);
    return diff <= windowYears;
  }).sort((a, b) => a.year - b.year).slice(0, 6);
}

// 二级浮层：显示同期事件预览
function showEventPreview(eventEl) {
  const preview = document.getElementById('eventPreview');
  const inner = preview.querySelector('.event-preview-inner');
  if (!preview || !inner) return;

  const eventId = eventEl.dataset.eventId;
  const yearStr = parseInt(eventEl.dataset.year);

  // 找到匹配的完整事件数据
  const matchedEvent = events.find(e => String(e.id) === eventId);
  if (!matchedEvent) { preview.classList.remove('visible'); return; }

  // 找同期事件（±30 年）
  const related = findRelatedEvents(matchedEvent.year, [matchedEvent.id]);

  let html = '';
  if (related.length > 0) {
    html += `<div class="preview-title">📍 同期历史事件</div>`;
    html += '<div class="preview-list">';
    related.forEach(ev => {
      const yr = ev.year < 0 ? `前${Math.abs(ev.year)}` : ev.year;
      html += `
        <div class="preview-item" data-event-id="${ev.id}">
          <span class="preview-year">${yr}</span>
          <span class="preview-cat">${ev.category}</span>
          <span class="preview-title">${ev.title}</span>
        </div>
      `;
    });
    html += '</div>';
  }

  inner.innerHTML = html;
  preview.classList.add('visible');

  // 定位：在事件条目旁边弹出（用 offsetTop 相对于父容器定位）
  const parent = eventsContainer;
  const eventTop = eventEl.offsetTop;
  const eventHeight = eventEl.offsetHeight;
  preview.style.top = `${eventTop + eventHeight + 4}px`;
}

function hideEventPreview() {
  const preview = document.getElementById('eventPreview');
  if (preview) preview.classList.remove('visible');
}

// 三级展开：点击事件后，在时间轴下方展示完整详情
function expandEventDetail(eventId, eventEl, fallbackInfo) {
  const expanded = document.getElementById('eventDetailExpanded');
  if (!expanded) return;

  // 如果已展开同一个事件，则收起
  if (activeEventIdInCard === eventId && expanded.classList.contains('visible')) {
    expanded.classList.remove('visible');
    expanded.innerHTML = '';
    activeEventIdInCard = null;
    // 移除激活态
    document.querySelectorAll('.info-card-event.expanded').forEach(el => el.classList.remove('expanded'));
    return;
  }

  activeEventIdInCard = eventId;

  // 严格匹配：优先按 ID → 按标题精确 → 按标题+年份(±5年)模糊
  let evt = events.find(e => String(e.id) === eventId);
  if (!evt && fallbackInfo && fallbackInfo.title) {
    evt = events.find(e => e.title === fallbackInfo.title);
  }
  if (!evt && fallbackInfo && fallbackInfo.title && fallbackInfo.year) {
    evt = events.find(e =>
      e.title.includes(fallbackInfo.title) ||
      fallbackInfo.title.includes(e.title)
    );
    // 额外检查：同标题+年份接近才算
    if (evt && Math.abs(evt.year - fallbackInfo.year) > 5) evt = null;
  }
  // 注意：不再按纯年份 fallback，避免匹配到其他国家的错误事件

  // 标记当前事件为已展开
  document.querySelectorAll('.info-card-event').forEach(el => el.classList.remove('expanded'));
  eventEl.classList.add('expanded');

  // 渲染详情内容
  const displayYear = evt ? evt.displayYear : (fallbackInfo.year < 0 ? `公元前 ${Math.abs(fallbackInfo.year)} 年` : `公元 ${fallbackInfo.year} 年`);
  const title = evt ? evt.title : (fallbackInfo.title || '未知事件');

  let html = `
    <div class="detail-expanded-header">
      <span class="detail-expanded-year">${displayYear}</span>
      <span class="detail-expanded-close" onclick="this.closest('.event-detail-expanded').classList.remove('visible')">✕</span>
    </div>
    <h3 class="detail-expanded-title">${title}</h3>`;

  if (!evt) {
    // 找不到完整事件数据时，显示简洁提示（不显示错误信息）
    html += `<div class="detail-expanded-desc" style="font-style:italic;color:var(--text-muted);padding:12px 0;">该事件的详细描述正在整理中...</div>`;
  } else {
    html += `
    <div class="detail-expanded-meta">
      <span>📍 ${evt.location}</span>
      <span>🌍 ${evt.region}</span>
      <span>🏷 ${evt.category}</span>
    </div>
    <div class="detail-expanded-desc">${renderMarkdown(evt.detail)}</div>`;
  }

  expanded.innerHTML = html;
  // 隐藏二级浮层（避免重叠）
  hideEventPreview();
  expanded.classList.add('visible');
}
function iso2ToFlag(iso2) {
  if (!iso2 || iso2.length !== 2 || iso2 === '-9') return '🏳️';
  const codePoints = [...iso2.toUpperCase()].map(c => 0x1F1E6 + (c.charCodeAt(0) - 65));
  return String.fromCodePoint(...codePoints);
}

// ===== 国家信息卡片（悬停/点击模式） =====
let infoCardHideTimer = null;
let infoCardPinned = false;       // 是否被点击锁定
let infoCardLastIso2 = '';         // 最后显示的国家 ISO2

function showCountryInfoCard(iso2, zhName, countryData) {
  clearTimeout(infoCardHideTimer);

  const card = document.getElementById('countryInfoCard');
  const flagEl = document.getElementById('infoCardFlag');
  const nameEl = document.getElementById('infoCardName');
  const nameEnEl = document.getElementById('infoCardNameEn');
  const bodyEl = document.getElementById('infoCardBody');

  // 国旗 + 名称
  flagEl.textContent = iso2ToFlag(iso2);
  const displayName = (countryData && countryData.nameZh) ? countryData.nameZh : zhName;
  nameEl.textContent = displayName;
  nameEnEl.textContent = (countryData && countryData.name) ? countryData.name : '';

  // 获取详细信息（所有国家都尝试从 countriesInfo 获取）
  const info = countriesInfo[iso2];

  let html = '';

  // 简介
  if (info && info.intro) {
    html += `<div class="info-card-intro">${info.intro}</div>`;
  }

  // 信息网格
  if (info) {
    html += '<div class="info-card-grid">';
    html += infoField('首都', info.capital);
    html += infoField('大洲', info.continent);
    html += infoField('官方语言', info.language);
    html += infoField('政体', info.government);
    html += infoField('面积', info.area);
    html += infoField('人口', info.population);
    html += infoField('GDP', info.gdp);
    html += infoField('人均GDP', info.gdpPerCapita);
    html += infoField('货币', info.currency);
    html += '</div>';
  }

  // 历史事件时间轴
  if (countryData && countryData.events && countryData.events.length > 0) {
    html += '<div class="info-card-events-title">📜 历史事件时间轴</div>';
    html += '<div class="info-card-events" id="infoCardEvents">';
    countryData.events.forEach((ev, idx) => {
      const yearStr = ev.year < 0 ? `公元前 ${Math.abs(ev.year)}` : `公元 ${ev.year}`;
      // 查找匹配的完整事件数据（用于三级详情）
      const matchedEvent = events.find(e => e.title === ev.title && Math.abs(e.year - ev.year) < 5);
      const eventId = matchedEvent ? matchedEvent.id : `evt-${idx}`;
      html += `
        <div class="info-card-event" data-event-id="${eventId}" data-year="${ev.year}" data-event-title="${ev.title}">
          <span class="info-card-event-year">${yearStr}</span>
          <span class="info-card-event-title">${ev.title}</span>
        </div>
      `;
    });
    html += '</div>';

    // 二级：事件预览浮层容器
    html += '<div class="event-preview" id="eventPreview"><div class="event-preview-inner"></div></div>';

    // 三级：事件完整详情展开区
    html += '<div class="event-detail-expanded" id="eventDetailExpanded"></div>';
  } else {
    // 无历史数据的国家也展示提示
    html += '<div class="info-card-events-title">📜 历史事件时间轴</div>';
    html += '<div class="info-card-no-events">暂无收录的历史事件</div>';
  }

  bodyEl.innerHTML = html;
  card.classList.add('visible');
  card.classList.toggle('pinned', infoCardPinned);
  infoCardLastIso2 = iso2;

  // 绑定时间轴事件条的 hover（二级浮层）和 click（三级展开）交互
  bindEventInteractions();

  // 悬停模式：3 秒后自动隐藏（除非已锁定）
  if (!infoCardPinned) {
    infoCardHideTimer = setTimeout(() => {
      hideCountryInfoCard();
    }, 3500);
  }
}

function infoField(label, value) {
  if (!value) return '';
  return `
    <div class="info-card-field">
      <span class="info-card-label">${label}</span>
      <span class="info-card-value">${value}</span>
    </div>
  `;
}

// 点击国家 → 锁定卡片
function pinCountryInfoCard(iso2, zhName, countryData) {
  infoCardPinned = true;
  showCountryInfoCard(iso2, zhName, countryData);
}

// 取消锁定并隐藏
function hideCountryInfoCard() {
  if (!infoCardPinned) {
    document.getElementById('countryInfoCard').classList.remove('visible');
  }
}

// ===== 显示国家事件列表 =====
function showCountryEvents(countryData) {
  // 找到第一个匹配的事件
  if (countryData.events.length > 0) {
    const firstEvent = countryData.events[0];
    const matchedEvent = events.find(e =>
      e.title === firstEvent.title || e.year === firstEvent.year
    );
    if (matchedEvent) {
      selectEvent(matchedEvent.id);
    }
  }
}

// ===== 搜索功能 =====
function initSearch() {
  const input = document.getElementById('searchInput');
  const btn = document.getElementById('searchBtn');

  const doSearch = () => {
    const query = input.value.trim();
    const activeCategory = document.querySelector('.tag.active')?.dataset?.category || 'all';
    renderTimeline(activeCategory, query);

    // 如果有搜索结果，自动选中第一个
    if (query) {
      const firstItem = document.querySelector('.timeline-item');
      if (firstItem) {
        const eventId = parseInt(firstItem.dataset.eventId);
        selectEvent(eventId);
      }
    }
  };

  btn.addEventListener('click', doSearch);
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') doSearch();
  });
}

// ===== 面板折叠 =====
function initPanelControls() {
  const collapseBtn = document.getElementById('collapseTimeline');
  const timelinePanel = document.getElementById('timelinePanel');
  const closeDetailBtn = document.getElementById('closeDetail');
  const detailPanel = document.getElementById('detailPanel');

  collapseBtn.addEventListener('click', () => {
    timelinePanel.classList.toggle('collapsed');
    map.invalidateSize();
  });

  closeDetailBtn.addEventListener('click', () => {
    detailPanel.classList.remove('open');
    activeEventId = null;
    document.querySelectorAll('.timeline-item').forEach(item => {
      item.classList.remove('active');
    });
    document.getElementById('yearDisplay').textContent = '选择历史事件';
  });

  // 国家信息卡片关闭按钮 → 解除锁定 + 隐藏
  const infoCardCloseBtn = document.getElementById('infoCardClose');
  infoCardCloseBtn.addEventListener('click', () => {
    infoCardPinned = false;
    clearTimeout(infoCardHideTimer);
    document.getElementById('countryInfoCard').classList.remove('visible', 'pinned');
  });

  // 锁定状态时更新关闭按钮图标
  infoCardCloseBtn.addEventListener('mouseenter', () => {
    if (infoCardPinned) {
      infoCardCloseBtn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>';
      infoCardCloseBtn.title = '解除锁定';
    }
  });
  infoCardCloseBtn.addEventListener('mouseleave', () => {
    infoCardCloseBtn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>';
    infoCardCloseBtn.title = '关闭';
  });

  // 鼠标进入卡片时取消自动隐藏定时器（让用户有时间阅读）
  const infoCard = document.getElementById('countryInfoCard');
  infoCard.addEventListener('mouseenter', () => {
    if (!infoCardPinned) clearTimeout(infoCardHideTimer);
  });
  // 鼠标移出卡片时：未锁定则触发隐藏，锁定则保持显示
  infoCard.addEventListener('mouseleave', () => {
    hideCountryInfoCard();
  });

  // 键盘快捷键
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      detailPanel.classList.remove('open');
      activeEventId = null;
      document.querySelectorAll('.timeline-item').forEach(item => {
        item.classList.remove('active');
      });
      document.getElementById('yearDisplay').textContent = '选择历史事件';
    }
  });
}

// ===== 应用初始化 =====
async function init() {
  initMap();
  initPanelControls();
  initSearch();
  await loadData();

  // 窗口大小改变时刷新地图
  window.addEventListener('resize', () => {
    map.invalidateSize();
  });
}

// 启动
document.addEventListener('DOMContentLoaded', init);
