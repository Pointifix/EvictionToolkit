exports.fill = function (source) {
    let ore = source.overlay();

    let tiles = [];
    searchOreTiles(source, ore, tiles);

    if (tiles.length > 180) {
        Vars.player.sendMessage("Too many tiles to search for");

        return;
    }

    let placeableTiles = tiles.filter(tile => {
        let buildPlan = new BuildPlan(tile.centerX() + 1, tile.centerY() + 1, 0, Blocks.blastDrill);
        return buildPlan.placeable(Vars.player.team());
    })

    let oreCounts = new Map();
    let enoughOreTiles = placeableTiles.filter(tile => {
        const count = itemMineableAtCount(tile, Blocks.blastDrill, ore);
        if (count >= 8) oreCounts.set(tile.centerX() + "" + tile.centerY(), count);

        return count >= 8;
    });

    let max = 0;
    let maxTile = enoughOreTiles[0];

    enoughOreTiles.forEach(tile => {
        let val = oreCounts.get(tile.centerX() + "" + tile.centerY());
        if (val > max) {
            maxTile = tile;
            max = val;
        }
    });

    let startX = maxTile.centerX();
    let startY = maxTile.centerY();

    let maxMaxRet = {tiles: [], count: 0};
    for (let x = startX; x < startX + 4; x++) {
        for (let y = startY; y < startY + 4; y++) {
            let start = Vars.world.tile(x,y);

            if (oreCounts.has(start.centerX() + "" + start.centerY())) {
                let maxRet = searchAirblastSpots(start, enoughOreTiles, oreCounts, 0, [], 0);

                if (maxRet.count > maxMaxRet.count) maxMaxRet = maxRet;
            }
        }
    }

    maxMaxRet.tiles.forEach(tile => {
        let buildPlan = new BuildPlan(tile.centerX() + 1, tile.centerY() + 1, 0, Blocks.blastDrill);
        Vars.player.unit().addBuild(buildPlan);
    });

    maxMaxRet.tiles.forEach(tile => {
        searchNearbyWaterSpots(Vars.world.tile(tile.centerX() + 1, tile.centerY() + 1), maxMaxRet.tiles);
    });
}

function searchOreTiles(tile, ore, tiles) {
    if (tiles.indexOf(tile) >= 0 || tile == null || tile.build != null || !tile.passable()) return;

    tiles.push(tile);

    if (tile.overlay() == ore) {
        for (let i = -2; i <= 2; i++) {
            for (let j = -2; j <= 2; j++) {
                if (i != 0 || j != 0) searchOreTiles(tile.nearby(i, j), ore, tiles);
            }
        }
    }
}

function itemMineableAtCount(tile, drill, ore) {
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

    if (itemArray.length == 0 || itemArray[itemArray.length - 1] != ore.itemDrop) {
        return 0;
    }

    let count = 0;
    oreCount.forEach((value, key) => {
        if (value.item == itemArray[itemArray.length - 1]) {
            count = value.count;
        }
    });
    return count;
}

function searchAirblastSpots(currentTile, tiles, oreCounts, currentSum, currentTiles, depth) {
    let newCurrentTiles = Array.from(currentTiles);
    newCurrentTiles.push(currentTile);
    currentSum += oreCounts.get(currentTile.centerX() + "" + currentTile.centerY()) - 8;

    let filteredTiles = tiles.filter(tile => {
        return Math.abs(currentTile.centerX() - tile.centerX()) >= 4 || Math.abs(currentTile.centerY() - tile.centerY()) >= 4;
    });

    if (filteredTiles.length == 0 || depth >= 5) {
        return {tiles: newCurrentTiles, count: currentSum};
    }

    let max = currentSum;
    let maxRet = {tiles: newCurrentTiles, count: currentSum};
    filteredTiles.forEach(tile => {
        let ret = searchAirblastSpots(tile, filteredTiles, oreCounts, currentSum, newCurrentTiles, depth++);
        if (ret.count > max) {
            max = ret.count;
            maxRet = ret;
        }
    });

    return maxRet;
}

function searchNearbyWaterSpots(tile, tiles) {
    let nearby = Edges.getEdges(Blocks.blastDrill.size);
    let var2 = nearby;
    let var3 = nearby.length;

    let waterPlaced = false;

    for (let var4 = 0; var4 < var3; ++var4) {
        let point = var2[var4];

        let adjacentTile = Vars.world.tile(tile.x + point.x, tile.y + point.y);

        let placeable = true;
        tiles.forEach(t => {
            let dx = adjacentTile.centerX() - t.centerX();
            let dy = adjacentTile.centerY() - t.centerY();

            if (dx >= 0 && dx < 4 && dy >= 0 && dy < 4) {
                placeable = false;
            }
        });

        if (placeable) {
            if (!waterPlaced) {
                let x = tile.x + point.x < tile.x - 1 ? adjacentTile.centerX() - 1 : adjacentTile.centerX();
                let y = tile.y + point.y < tile.y - 1 ? adjacentTile.centerY() - 1 : adjacentTile.centerY();

                let temp = Vars.world.tile(x, y);
                Fx.heal.at(temp.getX(), temp.getY(), 0);

                let buildPlan = new BuildPlan(x, y, 0, Blocks.waterExtractor);
                if (buildPlan.placeable(Vars.player.team())) {
                    let p = true;

                    tiles.forEach(t => {
                        let dx = x - t.centerX();
                        let dy = y - t.centerY();

                        if (dx >= -1 && dx < 4 && dy >= -1 && dy < 4) {
                            p = false;
                        }
                    });

                    if (p) {
                        Vars.player.unit().addBuild(buildPlan);
                        waterPlaced = true;
                        ++var4;
                    }
                }
            } else {
                let buildPlan = new BuildPlan(adjacentTile.centerX(), adjacentTile.centerY(), 0, Blocks.powerNode);
                if (buildPlan.placeable(Vars.player.team())) {
                    Vars.player.unit().addBuild(buildPlan);
                    break;
                }
            }
        }
    }
}