let dict = [
	{
		'keys': {
			'fire': '火焰',
			'cold': '冰冷',
			'elec': '闪电',
			'wind': '疾风',
			'holy': '神圣',
			'dark': '黑暗',
			'crushing': '锤击',
			'slashing': '斩击',
			'piercing': '刺击',
			'void': '虚空'
		},
		'color': '\x1b[34m'
	},
	{
		'keys': {
			'Overwhelming Strikes': '压倒性的攻击',
			'Stunned': '眩晕',
			'Penetrated Armor': '破甲',
			'Searing Skin': '烧灼的皮肤',
			'Channeling': '引导',
			'Cure': '治疗术',
			'Regen': '恢复术',
			'Protection': '护盾',
			'Replenishment': '补给'
		},
		'color': '\x1b[35m'
	},
	{
		'keys': {
			'Health Draught': '体力长效药',
			'Mana Draught': '法力长效药',
			'Spirit Draught': '灵力长效药',
			'Health Potion': '体力药水',
			'Mana Potion': '法力药水',
			'Spirit Potion': '灵力药水',
			'Health Gem': '体力宝石',
			'Mana Gem': '法力宝石',
			'Spirit Gem': '灵力宝石'
		},
		'color': '\x1b[36m'
	},
	{
		'keys': {
			'you': '你',
			'You': '你',
			'block': '格挡',
			'blocks': '格挡',
			'parry': '招架',
			'parries': '招架',
			'health': '生命',
			'magic': '魔力',
			'spirit': '灵力',
			'one-handed weapon': '单手武器',
			'two-handed weapon': '双手武器',
			'dual wielding': '双持武器',
			'cloth armor': '布甲',
			'light armor': '轻甲',
			'heavy armor': '重甲',
			'staff': '法杖',
			'elemental magic': '元素魔法',
			'divine magic': '神圣魔法',
			'forbidden magic': '黑暗魔法',
			'deprecating magic': '减益魔法',
			'supportive magic': '增益魔法',
			'spike shield': '刺盾',
		}
	}
];

let rules = [
	{
		'reg': /^Your ([^,.]+) hits ([^,.]+) for (\d+) points of ([^,.]+) damage\.$/,
		'pat': '你的@<$1>对@<$2>造成了@($3)点@<$4>伤害。'
	},
	{
		'reg': /^([^,.]+) hits? ([^,.]+) for (\d+) ([^,.]+) damage\.$/,
		'pat': '@<$1>对@<$2>造成了@($3)点@<$4>伤害。'
	},
	{
		'reg': /^([^,.]+) crits? ([^,.]+) for (\d+) ([^,.]+) damage\.$/,
		'pat': '@<$1>对@<$2>暴击，造成了@($3)点@<$4>伤害。'
	},
	{
		'reg': /^([^,.]+) (?:cast|use)s? ([^,.]+), and hits? ([^,.]+) for (\d+) ([^,.]+) damage$/,
		'pat': '@<$1>使用了@<$2>，对@<$3>造成了@($4)点@<$5>伤害。'
	},
	{
		'reg': /^([^,.]+) (?:cast|use)s? ([^,.]+), and hits? ([^,.]+) for (\d+) ([^,.]+) damage \((\d+)% resisted\)$/,
		'pat': '@<$1>使用了@<$2>，对@<$3>造成了@($4)点@<$5>伤害（抵抗$6%）。'
	},
	{
		'reg': /^([^,.]+) (?:cast|use)s? ([^,.]+), and crits? ([^,.]+) for (\d+) ([^,.]+) damage$/,
		'pat': '@<$1>使用了@<$2>，对@<$3>暴击，造成了@($4)点@<$5>伤害。'
	},
	{
		'reg': /^([^,.]+) (?:cast|use)s? ([^,.]+), and crits? ([^,.]+) for (\d+) ([^,.]+) damage \((\d+)% resisted\)$/,
		'pat': '@<$1>使用了@<$2>，对@<$3>暴击，造成了@($4)点@<$5>伤害（抵抗$6%）。'
	},
	{
		'reg': /^([^,.]+) (?:cast|use)s? ([^,.]+), but miss(?:es)? the attack\.$/,
		'pat': '@<$1>使用了@<$2>，但被闪避了。'
	},
	{
		'reg': /^([^,.]+) (?:cast|use)s? ([^,.]+)\. You (parry|block) the attack\.$/,
		'pat': '@<$1>使用了@<$2>。你@<$3>了攻击。'
	},
	{
		'reg': /^([^,.]+) (?:cast|use)s? ([^,.]+)\.$/,
		'pat': '@<$1>使用了@<$2>。'
	},
	{
		'reg': /^([^,.]+) evades your attack\.$/,
		'pat': '@<$1>闪避了你的攻击。'
	},
	{
		'reg': /^([^,.]+) misses the attack against you\.$/,
		'pat': '你闪避了@<$1>的攻击。'
	},
	{
		'reg': /^([^,.]+) (blocks?|parr(?:y|ies)) your attack\.$/,
		'pat': '@<$1>@<$2>了你的攻击。'
	},
	{
		'reg': /^You (blocks?|parr(?:y|ies)) the attack from ([^,.]+)\.$/,
		'pat': '你@<$1>了@<$2>的攻击。'
	},
	{
		'reg': /^You counter ([^,.]+) for (\d+) points of ([^,.]+) damage\.$/,
		'pat': '你反击@<$1>造成了@($2)点@<$3>伤害。'
	},
	{
		'reg': /^([^,.]+) has been defeated\.$/,
		'pat': '@<$1>被打败了。'
	},
	{
		'reg': /^([^,.]+) gains? the effect ([^,.]+)\.$/,
		'pat': '@<$1>获得了@<$2>。'
	},
	{
		'reg': /^The effect ([^,.]+) {2}has expired\.$/,
		'pat': '你的@<$1>过期了。'
	},
	{
		'reg': /^The effect ([^,.]+) on ([^,.]+) has expired\.$/,
		'pat': '@<$2>的@<$1>过期了。'
	},
	{
		'reg': /^([^,.]+) restores (\d+) points of ([^,.]+)\.$/,
		'pat': '@<$1>使你恢复了@($2)点@<$3>。'
	},
	{
		'reg': /^You are healed for (\d+) Health Points\.$/,
		'pat': '你通过治疗恢复了@($1)点生命。'
	},
	{
		'reg': /^([^,.]+) dropped <span style="color:#A89000">\[(\d+) Credits\]<\/span>$/,
		'pat': '@<$1>掉落了@($2)C。'
	},
	{
		'reg': /^([^,.]+) dropped <span style="color:#BA05B4">\[([^,.]+)\]<\/span>$/,
		'pat': '@<$1>掉落了@<$2>。'
	},
	{
		'reg': /^([^,.]+) dropped <span style="color:#[A-F0-9]{6}">\[([^,.]+)\]<\/span>$/,
		'pat': '@<$1>掉落了@<$2>。'
	},
	{
		'reg': /^You gain (\d+) EXP!$/,
		'pat': '你获得了@($1)点经验！'
	},
	{
		'reg': /^You gain ([.0-9]+) points of ([^,.]+) proficiency.$/,
		'pat': '你获得了@($1)点@<$2>熟练度。'
	},
	{
		'reg': /^You are Victorious!$/,
		'pat': '你胜利了！'
	},
	{
		'reg': /^Spawned Monster (.): MID=(\d+) \(([^,.]+)\) LV=(\d+) HP=(\d+)$/,
		'pat': '生成怪物$1：编号$2\t级别$4\t血量$5\t名称$3'
	},
	{
		'reg': /^Stop (?:beat|kick)ing (?:the )?dead (?:ponies|horse)\.$/,
		'pat': '不要再鞭尸了。（这个可能是因为网络原因导致的）'
	},
	{
		'reg': /^Spirit Stance Engaged$/,
		'pat': '启用灵动架势。'
	},
	{
		'reg': /^Spirit Stance Disabled$/,
		'pat': '禁用灵动架势。'
	}
];

const updateReg = /@<(.+?)>/;
const numberReg = /@\(([.\d]+)\)/;

module.exports = function (str) {
	let newstr = null;
	for (let i in rules) {
		let r = rules[i];
		let mat = r.reg.exec(str);
		if (mat) {
			if (r.show) {
				console.log('\t' + str);
			}
			newstr = str.replace(r.reg, r.pat);
			mat = numberReg.exec(newstr);
			while (mat) {
				newstr = newstr.replace(numberReg, '\x1b[32m$1\x1b[37m');
				mat = numberReg.exec(newstr);
			}
			mat = updateReg.exec(newstr);
			while (mat) {
				let key = mat[1];
				let val = '\x1b[33m' + key + '\x1b[37m';
				for (let j in dict) {
					let d = dict[j];
					if (d.keys[key]) {
						val = d.color ? d.color + d.keys[key] + '\x1b[37m' : d.keys[key];
						break;
					}
				}
				newstr = newstr.replace(updateReg, val);
				mat = updateReg.exec(newstr);
			}
			break;
		}
	}
	return newstr || '\x1b[31m' + str + '\x1b[37m';
};