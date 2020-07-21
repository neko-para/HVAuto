let cookie = require('./cookie');
// cookie.js should be like below
// module.exports = "__cfduid=xxx;ipb_member_id=xxx;ipb_pass_hash=xxx";
let hvauto = require('./hvauto');
let zh_CN = require('./zh_CN');
let AI = require('./AI');

async function main() {
	hvauto.handleLog = t => {
		console.log('\t' + zh_CN(t));
	};
	while (await hvauto.init(cookie)) { // Auto load next battle
		let battle = hvauto.battle;
		if (battle.round.current) {
			console.log('Round ' + battle.round.current + ' / ' + battle.round.all);
		}
		while (await hvauto.doAction(AI(hvauto))) {
			/* empty */
		}
	}
}

main();