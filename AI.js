const process = require('process');
let AIParser = require('./AIParser');
let zh_CN = require('./zh_CN');

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
			console.log(zh_CN.log(t));
		};
	},
	do: function (hvauto) {
		let battle = hvauto.battle;
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
			round = expand(battle.round.current + ' / ' + battle.round.all, 10);
		}
		let act = AIParser(hvauto);
		console.log(round + '操作: ' + act.msg + '\x1b[K');
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
		/*
			if (battle.item[999]) {
				if (battle.item[999].name == 'Mana Gem' && battle.mana < 300) {
					console.log('Use mana gem');
					return hvauto.useItem(0, '999');
				} else if (battle.item[999].name == 'Health Gem' && battle.health < 4500) {
					console.log('Use health gem');
					return hvauto.useItem(0, '999');
				} else if (battle.item[999].name == 'Spirit Gem' && battle.spirit < 300) {
					console.log('Use spirit gem');
					return hvauto.useItem(0, '999');
				} else if (battle.item[999].name == 'Mystic Gem' && hvauto.findEffect('Channeling') == null) {
					console.log('Use mystic gem');
					return hvauto.useItem(0, '999');
				}
			}
			if (battle.health < 4000) {
				if (hvauto.findEffect('Regen') == null && battle.skills.Regen) {
					if (battle.mana >= battle.skills.Regen.mana && battle.skills.Regen.available) {
						console.log('Cast regen');
						return hvauto.triggerSkill(0, battle.skills.Regen.id);
					}
				}
			}
			if (battle.health < 2000) {
				if (battle.skills.Cure) {
					if (battle.mana >= battle.skills.Cure.mana && battle.skills.Cure.available) {
						console.log('Cast cure');
						return hvauto.triggerSkill(0, battle.skills.Cure.id);
					}
				}
			}
			if (battle.mana < 150 && hvauto.findEffect('Replenishment') == null) {
				let pos = hvauto.findItem('Mana Draught');
				if (pos == -1) {
					console.log('You don\'t take mana draught.');
				} else {
					if (battle.item[pos].available) {
						console.log('Use mana draught');
						return hvauto.useItem(0, pos);
					}
				}
			}
			if (!battle.spirit_stance && battle.spirit >= 200 && battle.charge >= 9) {
				console.log('Enable spirit');
				return hvauto.triggerSpirit();
			} else if (battle.spirit_stance && battle.spirit < 170) {
				console.log('Disable spirit');
				return hvauto.triggerSpirit();
			}
			if (hvauto.findEffect('Channeling') != null && hvauto.findEffect('Protection') == null) {
				if (battle.mana >= battle.skills.Protection.mana && battle.skills.Protection.available) {
					console.log('As channeling, cast protection');
					return hvauto.triggerSkill(0, battle.skills.Protection.id);
				}
			}
			let target = 0;
			for (let i = 0; i < battle.monster.length; ++i) {
				if (battle.monster[i].isboss) {
					target = i + 1;
				} else if (target == 0 && battle.monster[i].alive) {
					target = i + 1;
				}
			}
			console.log('Normal attack ' + target);
			return hvauto.normalAttack(target);
		*/
	}
};