const fs = require('fs');
const {
	abort
} = require('process');

let rule = fs.readFileSync('AI.txt').toString().split(/\r?\n/);

let rules = [];
let conds = [];
let filts = [];

const op = {
	'<': (a, b) => a < b,
	'>': (a, b) => a > b,
	'<=': (a, b) => a <= b,
	'>=': (a, b) => a >= b,
	'=': (a, b) => a == b,
	'!=': (a, b) => a != b
};

let dumpMonster = (hvauto) => {
	let mon = [];
	hvauto.battle.monster.forEach(t => {
		if (t.alive) {
			mon.push(t);
		}
	});
	return [ mon ];
};

let applyCond = (hvauto, mons, cond, drop) => {
	let mon = [];
	mons.forEach(a => {
		let y = [], n = [];
		a.forEach(m => {
			if (cond(m)) {
				y.push(m);
			} else {
				n.push(m);
			}
		});
		if (y.length) {
			mon.push(y);
		}
		if (!drop && n.length) {
			mon.push(n);
		}
	});
	return mon;
};

rule.forEach(row => {
	if (/^[ \t]*$/.exec(row)) {
		return;
	}
	row = row.replace(/^[\t ]*/, '');
	row = row.replace(/[\t ]*$/, '');
	if (/^HAS '.+'$/.exec(row)) {
		conds.push((() => {
			let item = /^HAS '(.+)'$/.exec(row)[1];
			return (hvauto) => {
				return hvauto.battle.item[999] && hvauto.battle.item[999].name == item;
			};
		})());
		return;
	}
	if (/^(?:health|mana|spirit|charge) (?:<|>|<=|>=|=|!=) [.\d]+$/.exec(row)) {
		conds.push((() => {
			let mat = /^(health|mana|spirit|charge) (<|>|<=|>=|=|!=) ([.\d]+)$/.exec(row);
			return (hvauto) => {
				return (op[mat[2]])(hvauto.battle[mat[1]], Number(mat[3]));
			};
		})());
		return;
	}
	if (/^EXPIRE '.+' (?:<|>|<=|>=|=|!=) [.\d]+$/.exec(row)) {
		conds.push((() => {
			let mat = /^EXPIRE '(.+)' (<|>|<=|>=|=|!=) ([.\d]+)$/.exec(row);
			return (hvauto) => {
				let eff = hvauto.battle.findEffect(mat[1]);
				let exp = eff ? (eff.expire == -1 ? 1000000000 : eff.expire) : -1;
				return (op[mat[2]])(exp, Number(mat[3]));
			};
		})());
		return;
	}
	if (/^EFF '.+'$/.exec(row)) {
		conds.push((() => {
			let item = /^EFF '(.+)'$/.exec(row)[1];
			return (hvauto) => {
				return hvauto.findEffect(item) != null;
			};
		})());
		return;
	}
	if (/^NOEFF '.+'$/.exec(row)) {
		conds.push((() => {
			let item = /^NOEFF '(.+)'$/.exec(row)[1];
			return (hvauto) => {
				return hvauto.findEffect(item) == null;
			};
		})());
		return;
	}
	if (/^M_EFF '.+'$/.exec(row)) {
		filts.push((() => {
			let item = /^M_EFF '(.+)'$/.exec(row)[1];
			return (hvauto, mons, drop) => {
				return applyCond(hvauto, mons, (m) => { return hvauto.findEffect(item, m.effect) != null; }, drop);
			};
		})());
		return;
	}
	if (/^M_NOEFF '.+'$/.exec(row)) {
		filts.push((() => {
			let item = /^M_NOEFF '(.+)'$/.exec(row)[1];
			return (hvauto, mons, drop) => {
				return applyCond(hvauto, mons, (m) => { return hvauto.findEffect(item, m.effect) == null; }, drop);
			};
		})());
		return;
	}
	if (/^USE '.+'$/.exec(row)) {
		rules.push({
			precond: conds,
			action: (() => {
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
			})()
		});
		conds = [];
		return;
	}
	if (/^CAST '.+'$/.exec(row)) {
		rules.push({
			precond: conds,
			action: (() => {
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
			})()
		});
		conds = [];
		return;
	}
	if (/^CASTTO '.+'$/.exec(row)) {
		rules.push({
			precond: conds,
			action: (() => {
				let filt = filts;
				let skill = /^CASTTO '(.+)'$/.exec(row)[1];
				return (hvauto) => {
					let mons = dumpMonster(hvauto);
					filt.forEach(f => {
						mons = f(hvauto, mons);
					});
					if (mons.length) {
						if (hvauto.battle.skills[skill]) {
							let sk = hvauto.battle.skills[skill];
							if (hvauto.battle.mana >= sk.mana && hvauto.battle.charge >= sk.charge && sk.available) {
								return {
									act: hvauto.triggerSkill(mons[0][0].id, sk.id),
									msg: 'cast ' + skill + ' to ' + mons[0][0].id
								};
							}
						}
					}
					return null;
				};
			})()
		});
		filts = [];
		conds = [];
		return;
	}
	if (/^SORT \S+ (<|>)$/.exec(row)) {
		filts.push((() => {
			let mat = /^SORT (\S+) (<|>|<=|>=)$/.exec(row);
			return (hvauto, mons) => {
				mons.forEach(arr => {
					arr.sort((a, b) => {
						return (mat[2] == '>' ? -1 : 1) * (a[mat[1]] - b[mat[1]]);
					})
				});
				return mons;
			};
		})());
		return;
	}
	switch (row) {
		case 'SPIRIT':
			conds.push((hvauto) => {
				return hvauto.battle.spirit_stance;
			});
			return;
		case 'NOTSPIRIT':
			conds.push((hvauto) => {
				return !hvauto.battle.spirit_stance;
			});
			return;
		case 'AND':
			conds.push((() => {
				let pre2 = conds.pop();
				let pre1 = conds.pop();
				return function (hvauto) {
					return pre1(hvauto) && pre2(hvauto);
				}
			})());
			return;
		case 'OR':
			conds.push((() => {
				let pre2 = conds.pop();
				let pre1 = conds.pop();
				return function (hvauto) {
					return pre1(hvauto) || pre2(hvauto);
				}
			})());
			return;
		case 'DROP':
			filts.push((() => {
				let pre = filts.pop();
				return function (hvauto, mons) {
					return pre(hvauto, mons, true);
				}
			})());
			return;
		case 'M_BOSS':
			filts.push((() => {
				return (hvauto, mons, drop) => {
					return applyCond(hvauto, mons, (m) => { return m.isboss; }, drop);
				};
			})());
			return;
		case 'M_NOTBOSS':
			filts.push((() => {
				return (hvauto, mons, drop) => {
					return applyCond(hvauto, mons, (m) => { return !m.isboss; }, drop);
				};
			})());
			return;
		case 'USE ITEMP':
			rules.push({
				precond: conds,
				action: (hvauto) => {
					return {
						act: hvauto.useItem(0, '999'),
						msg: 'use itemp'
					};
				}
			});
			conds = [];
			return;
		case 'TRIGSPIRIT':
			rules.push({
				precond: conds,
				action: (hvauto) => {
					return {
						act: hvauto.triggerSpirit(),
						msg: 'trigger spirit'
					};
				}
			});
			conds = [];
			return;
		case 'ATTACK':
			rules.push({
				precond: conds,
				action: (() => {
					let filt = filts;
					return (hvauto) => {
						let mons = dumpMonster(hvauto);
						filt.forEach(f => {
							mons = f(hvauto, mons);
						});
						if (mons.length) {
							return {
								act: hvauto.normalAttack(mons[0][0].id),
								msg: 'attack ' + mons[0][0].id
							};
						} else {
							return null;
						}
					};
				})()
			});
			filts = [];
			conds = [];
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
			if (!r.precond[j](hvauto)) {
				ok = false;
				break;
			}
		}
		if (ok) {
			let action = r.action(hvauto);
			if (action) {
				return action;
			}
		}
	}
	console.log('No action!!!');
	abort();
	return null;
};