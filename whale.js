const currentPerm = 246;
const currentFes = 20;

const RollType = {
    Normal: 0,
    Multi10: 1,
    Pity: 2,
    PityPu: 3,
};

class Params {
    constructor(pool, puPool, maxDupes, rate) {
        this.pool = pool;
        this.puPool = puPool;
        this.npPool = pool - puPool;
        this.maxDupes = maxDupes;
        this.rate = rate;
        this.rate10 = ((1 - rate - 0.085) ** 10) * rate + rate;
        this.puRate = 0.004 * puPool;
        this.npRate = rate - this.puRate;
        let puw = this.puRate / this.rate;
        this.puRate10 = this.rate10 * puw;
        this.npRate10 = this.rate10 - this.puRate10;
    }

    MakeStateVector() {
        let v = new Array(this.npPool + 1);
        for (let i = 0; i < v.length; ++i) {
            v[i] = new Array(this.puPool + 1);
            for (let j = 0; j < v[i].length; ++j) {
                v[i][j] = new Array(this.maxDupes + 1);
                for (let k = 0; k < v[i][j].length; ++k) {
                    v[i][j][k] = 0;
                }
            }
        }
        return v;
    }
};

class State {
    constructor(np, pu, dupe, params) {
        this.np = np;
        this.pu = pu;
        this.dupe = dupe;
        this.params = params;
    }

    Valid() {
        return this.np >= 0 && this.pu >= 0 && this.dupe >= 0 &&
            this.np <= this.params.npPool &&
            this.pu <= this.params.puPool &&
            this.dupe <= this.params.maxDupes;
    }

    Get(v) {
        if (!this.Valid()) return 0;
        return v[this.np][this.pu][this.dupe];
    }

    Set(v, x) {
        if (!this.Valid()) return;
        v[this.np][this.pu][this.dupe] = x;
    }

    get npw() {
        return this.np / this.params.npPool;
    }

    get rnp() {
        return this.params.npPool - this.np;
    }

    get rnpw() {
        return this.rnp / this.params.npPool;
    }

    get puw() {
        if (this.params.puPool == 0) return 0;
        return this.pu / this.params.puPool;
    }

    get rpu() {
        return this.params.puPool - this.pu;
    }

    get rpuw() {
        if (this.params.puPool == 0) return 0;
        return this.rpu / this.params.puPool;
    }

    NpChance(type) {
        if (!this.Valid()) return 0;
        switch (type) {
            case RollType.Pity:
                if (this.params.pool > 250) {
                    return (1 - 0.004 * this.params.puPool) *
                        this.rnpw;
                }
                return this.rnp / this.params.pool;
            case RollType.PityPu:
                return 0;
            case RollType.Multi10:
                return this.params.npRate10 * this.rnpw;
            default:
                return this.params.npRate * this.rnpw;
        }
    }

    PuChance(type) {
        if (!this.Valid()) return 0;
        switch (type) {
            case RollType.Pity:
                if (this.params.pool > 250) return this.rpu * 0.004;
                return this.rpu / this.params.pool;
            case RollType.PityPu:
                if (this.params.puPool == 0) return 0;
                return this.rpu / this.params.puPool;
            case RollType.Multi10:
                return this.params.puRate10 * this.rpuw;
            default:
                return this.params.puRate * this.rpuw;
        }
    }

    DupeChance(type) {
        if (!this.Valid()) return 0;
        if (this.dupe >= this.params.maxDupes) return 0;
        switch (type) {
            case RollType.Pity:
            case RollType.PityPu:
                return 1 - this.PuChance(type) - this.NpChance(type);
            case RollType.Multi10:
                return this.params.puRate10 * this.puw +
                    this.params.npRate10 * this.npw;
            default:
                return this.params.puRate * this.puw +
                    this.params.npRate * this.npw;
        }
    }

    RolledNp() {
        return new State(this.np - 1, this.pu, this.dupe, this.params);
    }

    RolledPu() {
        return new State(this.np, this.pu - 1, this.dupe, this.params);
    }

    RolledDupe() {
        return new State(this.np, this.pu, this.dupe - 1, this.params);
    }

    Transition(v, type) {
        let rolled_np = this.RolledNp();
        let rolled_pu = this.RolledPu();
        let rolled_dupe = this.RolledDupe();
        return Math.max(
            rolled_np.Get(v) * rolled_np.NpChance(type) +
            rolled_pu.Get(v) * rolled_pu.PuChance(type) +
            rolled_dupe.Get(v) * rolled_dupe.DupeChance(type) +
            this.Get(v) * (1 - this.NpChance(type) - this.PuChance(type) -
                this.DupeChance(type)), 0);
    }
};

function Transition(v, type, params) {
    let newV = params.MakeStateVector();
    for (let i = 0; i <= params.npPool; ++i) {
        for (let j = 0; j <= params.puPool; ++j) {
            for (let k = 0; k <= params.maxDupes; ++k) {
                let st = new State(i, j, k, params);
                st.Set(newV, st.Transition(v, type));
            }
        }
    }
    return newV;
}

function Pct(c, pct) {
    for (let i = 0; i < c.length; ++i) {
        if (c[i].probability > pct) {
            return i;
        }
    }
    return undefined;
}

function E(v) {
    let x = 0;
    let w = 0;
    for (let i = 0; i < v.length; ++i) {
        x += v[i].count * v[i].probability;
        w += v[i].probability;
    }
    return x / w;
}

function Var(v, mu) {
    let x = 0;
    let w = 0;
    for (let i = 0; i < v.length; ++i) {
        x += v[i].probability * ((v[i].count - mu) ** 2);
        w += v[i].probability;
    }
    return x / w;
}

function Slice(d, x) {
    const maxP = 0.001;
    const minP = 0.001;
    const minSpan = 10;
    let start = 0;
    let end = d.length;
    let dropped = 0;
    while ((dropped + d[start].probability < maxP ||
            d[start].probability < minP)
        && start < end) {
        dropped += d[start].probability;
        ++start;
    }
    dropped = 0;
    while ((dropped + d[end - 1].probability < maxP ||
            d[end - 1].probability < minP)
        && end > start) {
        dropped += d[end - 1].probability;
        --end;
    }
    while (end - start < minSpan && end < d.length && start > 0) {
        end = Math.min(end + 1, d.length);
        start = Math.max(start - 1, 0);
    }
    return x.slice(start, end);
}

function NpD(v, params) {
    let d = new Array(params.npPool + 1);
    for (let i = 0; i < d.length; ++i) {
        d[i] = {
            count: i,
            probability: 0
        };
    }
    for (let i = 0; i <= params.npPool; ++i) {
        for (let j = 0; j <= params.puPool; ++j) {
            for (let k = 0; k <= params.maxDupes; ++k) {
                let st = new State(i, j, k, params);
                d[i].probability += st.Get(v);
            }
        }
    }
    return d;
}

function PuD(v, params) {
    let d = new Array(params.puPool + 1);
    for (let i = 0; i < d.length; ++i) {
        d[i] = {
            count: i,
            probability: 0
        };
    }
    for (let i = 0; i <= params.npPool; ++i) {
        for (let j = 0; j <= params.puPool; ++j) {
            for (let k = 0; k <= params.maxDupes; ++k) {
                let st = new State(i, j, k, params);
                d[j].probability += st.Get(v);
            }
        }
    }
    return d;
}

function DupeD(v, params) {
    let d = new Array(params.maxDupes + 1);
    for (let i = 0; i < d.length; ++i) {
        d[i] = {
            count: i,
            probability: 0
        };
    }
    for (let i = 0; i <= params.npPool; ++i) {
        for (let j = 0; j <= params.puPool; ++j) {
            for (let k = 0; k <= params.maxDupes; ++k) {
                let st = new State(i, j, k, params);
                d[k].probability += st.Get(v);
            }
        }
    }
    return d;
}

function Cumulative(x) {
    let z = new Array(x.length);
    for (let i = 0; i < x.length; ++i) {
        let p = i > 0 ? z[i-1].probability : 0;
        z[i] = {
            count: x[i].count,
            probability: p + x[i].probability
        }
    }
    return z;
}

function Sleep(ms) { return new Promise((r) => setTimeout(r, ms)); }

function Clear(e) {
    while(e.firstChild){
        e.removeChild(e.firstChild);
    }
}

function PlotD(d, prefix, color) {
    let sd = Slice(d, d);
    let sc = Slice(d, Cumulative(d));
    let cc = document.getElementById(prefix + "-d");
    let mu = E(d);
    let v = Var(d, mu);
    let stdev = Math.sqrt(v);
    Clear(cc);
    cc.append(
        Plot.plot({
            y: {percent: true},
            marks: [
                Plot.barY(sd, {x: "count", y: "probability", fill: color}),
                Plot.crosshair(sd, {x: "count", y: "probability"}),
                Plot.ruleY([0]),
                Plot.gridX({strokeDasharray: "5,3"}),
                Plot.gridY({strokeDasharray: "5,3"}),
            ]
        }));
    let cc2 = document.getElementById(prefix + "-c");
    Clear(cc2);
    cc2.append(
        Plot.plot({
            y: {percent: true},
            marks: [
                Plot.barY(sc, {x: "count", y: "probability", fill: color}),
                Plot.crosshair(sc, {x: "count", y: "probability"}),
                Plot.ruleY([0]),
                Plot.gridX({strokeDasharray: "5,3"}),
                Plot.gridY({strokeDasharray: "5,3"}),
            ]
        }));
    document.getElementById(prefix + "-exp").innerText = mu.toFixed(2);
    document.getElementById(prefix + "-var").innerText = v.toFixed(2);
    document.getElementById(prefix + "-stdev").innerText = stdev.toFixed(2);
}

function ToPdf(c) {
    let pdf = [];
    for (let i = 0; i < c.length; ++i) {
        if (c[i].probability == undefined) {
            break;
        }
        pdf.push({
            count: i,
            probability: c[i].probability - (i == 0 ? 0 : c[i-1].probability)
        });
    }
    return pdf;
}

function MakeTableRow(row, data, tag) {
    for (let i = 0; i < data.length; ++i) {
        row.appendChild(document.createElement(tag));
        row.lastChild.innerText = data[i];
        if (data[i] == "???") {
            row.lastChild.classList.add("x");
            row.lastChild.title =
                "Insufficient data: increase the number of rolls.";
        }
    }
}

function MakeSummary(rollCount, cs, prefix) {
    let table = document.createElement("table");
    table.classList.add("st");
    let cc = document.getElementById(prefix + "-sum");
    Clear(cc);
    cc.appendChild(table);
    let headerRow = table.insertRow();
    let data = [[""], ["μ"], ["σ"],
        ["99.9%ile"], ["99%ile"], ["95%ile"], ["90%ile"], ["70%ile"],
        ["50%ile"], ["25%ile"], ["10%ile"]];
    for (let i = 0; i < cs.length; ++i) {
        data[0].push(cs[i][0].count);
        let x = cs[i][rollCount].probability < 0.99;
        let pdf = x ? undefined : ToPdf(cs[i]);
        let mu = x ? undefined : E(pdf);
        let sigma = x ? undefined : Math.sqrt(Var(pdf, mu));
        data[1].push(x ? "???" : String(mu.toFixed(2)));
        data[2].push(x ? "???" : String(sigma.toFixed(2)));
        data[3].push(Pct(cs[i], 0.999) ?? "???");
        data[4].push(Pct(cs[i], 0.99) ?? "???");
        data[5].push(Pct(cs[i], 0.95) ?? "???");
        data[6].push(Pct(cs[i], 0.90) ?? "???");
        data[7].push(Pct(cs[i], 0.70) ?? "???");
        data[8].push(Pct(cs[i], 0.50) ?? "???");
        data[9].push(Pct(cs[i], 0.25) ?? "???");
        data[10].push(Pct(cs[i], 0.10) ?? "???");
    }
    MakeTableRow(table.insertRow(), data[0], "th");
    for (let i = 1; i < data.length; ++i) {
        MakeTableRow(table.insertRow(), data[i], "td");
    }
}

function PlotC(rollCount, cs, prefix) {
    if (cs.length == 0) return;
    MakeSummary(rollCount, cs, prefix);
    let cc = document.getElementById(prefix + "-cd");
    Clear(cc);
    let marks = [];
    for (let i = 0; i < cs.length; ++i) {
        marks.push(
            Plot.line(cs[i], {x: "rolls", y: "probability", stroke: "color"}),
            Plot.crosshair(cs[i], {x: "rolls", y: "probability"}),
            Plot.text(
                cs[i].filter(x => x.probability != undefined),
                Plot.selectLast({
                    x: "rolls", y: "probability", text: "count",
                    textAnchor: "start", dx: 3
                })));
    }
    marks.push(
        Plot.ruleY([0]),
        Plot.gridX({strokeDasharray: "5,3"}),
        Plot.gridY({strokeDasharray: "5,3"}));
    cc.append(
        Plot.plot({
            y: {percent: true},
            marks: marks
        }));
}

function PlotSt(st, prefix, color) {
    let cc = document.getElementById(prefix + "-st");
    Clear(cc);
    let marks = [];
    marks.push(
        Plot.line(st, {x: "roll", y: "mu", stroke: color, strokeWidth: 2}),
        Plot.line(st, {x: "roll", y: "ms2", stroke: color, strokeWidth: 1}),
        Plot.line(st, {x: "roll", y: "ps2", stroke: color, strokeWidth: 1}),
        Plot.line(st, {x: "roll", y: "ms1", stroke: color, strokeWidth: 0.5}),
        Plot.line(
            st, {x: "roll", y: "ps1", stroke: color, strokeWidth: 0.5}),
        Plot.crosshair(st, {x: "roll", y: "mu"}),
        Plot.crosshair(st, {x: "roll", y: "ms2"}),
        Plot.crosshair(st, {x: "roll", y: "ps2"}),
        Plot.crosshair(st, {x: "roll", y: "ms1"}),
        Plot.crosshair(st, {x: "roll", y: "ps1"}),
        Plot.text(
            st.filter(x => x.mu != undefined),
            Plot.selectLast({
                x: "roll", y: "mu", text: x => "μ", textAnchor: "start", dx: 3
            })),
        Plot.text(
            st.filter(x => x.mu != undefined),
            Plot.selectLast({
                x: "roll", y: "ms2", text: x => "-2σ", textAnchor: "start",
                dx: 3
            })),
        Plot.text(
            st.filter(x => x.mu != undefined),
            Plot.selectLast({
                x: "roll", y: "ps2", text: x => "+2σ", textAnchor: "start",
                dx: 3
            })),
        Plot.text(
            st.filter(x => x.mu != undefined),
            Plot.selectLast({
                x: "roll", y: "ms1", text: x => "-σ", textAnchor: "start",
                dx: 3
            })),
        Plot.text(
            st.filter(x => x.mu != undefined),
            Plot.selectLast({
                x: "roll", y: "ps1", text: x => "+σ", textAnchor: "start",
                dx: 3
            })),
        Plot.ruleY([st[0].clamp]),
        Plot.gridX({strokeDasharray: "5,3"}),
        Plot.gridY({strokeDasharray: "5,3"}));
    cc.append(
        Plot.plot({
            marks: marks
        }));
}

function Refresh(
    i, numRolls, puD, npD, dupeD, puC, spPuC, dupeC, spDupeC, npC, puSt, npSt,
    dupeSt) {
    let progress = document.getElementById("progress");
    progress.value = i / numRolls;
    let progressText = document.getElementById("progress-text");
    progressText.innerText = "(" + String(i) + "/" + String(numRolls) + ")";
    PlotD(dupeD, "dupe", "steelblue");
    PlotD(puD, "pu", "lightcoral");
    PlotD(npD, "np", "olivedrab");
    PlotC(i, dupeC, "dupe");
    PlotC(i, spDupeC, "sp-dupe");
    PlotC(i, puC, "pu");
    PlotC(i, spPuC, "sp-pu");
    PlotC(i, npC, "np");
    PlotSt(puSt, "pu", "lightcoral");
    PlotSt(npSt, "np", "olivedrab");
    PlotSt(dupeSt, "dupe", "steelblue");
}

function Clamp(x, min, max) {
    return Math.min(Math.max(x, min), max)
}

function MakeC(numRolls, count) {
    let x = new Array(numRolls + 1);
    for (let i = 0; i < x.length; ++i) {
        x[i] = {
            rolls: i,
            probability: undefined,
            color: "lel" + String(count),
            count: count
        };
    }
    x[0].probability = 0;
    return x;
}

function UpdateC(cs, offset, d, numRoll, stride) {
    for (let i = 0; i < cs.length; ++i) {
        cs[i][numRoll].probability = 0;
        for (let j = i * stride + offset; j < d.length; ++j) {
            cs[i][numRoll].probability += d[j].probability;
        }
    }
}

function NumSparks(numRoll, tc) {
    let x = 0;
    let rs = numRoll;
    let rt = tc;
    while (rs + Math.min(rt, 10) * 10 >= 300) {
        x += 1;
        let ticketsUsed = Math.min(rt, 10);
        rt -= ticketsUsed;
        rs -= 300 - ticketsUsed * 10;
    }
    return x;
}

function Sp(
    cs, offset, d, numRoll, ns, maxPu) {
    for (let i = 0; i < cs.length; ++i) {
        if (i + offset > maxPu) {
            cs[i][numRoll].probability = 0;
            continue;
        }
        cs[i][numRoll].probability = 0;
        if (i + offset - ns < 0) {
            cs[i][numRoll].probability = 1;
        } else {
            for (let j = i + offset - ns; j < d.length; ++j) {
                cs[i][numRoll].probability += d[j].probability;
            }
        }
    }
}

function SpDup(
    cs, offset, dupeD, puD, maxPu, numRoll, ns, stride, maxDupes) {
    let transition = [1];
    for (let i = 1; i <= ns; ++i) {
        let prob = 1;
        for (j = i; j <= ns; ++j) {
            if (ns - i <= maxPu) {
                prob = puD[maxPu - ns + j].probability;
            }
        }
        transition.push(prob);
    }
    for (let i = 0; i < cs.length; ++i) {
        if (i + offset > maxDupes) {
            cs[i][numRoll].probability = 0;
            continue;
        }
        cs[i][numRoll].probability = 0;
        for (let j = i * stride + offset - ns; j < dupeD.length; ++j) {
            let k = i + offset - j;
            if (j < 0) {
                cs[i][numRoll].probability = 1;
                break;
            } else {
                cs[i][numRoll].probability +=
                    dupeD[j].probability * transition[Math.max(k, 0)];
            }
        }
    }
}

class St {
    constructor (roll, min, max) {
        this.roll = roll;
        this.mu = undefined;
        this.stdev = undefined;
        this.min = min;
        this.max = max;
    }

    get ms2() {
        return Math.max(this.mu - 2 * this.stdev, this.min);
    }

    get ps2() {
        return Math.min(this.mu + 2 * this.stdev, this.max);
    }

    get ms1() {
        return Math.max(this.mu - this.stdev, this.min);
    }

    get ps1() {
        return Math.min(this.mu + this.stdev, this.max);
    }
};

function Sts(numRolls, min, max) {
    let x = new Array(numRolls + 1);
    for (let i = 0; i < x.length; ++i) {
        x[i] = new St(i, min, max);
    }
    return x;
}

function UpdateSt(x, i, v) {
    x[i].mu = E(v);
    x[i].stdev = Math.sqrt(Var(v, x[i].mu));
}

function SetParams(pool, pu, fes, pity, maxRolls, dupesStride, npStride) {
    if (pool != undefined) {
        document.getElementById("pool-text").value = pool;
        document.getElementById("pool-slider").value = pool;
    }
    if (pu != undefined) {
        document.getElementById("pu-text").value = pu;
        document.getElementById("pu-slider").value = pu;
    }
    if (fes != undefined) {
        document.getElementById("fes-rates-checkbox").checked = fes;
    }
    if (pity != undefined) {
        document.getElementById("pity-checkbox").checked = pity;
    }
    if (maxRolls != undefined) {
        document.getElementById("num-rolls-text").value = maxRolls;
        document.getElementById("num-rolls-slider").value = maxRolls;
    }
    if (dupesStride != undefined) {
        document.getElementById("dupes-stride-text").value = dupesStride;
        document.getElementById("dupes-stride-slider").value = dupesStride;
    }
    if (npStride != undefined) {
        document.getElementById("np-stride-text").value = npStride;
        document.getElementById("np-stride-slider").value = npStride;
    }
}

function Fes10PUPreset() {
    SetParams(currentPerm + currentFes, 10, true, false, 1000, 5, 2);
}

function Fes8PUPreset() {
    SetParams(currentPerm + currentFes, 8, true, false, 1000, 5, 2);
}

function Fes6PUPreset() {
    SetParams(currentPerm + currentFes, 6, true, false, 900, 4, 2);
}

function Fes5PUPreset() {
    SetParams(currentPerm + currentFes, 5, true, false, 900, 4, 2);
}

function Lim5PUPreset() {
    SetParams(currentPerm, 5, false, false, 900, 2, 2);
}

function Lim3PUPreset() {
    SetParams(currentPerm, 3, false, false, 900, 2, 2);
}

function Perm3PUPreset() {
    SetParams(currentPerm, 3, false, true, 600, 2, 2);
}

var stop = false;

function Stop() {
    let stopButton = document.getElementById("stop");
    stopButton.disabled = true;
    stop = true;
}

function Sync(e) {
    document.getElementById(
        e.id.endsWith("-slider") ? e.id.replace("-slider", "-text")
                                 : e.id.replace("-text", "-slider")).value =
        e.value;
}

function Sv(x, min, max) {
    return Clamp(document.getElementById(x + "-slider").value, min, max);
}

function Cb(x) {
    return document.getElementById(x + "-checkbox").checked;
}

async function Roll() {
    let start = document.getElementById("start");
    let stopButton = document.getElementById("stop");
    start.disabled = true;
    stop = false;
    stopButton.disabled = false;
    let progress = document.getElementById("progress");
    progress.value = 0;
    let numRolls = Sv("num-rolls", 0, 3000);
    let pool = Sv("pool", 0, 300);
    let pu = Sv("pu", 0, 10);
    let maxDupes = Sv("max-dupes", 0, 300);
    let initNp = Sv("init-np", 0, pool - pu);
    let initPu = Sv("init-pu", 0, pu);
    let rate = Cb("fes-rates") ? 0.06 : 0.03;
    let multi = Cb("multi");
    let pity = Cb("pity");
    let paid = Cb("paid");

    let params = new Params(pool, pu, maxDupes, rate);
    let initState = new State(initNp, initPu, 0, params);
    let v = params.MakeStateVector();
    let pf = paid ? 2 : 1;
    initState.Set(v, 1);

    let puD = PuD(v, params);
    let npD = NpD(v, params);
    let dupeD = DupeD(v, params);
    let puStart = 1 + initPu;
    let mt = 10;
    let dupeStart = Sv("track-dupes", 1, 300 - mt);
    let dupeStride = Sv("dupes-stride", 1, 10);
    let npStart = Sv("track-np", 1, 300 - mt) + initNp;
    let npStride = Sv("np-stride", 1, 10);
    let numTickets = Sv("ticket", 0, 300);
    let dupeSt = Sts(numRolls, 0, maxDupes);
    let puSt = Sts(numRolls, initPu, pu);
    let npSt = Sts(numRolls, initNp, pool - pu);
    let dupeC = new Array(mt);
    let spDupeC = new Array(mt);
    let npC = new Array(mt);
    for (let i = 0; i < mt; ++i) {
        dupeC[i] = MakeC(numRolls, dupeStart + i * dupeStride, "dupes");
        spDupeC[i] = MakeC(numRolls, dupeStart + i * dupeStride, "dupes");
        npC[i] = MakeC(numRolls, npStart + i * npStride, "np");
    }
    let puC = new Array(pu);
    let spPuC = new Array(pu);
    for (let i = 0; i < puC.length; ++i) {
        puC[i] = MakeC(numRolls, puStart + i, "PU");
        spPuC[i] = MakeC(numRolls, puStart + i, "PU");
    }
    UpdateSt(puSt, 0, puD);
    UpdateSt(npSt, 0, npD);
    UpdateSt(dupeSt, 0, dupeD);
    Refresh(
        0, numRolls, puD, npD, dupeD, puC, spPuC, dupeC, spDupeC, npC, puSt,
        npSt, dupeSt);
    await Sleep(0);
    let lastUpdate = new Date().getTime();

    let i = 1;
    for (i = 1; i <= numRolls; ++i) {
        if (stop) break;
        let type = RollType.Normal;
        if (i % 10 == 0 && multi) type = RollType.Multi10;
        if (pity && (i * pf) % 100 == 0) type = RollType.Pity;
        if (pity && (i * pf) % 200 == 0) type = RollType.PityPu;
        v = Transition(v, type, params);
        puD = PuD(v, params);
        npD = NpD(v, params);
        dupeD = DupeD(v, params);
        UpdateC(puC, puStart, puD, i, 1);
        UpdateC(dupeC, dupeStart, dupeD, i, dupeStride);
        UpdateC(npC, npStart, npD, i, npStride);
        UpdateSt(puSt, i, puD);
        UpdateSt(npSt, i, npD);
        UpdateSt(dupeSt, i, dupeD);
        let ns = NumSparks(i, numTickets);
        Sp(spPuC, puStart, puD, i, ns, pu);
        SpDup(spDupeC, dupeStart, dupeD, puD, pu, i, ns, dupeStride, maxDupes);
        if (lastUpdate + 100 < new Date().getTime()) {
            Refresh(
                i, numRolls, puD, npD, dupeD, puC, spPuC, dupeC, spDupeC, npC,
                puSt, npSt, dupeSt);
            await Sleep(0);
            lastUpdate = new Date().getTime();
        }
    }
    Refresh(
        Math.min(i, numRolls), numRolls, puD, npD, dupeD, puC, spPuC, dupeC,
        spDupeC, npC, puSt, npSt, dupeSt);
    start.disabled = false;
    stopButton.disabled = true;
}
