const fs = require('fs');
const process = require('process');
let hvauto = require('./hvauto');
let AI = require(process.cwd() + '/AI');
const cookie = fs.readFileSync('cookie.txt');

async function main() {
	AI.init(hvauto);
	while (await hvauto.init(cookie)) { // Auto load next battle
		let battle = hvauto.battle;
		if (battle.round.current) {
			console.log('Round ' + battle.round.current + ' / ' + battle.round.all);
		}
		while (await hvauto.doAction((AI.do)(hvauto))) {
			/* empty */
		}
	}
}

main();