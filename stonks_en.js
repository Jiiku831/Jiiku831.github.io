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
        for (let y = 0; y <= b; ++y) {
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

function Tr(row, data, tag, span, cls, rowspan) {
    for (let i = 0; i < data.length; ++i) {
        row.append(document.createElement(tag));
        row.lastChild.innerHTML = data[i];
        if (span != undefined) {
            row.lastChild.colSpan = span[i];
        }
        if (rowspan != undefined && i < rowspan.length && rowspan[i]) {
            row.lastChild.rowSpan = rowspan[i];
        }
        if (cls != undefined && cls[i] != "") {
            let clss = cls[i].split(/(\s+)/);
            for (let j = 0; j < clss.length; ++j) {
                if (clss[j] == " " || clss[j] == "") continue;
                row.lastChild.classList.add(clss[j]);
            }
        }
    }
}

function Table(out, a, b, c, d, e, z, cs, cl) {
    let cc = document.getElementById(out);
    Clear(cc);
    let table = document.createElement("table");
    table.classList.add("st");
    Tr(table.insertRow(), ["", "Multi", "Multi (CC)", "Solo", "Auto"], "th",
        [1, 2, 2, 2, 2]);
    Tr(table.insertRow(), [
        "Strategy",
        "Avg. EP<small><sup>&ddagger;</sup></small>", "BP &harr; EB",
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

const bf = [1, 5, 10, 15, 19, 23, 26, 29, 31, 33, 35];

function CT(i, j, v, av, ac, et, tt) {
    let af = j > 0 ? bf[j] : 0;
    let ae = av * af * ac;
    let ps = Math.max(0, et - ae) / (bf[i] * v);
    let b = ps * i + ac * j;
    let pt = ps * tt;
    return [b, pt, i, j];
}

function Median(arr) {
    const sorted = Array.from(arr).sort((a, b) => a - b);
    const middle = Math.floor(sorted.length / 2);

    if (sorted.length % 2 === 0) {
        return (sorted[middle - 1] + sorted[middle]) / 2;
    }

    return sorted[middle];
}

function PlotT(out, v, av, ai, t) {
    let ac = Get("ac");
    let mt = Get("mt");
    let rt = Get("rt");
    let tt = t + mt;
    let at = Get("amt");
    let att = params[3][ai][5] + at;

    let data = [{
        et: 0,
        mb: 0,
        mp: 0,
    }]
    for (let t = 0; t <= 10000; ++t) {
        let et = t * 100000;
        let mb = Infinity;
        let mp = Infinity;
        let xb = -Infinity;
        let xp = -Infinity;
        let bs = []
        let ps = []
        for (let i = 0; i <= 10; ++i) {
            for (let j = 0; j <= 10; ++j) {
                let res = CT(i, j, v, av, ac, et, tt);
                if (res[1] > 3600 * 24 * rt - att * (j > 0 ? ac : 0)) {
                    continue;
                }
                bs.push(res[0]);
                ps.push(res[1]);
                mb = Math.min(mb, res[0]);
                mp = Math.min(mp, res[1]);
                xb = Math.max(xb, res[0]);
                xp = Math.max(xp, res[1]);
            }
        }
        if (mb == Infinity) {
            break;
        }
        data.push({
            et: et / 1000000,
            mb: mb,
            mp: mp / 3600,
            eb: Median(bs),
            ep: Median(ps) / 3600,
            xb: xb,
            xp: xp / 3600,
        });
    }
    let et = Get("et");
    let p = Plot.plot({
        style: "overflow: visible; margin: auto;",
        color: {legend: true},
        x: {grid: true},
        y: {grid: true},
        width: 1200,
        marks: [
            Plot.ruleX([0]),
            Plot.ruleY([0]),
            Plot.axisX({
                anchor: "bottom",
                label: "EP Target (mil)",
            }),
            Plot.axisY({anchor: "left", label: "Boost Cost"}),
            Plot.axisY({anchor: "right", label: "Boost Cost"}),
            Plot.ruleX(
                [et],
                {
                    stroke: "red",
                    strokeWidth: 1,
                }),
            Plot.line(
                data, {
                    x: "et",
                    y: "mb",
                    stroke: e => "min",
                }),
            Plot.line(
                data, {
                    x: "et",
                    y: "eb",
                    stroke: e => "median",
                }),
            Plot.line(
                data, {
                    x: "et",
                    y: "xb",
                    stroke: e => "max",
                }),
            Plot.crosshairX(data, {x: "et", y: "mb"}),
            Plot.crosshairX(data, {x: "et", y: "eb"}),
            Plot.crosshairX(data, {x: "et", y: "xb"}),
        ]
    });
    let p2 = Plot.plot({
        style: "overflow: visible; margin: auto;",
        color: {legend: true},
        x: {grid: true},
        y: {grid: true},
        width: 1200,
        marks: [
            Plot.ruleX([0]),
            Plot.ruleY([0]),
            Plot.axisX({
                anchor: "bottom",
                label: "EP Target (mil)",
            }),
            Plot.axisY({anchor: "left", label: "Play Time (hr)"}),
            Plot.axisY({anchor: "right", label: "Play Time (hr)"}),
            Plot.ruleX(
                [et],
                {
                    stroke: "red",
                    strokeWidth: 1,
                }),
            Plot.line(
                data, {
                    x: "et",
                    y: "mp",
                    stroke: e => "min",
                }),
            Plot.line(
                data, {
                    x: "et",
                    y: "ep",
                    stroke: e => "median",
                }),
            Plot.line(
                data, {
                    x: "et",
                    y: "xp",
                    stroke: e => "max",
                }),
            Plot.crosshairX(data, {x: "et", y: "mp"}),
            Plot.crosshairX(data, {x: "et", y: "ep"}),
            Plot.crosshairX(data, {x: "et", y: "xp"}),
        ]
    });
    let cc = document.getElementById(out);
    Clear(cc);
    cc.append(p);
    cc.append(p2);
}

function PlotTF(out, f, a, b, c, d, e, z, m, s, av, ai) {
    let et = Get("et") * 1000000;
    let ac = Get("ac");
    let mt = Get("mt");
    let rt = Get("rt");
    let at = Get("amt");
    let att = params[3][ai][5] + at;

    let pl = []
    let es = m == 1 ? 2 : params[m].length;
    for (let ss = 0; ss < es; ++ss) {
        let f = params[m][ss][1];
        let g = params[m][ss][2];
        let h = params[m][ss][3];
        let w = params[m][ss][4];
        let t = params[m][ss][5];
        let tt = t + mt;
        let v = Math.round(Val(a, b, c, d, e, f, g, h, w, z) / 100);
        for (let i = 0; i <= 10; ++i) {
            for (let j = 0; j <= 10; ++j) {
                res = CT(i, j, v, av, ac, et, tt);
                if (res[1] > 3600 * 24 * rt - att * (j > 0 ? ac : 0)) {
                    continue;
                }
                res.push(ss);
                pl.push(res);
            }
        }
    }
    pl.sort(function(a, b) {
        if (a[0] == b[0]) {
            return a[1] - b[1];
        }
        return a[0] - b[0];
    });
    let af = [];
    let my = Infinity;
    let mmy = Infinity;
    let mmx = Infinity;
    for (let i = 0; i < pl.length; ++i) {
        let ft = false;
        if (pl[i][1] < my) {
            ft = true;
            my = pl[i][1];
        }
        if (pl[i][1] == 0 && !ft) continue;
        if (pl[i][0] == 0) continue;
        mmy = Math.min(mmy, pl[i][0]);
        mmx = Math.min(mmx, pl[i][1]);
        af.push({
          b: Math.round(pl[i][0] * 100) / 100,
          t: Math.round(pl[i][1] / 3600 * 100) / 100,
          f: ft,
          i: pl[i][2],
          j: pl[i][3],
          s: pl[i][4],
        });
    }

    let p = Plot.plot({
        style: "overflow: visible; margin: auto;",
        color: {legend: true},
        x: {grid: true},
        y: {grid: true},
        width: 1000,
        height: 1000,
        marks: [
            Plot.ruleX([mmx / 3600]),
            Plot.ruleY([mmy]),
            Plot.axisX({
                anchor: "bottom",
                label: "Play time (hr)",
            }),
            Plot.axisY({anchor: "left", label: "Boost Cost"}),
            Plot.crosshair(af, {x: "t", y: "b", maxRadius: 5}),
            Plot.dot(af, {
                filter: e => e.s != s && !e.f,
                x: "t",
                y: "b",
                symbol: "circle",
                fill: (e) => params[0][e.s][0],
                opacity: 0.5,
                strokeWidth: 0,
                r: 2,
            }),
            Plot.line(af, {
                filter: e => e.f,
                x: "t",
                y: "b",
                stroke: "steelblue",
                strokeDasharray: "3 2",
            }),
            Plot.dot(af, {
                filter: e => e.s != s && e.f,
                x: "t",
                y: "b",
                symbol: "circle",
                fill: (e) => params[0][e.s][0],
                strokeWidth: 0,
                r: 4,
            }),
            Plot.line(f, {
                x: "t",
                y: "b",
                stroke: "crimson",
                strokeDasharray: "3 2",
                sort: {channel: "x"},
            }),
            Plot.dot(af, {
                filter: e => e.s == s,
                x: "t",
                y: "b",
                symbol: "times",
                stroke: "crimson",
                strokeWidth: 1.5,
                r: 3,
            }),
            Plot.dot(f, {
                x: "t",
                y: "b",
                symbol: "times",
                stroke: "crimson",
                strokeWidth: 2,
                r: 4,
            }),
            Plot.tip(
                af,
                Plot.pointer({
                    x: "t",
                    y: "b",
                    channels: {
                        strategy: e => params[0][e.s][0],
                        play_boost: e => e.i.toString(),
                        auto_boost: e => e.j.toString(),
                        play_time: e => e.t,
                        boost_cost: e => e.b,
                    },
                    anchor: "top-right",
                    format: {
                        strategy: true,
                        play_boost: true,
                        auto_boost: true,
                        play_time: true,
                        boost_cost: true,
                        x: false,
                        y: false,
                    },
                    maxRadius: 10,
                })),
        ]
    });
    let cc = document.getElementById(out);
    Clear(cc);
    cc.append(p);
}

function TTable(out, a, b, c, d, e, z, m, s, v, av, ai, t) {
    let et = Get("et") * 1000000;
    let ac = Get("ac");
    let mt = Get("mt");
    let rt = Get("rt");
    let tt = t + mt;
    let at = Get("amt");
    let att = params[3][ai][5] + at;

    let cc = document.getElementById(out);
    Clear(cc);
    let table = document.createElement("table");
    table.classList.add("tt");
    Tr(table.insertRow(),
        ["", "Auto Boost", "0x", "1x", "2x", "3x", "4x", "5x", "6x", "7x", "8x",
            "9x", "10x"], "th",
        [1, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2]);
    Tr(table.insertRow(),
        ["Play Boost", "", "Total", "Per day", "Total", "Per day", "Total",
            "Per day", "Total", "Per day", "Total", "Per day", "Total",
            "Per day", "Total", "Per day", "Total", "Per day", "Total",
            "Per day", "Total", "Per day", "Total", "Per day"], "th");

    let pl = [];
    for (let i = 0; i <= 10; ++i) {
        for (let j = 0; j <= 10; ++j) {
            res = CT(i, j, v, av, ac, et, tt);
            if (res[1] > 3600 * 24 * rt - att * (j > 0 ? ac : 0)) {
                continue;
            }
            pl.push(res);
        }
    }
    pl.sort(function(a, b) {
        if (a[0] == b[0]) {
            return a[1] - b[1];
        }
        return a[0] - b[0];
    });
    f = [];

    for (let i = 0; i <= 10; ++i) {
        let pr = [`${i}x`, "Plays"];
        let tr = ["Play time"];
        let br = ["Boosts"];
        let gr = ["Gs"];
        let cls = [];

        for (let j = 0; j <= 10; ++j) {
            let af = j > 0 ? bf[j] : 0;
            let ae = av * af * ac;
            let ps = Math.max(0, et - ae) / (bf[i] * v);
            let b = ps * i + ac * j;
            let pt = ps * tt;
            let kek = false;
            for (let k = 0; k < pl.length; ++k) {
                if (pl[k][2] == i && pl[k][3] == j) {
                    for (l = 0; l < k; ++l) {
                        if (pl[l][0] <= pl[k][0] && pl[l][1] <= pl[k][1]) {
                            kek = true;
                        }
                    }
                }
            }
            let hrs = Math.floor(pt / 3600).toString().padStart(2, '0');
            let mins = Math.floor((pt - hrs * 3600) / 60).toString().padStart(
                2, '0');
            let rd = Math.max(1, rt);
            if (b > 48 * rt) {
                gr.push(Math.round(Math.max(0, b - rt * 48) / 10.5) / 100);
                gr.push(Math.round(Math.max(0, b - rt * 48) / rd / 10.5) / 100);
            } else {
                gr.push("--");
                gr.push("--");
            }
            if (b > 0) {
                br.push(Math.round(b * 10) / 10);
                br.push(Math.round(b / rd * 10) / 10);
            } else {
                br.push("--");
                br.push("--");
            }
            if (ps > 0) {
                tr.push(`${hrs}:${mins}`);
                hrs = Math.floor(
                    pt / rd / 3600).toString().padStart(2, '0');
                mins = Math.floor((pt / rd - hrs * 3600) / 60).toString(
                    ).padStart(2, '0');
                tr.push(`${hrs}:${mins}`);
                pr.push(Math.round(ps * 10) / 10);
                pr.push(Math.round(ps / rd * 10) / 10);
            } else {
                pr.push("--");
                pr.push("--");
                tr.push("--");
                tr.push("--");
            }
            let no = false;
            if (pt > 3600 * 24 * rt - att * (j > 0 ? ac : 0)) {
                cls.push("infeasible");
                cls.push("infeasible");
                no = true;
            } else if (b <= 48 * rt) {
                cls.push("free");
                cls.push("free");
            } else if (ps == 0) {
                cls.push("fullauto");
                cls.push("fullauto");
            } else if (pt / rd > 3600 * 12) {
                cls.push("nosleep");
                cls.push("nosleep");
            } else if (pt / rd < 3600 * 2) {
                cls.push("walkinthepark");
                cls.push("walkinthepark");
            } else if (pt / rd < 3600 * 4) {
                cls.push("trivial");
                cls.push("trivial");
            } else if (pt / rd < 3600 * 8) {
                cls.push("normal");
                cls.push("normal");
            } else {
                cls.push("tryhard");
                cls.push("tryhard");
            }
            cls[cls.length - 2] += " f";
            cls[cls.length - 1] += " s";
            if (kek || no) {
                cls[cls.length - 2] += " bad";
                cls[cls.length - 1] += " bad";
            } else if (b > 0) {
                f.push({
                    b: Math.round(b * 100) / 100,
                    t: Math.round(pt / 3600 * 100) / 100,
                });
            }
        }
        let rs = 4;
        Tr(table.insertRow(), pr, "td", undefined, ["", ""].concat(
            cls.map(e => e + " fr")), [rs]);
        Tr(table.insertRow(), tr, "td", undefined, [""].concat(cls));
        Tr(table.insertRow(), br, "td", undefined, [""].concat(cls));
        Tr(table.insertRow(), gr, "td", undefined, [""].concat(
            cls.map(e => e + " lr")));
    }
    cc.append(table);
    PlotTF(out + "f", f, a, b, c, d, e, z, m, s, av, ai);
}

const params = [
    [
        ["Random Ex", 141.69057851239668, 0.000346561640931633, 7.343603657359755e-05, 1.6914794569069443e-05, 128.64545454545458],
        ["Random Mas", 141.67085635359115, 0.00035481336150085, 7.484931039698734e-05, 1.751149403464917e-05, 128.58839779005527],
        ["2:00+ Ex", 145.2590322580645, 0.0003573838362374051, 6.911223150150252e-05, 1.6670584791136097e-05, 139.0439516129032],
        ["2:00+ Mas", 145.2445748987854, 0.0003658073761785343, 7.004477103709934e-05, 1.728883360245962e-05, 139.0024291497975],
        ["2:20+ Ex", 148.99820512820514, 0.00036892811776984377, 6.513477650725184e-05, 1.6293624931202088e-05, 149.80170940170942],
        ["2:20+ Mas", 148.99965517241378, 0.00037771915378718914, 6.604757002194428e-05, 1.6783449635829056e-05, 149.80603448275866],
        ["Ebi Hard", 123.0, 0.00028064250105797744, 7.716903089293271e-05, 3.47011510791367e-05, 74.8],
        ["Ebi Ex", 123.0, 0.0002892108452090447, 8.760748540534706e-05, 3.7355562146930754e-05, 74.8],
        ["Ebi Mas", 123.0, 0.00029961822660098524, 8.941970443349751e-05, 3.335172413793104e-05, 74.8],
        ["L&F Hard", 150.06, 0.00038026531032788965, 9.444643558884933e-05, 1.8541977403905194e-05, 156.3],
        ["L&F Ex", 150.06, 0.00038627770214701124, 9.471546302010593e-05, 1.3417646149348745e-05, 156.3],
        ["L&F Mas", 150.06, 0.00038736236379462066, 7.791182249366639e-05, 1.4968348593963504e-05, 156.3],
        ["HCM Hard", 159.9, 0.0003640854191865128, 6.634206746752958e-05, 1.2233976936667669e-05, 182.4],
        ["HCM Ex", 159.9, 0.0004007573263888886, 6.209065155228757e-05, 1.3577675653594777e-05, 182.4],
        ["HCM Mas", 159.9, 0.00042125460343927563, 6.0073288583554635e-05, 1.585454068017476e-05, 182.4],
    ],
    [
        ["Random Ex", 191.28228099173555, 0.00046785821525770465, 9.91386493743567e-05, 2.283497266824375e-05, 128.64545454545458],
        ["Random Mas", 191.25565607734808, 0.0004789980380261476, 0.00010104656903593292, 2.364051694677638e-05, 128.58839779005527],
        ["2:00+ Ex", 196.0996935483871, 0.0004824681789204968, 9.33015125270284e-05, 2.2505289468033733e-05, 139.0439516129032],
        ["2:00+ Mas", 196.08017611336032, 0.0004938399578410213, 9.456044090008412e-05, 2.3339925363320493e-05, 139.0024291497975],
        ["2:20+ Ex", 201.14757692307694, 0.000498052958989289, 8.793194828478999e-05, 2.199639365712282e-05, 149.80170940170942],
        ["2:20+ Mas", 201.14953448275864, 0.0005099208576127053, 8.916421952962477e-05, 2.265765700836923e-05, 149.80603448275866],
        ["Ebi Hard", 166.05, 0.00037886737642826965, 0.00010417819170545916, 4.684655395683455e-05, 74.8],
        ["Ebi Ex", 166.05, 0.0003904346410322104, 0.00011827010529721854, 5.0430008898356515e-05, 74.8],
        ["Ebi Mas", 166.05, 0.00040448460591133005, 0.00012071660098522166, 4.502482758620691e-05, 74.8],
        ["L&F Hard", 202.58100000000002, 0.0005133581689426511, 0.00012750268804494658, 2.5031669495272014e-05, 156.3],
        ["L&F Ex", 202.58100000000002, 0.0005214748978984653, 0.00012786587507714303, 1.8113822301620805e-05, 156.3],
        ["L&F Mas", 202.58100000000002, 0.0005229391911227379, 0.00010518096036644963, 2.020727060185073e-05, 156.3],
        ["HCM Hard", 215.865, 0.0004915153159017923, 8.956179108116494e-05, 1.6515868864501353e-05, 182.4],
        ["HCM Ex", 215.865, 0.0005410223906249996, 8.382237959558824e-05, 1.832986213235295e-05, 182.4],
        ["HCM Mas", 215.865, 0.0005686937146430222, 8.109893958779876e-05, 2.1403629918235928e-05, 182.4],
    ],
    [
        ["Random Ex", 115.19559228650138, 0.00026410227398769256, 5.7546463788481375e-05, 1.2769681623012174e-05, 128.64545454545458],
        ["Random Mas", 115.17955801104972, 0.0002709758504436229, 5.8679795047262134e-05, 1.3237963621339283e-05, 128.58839779005527],
        ["2:00+ Ex", 118.09677419354838, 0.0002719350641593732, 5.4523837164369694e-05, 1.2194332593677951e-05, 139.0439516129032],
        ["2:00+ Mas", 118.08502024291498, 0.0002791524912188428, 5.528329123789275e-05, 1.267753800098523e-05, 139.0024291497975],
        ["2:20+ Ex", 121.13675213675214, 0.00028008602174662585, 5.141430888935133e-05, 1.1724575091804351e-05, 149.80170940170942],
        ["2:20+ Mas", 121.13793103448276, 0.0002874859280504098, 5.218836595994487e-05, 1.2088513709163624e-05, 149.80603448275866],
        ["Ebi Hard", 100.0, 0.00021392743525179884, 6.55936762589928e-05, 1.9663985611510787e-05, 74.8],
        ["Ebi Ex", 100.0, 0.00022199652074260894, 7.446636259454501e-05, 2.290958973183588e-05, 74.8],
        ["Ebi Mas", 100.0, 0.00022663135467980298, 7.600674876847289e-05, 1.8899310344827575e-05, 74.8],
        ["L&F Hard", 122.0, 0.0002707480797494786, 7.135751983298539e-05, 1.5760680793319415e-05, 156.3],
        ["L&F Ex", 122.0, 0.0002824089683048049, 7.245703279955828e-05, 1.1404999226946433e-05, 156.3],
        ["L&F Mas", 122.0, 0.00028957830443911695, 5.900516637182773e-05, 1.2723096304868978e-05, 156.3],
        ["HCM Hard", 130.0, 0.00029133835504359883, 4.9756656798363644e-05, 1.0398880396167518e-05, 182.4],
        ["HCM Ex", 130.0, 0.0003087249166666664, 4.724076909722222e-05, 1.154102430555556e-05, 182.4],
        ["HCM Mas", 130.0, 0.0003175829940293494, 4.479506355672118e-05, 1.3476359578148547e-05, 182.4],
    ],
    [
        ["Random Ex", 115.19559228650138, 0.00017726422038567504, 3.848925600699027e-05, 8.209993274024158e-06, 128.64545454545458],
        ["Random Mas", 115.17955801104972, 0.00018057020165745862, 3.898038928915941e-05, 8.431486902698608e-06, 128.58839779005527],
        ["2:00+ Ex", 118.09677419354838, 0.00018188052016129044, 3.632049192187432e-05, 7.79720209184016e-06, 139.0439516129032],
        ["2:00+ Mas", 118.08502024291498, 0.00018533902834008106, 3.657293512870012e-05, 8.02846549277333e-06, 139.0024291497975],
        ["2:20+ Ex", 121.13675213675214, 0.00018667001709401696, 3.4225719576649465e-05, 7.481876616211225e-06, 149.80170940170942],
        ["2:20+ Mas", 121.13793103448276, 0.0001902683275862068, 3.450522413197932e-05, 7.658190405768269e-06, 149.80603448275866],
        ["Ebi Hard", 100.0, 0.00014769999999999999, 4.4097482014388474e-05, 1.1901007194244603e-05, 74.8],
        ["Ebi Ex", 100.0, 0.00015189999999999998, 4.9577263350905336e-05, 1.4030644052257618e-05, 74.8],
        ["Ebi Mas", 100.0, 0.0001547, 4.988620689655171e-05, 1.1548275862068964e-05, 74.8],
        ["L&F Hard", 122.0, 0.00018190199999999998, 4.6519822546972855e-05, 1.0253348643006263e-05, 156.3],
        ["L&F Ex", 122.0, 0.00018788, 4.7369413583655435e-05, 7.324311430149089e-06, 156.3],
        ["L&F Mas", 122.0, 0.00019129600000000003, 3.8237061089526334e-05, 8.096515830371166e-06, 156.3],
        ["HCM Hard", 130.0, 0.00019564999999999999, 3.155169555388093e-05, 6.318764129615674e-06, 182.4],
        ["HCM Ex", 130.0, 0.00020293, 2.9607508680555553e-05, 6.937777777777777e-06, 182.4],
        ["HCM Mas", 130.0, 0.00020657, 2.8055989063110318e-05, 8.230064170526198e-06, 182.4],
    ],
];


function HCMI() {
    for (let i = 0; i < params[0].length; ++i) {
        if (params[0][i][0] == "HCM Mas") {
            return i;
        }
    }
    return undefined;
}


function ESV() {
    let ct = Get("ct");
    let cl = Get("cl");
    let c = cl + (ct - cl) / 5;
    let d = Get("d");
    let e = (c + 4 * d) / 5;
    document.getElementById("es").value = e;
    document.getElementById("e").value = e.toFixed(2);
    setOptions("es", e.toFixed(2));
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
    let t = params[m][s][5];
    let z = m == 3 ? 1 : Get("z") / 100;

    let ai = parseInt(document.querySelector("input[name=\"as\"]:checked").value);
    let af = params[3][ai][1];
    let ag = params[3][ai][2];
    let ah = params[3][ai][3];
    let aw = params[3][ai][4];

    let v = Math.round(Val(a, b, c, d, e, f, g, h, w, z) / 100);
    let av = Math.round(Val(a, b, c, d, e, af, ag, ah, aw, 1) / 100);
    document.getElementById("v").innerText = v.toLocaleString();

    let fn1 = (x, y) => Val(x, y, c, d, e, f, g, h, w, z);

    PlotFn("plota", fn1, 815, 815,
        a, b,
        Math.max(0, a - 50000), a + 50000,
        Math.max(100, b - 50), Math.min(b + 50, 815),
        a, b, c, d, e, f, g, h, w, z, BA, "Team Power", "Event Bonus");
    PlotFn("plota-over", fn1, 815, 815,
        a, b,
        0, 400000, 100, 815,
        a, b, c, d, e, f, g, h, w, z, BA, "Team Power", "Event Bonus");
    Sum("suma", a, b, c, d, e, f, g, h, w, z, BA, 10000, 10,
        " Team Power", "% Event Bonus");
    Table("sumt", a, b, c, d, e, z, ct / 5, cl);
    TTable("tt", a, b, c, d, e, z, m, s, v, av, ai, t);
    PlotT("tp", v, av, ai, t);
}

/* Autosave */

const targetSelectors = [
    "input[type=range]",
    "input[type=radio]",
    "input[type=number]"
];

for(let targetSelector of targetSelectors){
    document.querySelectorAll(targetSelector).forEach((element) => {
        element.addEventListener("change", (event) => {
            const skipElementList = ["ebi"];

            // never set options for skipped ones
            if (skipElementList.includes(event.target.id)){
                return;
            }
            // for selectors and radios
            if (event.target.id.endsWith("s") || event.target.type == "radio"){
                setOptions(event.target.id, event.target.value);
                return;
            }

            // for numbers
            setOptions(event.target.id + "s", event.target.value);
        });
    });
}

const options = getOptionsAll();
if(options){
    for(let optionKey of Object.keys(options)){
        optionElement = document.querySelector("input#" + optionKey);
        switch(optionElement.type){
            case "range":
                optionElement.value = options[optionKey];
                Sync(optionElement);
                break;
            case "radio":
                optionElement.checked = "checked";
                break;
        }
    }
}
