data = data.map(x => ({
    eid: x[0],
    t: x[1],
    tfe: x[2],
    tfs: x[3],
    ep: x[4],
    b: x[5],
    ts: new Date(x[6] * 1000),
    s: x[7],
    l: x[8],
    u: x[9],
    n: x[10],
}));

currentEventEnd = new Date(events[currentEvent].end * 1000);
timeToCurrentEventEnd = Math.min(0, (new Date() - currentEventEnd) / 36e5);

function P(e, b) {
    let filteredData = data.filter(x => x.b == b);
    if (data.length == 0) return;
    document.getElementById(e).appendChild(
        Plot.plot({
            height: 800,
            width: 1400,
            style: "overflow: visible;",
            color: {legend: true},
            y: {grid: true},
            marks: [
                Plot.axisX({
                    anchor: "bottom",
                    label: "Time From End (hrs)",
                    interval: 24,
                }),
                Plot.gridX({interval: 12}),
                Plot.axisY({anchor: "left", label: "Event Points"}),
                Plot.axisY({anchor: "right", label: "Event Points"}),
                Plot.ruleY([0]),
                Plot.ruleX([0], {
                    stroke: "#666",
                    strokeOpacity: 0.5,
                    strokeDasharray: "3 2",
                }),
                Plot.ruleX([18], {strokeOpacity: 0}),
                Plot.ruleX(
                    [timeToCurrentEventEnd],
                    {
                        stroke: "red",
                        strokeWidth: 1,
                    }),
                Plot.line(
                    filteredData, {
                        filter: e => e.t == "r" && e.eid != currentEvent,
                        x: "tfe",
                        y: "ep",
                        z: e => "z" + e.eid + e.t + e.b,
                        stroke: e => events[e.eid].orderedNick,
                        strokeWidth: 1,
                    }),
                Plot.line(
                    filteredData, {
                        filter: e => e.t == "p" && e.eid != currentEvent,
                        x: "tfe",
                        y: "ep",
                        z: e => "z" + e.eid + e.t + e.b,
                        stroke: e => events[e.eid].orderedNick,
                        strokeWidth: 1,
                        strokeDasharray: "3 2",
                        strokeOpacity: 0.5,
                    }),
                Plot.dot(
                    filteredData, {
                        filter: e => e.t == "r" && e.eid != currentEvent,
                        x: "tfe",
                        y: "ep",
                        fill: e => events[e.eid].orderedNick,
                        symbol: "circle",
                        strokeWidth: 0,
                        fillOpacity: 0.5,
                        r: 1.5,
                    }),
                Plot.dot(
                    filteredData, {
                        filter: e => e.t == "r" && e.eid == currentEvent,
                        x: "tfe",
                        y: "ep",
                        fill: "red",
                        symbol: "circle",
                        strokeWidth: 0,
                        fillOpacity: 1,
                        r: 2,
                    }),
                Plot.line(
                    filteredData, {
                        filter: e => e.t == "r" && e.eid == currentEvent,
                        x: "tfe",
                        y: "ep",
                        z: e => "z" + e.eid + e.t + e.b,
                        stroke: "red",
                        strokeWidth: 2,
                        strokeOpacity: 1,
                    }),
                Plot.area(
                    filteredData, {
                        filter: e => e.t == "p" && e.eid == currentEvent
                            && e.l > 0,
                        x1: "tfe",
                        y1: "l",
                        y2: "u",
                        z: e => "z" + e.eid + e.t + e.b,
                        stroke: "red",
                        strokeWidth: 0.5,
                        strokeOpacity: 0.8,
                        fill: "red",
                        fillOpacity: 0.1,
                    }),
                Plot.line(
                    filteredData, {
                        filter: e => e.t == "p" && e.eid == currentEvent,
                        x: "tfe",
                        y: "ep",
                        z: e => "z" + e.eid + e.t + e.b,
                        stroke: "red",
                        strokeWidth: 1.5,
                        strokeDasharray: "4 3",
                    }),
                Plot.area(
                    filteredData, {
                        filter: e => e.t == "h" && e.eid == currentEvent
                            && e.l > 0,
                        x1: "tfe",
                        y1: "l",
                        y2: "u",
                        z: e => "z" + e.eid + e.t + e.b,
                        stroke: "red",
                        strokeWidth: 0.5,
                        strokeOpacity: 0.4,
                        fill: "red",
                        fillOpacity: 0.05,
                    }),
                Plot.line(
                    filteredData, {
                        filter: e => e.t == "h" && e.eid == currentEvent,
                        x: "tfe",
                        y: "ep",
                        z: e => "z" + e.eid + e.t + e.b,
                        stroke: "red",
                        strokeWidth: 1.5,
                        strokeDasharray: "4 3",
                        strokeOpacity: 0.5,
                    }),
                Plot.crosshair(
                    filteredData.filter(
                        e => e.eid != currentEvent && e.t == "i" || e.t == "h"),
                    {
                        x: "tfe",
                        y: "ep",
                        maxRadius: 10,
                    }),
                Plot.crosshairX(
                    filteredData.filter(
                        e => e.eid == currentEvent && e.t == "i" || e.t == "p"),
                    {
                        x: "tfe",
                        y: "ep",
                    }),
                Plot.crosshair(
                    filteredData.filter(
                        e => e.t == "p" || e.t == "h"),
                    {
                        x: "tfe",
                        y: "l",
                        maxRadius: 10,
                    }),
                Plot.crosshair(
                    filteredData.filter(
                        e => e.t == "p" || e.t == "h"),
                    {
                        x: "tfe",
                        y: "u",
                        maxRadius: 10,
                    }),
                Plot.text(filteredData,
                    Plot.selectLast({
                        filter: e => e.t == "r",
                        x: "tfe",
                        y: "ep",
                        z: "eid",
                        text: e => events[e.eid].nick,
                        textAnchor: "start",
                        dx: 5,
                    })),
                Plot.text(filteredData,
                    Plot.selectFirst({
                        filter: e => e.t == "h",
                        x: "tfe",
                        y: "ep",
                        z: "eid",
                        text: e => "Historical preds",
                        textAnchor: "end",
                        dx: -5,
                    })),
                Plot.text(
                    [[timeToCurrentEventEnd, 0]],
                    {
                        text: ["Now: " + timeToCurrentEventEnd.toFixed(1)],
                        textAnchor: "start",
                        dy: -6,
                        dx: 3
                    }),
                Plot.tip(
                    filteredData,
                    Plot.pointer({
                        filter: e => e.t == "r",
                        x: "tfe",
                        y: "ep",
                        stroke: e => events[e.eid].orderedNick,
                        channels: {
                            tweetId: e => e.s == 0
                                ? "<non-Twitter source>" : e.s.toString(),
                            notes: e => e.n ? e.n : null,
                        },
                        anchor: "bottom-right",
                        tip: true,
                        maxRadius: 10,
                    })),
                Plot.line(
                    Object.keys(events).map(x => ({eid: x})),
                    {
                        x: e => 0,
                        y: e => 0,
                        z: null,
                        strokeWidth: 0,
                        stroke: e => events[e.eid].orderedNick,
                    }),
            ]
        }));
}

function C(e, b) {
    let filteredData = data.filter(
        x => x.eid == currentEvent && b.includes(x.b));
    if (data.length == 0) return;
    document.getElementById(e).appendChild(
        Plot.plot({
            height: 800,
            width: 1400,
            style: "overflow: visible;",
            color: {legend: true, type: "ordinal", scheme: "Tableau10"},
            y: {grid: true},
            marks: [
                Plot.axisX({
                    anchor: "bottom",
                    label: "Time From End (hrs)",
                    interval: 24,
                }),
                Plot.gridX({interval: 12}),
                Plot.axisY({anchor: "left", label: "Event Points"}),
                Plot.axisY({anchor: "right", label: "Event Points"}),
                Plot.ruleY([0]),
                Plot.ruleX([0], {
                    stroke: "#666",
                    strokeOpacity: 0.5,
                    strokeDasharray: "3 2",
                }),
                Plot.ruleX([18], {strokeOpacity: 0}),
                Plot.ruleX(
                    [timeToCurrentEventEnd],
                    {
                        stroke: "red",
                        strokeWidth: 1,
                    }),
                Plot.dot(
                    filteredData, {
                        filter: e => e.t == "r",
                        x: "tfe",
                        y: "ep",
                        fill: "b",
                        symbol: "circle",
                        strokeWidth: 0,
                        fillOpacity: 1,
                        r: 2,
                    }),
                Plot.line(
                    filteredData, {
                        filter: e => e.t == "r",
                        x: "tfe",
                        y: "ep",
                        z: "b",
                        stroke: "b",
                    }),
                Plot.area(
                    filteredData, {
                        filter: e => e.t == "p" && e.l > 0,
                        x1: "tfe",
                        y1: "l",
                        y2: "u",
                        z: "b",
                        stroke: "b",
                        strokeWidth: 0.5,
                        strokeOpacity: 0.8,
                        fill: "b",
                        fillOpacity: 0.1,
                    }),
                Plot.line(
                    filteredData, {
                        filter: e => e.t == "p",
                        x: "tfe",
                        y: "ep",
                        z: "b",
                        stroke: "b",
                        strokeWidth: 1.5,
                        strokeDasharray: "4 3",
                    }),
                Plot.area(
                    filteredData, {
                        filter: e => e.t == "h" && e.l > 0,
                        x1: "tfe",
                        y1: "l",
                        y2: "u",
                        z: "b",
                        stroke: "b",
                        strokeWidth: 0.5,
                        strokeOpacity: 0.4,
                        fill: "b",
                        fillOpacity: 0.05,
                    }),
                Plot.line(
                    filteredData, {
                        filter: e => e.t == "h",
                        x: "tfe",
                        y: "ep",
                        z: "b",
                        stroke: "b",
                        strokeWidth: 1.5,
                        strokeDasharray: "4 3",
                        strokeOpacity: 0.5,
                    }),
                Plot.crosshair(
                    filteredData,
                    {
                        x: "tfe",
                        y: "ep",
                    }),
                Plot.crosshair(
                    filteredData,
                    {
                        x: "tfe",
                        y: "l",
                        maxRadius: 10,
                    }),
                Plot.crosshair(
                    filteredData,
                    {
                        x: "tfe",
                        y: "u",
                        maxRadius: 10,
                    }),
                Plot.text(filteredData,
                    Plot.selectLast({
                        filter: e => e.t == "r",
                        x: "tfe",
                        y: "ep",
                        z: "b",
                        text: "b",
                        textAnchor: "start",
                        dx: 5,
                    })),
                Plot.text(filteredData,
                    Plot.selectFirst({
                        filter: e => e.t == "h",
                        x: "tfe",
                        y: "ep",
                        z: "b",
                        text: e => `Historical preds (T${e.b})`,
                        textAnchor: "end",
                        dx: -5,
                    })),
                Plot.text(
                    [[timeToCurrentEventEnd, 0]],
                    {
                        text: ["Now: " + timeToCurrentEventEnd.toFixed(1)],
                        textAnchor: "start",
                        dy: -6,
                        dx: 3
                    }),
                Plot.tip(
                    filteredData,
                    Plot.pointer({
                        filter: e => e.t == "r",
                        x: "tfe",
                        y: "ep",
                        stroke: "b",
                        channels: {
                            tweetId: e => e.s == 0
                                ? "<non-Twitter source>" : e.s.toString(),
                            notes: e => e.n ? e.n : null,
                        },
                        anchor: "bottom-right",
                        tip: true,
                        maxRadius: 10,
                    })),
                Plot.line(
                    b.map(x => ({b: x})),
                    {
                        x: e => -222,
                        y: e => 0,
                        z: null,
                        strokeWidth: 0,
                        stroke: "b",
                    }),
            ]
        }));
}
