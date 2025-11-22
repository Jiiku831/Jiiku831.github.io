var __idCounter = 0;
const tokyoTz = "Asia/Tokyo";

function UpdateFilter(e) {
  cls = e.dataset.cls;
  document.querySelectorAll(`.event-list .${cls}`).forEach((elem) => {
    elem.style.display = e.checked ? null : "none";
  });
}

function NewId() {
  return `__id${__idCounter++}`;
}

function NewLink(title, target, cls) {
  const node = document.createElement("a");
  node.href = target;
  if (target.startsWith("http")) {
    node.target = "_blank";
  }
  node.innerText = title;
  node.classList.add(cls);
  return node;
}

function NewSpan(content, cls) {
  const node = document.createElement("span");
  node.innerText = content;
  node.classList.add(cls);
  return node;
}

function ToggleHover(e) {
  e.target.previousElementSibling.checked = !e.target.previousElementSibling.checked;
}

function NewSpanWithHover(content, hover, cls, checked = false) {
  const node = document.createElement("label");
  node.setAttribute("onclick", "ToggleHover(event)");
  node.innerText = content;
  node.classList.add(cls);
  node.classList.add("hover-trigger");
  node.title = "Click to pin/unpin details";

  const span = document.createElement("span");
  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.style.display = "none";
  checkbox.classList.add("hover-checkbox");
  checkbox.checked = checked;
  span.appendChild(checkbox);
  span.appendChild(node);
  span.appendChild(hover);
  span.classList.add("hover-container");
  hover.classList.add("hover");
  return span;
}

function FormatShortDate(d, tz) {
  return d.toLocaleDateString([], {
      timeZone: tz,
      hour12: false,
      month: "numeric",
      day: "numeric",
  });
}

function FormatShortDateDuration(s, e, tz) {
  let start = FormatShortDate(s, tz);
  let end = FormatShortDate(e, tz);
  if (start == end) {
    return start;
  }
  return `${start}~${end}`;
}

function FormatTime(label, d, cur) {
  const local = d.toLocaleString([], {
      timeZone: "Asia/Tokyo",
      hour12: false,
      hour: "2-digit",
      minute:"2-digit"
  });
  return NewSpan(`${label} ${local}`, cur > d ? "ts-over" : "ts");
}

function FormatLongLocalTime(d, opts) {
  options = {
    hour12: false,
    hour: "2-digit",
    minute:"2-digit"
  };
  if (opts.timeZone) {
    options.timeZone = opts.timeZone;
  }
  if (opts.formatTz) {
    options.timeZoneName = opts.formatTz;
  }
  if (!opts.hideDate) {
    options.day = "numeric";
    options.month = "numeric";
    if (opts.includeYear) {
      options.year = "numeric";
    }
  }
  return d.toLocaleString([], options);
}

function FormatDuration(dur, neg) {
  let suffix = neg ? " ago" : "";
  let minutes = dur / 60000;
  let norm = neg ? Math.floor : Math.ceil;
  if (minutes <= 120) {
    return `${norm(minutes)} mins${suffix}`;
  }
  let hours = minutes / 60;
  if (hours <= 48) {
    return `${norm(hours)} hours${suffix}`;
  }
  let days = hours / 24;
  if (days <= 14) {
    return `${norm(days)} days${suffix}`;
  }
  let weeks = days / 7;
  if (weeks <= 5) {
    return `${norm(weeks)} weeks${suffix}`;
  }
  let months = days / 30;
  if (months <= 18) {
    return `${norm(months)} months${suffix}`;
  }
  let years = days / 365;
  return `${norm(years)} years${suffix}`;
}

function DurationCls(dur, neg) {
  if (neg) return "";
  let days = dur / 24 / 3600 / 1000;
  if (days <= 1) {
    return "duration-crit";
  }
  if (days <= 3) {
    return "duration-close";
  }
  return "";
}

function FormatTimer(label, d, cur, opts, cls, formatOpts) {
  const span = document.createElement("span");
  span.classList.add(cls);
  if (!opts.hideDuration) {
    const neg = cur > d;
    const dur = neg ? cur - d : d - cur;
    const durationNode =
      NewSpan(`${label} ${FormatDuration(dur, neg)}`, "lotto-timer-duration");
    const durationCls = DurationCls(dur, neg);
    if (durationCls) {
      durationNode.classList.add(durationCls);
    }
    span.appendChild(durationNode);
  }

  const prefix = opts.hideDuration ? label : " at";
  const jst = FormatLongLocalTime(d, {
    ...formatOpts,
    formatTz: (opts.includeLocal  || opts.timeZone != tokyoTz) ? "short" : "",
    timeZone: opts.timeZone,
  });
  if (opts.includeLocal) {
    const local = FormatLongLocalTime(d, {
      ...formatOpts,
      formatTz: opts.includeLocal ? "short" : ""
    });
    span.appendChild(document.createTextNode(`${prefix} ${jst} (${local})`));
  } else {
    span.appendChild(document.createTextNode(`${prefix} ${jst}`));
  }
  return span;
}

function MakeHeaderCell(content) {
  const cell = document.createElement("th");
  cell.appendChild(document.createTextNode(content));
  return cell;
}

function MakeCell(content) {
  const cell = document.createElement("td");
  cell.appendChild(document.createTextNode(content));
  return cell;
}

function FormatEventTitle(name, link, loc, locLink) {
  const node = document.createElement("span");
  node.classList.add("event-title");
  node.appendChild(
    link ? NewLink(name, link, "event-name") : NewSpan(name, "event-name"));
  if (loc) {
    node.appendChild(
      locLink ? NewLink(loc, locLink, "event-loc") : NewSpan(loc, "event-loc"));
  }
  return node;
}

function MakeTimeTable(times) {
  let node = document.createElement("div");
  node.classList.add("time-table");
  let table = document.createElement("table");
  node.appendChild(table);
  let added = false;
  let header = document.createElement("tr");
  table.appendChild(header);
  header.appendChild(MakeHeaderCell(""));
  header.appendChild(MakeHeaderCell("Event Time"));
  header.appendChild(MakeHeaderCell("Local Time"));
  Array.from(times).forEach((t) => {
    if (t[1]) {
      added = true;
      const d = new Date(t[1]);
      let row = document.createElement("tr");
      table.appendChild(row);
      row.appendChild(MakeHeaderCell(t[0]));
      row.appendChild(MakeCell(FormatLongLocalTime(d, {
        formatTz: "long",
        includeYear: true,
        timeZone: t[2],
      })));
      row.appendChild(MakeCell(FormatLongLocalTime(d, {
        formatTz: "long",
        includeYear: true,
      })));
    }
  });
  if (!added) {
    node.style.visibility = "hidden";
  }
  return node;
}

function UpdateEventTimers() {
  const cur = new Date();
  document.querySelectorAll("[data-event-name]").forEach((e) => {
    let checked = e.querySelectorAll(":scope .event-node :checked").length > 0;
    e.querySelectorAll(":scope .event-node").forEach((child) => {
      e.removeChild(child);
    });
    const eventNode = NewSpan("", "event-node");
    e.insertBefore(eventNode, e.firstChild);
    eventNode.appendChild(
      FormatEventTitle(
        e.dataset.eventName, e.dataset.eventLink, e.dataset.eventLoc, e.dataset.eventLocLink));
    let eventDetails = NewSpan("", "event-details");
    eventNode.appendChild(eventDetails);

    let over = true;
    let ongoing = false;
    let eventDates = "TBA";
    if (e.dataset.eventTba) {
      over = false;
      eventDetails.appendChild(NewSpan(e.dataset.eventTba, "event-timer"));
    } else {
      const start = new Date(e.dataset.eventStart);
      const end = new Date(e.dataset.eventEnded);
      let d = end;
      let text = "Ended";
      if (start > cur) {
        text = "Starts in";
        d = start;
        over = false;
      } else if (end > cur) {
        text = "Ends in"
        d = end;
        over = false;
        ongoing = true;
      }
      eventDetails.appendChild(FormatTimer(text, d, cur, {
        includeLocal: false,
        timeZone: e.dataset.timeZone ?? tokyoTz,
      }, "event-timer"));
      eventDates = FormatShortDateDuration(start, end, e.dataset.timeZone ?? tokyoTz);
    }

    if (e.dataset.eventNotes) {
      eventDetails.appendChild(NewSpan(e.dataset.eventNotes, "event-notes"));
    }

    eventNode.insertBefore(
        NewSpanWithHover(
          eventDates,
          MakeTimeTable([
            ["Start", e.dataset.eventStart, e.dataset.timeZone ?? tokyoTz],
            ["End", e.dataset.eventEnded, e.dataset.timeZone ?? tokyoTz],
          ]),
          ongoing ? "ongoing-event-dates" : (over ? "past-event-dates" : "event-dates"),
          checked),
      eventNode.firstChild);
    if (over) {
      e.classList.add("event-over");
    }
  });
}

function UpdateSubeventTimers() {
  const cur = new Date();
  document.querySelectorAll("[data-subevent-name]").forEach((e) => {
    let checked = e.querySelectorAll(":scope :checked").length > 0;
    while (e.firstChild) {
      e.removeChild(e.firstChild);
    }
    let over = true;
    let ongoing = false;
    let subeventTimes = [];

    if (e.dataset.subeventDoors) {
      const doors = new Date(e.dataset.subeventDoors);
      if (doors > cur) {
        over = false;
      }
      subeventTimes.push({label: "Doors", durLabel: "Doors in", ts: doors});
    }

    const start = new Date(e.dataset.subeventStart);
    if (start > cur) {
      over = false;
    }
    subeventTimes.push({label: "Start", durLabel: "Starts in", ts: start});
    let eventDates = FormatShortDate(start, e.dataset.timeZone ?? tokyoTz);

    if (e.dataset.subeventClose) {
      const close = new Date(e.dataset.subeventClose);
      if (close > cur) {
        over = false;
        if (start <= cur) {
          ongoing = true;
        }
      }
      subeventTimes.push({label: "Last Entry", durLabel: "Last Entry in", ts: close});
      eventDates = FormatShortDateDuration(start, close, e.dataset.timeZone ?? tokyoTz);
    }

    if (e.dataset.subeventEnded) {
      const end = new Date(e.dataset.subeventEnded);
      if (end > cur) {
        over = false;
        if (start <= cur) {
          ongoing = true;
        }
      }
      subeventTimes.push({label: "End", durLabel: "Ends in", ts: end});
      eventDates = FormatShortDateDuration(start, end, e.dataset.timeZone ?? tokyoTz);
    }

    e.appendChild(
        NewSpanWithHover(eventDates,
          MakeTimeTable([
            ["Doors", e.dataset.subeventDoors, e.dataset.timeZone ?? tokyoTz],
            ["Start", e.dataset.subeventStart, e.dataset.timeZone ?? tokyoTz],
            ["Last Entry", e.dataset.subeventClose, e.dataset.timeZone ?? tokyoTz],
            ["End", e.dataset.subeventEnded, e.dataset.timeZone ?? tokyoTz],
          ]),
          ongoing ? "ongoing-subevent-dates" : (over ? "past-subevent-dates" : "subevent-dates"),
          checked));
    e.appendChild(
      FormatEventTitle(
        e.dataset.subeventName, e.dataset.subeventLink, e.dataset.subeventLoc,
        e.dataset.subeventLocLink));
    for (let i = 0; i < subeventTimes.length; ++i) {
      const includeDur = subeventTimes[i].ts > cur && (i == 0 || subeventTimes[i-1].ts <= cur);
      let options = {
          includeLocal: false,
          hideDuration: !includeDur,
          timeZone: e.dataset.timeZone ?? tokyoTz,
      };
      let fmtOptions = {
        hideDate: true,
      };
      let timer = FormatTimer(
          includeDur ? subeventTimes[i].durLabel : subeventTimes[i].label,
          subeventTimes[i].ts,
          cur,
          options,
          "subevent-timer",
          fmtOptions)
      if (subeventTimes[i].ts < cur) {
        timer.classList.add("subevent-over");
      }
      e.appendChild(timer);
      if (i < subeventTimes.length - 1) {
        e.appendChild(document.createTextNode("/"));
      }
    }
    if (over) {
      e.classList.add("subevent-over");
    }
  });
}

function GenUniqueIds() {
  document.querySelectorAll("li").forEach((e) => {
    e.id = NewId();
  });
}

function UpdateLottoTimers() {
  const cur = new Date();
  document.querySelectorAll("[data-lotto-name]").forEach((e) => {
    let checked = e.querySelectorAll(":scope :checked").length > 0;
    while (e.firstChild) {
      e.removeChild(e.firstChild);
    }
    const start = new Date(e.dataset.lottoStart);
    const end = new Date(e.dataset.lottoEnded);
    let state = "lotto-ended";
    let stateText = "Ended";
    let d = end;
    let text = "Ended";
    let over = true;
    if (start > cur) {
      text = "Starts in"
      state = "lotto-upcoming";
      stateText = "Upcoming";
      d = start;
      over = false;
    } else if (end > cur) {
      text = "Ends in"
      state = "lotto-open";
      stateText = "Open";
      d = end;
      over = false;
    }

    if (e.dataset.lottoSold && end > cur) {
      state = "lotto-ended";
      stateText = "Sold Out";
      over = true;
    }

    if (e.dataset.lottoResul) {
      const res = new Date(e.dataset.lottoResul);
      if (res > cur && cur > end) {
        text = "Results in"
        state = "lotto-closed";
        stateText = "Closed";
        d = res;
        over = false;
      } else if (res <= cur) {
        text = "Results";
        state = "lotto-ended";
        stateText = "Ended";
        d = res;
        over = true;
      }
    }

    if (e.dataset.lottoMoney) {
      const pay = new Date(e.dataset.lottoMoney);
      const res = e.dataset.lottoResul ? new Date(e.dataset.lottoResul) : end;
      if (pay > cur && cur >= res) {
        text = "Payment deadline in"
        state = "lotto-payment";
        stateText = "Payment";
        d = pay;
        over = false;
      }
    }

    e.appendChild(
      NewSpanWithHover(
          stateText,
          MakeTimeTable([
            ["Start", e.dataset.lottoStart, e.dataset.timeZone ?? tokyoTz],
            ["Close", e.dataset.lottoEnded, e.dataset.timeZone ?? tokyoTz],
            ["Results", e.dataset.lottoResul, e.dataset.timeZone ?? tokyoTz],
            ["Payment", e.dataset.lottoMoney, e.dataset.timeZone ?? tokyoTz],
          ]), state, checked));
    e.appendChild(
      !over && e.dataset.lottoLink
        ? NewLink(e.dataset.lottoName, e.dataset.lottoLink, "lotto-name")
        : NewSpan(e.dataset.lottoName, "lotto-name"));
    e.appendChild(FormatTimer(text, d, cur, {
      includeLocal: true,
      timeZone: e.dataset.timeZone ?? tokyoTz,
    }, "lotto-timer"));
    if (over) {
      e.classList.add("lotto-over");
    }
  });
}

function UpdateOngoingLottos() {
  const ongoing = document.getElementById("ongoing-tickets");
  const toggled = [];
  while (ongoing.firstChild) {
    if (ongoing.firstChild.querySelectorAll &&
      ongoing.firstChild.querySelectorAll(":scope :checked").length > 0) {
      toggled.push(ongoing.firstChild.id);
    }
    ongoing.removeChild(ongoing.firstChild);
  }
  document.querySelectorAll("#ticket-info-container h2").forEach((event) => {
    const eventName = event.innerText;
    const eventCls = event.classList;
    const eventTitle = document.createElement("li");
    eventTitle.classList.add(...eventCls);
    eventTitle.appendChild(NewLink(eventName, `#${event.id}`, "event-name"));
    lottoNodes =
      event.nextElementSibling.querySelectorAll(":scope .ticket-info li:not(.lotto-over)");
    goodsNodes =
      event.nextElementSibling.querySelectorAll(":scope .goods-info li:not(.lotto-over)");
    if (lottoNodes.length + goodsNodes.length > 0) {
      ongoing.appendChild(eventTitle);
    }
    lottoNodes.forEach((lotto) => {
      const newNode = lotto.cloneNode(true);
      newNode.id = `${lotto.id}-copy`;
      newNode.classList.add("ongoing-lotto-chip");
      newNode.querySelectorAll("input[type='checkbox']").forEach((e) => {
        e.checked = toggled.includes(newNode.id);
      });
      ongoing.appendChild(newNode);
    });
    goodsNodes.forEach((goods) => {
      const newNode = goods.cloneNode(true);
      newNode.id = `${goods.id}-copy`;
      newNode.classList.add("ongoing-goods-chip");
      newNode.querySelectorAll("input[type='checkbox']").checked =
        toggled.includes(newNode.id);
      ongoing.appendChild(newNode);
    });
  });
}

function RefreshTimers () {
  UpdateEventTimers();
  UpdateSubeventTimers();
  UpdateLottoTimers();
  UpdateOngoingLottos();
}

function GetStartMonth(e) {
  if (e.dataset.eventTbaEst) {
    return new Date(e.dataset.eventTbaEst);
  }
  return new Date(e.dataset.eventStart);
}

function AddMonthBorders() {
  document.querySelectorAll(".event-list").forEach((list) => {
    const allEvents = list.querySelectorAll(":scope > ul > li");
    for (let i = 0; i < allEvents.length; ++i) {
      const prevMonth = i == 0 ? "" : GetStartMonth(allEvents[i-1]).toLocaleDateString(
        [], { timeZone: allEvents[i-1].dataset.timeZone ?? "Asia/Tokyo", month: "short"});
      const curMonth = GetStartMonth(allEvents[i]).toLocaleDateString(
        [], { timeZone: allEvents[i].dataset.timeZone ?? "Asia/Tokyo", month: "short"});
      if (prevMonth != curMonth) {
        allEvents[i].classList.add("month-change");
        allEvents[i].insertBefore(NewSpan(curMonth, "month-change-label"),
            allEvents[i].firstChild);
      }
    }
  });
}
