function Sync(e) {
    if (e.id.endsWith("s")) {
        document.getElementById(e.id.slice(0, -1)).value = e.value;
    } else {
        document.getElementById(e.id + "s").value = e.value;
    }
}

function Get(x) {
    return parseFloat(document.getElementById(x).value);
}

function Val(a, b, c, d, e, f, g) {
    return b * e +
        a * b * (f + g * (0.002 * c + 0.008 * d));
}

function AB(a, b, c, d, e, f, g) {
    let s = Val(a, b, c, d, e, f, g);
    return -500 * s / (b ** 2 * (g * (c + 4 * d) + 500 * f));
}

function AC(a, b, c, d, e, f, g) {
    let s = Val(a, b, c, d, e, f);
    return -500 * g * (b * e - s) / b * (g * (c + 4 * d) + 500 * f) ** 2;
}

function BA(a, b, c, d, e, f, g) {
    let s = Val(a, b, c, d, e, f, g);
    return -500 * s * (g * (c + 4 * d) + 500 * f) /
        (a * g * (c + 4 * d) + 500 * a * f + 500 * e) ** 2;
}

function BC(a, b, c, d, e, f, g) {
    let s = Val(a, b, c, d, e, f, g);
    return -500 * a * g * s /
        (a * f * (c + 4 * d) + 500 * a * f + 500 * e) ** 2;
}

function CA(a, b, c, d, e, f, g) {
    let s = Val(a, b, c, d, e, f, g);
    return 500 * (b * e - s) / (a ** 2 * b * g);
}

function CB(a, b, c, d, e, f, g) {
    let s = Val(a, b, c, d, e, f, g);
    return -500 * s / (a * b ** 2 * g);
}

function Clear(e) {
    while(e.firstChild){
        e.removeChild(e.firstChild);
    }
}

function T(fn, x1, x2, y1, y2) {
    const b = 200;
    let out = [];
    for (let x = 0; x <= b; ++x) {
        for (let y = 0; y < b; ++y) {
            let xv = x1 + x * (x2 - x1) / b;
            let yv = y1 + y * (y2 - y1) / b;
            out.push({
                x: xv,
                y: yv,
                v: Math.round(fn(xv, yv) / 100).toLocaleString(),
            })
        }
    }
    return out;
}

function L(fn, m, x, y, x1, x2, y1, y2) {
    const b = 1000;
    let out = [];
    for (let i = 0; i <= b; ++i) {
        let xv = x1 + i * (x2 - x1) / b;
        let yv = y + (xv - x) * m;
        if (yv < y1 || yv > y2) {
            continue;
        }
        out.push({
            x: xv,
            y: yv,
            v: Math.round(fn(xv, yv)).toLocaleString(),
        })
    }
    return out;
}

function PlotFn(
    out, fn, w, h, x, y, x1, x2, y1, y2, a, b, c, d, e, f, g, m, lx, ly) {
    let t = T(fn, x1, x2, y1, y2);
    let l = L(fn, m(a, b, c, d, e, f, g), x, y, x1, x2, y1, y2);
    let p = Plot.plot({
        color: {
            scheme: "Blues",
            legend: true,
            label: "Event Points",
        },
        height: h,
        width: w,
        marks: [
            Plot.contour({
                fill: (x, y) => fn(x, y) / 100,
                x1: x1,
                x2: x2,
                y1: y1,
                y2: y2,
                stroke: "currentColor",
            }),
            Plot.ruleX([x], {stroke: "red"}),
            Plot.ruleY([y], {stroke: "red"}),
            Plot.gridX({strokeDasharray: "5,3"}),
            Plot.gridY({strokeDasharray: "5,3"}),
            Plot.axisX({label: lx}),
            Plot.axisY({label: ly}),
            Plot.line(l, {x: "x", y: "y", stroke: "yellow"}),
            Plot.crosshair(t, {x: "x", y: "y"}),
            Plot.tip(t, Plot.pointer({x: "x", y: "y", title: "v"})),
        ]
    });
    let cc = document.getElementById(out);
    Clear(cc);
    cc.append(p);
}

function SumI(a, b, c, d, e, f, g, m, dx, dy, ux, uy) {
    let fc = m(a, b, c, d, e, f, g) * -1;
    return "<table><tr>" +
        `<td>${dx}${ux}</td><td>&approx;</td><td>${(fc * dx).toFixed(1)}${uy}` +
        "</td></tr><tr>" +
        `<td>${dy}${uy}</td><td>&approx;</td><td>${(dy / fc).toFixed(1)}${ux}` +
        "</td></tr></table>";
}

function Sum(out, a, b, c, d, e, f, g, m, dx, dy, ux, uy) {
    let cc = document.getElementById(out);
    cc.innerHTML = SumI(a, b, c, d, e, f, g, m, dx, dy, ux, uy);
}

function Tr(row, data, tag, span) {
    for (let i = 0; i < data.length; ++i) {
        row.append(document.createElement(tag));
        row.lastChild.innerHTML = data[i];
        if (span != undefined) {
            row.lastChild.colSpan = span[i];
        }
    }
}

function Table(out, a, b, c, d, cs) {
    let cc = document.getElementById(out);
    Clear(cc);
    let table = document.createElement("table");
    table.classList.add("st");
    Tr(table.insertRow(), ["", "Multi", "Multi (CC)", "Solo"], "th",
        [1, 4, 4, 4]);
    Tr(table.insertRow(), [
        "Strategy",
        "Avg. EP<small><sup>&ddagger;</sup></small>", "BP &harr; EB",
        "BP &harr; SV", "EB &harr; EB",
        "Avg. EP<small><sup>&ddagger;</sup></small>", "BP &harr; EB",
        "BP &harr; SV", "EB &harr; SV",
        "Avg. EP<small><sup>&ddagger;</sup></small>", "BP &harr; EB",
        "BP &harr; SV", "EB &harr; SV",
    ], "th");
    let f = (...x) => Math.round(Val(a, b, ...x) / 100).toLocaleString();
    let f1 = (...x) =>
        SumI(a, b, ...x, BA, 10000, 10, " BP", "% EB");
    let f2 = (...x) =>
        SumI(a, b, ...x, CA, 1000, 10, " BP", "% SV");
    let f3 = (...x) =>
        SumI(a, b, ...x, CB, 1, 10, "% EB", "% SV");
    for (let i = 0; i < params[0].length; ++i) {
        data = [
            params[0][i][0],
        ];
        for (let j = 0; j < params.length; ++j) {
            let nc = j == 2 ? cs : c;
            let nd = j == 2 ? cs : d;
            data.push(
                f(nc, nd, params[j][i][1], params[j][i][2], params[j][i][3]));
            data.push(
                f1(nc, nd, params[j][i][1], params[j][i][2], params[j][i][3]));
            data.push(
                f2(nc, nd, params[j][i][1], params[j][i][2], params[j][i][3]));
            data.push(
                f3(nc, nd, params[j][i][1], params[j][i][2], params[j][i][3]));
        }
        Tr(table.insertRow(), data, "td");
    }
    cc.append(table);
}

const params = [
    [
        ["Random Ex", 141.6392308, 0.0003462749307, 0.00009017817953],
        ["Random Mas", 141.6392308, 0.0003546738204, 0.00009229621155],
        ["2:00+ Ex", 145.2796507, 0.0003573538288, 0.00008547107657],
        ["2:00+ Mas", 145.2796507, 0.00036590857, 0.00008715137814],
        ["2:20+ Ex", 149.0236111, 0.0003689485029, 0.00008126597847],
        ["2:20+ Mas", 149.0236111, 0.0003777056243, 0.00008280224411],
        ["Ebi Hard", 123, 0.0002806425011, 0.000111870182],
        ["Ebi Ex", 123, 0.0002892108452, 0.0001249630476],
        ["Ebi Mas", 123, 0.0002996182266, 0.0001227714286],
        ["L&F Hard", 150.06, 0.0003802653103, 0.000112988413],
        ["L&F Ex", 150.06, 0.0003862777021, 0.0001081331092],
        ["L&F Mas", 150.06, 0.0003873623638, 0.00009288017109],
    ],
    [
        ["Random Ex", 191.21296158, 0.00046747115644500003, 0.0001217405423655],
        ["Random Mas", 191.21296158, 0.0004788096575400000, 0.0001245998855925],
        ["2:00+ Ex", 196.127528445, 0.00048242766888000006, 0.0001153859533695],
        ["2:00+ Mas", 196.127528445, 0.0004939765695, 0.00011765436048900001],
        ["2:20+ Ex", 201.18187498500004, 0.000498080478915, 0.0001097090709345],
        ["2:20+ Mas", 201.18187498500004, 0.00050990259280, 0.0001117830295485],
        ["Ebi Hard", 166.05, 0.000378867376485, 0.00015102474570000002],
        ["Ebi Ex", 166.05, 0.00039043464102000004, 0.00016870011426000002],
        ["Ebi Mas", 166.05, 0.00040448460591000006, 0.00016574142861000001],
        ["L&F Hard", 202.58100000000002, 0.000513358168905, 0.00015253435755],
        ["L&F Ex", 202.58100000000002, 0.0005214748978350001, 0.00014597969742],
        ["L&F Mas", 202.58100000000002, 0.00052293919113, 0.000125388230971500],
    ],
    [
        ["Random Ex", 115.1538462, 0.0002943336911, 0.00007020595503],
        ["Random Mas", 115.1538462, 0.0003014727473, 0.00007188613486],
        ["2:00+ Ex", 118.1135371, 0.0003037507545, 0.00006648455822],
        ["2:00+ Mas", 118.1135371, 0.0003110222845, 0.00006782307629],
        ["2:20+ Ex", 121.1574074, 0.0003136062275, 0.00006300645713],
        ["2:20+ Mas", 121.1574074, 0.0003210497807, 0.00006423110068],
        ["Ebi Hard", 100, 0.0002385461259, 0.00008525766187],
        ["Ebi Ex", 100, 0.0002458292184, 0.00009737595233],
        ["Ebi Mas", 100, 0.0002546754926, 0.00009490605911],
        ["L&F Hard", 122, 0.0003232255138, 0.00008711820063],
        ["L&F Ex", 122, 0.0003283360468, 0.00008386203203],
        ["L&F Mas", 122, 0.0003292580092, 0.00007172826268],
    ],
]

function Run() {
    let a = Get("a");
    let b = Get("b");
    let ct = Get("ct");
    let cl = Get("cl");
    let c = cl + (ct - cl) / 5;
    let d = Get("d");
    let s = parseInt(document.querySelector("input[name=\"s\"]:checked").value);
    let m = parseInt(document.querySelector("input[name=\"m\"]:checked").value);
    if (m == 2) {
        d = c = ct / 5;
    }
    let e = params[m][s][1];
    let f = params[m][s][2];
    let g = params[m][s][3];

    document.getElementById("v").innerText =
        Math.round(Val(a, b, c, d, e, f, g) / 100).toLocaleString();

    let fn1 = (x, y) => Val(x, y, c, d, e, f, g);
    let fn2 = (x, y) => Val(x, b, y, d, e, f, g);
    let fn3 = (x, y) => Val(a, x, y, d, e, f, g);

    PlotFn("plota", fn1, 600, 600,
        a, b,
        Math.max(0, a - 50000), a + 50000,
        Math.max(100, b - 50), Math.min(b + 50, 500),
        a, b, c, d, e, f, g, BA, "Team Power", "Event Bonus");
    PlotFn("plotb", fn2, 600, 600,
        a, c,
        Math.max(0, a - 50000), a + 50000,
        Math.max(0, c - 50), Math.min(c + 50, 300),
        a, b, c, d, e, f, g, CA, "Team Power", "Skill Value");
    PlotFn("plotc", fn3, 600, 600,
        b, c,
        Math.max(100, b - 50), Math.min(b + 50, 500),
        Math.max(0, c - 50), Math.min(c + 50, 300),
        a, b, c, d, e, f, g, CB, "Event Bonus", "Skill Value");
    PlotFn("plota-over", fn1, 600, 600,
        a, b,
        0, 375000, 100, 500,
        a, b, c, d, e, f, g, BA, "Team Power", "Event Bonus");
    PlotFn("plotb-over", fn2, 600, 600,
        a, c,
        0, 375000, 0, 300,
        a, b, c, d, e, f, g, CA, "Team Power", "Skill Value");
    PlotFn("plotc-over", fn3, 600, 600,
        b, c,
        100, 500, 0, 300,
        a, b, c, d, e, f, g, CB, "Event Bonus", "Skill Value");
    Sum("suma", a, b, c, d, e, f, g, BA, 10000, 10,
        " Team Power", "% Event Bonus");
    Sum("sumb", a, b, c, d, e, f, g, CA, 1000, 10,
        " Team Power", "% Skill Value");
    Sum("sumc", a, b, c, d, e, f, g, CB, 1, 10,
        "% Event Bonus", "% Skill Value");
    Table("sumt", a, b, c, d, ct / 5);
}
