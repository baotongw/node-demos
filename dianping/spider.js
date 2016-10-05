var http = require('http');
var querystring = require('querystring');
var superagent = require('superagent');
var cheerio = require('cheerio');
var util = require('util');
var extend = require('extend');

var config = require('./config.js');
var Api = config.Api,
	Config = config.Config;

var options = {
	hostname: 'dpindex.dianping.com',
	port: 80,
	path: '/dpindex'
}

var args = {
	city: '',
	region: '',
	category: '',
	type: 'rank',
	p: ''
}

var data = extend(true, {}, Config.dpIndexParam);
var result = {};
var globalIndex = 0, globalCount = Config.dpMax;
var url = 'http://dpindex.dianping.com/dpindex?'
var shopIdPattern = /.+?(\d+)/;
Config.citys.forEach(item => {

	result[item.name] = {};
	args.city = item.key;

	for (var i = 1; i <= Config.dpMax; i++) {
		

		(function(i) {
			var tempShop = result[item.name]['page' + i] = {};
			args.p = i;
			var path = url + querystring.stringify(args);
			console.log('请求地址为：')
			console.log(path)

			superagent.get(path)
				.end(function (err, res) {
					globalIndex++;
					if (err) return console.log(err.stack);
					// console.log(res.text)
					var $ = cheerio.load(res.text);
					var $list = $('.idxmain-rank').find('li');

					$list.each((i, shopItem) => {

						var $shopItem = $(shopItem);
						var shopUrl = $shopItem.find('a').attr('href');
						var shop = {};

						if(shopUrl) {
							shop.rank = $shopItem.find('.ranknum').text();
							shop.shopUrl = shopUrl;
							shop.shopName = $shopItem.find('.field-name').text();
							shop.addr = $shopItem.find('.field-addr').text();
							shop.hotIndex = $shopItem.find('.field-index').text();
							shop.shopId = shop.shopUrl.match(shopIdPattern)[1];

							tempShop[shop.rank] = shop;
							console.log('shopInfo')
							console.log(shop)	
						}
					})

					if(globalIndex === globalCount) {
						console.log(result);
					}
				});	
		})(i)
	}
})