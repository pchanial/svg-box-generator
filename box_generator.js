var layer = document.getElementById("layer1");

var TabTools = {
	/**
	 * Genere les elements d'un polygone
	 * svg pour des encoche d'approximativement
	 * <tab_width>, sur un longueur de <length>,
	 * pour un materiau d'epaisseur <thickness>.
	 *
	 * Options :
	 *  - direction : 0 haut de la face, 1 droite de la face, 2 bas de la face, 3 gauche de la face.
	 *  - firstUp : Indique si l'on demarre en haut d'un crenau (true) ou en bas du crenau (false - defaut)
	 *  - lastUp : Indique si l'on fin en haut d'un crenau (true) ou en bas du crenau (false - defaut)
	 **/
	tabs: function (length, tab_width, thickness, options) {

		//options management
		var opt = {
			direction: 0,
			firstUp: false,
			lastUp: false,
			inverted: false,
			backlash: 0

		};
		if (typeof options === 'object') {
			for (k in options) {
				opt[k] = options[k];
			}
		}
		if (typeof opt.backlash != 'number') {
			opt.backlash = 0;
		}

		//Calcultate tab size and number
		var nb_tabs = Math.floor(length / tab_width);
		nb_tabs = nb_tabs - 1 + (nb_tabs % 2);
		var tab_real_width = length / nb_tabs;

		//Check if no inconsistency on tab size and number
		console.debug(["Pour une largeur de", length, "et des encoches de", tab_width, "=> Nombre d'encoches :", nb_tabs, "Largeur d'encoche : ", tab_real_width].join(" "));

		if (tab_real_width <= thickness) {
			var msg = ["Attention les encoches resultantes sont moins large que votre materiaux (", largeur_encoche, " &lt; ", materiau, "). Merci d'utiliser une taille d'encoches coherente avec votre boite"].join(" ");
			alert(msg);
			throw (msg);
		}

		if (nb_tabs <= 1) {
			var msg = ["Attention vous n'aurez aucune encoche sur cette longeur, c'est une mauvaise idée !!! Indiquez une taill d'encoche correcte pour votre taille de boite"].join(" ");
			alert(msg);
			throw (msg);
		}

		return TabTools._rotate_path(TabTools._generate_tabs_path(tab_real_width, nb_tabs, thickness, options), opt.direction);

	},

	_generate_tabs_path: function (tab_width, nb_tabs, thickness, options) {
		//Generate path
		var points = [];
		for (var i = 1; i <= nb_tabs; i++) {
			if (options.inverted) {
				if (i % 2 == 1) { //tab
					if (i != 1 || !options.firstUp) {
						points.push([0, thickness]);
					}
					if (i == 1 || i == nb_tabs) {
						points.push([tab_width - (0.5 * options.backlash), 0]);
					} else {
						points.push([tab_width - options.backlash, 0]);
					}
					if (i != nb_tabs || !options.lastUp) {
						points.push([0, -thickness]);
					}
				} else { //gap
					points.push([tab_width + options.backlash, 0]);
				}

			} else {
				if (i % 2 == 1) { //gap
					if (i != 1 || !options.firstUp) {
						points.push([0, -thickness]);
					}
					if (i == 1 || i == nb_tabs) {
						points.push([tab_width + (0.5 * options.backlash), 0]);
					} else {
						points.push([tab_width + options.backlash, 0]);
					}
					if (i != nb_tabs || !options.lastUp) {
						points.push([0, thickness]);
					}
				} else { //tab
					points.push([tab_width - options.backlash, 0]);
				}
			}

		}
		return points;
	},

	_rotate_path: function (points, direction) {
		switch (direction) {
		case 1:
			return points.map(function (point) {
				return [-point[1], point[0]];
			});
		case 2:
			return points.map(function (point) {
				return [-point[0], -point[1]];
			});
		case 3:
			return points.map(function (point) {
				return [point[1], -point[0]];
			});
		default:
			return points;
		}
	}
};
var SvgTools = {
	mm2px: function (arr) {
		return arr.map(function (point) {
			return point.map(function (coord) {
				return coord * 90 / 25.4;
			});
		});
	},

	toPathString: function (arr) {
		return arr.map(function (point) {
			return point.join(",")
		}).join(" ");
	},
	addPath: function (str, id) {
		var shape = document.createElement("path");
		shape.setAttribute("style", "fill:#e3dbdb;stroke:#ff0000");
		shape.setAttribute("id", id);
		shape.setAttribute("transform", "translate(0,10.62992125984252)");
		shape.setAttribute("d", "m " + str + " z");
		layer.appendChild(shape);
	},
	clearPathAndLink: function () {
		var out = document.getElementById("out");
		out.innerHTML = "Chargement...";
		for (elt in document.getElementsByTagName) {
			elt.remove();
		}
	},
	downloadLink: function (width, depth, height, thickness) {
		var aFileParts = ['<?xml version="1.0" encoding="UTF-8" standalone="no"?>', document.getElementById("svg").innerHTML];
		var oMyBlob = new Blob(aFileParts, {
			type: 'image/svg+xml '
		});
		var out = document.getElementById("out");
		out.innerHTML = "";
		var link = document.createElement("a");
		link.innerHTML = (["Télécharger le fichier pour une boite de", width, "x", depth, "x", height, "en", thickness, "mm d'epaisseur"].join(" "));
		link.setAttribute("href", URL.createObjectURL(oMyBlob));
		link.setAttribute("download", "download");
		out.appendChild(link);
	}
};

var Box = {
	_bottom: function (width, depth, tab_width, thickness, backlash) {
		var points = [[0, 0]];
		points.push.apply(points, TabTools.tabs(width, tab_width, thickness, {
			direction: 0,
			backlash: backlash,
			firstUp: true,
			lastUp: true
		}));
		points.push.apply(points, TabTools.tabs(depth, tab_width, thickness, {
			direction: 1,
			backlash: backlash,
			firstUp: true,
			lastUp: true
		}));
		points.push.apply(points, TabTools.tabs(width, tab_width, thickness, {
			direction: 2,
			backlash: backlash,
			firstUp: true,
			lastUp: true
		}));
		points.push.apply(points, TabTools.tabs(depth, tab_width, thickness, {
			direction: 3,
			backlash: backlash,
			firstUp: true,
			lastUp: true
		}));
		return points;
	},
	_front_without_top: function (width, height, tab_width, thickness, backlash) {
		var points = [[0, 0], [width, 0]];
		points.push.apply(points, TabTools.tabs(height - thickness, tab_width, thickness, {
			direction: 1,
			backlash: backlash,
			firstUp: true,
			lastUp: true
		}));
		points.push.apply(points, TabTools.tabs(width, tab_width, thickness, {
			direction: 2,
			backlash: backlash,
			firstUp: true,
			lastUp: true,
			inverted: true
		}));
		points.push.apply(points, TabTools.tabs(height - thickness, tab_width, thickness, {
			direction: 3,
			backlash: backlash,
			firstUp: true,
			lastUp: true
		}));
		return points;
	},
	_front_with_top: function (width, height, tab_width, thickness, backlash) {
		var points = [[0, thickness]];

		points.push.apply(points, TabTools.tabs(width, tab_width, thickness, {
			direction: 0,
			backlash: backlash,
			firstUp: true,
			lastUp: true,
			inverted: true
		}));
		points.push.apply(points, TabTools.tabs(height - (thickness * 2), tab_width, thickness, {
			direction: 1,
			backlash: backlash,
			firstUp: true,
			lastUp: true
		}));
		points.push.apply(points, TabTools.tabs(width, tab_width, thickness, {
			direction: 2,
			backlash: backlash,
			firstUp: true,
			lastUp: true,
			inverted: true
		}));
		points.push.apply(points, TabTools.tabs(height - (thickness * 2), tab_width, thickness, {
			direction: 3,
			backlash: backlash,
			firstUp: true,
			lastUp: true
		}));
		return points;
	},
	_side_without_top: function (depth, height, tab_width, thickness, backlash) {
		var points = [[thickness, 0], [depth - (2 * thickness), 0]];
		points.push.apply(points, TabTools.tabs(height - thickness, tab_width, thickness, {
			direction: 1,
			backlash: backlash,
			firstUp: true,
			lastUp: true,
			inverted: true
		}));
		points.push.apply(points, TabTools.tabs(depth, tab_width, thickness, {
			direction: 2,
			backlash: backlash,
			firstUp: true,
			lastUp: true,
			inverted: true
		}));
		points.push.apply(points, TabTools.tabs(height - thickness, tab_width, thickness, {
			direction: 3,
			backlash: backlash,
			firstUp: true,
			lastUp: true,
			inverted: true
		}));
		return points;
	},
	_side_with_top: function (depth, height, tab_width, thickness, backlash) {
		var points = [[thickness, thickness]];
		points.push.apply(points, TabTools.tabs(depth, tab_width, thickness, {
			direction: 0,
			backlash: backlash,
			firstUp: true,
			lastUp: true,
			inverted: true
		}));
		points.push.apply(points, TabTools.tabs(height - (2 * thickness), tab_width, thickness, {
			direction: 1,
			backlash: backlash,
			firstUp: true,
			lastUp: true,
			inverted: true
		}));
		points.push.apply(points, TabTools.tabs(depth, tab_width, thickness, {
			direction: 2,
			backlash: backlash,
			firstUp: true,
			lastUp: true,
			inverted: true
		}));
		points.push.apply(points, TabTools.tabs(height - (2 * thickness), tab_width, thickness, {
			direction: 3,
			backlash: backlash,
			firstUp: true,
			lastUp: true,
			inverted: true
		}));
		return points;
	},
	withTop: function (width, depth, height, tab_size, thickness, backlash) {
		SvgTools.clearPathAndLink();
		SvgTools.addPath(SvgTools.toPathString(SvgTools.mm2px(Box._front_with_top(width, height, tab_size, thickness, backlash))), 'font');
		SvgTools.addPath(SvgTools.toPathString(SvgTools.mm2px(Box._side_with_top(depth, height, tab_size, thickness, backlash))), 'left_side');
		SvgTools.addPath(SvgTools.toPathString(SvgTools.mm2px(Box._bottom(width, depth, tab_size, thickness, backlash))), 'bottom');
		SvgTools.downloadLink(width, depth, height, thickness);
	},
	withoutTop: function (width, depth, height, tab_size, thickness, backlash) {
		SvgTools.clearPathAndLink();
		SvgTools.addPath(SvgTools.toPathString(SvgTools.mm2px(Box._front_without_top(width, height, tab_size, thickness, backlash))), 'font');
		SvgTools.addPath(SvgTools.toPathString(SvgTools.mm2px(Box._side_without_top(depth, height, tab_size, thickness, backlash))), 'left_side');
		SvgTools.addPath(SvgTools.toPathString(SvgTools.mm2px(Box._bottom(width, depth, tab_size, thickness, backlash))), 'bottom');
		SvgTools.downloadLink(width, depth, height, thickness);
	}
};


function value_of(id) {
	var v = parseFloat(document.getElementById(id).value);
	if (isNaN(v)) {
		throw (id + " is not a number : " + document.getElementById(id).value);
	} else {
		return v;
	}
}

function generate_box() {
	try {
		if (document.getElementById('closed').checked) {
			Box.withTop(value_of('width'), value_of('depth'), value_of('height'), value_of('tabs'), value_of('thickness'), value_of('backlash'));
		} else {
			Box.withoutTop(value_of('width'), value_of('depth'), value_of('height'), value_of('tabs'), value_of('thickness'), value_of('backlash'));
		}
	} catch (e) {
		console.error(e);
		document.getElementById("out").innerHTML = "";
		alert('Impossible de générer la boite demandée');

	}
}