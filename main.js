const fetch = require('node-fetch');
let cheerio = require('cheerio');
let Buffer = require("buffer").Buffer;
let cookie = require('./cookie');
// cookie.js should be like below
// module.exports = "__cfduid=xxx;ipb_member_id=xxx;ipb_pass_hash=xxx";

function toBuffer(ab) {
	let buf = Buffer.alloc(ab.byteLength);
	let view = new Uint8Array(ab);
	for (let i = 0; i < buf.length; ++i) {
		buf[i] = view[i];
	}
	return buf;
}

async function requestPage(url) {
	let res = await fetch(url, {
		"headers": {
			"accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
			"accept-language": "zh-CN,zh;q=0.9,en-US;q=0.8,en;q=0.7",
			"cache-control": "max-age=0",
			"sec-fetch-dest": "document",
			"sec-fetch-mode": "navigate",
			"sec-fetch-site": "none",
			"sec-fetch-user": "?1",
			"upgrade-insecure-requests": "1",
			"cookie": cookie
		},
		"referrerPolicy": "no-referrer-when-downgrade",
		"body": null,
		"method": "GET",
		"mode": "cors"
	});
	let buf = toBuffer(await res.arrayBuffer());
	return buf.toString('utf-8');
}

async function requestJson(url, body) {
	let res = await fetch("https://hentaiverse.org/json", {
		"headers": {
			"accept": "*/*",
			"accept-language": "zh-CN,zh;q=0.9,en-US;q=0.8,en;q=0.7",
			"content-type": "application/json",
			"sec-fetch-dest": "empty",
			"sec-fetch-mode": "cors",
			"sec-fetch-site": "same-origin",
			"cookie": cookie
		},
		"referrer": "https://hentaiverse.org/?s=Battle&ss=ar",
		"referrerPolicy": "no-referrer-when-downgrade",
		"body": body,
		"method": "POST",
		"mode": "cors"
	});
	return res.json();
}

function parseBattle(str) {
	let data = {}
	let page = cheerio.load(str);
	page('html body #csp #mainpane script').each(function(i, e) {
		if (page(this).attr('src') == undefined) {
			data.token = /var battle_token = "([a-z0-9]+)";/.exec(page(this).html())[1]
			return false;
		}
	});
	data.health = page('html body #csp #mainpane #battle_main #battle_left #pane_vitals #vrhd').text()
	data.mana = page('html body #csp #mainpane #battle_main #battle_left #pane_vitals #vrm').text()
	data.spirit = page('html body #csp #mainpane #battle_main #battle_left #pane_vitals #vrs').text()
	data.monster = [];
	page('html body #csp #mainpane #battle_main #battle_right #pane_monster .btm1').each(function(i, e) {
		let obj = {}
		obj.level = page(this).children('.btm2').children('div').children('div').filter('.fac').children('div').text();
		obj.name = page(this).children('.btm3').children('div').filter('.fal').children('div').text();
		page(this).children('.btm4').children('.btm5').children('.chbd').children('img').each(function(i, e) {
			if (page(this).attr('alt') != null) {
				obj[page(this).attr('alt')] = /width:(\d+)px/.exec(page(this).attr('style'))[1];
			}
		});
		data.monster.push(obj);
	});
	return data;
}

function normalAttack(target, token) {
	return JSON.stringify({
		'method': 'action',
		'mode': 'attack',
		'skill': 0,
		'target': target,
		'token': token,
		'type': 'battle'
	});
}

function triggerSkill(target, skill, token) {
	const mapper = {
		'drain': 211,
		'imperil': 213,
		'cure': 311,
		'regen': 312,
		'protection': 411,
		'haste': 412,
		'shadow veil': 413,
		'absorb': 421,
		'scan': 1011,
		'shield bash': 2201,
		'vital strike': 2202,
		'merciful blow': 2203,
	};
	return JSON.stringify({
		'method': 'action',
		'mode': 'magic',
		'skill': mapper[skill],
		'target': target,
		'token': token,
		'type': 'battle'
	});
}

requestPage("https://hentaiverse.org/?s=Battle&ss=ar").then(async function (str) {
	// let page = cheerio.load(str);
	let data = parseBattle(str);
	console.log(data);
	let obj = await requestJson("https://hentaiverse.org/json", normalAttack(1, data.token));
	console.log(obj.textlog);
});