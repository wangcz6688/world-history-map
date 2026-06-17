/**
 * 世界国家/地区中文名映射表
 * 数据源字段：name, ISO3166-1-Alpha-3 (ISO3), ISO3166-1-Alpha-2 (ISO2)
 */

// 有 ISO3 代码的国家/地区（key = ISO3 代码）
const COUNTRY_NAME_ZH = {
  AFG: '阿富汗', ALA: '奥兰群岛', ALB: '阿尔巴尼亚', DZA: '阿尔及利亚',
  ASM: '美属萨摩亚', AND: '安道尔', AGO: '安哥拉', AIA: '安圭拉',
  ATA: '南极洲', ATG: '安提瓜和巴布达', ARG: '阿根廷', ARM: '亚美尼亚',
  ABW: '阿鲁巴', AUS: '澳大利亚', AUT: '奥地利', AZE: '阿塞拜疆',
  BHR: '巴林', BGD: '孟加拉国', BRB: '巴巴多斯', BLR: '白俄罗斯',
  BEL: '比利时', BLZ: '伯利兹', BEN: '贝宁', BMU: '百慕大',
  BTN: '不丹', BOL: '玻利维亚', BIH: '波黑', BWA: '博茨瓦纳',
  BRA: '巴西', IOT: '英属印度洋领地', VGB: '英属维尔京群岛',
  BRN: '文莱', BGR: '保加利亚', BFA: '布基纳法索', BDI: '布隆迪',
  CPV: '佛得角', KHM: '柬埔寨', CMR: '喀麦隆', CAN: '加拿大',
  CYM: '开曼群岛', CAF: '中非共和国', TCD: '乍得', CHL: '智利',
  CHN: '中国', COL: '哥伦比亚', COM: '科摩罗', COK: '库克群岛',
  CRI: '哥斯达黎加', HRV: '克罗地亚', CUB: '古巴', CUW: '库拉索',
  CYP: '塞浦路斯', CZE: '捷克', COD: '刚果民主共和国', DNK: '丹麦',
  DJI: '吉布提', DMA: '多米尼克', DOM: '多米尼加', TLS: '东帝汶',
  ECU: '厄瓜多尔', EGY: '埃及', SLV: '萨尔瓦多', GNQ: '赤道几内亚',
  ERI: '厄立特里亚', EST: '爱沙尼亚', ETH: '埃塞俄比亚',
  FLK: '马尔维纳斯群岛', FRO: '法罗群岛', FSM: '密克罗尼西亚联邦',
  FJI: '斐济', FIN: '芬兰', PYF: '法属波利尼西亚', ATF: '法属南方领地',
  GAB: '加蓬', GMB: '冈比亚', GEO: '格鲁吉亚', DEU: '德国',
  GHA: '加纳', GIB: '直布罗陀', GRC: '希腊', GRL: '格陵兰',
  GRD: '格林纳达', GUM: '关岛', GTM: '危地马拉', GGY: '根西岛',
  GIN: '几内亚', GNB: '几内亚比绍', GUY: '圭亚那', HTI: '海地',
  HMD: '赫德岛和麦克唐纳群岛', HND: '洪都拉斯', HKG: '中国香港',
  HUN: '匈牙利', ISL: '冰岛', IND: '印度', IDN: '印度尼西亚',
  IRN: '伊朗', IRQ: '伊拉克', IRL: '爱尔兰', IMN: '马恩岛',
  ISR: '以色列', ITA: '意大利', CIV: '科特迪瓦', JAM: '牙买加',
  JPN: '日本', JEY: '泽西岛', JOR: '约旦', KAZ: '哈萨克斯坦',
  KEN: '肯尼亚', KIR: '基里巴斯', KWT: '科威特', KGZ: '吉尔吉斯斯坦',
  LAO: '老挝', LVA: '拉脱维亚', LBN: '黎巴嫩', LSO: '莱索托',
  LBR: '利比里亚', LBY: '利比亚', LIE: '列支敦士登', LTU: '立陶宛',
  LUX: '卢森堡', MAC: '中国澳门', MDG: '马达加斯加', MWI: '马拉维',
  MYS: '马来西亚', MDV: '马尔代夫', MLI: '马里', MLT: '马耳他',
  MHL: '马绍尔群岛', MRT: '毛里塔尼亚', MUS: '毛里求斯', MEX: '墨西哥',
  MDA: '摩尔多瓦', MCO: '摩纳哥', MNG: '蒙古', MNE: '黑山',
  MSR: '蒙特塞拉特', MAR: '摩洛哥', MOZ: '莫桑比克', MMR: '缅甸',
  NAM: '纳米比亚', NRU: '瑙鲁', NPL: '尼泊尔', NLD: '荷兰',
  NCL: '新喀里多尼亚', NZL: '新西兰', NIC: '尼加拉瓜', NER: '尼日尔',
  NGA: '尼日利亚', NIU: '纽埃', NFK: '诺福克岛', PRK: '朝鲜',
  MKD: '北马其顿', MNP: '北马里亚纳群岛', OMN: '阿曼', PAK: '巴基斯坦',
  PLW: '帕劳', PSE: '巴勒斯坦', PAN: '巴拿马', PNG: '巴布亚新几内亚',
  PRY: '巴拉圭', PER: '秘鲁', PHL: '菲律宾', PCN: '皮特凯恩群岛',
  POL: '波兰', PRT: '葡萄牙', PRI: '波多黎各', QAT: '卡塔尔',
  SRB: '塞尔维亚', COG: '刚果共和国', ROU: '罗马尼亚', RUS: '俄罗斯',
  RWA: '卢旺达', BLM: '圣巴泰勒米', SHN: '圣赫勒拿', KNA: '圣基茨和尼维斯',
  LCA: '圣卢西亚', MAF: '法属圣马丁', SPM: '圣皮埃尔和密克隆',
  VCT: '圣文森特和格林纳丁斯', WSM: '萨摩亚', SMR: '圣马力诺',
  SAU: '沙特阿拉伯', SEN: '塞内加尔', SYC: '塞舌尔', SLE: '塞拉利昂',
  SGP: '新加坡', SXM: '荷属圣马丁', SVK: '斯洛伐克', SVN: '斯洛文尼亚',
  SLB: '所罗门群岛', SOM: '索马里', ZAF: '南非', SGS: '南乔治亚群岛',
  KOR: '韩国', SSD: '南苏丹', ESP: '西班牙', LKA: '斯里兰卡',
  SDN: '苏丹', SUR: '苏里南', SWE: '瑞典', CHE: '瑞士', SYR: '叙利亚',
  STP: '圣多美和普林西比', TWN: '中国台湾', TJK: '塔吉克斯坦', THA: '泰国',
  BHS: '巴哈马', TGO: '多哥', TON: '汤加', TTO: '特立尼达和多巴哥',
  TUN: '突尼斯', TUR: '土耳其', TKM: '土库曼斯坦', TCA: '特克斯和凯科斯群岛',
  TUV: '图瓦卢', UGA: '乌干达', UKR: '乌克兰', ARE: '阿联酋',
  GBR: '英国', TZA: '坦桑尼亚', UMI: '美国本土外小岛屿',
  VIR: '美属维尔京群岛', USA: '美国', URY: '乌拉圭', UZB: '乌兹别克斯坦',
  VUT: '瓦努阿图', VAT: '梵蒂冈', VEN: '委内瑞拉', VNM: '越南',
  WLF: '瓦利斯和富图纳', ESH: '西撒哈拉', YEM: '也门', ZMB: '赞比亚',
  ZWE: '津巴布韦', SWZ: '斯威士兰',
};

// 无 ISO3 代码的争议地区/特殊区域（key = 英文名）
const COUNTRY_NAME_ZH_BY_NAME = {
  'Akrotiri Sovereign Base Area': '阿克罗蒂里',
  'Ashmore and Cartier Islands': '阿什莫尔和卡捷群岛',
  'Bajo Nuevo Bank (Petrel Is.)': '巴霍努埃沃礁',
  'Baykonur Cosmodrome': '拜科努尔',
  'Bir Tawil': '比尔泰维勒',
  'Brazilian Island': '巴西岛',
  'Clipperton Island': '克利珀顿岛',
  'Coral Sea Islands': '珊瑚海群岛',
  'Cyprus No Mans Area': '塞浦路斯无人区',
  'Dhekelia Sovereign Base Area': '德凯利亚',
  'France': '法国',
  'Indian Ocean Territories': '印度洋领地',
  'Kosovo': '科索沃',
  'Northern Cyprus': '北塞浦路斯',
  'Norway': '挪威',
  'Scarborough Reef': '黄岩岛',
  'Serranilla Bank': '塞拉尼利亚浅滩',
  'Siachen Glacier': '锡亚琴冰川',
  'Somaliland': '索马里兰',
  'Southern Patagonian Ice Field': '南巴塔哥尼亚冰原',
  'Spratly Islands': '南沙群岛',
  'US Naval Base Guantanamo Bay': '关塔那摩基地',
};

/**
 * 根据属性获取中文国名
 * @param {string} iso3 ISO3166-1-Alpha-3 代码
 * @param {string} name 英文名
 * @returns {string} 中文国名
 */
function getCountryNameZh(iso3, name) {
  return COUNTRY_NAME_ZH[iso3] || COUNTRY_NAME_ZH_BY_NAME[name] || name;
}