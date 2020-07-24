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
		'type': 'effect',
		'keys': {
			'Overwhelming Strikes': '压倒性的攻击',
			'Blessing of the RiddleMaster': '御谜士的祝福',
			'Channeling': '引导',
			'Regeneration': '再生',
			'Replenishment': '补给',
			'Refreshment': '提神',
			'Spark of Life': '生命火花',
			'Shadow Veil': '影纱',
			'Cloak of the Fallen': '陨落的披风',

			'Regen': '恢复术',
			'Protection': '护盾',

			'Cure': '治疗术',
			'Shield Bash': '盾击',
			'Vital Strike': '要害强击',
			'Merciful Blow': '最后的慈悲',

			'Stunned': '眩晕',
			'Penetrated Armor': '破甲',
			'Bleeding Wound': '流血',
			'Searing Skin': '烧灼的皮肤',
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
			'Health Elixir': '终极体力药',
			'Mana Elixir': '终极法力药',
			'Spirit Elixir': '终极灵力药',
			'Health Gem': '体力宝石',
			'Mana Gem': '法力宝石',
			'Spirit Gem': '灵力宝石',
			'Mystic Gem': '神秘宝石',
			'Crystal of Vigor': '力量水晶',
			'Crystal of Finesse': '灵巧水晶',
			'Crystal of Swiftness': '敏捷水晶',
			'Crystal of Fortitude': '体质水晶',
			'Crystal of Cunning': '智力水晶',
			'Crystal of Knowledge': '智慧水晶',
			'Crystal of Flames': '火焰水晶',
			'Crystal of Frost': '冰冻水晶',
			'Crystal of Lightning': '闪电水晶',
			'Crystal of Tempest': '疾风水晶',
			'Crystal of Devotion': '神圣水晶',
			'Crystal of Corruption': '暗黑水晶',
			'Scroll of Swiftness': '加速卷轴',
			'Scroll of Protection': '保护卷轴',
			'Scroll of the Avatar': '化身卷轴',
			'Scroll of Absorption': '吸收卷轴',
			'Scroll of Shadows': '幻影卷轴',
			'Scroll of Life': '生命卷轴',
			'Scroll of Gods': '神之卷轴',
			'Monster Chow': '怪物饲料',
			'Monster Edibles': '怪物食品',
			'Monster Cuisine': '怪物料理',
			'Token of Blood': '鲜血令牌',
			'Chaos Token': '混沌令牌',
			'Soul Fragments': '灵魂碎片'
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
			'magic': '法力',
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
			'spike shield': '刺盾'
		}
	}
];

let rules = [
	{
		reg: /^Your ([^,.]+) hits ([^,.]+) for (\d+) points of ([^,.]+) damage\.$/,
		pat: '你的@<$1>对@<$2>造成了@($3)点@<$4>伤害。'
	},
	{
		reg: /^([^,.]+) hits? ([^,.]+) for (\d+) ([^,.]+) damage\.?$/,
		pat: '@<$1>对@<$2>造成了@($3)点@<$4>伤害。'
	},
	{
		reg: /^([^,.]+) crits? ([^,.]+) for (\d+) ([^,.]+) damage\.?$/,
		pat: '@<$1>对@<$2>暴击，造成了@($3)点@<$4>伤害。'
	},
	{
		reg: /^([^,.]+) hits? ([^,.]+) for (\d+) damage\.$/,
		pat: '@<$1>对@<$2>造成了@($3)点伤害。'
	},
	{
		reg: /^([^,.]+) (?:cast|use)s? ([^,.]+), and hits? ([^,.]+) for (\d+) ([^,.]+) damage$/,
		pat: '@<$1>使用了@<$2>，对@<$3>造成了@($4)点@<$5>伤害。'
	},
	{
		reg: /^([^,.]+) (?:cast|use)s? ([^,.]+), and hits? ([^,.]+) for (\d+) ([^,.]+) damage \((\d+)% resisted\)$/,
		pat: '@<$1>使用了@<$2>，对@<$3>造成了@($4)点@<$5>伤害（抵抗$6%）。'
	},
	{
		reg: /^([^,.]+) (?:cast|use)s? ([^,.]+), and crits? ([^,.]+) for (\d+) ([^,.]+) damage$/,
		pat: '@<$1>使用了@<$2>，对@<$3>暴击，造成了@($4)点@<$5>伤害。'
	},
	{
		reg: /^([^,.]+) (?:cast|use)s? ([^,.]+), and crits? ([^,.]+) for (\d+) ([^,.]+) damage \((\d+)% resisted\)$/,
		pat: '@<$1>使用了@<$2>，对@<$3>暴击，造成了@($4)点@<$5>伤害（抵抗$6%）。'
	},
	{
		reg: /^([^,.]+) (?:cast|use)s? ([^,.]+), but miss(?:es)? the attack\.$/,
		pat: '@<$1>使用了@<$2>，但被闪避了。'
	},
	{
		reg: /^([^,.]+) (?:cast|use)s? ([^,.]+). You evade the attack\.$/,
		pat: '@<$1>使用了@<$2>。你闪避了攻击。'
	},
	{
		reg: /^([^,.]+) (?:cast|use)s? ([^,.]+)\. You (parry|block) the attack\.$/,
		pat: '@<$1>使用了@<$2>。你@<$3>了攻击。'
	},
	{
		reg: /^([^,.]+) (?:cast|use)s? ([^,.]+)\.$/,
		pat: '@<$1>使用了@<$2>。'
	},
	{
		reg: /^You evade the attack from ([^,.]+)\.$/,
		pat: '你闪避了@<$1>的攻击。'
	},
	{
		reg: /^([^,.]+) evades your attack\.$/,
		pat: '@<$1>闪避了你的攻击。'
	},
	{
		reg: /^([^,.]+) misses the attack against you\.$/,
		pat: '你闪避了@<$1>的攻击。'
	},
	{
		reg: /^([^,.]+) (blocks?|parr(?:y|ies)) your attack\.$/,
		pat: '@<$1>@<$2>了你的攻击。'
	},
	{
		reg: /^You (blocks?|parr(?:y|ies)) the attack from ([^,.]+)\.$/,
		pat: '你@<$1>了@<$2>的攻击。'
	},
	{
		reg: /^You counter ([^,.]+) for (\d+) points of ([^,.]+) damage\.$/,
		pat: '你反击@<$1>造成了@($2)点@<$3>伤害。'
	},
	{
		reg: /^([^,.]+) has been defeated\.$/,
		pat: '@<$1>被打败了。'
	},
	{
		reg: /^([^,.]+) gains? the effect ([^,.]+)\.$/,
		pat: '@<$1>获得了@<$2>。'
	},
	{
		reg: /^Cooldown is still pending for ([^,.]+)\.$/,
		pat: '@<$1>仍在冷却。'
	},
	{
		reg: /^Cooldown expired for ([^,.]+)$/,
		pat: '@<$1>冷却完毕。'
	},
	{
		reg: /^The effect ([^,.]+) {2}has expired\.$/,
		pat: '你的@<$1>过期了。'
	},
	{
		reg: /^The effect ([^,.]+) on ([^,.]+) has expired\.$/,
		pat: '@<$2>的@<$1>过期了。'
	},
	{
		reg: /^([^,.]+) restores (\d+) points of ([^,.]+)\.$/,
		pat: '@<$1>使你恢复了@($2)点@<$3>。'
	},
	{
		reg: /^You are healed for (\d+) Health Points\.$/,
		pat: '你恢复了@($1)点生命。'
	},
	{
		reg: /^Recovered (\d+) points of (health|magic|spirit)\.$/,
		pat: '你恢复了@($1)点@<$2>。'
	},
	{
		reg: /^Your ([^,.]+) restores you from the brink of defeat\.$/,
		pat: '你的@<$1>防止了你被击败。'
	},
	{
		reg: /^([^,.]+) dropped <span style="color:#A89000">\[(\d+) Credits\]<\/span>$/,
		pat: '@<$1>掉落了@($2)C。'
	},
	{
		reg: /^([^,.]+) dropped <span style="color:#[A-F0-9]{6}">\[(\d)x ([^,.]+)\]<\/span>$/,
		pat: '@<$1>掉落了@($2)个@<$3>。'
	},
	{
		reg: /^([^,.]+) dropped <span style="color:#[A-F0-9]{6}">\[([^,.]+)\]<\/span>$/,
		pat: '@<$1>掉落了@<$2>。'
	},
	{
		reg: /^You obtained five <span style="color:#254117">\[([^,.]+)\]<\/span>$/,
		pat: '你获得了@(5)个@<$1>。'
	},
	{
		reg: /^Arena (?:Clear|Token) Bonus! <span style="color:#[A-F0-9]{6}">\[([^,.]+)\]<\/span>/,
		pat: '竞技场奖励！@<$1>。'
	},
	{
		reg: /^([^,.]+) drops a ([^,.]+) powerup!$/,
		pat: '@<$1>掉落了@<$2>。'
	},
	{
		reg: /^You gain (\d+) EXP!$/,
		pat: '你获得了@($1)点经验！'
	},
	{
		reg: /^You gain (\d+) Credits!$/,
		pat: '你获得了@($1)C！'
	},
	{
		reg: /^You gain ([.0-9]+) points of ([^,.]+) proficiency.$/,
		pat: '你获得了@($1)点@<$2>熟练度。'
	},
	{
		reg: /^You are Victorious!$/,
		pat: '你胜利了！'
	},
	{
		reg: /^Spawned Monster (.): MID=(\d+) \(([^,.]+)\) LV=(\d+) HP=(\d+)$/,
		pat: '生成怪物$1：编号@($2)\t级别@($4)\t血量@($5)\t名称@<$3>'
	},
	{
		reg: /^Stop (?:beat|kick)ing (?:the )?dead (?:ponies|horse)\.$/,
		pat: '不要再鞭尸了。（这个可能是因为网络原因导致的）'
	},
	{
		reg: /^Spirit Stance Engaged$/,
		pat: '启用灵动架势。'
	},
	{
		reg: /^Spirit Stance Disabled$/,
		pat: '禁用灵动架势。'
	},
	{
		reg: /^Spirit Stance Exhausted$/,
		pat: '灵动架势无法继续使用。'
	},
	{
		reg: /^The RiddleMaster is pleased with your answer, and grants you his blessings\.$/,
		pat: '御谜士对你的答案很满意，并且给予了你他的祝福。'
	},
	{
		reg: /^Time Bonus: recovered (\d+) HP and (\d+) MP\.$/,
		pat: '答题时间奖励：恢复@($1)的生命和@($2)的法力。'
	},
	{
		reg: /^Initializing Grindfest \(Round (\d+) \/ (\d+)\) \.\.\.$/,
		pat: '初始化压榨界，回合@($1)/@($2)。'
	},
	{
		reg: /^Initializing arena challenge #(\d+) \(Round (\d+) \/ (\d+)\) \.\.\.$/,
		pat: '初始化竞技场第@($1)关，回合@($2)/@($3)。'
	},
	{
		reg: /^Initializing random encounter \.{3}$/,
		pat: '初始化随机遭遇。'
	}
];

const updateReg = /@<(.+?)>/;
const numberReg = /@\(([.\d]+)\)/;

let key = function (str) {
	for (let j in dict) {
		let d = dict[j];
		let cnt = null;
		if (d.type == 'effect') {
			let mat = /^(.+) \(x(\d+)\)$/.exec(str);
			if (mat) {
				str = mat[1];
				cnt = Number(mat[2]);
			}
		}
		if (d.keys[str]) {
			if (cnt) {
				return d.color ? d.color + d.keys[str] + '*' + cnt + '\x1b[37m' : d.keys[str] + '*' + cnt;
			} else {
				return d.color ? d.color + d.keys[str] + '\x1b[37m' : d.keys[str];
			}
		}
	}
	return null;
};

let eqp = function (str) {
	const keys = [
		{
			Crude: '劣等',
			Fair: '一般',
			Average: '中等',
			Superior: '上等',
			Exquisite: '精良',
			Magnificent: '史诗',
			Legendary: '传奇',
			Peerless: '无双'
		},
		{
			Ethereal: '虚空',
			Fiery: '红莲(火)',
			Arctic: '北极(冰)',
			Tempestuous: '风暴(风)',
			Shocking: '雷鸣(雷)',
			Hallowed: '圣光(圣)',
			Demonic: '魔性(暗)'
		},
		{
			Charged: '充能的 (加速)',
			Frugal: '节约的 (节约)',
			Rediant: '',
			Mystic: '',
			Agile: '俊敏的 (加速)',
			Reinforced: '坚固的 (减伤)',
			Savage: '',
			Shielding: '盾化的 (格挡)',
			Mithril: '秘银的 (低重)',
			Ruby: '红宝石 (火抗)',
			Cobalt: '冰蓝的 (冰抗)',
			Amber: '琥珀的 (雷抗)',
			Jade: '翡翠的 (风抗)',
			Zircon: '锆石的 (圣抗)',
			Onyx: '缟玛瑙 (暗抗)'
		},
		{
			Cotton: '棉质',
			Phase: '相位',
			Leather: '皮革',
			Shade: '暗影',
			Plate: '板甲',
			Power: '动力',
			Oak: '橡木',
			Redwood: '红杉木',
			Willow: '柳木',
			Katalox: '铁木'
		},
		{
			Axe: '斧',
			Club: '棍',
			Rapier: '西洋剑',
			Shortsword: '短剑',
			Wakizashi: '胁差',
			Estoc: '刺剑',
			Longsword: '长剑',
			Mace: '重锤',
			Katana: '日本刀',
			Staff: '法杖',
			Buckler: '小圆盾',
			'Kite Shield': '鸢盾',
			'Force Shield': '立场盾',
			Cap: '帽',
			Helmet: '头盔',
			Robe: '长袍',
			Cuirass: '胸甲',
			Gloves: '手套',
			Gauntlets: '手甲',
			Pants: '裤',
			Greaves: '护胫',
			Shoes: '鞋',
			Boots: '靴子',
			Sabatons: '铁靴'
		},
		{
			'of Slaughter': '杀戮',
			'of Balance': '平衡',
			'of the Battlecaster': '战法师',
			'of the Nimble': '招架',
			'of the Vampire': '吸血鬼',
			'of the Illithid': '汲灵',
			'of the Banshee': '女妖',
			'of Swiftness': '迅捷',
			'of Destruction': '毁灭',
			'of Surtr': '苏尔特 (火伤)',
			'of Niflheim': '尼芙菲姆 (冰伤)',
			'of Mjolnir': '姆乔尔尼尔 (雷伤)',
			'of Freyr': '弗瑞尔 (风伤)',
			'of Heimdall': '海姆达 (圣伤)',
			'of Fenrir': '芬里尔 (暗伤)',
			'of Focus': '专注',
			'of the Elementalist': '元素使',
			'of the Heaven-sent': '天堂',
			'of the Demon-fiend': '恶魔',
			'of the Earth-walker': '地行者',
			'of the Curse-weaver': '咒术师',
			'of the Barrier': '格挡',
			'of Protection': '物防',
			'of Warding': '魔防',
			'of Dampening': '抑制',
			'of Stoneskin': '石肤',
			'of Deflection': '偏转',
		}
	];
	let result = '';
	keys.forEach(arr => {
		for (let k in arr) {
			if (str.substr(0, k.length) == k) {
				result = result + arr[k] + ' ';
				str = str.substr(k.length + 1);
				break;
			}
		}
	});
	if (str == '') {
		return '\x1b[31m' + result.substr(0, result.length - 1) + '\x1b[37m';
	} else {
		return '';
	}
};

module.exports = {
	key: key,
	eqp: eqp,
	log: function (str) {
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
					let final = '\x1b[33m' + mat[1] + '\x1b[37m';
					let k = key(mat[1]);
					if (k) {
						final = k;
					} else {
						let e = eqp(mat[1]);
						if (e) {
							final = e;
						}
					}
					newstr = newstr.replace(updateReg, final);
					mat = updateReg.exec(newstr);
				}
				break;
			}
		}
		return newstr || '\x1b[31m' + str + '\x1b[37m';
	}
};