const fs = require('fs');
const { abort } = require('process');

let rule = fs.readFileSync('AI.txt').toString().split(/\r?\n/);

let rules = [];

let tempRule = {
	src: [],
	precond: [],
	action: null
};

const op = {
	'<': (a, b) => a < b,
	'>': (a, b) => a > b,
	'<=': (a, b) => a <= b,
	'>=': (a, b) => a >= b,
	'=': (a, b) => a == b,
	'!=': (a, b) => a != b
}

rule.forEach(row => {
	if (/^[ \t]*$/.exec(row)) {
		return;
	}
	row = row.replace(/^[\t ]*/, '');
	row = row.replace(/[\t ]*$/, '');
	tempRule.src.push(row);
	if (/^HAS '.+'$/.exec(row)) {
		tempRule.precond.push((() => {
			let item = /^HAS '(.+)'$/.exec(row)[1];
			return (hvauto) => {
				return hvauto.battle.item[999] && hvauto.battle.item[999].name == item;
			};
		})());
		return;
	}
	if (/^\S+ (?:<|>|<=|>=|=|!=) [.\d]+$/.exec(row)) {
		tempRule.precond.push((() => {
			let mat = /^(health|mana|spirit|charge) (<|>|<=|>=|=|!=) ([.\d]+)$/.exec(row);
			return (hvauto) => {
				return (op[mat[2]])(hvauto.battle[mat[1]], Number(mat[3]));
			};
		})());
		return;
	}
	if (/^EFF '.+'$/.exec(row)) {
		tempRule.precond.push((() => {
			let item = /^EFF '(.+)'$/.exec(row)[1];
			return (hvauto) => {
				return hvauto.findEffect(item) != null;
			};
		})());
		return;
	}
	if (/^NOEFF '.+'$/.exec(row)) {
		tempRule.precond.push((() => {
			let item = /^NOEFF '(.+)'$/.exec(row)[1];
			return (hvauto) => {
				return hvauto.findEffect(item) == null;
			};
		})());
		return;
	}
	if (/^USE '.+'$/.exec(row)) {
		tempRule.action = (() => {
			let item = /^USE '(.+)'$/.exec(row)[1];
			return (hvauto) => {
				let pos = hvauto.findItem(item);
				if (pos == -1) {
					console.log('You don\'t have ' + item);
				} else {
					if (hvauto.battle.item[pos].available) {
						return { 
							act: hvauto.useItem(0, pos),
							msg: 'use ' + item
						};
					}
				}
				return null;
			};
		})();
		rules.push(tempRule);
		tempRule = {
			src: [],
			precond: [],
			action: null
		};
		return;
	}
	if (/^CAST '.+'$/.exec(row)) {
		tempRule.action = (() => {
			let skill = /^CAST '(.+)'$/.exec(row)[1];
			return (hvauto) => {
				if (hvauto.battle.skills[skill]) {
					let sk = hvauto.battle.skills[skill];
					if (hvauto.battle.mana >= sk.mana && hvauto.battle.charge >= sk.charge && sk.available) {
						return {
							act: hvauto.triggerSkill(0, sk.id),
							msg: 'cast ' + skill
						};
					}
				}
				return null;
			};
		})();
		rules.push(tempRule);
		tempRule = {
			src: [],
			precond: [],
			action: null
		};
		return;
	}
	switch (row) {
		case 'SPIRIT':
			tempRule.precond.push((hvauto) => { return hvauto.battle.spirit_stance; });
			return;
		case 'NOTSPIRIT':
			tempRule.precond.push((hvauto) => { return !hvauto.battle.spirit_stance; });
			return;
		case 'USE ITEMP':
			tempRule.action = (hvauto) => {
				return { 
					act: hvauto.useItem(0, '999'),
					msg: 'use itemp'
				};
			};
			rules.push(tempRule);
			tempRule = {
				src: [],
				precond: [],
				action: null
			};
			return;
		case 'TRIGSPIRIT':
			tempRule.action = (hvauto) => {
				return {
					act: hvauto.triggerSpirit(),
					msg: 'trigger spirit'
				};
			};
			rules.push(tempRule);
			tempRule = {
				src: [],
				precond: [],
				action: null
			};
			return;
		case 'ATTACK':
			tempRule.action = (hvauto) => {
				let target = 0;
				let preh = 2;
				for (let i = 0; i < hvauto.battle.monster.length; ++i) {
					if (!hvauto.battle.monster[i].alive) {
						continue;
					}
					if (hvauto.battle.monster[i].isboss) {
						target = i + 1;
						break;
					} else if (hvauto.battle.monster[i].health < preh) {
						target = i + 1;
						preh = hvauto.battle.monster[i].health;
					}
				}
				return {
					act: hvauto.normalAttack(target),
					msg: 'attack ' + target
				};
			};
			rules.push(tempRule);
			tempRule = {
				src: [],
				precond: [],
				action: null
			};
			return;
	}
	console.log('Unknown action/condition <' + row + '>');
	abort();
});

module.exports = function (hvauto) {
	for (let i in rules) {
		let r = rules[i];
		let ok = true;
		for (let j in r.precond) {
			// console.log(r.src[j])
			if (!r.precond[j](hvauto)) {
				// console.log('failed');
				ok = false;
				break;
			}
			// console.log('pass');
		}
		if (ok) {
			// console.log(r.src[r.precond.length]);
			let action = r.action(hvauto);
			if (action) {
				// console.log('pass');
				return action;
			}
			// console.log('failed');
		}
	}
	console.log('No action!!!');
	abort();
	return null;
};