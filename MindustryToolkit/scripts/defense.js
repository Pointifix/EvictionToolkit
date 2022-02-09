exports.place = function (name, x, y, coresUnloaders, tile, replace) {
    let schematic = Vars.schematics.all().find((s) => {
        return s.name() == name;
    });
    let buildPlans = Vars.schematics.toRequests(schematic, x, y);

    if (replace) {
        coresUnloaders.set(tile, { phase: [], surge: [], recentlyAdded: 0 });
    }

    buildPlans.forEach(buildPlan => {
        if (replace) {
            if (buildPlan.block == Blocks.unloader && buildPlan.config == "Phase Fabric") {
                coresUnloaders.get(tile).phase.push(buildPlan.tile());
                coresUnloaders.get(tile).recentlyAdded = coresUnloaders.get(tile).recentlyAdded + 1;
            }
            if (buildPlan.block == Blocks.unloader && buildPlan.config == "Surge Alloy") {
                coresUnloaders.get(tile).surge.push(buildPlan.tile());
            }
        }

        Vars.player.unit().addBuild(buildPlan);
    });
}