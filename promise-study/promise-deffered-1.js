var fs = require('fs');

// 1.0版本开始真正支持链式调用，fetch就是这样的调用模式
// 在此之前，then方法只接受成功、失败、progress的handler
promise()
	.then(obj.api1)
	.then(obj.api2)
	.then(obj.api3)
	.then(function(val3) {

	}, function(error) {

	})
	.done();

var Promise = function() {
	this.queue = [];
	this.isPromise = true;
}

Promise.prototype.then = function(fulfilledHandler, errorHandler, progressHandler) {
	var handler = {};

	if (typeof fulfilledHandler === 'function') {
		handler.fulfilled = fulfilledHandler;
	} else if (typeof errorHandler === 'function') {
		handler.error = errorHandler;
	}

	this.queue.push(handler);
	return this;
}

var Deffered = function() {
	this.promise = new Promise();
}

Deffered.prototype.resolve = function(obj) {
	var promise = this.promise;
	var handler;

	while ((handler = promise.queue.shift())) {
		if(handler && handler.fulfilled) {
			var ret = handler.fulfilled(obj);
			if(ret && ret.isPromise) {
				// 已经shift了一个
				ret.queue = promise.queue
				this.promise = ret;
				return
			}
		}
	}
}

Deffered.prototype.reject = function(error) {
	var promise = this.promise;
	var handler;

	while((handler = promise.queue.shift())) {
		if(handler && handler.error) {
			var ret = handler.error(error)

			if(ret && ret.isPromise) {
				ret.queue = promise.queue
				this.promise = ret;
				return;
			}
		}
	}
}

Deffered.prototype.callback = function() {
	var me = this;
	return function(err, file) {
		if(err) {
			return me.reject(err);
		}

		me.resolve(file);
	}
}

// 实际使用
var readFile1 = function(filePath, encoding) {
	var deffered = new Deffered();

	fs.readFile(filePath, encoding, deffered.callback())

	return deffered.promise
}

var readFile2 = function(filePath, encoding) {
	var deffered = new Deffered();
	fs.readFile(filePath, encoding, deffered.callback())

	return deffered.promise;
}

readFile1('file1.txt', 'utf-8')
	.then(function(file1) {
		return readFile2(file1, 'utf-8')
	})
	.then(function(file2) {
		console.log(file2)
	})

// 对于上述readFile1，readFile2的定义可以通过偏函数进一步优化
// 给与普通函数promise化的支持
// smooth 函数赋予method promise的能力
var smooth = function(method) {
	// function wrapper include method and deffered
	return function() {
		var deffered = new Deffered();
		// copy current arguments
		var args = Array.prototype.slice(arguments, 0);
		// add deffered callback
		// 这里提供一个处理函数返回值的通用callback，包含了当前deffered的resolve、reject方法
		args.push(deffered.callback());
		method.apply(null, args);

		return deffered.promise;
	}
}

var readFile = smooth(fs.readFile);
readFile('file1.txt', 'utf-8')
	.then(function(file1) {
		readFile(file1, 'utf-8')
	})
	.then(function(file2) {
		console.log(file2);
	})