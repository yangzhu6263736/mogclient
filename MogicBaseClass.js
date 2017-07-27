var MogicBaseClass = cc.Class({
    properties: {
    },
 	ctor: function () {
 		this.handleid = 0;
    },
    on:function(eventname, callback){
    		if (!this.eventhandles) this.eventhandles = {};
    		this.handleid++;
    		this.eventhandles[this.handleid] = [eventname, callback];
    		return this.handleid;
    },
    emit:function(eventname, params){
    		for (var handleid in this.eventhandles) {
    			if (this.eventhandles[handleid][0] == eventname) {
    				this.eventhandles[handleid][1](params);
    			}
    		}
    }
});
module.exports = MogicBaseClass;