var Api = {
	city: 'http://dpindex.dianping.com/ajax/citylist?keyword={0}&cityid={1}&categoryid={2}&regionid={3}',
	region: 'http://dpindex.dianping.com/ajax/regionlist?cityid={0}&shopids={1}',
	catetory: 'http://dpindex.dianping.com/ajax/categorylist?cityid={0}&shopids={1}',
	spiderPages: {
		shopRankByCity: 'http://dpindex.dianping.com/dpindex'
	}
}

var Config = {
	citys: [{
		key: 2,
		name: '北京'
	}],
	dpMax: 5,
	dpIndexParam: {
		category: '',
		region: '',
		type: '',
		city: ''
	}
}

module.exports = {
	Api: Api,
	Config: Config
}