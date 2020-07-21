let AIParser = require('./AIParser');

module.exports = function (hvauto) {
	let battle = hvauto.battle;
	let progress = 0;
	console.log('Health: ' + battle.health + ', Mana: ' + battle.mana + ', Spirit: ' + battle.spirit + ', Charge: ' + battle.charge);
	battle.monster.forEach(t => {
		if (t.alive) {
			progress += t.health;
		}
	});
	progress /= battle.monster.length;
	console.log('Progress: ' + Math.floor((1 - progress) * 100) + '%');
	let act = AIParser(hvauto);
	console.log(act.msg);
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
};