exports.fill = function (source, dir, drill) {
    let ore = source.overlay();

    let defaultConfig = getDefaultConfig(dir);

    let tiles = [];
    let lastBridges = new Map();
    searchOreTiles(source, ore, tiles, lastBridges, dir);

    let maxValue1, maxValue2 = (dir == 0 || dir == 1) ? 0 : Number.MAX_SAFE_INTEGER;
    lastBridges.forEach((value, key) => {
        switch (dir) {
            case 0:
            case 1:
                if (value > maxValue2) {
                    maxValue2 = value;
                    maxValue1 = key;
                }
                break;
            case 2:
            case 3:
                if (value < maxValue2) {
                    maxValue2 = value;
                    maxValue1 = key;
                }
                break;
        }
    });

    tiles.forEach(tile => {
        if (isDrillTile(tile) && itemMineableAt(tile, drill) == ore.itemDrop) {
            let buildPlan = new BuildPlan(tile.centerX(), tile.centerY(), 0, drill);
            if (buildPlan.placeable(Vars.player.team())) Vars.player.unit().addBuild(buildPlan);
        }
        if (isBridgeTile(tile)) {
            let value1 = (dir == 1 || dir == 3) ? tile.centerX() : tile.centerY();
            let value2 = (dir == 1 || dir == 3) ? tile.centerY() : tile.centerX();

            let config = defaultConfig
            if (lastBridges.get(value1) == value2) {
                if (value1 == maxValue1) {
                    let buildPlan = new BuildPlan(tile.centerX() + defaultConfig.x, tile.centerY() + defaultConfig.y, 0, Blocks.itemBridge, defaultConfig);
                    Vars.player.unit().addBuild(buildPlan);
                } else if (value1 < maxValue1) {
                    config = new Point2(Math.abs(defaultConfig.y), Math.abs(defaultConfig.x));
                } else if (value1 > maxValue1) {
                    config = new Point2(-Math.abs(defaultConfig.y), -Math.abs(defaultConfig.x));
                }
            }

            let buildPlan = new BuildPlan(tile.centerX(), tile.centerY(), 0, Blocks.itemBridge, config);
            if (buildPlan.placeable(Vars.player.team())) Vars.player.unit().addBuild(buildPlan);
        }
    });
}

function searchOreTiles(tile, ore, tiles, lastBridges, dir) {
    if (tiles.indexOf(tile) >= 0 || tile == null || tile.build != null || !tile.passable()) return;

    tiles.push(tile);

    if (isBridgeTile(tile)) {
        let value1 = (dir == 1 || dir == 3) ? tile.centerX() : tile.centerY();
        let value2 = (dir == 1 || dir == 3) ? tile.centerY() : tile.centerX();

        if (lastBridges.has(value1)) {
            let currentValue = lastBridges.get(value1);

            switch (dir) {
                case 0:
                case 1:
                    if (value2 > currentValue) lastBridges.set(value1, value2);
                    break;
                case 2:
                case 3:
                    if (value2 < currentValue) lastBridges.set(value1, value2);
                    break;
            }
        } else {
            lastBridges.set(value1, value2);
        }
    }

    if (tile.overlay() == ore) {
        for (let i = -1; i <= 1; i++) {
            for (let j = -1; j <= 1; j++) {
                if (i != 0 || j != 0) searchOreTiles(tile.nearby(i, j), ore, tiles, lastBridges, dir);
            }
        }
    }
}

function isDrillTile(tile) {
    let x = tile.centerX();
    let y = tile.centerY();

    switch (x % 6) {
        case 0:
        case 2:
            if ((y - 1) % 6 == 0) return true;
            break;
        case 1:
            if ((y - 3) % 6 == 0 || (y - 3) % 6 == 2) return true;
            break;
        case 3:
        case 5:
            if ((y - 4) % 6 == 0) return true;
            break;
        case 4:
            if ((y) % 6 == 0 || (y) % 6 == 2) return true;
            break;
    }

    return false;
}

function isBridgeTile(tile) {
    let x = tile.centerX();
    let y = tile.centerY();

    if (x % 3 == 0 && y % 3 == 0) return true;
    return false;
}

function getDefaultConfig(dir) {
    switch(dir) {
        case 0:
            return new Point2(3, 0);
            break;
        case 1:
            return new Point2(0, 3);
            break;
        case 2:
            return new Point2(-3, 0);
            break;
        case 3:
            return new Point2(0, -3);
            break;
    }
}

function itemMineableAt(tile, drill) {
    let oreCount = new Map();
    let itemArray = new Array();

    for (let i = 0; i < drill.size; i++) {
        for (let j = 0; j < drill.size; j++) {
            let other = tile.nearby(i, j);

            if (other != null && !other.block().alwaysReplace) return false;

            if (drill.canMine(other)) {
                let drop = drill.getDrop(other);

                if (oreCount.has(drop.name)) {
                    oreCount.set(drop.name, {item: drop, count: oreCount.get(drop.name).count + 1});
                } else {
                    oreCount.set(drop.name, {item: drop, count: 1});
                }
            }
        }
    }

    oreCount.forEach((value, key) => {
        itemArray.push(value.item);
    });

    itemArray.sort((item1, item2) => {
        let type = (!item1.lowPriority == !item2.lowPriority) ? 0 : ((!item1.lowPriority == false && !item2.lowPriority == true) ? -1 : 1);
        if (type != 0) return type;
        let amounts = (oreCount.get(item1.name).count == oreCount.get(item2.name).count) ? 0 : ((oreCount.get(item1.name).count < oreCount.get(item2.name).count) ? -1 : 1);
        if (amounts != 0) return amounts;
        return (item1.id == item2.id) ? 0 : ((item1.id < item2.id) ? -1 : 1);
    });

    if (itemArray.size == 0) {
        return false;
    }

    return itemArray.length > 0 ? itemArray[itemArray.length - 1] : null;
}