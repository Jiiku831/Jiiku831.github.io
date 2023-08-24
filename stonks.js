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

function Val(a, b, c, d, e, f, g, h, w, z) {
    return b * f +
        a * b * z * (g + h * (0.002 * c + 0.008 * d) + e * w);
}

function BA(a, b, c, d, e, f, g, h, w, z) {
    let s = Val(a, b, c, d, e, f, g, h, w, z);
    return -500 * s * z * (c * h + 4 * d * h + 500 * e * w + 500 * g) /
        (a * z * (c * h + 4 * d * h + 500 * e * w + 500 * g) + 500 * f) ** 2;
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
    out, fn, pw, ph, x, y, x1, x2, y1, y2, a, b, c, d, e, f, g, h, w, z, m, lx, ly) {
    let t = T(fn, x1, x2, y1, y2);
    let l = L(fn, m(a, b, c, d, e, f, g, h, w, z), x, y, x1, x2, y1, y2);
    let p = Plot.plot({
        color: {
            scheme: "Blues",
            legend: true,
            label: "Event Points",
        },
        height: ph,
        width: pw,
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

function SumI(a, b, c, d, e, f, g, h, w, z, m, dx, dy, ux, uy) {
    let fc = m(a, b, c, d, e, f, g, h, w, z) * -1;
    return "<table><tr>" +
        `<td>${dx}${ux}</td><td>&approx;</td><td>${(fc * dx).toFixed(1)}${uy}` +
        "</td></tr><tr>" +
        `<td>${dy}${uy}</td><td>&approx;</td><td>${(dy / fc).toFixed(1)}${ux}` +
        "</td></tr></table>";
}

function Sum(out, a, b, c, d, e, f, g, h, w, z, m, dx, dy, ux, uy) {
    let cc = document.getElementById(out);
    cc.innerHTML = SumI(a, b, c, d, e, f, g, h, w, z, m, dx, dy, ux, uy);
}

function Tr(row, data, tag, span, cls) {
    for (let i = 0; i < data.length; ++i) {
        row.append(document.createElement(tag));
        row.lastChild.innerHTML = data[i];
        if (span != undefined) {
            row.lastChild.colSpan = span[i];
        }
        if (cls != undefined && cls[i] != "") {
            row.lastChild.classList.add(cls[i]);
        }
    }
}

function Table(out, a, b, c, d, e, z, cs, cl) {
    let cc = document.getElementById(out);
    Clear(cc);
    let table = document.createElement("table");
    table.classList.add("st");
    Tr(table.insertRow(), ["", "Multi", "Multi (CC)", "Solo"], "th",
        [1, 2, 2, 2]);
    Tr(table.insertRow(), [
        "Strategy",
        "Avg. EP<small><sup>&ddagger;</sup></small>", "BP &harr; EB",
        "Avg. EP<small><sup>&ddagger;</sup></small>", "BP &harr; EB",
        "Avg. EP<small><sup>&ddagger;</sup></small>", "BP &harr; EB",
    ], "th");
    let f = (...x) => Math.round(Val(a, b, ...x, z) / 100).toLocaleString();
    let f1 = (...x) =>
        SumI(a, b, ...x, z, BA, 10000, 10, " BP", "% EB");
    for (let i = 0; i < params[0].length; ++i) {
        data = [
            params[0][i][0],
        ];
        cls = [""];
        for (let j = 0; j < params.length; ++j) {
            if (j == 1 && i > 1) {
                data.push("", "");
                cls.push("na", "na");
                continue;
            }
            let nc = j == 2 ? cs : c;
            let nd = j == 2 ? cs : d;
            let ne = j == 2 ? cl / 100: e;
            data.push(
                f(nc, nd, ne, params[j][i][1], params[j][i][2],
                    params[j][i][3], params[j][i][4]),
                f1(nc, nd, ne, params[j][i][1], params[j][i][2],
                    params[j][i][3], params[j][i][4]));
            cls.push("", "");
        }
        Tr(table.insertRow(), data, "td", undefined, cls);
    }
    cc.append(table);
}

const params = [
    [
        ["Random Ex", 141.5471052631579, 0.00034605372824218826, 7.342056934497954e-05, 1.6899812340557115e-05],
        ["Random Mas", 141.55758017492712, 0.0003544608603805854, 7.494942753428044e-05, 1.7502404941490973e-05],
        ["2:00+ Ex", 145.27965065502184, 0.0003573538288360647, 6.880684540451749e-05, 1.666423116117773e-05],
        ["2:00+ Mas", 145.27904347826086, 0.0003658898696533362, 6.990290685507412e-05, 1.7285551356886923e-05],
        ["2:20+ Ex", 149.0236111111111, 0.0003689485029340017, 6.4976448857753e-05, 1.6289529611553315e-05],
        ["2:20+ Mas", 149.0236111111111, 0.00037770562434199183, 6.599484193002225e-05, 1.6807402176334123e-05],
        ["Ebi Hard", 123.0, 0.00028064250105797744, 7.716903089293271e-05, 3.47011510791367e-05],
        ["Ebi Ex", 123.0, 0.0002892108452090447, 8.760748540534706e-05, 3.7355562146930754e-05],
        ["Ebi Mas", 123.0, 0.00029961822660098524, 8.941970443349751e-05, 3.335172413793104e-05],
        ["L&F Hard", 150.06, 0.00038026531032788965, 9.444643558884933e-05, 1.8541977403905194e-05],
        ["L&F Ex", 150.06, 0.00038627770214701124, 9.471546302010593e-05, 1.3417646149348745e-05],
        ["L&F Mas", 150.06, 0.00038736236379462066, 7.791182249366639e-05, 1.4968348593963504e-05],
    ],
    [
        ["Random Ex", 191.08859210526316, 0.0004671725331269542, 9.911776861572237e-05, 2.281474665975211e-05],
        ["Random Mas", 191.1027332361516, 0.0004785221615137904, 0.0001011817271712786, 2.3628246671012814e-05],
        ["2:00+ Ex", 196.1275283842795, 0.0004824276689286873, 9.28892412960986e-05, 2.2496712067589933e-05],
        ["2:00+ Mas", 196.12670869565218, 0.000493951324032004, 9.436892425435006e-05, 2.3335494331797348e-05],
        ["2:20+ Ex", 201.18187500000002, 0.0004980804789609023, 8.771820595796657e-05, 2.1990864975596978e-05],
        ["2:20+ Mas", 201.18187500000002, 0.0005099025928616891, 8.909303660553004e-05, 2.2689992938051072e-05],
        ["Ebi Hard", 166.05, 0.00037886737642826965, 0.00010417819170545916, 4.684655395683455e-05],
        ["Ebi Ex", 166.05, 0.0003904346410322104, 0.00011827010529721854, 5.0430008898356515e-05],
        ["Ebi Mas", 166.05, 0.00040448460591133005, 0.00012071660098522166, 4.502482758620691e-05],
        ["L&F Hard", 202.58100000000002, 0.0005133581689426511, 0.00012750268804494658, 2.5031669495272014e-05],
        ["L&F Ex", 202.58100000000002, 0.0005214748978984653, 0.00012786587507714303, 1.8113822301620805e-05],
        ["L&F Mas", 202.58100000000002, 0.0005229391911227379, 0.00010518096036644963, 2.020727060185073e-05],
    ],
    [
        ["Random Ex", 115.07894736842105, 0.00026381732985138255, 5.753392643387819e-05, 1.2766247037636025e-05],
        ["Random Mas", 115.08746355685132, 0.0002707480416975781, 5.874401840104312e-05, 1.324926406299535e-05],
        ["2:00+ Ex", 118.11353711790393, 0.00027202388715991447, 5.429820765262187e-05, 1.2186350565014892e-05],
        ["2:00+ Mas", 118.11304347826086, 0.0002792679791600689, 5.5162513157280074e-05, 1.2690008078829523e-05],
        ["2:20+ Ex", 121.1574074074074, 0.0002801857821319739, 5.131222502379771e-05, 1.1694232109852208e-05],
        ["2:20+ Mas", 121.1574074074074, 0.0002875802694565543, 5.2128979029456625e-05, 1.2102121649037972e-05],
        ["Ebi Hard", 100.0, 0.00021392743525179884, 6.55936762589928e-05, 1.9663985611510787e-05],
        ["Ebi Ex", 100.0, 0.00022199652074260894, 7.446636259454501e-05, 2.290958973183588e-05],
        ["Ebi Mas", 100.0, 0.00022663135467980298, 7.600674876847289e-05, 1.8899310344827575e-05],
        ["L&F Hard", 122.0, 0.0002707480797494786, 7.135751983298539e-05, 1.5760680793319415e-05],
        ["L&F Ex", 122.0, 0.0002824089683048049, 7.245703279955828e-05, 1.1404999226946433e-05],
        ["L&F Mas", 122.0, 0.00028957830443911695, 5.900516637182773e-05, 1.2723096304868978e-05],
    ],
];

function ESV() {
    let ct = Get("ct");
    let cl = Get("cl");
    let c = cl + (ct - cl) / 5;
    let d = Get("d");
    let e = (c + 4 * d) / 5;
    document.getElementById("es").value = e;
    document.getElementById("e").value = e.toFixed(2);
}

function Run() {
    let a = Get("a");
    let b = Get("b");
    let ct = Get("ct");
    let cl = Get("cl");
    let c = cl + (ct - cl) / 5;
    let d = Get("d");
    let e = Get("e") / 100;
    let s = parseInt(document.querySelector("input[name=\"s\"]:checked").value);
    let m = parseInt(document.querySelector("input[name=\"m\"]:checked").value);
    if (m == 2) {
        d = c = ct / 5;
        e = cl / 100;
    }
    let f = params[m][s][1];
    let g = params[m][s][2];
    let h = params[m][s][3];
    let w = params[m][s][4];
    let z = Get("z") / 100;

    document.getElementById("v").innerText =
        Math.round(Val(a, b, c, d, e, f, g, h, w, z) / 100).toLocaleString();

    let fn1 = (x, y) => Val(x, y, c, d, e, f, g, h, w, z);

    PlotFn("plota", fn1, 600, 600,
        a, b,
        Math.max(0, a - 50000), a + 50000,
        Math.max(100, b - 50), Math.min(b + 50, 500),
        a, b, c, d, e, f, g, h, w, z, BA, "Team Power", "Event Bonus");
    PlotFn("plota-over", fn1, 600, 600,
        a, b,
        0, 375000, 100, 500,
        a, b, c, d, e, f, g, h, w, z, BA, "Team Power", "Event Bonus");
    Sum("suma", a, b, c, d, e, f, g, h, w, z, BA, 10000, 10,
        " Team Power", "% Event Bonus");
    Table("sumt", a, b, c, d, e, z, ct / 5, cl);
}
