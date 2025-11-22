async function LoadWakuWaku() {
  try {
    const response = await fetch("wakuwaku.json");
    return response.json();
  } catch (e) {
    console.error(e);
    return null;
  }
}

async function LoadGeoJson(dsts, path) {
  const response = await fetch(path);
  if (!response.ok) {
    console.error(`HTTP error! status: ${response.status}`);
  }
  try {
    const ds = new DecompressionStream("gzip");
    const decompressed_stream = response.body.pipeThrough(ds);
    const json_data = await new Response(decompressed_stream).json();
    const markers = new Array();
    json_data.features.forEach((f) => {
      const local_id = GetLocalId(f);
      const group = GetGroup(f);
      const subgroup = GetSubGroup(f);
      names[local_id] = f.properties.name;
      feature_groups[local_id] = new Set();
      if (!(group in groups)) {
        groups[group] = new Set();
      }
      groups[group].add(local_id);
      feature_groups[local_id].add(group);
      if (subgroup) {
        if (!(group in subgroups)) {
          subgroups[group] = {};
        }
        if (!(subgroup in subgroups[group])) {
          subgroups[group][subgroup] = new Set();
        }
        subgroups[group][subgroup].add(local_id);
        feature_groups[local_id].add([group, subgroup]);
      }

      const label_pos = GetLabelPos(f);
      if (label_pos) {
        markers.push({
          type: "Feature",
          geometry: {
            type: "Point",
            coordinates: label_pos,
          },
          properties: f.properties,
        });
      }
    });
    json_data.features.push(...markers);
    dsts.forEach((d) => { d.layer.addData(json_data); });
  } catch (error) {
    console.error("Error loading JSON:", error);
  }
}

function ClearNode(n) {
  while (n.firstChild) {
    n.removeChild(n.firstChild);
  }
}

function LoadData() {
  const l = document.getElementById("load");
  ClearNode(l);
  try {
    LoadVisited();
    ClearNode(document.getElementById("summary"));
    CreateSummary();
    RefreshLayers(map, layers);
    RestyleLayers(map, layers);
    l.innerHTML =
      "Viewing your data. Changes are saved automatically. Reload the page " +
      "to see Jiiku's data. To export your data, open the console " +
      "(<kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>C</kbd>) and type " +
      "<tt>visited</tt>.";
    own_data = true;
  } catch (e) {
    console.error(e);
    l.innerText = "Failed to load your data.";
  }
}

function LoadVisited() {
  const item = localStorage.getItem('visited');
  if (item != null) {
    visited = JSON.parse(localStorage.getItem('visited'));
  } else {
    visited = {};
  }
}

function SaveVisited() {
  if (own_data) {
    localStorage.setItem('visited', JSON.stringify(visited));
  }
}

function ResetVisited() {
  localStorage.removeItem('visited');
}

function SetVisited(local_id, score) {
  visited[local_id] = score;
  UpdateFeature(local_id);
}

function UpdateVisited(e) {
  if (!e.target.checked) {
    return;
  }
  SetVisited(e.target.dataset.local_id, e.target.value);
  e.target.dataset.parents.split(",").forEach((p) => {
    if (!p) return;
    SetVisited(p, Math.max(e.target.value, visited[p] ?? 0));
    const alias = aliases[p];
    if (alias) {
      SetVisited(alias, Math.max(e.target.value, visited[alias] ?? 0));
    }
  });
  RestyleLayers(map, layers);
  SaveVisited();
}

function IsCountry(f) {
  return f.properties.iso_a2 != "-99";
}

function GetLocalId(f) {
  if (f.properties.osm_id) {
    return f.properties.osm_id;
  }
  if (IsCountry(f)) {
    return f.properties.iso_a2;
  }
  return `NE-${f.properties.ne_id}`;
}

function GetGroup(f) {
  if (f.properties.featurecla == "Admin-0 country" && IsCountry(f)) {
    return countries_group;
  }
  if (f.properties.featurecla == "Admin-0 country") {
    return "Other Territories";
  }
  if (f.properties.admin_level == 4 &&
      f.properties.parents_administrative.includes(aliases["JP"])) {
    return japan_prefectures_group;
  }
  if (f.properties.admin_level == 4 &&
      f.properties.parents_administrative.includes(aliases["US"])) {
    return us_states_group;
  }
  if (f.properties.admin_level == 7 &&
      f.properties.parents_administrative.includes(aliases["JP"])) {
    return japan_cities_group;
  }
  console.log("Unclassified feature: ", f);
  return "Others";
}

function GetSubGroup(f) {
  if (f.properties.admin_level == 7 &&
      f.properties.parents_administrative.includes(aliases["JP"])) {
    return f.properties.parents_administrative.filter((p) => {
      return groups[japan_prefectures_group].has(p);
    })[0];
  }
}

function GetLabelPos(f) {
  if (f.properties.ne_id) {
    return [f.properties.label_x, f.properties.label_y];
  }
  if (f.properties.osm_id && f.properties.label_node_lng) {
    return [f.properties.label_node_lng, f.properties.label_node_lat];
  }
  if (f.properties.osm_id && f.properties.admin_centre_node_lng) {
    return [f.properties.admin_centre_node_lng, f.properties.admin_centre_node_lat];
  }
  if (f.properties.osm_id && f.geometry.type == "MultiPolygon") {
    return f.geometry.coordinates[0][0][0];
  }
  console.log("No center: ", f);
}

function CreateRadio(f, val) {
  const node = document.createElement("div");
  const input = document.createElement("input");
  const label = document.createElement("label");
  node.appendChild(input);
  node.appendChild(label);
  input.type = "radio";
  input.name = `R${f.properties.osm_id ?? f.properties.osm_id}`;
  input.id = `R${f.properties.osm_id ?? f.properties.osm_id}_${val}`;
  input.value = val;
  input.dataset.local_id = GetLocalId(f);
  input.checked = (visited[input.dataset.local_id] ?? 0) == val;
  input.dataset.parents = (f.properties.parents_administrative ?? []).join();
  input.addEventListener('change', UpdateVisited);
  label.innerText = score_names[val];
  label.htmlFor = input.id;
  return node;
}

function CreateControls(l) {
  const node = document.createElement("div");
  const title = document.createElement("h3");
  title.innerText = `${l.feature.properties.name}`;
  node.appendChild(title);
  for (score of score_order) {
    node.appendChild(CreateRadio(l.feature, score));
  }
  return node;
}

function NeStyle(f) {
  return {
    ...base_style,
    fillColor: fill_colors[visited[f.properties.iso_a2] ?? 0],
  };
}

function PointToLayer(p, latlng) {
  return L.circleMarker(latlng, {
    stroke: false,
    fill: false,
  });
}

function WorldLayer() {
  return L.geoJSON(null, {
    pointToLayer: PointToLayer,
    style: NeStyle,
    filter: function (f) {
      return f.properties.admin != "Japan" &&
             f.properties.admin != "United States of America" &&
             IsCountry(f);
    },
    onEachFeature: function (f, l) {
      l.bindPopup(CreateControls);
    },
  });
}

function UsaLayer() {
  return L.geoJSON(null, {
    pointToLayer: PointToLayer,
    style: NeStyle,
    filter: function (f) {
      return f.properties.admin == "United States of America";
    },
    onEachFeature: function (f, l) {
      l.bindPopup(CreateControls);
    },
  });
}

function UsaLayer2() {
  return L.geoJSON(null, {
    pointToLayer: PointToLayer,
    style: OsmStyle,
    onEachFeature: function (f, l) {
      l.bindPopup(CreateControls);
    },
  });
}

function JapanLayer() {
  return L.geoJSON(null, {
    pointToLayer: PointToLayer,
    style: NeStyle,
    filter: function (f) {
      return f.properties.admin == "Japan";
    },
    onEachFeature: function (f, l) {
      l.bindPopup(CreateControls);
    },
  });
}

function OsmStyle(f) {
  return {
    ...base_style,
    fillColor: fill_colors[visited[f.properties.osm_id] ?? 0],
  };
}

function JapanLayer2() {
  return L.geoJSON(null, {
    pointToLayer: PointToLayer,
    style: OsmStyle,
    onEachFeature: function (f, l) {
      l.bindPopup(CreateControls);
    },
  });
}

function BorderStyle(f) {
  return {
    ...base_style,
    weight: map.getZoom() > 8 ? 3 : 1.7,
    fill: false,
  };
}

function JapanLayerBorderOnly() {
  return L.geoJSON(null, {
    pointToLayer: function (f, c) { return null; },
    style: BorderStyle,
  });
}

function RefreshLayers(map, layers) {
  Object.values(layers).forEach((l) => {
    const zoom = map.getZoom();
    if (l.min_zoom <= zoom && zoom <= l.max_zoom && !map.hasLayer(l.layer)) {
      l.layer.addTo(map);
    } else if ((l.min_zoom > zoom || zoom > l.max_zoom) && map.hasLayer(l.layer)) {
      l.layer.remove();
    }

    if (l.style && zoom >= l.tt_zoom) {
      l.layer.eachLayer((f) => {
        if (f.feature.geometry.type == "Point") {
          f.bindTooltip(function () {
            return f.feature.properties.name;
          }, {permanent: true, direction: "center", className: "tooltip"}).openTooltip();
        }
      });
    } else {
      l.layer.eachLayer((f) => {
        f.unbindTooltip();
      });
    }
  });
}

function RestyleLayers(map, layers) {
  Object.values(layers).forEach((l) => {
    if (l.style) {
      l.layer.eachLayer((f) => {
        if (f.setStyle) {
          f.setStyle(l.style(f.feature));
        }
      });
    }
  });
}

function CreateSummary() {
  const d = document.getElementById("summary");
  const group_order = [
    countries_group,
    japan_prefectures_group,
    japan_cities_group,
    us_states_group,
  ];
  CreateSummaryTable(d, group_order);
  for (group of group_order) {
    CreateSummaryGroup(d, groups, group);
    UpdateGroup(group);
  }
}

function Th(content) {
  const th = document.createElement("th");
  th.append(content);
  return th;
}

function Td(content) {
  const td = document.createElement("td");
  td.append(content);
  return td;
}

function Tr(cells) {
  const tr = document.createElement("tr");
  tr.append(...cells);
  return tr;
}

function TotalNode(group) {
  const total_node = Td("-");
  total_node.classList.add("score-total");
  total_node.classList.add("score-color");
  total_node.dataset.group = group;
  return total_node;
}

function CreateSummaryTable(dst, group_order) {
  const details = document.createElement("details");
  details.open = true;
  dst.appendChild(details);
  const summary = document.createElement("summary");
  summary.innerText = "Summary Table";
  details.appendChild(summary);
  const table = document.createElement("table");
  details.appendChild(table);
  table.classList.add("summary-table");
  table.appendChild(
    Tr([Th(""), Th("Score")].concat(...(score_order.map((v) => {
      const node = Th(score_names[v]);
      node.dataset.score = v;
      node.classList.add("score-color");
      return node;
    })))));
  for (group of group_order) {
    table.appendChild(
      Tr([Th(group), TotalNode(group)].concat(...(score_order.map((v) => {
        const node = Td("-");
        node.classList.add("score-count");
        node.classList.add("score-color");
        node.dataset.group = group;
        node.dataset.score = v;
        return node;
      })))));
    const sgs = subgroups[group];
    if (sgs) {
      for (subgroup of Object.keys(sgs)) {
        const header = Th(names[subgroup]);
        header.classList.add("summary-table-subgroup-header");
        table.appendChild(
          Tr([header, TotalNode(subgroup)].concat(...(score_order.map((v) => {
            const node = Td("-");
            node.classList.add("score-count");
            node.classList.add("score-color");
            node.dataset.group = subgroup;
            node.dataset.score = v;
            return node;
          })))));
      }
    }
  }
}

function UpdateGroupScores(gs, group) {
  const scores = {
    5: 0,
    4: 0,
    3: 0,
    2: 0,
    1: 0,
    0: 0,
  };
  for (local_id of gs[group]) {
    ++scores[visited[local_id] ?? 0];
  }
  let total = 0;
  for (const [score, count] of Object.entries(scores)) {
    document.querySelectorAll(`.score-count[data-group="${group}"][data-score="${score}"]`).forEach((e) => {
      e.innerText = count;
    });
    total += score * count;
  }
  document.querySelectorAll(`.score-total[data-group="${group}"]`).forEach((e) => {
    e.innerText = `${total}`;
  });
}

function UpdateLocalItem(local_id) {
  document.querySelectorAll(`.local-item[data-local_id="${local_id}"]`).forEach((e) => {
    const grp = e.parentNode.parentNode.parentNode;
    const score = visited[local_id] ?? 0;
    grp.querySelector(`:scope [data-score="${score}"] .local-list`).appendChild(e);
  });
}

function UpdateFeature(local_id) {
  const gs = feature_groups[local_id];
  if (!gs) return;
  for (gid of gs) {
    if (gid.length == 2) {
      UpdateGroupScores(subgroups[gid[0]], gid[1]);
    } else {
      UpdateGroupScores(groups, gid);
    }
  }
  UpdateLocalItem(local_id);
}

function UpdateGroup(group) {
  UpdateGroupScores(groups, group);
  const sgs = subgroups[group];
  if (sgs) {
    for (subgroup of Object.keys(sgs)) {
      UpdateGroupScores(subgroups[group], subgroup);
    }
  }
}

function CreateLocaleListForScore(dst, gs, group, score) {
  const node = document.createElement("div");
  node.dataset.score = score;
  dst.appendChild(node);
  const count = document.createElement("span");
  count.classList.add("score-count");
  count.dataset.group = group;
  count.dataset.score = score;
  const title = document.createElement("h2");
  title.append(score_names[score] + " (", count, ")");
  title.classList.add("score-color");
  node.appendChild(title);
  const list = document.createElement("div");
  list.classList.add("local-list");
  node.appendChild(list);
  for (local_id of gs[group]) {
    if ((visited[local_id] ?? 0) != score) continue;
    const item = document.createElement("span");
    list.appendChild(item);
    item.innerText = names[local_id];
    item.dataset.local_id = local_id;
    item.classList.add("local-item");
  }
}

function CreateLocaleList(dst, gs, group) {
  for (score of score_order) {
    CreateLocaleListForScore(dst, gs, group, score);
  }
}

function CreateSummaryGroup(dst, gs, group) {
  const node = document.createElement("details");
  const title = document.createElement("summary");
  title.innerText = names[group] ?? group;
  node.appendChild(title);
  dst.appendChild(node);
  CreateLocaleList(node, gs, group);
  const sgs = subgroups[group];
  if (sgs) {
    for (subgroup of Object.keys(sgs)) {
      CreateSummaryGroup(node, subgroups[group], subgroup);
    }
  }
}

async function LoadMaps() {
  visited = await LoadWakuWaku();
  LoadGeoJson([layers.world0, layers.japan0, layers.usa0], "data/world0.geojson.gz");
  LoadGeoJson([layers.world1, layers.japan1, layers.usa1], "data/world1.geojson.gz");
  LoadGeoJson([layers.world2], "data/world2.geojson.gz");
  LoadGeoJson([layers.usa2], "data/usa2.geojson.gz");
  LoadGeoJson([layers.japan2], "data/japan2.geojson.gz");
  await LoadGeoJson([layers.japan31], "data/japan3-1.geojson.gz");
  await LoadGeoJson([layers.japan3], "data/japan3.geojson.gz");
  CreateSummary();
  document.getElementById("load-button").disabled = false;
}

const countries_group = "Countries";
const japan_prefectures_group = "Japan Prefectures";
const japan_cities_group = "Japan Cities, Towns and Villages";
const us_states_group = "US States";

const score_order = [5, 4, 3, 2, 1, 0]
const fill_colors = {
  5: "magenta",
  4: "red",
  3: "yellow",
  2: "lime",
  1: "deepskyblue",
  0: "white",
};
const score_names = {
  5: "Resided",
  4: "Stayed",
  3: "Visited",
  2: "Alighted",
  1: "Passed Thru",
  0: "Never Been There",
};

const base_style = {
  color: "grey",
  weight: 1,
  fillColor: "white",
};

var visited = {};
var own_data = false;
const groups = {};
const subgroups = {};
const feature_groups = {};
const names = {};
const aliases = {
  "-382313": "JP",
  "-148838": "US",
  "JP": -382313,
  "US": -148838,
};

const map = L.map("map", {
  minZoom: 0,
  maxZoom: 20
}).setView([0, 0], 3);

const layers = {
  world0: { layer: WorldLayer(), min_zoom: 0, max_zoom: 2, style: NeStyle, },
  world1: { layer: WorldLayer(), min_zoom: 3, max_zoom: 5, style: NeStyle, tt_zoom: 5 },
  world2: { layer: WorldLayer(), min_zoom: 6, max_zoom: map.getMaxZoom(), style: NeStyle, tt_zoom: 5 },
  japan0: { layer: JapanLayer(), min_zoom: 0, max_zoom: 2, style: NeStyle, },
  japan1: { layer: JapanLayer(), min_zoom: 3, max_zoom: 5, style: NeStyle, tt_zoom: 5 },
  japan2: { layer: JapanLayer2(), min_zoom: 6, max_zoom: 7, style: OsmStyle, tt_zoom: 7, },
  japan31: { layer: JapanLayerBorderOnly(), min_zoom: 8, max_zoom: map.getMaxZoom(), style: BorderStyle, },
  japan3: { layer: JapanLayer2(), min_zoom: 8, max_zoom: map.getMaxZoom(), style: OsmStyle, tt_zoom: 10, },
  usa0: { layer: UsaLayer(), min_zoom: 0, max_zoom: 2, style: NeStyle, },
  usa1: { layer: UsaLayer(), min_zoom: 3, max_zoom: 4, style: NeStyle, },
  usa2: { layer: UsaLayer2(), min_zoom: 5, max_zoom: 7, style: OsmStyle, tt_zoom: 5, },
};

LoadMaps();
RefreshLayers(map, layers);
map.on("zoomend", (e) => {
  RefreshLayers(map, layers);
  RestyleLayers(map, layers);
});
