const prefecture_order = [
  -3795658,
  -1834655,
  -3792412,
  -3790801,
  -3791413,
  -3790869,
  -1800608,
  -2682940,
  -1800742,
  -1851649,
  -1768185,
  -2679957,
  -1543125,
  -2689487,
  -3559887,
  -3793529,
  -3794726,
  -357112,
  -3578391,
  -3560284,
  -760746,
  -3793581,
  -3560336,
  -812190,
  -357800,
  -2137477,
  -341906,
  -356912,
  -358631,
  -908959,
  -3285636,
  -3346137,
  -3794962,
  -3218753,
  -4016543,
  -3795000,
  -3795064,
  -3795063,
  -3795031,
  -1553735,
  -1842150,
  -1842151,
  -1842185,
  -356911,
  -1842184,
  -1842186,
  -3795635,
];

function RemapCountries(data) {
  const countries = {
    "AD": -9407,
    "AT": -16239,
    "KH": -49898,
    "DK": -50046,
    "CZ": -51684,
    "BE": -52411,
    "AL": -53292,
    "BY": -59065,
    "BR": -59470,
    "AU": -80500,
    "EC": -108089,
    "CO": -120027,
    "US": -148838,
    "CL": -167454,
    "BT": -184629,
    "BD": -184640,
    "BG": -186382,
    "DZ": -192756,
    "CI": -192779,
    "BF": -192783,
    "BJ": -192784,
    "CF": -192790,
    "GQ": -192791,
    "CG": -192794,
    "CD": -192795,
    "DJ": -192801,
    "CM": -192830,
    "AO": -195267,
    "BI": -195269,
    "HR": -214885,
    "BO": -252645,
    "CN": -270056,
    "VG": -285454,
    "AR": -286393,
    "CR": -287667,
    "BZ": -287827,
    "AF": -303427,
    "TL": -305142,
    "CY": -307787,
    "DM": -307823,
    "DO": -307828,
    "CU": -307833,
    "AM": -364066,
    "AZ": -364110,
    "BH": -378734,
    "JP": -382313,
    "CV": -535774,
    "KM": -535790,
    "AG": -536900,
    "BS": -547469,
    "BB": -547511,
    "CA": -1428125,
    "EG": -1473947,
    "SV": -1520612,
    "BW": -1889339,
    "BM": -1993208,
    "IO": -1993867,
    "BN": -2103120,
    "AI": -2177161,
    "CK": -2184233,
    "KY": -2185366,
    "TD": -2361304,
    "BA": -2528142,
    "HU": -21335,
    "GE": -28699,
    "LA": -49903,
    "DE": -51477,
    "FO": -52939,
    "FI": -54224,
    "IM": -62269,
    "IE": -62273,
    "LV": -72594,
    "LT": -72596,
    "EE": -79510,
    "SZ": -88210,
    "KG": -178009,
    "JO": -184818,
    "LB": -184843,
    "GR": -192307,
    "LY": -192758,
    "GW": -192776,
    "GN": -192778,
    "LR": -192780,
    "GH": -192781,
    "GA": -192793,
    "KE": -192798,
    "ET": -192800,
    "MW": -195290,
    "KZ": -214665,
    "GG": -270009,
    "GY": -287083,
    "HN": -287670,
    "ER": -296961,
    "IS": -299133,
    "IN": -304716,
    "ID": -304751,
    "IQ": -304934,
    "IR": -304938,
    "KW": -305099,
    "HT": -307829,
    "IT": -365331,
    "JE": -367988,
    "MG": -447325,
    "GD": -550727,
    "JM": -555017,
    "KI": -571178,
    "FJ": -571747,
    "FM": -571802,
    "LI": -1155955,
    "LS": -2093234,
    "MY": -2108121,
    "LU": -2171347,
    "GL": -2184073,
    "FK": -2185374,
    "FR": -2202162,
    "GI": -1278736,
    "IL": -1473946,
    "GT": -1521463,
    "XK": -2088990,
    "PW": -571805,
    "NU": -1558556,
    "SS": -1656678,
    "RS": -1741311,
    "SB": -1857436,
    "WS": -1872673,
    "NE": -192786,
    "NG": -192787,
    "SO": -192799,
    "NA": -195266,
    "MZ": -195273,
    "SI": -218657,
    "PY": -287077,
    "NI": -287666,
    "PA": -287668,
    "PE": -288247,
    "PT": -295480,
    "QA": -305095,
    "OM": -305138,
    "PK": -307573,
    "SA": -307584,
    "KR": -307756,
    "PG": -307866,
    "MT": -365307,
    "PH": -443174,
    "MU": -535828,
    "ST": -535880,
    "SC": -536765,
    "MV": -536773,
    "SG": -536780,
    "KN": -536899,
    "MS": -537257,
    "SK": -14296,
    "PL": -49715,
    "MM": -50371,
    "MK": -53293,
    "ME": -53296,
    "SM": -54624,
    "MD": -58974,
    "RU": -60189,
    "ZA": -87565,
    "RO": -90689,
    "MX": -114686,
    "MN": -161033,
    "RW": -171496,
    "NP": -184633,
    "KP": -192734,
    "MR": -192763,
    "SN": -192775,
    "SL": -192777,
    "ML": -192785,
    "VC": -550725,
    "LC": -550728,
    "NZ": -556706,
    "MH": -571771,
    "NR": -571804,
    "MC": -1124039,
    "SH": -1964272,
    "GS": -1983628,
    "PN": -2185375,
    "NL": -2323309,
    "NO": -2978650,
    "MA": -3630439,
    "VA": -36989,
    "VN": -49915,
    "CH": -51701,
    "SE": -52822,
    "UA": -60199,
    "GB": -62149,
    "TR": -174737,
    "SY": -184840,
    "TN": -192757,
    "GM": -192774,
    "TG": -192782,
    "SD": -192789,
    "UG": -192796,
    "TZ": -195270,
    "ZM": -195271,
    "ZW": -195272,
    "UZ": -196240,
    "TJ": -214626,
    "TM": -223026,
    "VE": -272644,
    "UY": -287072,
    "SR": -287082,
    "YE": -305092,
    "AE": -307763,
    "TW": -449220,
    "CN-TW": -449220,
    "LK": -536807,
    "TC": -547479,
    "TT": -555717,
    "ES": -1311341,
    "TH": -2067731,
    "VU": -2177246,
    "TV": -2177266,
    "TK": -2186600,
    "TO": -2186665
  };
  const new_visited = {};
  for (key of Object.keys(data)) {
    if (!key) continue;
    let new_key = key;
    if (countries[key]) {
      new_key = countries[key];
      console.log(`Remapped ${key} -> ${new_key}`);
    }
    new_visited[new_key] = data[key];
  }
  return new_visited;
}

async function LoadWakuWaku() {
  try {
    const response = await fetch("wakuwaku.json");
    return RemapCountries(await response.json());
  } catch (e) {
    console.error(e);
    return null;
  }
}

function StyleVisited(local_id, base_style) {
  return {
    ...base_style,
    fillColor: fill_colors[visited[local_id] ?? 0],
    fill: true,
  };
}

function StyleOutline(properties, zoom, dims) {
  const invisible = {
    weight: 0,
    opacity: 0,
  };
  const outline_style = {
    color: "black",
    weight: zoom >= tileLayerMinZoom ? 2 : 1.5,
  };
  if (zoom >= 9) {
    return outline_style;
  }
  return invisible;
}

function StyleFeature(properties, zoom, dims) {
  const invisible = {
    weight: 0,
    opacity: 0,
  };
  const base_style = {
    color: "grey",
    weight: 1,
  };
  const local_id = GetLocalId(properties);
  if (zoom < 5) {
    if (properties.admin_level > 2) return invisible;
    return StyleVisited(local_id, base_style);
  } else if (zoom < 9) {
    if (properties.admin_level < 4 &&
        (local_id == aliases["JP"] || local_id == aliases["US"]))
      return invisible;
    if (properties.admin_level > 4) return invisible;
    return StyleVisited(local_id, base_style);
  } else {
    if (properties.admin_level < 4 &&
        (local_id == aliases["JP"] || local_id == aliases["US"]))
      return invisible;
    if (properties.admin_level < 7 &&
        properties.parents_administrative &&
        properties.parents_administrative.includes(aliases["JP"]))
      return invisible;
    return StyleVisited(local_id, {
      ...base_style,
      color: zoom >= tileLayerMinZoom ? "black" : "grey",
    });
  }
}

function CreateMarker(properties, name) {
  const center = GetLabelPos(properties);
  if (!center) {
    return null;
  }
  // console.log(`Add marker for ${name} at ${center}`);
  const marker = L.tooltip(center, {
    content: name,
    permanent: true,
    className: "tooltip",
    direction: "center",
  });
  marker.properties = properties;
  return marker;
}

function LoadHierarchy(data) {
  for (object of Object.keys(data.objects)) {
    data.objects[object].geometries.forEach((f) => {
      const local_id = GetLocalId(f.properties);
      const group = GetGroup(f.properties);
      const subgroup = GetSubGroup(f.properties);
      const name = GetName(f.properties);
      names[local_id] = name;
      // console.log(`Added ${name}: ${local_id}`);
      all_ids.add(local_id);
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

      const marker = CreateMarker(f.properties, name);
      if (marker) {
        markers.push(marker);
      }
    });
  }
}

function OnMapClick(e) {
  const local_id = GetLocalId(e.layer.properties);
  if (!local_id) return;
  L.popup()
    .setLatLng(e.latlng)
    .setContent(CreateControls(local_id, e.layer.properties))
    .openOn(map);
}

async function LoadTopology(path, map) {
  const response = await fetch(path);
  if (!response.ok) {
    console.error(`HTTP error! status: ${response.status}`);
  }
  try {
    const ds = new DecompressionStream("gzip");
    const decompressed_stream = response.body.pipeThrough(ds);
    const data = await new Response(decompressed_stream).json();
    LoadHierarchy(data);
    const options = {
      vectorTileLayerStyles: {
        level2: StyleFeature,
        level4: StyleFeature,
        level7: StyleFeature,
        level4_detailed: StyleOutline,
      },
      attribution: "&copy; OpenStreetMap contributors",
      interactive: true,
      getFeatureId: (f) => GetLocalId(f.properties),
    };
    grid = L.vectorGrid.slicer(data, options);
    grid.on("click", OnMapClick);
    grid.addTo(map);
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
    all_ids.forEach((local_id) => grid.setFeatureStyle(local_id, StyleFeature));
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
    visited = RemapCountries(JSON.parse(localStorage.getItem('visited')));
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
  });
  SaveVisited();
}

function GetLocalId(properties) {
  return properties.osm_id;
}

function GetGroup(properties) {
  if (properties.admin_level == 2) {
    return countries_group;
  }
  if (properties.admin_level == 4 &&
      properties.parents_administrative.includes(aliases["JP"])) {
    return japan_prefectures_group;
  }
  if (properties.admin_level == 4 &&
      properties.parents_administrative.includes(aliases["US"])) {
    return us_states_group;
  }
  if (properties.admin_level == 7 &&
      properties.parents_administrative.includes(aliases["JP"])) {
    return japan_cities_group;
  }
  console.log("Unclassified feature: ", f);
  return "Others";
}

function GetSubGroup(properties) {
  if (properties.admin_level == 7 &&
      properties.parents_administrative.includes(aliases["JP"])) {
    return properties.parents_administrative.filter((p) => {
      return groups[japan_prefectures_group].has(p);
    })[0];
  }
}

function GetName(properties) {
  if (properties.admin_level == 2) {
    return properties.name_en ?? properties.name;
  }
  return properties.name;
}

function GetLabelPos(properties) {
  if (properties.label_pos) {
    return properties.label_pos;
  }
  console.log("No center: ", properties);
}

function CreateRadio(local_id, properties, val) {
  const node = document.createElement("div");
  const input = document.createElement("input");
  const label = document.createElement("label");
  node.appendChild(input);
  node.appendChild(label);
  input.type = "radio";
  input.name = `R${local_id}`;
  input.id = `R${local_id}_${val}`;
  input.value = val;
  input.dataset.local_id = local_id;
  input.checked = (visited[input.dataset.local_id] ?? 0) == val;
  input.dataset.parents = (properties.parents_administrative ?? []).join();
  input.addEventListener('change', UpdateVisited);
  label.innerText = score_names[val];
  label.htmlFor = input.id;
  return node;
}

function CreateControls(local_id, properties) {
  const node = document.createElement("div");
  const title = document.createElement("h3");
  title.innerText = names[local_id];
  node.appendChild(title);
  for (score of score_order) {
    node.appendChild(CreateRadio(local_id, properties, score));
  }
  return node;
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

function Th(content, colspan) {
  const th = document.createElement("th");
  th.append(content);
  if (colspan) {
    th.colSpan = colspan;
  }
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

function TotalPercentNode(group) {
  const total_node = Td("-");
  total_node.classList.add("score-total-percent");
  total_node.classList.add("score-color");
  total_node.dataset.group = group;
  return total_node;
}

function TotalCountNode(group) {
  const total_node = Td("-");
  total_node.classList.add("count-total");
  total_node.classList.add("count-color");
  total_node.dataset.group = group;
  return total_node;
}

function TotalCountHeader() {
  const node = Th("Count");
  node.classList.add("count-color");
  return node;
}

function CommonHeader(group) {
  return [
    TotalCountNode(group),
    TotalNode(group),
    TotalPercentNode(group),
  ];
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
    Tr([Th(""), TotalCountHeader(), Th("Score", 2)].concat(...(score_order.map((v) => {
      const node = Th(score_names[v], 2);
      node.dataset.score = v;
      node.classList.add("score-color");
      return node;
    })))));
  for (group of group_order) {
    table.appendChild(
      Tr([Th(group), ...CommonHeader(group)].concat(...(score_order.map((v) => {
        const node = Td("-");
        node.classList.add("score-count");
        node.classList.add("score-color");
        node.dataset.group = group;
        node.dataset.score = v;

        const percent_node = Td("-");
        percent_node.classList.add("score-percent");
        percent_node.classList.add("score-color");
        percent_node.dataset.group = group;
        percent_node.dataset.score = v;
        return [node, percent_node];
      }).flat()))));
    const sgs = subgroups[group];
    if (sgs) {
      let subgroups = Object.keys(sgs);
      if (group == japan_cities_group) {
        subgroups = prefecture_order;
      }
      for (subgroup of subgroups) {
        const header = Th(names[subgroup]);
        header.classList.add("summary-table-subgroup-header");
        table.appendChild(
          Tr([header, ...CommonHeader(subgroup)].concat(...(score_order.map((v) => {
            const node = Td("-");
            node.classList.add("score-count");
            node.classList.add("score-color");
            node.dataset.group = subgroup;
            node.dataset.score = v;

            const percent_node = Td("-");
            percent_node.classList.add("score-percent");
            percent_node.classList.add("score-color");
            percent_node.dataset.group = subgroup;
            percent_node.dataset.score = v;
            return [node, percent_node];
          }).flat()))));
      }
    }
  }
}

function SetGroupCount(gs, group) {
  document.querySelectorAll(`.count-total[data-group="${group}"]`).forEach((e) => {
    e.innerText = gs[group].size;
    e.dataset.total = gs[group].size;
  });
}

function FormatPercentage(ratio) {
  return `(${(ratio * 100).toFixed(0)}%)`;
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
  const total_count = document.querySelector(`.count-total[data-group="${group}"]`).dataset.total;
  for (local_id of gs[group]) {
    ++scores[visited[local_id] ?? 0];
  }
  let total = 0;
  for (const [score, count] of Object.entries(scores)) {
    document.querySelectorAll(`.score-count[data-group="${group}"][data-score="${score}"]`).forEach((e) => {
      e.innerText = count;
    });
    document.querySelectorAll(`.score-percent[data-group="${group}"][data-score="${score}"]`).forEach((e) => {
      e.innerText = FormatPercentage(count / total_count);
    });
    total += score * count;
  }
  document.querySelectorAll(`.score-total[data-group="${group}"]`).forEach((e) => {
    e.innerText = `${total}`;
  });
  document.querySelectorAll(`.score-total-percent[data-group="${group}"]`).forEach((e) => {
    e.innerText = FormatPercentage(total / total_count / 5);
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
  grid.setFeatureStyle(local_id, StyleFeature);
}

function UpdateGroup(group) {
  SetGroupCount(groups, group);
  UpdateGroupScores(groups, group);
  const sgs = subgroups[group];
  if (sgs) {
    for (subgroup of Object.keys(sgs)) {
      SetGroupCount(subgroups[group], subgroup);
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
    let sorted_sgs = Object.keys(sgs);
    if (group == japan_cities_group) {
      sorted_sgs = prefecture_order;
    }
    for (subgroup of sorted_sgs) {
      CreateSummaryGroup(node, subgroups[group], subgroup);
    }
  }
}

async function LoadMaps(map) {
  visited = await LoadWakuWaku();
  await LoadTopology("data/data.topojson.gz", map);
  CreateSummary();
  document.getElementById("load-button").disabled = false;
}

const tileLayerMinZoom = 10;
function RefreshMarkers() {
  const zoom = map.getZoom();
  markers.forEach((m) => {
    if (StyleFeature(m.properties, zoom - 1, 1).weight == 0 || zoom < 5 || zoom >= tileLayerMinZoom) {
      m.close();
    } else {
      m.openOn(map);
    }
  });
}

const countries_group = "Countries";
const japan_prefectures_group = "Japan Prefectures";
const japan_cities_group = "Japan Cities, Towns and Villages";
const us_states_group = "US States and Territories";

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

var visited = {};
var own_data = false;
const all_ids = new Set();
const markers = [];
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
L.tileLayer(
  "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
  {
    attribution: "&copy; OpenStreetMap contributors",
    minZoom: tileLayerMinZoom,
    opacity: 0.8,
  }).addTo(map);
var grid = null;

LoadMaps(map);
RefreshMarkers();
map.on("zoomend", (e) => {
  RefreshMarkers();
});
