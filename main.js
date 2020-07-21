let cookie = require('./cookie');
// cookie.js should be like below
// module.exports = "__cfduid=xxx;ipb_member_id=xxx;ipb_pass_hash=xxx";
let hvauto = require('./hvauto');
let zh_CN = require('./zh_CN');

async function main() {
	hvauto.handleLog = t => {
		console.log('\t' + zh_CN(t));
	};
	while (await hvauto.init(cookie)) { // Auto load next battle
		let battle = hvauto.battle;
		if (battle.round.current) {
			console.log('Round ' + battle.round.current + ' / ' + battle.round.all);
		}
		let nextAction = null;
		do {
			console.log('Health: ' + battle.health + ', Mana: ' + battle.mana + ', Spirit: ' + battle.spirit + ', Charge: ' + battle.charge);
			if (battle.item[999]) {
				if (battle.item[999].name == 'Mana Gem' && battle.mana < 300) {
					console.log('Use mana gem');
					nextAction = hvauto.useItem(0, '999');
					continue;
				} else if (battle.item[999].name == 'Health Gem' && battle.health < 4500) {
					console.log('Use health gem');
					nextAction = hvauto.useItem(0, '999');
					continue;
				} else if (battle.item[999].name == 'Spirit Gem' && battle.spirit < 300) {
					console.log('Use spirit gem');
					nextAction = hvauto.useItem(0, '999');
					continue;
				}
			}
			if (battle.health < 4000) {
				if (hvauto.findEffect('Regen') == null && battle.skills.Regen) {
					if (battle.mana >= battle.skills.Regen.mana && battle.skills.Regen.available) {
						console.log('Cast regen');
						nextAction = hvauto.triggerSkill(0, battle.skills.Regen.id);
						continue;
					}
				}
			}
			if (battle.health < 2000) {
				if (battle.skills.Cure) {
					if (battle.mana >= battle.skills.Cure.mana && battle.skills.Cure.available) {
						console.log('Cast cure');
						nextAction = hvauto.triggerSkill(0, battle.skills.Cure.id);
						continue;
					}
				}
			}
			if (battle.mana < 100 && hvauto.findEffect('Replenishment') == null) {
				let pos = hvauto.findItem('Mana Draught');
				if (pos == -1) {
					console.log('You don\'t take mana draught.');
				} else {
					if (battle.item[pos].available) {
						console.log('Use mana draught');
						nextAction = hvauto.useItem(0, pos);
						continue;
					}
				}
			}
			if (!battle.spirit_stance && battle.spirit >= 200 && battle.charge >= 9) {
				console.log('Enable spirit');
				nextAction = hvauto.triggerSpirit();
				continue;
			} else if (battle.spirit_stance && battle.spirit < 150) {
				console.log('Disable spirit');
				nextAction = hvauto.triggerSpirit();
				continue;
			}
			let target = 0;
			for (let i = 0; i < battle.monster.length; ++i) {
				if (battle.monster[i].isboss) {
					target = i + 1;
					break;
				} else if (target == 0 && battle.monster[i].alive) {
					target = i + 1;
				}
			}
			console.log('Normal attack ' + target);
			nextAction = hvauto.normalAttack(target);
		} while (await hvauto.doAction(nextAction));
	}
}

main();