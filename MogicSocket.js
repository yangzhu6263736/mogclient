/**
    MogicSocketClient
**/
var MogicVO = require('MogicVO')
var Protocal = require("MogicProtocal")
var MogicBaseClass = require("MogicBaseClass");

var MogicSocket = cc.Class({
    name: "MogicSocket",
    extends: MogicBaseClass,
    properties: {
    },
    ctor: function () {
        // 声明实例变量并赋默认值
        cc.log("MogicSocketClient:ctor")
        var self = this;
        this._heartbeatTicker = false;
        this._lastHeartbeatTime = 0;
        this._isConnected = false;
        this._reqeustHandle = {};
        this._reqHandleId = 1;
        this._session_id = false;
        this._host = false;
        this._port = false;
        this._autoRetry = true;//是否自动重连
    },

    connect: function (host, port, isRetry) {
        var self = this;
        this._host = host;
        this._port = port;
        this._sock = new WebSocket("ws://" + host + ":" + port);
        this.protocal = new Protocal();
        this.protocal.on(Protocal.MEvent.ON_PACKAGE, function (pack) {
            cc.log("onpackage")
            self._onPackage(pack);
        })

        this._sock.onopen = function () {
            self._onOpen(isRetry);
        }
        this._sock.onclose = this._onClose.bind(this);
        this._sock.onmessage = function (event) {
            self._lastHeartbeatTime = self.getNowTime();
            self.protocal.onData(event.data)
        };
    },

    initHeartBeatTicker: function () {
        var self = this;
        var _heartFunc = function () {
            cc.log("_heartFunc")
            var pack = Protocal.MPackage.getPackage(Protocal.MPackage.TYPE_HEARTBEAT);
            self._sock.send(self.protocal.encode(pack));
        }
        this._heartbeatTicker = setInterval(function () {
            _heartFunc();
            var nt = self.getNowTime();
            if (nt - self._lastHeartbeatTime > 15) {
                cc.log("心跳超时", nt - self._lastHeartbeatTime);
                self._sock.close();
            }
        }, 10000)
    },

    bindSession:function(session_id){
        this._session_id = session_id;
    },

    request: function (route, params, cb) {
        if (!params) params = {};
        var handleId = this._reqHandleId++;
        this._reqeustHandle[handleId] = cb;
        if (this._session_id) params['session_id'] = this._session_id;
        var data = [route, params];
        var message = Protocal.Message.getMessage(Protocal.Message.TYPE_REQUEST, data, handleId);//response中回传handleId实现异步回调
        var pack = Protocal.MPackage.getPackage(Protocal.MPackage.TYPE_DATA, message);
        this._sock.send(this.protocal.encode(pack));
    },

    notify: function (route, params) {
        var data = [route, params];
        var message = Protocal.Message.getMessage(Protocal.Message.TYPE_NOTIFY, data);
        var pack = Protocal.MPackage.getPackage(Protocal.MPackage.TYPE_DATA, message);
        this._sock.send(self.protocal.encode(pack));
    },

    getNowTime: function () {
        return Math.round(new Date().getTime() / 1000);
    },

    _onOpen: function (isRetry) {
        cc.log("_onOpen")
        this._isConnected = true;
        this._lastHeartbeatTime = this.getNowTime();
        this.initHeartBeatTicker();
        var self = this;
        if (isRetry) {
            this.emit('ReConnected');
        } else {
            this.emit('Connected');
        }
    },
    _onClose: function () {
        var self = this;
        this._isConnected = false;
        clearInterval(this._heartbeatTicker);
        this.emit('DisConnected');
        if (this._autoRetry) {
            setTimeout(function() {
                self.connect(self._host, self._port, true);
            }, 1000);
        }
        cc.log("onclose")
    },

    _onPackage: function (_package) {
        this._lastHeartbeatTime = this.getNowTime();
        var packageType = _package[0], message = _package[1]
        switch (packageType) {
            case Protocal.MPackage.TYPE_DATA:
                this._onMsg(message);
                break;
            case Protocal.MPackage.TYPE_HEARTBEAT:
                cc.log("heart back");
                break;
        }
    },

    _onMsg: function (message) {
        var messageType = message[0], data = message[1], addition = false;
        if (message[2]) addition = message[2];
        switch (messageType) {
            case Protocal.Message.TYPE_RESPONSE:
                var handle = this._reqeustHandle[addition];
                delete this._reqeustHandle[addition];
                if (data[1]['session_id']) this._session_id = data[1]['session_id'];
                handle(data[0], data[1]);
                break;
            case Protocal.Message.TYPE_PUSH:
                var _eventname = data[0], _params = data[1];
                this.emit(_eventname, _params);
                break;
        }
    },
    disconnect: function () {
        this._autoRetry = false;
        this._sock.close();
    }

});

module.exports = MogicSocket;