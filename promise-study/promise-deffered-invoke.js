var PD = require('./promise-deffered.js');
var Promise = PD.promise;
var Deffered = PD.Deffered;

function getResponse(resp) {
	var defferd = new Deffered();
	// 这里负责触发
	resp.on('data', function(chunk) {
		deffered.progress(chunk)
	})

	resp.on('end', function(data) {
		deffered.resolve(data)
	})

	resp.on('error', function(data) {
		deffered.reject(data);
	})

	// 这里返回promise是为了不让外部程序获得resolve，reject
	// jQuery的ajax方法内部就做了这样的处理
	return deffered.promise;
}

var promise = getData();

// 这里负责绑定回调
promise.then(function(result) {
	console.log('success')
}, function(error) {
	console.log('error')
}, function(chunk) {
	console.log('in progress, chunk: ' + chunk)
})