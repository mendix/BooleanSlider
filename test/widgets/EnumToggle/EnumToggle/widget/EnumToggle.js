dojo.declare('EnumToggle.widget.EnumToggle', mxui.widget._WidgetBase,{
	mixins : [ mendix.addon._Contextable ],
    inputargs: {
		name			: '',
		defaultpicture: '',
		notused			: [], //value array, keep it compatible with mx4
		readonlyval		: false,
		onChangemf		: ''
    },

	//IMPLEMENTATION
	contextGUID: null, 
	caption: [],
	imgurls: [],
	imgalts: [],
	curindex: 0,
	img: null,
	
	postCreate : function(){
		var i;
		this.caption = [];
		this.impurls = [];
		this.imgalts = [];
		// copy data from object array
		for (i=0; i<this.notused.length; i++) {
			this.caption.push(this.notused[i].captions);
			this.imgurls.push(this.notused[i].pictures);
			this.imgalts.push(this.notused[i].alts);
		}
		this.img = dojo.doc.createElement('img');
		dojo.attr(this.img, {
			src: this.defaultpicture,
			style: {cursor: "pointer"}
		});			
		this.domNode.appendChild(this.img);
		if (!this.readonlyval) {
			this.connect(this.img, 'onclick', dojo.hitch(this, this.onClick));
		}
		//this.initContext();
		this.actLoaded();
	},
	update : function(obj, callback){
		console.log('update');
		if(obj){
			this.contextGUID = obj.getGuid();
		}
		if (callback) {
			callback();
		}
	},
    _setValueAttr : function(value) {
		var i = this.caption.indexOf(value);
		var imgurl = "";
		var imgalt = "";
		if ((i >= 0) && (i < this.caption.length)) {
			this.curindex = i;
			imgurl = this.imgurls[i];
			imgalt = this.imgalts[i];
		} else {
			this.curindex = 0;
			imgurl = this.defaultpicture;
			imgalt = "";
		}
		dojo.attr(this.img, {
			src: imgurl,
			alt: imgalt,
			title: imgalt
		});			
	},
    _getValueAttr : function(value) {
		return this.caption[this.curindex];
	},
	//stub function, will be used or replaced by the client environment
	onChange : function(){
	},	
	textChange : function (e) {
        this.onChange();
	},
	onClick : function (e) {
		this.curindex = (this.curindex >= this.caption.length - 1 ? 0 : this.curindex + 1);
		dojo.attr(this.img, {
			src: this.imgurls[this.curindex],
			title: this.imgalts[this.curindex]
		});		
        this.onChange();		
		var mf = this.onChangemf;
		if (mf != '') {
			var args = {
				actionname	: mf,
				callback	: function() {
				},
				error		: function() {
				},
				applyto: 'selection',
				guids: [this.contextGUID]
			};
			mx.xas.action(args);
		}		
	}

});