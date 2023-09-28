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

const params = [
    [
        ["Random Ex", 141.59137931034485, 0.0003462430838088597, 7.345328218645076e-05, 1.6865993541576642e-05],
        ["Random Mas", 141.59137931034485, 0.0003546271183353891, 7.491491765882772e-05, 1.7480027461141554e-05],
        ["2:00+ Ex", 145.24991489361702, 0.00035734572302176, 6.897308545760157e-05, 1.6620165395352497e-05],
        ["2:00+ Mas", 145.24991489361702, 0.0003658929025125189, 6.995917564970593e-05, 1.7257027547361067e-05],
        ["2:20+ Ex", 148.98798165137615, 0.0003689086091321033, 6.506522330180591e-05, 1.625801728615295e-05],
        ["2:20+ Mas", 148.98798165137615, 0.0003776711748264414, 6.601818782060597e-05, 1.678142909975588e-05],
        ["Ebi Hard", 123.0, 0.00028064250105797744, 7.716903089293271e-05, 3.47011510791367e-05],
        ["Ebi Ex", 123.0, 0.0002892108452090447, 8.760748540534706e-05, 3.7355562146930754e-05],
        ["Ebi Mas", 123.0, 0.00029961822660098524, 8.941970443349751e-05, 3.335172413793104e-05],
        ["L&F Hard", 150.06, 0.00038026531032788965, 9.444643558884933e-05, 1.8541977403905194e-05],
        ["L&F Ex", 150.06, 0.00038627770214701124, 9.471546302010593e-05, 1.3417646149348745e-05],
        ["L&F Mas", 150.06, 0.00038736236379462066, 7.791182249366639e-05, 1.4968348593963504e-05],
        ["HCM Hard", 159.9, 0.0003640854191865128, 6.634206746752958e-05, 1.2233976936667669e-05],
        ["HCM Ex", 159.9, 0.0004007573263888886, 6.209065155228757e-05, 1.3577675653594777e-05],
        ["HCM Mas", 159.9, 0.00042125460343927563, 6.0073288583554635e-05, 1.585454068017476e-05],
    ],
    [
        ["Random Ex", 191.14836206896553, 0.0004674281631419607, 9.916193095170854e-05, 2.276909128112847e-05],
        ["Random Mas", 191.14836206896553, 0.0004787466097527754, 0.00010113513883941742, 2.3598037072541102e-05],
        ["2:00+ Ex", 196.087385106383, 0.0004824167260793761, 9.311366536776212e-05, 2.2437223283725875e-05],
        ["2:00+ Mas", 196.087385106383, 0.0004939554183919006, 9.444488712710301e-05, 2.3296987188937443e-05],
        ["2:20+ Ex", 201.1337752293578, 0.0004980266223283395, 8.7838051457438e-05, 2.1948323336306484e-05],
        ["2:20+ Mas", 201.1337752293578, 0.0005098560860156958, 8.912455355781806e-05, 2.2654929284670438e-05],
        ["Ebi Hard", 166.05, 0.00037886737642826965, 0.00010417819170545916, 4.684655395683455e-05],
        ["Ebi Ex", 166.05, 0.0003904346410322104, 0.00011827010529721854, 5.0430008898356515e-05],
        ["Ebi Mas", 166.05, 0.00040448460591133005, 0.00012071660098522166, 4.502482758620691e-05],
        ["L&F Hard", 202.58100000000002, 0.0005133581689426511, 0.00012750268804494658, 2.5031669495272014e-05],
        ["L&F Ex", 202.58100000000002, 0.0005214748978984653, 0.00012786587507714303, 1.8113822301620805e-05],
        ["L&F Mas", 202.58100000000002, 0.0005229391911227379, 0.00010518096036644963, 2.020727060185073e-05],
        ["HCM Hard", 215.865, 0.0004915153159017923, 8.956179108116494e-05, 1.6515868864501353e-05],
        ["HCM Ex", 215.865, 0.0005410223906249996, 8.382237959558824e-05, 1.832986213235295e-05],
        ["HCM Mas", 215.865, 0.0005686937146430222, 8.109893958779876e-05, 2.1403629918235928e-05],
    ],
    [
        ["Random Ex", 115.11494252873563, 0.0002639261445060708, 5.754918286978638e-05, 1.2747059118208394e-05],
        ["Random Mas", 115.11494252873563, 0.00027086154761427295, 5.871068424539114e-05, 1.3237605558048993e-05],
        ["2:00+ Ex", 118.08936170212766, 0.00027197549633429873, 5.4403414258509454e-05, 1.2172741981503873e-05],
        ["2:00+ Mas", 118.08936170212766, 0.0002792547892523981, 5.518935247664998e-05, 1.2684642632869935e-05],
        ["2:20+ Ex", 121.12844036697248, 0.0002801222389264262, 5.136290525556801e-05, 1.1687188542068944e-05],
        ["2:20+ Mas", 121.12844036697248, 0.000287525477491078, 5.213675036187965e-05, 1.2100082792669822e-05],
        ["Ebi Hard", 100.0, 0.00021392743525179884, 6.55936762589928e-05, 1.9663985611510787e-05],
        ["Ebi Ex", 100.0, 0.00022199652074260894, 7.446636259454501e-05, 2.290958973183588e-05],
        ["Ebi Mas", 100.0, 0.00022663135467980298, 7.600674876847289e-05, 1.8899310344827575e-05],
        ["L&F Hard", 122.0, 0.0002707480797494786, 7.135751983298539e-05, 1.5760680793319415e-05],
        ["L&F Ex", 122.0, 0.0002824089683048049, 7.245703279955828e-05, 1.1404999226946433e-05],
        ["L&F Mas", 122.0, 0.00028957830443911695, 5.900516637182773e-05, 1.2723096304868978e-05],
        ["HCM Hard", 130.0, 0.00029133835504359883, 4.9756656798363644e-05, 1.0398880396167518e-05],
        ["HCM Ex", 130.0, 0.0003087249166666664, 4.724076909722222e-05, 1.154102430555556e-05],
        ["HCM Mas", 130.0, 0.0003175829940293494, 4.479506355672118e-05, 1.3476359578148547e-05],
    ],
    [
        ["Random Ex", 115.11494252873563, 0.00017715046839080468, 3.848215656268897e-05, 8.192366425437163e-06],
        ["Random Mas", 115.11494252873563, 0.00018048834195402304, 3.8992829426138376e-05, 8.424641816214881e-06],
        ["2:00+ Ex", 118.08936170212766, 0.00018189074042553204, 3.6220111460568154e-05, 7.77848997717718e-06],
        ["2:00+ Mas", 118.08936170212766, 0.00018537927234042558, 3.6492920643402336e-05, 8.024187337401705e-06],
        ["2:20+ Ex", 121.12844036697248, 0.00018669667889908246, 3.417271774389168e-05, 7.452720420510194e-06],
        ["2:20+ Mas", 121.12844036697248, 0.00019029718348623843, 3.444199542538192e-05, 7.654491497861184e-06],
        ["Ebi Hard", 100.0, 0.00014769999999999999, 4.4097482014388474e-05, 1.1901007194244603e-05],
        ["Ebi Ex", 100.0, 0.00015189999999999998, 4.9577263350905336e-05, 1.4030644052257618e-05],
        ["Ebi Mas", 100.0, 0.0001547, 4.988620689655171e-05, 1.1548275862068964e-05],
        ["L&F Hard", 122.0, 0.00018190199999999998, 4.6519822546972855e-05, 1.0253348643006263e-05],
        ["L&F Ex", 122.0, 0.00018788, 4.7369413583655435e-05, 7.324311430149089e-06],
        ["L&F Mas", 122.0, 0.00019129600000000003, 3.8237061089526334e-05, 8.096515830371166e-06],
        ["HCM Hard", 130.0, 0.00019564999999999999, 3.155169555388093e-05, 6.318764129615674e-06],
        ["HCM Ex", 130.0, 0.00020293, 2.9607508680555553e-05, 6.937777777777777e-06],
        ["HCM Mas", 130.0, 0.00020657, 2.8055989063110318e-05, 8.230064170526198e-06],
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
        Math.max(100, b - 50), Math.min(b + 50, 600),
        a, b, c, d, e, f, g, h, w, z, BA, "Team Power", "Event Bonus");
    PlotFn("plota-over", fn1, 600, 600,
        a, b,
        0, 400000, 100, 600,
        a, b, c, d, e, f, g, h, w, z, BA, "Team Power", "Event Bonus");
    Sum("suma", a, b, c, d, e, f, g, h, w, z, BA, 10000, 10,
        " Team Power", "% Event Bonus");
    Table("sumt", a, b, c, d, e, z, ct / 5, cl);
}
