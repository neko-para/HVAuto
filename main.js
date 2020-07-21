const fs = require('fs');
const process = require('process');
let hvauto = require('./hvauto');
let zh_CN = require(process.cwd() + '/zh_CN');
let AI = require(process.cwd() + '/AI');
const cookie = fs.readFileSync('cookie.txt');

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