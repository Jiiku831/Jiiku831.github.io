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

now = new Date();
currentEventEnd = new Date(events[currentEvent].end * 1000);
timeToCurrentEventEnd = Math.min(0, (now - currentEventEnd) / 36e5);
minx = -222;
if (currentChapter != "") {
    currentChapterEnd = new Date(events[currentChapter].end * 1000);
    timeToCurrentChapterEnd = Math.min(0, (now - currentChapterEnd) / 36e5);
} else {
    timeToCurrentChapterEnd = null;
}

function CurrentEventNotCurrentChapter(eid) {
    return eid.startsWith(currentEvent) && eid != currentChapter;
}

function MP(e, b, filteredData, ev, color) {
    return [
        Plot.dot(
            filteredData, Plot.selectLast({
                filter: e => e.t == "r" && e.eid == ev,
                x: "tfe",
                y: "ep",
                fill: color,
                symbol: "circle",
                strokeWidth: 0,
                fillOpacity: 1,
                r: 2,
            })),
        Plot.line(
            filteredData, {
                filter: e => e.t == "r" && e.eid == ev,
                x: "tfe",
                y: "ep",
                z: e => "z" + e.eid + e.t + e.b,
                stroke: color,
                strokeWidth: 2,
                strokeOpacity: 1,
            }),
        Plot.area(
            filteredData, {
                filter: e => e.t == "p" && e.eid == ev && e.l > 0,
                x1: "tfe",
                y1: "l",
                y2: "u",
                z: e => "z" + e.eid + e.t + e.b,
                stroke: color,
                strokeWidth: 0.5,
                strokeOpacity: 0.8,
                fill: color,
                fillOpacity: 0.1,
            }),
        Plot.line(
            filteredData, {
                filter: e => e.t == "p" && e.eid == ev,
                x: "tfe",
                y: "ep",
                z: e => "z" + e.eid + e.t + e.b,
                stroke: color,
                strokeWidth: 1.5,
                strokeDasharray: "4 3",
            }),
        Plot.area(
            filteredData, {
                filter: e => e.t == "h" && e.eid == ev && e.l > 0,
                x1: "tfe",
                y1: "l",
                y2: "u",
                z: e => "z" + e.eid + e.t + e.b,
                stroke: color,
                strokeWidth: 0.5,
                strokeOpacity: 0.4,
                fill: color,
                fillOpacity: 0.05,
            }),
        Plot.line(
            filteredData, {
                filter: e => e.t == "s" && e.eid == ev,
                x: "tfe",
                y: "ep",
                z: e => "z" + e.eid + e.t + e.b,
                stroke: color,
                strokeWidth: 1,
                strokeDasharray: "1 3",
                strokeOpacity: 0.5,
            }),
        Plot.line(
            filteredData, {
                filter: e => e.t == "h" && e.eid == ev,
                x: "tfe",
                y: "ep",
                z: e => "z" + e.eid + e.t + e.b,
                stroke: color,
                strokeWidth: 1.5,
                strokeDasharray: "4 3",
                strokeOpacity: 0.5,
            }),
        Plot.crosshair(
            filteredData.filter(
                e => e.eid != ev && e.t == "i" || e.t == "h" || e.t == "s"),
            {
                x: "tfe",
                y: "ep",
                maxRadius: 10,
            }),
        Plot.crosshairX(
            filteredData.filter(
                e => e.eid == ev && e.t == "i" || e.t == "p"),
            {
                x: "tfe",
                y: "ep",
            }),
        Plot.text(filteredData,
            Plot.selectFirst({
                filter: e => e.t == "h" && e.eid == ev,
                x: "tfe",
                y: "ep",
                z: "eid",
                text: e => "Historical preds",
                textAnchor: "end",
                dx: -5,
            })),
        Plot.text(filteredData,
            Plot.selectFirst({
                filter: e => e.t == "s" && e.eid == ev,
                x: "tfe",
                y: "ep",
                z: "eid",
                text: e => "SBP preds",
                textAnchor: "end",
                dx: -5,
            })),
    ];
}

function M(e, b, t) {
    let filteredData = [];
    if (t) {
        filteredData = data.filter(x => x.b == b && events[x.eid].event_type == "world_bloom");
    } else {
        filteredData = data.filter(x => x.b == b && events[x.eid].event_type != "world_bloom");
    }
    if (data.length == 0) return;
    marks = [
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
    ];
    if (t || timeToCurrentChapterEnd == null) {
        marks.push(
            Plot.ruleX([18], {strokeOpacity: 0}),
            Plot.ruleX(
                [timeToCurrentEventEnd],
                {
                    stroke: "red",
                    strokeWidth: 1,
                }));
    } else {
        marks.push(
            Plot.ruleX([6], {strokeOpacity: 0}),
            Plot.ruleX(
                [timeToCurrentChapterEnd],
                {
                    stroke: "blue",
                    strokeWidth: 1,
                }),

        );
    }
    marks.push(
        Plot.line(
            filteredData, {
                filter: e => e.t == "r" && !e.eid.startsWith(currentEvent),
                x: "tfe",
                y: "ep",
                z: e => "z" + e.eid + e.t + e.b,
                stroke: e => events[e.eid].orderedNick,
                strokeWidth: 0.5,
            }),
        Plot.line(
            filteredData, {
                filter: e => e.t == "p" && !e.eid.startsWith(currentEvent),
                x: "tfe",
                y: "ep",
                z: e => "z" + e.eid + e.t + e.b,
                stroke: e => events[e.eid].orderedNick,
                strokeWidth: 0.5,
                strokeDasharray: "3 2",
                strokeOpacity: 0.5,
            }),
        Plot.dot(
            filteredData, Plot.selectLast({
                filter: e => e.t == "r" && !e.eid.startsWith(currentEvent),
                x: "tfe",
                y: "ep",
                fill: e => events[e.eid].orderedNick,
                symbol: "circle",
                strokeWidth: 0,
                fillOpacity: 0.5,
                r: 1.5,
            })),
        Plot.line(
            filteredData, {
                filter: e => e.t == "r" && CurrentEventNotCurrentChapter(e.eid),
                x: "tfe",
                y: "ep",
                z: e => "z" + e.eid + e.t + e.b,
                stroke: e => events[e.eid].orderedNick,
                strokeWidth: 2,
            }),
        Plot.line(
            filteredData, {
                filter: e => e.t == "p" && CurrentEventNotCurrentChapter(e.eid),
                x: "tfe",
                y: "ep",
                z: e => "z" + e.eid + e.t + e.b,
                stroke: e => events[e.eid].orderedNick,
                strokeWidth: 2,
                strokeDasharray: "3 2",
                strokeOpacity: 0.5,
            }),
        Plot.dot(
            filteredData, Plot.selectLast({
                filter: e => e.t == "r" && CurrentEventNotCurrentChapter(e.eid),
                x: "tfe",
                y: "ep",
                fill: e => events[e.eid].orderedNick,
                symbol: "circle",
                strokeWidth: 0,
                fillOpacity: 0.5,
                r: 2,
            })),
    );
    if (t || timeToCurrentChapterEnd == null) {
        marks = marks.concat(MP(e, b, filteredData, currentEvent, "red"));
    } else {
        marks = marks.concat(MP(e, b, filteredData, currentChapter, "blue"));
    }
    marks.push(
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
    );
    if (t || timeToCurrentChapterEnd == null) {
        marks.push(Plot.text(
            [[timeToCurrentEventEnd, 0]],
            {
                text: ["Now: " + timeToCurrentEventEnd.toFixed(1)],
                textAnchor: "start",
                dy: -6,
                dx: 3
            }));
    } else {
        marks.push(
                Plot.text(
                [[timeToCurrentChapterEnd, 0]],
                {
                    text: ["Now: " + timeToCurrentChapterEnd.toFixed(1)],
                    textAnchor: "start",
                    dy: -6,
                    dx: 3
                }),
        );
    }
    marks.push(
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
    );
    if (t || timeToCurrentChapterEnd == null) {
        marks.push(Plot.line(
            Object.keys(events).map(x => ({eid: x})),
            {
                x: e => minx,
                y: e => 0,
                z: null,
                strokeWidth: 0,
                stroke: e => events[e.eid].orderedNick,
            }));
    }
    return marks;
}

function P(e, b, m = 0) {
    if (timeToCurrentChapterEnd != null) {
      if (m != 2) {
        document.getElementById(e).appendChild(
            Plot.plot({
                height: 800,
                width: 1400,
                style: "overflow: visible;",
                color: {legend: true},
                y: {grid: true},
                marks: M(e, b, true),
            }));
      }
      if (m != 1) {
        let newNode = document.createElement("h2");
        newNode.appendChild(
            document.createTextNode("Chapter Ranking"));
        document.getElementById(e).appendChild(newNode);
      }
    }
    if (m != 1) {
      document.getElementById(e).appendChild(
          Plot.plot({
              height: 800,
              width: 1400,
              style: "overflow: visible;",
              color: {legend: true},
              y: {grid: true},
              marks: M(e, b, false),
          }));
    }
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
                    filteredData, Plot.selectLast({
                        filter: e => e.t == "r",
                        x: "tfe",
                        y: "ep",
                        fill: "b",
                        symbol: "circle",
                        strokeWidth: 0,
                        fillOpacity: 1,
                        r: 2,
                    })),
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
                        x: e => minx,
                        y: e => 0,
                        z: null,
                        strokeWidth: 0,
                        stroke: "b",
                    }),
            ]
        }));
}

function Ch(e, b) {
    let filteredData = data.filter(
        x => x.eid == currentChapter && b.includes(x.b));
    if (data.length == 0) return;
    document.getElementById(e).innerHTML += "<h2>Chapter Ranking</h2>";
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
                    interval: 8,
                }),
                Plot.gridX({interval: 4}),
                Plot.axisY({anchor: "left", label: "Event Points"}),
                Plot.axisY({anchor: "right", label: "Event Points"}),
                Plot.ruleY([0]),
                Plot.ruleX([0], {
                    stroke: "#666",
                    strokeOpacity: 0.5,
                    strokeDasharray: "3 2",
                }),
                Plot.ruleX([4.5], {strokeOpacity: 0}),
                Plot.ruleX(
                    [timeToCurrentChapterEnd],
                    {
                        stroke: "blue",
                        strokeWidth: 1,
                    }),
                Plot.dot(
                    filteredData, Plot.selectLast({
                        filter: e => e.t == "r",
                        x: "tfe",
                        y: "ep",
                        fill: "b",
                        symbol: "circle",
                        strokeWidth: 0,
                        fillOpacity: 1,
                        r: 2,
                    })),
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
                    [[timeToCurrentChapterEnd, 0]],
                    {
                        text: ["Now: " + timeToCurrentChapterEnd.toFixed(1)],
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
                        x: e => -72,
                        y: e => 0,
                        z: null,
                        strokeWidth: 0,
                        stroke: "b",
                    }),
            ]
        }));
}
