const fetch = require('node-fetch');
let cheerio = require('cheerio');
let process = require('process');
let exec = require('child_process').exec;
let Buffer = require('buffer').Buffer;
let hvauto = {};

hvauto.root = "https://hentaiverse.org/";

hvauto.battle = {};

hvauto.request = async function (url, opt) {
	let res;
	for (;;) {
		try {
			res = await fetch(url, opt);
			break;
		} catch (e) {
			console.log('Request ' + url + ' failed, error: ' + e + '. Retrying...');
		}
	}
	return res;
}

hvauto.requestPage = async function (url) {
	let res = await hvauto.request(url, {
		"headers": {
			"accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
			"accept-language": "zh-CN,zh;q=0.9,en-US;q=0.8,en;q=0.7",
			"cache-control": "max-age=0",
			"sec-fetch-dest": "document",
			"sec-fetch-mode": "navigate",
			"sec-fetch-site": "none",
			"sec-fetch-user": "?1",
			"upgrade-insecure-requests": "1",
			"user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/84.0.4147.89 Safari/537.36",
			"cookie": hvauto.cookie
		},
		"referrerPolicy": "no-referrer-when-downgrade",
		"body": null,
		"method": "GET",
		"mode": "cors"
	});
	let ab = await res.arrayBuffer();
	let buf = Buffer.alloc(ab.byteLength);
	let view = new Uint8Array(ab);
	for (let i = 0; i < buf.length; ++i) {
		buf[i] = view[i];
	}
	return buf.toString('utf-8');
};

hvauto.requestJson = async function (body) {
	let res = await hvauto.request("https://hentaiverse.org/json", {
		"headers": {
			"accept": "*/*",
			"accept-language": "zh-CN,zh;q=0.9,en-US;q=0.8,en;q=0.7",
			"content-type": "application/json",
			"sec-fetch-dest": "empty",
			"sec-fetch-mode": "cors",
			"sec-fetch-site": "same-origin",
			"user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/84.0.4147.89 Safari/537.36",
			"cookie": hvauto.cookie
		},
		"referrer": "https://hentaiverse.org/",
		"referrerPolicy": "no-referrer-when-downgrade",
		"body": JSON.stringify(body),
		"method": "POST",
		"mode": "cors"
	});
	let obj = res.json();
	return obj;
};

hvauto.parseEffectScript = function (script) {
	let mat = /^battle.set_infopane_effect\('(.+)', '(.+)', (.+)\)$/.exec(script);
	let expire = -1;
	if (mat[3] != '\'autocast\'') {
		expire = Number(mat[3]);
	}
	return {
		'name': mat[1],
		'desc': mat[2],
		'expire': expire
	};
};

hvauto.parseSpellScript = function (script) {
	let mat = /^battle.set_infopane_spell\('(.+)', '(.+)', '.+', (.+), (.+), (.+)\)$/.exec(script);
	return {
		'name': mat[1],
		'desc': mat[2],
		'mana': Number(mat[3]),
		'charge': Number(mat[4]),
		'cooldown': Number(mat[5])
	};
};

hvauto.init = async function (cookie) {
	hvauto.cookie = cookie;
	let $ = cheerio.load(await hvauto.requestPage(hvauto.root));
	if ($('#mainpane').children('#battle_top').length > 0) {
		hvauto.battle.token = /var battle_token = "([a-z0-9]+)";/.exec($('#mainpane').children('script').eq(1).html())[1];
		hvauto.battle.charge = 0;
		$('#vcp').children('div').children().each(function (i, e) {
			if ($(this).attr('id') == 'vcr') {
				hvauto.battle.charge += 0.5;
			} else {
				hvauto.battle.charge += 1;
			}
		});
		if ($('#vrhb').length > 0) {
			hvauto.battle.health = $('#vrhb').text();
		} else {
			hvauto.battle.health = $('#vrhd').text(); // This seems used when Spark of Life is active
		}
		hvauto.battle.mana = $('#vrm').text();
		hvauto.battle.spirit = $('#vrs').text();
		hvauto.battle.skills = {}; // both skills and magic are in it
		$('#table_skills .bts').children('div').each(function (i, e) {
			let obj = hvauto.parseSpellScript($(this).attr('onmouseover'));
			obj.id = Number($(this).attr('id'));
			obj.available = $(this).attr('style') != 'opacity:0.5';
			hvauto.battle.skills[obj.name] = obj;
		});
		$('#table_magic .bts').children('div').each(function (i, e) {
			let obj = hvauto.parseSpellScript($(this).attr('onmouseover'));
			obj.id = Number($(this).attr('id'));
			obj.available = $(this).attr('style') != 'opacity:0.5';
			hvauto.battle.skills[obj.name] = obj;
		});
		hvauto.battle.effect = [];
		$('#pane_effects img').each(function (i, e) {
			hvauto.battle.effect.push(hvauto.parseEffectScript($(this).attr('onmouseover')));
		});
		hvauto.battle.item = {};
		if ($('#pane_item').children('.bti1').children('.bti3').children().length > 0) {
			let obj = {
				'id': 999
			};
			obj.name = $('#pane_item').children('.bti1').children('.bti3').children().children().children().text();
			obj.available = $('#pane_item').children('.bti1').children('.bti3').children().attr('onclick') != undefined;
			hvauto.battle.item[999] = obj;
		}
		$('#pane_item').children('.c').children().children('.c').children('.bti1').each(function (i, e) {
			let obj = {};
			obj.id = Number($(this).children('.bti2').children().children().text());
			if ($(this).children('.bti3').children().length == 0) {
				return true;
			}
			obj.name = $(this).children('.bti3').children().children().children().text();
			obj.available = $(this).children('.bti3').children().attr('onclick') != undefined;
			hvauto.battle.item[obj.id] = obj;
		});
		hvauto.battle.monster = [];
		$('#pane_monster').children('.btm1').each(function (i, e) {
			let obj = {};
			obj.level = $(this).children('.btm2').children('div').children('div').filter('.fac').children('div').text();
			obj.name = $(this).children('.btm3').children('div').filter('.fal').children('div').text();
			$(this).children('.btm4').children('.btm5').children('.chbd').children('img').each(function (i, e) {
				if ($(this).attr('alt') != null) {
					obj[$(this).attr('alt')] = /width:(\d+)px/.exec($(this).attr('style'))[1];
				}
			});
			obj.isboss = $(this).attr('style') != undefined;
			obj.effect = [];
			$(this).children('.btm6').children('img').each(function (i, e) {
				obj.effect.push(hvauto.parseEffectScript($(this).attr('onmouseover')));
			});
			obj.alive = obj.health != undefined;
			hvauto.battle.monster.push(obj);
		});
		hvauto.battle.log = [];
		$('#textlog td').each(function (i, e) {
			let text = $(this).text();
			hvauto.battle.log.push(text);
			let mat = /^Initializing .+\(Round ([0-9]+) \/ ([0-9]+)\) ...$/.exec(text); // seems not work yet
			hvauto.battle.round = {};
			if (mat != null) {
				hvauto.battle.round.current = Number(mat[1]);
				hvauto.battle.round.all = Number(mat[2]);
			}
		});
		hvauto.battle.log.reverse();
		if (hvauto.handleLog != undefined) {
			hvauto.battle.log.forEach(hvauto.handleLog);
		}
		return true;
	} else if ($('#mainpane').children('#riddlemaster').length > 0) {
		console.log('Riddle master appear!!! Open your browser and finish it.');
		switch (process.platform) {
			case 'win32':
				exec('start ' + hvauto.root);
				break;
			case 'darwin':
				exec('open ' + hvauto.root);
				break;
			default:
				exec('xdg-open ' + hvauto.root);
		}
		return false;
	} else {
		return false;
	}
};

hvauto.normalAttack = function (target) {
	return {
		'method': 'action',
		'mode': 'attack',
		'skill': 0,
		'target': target,
		'token': hvauto.battle.token,
		'type': 'battle'
	};
};

hvauto.triggerSkill = function (target, skill) {
	return {
		'method': 'action',
		'mode': 'magic',
		'skill': skill,
		'target': target,
		'token': hvauto.battle.token,
		'type': 'battle'
	};
};

hvauto.itemInfo = {
	'Health Gem': {
		'id': 10005,
		'desc': 'This powerup will restore a large amount of health.'
	},
	'Mana Gem': {
		'id': 10006,
		'desc': 'This powerup will restore a moderate amount of mana.'
	},
	'Spirit Gem': {
		'id': 10007,
		'desc': 'This powerup will restore a small amount of spirit.'
	},
	'Mystic Gem': {
		'id': 10008,
		'desc': 'This powerup will grant you the Channeling effect.'
	},
	'Health Draught': {
		'id': 11191,
		'desc': 'Provides a long-lasting health restoration effect.'
	},
	'Health Potion': {
		'id': 11195,
		'desc': 'Instantly restores a large amount of health.'
	},
	'Health Elixir': {
		'id': 11199,
		'desc': 'Fully restores health, and grants a long-lasting health restoration effect.'
	},
	'Mana Draught': {
		'id': 11291,
		'desc': 'Provides a long-lasting mana restoration effect.'
	},
	'Mana Potion': {
		'id': 11295,
		'desc': 'Instantly restores a moderate amount of mana.'
	},
	'Mana Elixir': {
		'id': 11299,
		'desc': 'Fully restores mana, and grants a long-lasting mana restoration effect.'
	},
	'Spirit Draught': {
		'id': 11391,
		'desc': 'Provides a long-lasting spirit restoration effect.'
	},
	'Spirit Potion': {
		'id': 11395,
		'desc': 'Instantly restores a moderate amount of spirit.'
	},
	'Spirit Elixir': {
		'id': 11399,
		'desc': 'Fully restores spirit, and grants a long-lasting spirit restoration effect.'
	},
	'Energy Drink': {
		'id': 11401,
		'desc': 'Restores 10 points of Stamina, up to the maximum of 99. When used in battle, also boosts Overcharge and Spirit by 10% for ten turns.'
	},
	'Caffeinated Candy': {
		'id': 11402,
		'desc': 'Restores 5 points of Stamina, up to the maximum of 99. When used in battle, also boosts Overcharge and Spirit by 10% for five turns.'
	},
	'Last Elixir': {
		'id': 11501,
		'desc': 'Fully restores all vitals, and grants long-lasting restoration effects.'
	},
	'Infusion of Flames': {
		'id': 12101,
		'desc': 'You gain +25% resistance to Fire elemental attacks and do 25% more damage with Fire magicks.'
	},
	'Infusion of Frost': {
		'id': 12201,
		'desc': 'You gain +25% resistance to Cold elemental attacks and do 25% more damage with Cold magicks.'
	},
	'Infusion of Lightning': {
		'id': 12301,
		'desc': 'You gain +25% resistance to Elec elemental attacks and do 25% more damage with Elec magicks.'
	},
	'Infusion of Storms': {
		'id': 12401,
		'desc': 'You gain +25% resistance to Wind elemental attacks and do 25% more damage with Wind magicks.'
	},
	'Infusion of Divinity': {
		'id': 12501,
		'desc': 'You gain +25% resistance to Holy elemental attacks and do 25% more damage with Holy magicks.'
	},
	'Infusion of Darkness': {
		'id': 12601,
		'desc': 'You gain +25% resistance to Dark elemental attacks and do 25% more damage with Dark magicks.'
	},
	'Scroll of Swiftness': {
		'id': 13101,
		'desc': 'Grants the Haste effect.'
	},
	'Scroll of Protection': {
		'id': 13111,
		'desc': 'Grants the Protection effect.'
	},
	'Scroll of the Avatar': {
		'id': 13199,
		'desc': 'Grants the Haste and Protection effects with twice the normal duration.'
	},
	'Scroll of Absorption': {
		'id': 13201,
		'desc': 'Grants the Absorb effect.'
	},
	'Scroll of Shadows': {
		'id': 13211,
		'desc': 'Grants the Shadow Veil effect.'
	},
	'Scroll of Life': {
		'id': 13221,
		'desc': 'Grants the Spark of Life effect.'
	},
	'Scroll of the Gods': {
		'id': 13299,
		'desc': 'Grants the Absorb, Shadow Veil and Spark of Life effects with twice the normal duration.'
	},
	'Flower Vase': {
		'id': 19111,
		'desc': 'There are three flowers in a vase. The third flower is green.'
	},
	'Bubble-Gum': {
		'id': 19131,
		'desc': 'It is time to kick ass and chew bubble-gum... and here is some gum.'
	}
};

hvauto.useItem = function (target, item) { // maybe scrolls will use target.
	return {
		'method': 'action',
		'mode': 'items',
		'skill': item,
		'target': target,
		'token': hvauto.battle.token,
		'type': 'battle'
	};
};

hvauto.findEffect = function (name) {
	let target = null;
	hvauto.battle.effect.forEach(t => {
		if (t.name == name) {
			target = t;
			return false;
		}
	});
	return target;
}

hvauto.findItem = function (name) {
	for (let key in hvauto.battle.item) {
		if (hvauto.battle.item[key].name == name) {
			return key;
		}
	}
	return -1;
};

hvauto.doAction = async function (obj) {
	let res = await hvauto.requestJson(obj);
	let $ = null;

	$ = cheerio.load(res['pane_effects']);
	hvauto.battle.effect = [];
	$('img').each(function (i, e) {
		hvauto.battle.effect.push(hvauto.parseEffectScript($(this).attr('onmouseover')));
	});

	$ = cheerio.load(res['pane_vitals']);
	if ($('#vrhb').length > 0) {
		hvauto.battle.health = $('#vrhb').text();
	} else {
		hvauto.battle.health = $('#vrhd').text(); // This seems used when Spark of Life is active
	}
	hvauto.battle.mana = $('#vrm').text();
	hvauto.battle.spirit = $('#vrs').text();

	hvauto.battle.skills = {}; // both skills and magic are in i
	$ = cheerio.load('<table>' + res['table_skills'] + '</table>');
	$('.bts').children('div').each(function (i, e) {
		let obj = hvauto.parseSpellScript($(this).attr('onmouseover'));
		obj.id = Number($(this).attr('id'));
		obj.available = $(this).attr('style') != 'opacity:0.5';
		hvauto.battle.skills[obj.name] = obj;
	});
	
	$ = cheerio.load('<table>' + res['table_magic'] + '</table>');
	$('.bts').children('div').each(function (i, e) {
		let obj = hvauto.parseSpellScript($(this).attr('onmouseover'));
		obj.id = Number($(this).attr('id'));
		obj.available = $(this).attr('style') != 'opacity:0.5';
		hvauto.battle.skills[obj.name] = obj;
	});

	if (res['pane_item']) {
		hvauto.battle.item = {};
		$ = cheerio.load('<div id="root">' + res['pane_item'] + '</div>'); // Introduce a root

		if ($('#root').children('.bti1').children('.bti3').children().length > 1) {
			let obj = {
				'id': 999
			};
			let name = $('#root').children('.bti1').children('.bti3').children().children().children().text();
			obj.name = name;
			obj.available = $('#root').children('.bti1').children('.bti3').children().attr('onclick') != undefined;
			hvauto.battle.item[999] = obj;
		}
		$('#root').children('.c').children().children('.c').children('.bti1').each(function (i, e) {
			let obj = {};
			obj.id = Number($(this).children('.bti2').children().children().text());
			if ($(this).children('.bti3').children().length == 0) {
				return true;
			}
			obj.name = $(this).children('.bti3').children().children().children().text();
			obj.available = $(this).children('.bti3').children().attr('onclick') != undefined;
			hvauto.battle.item[obj.id] = obj;
		});
	}

	$ = cheerio.load(res['pane_monster']);
	hvauto.battle.monster = [];
	$('.btm1').each(function (i, e) {
		let obj = {};
		obj.level = $(this).children('.btm2').children('div').children('div').filter('.fac').children('div').text();
		obj.name = $(this).children('.btm3').children('div').filter('.fal').children('div').text();
		$(this).children('.btm4').children('.btm5').children('.chbd').children('img').each(function (i, e) {
			if ($(this).attr('alt') != null) {
				obj[$(this).attr('alt')] = /width:(\d+)px/.exec($(this).attr('style'))[1];
			}
		});
		obj.effect = [];
		$(this).children('.btm6').children('img').each(function (i, e) {
			obj.effect.push(hvauto.parseEffectScript($(this).attr('onmouseover')));
		});
		obj.alive = obj.health != undefined;
		hvauto.battle.monster.push(obj);
	});

	res['textlog'].forEach(t => {
		let text = t['t'];
		hvauto.battle.log.push(text);
		if (hvauto.handleLog != undefined) {
			hvauto.handleLog(text);
		}
	});

	let stillRunning = false;
	hvauto.battle.monster.forEach(t => {
		if (t.alive) {
			stillRunning = true;
			return false;
		}
	});

	return stillRunning;
};

module.exports = hvauto;