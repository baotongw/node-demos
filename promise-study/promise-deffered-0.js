// Promise - Deffered 模式提供了先调用后处理回调的变成模式
// Jquery 中的promise - deffered模式最为流行
// $.get(url).success(onSuccess).error(onError).complete(onComplete)
// CommonJS 草案中的promise逐步演变出了Promises/A、Promises/B、Promises/D

// Promises/A - 包含Promise 和Deffered两部分
// Promises/A对单个异步操作的定义
// 1. Promise操作只会处在3中状态中的一种：未完成、完成、失败
// 2. Promise的状态只会从未完成转变为完成或者失败，不能逆转，完成和失败互斥
// 3. Promise的状态一旦转变，不能更改

// 对于Promise对象，只要具备then()方法即可，对于then方法有一下要求
// 1. 接受完成、失败的回调方法。在完成操作或出现错误时，调用对应方法
// 2. 可选的支持progress事件回调作为第三个方法
// 3. then()方法只接受function对象，其余对象将被忽略
// 4. then()方法继续返回Promise对象，以实现链式调用

// 基于node Event模块的Promise实现
var Promise = function() {
	EventEmitter.call(this);
}
// 继承node的event模块（接口）
util.inherits(Promise, EventEmitter);

// 这个版本的then并不能支持多个then的链式调用
Promise.prototype.then = function(fulfillHandler, errorHandler, progressHandler) {
	if(typeof fulfillHandler === 'function') {
		// once继承自EventEmitter, 确保回调只执行一次
		this.once('success', fulfillHandler);
	} else if(typeof errorHandler === 'function') {
		this.once('error', errorHandler);
	} else if(typeof progressHandler === 'function') {
		this.on('progress', progressHandler);
	}

	return this;
}

var Deffered = function() {
	this.state = 'init';
	this.promise = new Promise();
}

Deffered.prototype.resolve = function(result) {
	this.state = 'fulfilled';
	this.promise.emit('success', result);
}

Deffered.prototype.reject = function(error) {
	this.state = 'failed';
	this.promise.emit('error', error);
}

Deffered.prototype.progress = function(data) {
	this.promise.emit('progress', data);
}

// 处理多个异步调用的方法
// 这里的promise是在外部创建好的，他们是多个Deffered的返回值
// 然后通过一个总的Deffered来控制最终状态
Deffered.prototype.all = function(promises) {
	var count = promises.length;
	var me = this;
	var results = [];

	promises.forEach(function(primise, i) {
		promise.then(function(data) {
			count--;
			results[i] = data;
			if(count === 0) {
				me.resolve(results);
			}
		}, function(error) {
			me.reject(error)
		})
	})
	// 通过分别处理多个promise的状态判断，实现在
	return this.promise;
}

module.exports = {
	Promise,
	Deffered
}