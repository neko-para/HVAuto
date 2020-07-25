const fs = require('fs');
const got = require('got');

module.exports = async () => {
	let obj = JSON.parse(fs.readFileSync('updater.json'));
	let pros = [];
	for (let i = 0; i < obj.file.length; ++i) {
		(() => {
			let path = obj.file[i];
			pros.push(got(obj.root + '/' + path).then(res => {
				console.log('Update ' + path + ' success');
				return res.body;
			}));
		})();
	}
	let data = await Promise.all(pros);
	for (let i = 0; i < obj.file.length; ++i) {
		fs.writeFileSync(obj.file[i], data[i]);
	}
};