# mesecons
mesecons mod for Dragonblocks

# Classes
mesecons.Event(type : String, msg : String)
mesecons.Source(name : String, left : boolean, right : boolean, down : boolean, up : boolean)

# Functions (not methods, really)
mesecons.addSource(mesecons.Source)
  Adds a mesecons.Source to the list of registered sources
mesecons.isSource(name : String, left : boolean, right : boolean, down : boolean, up : boolean)
  Checks if a source (identified by its name) sends in at least one of the directions that are set to true
mesecons.emit(x : int, y : int, side : String, state : String)
  Creates a mesecons.Event on the specified side, msg is state
  Use this to power or unpower a wire
mesecons.traceSources(x : int, y : int, side : String, state : String)
  Returns false if no sources are found on the wire on the specified side, returns an object with x and y of the first source if found

# Arrays and Objects
mesecons.emitters
  Contains information about all nodes that emitted something (coordinates + current state)
mesecons.sources
  Contains all registered sources (use functions above for easy access)

# Sending
## Powering
async function(x, y) {
	while (dragonblocks.getNode(x, y).name == "YOURNODENAME") {
		mesecons.emit(x, y, "all", "on");
		await sleep(500);
	}
}
Use this as an onset function of a source
## Unpowering
if (!mesecons.traceSources(x, y, "left", "on")) mesecons.emit(x, y, "left", "off");
if (!mesecons.traceSources(x, y, "right", "on")) mesecons.emit(x, y, "right", "off");
if (!mesecons.traceSources(x, y, "down", "on")) mesecons.emit(x, y, "down", "off");
if (!mesecons.traceSources(x, y, "up", "on")) mesecons.emit(x, y, "up", "off");
Use this in an onset function of a conducting material or mesecon receiver which is not a source

# Receiving
Give a node the property "mesecons".
It has to be a function with the arguments x, y and e. e is a mesecons.Event telling you whether the wire switched on or off.
x and y are the coordinates of the receiving node. Now you can do something or perform another check (such as checking mesecons.emitters[x + a][y + b].state to check which of the surrounding conductors are on or off (a and b are used to specify which of the surrounding nodes you want to check. Make sure that the node is an emitter by checking if mesecons.emitters[x + a][y + b] is undefined!)).
