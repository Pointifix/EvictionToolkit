exports.place = function(tiles, conveyor) {
    let rotation = 0;
    for (let i = 0; i < tiles.length - 1; i++) {
        let current = tiles[i];
        let next = tiles[i + 1];

        rotation = current.relativeTo(next);
        let block = isAutotiler(current.block()) ? getJunctionReplacement(conveyor) : conveyor;
        let buildPlan = new BuildPlan();
        buildPlan.set(current.centerX(), current.centerY(), rotation, block);

        Vars.player.unit().addBuild(buildPlan);
    }

    let last = tiles[tiles.length - 1];

    if (conveyor != Blocks.plastaniumConveyor) {
        for (let i = 0; i < 4; i++) {
            let neighbour = last.nearby(i);

            if (neighbour.build != null && (neighbour.build instanceof CoreBlock.CoreBuild || neighbour.build.block == Blocks.vault || neighbour.build.block == Blocks.container)) {
                rotation = last.relativeTo(neighbour);
            }
        }
    }

    let block = isAutotiler(last.block()) ? getJunctionReplacement(conveyor) : conveyor;
    let buildPlan = new BuildPlan();
    buildPlan.set(last.centerX(), last.centerY(), rotation, block);

    Vars.player.unit().addBuild(buildPlan);
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