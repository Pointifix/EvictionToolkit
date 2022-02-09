let closestCoreTileSearch = require("mindustry-toolkit/closest-core-tile-search");
let conveyorPathfind = require("mindustry-toolkit/conveyor-pathfind");
let conveyorPlacer = require("mindustry-toolkit/conveyor-placer");
let resourceFiller = require("mindustry-toolkit/resource-filler");
let resourceFillerAirblast = require("mindustry-toolkit/resource-filler-airblast");
let defensePlacer = require("mindustry-toolkit/defense");
let schematicsCreate = require("mindustry-toolkit/schematics");

let icon_conveyor_core;
let icon_titanium_conveyor_core;
let icon_plastanium_conveyor_core;
let icon_mechanical_drill_fill;
let icon_pneumatic_drill_fill;
let icon_airblast_drill_fill;
let icon_enabled;
let icon_cyclone_copper;
let icon_cyclone_titanium;
let icon_cyclone_thorium;
let icon_cyclone_plastanium;
let icon_cyclone_phase;
let icon_cyclone_surge;
let icon_unloader;
let icon_dagger;
let icon_copper_wall_large;
let icon_thorium_wall_large;
let icon_phase_wall_large;
let icon_surge_wall_large;
let icon_tsunami;
let icon_forcefield;

let table;
let enabled = false, enabledTable;

let unloaderEnabled = false, unloaderTable;

let configureQueue = [];

let coresUnloaders = new Map();

Events.on(WorldLoadEvent, event => {
    coresUnloaders = new Map();
    unloaderTiles = new Map();
    resetUnloaders = new Map();
});

let lastAmmunitionItem = Items.surgeAlloy;
let lastAmmunitionChanged = false;

let unloaderTiles = new Map();
let resetUnloaders = new Map();

let attackModeTriggered = false;
let unitControlEnabled = false;

Events.on(ClientLoadEvent, event => {
    icon_conveyor_core = Core.atlas.find("mindustry-toolkit-conveyor-core");
    icon_titanium_conveyor_core = Core.atlas.find("mindustry-toolkit-titanium-conveyor-core");
    icon_plastanium_conveyor_core = Core.atlas.find("mindustry-toolkit-plastanium-conveyor-core");
    icon_mechanical_drill_fill = Core.atlas.find("mindustry-toolkit-mechanical-drill-fill");
    icon_pneumatic_drill_fill = Core.atlas.find("mindustry-toolkit-pneumatic-drill-fill");
    icon_airblast_drill_fill = Core.atlas.find("mindustry-toolkit-airblast-drill-fill");
    icon_enabled = Core.atlas.find("mindustry-toolkit-enabled-icon");
    icon_cyclone_copper = Core.atlas.find("mindustry-toolkit-cyclone-copper");
    icon_cyclone_titanium = Core.atlas.find("mindustry-toolkit-cyclone-titanium");
    icon_cyclone_thorium = Core.atlas.find("mindustry-toolkit-cyclone-thorium");
    icon_cyclone_plastanium = Core.atlas.find("mindustry-toolkit-cyclone-plastanium");
    icon_cyclone_phase = Core.atlas.find("mindustry-toolkit-cyclone-phase");
    icon_cyclone_surge = Core.atlas.find("mindustry-toolkit-cyclone-surge");
    icon_unloader = Core.atlas.find("mindustry-toolkit-unloader");
    icon_dagger = Core.atlas.find("mindustry-toolkit-dagger");
    icon_copper_wall_large = Core.atlas.find("mindustry-toolkit-copper-wall-large");
    icon_thorium_wall_large = Core.atlas.find("mindustry-toolkit-thorium-wall-large");
    icon_phase_wall_large = Core.atlas.find("mindustry-toolkit-phase-wall-large");
    icon_surge_wall_large = Core.atlas.find("mindustry-toolkit-surge-wall-large");
    icon_tsunami = Core.atlas.find("mindustry-toolkit-tsunami");
    icon_forcefield = Core.atlas.find("mindustry-toolkit-forcefield");

    Core.scene.addListener((event) => {
        if (event instanceof InputEvent) {
            if (event.type == "keyDown" && event.keyCode == "H" && !Vars.ui.chatfrag.shown() && !Vars.ui.schematics.isShown()) {
                enabled = !enabled;
                enabledTable.updateVisibility();

                if (!enabled && table != null) table.remove();
            }

            if (event.type == "keyDown" && event.keyCode == "U" && !Vars.ui.chatfrag.shown() && !Vars.ui.schematics.isShown()) {
                unloaderEnabled = !unloaderEnabled;
                unloaderTable.updateVisibility();
            }

            if (event.type == "keyDown" && event.keyCode == "Mouse Right") {
                if (table != null) table.remove();
            }

            if (event.type == "keyDown" && event.keyCode == "L" && Core.input.keyDown(Binding.deselect)) {
                let pos = Core.input.mouseWorld(Core.input.mouseX(), Core.input.mouseY());
                let mouseTile = Vars.world.tileWorld(pos.x, pos.y);

                let x1 = Math.min(Vars.control.input.selectX, mouseTile.centerX());
                let x2 = Math.max(Vars.control.input.selectX, mouseTile.centerX());
                let y1 = Math.min(Vars.control.input.selectY, mouseTile.centerY());
                let y2 = Math.max(Vars.control.input.selectY, mouseTile.centerY());

                Vars.control.input.lastSchematic = schematicsCreate.create(x1, y1, x2, y2);
                if (Vars.control.input.lastSchematic != null) Vars.control.input.useSchematic(Vars.control.input.lastSchematic);
            }
        }
        return false;
    });

    Vars.ui.hudGroup.fill(cons(t => {
        let group = new ButtonGroup();
        let buttons = new Table();

        let commandRegions = new Array(UnitCommand.all.length);
        UnitCommand.all.forEach(cmd => {
            commandRegions[cmd.ordinal()] = Vars.ui.getIcon("command" + Strings.capitalize(cmd.name()), "cancel");
        });

        UnitCommand.all.forEach(cmd => {
            buttons.button(commandRegions[cmd.ordinal()], Styles.clearToggleTransi, run(() => {
                let cc = Vars.indexer.findClosestFlag(0,0, Vars.player.team(), BlockFlag.rally);

                if (cc == null) return;

                if (Vars.player.team().data().command != cmd) {
                    cc.build.configure(cmd);
                }
            })).size(44).group(group).update(b => {
                b.setChecked(Vars.player.team().data().command == cmd)
            });
        });

        t.add(buttons);

        t.button(new TextureRegionDrawable(icon_dagger), Styles.clearToggleTransi, run(() => {
            unitControlEnabled = !unitControlEnabled;
        })).size(44).update(b => {
            b.setChecked(unitControlEnabled)
        });

        t.bottom().right().marginRight(350).marginBottom(25);
        t.pack();
    }));

    Vars.ui.hudGroup.fill(cons(t => {
        unloaderTable = t;

        let nested = t.table(Styles.black3).get();
        nested.image(new TextureRegionDrawable(icon_unloader)).pad(3);
        nested.pack();

        t.top().right().marginRight(210).marginTop(10);

        t.visibility = () => {
            return unloaderEnabled;
        };
        t.pack();
        t.updateVisibility();
    }));

    Vars.ui.hudGroup.fill(cons(t => {
        enabledTable = t;

        let nested = t.table(Styles.black3).get();
        nested.image(new TextureRegionDrawable(icon_enabled)).pad(3);
        nested.pack();

        t.top().right().marginRight(160).marginTop(10);

        t.visibility = () => {
            return enabled;
        };
        t.pack();
        t.updateVisibility();
    }));

    Timer.schedule(() => {
        if (!unitControlEnabled || attackModeTriggered) {
            return;
        }

        let cc = Vars.indexer.findClosestFlag(0,0, Vars.player.team(), BlockFlag.rally);

        if (cc == null) return;

        let it = Groups.unit.iterator();

        let closestCores = new Map();
        let closestCoresInRange = new Map();
        let daggerCount = 0;
        let enoughHaveSameCore = false;
        let idle = false;

        for (let i = 0; i < Vars.player.team().data().coreEnemies.length; i++) {
            let enemy = Vars.player.team().data().coreEnemies[i];
        }

        while (it.hasNext()) {
            let unit = it.next();

            if (unit.team == Vars.player.team() && unit.type == "dagger") {
                daggerCount++;

                let currentDist = Number.MAX_VALUE;
                let closestCore = null;
                Vars.player.team().data().coreEnemies.forEach(enemy => {
                    let tile = Geometry.findClosest(unit.x, unit.y, enemy.cores());

                    if (tile != null) {
                        let dx = tile.x - unit.x;
                        let dy = tile.y - unit.y;
                        let dist = dx * dx + dy * dy;

                        if (closestCore != null) {
                            if (dist < currentDist) {
                                closestCore = tile;
                                currentDist = dist;
                            }
                        } else {
                            closestCore = tile;
                            currentDist = dist;
                        }
                    }
                });

                let key = closestCore.tile.centerX() + "" + closestCore.tile.centerY();

                let dx = closestCore.x - unit.x;
                let dy = closestCore.y - unit.y;

                if (closestCores.has(key)) {
                    closestCores.set(key, closestCores.get(key) + 1);

                    if (closestCores.get(key) >= 3) {
                        enoughHaveSameCore = true;
                    }
                } else {
                    closestCores.set(key, 1);
                }

                if (dx * dx + dy * dy <= unit.type.range * unit.type.range) {
                    if (closestCoresInRange.has(key)) {
                        closestCoresInRange.set(key, closestCoresInRange.get(key) + 1);

                        if (closestCoresInRange.get(key) >= 3) {
                            if (Vars.player.team().data().command != UnitCommand.idle) {
                                cc.build.configure(UnitCommand.idle);
                            }
                            idle = true;
                            break;
                        }
                    } else {
                        closestCoresInRange.set(key, 1);
                    }
                }
            }
        }

        if (daggerCount < 3 || !enoughHaveSameCore) {
            if (Vars.player.team().data().command != UnitCommand.rally) {
                cc.build.configure(UnitCommand.rally);
            }
        } else if (!idle && Vars.player.team().data().command != UnitCommand.attack) {
            if (!attackModeTriggered) {
                attackModeTriggered = true;
                Timer.schedule(() => {
                    if (unitControlEnabled) {
                        cc.build.configure(UnitCommand.attack);
                    }
                    attackModeTriggered = false;
                }, 4);
            }
        }

    }, 0.5, 0.5);

    Timer.schedule(() => {
        if (configureQueue.length > 0) {
            let configure = configureQueue.shift();

            let tile = configure.tile;
            let item = configure.item;
            if (tile.build != null && tile.block() === Blocks.unloader) {
                tile.build.configure(item);
            }
        }
    }, 0.3, 0.3);

    Timer.schedule(() => {
        let surge = Vars.player.team().items().get(Items.surgeAlloy);
        let plastanium = Vars.player.team().items().get(Items.plastanium);

        let ammunitionItem = lastAmmunitionItem;
        if (!lastAmmunitionChanged) {
            if (surge < 50) ammunitionItem = Items.plastanium;
            if (plastanium < 50) ammunitionItem = Items.metaglass;
            if (plastanium > 100) ammunitionItem = Items.plastanium;
            if (surge > 100) ammunitionItem = Items.surgeAlloy;
        }

        coresUnloaders.forEach((unloaders, core, object) => {
            if (core.build == null || core.build.team != Vars.player.team()) {
                object.delete(core);
            }

            let health = 0;
            const size = (Vars.state.rules.enemyCoreBuildRadius + Vars.tilesize) * 2;
            Units.nearbyEnemies(Vars.player.team(), core.worldx() - size / 2, core.worldy() - size / 2, size, size, cons((unit) => {
                health += unit.health > 0 ? unit.health : 0;
            }));

            if (health > 100) {
                if (health > 3000) {
                    unloaders.phase.forEach(unloader => {
                        if (unloader.build != null && unloader.build.config() == Items.sporePod && configureQueue.find(e => { e.tile.pos() == unloader.pos() }) == undefined) {
                            configureQueue.unshift({tile: unloader, item: Items.phaseFabric});
                        }
                    });
                } else if (health < 1000) {
                    unloaders.phase.forEach(unloader => {
                        if (unloader.build != null && unloader.build.config() == Items.phaseFabric && configureQueue.find(e => { e.tile.pos() == unloader.pos() }) == undefined) {
                            configureQueue.unshift({tile: unloader, item: Items.sporePod});
                        }
                    });
                }
            }

            if (unloaders.recentlyAdded > 0) {
                unloaders.phase.forEach(unloader => {
                    if (unloader.build != null && unloader.build.config() == Items.phaseFabric && configureQueue.find(e => { e.tile.pos() == unloader.pos() }) == undefined) {
                        configureQueue.unshift({tile: unloader, item: Items.sporePod});
                        unloaders.recentlyAdded = unloaders.recentlyAdded - 1;
                    }
                });
            }

            if (lastAmmunitionItem != ammunitionItem) {
                lastAmmunitionChanged = true;
                Timer.schedule(() => {
                    lastAmmunitionChanged = false;
                }, 3);
            }

            unloaders.surge.forEach(unloader => {
                if (unloader.build != null && unloader.build.config() != ammunitionItem && configureQueue.find(e => { e.tile.pos() == unloader.pos() }) == undefined) {
                    configureQueue.push({tile: unloader, item: ammunitionItem});
                }
            });

            lastAmmunitionItem = ammunitionItem;
        });
    }, 0.5, 0.5);

    Timer.schedule(() => {
        unloaderTiles.forEach((value, key, map) => {
            let coreItems = Vars.player.team().items().get(value.item == null ? Items.silicon : value.item);

            value.unloaders.forEach((unloaderTile, index, arr) => {
                if (unloaderTile.build != null && unloaderTile.block() == Blocks.unloader) {
                    let item = unloaderTile.build.config();

                    if (coreItems < (value.item == null ? 10 : 50) + index * (value.item == null ? 10 : 50)) {
                        if (!resetUnloaders.has(unloaderTile) && configureQueue.find(e => { e.tile.pos() == unloaderTile.pos() }) == undefined) {
                            resetUnloaders.set(unloaderTile, {item: item, i: index});
                            configureQueue.push({tile: unloaderTile, item: Items.sporePod});
                        }
                    }
                } else if (unloaderTile.build == null || unloaderTile.block() != Blocks.unloader) {
                    arr.splice(index, 1);
                }
            });
        });

        resetUnloaders.forEach((value, tile, map) => {
            let coreItems = Vars.player.team().items().get(value.item == null ? Items.silicon : value.item);

            if (coreItems > (value.item == null ? 30 : 150) + value.i * (value.item == null ? 10 : 50)) {
                if (tile.build != null && tile.block() == Blocks.unloader && configureQueue.find(e => { e.tile.pos() == tile.pos() }) == undefined) {
                    configureQueue.push({tile: tile, item: value.item});
                }
                map.delete(tile);
            }
        });
    }, 1, 1);
});

Events.on(TapEvent, event => {
    let tile = event.tile;

    if (unloaderEnabled) {
        if (tile.block() == Blocks.vault || tile.block() == Blocks.container || tile.block() == Blocks.coreShard || tile.block() == Blocks.coreFoundation || tile.block() == Blocks.coreNucleus) {
            let nearby = Edges.getEdges(tile.build.block.size);
            let var2 = nearby;
            let var3 = nearby.length;

            for (let var4 = 0; var4 < var3; ++var4) {
                let point = var2[var4];

                let adjacentTile = Vars.world.tile(tile.build.tile.x + point.x, tile.build.tile.y + point.y);

                if (adjacentTile.block() == Blocks.unloader && adjacentTile.build.config() != Items.sporePod) {
                    let cfg = adjacentTile.build.config();
                    let config = cfg == null ? "null" : cfg.toString();

                    if (unloaderTiles.has(config)) {
                        if (unloaderTiles.get(config).unloaders.indexOf(adjacentTile) < 0) {
                            unloaderTiles.get(config).unloaders.push(adjacentTile);
                            Fx.heal.at(adjacentTile.getX(), adjacentTile.getY(), 0);
                        }
                    } else {
                        let obj = {item: adjacentTile.build.config(), unloaders: [adjacentTile]};

                        unloaderTiles.set(config, obj);
                        Fx.heal.at(adjacentTile.getX(), adjacentTile.getY(), 0);
                    }
                }
            }
        }

        unloaderEnabled = !unloaderEnabled;
        unloaderTable.updateVisibility();
    }

    if (!enabled || Vars.control.input.isUsingSchematic() || Vars.control.input.selectedBlock()) {
        return;
    }

    table = new Table(Styles.black3);
    table.update(() => {
        if (Vars.state.isMenu()) table.remove();
        let v = Core.camera.project(tile.centerX() * Vars.tilesize, (tile.centerY() + 1) * Vars.tilesize);
        table.setPosition(v.x, v.y, Align.bottom);
    }).margin(2);

    if (tile.build == null ||
        tile.block() == Blocks.conveyor ||
        tile.block() == Blocks.titaniumConveyor ||
        tile.block() == Blocks.armoredConveyor ||
        tile.block() == Blocks.plastaniumConveyor) {
        Fx.tapBlock.at(tile.getX(), tile.getY(), 0);

        table.button(new TextureRegionDrawable(icon_conveyor_core), Styles.defaulti, run(() => {
            connectToCore(tile, Blocks.conveyor);
            table.remove();
        })).pad(2);

        table.button(new TextureRegionDrawable(icon_titanium_conveyor_core), Styles.defaulti, run(() => {
            connectToCore(tile, Blocks.titaniumConveyor);
            table.remove();
        })).pad(2);

        table.button(new TextureRegionDrawable(icon_plastanium_conveyor_core), Styles.defaulti, run(() => {
            connectToCore(tile, Blocks.plastaniumConveyor);
            table.remove();
        })).pad(2);

        if (tile.build == null && tile.overlay() instanceof OreBlock) {
            let image = new TextureRegionDrawable(icon_mechanical_drill_fill);
            let drill = Blocks.mechanicalDrill;
            if (tile.overlay().itemDrop.hardness > Blocks.mechanicalDrill.tier) {
                image = new TextureRegionDrawable(icon_pneumatic_drill_fill);
                drill = Blocks.pneumaticDrill;
            }

            table.button(image, Styles.defaulti, run(() => {
                table.clearChildren();

                table.button(Icon.cancel, Styles.defaulti, run(() => {
                })).maxSize(55).get().visible = false;
                table.button(Icon.up, Styles.defaulti, run(() => {
                    resourceFiller.fill(tile, 1, drill);
                    table.remove();
                })).maxSize(55).fillX().center().get().pack();

                table.row();

                table.button(Icon.left, Styles.defaulti, run(() => {
                    resourceFiller.fill(tile, 2, drill);
                    table.remove();
                })).maxSize(55);

                table.button(image, Styles.defaulti, run(() => {
                    table.remove();
                })).maxSize(55);

                table.button(Icon.right, Styles.defaulti, run(() => {
                    resourceFiller.fill(tile, 0, drill);
                    table.remove();
                })).maxSize(55);

                table.row();

                table.button(Icon.cancel, Styles.defaulti, run(() => {
                })).maxSize(55).get().visible = false;
                table.button(Icon.down, Styles.defaulti, run(() => {
                    resourceFiller.fill(tile, 3, drill);
                    table.remove();
                })).maxSize(55);

                table.pack();
            })).pad(2);

            table.button(new TextureRegionDrawable(icon_airblast_drill_fill), Styles.defaulti, run(() => {
                resourceFillerAirblast.fill(tile);
                table.remove();
            })).pad(2);
        }
    }

    if (tile.build != null && tile.build.block == Blocks.coreShard) {
        defensePlacementUI(icon_copper_wall_large, "toolkit_def_copper", tile, 9, 9, -8, -8, false, false);
        defensePlacementUI(icon_thorium_wall_large, "toolkit_def_thorium", tile, 10, 10, -8, -8, false, false);
        defensePlacementUI(icon_phase_wall_large, "toolkit_def_phase", tile, 9, 9, -8, -8, false, false);
        defensePlacementUI(icon_surge_wall_large, "toolkit_def_surge", tile, 9, 9, -8, -8, false, false);
        defensePlacementUI(icon_tsunami, "toolkit_def_tsunami", tile, -6, -6, 7, 7, false, false);
        defensePlacementUI(icon_forcefield, "toolkit_def_forcefield", tile, -7, -7, 9, 9, false, false);

        defensePlacementUI(icon_cyclone_copper, "toolkit_def_modular_1", tile, 4, 4, -3, -3, true, true);
        defensePlacementUI(icon_cyclone_titanium, "toolkit_def_modular_2", tile, 4, 4, -3, -3, false, true);
        defensePlacementUI(icon_cyclone_thorium, "toolkit_def_modular_3", tile, 4, 4, -3, -3, false, true);
        defensePlacementUI(icon_cyclone_plastanium, "toolkit_def_modular_4", tile, 4, 4, -2, -2, false, true);
        defensePlacementUI(icon_cyclone_phase, "toolkit_def_modular_5", tile, 5, 5, -3, -3, false, true);
        defensePlacementUI(icon_cyclone_surge, "toolkit_def_modular_6", tile, 3, 3, -2, -2, false, true);
    }

    let listener = (event) => {
        if (event instanceof InputEvent) {
            if (event.type == "keyDown" && event.keyCode == "Mouse Left" && !table.hasMouse()) {
                Core.scene.removeListener(listener);
                table.remove();
            }
        }
        return false;
    };

    Core.scene.addListener(listener);

    table.pack();
    table.act(0);
    Core.scene.root.addChildAt(0, table);
});

function connectToCore(source, conveyor) {
    let closestCoreTile = closestCoreTileSearch.search(source);

    if (closestCoreTile != null) {
        Fx.tapBlock.at(closestCoreTile.getX(), closestCoreTile.getY(), 0);

        let tiles = conveyorPathfind.pathfind(source, closestCoreTile, conveyor);

        if (tiles != null) {
            conveyorPlacer.place(tiles, conveyor);
        }
    }
}

function defensePlacementUI(icon, name, tile, os0, os1, os2, os3, newrow, replace) {
    if (newrow) table.row();

    table.button(new TextureRegionDrawable(icon), Styles.defaulti, run(() => {
        table.clearChildren();

        table.button(Icon.cancel, Styles.defaulti, run(() => {
        })).maxSize(55).get().visible = false;
        table.button(Icon.up, Styles.defaulti, run(() => {
            defensePlacer.place(name + "_1", tile.centerX(), tile.centerY() + os1, coresUnloaders, tile, replace);
            table.remove();
        })).maxSize(55).fillX().center().get().pack();

        table.row();

        table.button(Icon.left, Styles.defaulti, run(() => {
            defensePlacer.place(name + "_2", tile.centerX() + os2, tile.centerY(), coresUnloaders, tile, replace);
            table.remove();
        })).maxSize(55);

        table.button(new TextureRegionDrawable(icon), Styles.defaulti, run(() => {
            table.remove();
        })).maxSize(55);

        table.button(Icon.right, Styles.defaulti, run(() => {
            defensePlacer.place(name + "_0", tile.centerX() + os0, tile.centerY(), coresUnloaders, tile, replace);
            table.remove();
        })).maxSize(55);

        table.row();

        table.button(Icon.cancel, Styles.defaulti, run(() => {
        })).maxSize(55).get().visible = false;
        table.button(Icon.down, Styles.defaulti, run(() => {
            defensePlacer.place(name + "_3", tile.centerX(), tile.centerY() + os3, coresUnloaders, tile, replace);
            table.remove();
        })).maxSize(55);

        table.pack();
    })).pad(2);
}