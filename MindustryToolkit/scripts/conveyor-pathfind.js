exports.pathfind = function (source, target, conveyor) {
    let rotations = new Map();
    let distanceSourceTarget = Math.abs(source.centerX() - target.centerX()) + Math.abs(source.centerY() - target.centerY());

    let tilesSeq = Astar.pathfind(source, target, {
        cost: function (from, tile) {
            let rotationFrom = rotations.get(from.pos());
            let rotationTo = tile.relativeTo(from);
            rotations.set(tile.pos(), rotationTo);

            let cost = 1;
            if (isAutotiler(tile.block())) {
                cost += 1;
                if (isAutotiler(from.block())) cost += 5;
            }
            if (rotationFrom != rotationTo) cost += 1;

            return cost;
        }
    }, (tile) => {
        let distance = Math.abs(tile.centerX() - source.centerX()) + Math.abs(tile.centerY() - source.centerY());
        if (distance > Math.max(distanceSourceTarget * 2, 50)) return false;

        if (tile != source && tile != target) {
            for (let i = 0; i < 4; i++) {
                let neighbour = tile.nearby(i);

                if (neighbour != null &&
                    avoidBlock(neighbour.block()) &&
                    neighbour != source &&
                    neighbour != target
                ) return false;
            }
        }

        if (conveyor == Blocks.plastaniumConveyor) {
            if (tile.block().group == BlockGroup.transportation) return false;
        } else {
            if (tile.block() == Blocks.plastaniumConveyor) return false;
            if (tile.block().group == BlockGroup.transportation && !isAutotiler(tile.block())) return false;
        }

        return tile.passable() && (new BuildPlan(tile.centerX(), tile.centerY(), 0, conveyor)).placeable(Vars.player.team());
    });

    let tiles = tilesSeq.removeAll((tile) => {
        return tile == null;
    }).toArray();

    if (tiles.length > 0) {
        let tmp = [];
        tmp.push(source);
        for (let i = 0; i < tiles.length; i++) {
            tmp.push(tiles[i]);
        }
        return tmp;
    }
    return null;
}

function isAutotiler(block) {
    return block == Blocks.conveyor ||
        block == Blocks.titaniumConveyor ||
        block == Blocks.armoredConveyor ||
        block == Blocks.plastaniumConveyor ||
        block == Blocks.conduit ||
        block == Blocks.pulseConduit ||
        block == Blocks.platedConduit;
}

function getJunctionReplacement(block) {
    if (block == Blocks.conveyor ||
        block == Blocks.titaniumConveyor ||
        block == Blocks.armoredConveyor) return Blocks.junction;

    if (block == Blocks.conduit ||
        block == Blocks.pulseConduit ||
        block == Blocks.platedConduit) return Blocks.liquidJunction;

    return block;
}

function avoidBlock(block) {
    return block.group == BlockGroup.drills ||
        block instanceof GenericCrafter ||
        block == Blocks.unloader;
}