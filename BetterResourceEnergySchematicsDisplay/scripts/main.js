// core items
const itemUnicodes = [
    "\uF838",
    "\uF837",
    "\uF835",
    "\uF82F",
    "\uF836",
    "\uF832",
    "\uF831",
    "\uF82E",
    "\uF82D",
    "\uF82C"
];
const items = [
    Items.copper,
    Items.lead,
    Items.graphite,
    Items.silicon,
    Items.metaglass,
    Items.titanium,
    Items.thorium,
    Items.plastanium,
    Items.phaseFabric,
    Items.surgeAlloy
];

let itemMeans = new Array(itemUnicodes.length);
let lastValues = new Array(itemUnicodes.length);

let table;
let labels = [];

// power
let stored = 0;
let battery = 0.01;
let powerBalance = 0;

let bar;

// schematics

Events.on(ClientLoadEvent, event => {
    Vars.renderer.minZoom = Vars.renderer.minZoom / 3;

    // core items
    for (let i = 0; i < items.length; i++) {
        itemMeans[i] = new WindowedMean(100 * 60);
        itemMeans[i].fill(0.0);
        lastValues[i] = 0;
    }

    table = new Table(Styles.black3);
    table.setPosition(10, 674);
    let nestedTable = table.table().margin(3).get();
    table.align(Align.topLeft);

    for (let i = 0; i < items.length; i++) {
        labels.push(nestedTable.labelWrap("").width(180).pad(1).get());
        nestedTable.row();
    }
    table.pack();
    Vars.ui.hudGroup.addChild(table);

    // power
    bar = new Bar("Power: ", Pal.accent, floatp(()=>{ return getBatteryBalance(); }));
    bar.set(prov(() => {
        return "Power: " + (powerBalance > 0 ? "[#00ff00]+" : "[#ff0000]") + formatNumber(powerBalance * 60.0, true);
    }), floatp(() => {
        return getBatteryBalance();
    }), Pal.accent);
    bar.setPosition(860, 1040);
    bar.setWidth(250);
    bar.setHeight(30);
    Vars.ui.hudGroup.addChild(bar);

    // search
    let buttons = new Table(Styles.black3);
    buttons.align(Align.topLeft);
    buttons.setPosition(1620, 480);
    let nestedButtons = buttons.table().margin(3).get();

    let setSearchFieldText = (text) => {
        Vars.ui.schematics.show();
        Vars.ui.schematics.cont.getChildren().items.forEach((item) => {
            if (item instanceof Group) {
                item.getChildren().items.forEach((child) => {
                    if (child instanceof TextField) {
                        child.setText(text);
                        child.change();
                    }
                });
            }
        });
    }

    nestedButtons.labelWrap("Production").pad(2).row();

    nestedButtons.button(itemUnicodes[items.indexOf(Items.graphite)], Styles.defaultt, () => {
        setSearchFieldText("Graphite");
    }).height(35).width(35).pad(1);

    nestedButtons.button(itemUnicodes[items.indexOf(Items.silicon)], Styles.defaultt, () => {
        setSearchFieldText("Silicon");
    }).height(35).width(35).pad(1);

    nestedButtons.button(itemUnicodes[items.indexOf(Items.metaglass)], Styles.defaultt, () => {
        setSearchFieldText("Metaglass");
    }).height(35).width(35).pad(1);

    nestedButtons.button(itemUnicodes[items.indexOf(Items.plastanium)], Styles.defaultt, () => {
        setSearchFieldText("Plastanium");
    }).height(35).width(35).pad(1);

    nestedButtons.button(itemUnicodes[items.indexOf(Items.phaseFabric)], Styles.defaultt, () => {
        setSearchFieldText("Phase Fabric");
    }).height(35).width(35).pad(1);

    nestedButtons.button(itemUnicodes[items.indexOf(Items.surgeAlloy)], Styles.defaultt, () => {
        setSearchFieldText("Surge Alloy");
    }).height(35).width(35).pad(1);

    nestedButtons.row().labelWrap("Power").pad(2).row();

    nestedButtons.button("\uF877", Styles.defaultt, () => {
        setSearchFieldText("Steam");
    }).height(35).width(35).pad(1);

    nestedButtons.button("\uF876", Styles.defaultt, () => {
        setSearchFieldText("Differential");
    }).height(35).width(35).pad(1);

    nestedButtons.button("\uF872", Styles.defaultt, () => {
        setSearchFieldText("Thorium Reactor");
    }).height(35).width(35).pad(1);

    nestedButtons.button("\uF871", Styles.defaultt, () => {
        setSearchFieldText("Impact");
    }).height(35).width(35).pad(1);

    nestedButtons.row().labelWrap("Defense").pad(2).row();

    nestedButtons.button("\uF85B", Styles.defaultt, () => {
        setSearchFieldText("Arc");
    }).height(35).width(35).pad(1);

    nestedButtons.button("\uF85C", Styles.defaultt, () => {
        setSearchFieldText("Lancer");
    }).height(35).width(35).pad(1);

    nestedButtons.button("\uF856", Styles.defaultt, () => {
        setSearchFieldText("Cyclone");
    }).height(35).width(35).pad(1);

    nestedButtons.button("\uF860", Styles.defaultt, () => {
        setSearchFieldText("Standalone");
    }).height(35).width(35).pad(1);

    nestedButtons.button("\uF854", Styles.defaultt, () => {
        setSearchFieldText("Monster");
    }).height(35).width(35).pad(1);

    nestedButtons.row().labelWrap("Units").pad(2).row();

    nestedButtons.button("\uF7F6", Styles.defaultt, () => {
        setSearchFieldText("Flare");
    }).height(35).width(35).pad(1);

    nestedButtons.button("\uF800", Styles.defaultt, () => {
        setSearchFieldText("Dagger");
    }).height(35).width(35).pad(1);

    nestedButtons.button("\uF7FA", Styles.defaultt, () => {
        setSearchFieldText("Crawler");
    }).height(35).width(35).pad(1);

    nestedButtons.button("\uF7F5", Styles.defaultt, () => {
        setSearchFieldText("Horizon");
    }).height(35).width(35).pad(1);

    nestedButtons.button("\uF7FF", Styles.defaultt, () => {
        setSearchFieldText("Mace");
    }).height(35).width(35).pad(1);

    nestedButtons.button("\uF7F0", Styles.defaultt, () => {
        setSearchFieldText("Poly");
    }).height(35).width(35).pad(1);

    nestedButtons.row();

    nestedButtons.button("\uF7F4", Styles.defaultt, () => {
        setSearchFieldText("Zenith");
    }).height(35).width(35).pad(1);

    nestedButtons.button("\uF7FB", Styles.defaultt, () => {
        setSearchFieldText("Quasar");
    }).height(35).width(35).pad(1);

    nestedButtons.button("\uF7FE", Styles.defaultt, () => {
        setSearchFieldText("Fortress");
    }).height(35).width(35).pad(1);

    nestedButtons.button("\uF7C1", Styles.defaultt, () => {
        setSearchFieldText("Vela");
    }).height(35).width(35).pad(1);

    nestedButtons.button("\uF7C0", Styles.defaultt, () => {
        setSearchFieldText("Corvus");
    }).height(35).width(35).pad(1);

    buttons.pack();

    Vars.ui.hudGroup.addChild(buttons);
});

Events.run(Trigger.update, () => {
    // core items
    let currentItems = Vars.player.team().items();

    let latestMin = Number.POSITIVE_INFINITY;
    let latestMax = 0;
    let meanMin = Number.POSITIVE_INFINITY;
    let meanMax = 0;

    let reset = true;
    for (let i = 0; i < items.length; i++) {
        if (lastValues[i] > 0) reset = false;

        if (lastValues[i] < latestMin) latestMin = lastValues[i];
        if (lastValues[i] > latestMax) latestMax = lastValues[i];
        if (itemMeans[i].rawMean() < meanMin) meanMin = itemMeans[i].rawMean();
        if (itemMeans[i].rawMean() > meanMax) meanMax = itemMeans[i].rawMean();
    }

    for (let i = 0; i < items.length; i++) {
        let currentValue = currentItems.get(items[i]);

        if (reset) lastValues[i] = currentValue;

        let text = getItemText(i, lastValues[i], latestMin, latestMax, itemMeans[i].rawMean(), meanMin, meanMax);

        labels[i].setText(text);

        itemMeans[i].add(currentValue * 60.0 - lastValues[i] * 60.0);
        lastValues[i] = currentValue;
    }

    // power
    stored = 0;
    battery = 0.01;
    powerBalance = 0;

    let graphs = [];
    let search = (it) => {
        while (it.hasNext()) {
            let tile = it.next();

            if (tile.build && tile.build.power) {
                let graph = tile.build.power.graph;

                if (graphs.indexOf(graph) < 0) {
                    stored += graph.getBatteryStored();
                    battery += graph.getTotalBatteryCapacity();
                    powerBalance += graph.getPowerBalance();

                    graphs.push(graph);
                }
            }
        }
    };
    search(Vars.indexer.getAllied(Vars.player.team(), BlockFlag.generator).iterator());
    search(Vars.indexer.getAllied(Vars.player.team(), BlockFlag.battery).iterator());
});

Events.on(ResetEvent, event => {
    for (let i = 0; i < items.length; i++) {
        itemMeans[i].fill(0.0);
    }
});

function getItemText(index, latest, latestMin, latestMax, mean, meanMin, meanMax) {
    let halfLatest = (latestMax - latestMin) / 2 + latestMin;

    let closer = ((mean === 0) ? "[#aaaaaa]" : "[]");

    let latestString = closer + (latest > 0 ? (latest >= halfLatest ? getNormalizedColor(125, 100, latest, halfLatest, latestMax, true) : getNormalizedColor(0, 100, latest, latestMin, halfLatest, false)) : "") +
        formatNumber(latest, true) + closer;

    let meanString = "(" + ((mean === 0) ? closer : (mean > 0 ? getNormalizedColor(125, 100, mean, 0, meanMax, true) + "+" : getNormalizedColor(0, 100, mean, meanMin, 0, false))) +
        formatNumber(mean, false) + closer + ")";

    return itemUnicodes[index] + " " + latestString + " " + meanString;
}

function getNormalizedColor(h, s, value, min, max, reverse) {
    let norm = Math.round(((value - min) / (max - min)) * 10) / 10;

    if (isNaN(norm)) return "";
    return "[" + HSLToHex(h, s, (reverse ? (1 - norm) : norm) * 50 + 50) + "]";
}

function HSLToHex(h, s, l) {
    s /= 100;
    l /= 100;

    let c = (1 - Math.abs(2 * l - 1)) * s,
        x = c * (1 - Math.abs((h / 60) % 2 - 1)),
        m = l - c / 2,
        r = 0,
        g = 0,
        b = 0;

    if (0 <= h && h < 60) {
        r = c;
        g = x;
        b = 0;
    } else if (60 <= h && h < 120) {
        r = x;
        g = c;
        b = 0;
    } else if (120 <= h && h < 180) {
        r = 0;
        g = c;
        b = x;
    } else if (180 <= h && h < 240) {
        r = 0;
        g = x;
        b = c;
    } else if (240 <= h && h < 300) {
        r = x;
        g = 0;
        b = c;
    } else if (300 <= h && h < 360) {
        r = c;
        g = 0;
        b = x;
    }
    // Having obtained RGB, convert channels to hex
    r = Math.round((r + m) * 255).toString(16);
    g = Math.round((g + m) * 255).toString(16);
    b = Math.round((b + m) * 255).toString(16);

    // Prepend 0s, if necessary
    if (r.length == 1)
        r = "0" + r;
    if (g.length == 1)
        g = "0" + g;
    if (b.length == 1)
        b = "0" + b;

    return "#" + r + g + b;
}

function formatNumber(number, round) {
    let abs = Math.abs(number);
    if (abs >= 10000) {
        return Math.round(number / 1000) + "k";
    } else if (abs >= 1000) {
        return Math.round(number / 100) / 10 + "k";
    } else {
        return round ? Math.round(number) : Math.round(number * 10) / 10;
    }
}

function getBatteryBalance() {
    return stored / battery;
}