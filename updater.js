const fs = require('fs');
const got = require('got');

module.exports = async () => {
	let obj = JSON.parse(fs.readFileSync('updater.json'));
	for (let i = 0; i < obj.file.length; ++i) {
		let p = obj.file[i];
		let res = await got(obj.root + '/' + p);
		fs.writeFile(p, res.body, err => {
			if (err) {
				console.log('Updating ' + p + ' failed: ' + err);
			} else {
				console.log('Updating ' + p + ' success');
			}
		});
	}
}