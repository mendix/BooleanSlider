define([
    "dojo/_base/declare",
    "mxui/widget/_WidgetBase",
    "dijit/_TemplatedMixin",

    "dojo/dom-prop",
    "dojo/dom-attr",
    "dojo/dom-class",
    "dojo/dom-style",
    "dojo/dom-construct",
    "dojo/_base/lang",

    "dojo/html",
    "dojo/text!BooleanSlider/widget/templates/BooleanSlider.html"
], function (declare, _WidgetBase, _TemplatedMixin, dojoProp, dojoAttr, dojoClass, dojoStyle, dojoConstruct, dojoLang, dojoHtml, widgetTemplate) {
    "use strict";

    return declare("BooleanSlider.widget.BooleanSlider", [_WidgetBase, _TemplatedMixin], {

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

        // Internal variables.
        _handles: null,
        _contextObj: null,
        _alertDiv: null,

        constructor: function () {
            this._handles = [];
        },

        postCreate: function () {
            logger.debug(this.id + ".postCreate");
            this._setupEvents();
        },

        update: function (obj, callback) {
            logger.debug(this.id + ".update");
            this._contextObj = obj;
            this._resetSubscriptions();
            this._updateRendering(callback);
        },

        _setupEvents: function () {
            logger.debug(this.id + "._setupEvents");
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
                        store: {
                            caller: this.mxform
                        },
                        callback: function () {}, // stub function
                        error: dojoLang.hitch(this, function (error) {
                            console.log(this.id + ": An error occurred while executing microflow: " + error.description);
                        })
                    }, this);
                }
            });
        },

        _updateRendering: function (callback) {
            logger.debug(this.id + "._updateRendering");
            if (this._contextObj !== null) {
                dojoStyle.set(this.domNode, "display", "block");

                dojoProp.set(this.trueNode, "textContent", this.trueValue);
                dojoProp.set(this.falseNode, "textContent", this.falseValue);

                this._loadData(callback);
            } else {
                dojoStyle.set(this.domNode, "display", "none");
                mendix.lang.nullExec(callback);
            }

            // Important to clear all validations!
            this._clearValidations();
        },

        _loadData: function (callback) {
            logger.debug(this.id + "._loadData");
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

                if (!this.editable || this.readOnly || this._contextObj.isReadonlyAttr(this.dataAttr)) {
                    dojoAttr.set(this.inputNode, "disabled", "");
                } else {
                    dojoAttr.remove(this.inputNode, "disabled");
                }
            }

            mendix.lang.nullExec(callback);
        },

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

        _clearValidations: function () {
            dojoConstruct.destroy(this._alertDiv);
            this._alertDiv = null;
        },

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

        _addValidation: function (message) {
            this._showError(message);
        },

        _resetSubscriptions: function () {
            logger.debug(this.id + "._resetSubscriptions");

            if (this._handles) {
                this._handles.forEach(function (handle) {
                    mx.data.unsubscribe(handle);
                });
                this._handles = [];
            }

            // When a mendix object exists create subscribtions.
            if (this._contextObj) {
                var objectHandle = mx.data.subscribe({
                    guid: this._contextObj.getGuid(),
                    callback: dojoLang.hitch(this, function (guid) {
                        this._updateRendering();
                    })
                });

                var attrHandle = mx.data.subscribe({
                    guid: this._contextObj.getGuid(),
                    attr: this.dataAttr,
                    callback: dojoLang.hitch(this, function (guid, attr, attrValue) {
                        this._updateRendering();
                    })
                });

                var validationHandle = mx.data.subscribe({
                    guid: this._contextObj.getGuid(),
                    val: true,
                    callback: dojoLang.hitch(this, this._handleValidation)
                });

                this._handles = [objectHandle, attrHandle, validationHandle];
            }
        }
    });
});


require(["BooleanSlider/widget/BooleanSlider"]);
