const fetch = require('node-fetch');
let cheerio = require('cheerio');
let Buffer = require("buffer").Buffer;
let hvcookie = "";
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
			"cookie": hvcookie
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
			"cookie": hvcookie
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
	hvcookie = cookie;
	let $ = cheerio.load(await hvauto.requestPage(hvauto.root));
	if ($('#mainpane').children('#battle_top').length > 0) {
		hvauto.battle.token = /var battle_token = "([a-z0-9]+)";/.exec($('#mainpane').children('script').eq(1).html())[1];
		hvauto.battle.charge = 0;
		$('#vcp').children('div').children().each(function(i, e) {
			if ($(this).attr('id') == 'vcr') {
				hvauto.battle.charge += 0.5;
			} else {
				hvauto.battle.charge += 1;
			}
		});
		hvauto.battle.health = $('#vrhd').text();
		hvauto.battle.mana = $('#vrm').text();
		hvauto.battle.spirit = $('#vrs').text();
		hvauto.battle.skills = {}; // both skills and magic are in it
		$('#table_skills .bts').children('div').each(function(i, e) {
			let obj = hvauto.parseSpellScript($(this).attr('onmouseover'));
			obj.id = Number($(this).attr('id'));
			obj.available = $(this).attr('style') != 'opacity:0.5';
			hvauto.battle.skills[obj.name] = obj;
		});
		$('#table_magic .bts').children('div').each(function(i, e) {
			let obj = hvauto.parseSpellScript($(this).attr('onmouseover'));
			obj.id = Number($(this).attr('id'));
			obj.available = $(this).attr('style') != 'opacity:0.5';
			hvauto.battle.skills[obj.name] = obj;
		});
		hvauto.battle.effect = [];
		$('#pane_effects img').each(function(i, e) {
			hvauto.battle.effect.push(hvauto.parseEffectScript($(this).attr('onmouseover')));
		});
		hvauto.battle.monster = [];
		$('#pane_monster').children('.btm1').each(function(i, e) {
			let obj = {};
			obj.level = $(this).children('.btm2').children('div').children('div').filter('.fac').children('div').text();
			obj.name = $(this).children('.btm3').children('div').filter('.fal').children('div').text();
			$(this).children('.btm4').children('.btm5').children('.chbd').children('img').each(function(i, e) {
				if ($(this).attr('alt') != null) {
					obj[$(this).attr('alt')] = /width:(\d+)px/.exec($(this).attr('style'))[1];
				}
			});
			obj.effect = [];
			$(this).children('.btm6').children('img').each(function(i, e) {
				obj.effect.push(hvauto.parseEffectScript($(this).attr('onmouseover')));
			});
			obj.alive = obj.health != undefined;
			hvauto.battle.monster.push(obj);
		});
		hvauto.battle.log = [];
		$('#textlog td').each(function(i, e) {
			let text = $(this).text();
			hvauto.battle.log.push(text);
			let mat = /^Initializing .+\(Round ([0-9]+) \/ ([0-9]+)\)$/.exec(text); // seems not work yet
			if (mat != null) {
				hvauto.battle.round.current = Number(mat[1]);
				hvauto.battle.round.all = Number(mat[2]);
				console.log('Locate round infomation ' + hvauto.battle.round.current + ' / ' + hvauto.battle.round.all);
			}
		});
		hvauto.battle.log.reverse();
		if (hvauto.handleLog != undefined) {
			hvauto.battle.log.forEach(hvauto.handleLog);
		}
		return true;
	} else if ($('#mainpane').children('#riddlemaster').length > 0) {
		console.log('Riddle master appear!!! Open your browser and finish it.');
		return false;
	} else {
		console.log('You are not in a battle');
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

hvauto.doAction = async function (obj) {
	let res = await hvauto.requestJson(obj);
	let $ = cheerio.load(res['pane_effects']);
	hvauto.battle.effect = [];
	$('img').each(function(i, e) {
		hvauto.battle.effect.push(hvauto.parseEffectScript($(this).attr('onmouseover')));
	});
	
	$ = cheerio.load(res['pane_vitals']);
	hvauto.battle.health = $('#vrhd').text();
	hvauto.battle.mana = $('#vrm').text();
	hvauto.battle.spirit = $('#vrs').text();

	hvauto.battle.skills = {}; // both skills and magic are in it
	$ = cheerio.load('<table>' + res['table_skills'] + '</table>');
	$('.bts').children('div').each(function(i, e) {
		let obj = hvauto.parseSpellScript($(this).attr('onmouseover'));
		obj.id = Number($(this).attr('id'));
		obj.available = $(this).attr('style') != 'opacity:0.5';
		hvauto.battle.skills[obj.name] = obj;
	});
	$ = cheerio.load('<table>' + res['table_magic'] + '</table>');
	$('.bts').children('div').each(function(i, e) {
		let obj = hvauto.parseSpellScript($(this).attr('onmouseover'));
		obj.id = Number($(this).attr('id'));
		obj.available = $(this).attr('style') != 'opacity:0.5';
		hvauto.battle.skills[obj.name] = obj;
	});

	$ = cheerio.load(res['pane_monster']);
	hvauto.battle.monster = [];
	$('.btm1').each(function(i, e) {
		let obj = {};
		obj.level = $(this).children('.btm2').children('div').children('div').filter('.fac').children('div').text();
		obj.name = $(this).children('.btm3').children('div').filter('.fal').children('div').text();
		$(this).children('.btm4').children('.btm5').children('.chbd').children('img').each(function(i, e) {
			if ($(this).attr('alt') != null) {
				obj[$(this).attr('alt')] = /width:(\d+)px/.exec($(this).attr('style'))[1];
			}
		});
		obj.effect = [];
		$(this).children('.btm6').children('img').each(function(i, e) {
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