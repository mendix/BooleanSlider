/*jslint white:true, nomen: true, plusplus: true */
/*global mx, mendix, require, console, define, module, logger, mxui */
/*mendix */
/**

	Boolean Slider
	========================

	@file      : BooleanSlider.js
	@version   : {{version}}
	@author    : {{author}}
	@date      : {{date}}
	@copyright : Mendix Technology BV
	@license   : Apache License, Version 2.0, January 2004

	Documentation
    ========================
	Provides a alternative to a check box, commonly referred to as a slider control.
    Does not require any javascript, and is styled via css. Can be used in both web and mobile contexts.

*/

(function () {
    'use strict';

    // Required module list. Remove unnecessary modules, you can always get them back from the boilerplate.
    require([

        'dojo/_base/declare', 'mxui/widget/_WidgetBase', 'dijit/_Widget', 'dijit/_TemplatedMixin',
        'mxui/dom', 'dojo/dom', 'dojo/query', 'dojo/dom-prop', 'dojo/dom-geometry', 'dojo/dom-class', 'dojo/dom-style', 'dojo/dom-construct', 'dojo/_base/array',
        'dojo/window', 'dojo/on', 'dojo/_base/lang', 'dojo/text'

    ], function (declare, _WidgetBase, _Widget, _Templated, domMx, dom, domQuery, domProp, domGeom, domClass, domStyle, domConstruct, dojoArray, win, on, lang, text) {

        // Declare widget.
        return declare('BooleanSlider.widget.BooleanSlider', [_WidgetBase, _Widget, _Templated], {

            /**
             * Internal variables.
             * ======================
             */
            _data: {},
            _mxObject: null,
            _attribute: null,
            _path: null,

            // Template path
            templatePath: require.toUrl('BooleanSlider/widget/templates/BooleanSlider.html'),

            /**
             * Mendix Widget methods.
             * ======================
             */

            // DOJO.WidgetBase -> PostCreate is fired after the properties of the widget are set.
            postCreate: function () {

                // postCreate
                console.log('BooleanSlider - postCreate');

                // Load CSS ... automaticly from ui directory

                // Setup widgets
                this._setupWidget();

                // Setup events
                this._setupEvents();

            },

            // DOJO.WidgetBase -> Startup is fired after the properties of the widget are set.
            startup: function () {

                // postCreate
                var path = this.dataAttr.split("/");
                this._attribute = path[path.length - 1];
                this._path = path.splice(0, path.length - 1);

                console.log('BooleanSlider - startup attr ' + this._attribute);

            },

            /**
             * What to do when data is loaded?
             */

            update: function (obj, callback) {

                // Context object should be set before loaddata.
                this._data[this.id]._contextObj = obj;

                // startup
                console.log('BooleanSlider - update');

                // Release handle on previous object, if any.
                if (this._data[this.id]._handle) {
                    mx.data.unsubscribe(this._data[this.id]._handle);
                }

                if (typeof obj === 'string') {
                    this._data[this.id]._contextGuid = obj;
                    mx.data.get({
                        guids: [this._data[this.id]._contextGuid],
                        callback: lang.hitch(this, function (objs) {

                            // Set the object as background.
                            this._data[this.id]._contextObj = objs[0];

                            // Load data again.
                            this._loadData();

                        })
                    });
                } else {
                    this._data[this.id]._contextObj = obj;
                }

                if (obj === null) {

                    // Sorry no data no show!
                    console.log('BooleanSlider  - update - We did not get any context object!');

                } else {

                    // Load data
                    this._loadData();

                    // Subscribe to object updates.
                    this._data[this.id]._handle = mx.data.subscribe({
                        guid: this._data[this.id]._contextObj.getGuid(),
                        callback: lang.hitch(this, function (obj) {

                            mx.data.get({
                                guids: [obj],
                                callback: lang.hitch(this, function (objs) {

                                    // Set the object as background.
                                    this._data[this.id]._contextObj = objs[0];

                                    // Load data again.
                                    this._loadData();

                                })
                            });

                        })
                    });
                }

                // Execute callback.
                if (typeof callback !== 'undefined') {
                    callback();
                }
            },

            /**
             * How the widget re-acts from actions invoked by the Mendix App.
             */
            suspend: function () {
                //TODO, what will happen if the widget is suspended (not visible).
            },

            resume: function () {
                //TODO, what will happen if the widget is resumed (set visible).
            },

            enable: function () {
                //TODO, what will happen if the widget is suspended (not visible).
            },

            disable: function () {
                //TODO, what will happen if the widget is resumed (set visible).
            },

            uninitialize: function () {
                //TODO, clean up only events
                if (this._data[this.id]._handle) {
                    mx.data.unsubscribe(this._data[this.id]._handle);
                }
            },


            /**
             * Extra setup widget methods.
             * ======================
             */
            _setupWidget: function () {

                // To be able to use this widget with multiple instances of itself we need to add a data variable.
                this._data[this.id] = {
                    _contextGuid: null,
                    _contextObj: null,
                    _handle: null
                };

            },

            // Attach events to newly created nodes.
            _setupEvents: function () {

                console.log('BooleanSlider - setup events');

                on(this.domNode.control, 'click', lang.hitch(this, function () {

                    this._saveData();
                    
                    this._execMF(this._data[this.id]._contextObj, this.mfToExecute);

                }));

            },


            /**
             * Interaction widget methods.
             * ======================
             */
            _loadData: function () {

                // get the data value to load
                var checked = this._data[this.id]._contextObj.get(this._attribute);
                if (checked !== null && checked) {
                    this.domNode.control.setAttribute("checked", "");
                } else {
                    this.domNode.control.removeAttribute("checked");
                }

            },

            _saveData: function () {

                // get the data value to save
                var checked = this.domNode.control.checked;
                if (checked) {
                    this._data[this.id]._contextObj.set(this._attribute, true);
                } else {
                    this._data[this.id]._contextObj.set(this._attribute, false);
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
                            logger.warn(error.description);
                        }
                    }, this);

                } else if (cb) {
                    cb();
                }
            }

        });
    });

}());