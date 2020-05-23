$.ajaxSetup({
	async: false,
	cache: false
});

function sleep(ms) {
	return new Promise(resolve => setTimeout(resolve, ms));
}

mesecons = {};

mesecons.emitters = [];
mesecons.sources = {};

for (let i = 0; i < 250; i++) {
	mesecons.emitters[i] = [];
}

mesecons.emit = (x, y, side, state) => {
	mesecons.emitters[x][y] = {x: x, y: y, state: state};
	if (state != "on" && state != "off") dragonblocks.error("Invalid argument \"state\" passed to mesecons.emit: \"on\" or \"off\" expected, got " + state);
	let e = new mesecons.Event("mesecons", state);
	if (side == "left") {
		if (dragonblocks.getNode(x - 1, y).toNode === undefined) return false;
		if (dragonblocks.getNode(x - 1, y).toNode().mesecons !== undefined) dragonblocks.getNode(x - 1, y).toNode().mesecons(x - 1, y, e);
	} else if (side == "right") {
		if (dragonblocks.getNode(x + 1, y).toNode === undefined) return false;
		if (dragonblocks.getNode(x + 1, y).toNode().mesecons !== undefined) dragonblocks.getNode(x + 1, y).toNode().mesecons(x + 1, y, e);
	} else if (side == "down") {
		if (dragonblocks.getNode(x, y + 1).toNode === undefined) return false;
		if (dragonblocks.getNode(x, y + 1).toNode().mesecons !== undefined) dragonblocks.getNode(x, y + 1).toNode().mesecons(x, y + 1, e);
	} else if (side == "up") {
		if (dragonblocks.getNode(x, y - 1).toNode === undefined) return false;
		if (dragonblocks.getNode(x, y - 1).toNode().mesecons !== undefined) dragonblocks.getNode(x, y - 1).toNode().mesecons(x, y - 1, e);
	} else if (side == "leftright") {
		if (dragonblocks.getNode(x - 1, y).toNode === undefined) return false;
		if (dragonblocks.getNode(x + 1, y).toNode === undefined) return false;
		if (dragonblocks.getNode(x - 1, y).toNode().mesecons !== undefined) dragonblocks.getNode(x - 1, y).toNode().mesecons(x - 1, y, e);
		if (dragonblocks.getNode(x + 1, y).toNode().mesecons !== undefined) dragonblocks.getNode(x + 1, y).toNode().mesecons(x + 1, y, e);
	} else if (side == "downup") {
		if (dragonblocks.getNode(x, y + 1).toNode === undefined) return false;
		if (dragonblocks.getNode(x, y + 1).toNode().mesecons !== undefined) dragonblocks.getNode(x, y + 1).toNode().mesecons(x, y + 1, e);
		if (dragonblocks.getNode(x, y - 1).toNode === undefined) return false;
		if (dragonblocks.getNode(x, y - 1).toNode().mesecons !== undefined) dragonblocks.getNode(x, y - 1).toNode().mesecons(x, y - 1, e);
	} else if (side == "all") {
		if (dragonblocks.getNode(x - 1, y).toNode === undefined) return false;
		if (dragonblocks.getNode(x - 1, y).toNode().mesecons !== undefined) dragonblocks.getNode(x - 1, y).toNode().mesecons(x - 1, y, e);
		if (dragonblocks.getNode(x + 1, y).toNode === undefined) return false;
		if (dragonblocks.getNode(x + 1, y).toNode().mesecons !== undefined) dragonblocks.getNode(x + 1, y).toNode().mesecons(x + 1, y, e);
		if (dragonblocks.getNode(x, y + 1).toNode === undefined) return false;
		if (dragonblocks.getNode(x, y + 1).toNode().mesecons !== undefined) dragonblocks.getNode(x, y + 1).toNode().mesecons(x, y + 1, e);
		if (dragonblocks.getNode(x, y - 1).toNode === undefined) return false;
		if (dragonblocks.getNode(x, y - 1).toNode().mesecons !== undefined) dragonblocks.getNode(x, y - 1).toNode().mesecons(x, y - 1, e);
	} else dragonblocks.error("Invalid argument \"side\" passed to mesecons.emit: \"left\", \"right\", \"down\", \"up\", \"leftright\", \"downup\" or \"all\" expected, got " + side);
}

mesecons.Source = class {
	constructor(name, left, right, down, up) {
		this.name = name;
		this.left = left;
		this.right = right;
		this.down = down;
		this.up = up;
	}
}

mesecons.isSource = (name, left, right, down, up) => {
	if (mesecons.sources[name]) {
		source = mesecons.sources[name];
		if (left && source.left) return true;
		if (right && source.right) return true;
		if (down && source.down) return true;
		if (up && source.up) return true;
	}
	return false;
}

mesecons.addSource = source => {
	if (!mesecons.isSource(source.name)) mesecons.sources[source.name] = source;
}

mesecons.traceSources = (x, y, side, state) => {
	if (side == "left") {
		for (let lx = x - 1; ; lx--) {
			if (dragonblocks.getNode(lx, y) === undefined) return false;
			if (dragonblocks.getNode(lx, y).toNode === undefined) return false;
			
			if (mesecons.emitters[lx][y] !== undefined) {
				if (mesecons.emitters[lx][y].state == state && mesecons.isSource(dragonblocks.getNode(lx, y).toNode().name, false, true, false, false)) return {x: lx, y: y};
			} else if (dragonblocks.getNode(lx, y).toNode().mesecons === undefined) return false;
			
			if (dragonblocks.getNode(lx, y + 1) !== undefined || dragonblocks.getNode(lx, y - 1) !== undefined) {
				if (dragonblocks.getNode(lx, y + 1).toNode().mesecons !== undefined) {
					let result = mesecons.traceSources(lx, y + 1, "down", state);
					if (result) return result;
				}
				if (dragonblocks.getNode(lx, y - 1).toNode().mesecons !== undefined) {
					let result = mesecons.traceSources(lx, y - 1, "up", state);
					if (result) return result;
				}
			}
		}
	} else if (side == "right") {
		for (let lx = x + 1; ; lx++) {
			if (dragonblocks.getNode(lx, y) === undefined) return false;
			if (dragonblocks.getNode(lx, y).toNode === undefined) return false;
			
			if (mesecons.emitters[lx][y] !== undefined) {
				if (mesecons.emitters[lx][y].state == state && mesecons.isSource(dragonblocks.getNode(lx, y).toNode().name, true, false, false, false)) return {x: lx, y: y};
			} else if (dragonblocks.getNode(lx, y).toNode().mesecons === undefined) return false;
			
			if (dragonblocks.getNode(lx, y + 1) !== undefined || dragonblocks.getNode(lx, y - 1) !== undefined) {
				if (dragonblocks.getNode(lx, y + 1).toNode().mesecons !== undefined) {
					let result = mesecons.traceSources(lx, y + 1, "down", state);
					if (result) return result;
				}
				if (dragonblocks.getNode(lx, y - 1).toNode().mesecons !== undefined) {
					let result = mesecons.traceSources(lx, y - 1, "up", state);
					if (result) return result;
				}
			}
		}
	} else if (side == "down") {
		for (let ly = y + 1; ; ly++) {
			if (dragonblocks.getNode(x, ly) === undefined) return false;
			if (dragonblocks.getNode(x, ly).toNode === undefined) return false;
			
			if (mesecons.emitters[x][ly] !== undefined) {
				if (mesecons.emitters[x][ly].state == state && mesecons.isSource(dragonblocks.getNode(x, ly).toNode().name, false, false, false, true)) return {x: x, y: ly};
			} else if (dragonblocks.getNode(x, ly).toNode().mesecons === undefined) return false;
			
			if (dragonblocks.getNode(x + 1, ly) !== undefined || dragonblocks.getNode(x - 1, ly) !== undefined) {
				if (dragonblocks.getNode(x + 1, ly).toNode().mesecons !== undefined) {
					let result = mesecons.traceSources(x + 1, ly, "right", state);
					if (result) return result;
				}
				if (dragonblocks.getNode(x - 1, ly).toNode().mesecons !== undefined) {
					let result = mesecons.traceSources(x - 1, ly, "left", state);
					if (result) return result;
				}
			}
		}
	} else if (side == "up") {
		for (let ly = y - 1; ; ly--) {
			if (dragonblocks.getNode(x, ly) === undefined) return false;
			if (dragonblocks.getNode(x, ly).toNode === undefined) return false;
			
			if (mesecons.emitters[x][ly] !== undefined) {
				if (mesecons.emitters[x][ly].state == state && mesecons.isSource(dragonblocks.getNode(x, ly).toNode().name, false, false, true, false)) return {x: x, y: ly};
			} else if (dragonblocks.getNode(x, ly).toNode().mesecons === undefined) return false;
			
			if (dragonblocks.getNode(x + 1, ly) !== undefined || dragonblocks.getNode(x - 1, ly) !== undefined) {
				if (dragonblocks.getNode(x + 1, ly).toNode().mesecons !== undefined) {
					let result = mesecons.traceSources(x + 1, ly, "right", state);
					if (result) return result;
				}
				if (dragonblocks.getNode(x - 1, ly).toNode().mesecons !== undefined) {
					let result = mesecons.traceSources(x - 1, ly, "left", state);
					if (result) return result;
				}
			}
		}
	} else dragonblocks.error("Invalid argument \"side\" passed to mesecons.traceSources: \"left\", \"right\", \"down\" or \"up\" expected, got " + side);
}

mesecons.savejscode = _ => {
	if (document.querySelector("#" + mesecons.id)) {
		data = document.querySelector("#" + mesecons.id).value;
		dragonblocks.getNode(mesecons.x, mesecons.y).meta.code = data;
	}
}

mesecons.Event = class {
	constructor(type, msg) {
		this.type = type;
		this.msg = msg;
	}
}

dragonblocks.registerNode({
	name: "mesecons:mesecon_wire_off",
	stable: true,
	mobstable: false,
	texture: "mesecon_wire_off.png",
	hardness: 0,
	desc: "Mesecon",
	onset: (x, y) => {
		if (!mesecons.traceSources(x, y, "left", "on")) mesecons.emit(x, y, "left", "off");
		if (!mesecons.traceSources(x, y, "right", "on")) mesecons.emit(x, y, "right", "off");
	},
	mesecons: (x, y, e) => {
		if (e.type == "mesecons" && e.msg == "on") dragonblocks.setNode(x, y, "mesecons:mesecon_wire_on");
	},
});
dragonblocks.registerNode({
	name: "mesecons:mesecon_wire_on",
	stable: true,
	mobstable: false,
	texture: "mesecon_wire_on.png",
	hardness: 0,
	desc: "Mesecon (on)",
	drop: "mesecons:mesecon_wire_off",
	hidden: true,
	onset: async function(x, y) {
		while (dragonblocks.getNode(x, y).name == "mesecons:mesecon_wire_on") {
			mesecons.emit(x, y, "leftright", "on");
			await sleep(500);
		}
	},
	ondig: (x, y) => {
		if (!mesecons.traceSources(x, y, "left", "on")) mesecons.emit(x, y, "left", "off");
		if (!mesecons.traceSources(x, y, "right", "on")) mesecons.emit(x, y, "right", "off");
	},
	mesecons: (x, y, e) => {
		if (e.type == "mesecons" && e.msg == "off") dragonblocks.setNode(x, y, "mesecons:mesecon_wire_off");
	},
});
dragonblocks.registerNode({
	name: "mesecons:mesecon_torch_on",
	stable: true,
	mobstable: false,
	texture: "mesecon_torch_on.png",
	hardness: 0,
	desc: "Mesecon torch",
	onset: async function(x, y) {
		while (dragonblocks.getNode(x, y).name == "mesecons:mesecon_torch_on") {
			mesecons.emit(x, y, "leftright", "on");
			await sleep(500);
		}
	},
	ondig: (x, y) => {
		if (!mesecons.traceSources(x, y, "left", "on")) mesecons.emit(x, y, "left", "off");
		if (!mesecons.traceSources(x, y, "right", "on")) mesecons.emit(x, y, "right", "off");
	},
	mesecons: async function(x, y, e) {
		if (e.type == "mesecons" && e.msg == "on" && mesecons.emitters[x][y + 1].state == "on") {
			await sleep(500);
			dragonblocks.setNode(x, y, "mesecons:mesecon_torch_off");
		}
	},
});
mesecons.addSource(new mesecons.Source("mesecons:mesecon_torch_on", true, true, false, false));
dragonblocks.registerNode({
	name: "mesecons:mesecon_torch_off",
	stable: true,
	mobstable: false,
	texture: "mesecon_torch_off.png",
	hardness: 0,
	desc: "Mesecon torch (off)",
	drop: "mesecons:mesecon_torch_on",
	hidden: true,
	onset: (x, y) => {
		if (!mesecons.traceSources(x, y, "left", "on")) mesecons.emit(x, y, "left", "off");
		if (!mesecons.traceSources(x, y, "right", "on")) mesecons.emit(x, y, "right", "off");
	},
	mesecons: async function(x, y, e) {
		if (e.type == "mesecons" && e.msg == "off" && mesecons.emitters[x][y + 1].state == "off") {
			await sleep(500);
			dragonblocks.setNode(x, y, "mesecons:mesecon_torch_on");
		}
	},
});
dragonblocks.registerNode({
	name: "mesecons:lightstone_white_off",
	stable: true,
	texture: "lightstone_white_off.png",
	hardness: 2,
	desc: "White lightstone",
	mesecons: (x, y, e) => {
		if (e.type == "mesecons" && e.msg == "on") dragonblocks.setNode(x, y, "mesecons:lightstone_white_on");
	},
});
dragonblocks.registerNode({
	name: "mesecons:lightstone_white_on",
	stable: true,
	texture: "lightstone_white_on.png",
	hardness: 2,
	desc: "White lightstone (on)",
	drop: "mesecons:lightstone_white_off",
	hidden: true,
	mesecons: (x, y, e) => {
		if (e.type == "mesecons" && e.msg == "off") dragonblocks.setNode(x, y, "mesecons:lightstone_white_off");
	},
});
dragonblocks.registerNode({
	name: "mesecons:switch_off",
	stable: true,
	texture: "switch_off.png",
	hardness: 8,
	desc: "Switch",
	onset: (x, y) => {
		if (!mesecons.traceSources(x, y, "left", "on")) mesecons.emit(x, y, "left", "off");
		if (!mesecons.traceSources(x, y, "right", "on")) mesecons.emit(x, y, "right", "off");
	},
	onclick: (x, y) => {
		dragonblocks.setNode(x, y, "mesecons:switch_on");
		dragonblocks.playSound("switch.ogg");
	},
});
dragonblocks.registerNode({
	name: "mesecons:switch_on",
	stable: true,
	texture: "switch_on.png",
	hardness: 8,
	desc: "Switch (on)",
	drop: "mesecons:switch_off",
	hidden: true,
	onset: async function(x, y) {
		while (dragonblocks.getNode(x, y).name == "mesecons:switch_on") {
			mesecons.emit(x, y, "leftright", "on");
			await sleep(500);
		}
	},
	onclick: (x, y) => {
		dragonblocks.setNode(x, y, "mesecons:switch_off");
		dragonblocks.playSound("switch.ogg");
	},
	ondig: (x, y) => {
		if (!mesecons.traceSources(x, y, "left", "on")) mesecons.emit(x, y, "left", "off");
		if (!mesecons.traceSources(x, y, "right", "on")) mesecons.emit(x, y, "right", "off");
	},
});
mesecons.addSource(new mesecons.Source("mesecons:switch_on", true, true, false, false));
dragonblocks.nodes["ores:mese_block"].onset = (x, y) => {
	if (!mesecons.traceSources(x, y, "left", "on")) mesecons.emit(x, y, "left", "off");
	if (!mesecons.traceSources(x, y, "right", "on")) mesecons.emit(x, y, "right", "off");
	if (!mesecons.traceSources(x, y, "down", "on")) mesecons.emit(x, y, "down", "off");
	if (!mesecons.traceSources(x, y, "up", "on")) mesecons.emit(x, y, "up", "off");
};
dragonblocks.nodes["ores:mese_block"].mesecons = (x, y, e) => {
	if (e.type == "mesecons" && e.msg == "on") dragonblocks.setNode(x, y, "mesecons:mese_block_on");
};
dragonblocks.registerNode({
	name: "mesecons:mese_block_on",
	stable: true,
	texture: "mese_block_on.png",
	hardness: 20,
	desc: "Mese Block (on)",
	groups: ["cracky", "default"],
	drop: "ores:mese_block",
	hidden: true,
	onset: async function(x, y) {
		while (dragonblocks.getNode(x, y).name == "mesecons:mese_block_on") {
			mesecons.emit(x, y, "all", "on");
			await sleep(500);
		}
	},
	ondig: (x, y) => {
		if (!mesecons.traceSources(x, y, "left", "on")) mesecons.emit(x, y, "left", "off");
		if (!mesecons.traceSources(x, y, "right", "on")) mesecons.emit(x, y, "right", "off");
		if (!mesecons.traceSources(x, y, "down", "on")) mesecons.emit(x, y, "down", "off");
		if (!mesecons.traceSources(x, y, "up", "on")) mesecons.emit(x, y, "up", "off");
	},
	mesecons: (x, y, e) => {
		if (e.type == "mesecons" && e.msg == "off") dragonblocks.setNode(x, y, "ores:mese_block");
	},
});
dragonblocks.registerNode({
	name: "mesecons:js_block",
	stable: true,
	texture: "js_block.png",
	hardness: 7,
	desc: "JavaScript Block",
	onset: (x, y) => {
		if (!dragonblocks.getNode(x, y).meta.code) dragonblocks.getNode(x, y).meta.code = "";
		dragonblocks.getNode(x, y).meta.ready = true;
		
		dragonblocks.getNode(x, y).meta.codeprompt = dragonblocks.gui.createBox({
			closeable: true,
			scroll: true,
			keylock: true,
		});
		let codeprompt = dragonblocks.getNode(x, y).meta.codeprompt;
		let input = codeprompt.create("textarea");
		input.rows = "20";
		input.cols = "60";
		input.id = "jscode" + (x + y);
		input.value = dragonblocks.getNode(x, y).meta.code;
		let br = codeprompt.create("br");
		let confirm = codeprompt.create("button");
		confirm.style = "align:center";
		confirm.onclick = mesecons.savejscode;
		confirm.innerHTML = "Submit";
		
		dragonblocks.getNode(x, y).meta.codeprompt = codeprompt;
	},
	onclick: (x, y) => {
		mesecons.x = x;
		mesecons.y = y;
		mesecons.id = "jscode" + (x + y);
		let codeprompt = dragonblocks.getNode(x, y).meta.codeprompt;
		codeprompt.open();
	},
	mesecons: (x, y, e) => {
		if (e.type == "mesecons" && e.msg == "on" && dragonblocks.getNode(x, y).meta.ready) {
			eval(dragonblocks.getNode(x, y).meta.code);
			dragonblocks.getNode(x, y).meta.ready = false;
		} else if (e.type == "mesecons" && e.msg == "off") dragonblocks.getNode(x, y).meta.ready = true;
	},
});
dragonblocks.registerNode({
	name: "mesecons:diode_off",
	stable: true,
	mobstable: false,
	texture: "diode_off.png",
	hardness: 3,
	desc: "Diode",
	onset: (x, y) => {
		if (!mesecons.traceSources(x, y, "right", "on")) mesecons.emit(x, y, "right", "off");
	},
	mesecons: async function(x, y, e) {
		if (e.type == "mesecons" && e.msg == "on" && mesecons.emitters[x - 1][y].state == "on") {
			await sleep(250);
			dragonblocks.setNode(x, y, "mesecons:diode_on");
		}
	},
});
dragonblocks.registerNode({
	name: "mesecons:diode_on",
	stable: true,
	mobstable: false,
	texture: "diode_on.png",
	hardness: 3,
	desc: "Diode (on)",
	drop: "mesecons:diode_off",
	hidden: true,
	onset: async function(x, y) {
		while (dragonblocks.getNode(x, y).name == "mesecons:diode_on") {
			mesecons.emit(x, y, "right", "on");
			await sleep(500);
		}
	},
	ondig: (x, y) => {
		if (!mesecons.traceSources(x, y, "right", "on")) mesecons.emit(x, y, "right", "off");
	},
	mesecons: async function(x, y, e) {
		if (e.type == "mesecons" && e.msg == "off" && mesecons.emitters[x - 1][y].state == "off") {
			await sleep(250);
			dragonblocks.setNode(x, y, "mesecons:diode_off");
		}
	},
});
mesecons.addSource(new mesecons.Source("mesecons:diode_on", false, true, false, false));
dragonblocks.registerNode({
	name: "mesecons:not_gate_off",
	stable: true,
	mobstable: false,
	texture: "not_gate_off.png",
	hardness: 3,
	desc: "Logic gate (not) (off)",
	drop: "mesecons:not_gate_on",
	hidden: true,
	onset: (x, y) => {
		if (!mesecons.traceSources(x, y, "right", "on")) mesecons.emit(x, y, "right", "off");
	},
	mesecons: async function(x, y, e) {
		if (e.type == "mesecons" && e.msg == "off" && mesecons.emitters[x - 1][y].state == "off") {
			await sleep(250);
			dragonblocks.setNode(x, y, "mesecons:not_gate_on");
		}
	},
});
dragonblocks.registerNode({
	name: "mesecons:not_gate_on",
	stable: true,
	mobstable: false,
	texture: "not_gate_on.png",
	hardness: 3,
	desc: "Logic gate (not)",
	onset: async function(x, y) {
		while (dragonblocks.getNode(x, y).name == "mesecons:not_gate_on") {
			mesecons.emit(x, y, "right", "on");
			await sleep(500);
		}
	},
	ondig: (x, y) => {
		if (!mesecons.traceSources(x, y, "right", "on")) mesecons.emit(x, y, "right", "off");
	},
	mesecons: async function(x, y, e) {
		if (e.type == "mesecons" && e.msg == "on" && mesecons.emitters[x - 1][y].state == "on") {
			await sleep(250);
			dragonblocks.setNode(x, y, "mesecons:not_gate_off");
		}
	},
});
mesecons.addSource(new mesecons.Source("mesecons:not_gate_on", false, true, false, false));
dragonblocks.registerNode({
	name: "mesecons:button_off",
	stable: true,
	mobstable: false,
	texture: "button_off.png",
	hardness: 5,
	desc: "Button",
	onset: (x, y) => {
		if (!mesecons.traceSources(x, y, "left", "on")) mesecons.emit(x, y, "left", "off");
		if (!mesecons.traceSources(x, y, "right", "on")) mesecons.emit(x, y, "right", "off");
		if (!mesecons.traceSources(x, y, "down", "on")) mesecons.emit(x, y, "down", "off");
		if (!mesecons.traceSources(x, y, "up", "on")) mesecons.emit(x, y, "up", "off");
	},
	onclick: (x, y) => {
		dragonblocks.setNode(x, y, "mesecons:button_on");
		dragonblocks.playSound("button_push.ogg");
	},
});
dragonblocks.registerNode({
	name: "mesecons:button_on",
	stable: true,
	mobstable: false,
	texture: "button_on.png",
	hardness: 5,
	desc: "Button (on)",
	drop: "mesecons:button_off",
	hidden: true,
	onset: async function(x, y) {
		setTimeout("dragonblocks.setNode(" + x + ", " + y + ", \"mesecons:button_off\"); dragonblocks.playSound(\"button_pop.ogg\");", 1000);
		while (dragonblocks.getNode(x, y).name == "mesecons:button_on") {
			mesecons.emit(x, y, "all", "on");
			await sleep(500);
		}
	},
	ondig: (x, y) => {
		if (!mesecons.traceSources(x, y, "left", "on")) mesecons.emit(x, y, "left", "off");
		if (!mesecons.traceSources(x, y, "right", "on")) mesecons.emit(x, y, "right", "off");
		if (!mesecons.traceSources(x, y, "down", "on")) mesecons.emit(x, y, "down", "off");
		if (!mesecons.traceSources(x, y, "up", "on")) mesecons.emit(x, y, "up", "off");
	},
});
mesecons.addSource(new mesecons.Source("mesecons:button_on", true, true, true, true));
