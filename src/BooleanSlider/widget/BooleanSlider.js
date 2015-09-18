/**

	Boolean Slider
	========================

	@file      : BooleanSlider.js
	@version   : 1.3
	@author    : Chad Evans
	@copyright : Mendix Technology BV
	@license   : Apache License, Version 2.0, January 2004

	Documentation
    ========================
	Provides a alternative to a check box, commonly referred to as a slider control.
    Can be used in both web and mobile contexts.

*/

define([
    "dojo/_base/declare",
    "mxui/widget/_WidgetBase",
    "dijit/_TemplatedMixin",
    "mxui/dom",
    "dojo/dom",
    "dojo/dom-prop",
    "dojo/dom-attr",
    "dojo/dom-class",
    "dojo/dom-style",
    "dojo/dom-construct",
    "dojo/_base/array",
    "dojo/_base/lang",
    "dojo/text",
    "dojo/html",
    "dojo/_base/event",
    "dojo/text!BooleanSlider/widget/templates/BooleanSlider.html"
], function (declare, _WidgetBase, _TemplatedMixin, dom, dojoDom, dojoProp, dojoAttr, dojoClass, dojoStyle,
    dojoConstruct, dojoArray, dojoLang, dojoText, dojoHtml, dojoEvent, widgetTemplate) {
    "use strict";

    // Declare widget's prototype.
    return declare("BooleanSlider.widget.BooleanSlider", [_WidgetBase, _TemplatedMixin], {
        // _TemplatedMixin will create our dom node using this HTML template.
        templateString: widgetTemplate,

        // DOM elements
        controlNode: null,
        inputNode: null,
        trueNode: null,
        falseNode: null,

        // Parameters configured in the Modeler.
        dataAttr: "",
        onChangeMF: "",
        trueValue: "",
        falseValue: "",
        editable: true,

        // Internal variables. Non-primitives created in the prototype are shared between all widget instances.
        _handles: null,
        _contextObj: null,
        _alertDiv: null,

        // dojo.declare.constructor is called to construct the widget instance. Implement to initialize non-primitive properties.
        constructor: function () {
            this._handles = [];
        },

        // dijit._WidgetBase.postCreate is called after constructing the widget. Implement to do extra setup work.
        postCreate: function () {
            //console.log(this.id + ".postCreate");

            this._updateRendering();
            this._setupEvents();
        },

        // mxui.widget._WidgetBase.update is called when context is changed or initialized. Implement to re-render and / or fetch data.
        update: function (obj, callback) {
            //console.log(this.id + ".update");

            this._contextObj = obj;
            this._resetSubscriptions();
            this._updateRendering();

            callback();
        },

        // mxui.widget._WidgetBase.uninitialize is called when the widget is destroyed. Implement to do special tear-down work.
        uninitialize: function () {
            // Clean up listeners, helper objects, etc. There is no need to remove listeners added with this.connect / this.subscribe / this.own.
        },

        _setupEvents: function () {
            this.connect(this.controlNode, "click", function (e) {
                // save the data
                this._contextObj.set(this.dataAttr, this.inputNode.checked);

                if (this.onChangeMF) {
                    mx.data.action({
                        params: {
                            applyto: "selection",
                            actionname: this.onChangeMF,
                            guids: [this._contextObj.getGuid()]
                        },
                        callback: function (obj) {
                            //TODO what to do when all is ok!
                        },
                        error: dojoLang.hitch(this, function (error) {
                            console.log(this.id + ": An error occurred while executing microflow: " + error.description);
                        })
                    }, this);
                }
            });
        },

        // Rerender the interface.
        _updateRendering: function () {
            if (this._contextObj !== null) {
                dojoStyle.set(this.domNode, "display", "block");

                dojoProp.set(this.trueNode, "textContent", this.trueValue);
                dojoProp.set(this.falseNode, "textContent", this.falseValue);

                this._loadData();
            } else {
                dojoStyle.set(this.domNode, "display", "none");
            }

            // Important to clear all validations!
            this._clearValidations();
        },

        _loadData: function () {
            // get the data value to load
            var checked = this._contextObj.get(this.dataAttr);

            if (this.inputNode) {
                if (checked !== null && checked) {
                    this.inputNode.checked = true;
                    dojoClass.add(this.controlNode, "btn-primary");
                    dojoClass.remove(this.controlNode, "btn-default");
                } else {
                    this.inputNode.checked = false;
                    dojoClass.remove(this.controlNode, "btn-primary");
                    dojoClass.add(this.controlNode, "btn-default");
                }

                if (!this.editable ||
                    this.readOnly ||
                    this._contextObj.isReadonlyAttr(this.dataAttr)
                ) {
                    dojoAttr.set(this.inputNode, "disabled", "");
                } else {
                    dojoAttr.remove(this.inputNode, "disabled");
                }
            }
        },

        // Handle validations.
        _handleValidation: function (validations) {
            this._clearValidations();

            var validation = validations[0],
                message = validation.getReasonByAttribute(this.dataAttr);

            if (this.readOnly) {
                validation.removeAttribute(this.dataAttr);
            } else if (message) {
                this._addValidation(message);
                validation.removeAttribute(this.dataAttr);
            }
        },

        // Clear validations.
        _clearValidations: function () {
            dojoConstruct.destroy(this._alertDiv);
            this._alertDiv = null;
        },

        // Show an error message.
        _showError: function (message) {
            if (this._alertDiv !== null) {
                dojoHtml.set(this._alertDiv, message);
                return true;
            }
            this._alertDiv = dojoConstruct.create("div", {
                "class": "alert alert-danger",
                "innerHTML": message
            });
            dojoConstruct.place(this._alertDiv, this.domNode);
        },

        // Add a validation.
        _addValidation: function (message) {
            this._showError(message);
        },

        _resetSubscriptions: function () {
            // Release handles on previous object, if any.
            if (this._handles) {
                this._handles.forEach(function (handle) {
                    mx.data.unsubscribe(handle);
                });
                this._handles = [];
            }

            // When a mendix object exists create subscribtions. 
            if (this._contextObj) {
                var objectHandle = this.subscribe({
                    guid: this._contextObj.getGuid(),
                    callback: dojoLang.hitch(this, function (guid) {
                        this._updateRendering();
                    })
                });

                var attrHandle = this.subscribe({
                    guid: this._contextObj.getGuid(),
                    attr: this.dataAttr,
                    callback: dojoLang.hitch(this, function (guid, attr, attrValue) {
                        this._updateRendering();
                    })
                });

                var validationHandle = this.subscribe({
                    guid: this._contextObj.getGuid(),
                    val: true,
                    callback: dojoLang.hitch(this, this._handleValidation)
                });

                this._handles = [objectHandle, attrHandle, validationHandle];
            }
        }
    });
});


require(["BooleanSlider/widget/BooleanSlider"], function () {
    "use strict";
});