const process = require('process');
let AIParser = require('./AIParser');
let zh_CN = require('./zh_CN');
const fs = require('fs');

let expand = function (str, len) {
	str = String(str);
	return str + ' '.repeat(len - str.length);
}

let move = function (row, col) {
	process.stdout.write('\x1b[' + row + ';' + col + 'H');
};

let bar = function (val, str, c1, c2) {
	val = val ? val : 0;
	c2 = c2 ? c2 : '\x1b[40m';
	if (val == 0) {
		return c2 + str + '\x1b[40m';
	} else if (val == 1) {
		return c1 + str + '\x1b[40m';
	}
	let pos = Math.floor(val * str.length + 0.5);
	return c1 + str.substr(0, pos) + c2 + str.substr(pos) + '\x1b[40m';
};

let buildEff = function (eff, nc) {
	let effects = '';
	eff.forEach(t => {
		effects = effects + (zh_CN.key)(t.name, nc) + '[' + (t.expire == -1 ? '-' : t.expire) + '] ';
	});
	return effects;
};

module.exports = {
	init: function (hvauto) {
		hvauto.handleLog = t => {
			let zh = (zh_CN.log)(t);
			console.log(zh);
			// fs.appendFileSync('log.txt', t + '\n');
			// fs.appendFileSync('log_zh.txt', zh.replace(/\x1b\[\d\dm/g, '') + '\n');
		};
	},
	do: function (hvauto) {
		let battle = hvauto.battle;
		console.log('-'.repeat(60));
		process.stdout.write('\x1b[s');
		move(1, 1);
		process.stdout.write('\x1b[30m');
		process.stdout.write(bar(battle.healthp, expand(battle.health, 20), '\x1b[42m', '\x1b[47m'));
		process.stdout.write(bar(battle.manap, expand(battle.mana, 20), '\x1b[44m', '\x1b[47m'));
		process.stdout.write(bar(battle.spiritp, expand(battle.spirit, 20), '\x1b[41m', '\x1b[47m'));
		process.stdout.write(bar(battle.chargep, expand(battle.charge, 20), '\x1b[43m', '\x1b[47m'));
		process.stdout.write('\x1b[37m\x1b[K\n');
		if (battle.spirit_stance) {
			process.stdout.write('\x1b[31m灵动架势\x1b[37m ');
		}
		console.log(buildEff(battle.effect) + '\x1b[K');
		let round = '';
		if (battle.round.current) {
			round = expand(battle.round.current + ' / ' + battle.round.all, 15);
		}
		let act = AIParser(hvauto);
		console.log(round + act.msg + '\x1b[K');
		console.log('-'.repeat(80));
		for (let i = 0; i < hvauto.battle.monster.length; ++i) {
			move(i * 2 + 1, 81);
			let mon = hvauto.battle.monster[i];
			if (mon.isboss) {
				process.stdout.write('\x1b[43m\x1b[30m');
			}
			process.stdout.write(expand(i + 1, 5));
			process.stdout.write('\x1b[40m\x1b[37m');
			process.stdout.write(bar(mon.health, ' '.repeat(35), '\x1b[42m', '\x1b[47m'));
			move(i * 2 + 2, 81);
			process.stdout.write(' '.repeat(5) + buildEff(mon.effect) + '\x1b[K');
		}
		process.stdout.write('\x1b[u');
		return act.act;
	}
};