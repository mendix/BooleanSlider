/*jslint white:true, nomen: true, plusplus: true */
/*global mx, define, require, browser, devel, console */
/*mendix */
/**

	Boolean Slider
	========================

	@file      : BooleanSlider.js
	@version   : 1.1
	@author    : Chad Evans
	@copyright : Mendix Technology BV
	@license   : Apache License, Version 2.0, January 2004

	Documentation
    ========================
	Provides a alternative to a check box, commonly referred to as a slider control.
    Can be used in both web and mobile contexts.

*/


require({}, [
    'dojo/_base/declare', 'mxui/widget/_WidgetBase', 'dijit/_TemplatedMixin',
    'mxui/dom', 'dojo/dom', 'dojo/query', 'dojo/dom-prop', 'dojo/dom-geometry', 'dojo/dom-class', 'dojo/dom-style', 'dojo/dom-construct', 'dojo/_base/array', 'dojo/_base/lang', 'dojo/text',
    'dojo/text!BooleanSlider/widget/templates/BooleanSlider.html'
], function (declare, _WidgetBase, _TemplatedMixin, dom, dojoDom, domQuery, domProp, domGeom, domClass, domStyle, domConstruct, dojoArray, lang, text, widgetTemplate) {
    'use strict';

    // Declare widget's prototype.
    return declare('BooleanSlider.widget.BooleanSlider', [_WidgetBase, _TemplatedMixin], {
        // _TemplatedMixin will create our dom node using this HTML template.
        templateString: widgetTemplate,

        // Parameters configured in the Modeler.
        dataAttr: "",
        onChangeMF: "",
        trueValue: "",
        falseValue: "",
        editable: "",

        // Internal variables. Non-primitives created in the prototype are shared between all widget instances.
        _data: {},
        _attribute: null,
        _editable: true,

        // dojo.declare.constructor is called to construct the widget instance. Implement to initialize non-primitive properties.
        constructor: function () {},

        // dijit._WidgetBase.postCreate is called after constructing the widget. Implement to do extra setup work.
        postCreate: function () {
            console.log(this.id + '.postCreate');

            // postCreate
            var path, trueNode, falseNode;

            // To be able to use this widget with multiple instances of itself we need to add a data variable.
            this._data[this.id] = {
                _contextGuid: null,
                _contextObj: null,
                _handleObj: null,
                _handleAttr: null
            };

            path = this.dataAttr.split("/");
            this._attribute = path[path.length - 1];

            trueNode = domQuery("#" + this.id + " .wgt-BooleanSlider__toggletrue");
            if (trueNode && trueNode.length > 0) {
                trueNode[0].innerText = this.trueValue;
            } else {
                console.log(this.id + '.postCreate - startup trueNode not found');
            }

            falseNode = domQuery("#" + this.id + " .wgt-BooleanSlider__togglefalse");
            if (falseNode && falseNode.length > 0) {
                falseNode[0].innerText = this.falseValue;
            } else {
                console.log(this.id + '.postCreate - startup falseNode not found');
            }

            this._editable = /true/.test(this.editable);

            this._setupEvents();
        },

        // mxui.widget._WidgetBase.update is called when context is changed or initialized. Implement to re-render and / or fetch data.
        update: function (obj, callback) {
            console.log(this.id + '.update');

            if (obj === null) {
                console.log(this.id + '.update - We did not get any context object!');
                if (!domClass.contains(this.domNode, 'hidden')) {
                    domClass.add(this.domNode, 'hidden');
                }
            } else {
                if (domClass.contains(this.domNode, 'hidden')) {
                    domClass.remove(this.domNode, 'hidden');
                }
                this._data[this.id]._contextObj = obj;
                this._resetSubscriptions();
                this._loadData();
            }

            // Execute callback.
            if (typeof callback !== 'undefined') {
                callback();
            }
        },

        // mxui.widget._WidgetBase.enable is called when the widget should enable editing. Implement to enable editing if widget is input widget.
        enable: function () {
            console.log(this.id + '.enable');
            if (/true/.test(this.editable)) {
                this._editable = true;
            }
            this._loadData();
        },

        // mxui.widget._WidgetBase.disable is called when the widget should disable editing. Implement to disable editing if widget is input widget.
        disable: function () {
            console.log(this.id + '.disable');
            this._editable = false;
            this._loadData();
        },

        // mxui.widget._WidgetBase.uninitialize is called when the widget is destroyed. Implement to do special tear-down work.
        uninitialize: function () {
            // Clean up listeners, helper objects, etc. There is no need to remove listeners added with this.connect / this.subscribe / this.own.
            this._cleanupSubscriptions();
        },

        _setupEvents: function () {
            this.connect(this.domNode, 'click', function () {
                this._saveData();
                this._execMF(this._data[this.id]._contextObj, this.onChangeMF);
                //this._resetSubscriptions();
            });
        },

        _loadDataCallback: function (objs) {
            // Set the object as background.
            this._data[this.id]._contextObj = objs[0];

            // Load data again.
            this._loadData();
        },

        _loadData: function () {
            console.log(this.id + '._loadData');

            var control, nodeIndex, node,
                // get the data value to load
                checked = this._data[this.id]._contextObj.get(this._attribute);

            for (nodeIndex = 0; nodeIndex < this.domNode.childNodes.length; nodeIndex++) {
                node = this.domNode.childNodes[nodeIndex];
                if (node.tagName && node.tagName.toUpperCase() === 'INPUT') {
                    control = node;
                }
            }
            if (control) {
                if (checked !== null && checked) {
                    control.checked = true;
                } else {
                    control.checked = false;
                }

                if (!this._editable ||
                    this.readOnly ||
                    this._data[this.id]._contextObj.isReadonlyAttr(this._attribute)
                ) {
                    control.setAttribute("disabled", "");
                } else {
                    control.removeAttribute("disabled");
                }
            }
        },

        _saveData: function () {
            // get the data value to save
            var nodeIndex, node;

            for (nodeIndex = 0; nodeIndex < this.domNode.childNodes.length; nodeIndex++) {
                node = this.domNode.childNodes[nodeIndex];
                if (node.tagName && node.tagName.toUpperCase() === 'INPUT') {
                    this._data[this.id]._contextObj.set(this._attribute, node.checked);
                }
            }
        },

        _cleanupSubscriptions: function () {
            if (this._data[this.id]._handleObj) {
                mx.data.unsubscribe(this._data[this.id]._handleObj);
                this._data[this.id]._handleObj = null;
            }
            if (this._data[this.id]._handleAttr) {
                mx.data.unsubscribe(this._data[this.id]._handleAttr);
                this._data[this.id]._handleAttr = null;
            }
        },

        _resetSubscriptions: function () {
            console.log(this.id + '._resetSubscriptions');

            // Release handle on previous object, if any.
            this._cleanupSubscriptions();

            // Subscribe to object updates.
            if (this._data[this.id]._contextObj) {
                this._data[this.id]._handleObj = mx.data.subscribe({
                    guid: this._data[this.id]._contextObj.getGuid(),
                    callback: lang.hitch(this, function (obj) {
                        mx.data.get({
                            guids: [obj],
                            callback: lang.hitch(this, this._loadDataCallback)
                        });
                    })
                });

                this._data[this.id]._handleAttr = mx.data.subscribe({
                    guid: this._data[this.id]._contextObj.getGuid(),
                    attr: this._attribute,
                    callback: lang.hitch(this, function (obj) {
                        mx.data.get({
                            guids: [obj],
                            callback: lang.hitch(this, this._loadDataCallback)
                        });
                    })
                });

            }
        },

        _execMF: function (obj, mf, cb) {
            if (mf) {
                var params = {
                    applyto: "selection",
                    actionname: mf,
                    guids: []
                };
                if (obj) {
                    params.guids = [obj.getGuid()];
                }
                mx.data.action({
                    params: params,
                    callback: function (objs) {
                        if (cb) {
                            cb(objs);
                        }
                    },
                    error: function (error) {
                        if (cb) {
                            cb();
                        }
                        console.warn(error.description);
                    }
                }, this);

            } else if (cb) {
                cb();
            }
        }
    });
});