const fs = require('fs');
const got = require('got');

module.exports = async () => {
	let obj = JSON.parse(fs.readFileSync('updater.json'));
	obj.file.forEach(async (p) => {
		let url = obj.root + '/' + p;
		let res = await got(url);
		fs.writeFile(p, res.body, err => {
			if (err) {
				console.log('Updating ' + p + ' failed: ' + err);
			} else {
				console.log('Updating ' + p + ' success');
			}
		});
	});

}