exports.search = function (source) {
    let closestCore = Vars.state.teams.closestCore(source.getX(), source.getY(), Vars.player.team());

    let tiles = [];
    searchAdjacentTiles(closestCore, tiles, true);

    tiles.sort((a, b) => {
        let distanceA = Math.abs(a.centerX() - source.centerX()) + Math.abs(a.centerY() - source.centerY());
        let distanceB = Math.abs(b.centerX() - source.centerX()) + Math.abs(b.centerY() - source.centerY());

        return distanceA - distanceB;
    });

    return tiles[0];
}

function searchAdjacentTiles(building, tiles, recursive) {
    let nearby = Edges.getEdges(building.block.size);
    let var2 = nearby;
    let var3 = nearby.length;
    let buildings = new Set();

    for(let var4 = 0; var4 < var3; ++var4) {
        let point = var2[var4];

        let tile = Vars.world.tile(building.tile.x + point.x, building.tile.y + point.y);

        if (tile.build == null) {
            tiles.push(tile);
        } else if (recursive && (tile.build.block == Blocks.container || tile.build.block == Blocks.vault)) {
            buildings.add(tile.build);
        }
    }

    buildings.forEach(build => {
        searchAdjacentTiles(build, tiles, false);
    });
}