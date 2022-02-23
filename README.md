# EvictionToolkit

Two Mindustry mods that add various PVP enhancements.

Zip the folders and move them to the mod folder to use them

## Better Resource, Energy, and Schematics Display

adds 3 tables to the HUD, a better core item display which also displays the rate of change per second, a global power production and storage display and
quick access to schematics (each button opens the schematics menu with a predefined hardcoded search text)
Further, it increases the maximum zoom-out level of the player by a large margin.

![image](https://user-images.githubusercontent.com/35230128/153236313-d8179976-de0b-4664-bbd0-fd77c2f271eb.png)

## Mindustry Toolkit

adds a global command center control and an automatic dagger control mode to the screen.
command center only works if at least one command center is placed.
The automatic dagger control mode controls the command center when activated to destroy fallen cores on eviction more effectively.

It has three modes:

1. Rally if less than three daggers share the same nearest enemy core
2. Attack if more than two daggers share the same nearest enemy core and less than three daggers are within the range of one
3. Idle if three daggers are attacking the same enemy core

![image](https://user-images.githubusercontent.com/35230128/153237182-0898d2f0-94e5-42ab-b857-01131aca5165.png)

### Automatic unloader control:

to enable this mode press `u`, an icon in the top right indicates this mode is enabled.
If the next tile tapped is a vault, container, or core the adjacent unloaders will be added to the list of unloaders which are automatically controlled to ensure they do not empty the core items. Unloaders will sequentially get enabled or disabled the more or less amount of that item is available. Unset unloaders a controlled based on the silicon amount, useful for early dagger/mono production.

### Enhanced Tile and Core UI

to enable this mode press `h`, an icon in the top right indicates this mode is enabled.
When a tile gets tapped the following UI appears:

![image](https://user-images.githubusercontent.com/35230128/153238623-35745a80-8111-4cb1-88b9-c3e7b560744d.png)

The first three buttons connect the tapped tile to the nearest core with the chosen conveyor type, avoiding nearby buildings to not spoil the conveyor with other items.

![image](https://user-images.githubusercontent.com/35230128/153238891-66e90675-7435-4d22-a059-05334874715b.png)
To enable this mode, press [pointi, what do you press to open this menu?]
The mechanical/pneumatic drill buttons fill a resource with drills, the direction of which is chosen in a second button menu. The airblast drill icon fills the resources with an optimum amount of airblast drills and places water extractors and power nodes nearby (those two buttons can crash the game when used on the world border)  

![image](https://user-images.githubusercontent.com/35230128/153239060-9319d3ee-f167-4342-8494-4255a1132d39.png) ![image](https://user-images.githubusercontent.com/35230128/153239097-7f2ba461-cf20-4456-8705-492ff88f0884.png) ![image](https://user-images.githubusercontent.com/35230128/153239240-faad708f-e525-49ef-881e-26c1436a038a.png)

When clicking on a core a menu for placing defense structures appears, for those buttons to work the player must have saved the defense schematics with specified names and with all 4 rotations:

![image](https://user-images.githubusercontent.com/35230128/153239832-9a60cd59-94b4-4cf3-9331-7791169ddfd4.png)

An example, the second cyclone button corresponds to 4 schematics named `toolkit_def_1_i` where `i` corresponds to the rotation of the schematic [0-3].
Placing defense schematics this way adds all unloaders of the schematic to a list of automatically controlled unloaders, where surge unloaders are automatically changed to plastanium or metaglass if other ammunition items are not available. Phase unloaders will only get enabled when a certain amount of accumulated health of nearby enemy units is exceeded and are disabled again after the attack is over or the units leave the range of the fort again.

![image](https://user-images.githubusercontent.com/35230128/153239940-523b0a8a-e357-485f-94d5-d92dfe0347fc.png)

The last feature is saving schematics up to a size of 100x100 by selecting a schematic with the remove tool and not releasing the mouse but pressing `l`.

**To get all features to work you likely will need to change some hardcoded values in the scripts, like the search texts of the schematics menu or the schematics for the better defense placement UI**
