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
            var MogicSocket = require("MogicSocket");
            this.mogicSocket = new MogicSocket();
            this.mogicSocket.on("ClientEvent", function(params){
                cc.log("ClientEvent", params)
            })
            this.mogicSocket.on('Connected', function(){
                var params = {
                    user:'yangzhu',
                    passwd:'123456'
                }
                self.mogicSocket.request('hall/user/login', params, function(err, res){
                    cc.log("hall/user/login", err, res);
                    self.mogicSocket.request('hall/hall/enter', params, function(err, res){
                        cc.log("hall/hall/enter back", err, res)
                    })

                })
            })
            // this.label.string = this.text;

            // this._sock = new WebSocket("ws://60.191.205.121:3736"); 
            // this._sock.onopen = this._onOpen.bind(this);
            // this._sock.onclose = this._onClose.bind(this);
            this.mogicSocket.onmessage = this._onMessage.bind(this);
        },

    
        _onMessage:function(err, rep){
            cc.log("onmessage", err, rep)
        },

        // called every frame
        update: function (dt) {

        },
    });
