let dicts = {
	'fire': '火焰',
	'cold': '冰冷',
	'elec': '闪电',
	'wind': '疾风',
	'holy': '神圣',
	'dark': '黑暗',
	'crushing': '锤击',
	'slashing': '斩击',
	'piercing': '刺击',
	'void': '虚空',
	'you': '你',
	'You': '你',
	'block': '格挡',
	'blocks': '格挡',
	'parry': '招架',
	'parries': '招架',

	'health': '生命',
	'magic': '魔力',
	'spirit': '灵力',

	'Overwhelming Strikes': '压倒性的攻击',
	'Stunned': '眩晕',
	'Penetrated Armor': '破甲',
	'Searing Skin': '烧灼的皮肤',

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

	'Channeling': '引导',
	'Cure': '治疗术',
	'Regen': '恢复术',
	'Protection': '护盾',
	'Replenishment': '补给'
};

let rules = [
	{
		'reg': /^([^,.]+) hits? ([^,.]+) for (\d+) ([^,.]+) damage\.$/,
		'pat': '@<$1>对@<$2>造成了$3点@<$4>伤害。'
	},
	{
		'reg': /^([^,.]+) crits? ([^,.]+) for (\d+) ([^,.]+) damage\.$/,
		'pat': '@<$1>对@<$2>暴击，造成了$3点@<$4>伤害。'
	},
	{
		'reg': /^Your ([^,.]+) hits ([^,.]+) for (\d+) points of ([^,.]+) damage\.$/,
		'pat': '你的@<$1>对@<$2>造成了$3点@<$4>伤害。'
	},
	{
		'reg': /^([^,.]+) (?:cast|use)s? ([^,.]+), and hits? ([^,.]+) for (\d+) ([^,.]+) damage$/,
		'pat': '@<$1>使用了@<$2>，对@<$3>造成了$4点@<$5>伤害。'
	},
	{
		'reg': /^([^,.]+) (?:cast|use)s? ([^,.]+), and hits? ([^,.]+) for (\d+) ([^,.]+) damage \((\d+)% resisted\)$/,
		'pat': '@<$1>使用了@<$2>，对@<$3>造成了$4点@<$5>伤害（抵抗$6%）。'
	},
	{
		'reg': /^([^,.]+) (?:cast|use)s? ([^,.]+), and crits? ([^,.]+) for (\d+) ([^,.]+) damage$/,
		'pat': '@<$1>使用了@<$2>，对@<$3>暴击，造成了$4点@<$5>伤害。'
	},
	{
		'reg': /^([^,.]+) (?:cast|use)s? ([^,.]+), and crits? ([^,.]+) for (\d+) ([^,.]+) damage \((\d+)% resisted\)$/,
		'pat': '@<$1>使用了@<$2>，对@<$3>暴击，造成了$4点@<$5>伤害（抵抗$6%）。'
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
		'pat': '你反击@<$1>造成了$2点@<$3>伤害。'
	},
	{
		'reg': /^([^,.]+) has been defeated\.$/,
		'pat': '@<$1>被打败了。'
	},
	{
		'reg': /^([^,.]+) gains? the effect ([^,.]+)\.$/,
		'pat': '@<$1>获得了效果@<$2>。'
	},
	{
		'reg': /^The effect ([^,.]+) {2}has expired\.$/,
		'pat': '你的效果@<$1>过期了。'
	},
	{
		'reg': /^The effect ([^,.]+) on ([^,.]+) has expired\.$/,
		'pat': '@<$2>的效果@<$1>过期了。'
	},
	{
		'reg': /^([^,.]+) restores (\d+) points of ([^,.]+)\.$/,
		'pat': '效果@<$1>使你恢复了$2点@<$3>。'
	},
	{
		'reg': /^([^,.]+) dropped <span style="color:#[A-F0-9]{6}">\[([^,.]+)\]<\/span>$/,
		'pat': '@<$1>掉落了$2。'
	},
	{
		'reg': /^You gain (\d+) EXP!$/,
		'pat': '你获得了$1点经验！'
	},
	{
		'reg': /^You gain ([.0-9]+) points of ([^,.]+) proficiency.$/,
		'pat': '你获得了$1点@<$2>熟练度。'
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
		'reg': /^Stop beating dead ponies\.$/,
		'pat': '不要再攻击死亡的小马们。（这个可能是因为网络原因导致的）'
	}
];

const updateReg = /@<(.+?)>/;

module.exports = function (str) {
	let newstr = null;
	rules.forEach(r => {
		let mat = r.reg.exec(str);
		if (mat) {
			newstr = str.replace(r.reg, r.pat);
			mat = updateReg.exec(newstr);
			while (mat) {
				let key = mat[1];
				let val = dicts[key] ? dicts[key] : '\x1b[33m' + key + '\x1b[37m';
				newstr = newstr.replace(updateReg, val);
				mat = updateReg.exec(newstr);
			}
			return false;
		}
	});
	return newstr || '\x1b[36m' + str + '\x1b[37m';
};