let cookie = require('./cookie');
// cookie.js should be like below
// module.exports = "__cfduid=xxx;ipb_member_id=xxx;ipb_pass_hash=xxx";
let hvauto = require('./hvauto');

async function main() {
	hvauto.handleLog = t => {
		console.log('Log: ' + t);
	};
	while (await hvauto.init(cookie)) { // Auto load next battle
		console.log('You are in a battle');
		let nextAction = null;
		do {
			console.log('Health: ' + hvauto.battle.health);
			let target = 0;
			for (let i = 0; i < hvauto.battle.monster.length; ++i) {
				if (hvauto.battle.monster[i].alive) {
					target = i + 1;
					break;
				}
			}
			if (hvauto.battle.health < 4000) {
				console.log('Cast regen');
				nextAction = hvauto.triggerSkill(0, hvauto.battle.skills.Regen.id);
			} else {
				console.log('Normat attack ' + target);
				nextAction = hvauto.normalAttack(target);
			}
		} while (await hvauto.doAction(nextAction));
	}
}

main();