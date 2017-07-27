/**
    MogicProtocal
**/
var MPackage = {};
var Message = {};
var MEvent = {};
MPackage.TYPE_HANDSHAKE = 1;
MPackage.TYPE_HANDSHAKE_ACK = 2;
MPackage.TYPE_HEARTBEAT = 3;
MPackage.TYPE_DATA = 4;
MPackage.TYPE_KICK = 5;

Message.TYPE_REQUEST = 0;
Message.TYPE_NOTIFY = 1;
Message.TYPE_RESPONSE = 2;
Message.TYPE_PUSH = 3;

MEvent.ON_PACKAGE = 1001;
/**
 * 通信包格式
 * @param  {[type]} type    [description]
 * @param  {[type]} message [description]
 * @return {[type]}         [description]
 */
MPackage.getPackage = function(type, message){
    if (!message) return [type];
    return [type, message]
}
/**
 * 数据内容格式
 * @param  {[type]} type     [description]
 * @param  {[type]} data     [description]
 * @param  {[type]} addition [description]
 * @return {[type]}          [description]
 */
Message.getMessage = function(type, data, addition){
    return [type, data, addition]
}
var MogicBaseClass = require("MogicBaseClass");
var MogicProtocal = cc.Class({
    extends: MogicBaseClass,
    properties: {
    },

    ctor:function(){
    },

    encode:function(pack){
        return JSON.stringify(pack)+"\r\n";
    },
    decode:function(str){
        return JSON.parse(str);
    },
    onData:function(data){
        cc.log("MogicProtocal:onData", data);
        if (!this.buffer) this.buffer = "";
        this.buffer += data;
        this.tickPackage();
    },
    tickPackage:function(){
        cc.log(this.buffer)
        if (this.buffer.indexOf("\r\n") > 0 ){
            var array = this.buffer.split("\r\n");
            for (var i = 0; i < array.length - 1; i++){
                var _pack = this.decode(array[i]);
                // this.cb(_p);
                this.emit(MEvent.ON_PACKAGE, _pack);
            }
            this.buffer = array[array.length - 1];
        }
    }
});
MogicProtocal.Message = Message;
MogicProtocal.MPackage = MPackage;
MogicProtocal.MEvent = MEvent;
module.exports = MogicProtocal;