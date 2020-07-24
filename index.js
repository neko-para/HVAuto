(async () => {

	let updater = require('./updater');
	await updater();

	const process = require('process');
	let main = require(process.cwd() + '/main');
	main();
})()