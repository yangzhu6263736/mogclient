# mogclient
mogic wetsocket client for cocos creator
========
调用方式

    cc.Class({
        extends: cc.Component,

        properties: {
            label: {
                default: null,
                type: cc.Label
            },
            // defaults, set visually when attaching this script to the Canvas
            text: 'Hello, World!'
        },

        // use this for initialization
        onLoad: function () {
            var self = this;
            cc.sys.localStorage.setItem('session_id', "");
            var MogicSocket = require("MogicSocket");
            this.hallSocket = new MogicSocket();
            this.hallSocket.on("ClientEvent", function(params){
                cc.log("ClientEvent", params)
            })
            this.hallSocket.on('Connected', function(){
                self.onConnected();
            });
            this.hallSocket.on('ReConnected', function(){
                var params = {};
                self.hallSocket.request('hall/hall/enter', params, function(err, res){
                    cc.log("hall/hall/enter back", err, res)
                    if (res['UserNotLogin']) return self.showLoginView();
                })
            });

            this.hallSocket.on('DisConnected', function(){
                
            });
            this.hallSocket.connect('60.191.205.121', 3736);
            // this.label.string = this.text;

            // this._sock = new WebSocket("ws://60.191.205.121:3736"); 
            // this._sock.onopen = this._onOpen.bind(this);
            // this._sock.onclose = this._onClose.bind(this);
            // this.hallSocket.onmessage = this._onMessage.bind(this);
        },
        

        onConnected:function(){
            var self = this;
            var session_id = cc.sys.localStorage.getItem('session_id');
            
            if (session_id) {
                self.hallSocket.bindSession(session_id);
                var params = {};
                self.hallSocket.request('hall/hall/enter', params, function(err, res){
                    cc.log("hall/hall/enter back", err, res)
                    if (res['UserNotLogin']) return self.showLoginView();
                })
            } else {
                this.showLoginView();
            }
        },

        showLoginView:function(){
            cc.log("showLoginView")
            var self = this;
            setTimeout(function() {
                self.doLogin();
            }, 3000);
        },

        doLogin:function(){
            var self = this;
            var params = {
                user:'yangzhu',
                passwd:'123456'
            }
            self.hallSocket.request('hall/user/login', params, function(err, res){
                cc.log("hall/user/login", err, res);
                var session_id = res['session_id'];
                cc.sys.localStorage.setItem('session_id', session_id);
                self.hallSocket.request('hall/hall/enter', params, function(err, res){
                    cc.log("hall/hall/enter back", err, res)
                })
            })
        },

    
        _onMessage:function(err, rep){
            cc.log("onmessage", err, rep)
        },

        // called every frame
        update: function (dt) {

        },
    });

