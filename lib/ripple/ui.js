/*
 *  Copyright 2011 Research In Motion Limited.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
var _self,
    db = require('ripple/db'),
    platform = require('ripple/platform'),
    constants = require('ripple/constants'),
    utils = require('ripple/utils'),
    exception = require('ripple/exception'),
    event = require('ripple/event'),
    _applicationStateId,
    _applicationState,
    _availablePanels,
    _applicationStateTmp,
    _panelConfigEnabled,
    _systemPlugins = [
        "about-dialog",
        "settings-dialog",
        "exec-dialog",
        "firstRunCheck",
        "devices",
        "goodVibrations",
        "panelCollapse",
        "platform",
        "information",
        "layout",
        "notifications",
        "themeSwitcher",
        "settings-menu"
    ],
    _overlay = {
        getOrCreate: function (id) {
            var _container = document.getElementById(constants.COMMON.HTML_CONTAINER),
                _overlays = document.getElementById("overlay-views"),
                _overlay = _overlays.children[id],
                _hide = function (node) {
                    node.setAttribute("style", "display: none");
                },
                _show = function (node) {
                    node.setAttribute("style", "display: block");
                },
                _trigger = function (callback) {
                    if (callback) {
                        callback.apply(null, [_overlay]);
                    }
                };


            if (!_overlay) {
                _overlay = utils.createElement("section", {id: id, "class": "overlay"});
                _overlays.appendChild(_overlay);
            }

            return {
                hide: function (callback) {
                    _hide(_overlay);
                    _show(_container);
                    _trigger(callback);
                },
                show: function (callback, showContainer) {
                    _show(_overlay);
                    if (!showContainer) {
                        _hide(_container);
                    }
                    _trigger(callback);
                }
            };
        }
    };

function _addUIPaneItemsToApplicationState(arrayObj, pane) {
    utils.forEach(arrayObj, function (domId) {
        var collapsed = jQuery("#" + domId + " .info")[0];
        collapsed = (collapsed.style && collapsed.style.display === "none") ? true : false;
        utils.forEach(_applicationStateTmp, function (obj) {
            if (obj.domId === domId) {
                _applicationState.push({
                    "domId": domId,
                    "collapsed": collapsed,
                    "pane": pane,
                    "titleName" : obj.titleName,
                    "display" : obj.display
                });
                _applicationStateTmp.splice(_applicationStateTmp.indexOf(obj), 1);
                return;
            }
        }, this);
    }, this);

    utils.forEach(_applicationStateTmp, function (obj) {
        _applicationState.push({
            "domId": obj.domId,
            "collapsed": obj.collapsed,
            "pane": obj.pane,
            "titleName" : obj.titleName,
            "display" : obj.display
        });
    });
}

function _insertStyleSheets() {
    var uiTheme = db.retrieve("ui-theme") || require('ripple/ui/themes')[0],
        extensionURL = jQuery("#extension-url").text(),
        uiThemeURL = extensionURL + "themes/" + uiTheme + "/theme.css",
        head = document.getElementsByTagName('head')[0];

    function stylesheet(src) {
        var scriptElement = document.createElement("link");
        scriptElement.setAttribute("href", src);
        scriptElement.setAttribute("type", "text/css");
        scriptElement.setAttribute("rel", "stylesheet");
        return scriptElement;
    }

    head.appendChild(stylesheet(uiThemeURL));
}

function _collapsePannels(side) {
    var collapseNode = [],
        event = document.createEvent("UIEvent");

    collapseNode = side === "left" ? document.getElementsByClassName("left-panel-collapse") : 
                                     document.getElementsByClassName("right-panel-collapse");
    
    if (collapseNode.length > 0) {
        event.initEvent("click", true, true);
        collapseNode[0].dispatchEvent(event);    
    }
}

function _initializeUI() {
    _applicationStateId = constants.COMMON.APPLICATION_STATE +
        ((db.retrieveObject("api-key") || constants.PLATFORM.DEFAULT)).name;

    _applicationState = db.retrieveObject(_applicationStateId) || [];
    _panelConfigEnabled = db.retrieveObject(constants.PANEL.PANEL_CONFIG);

    _insertStyleSheets();

    var leftPanelSection = jQuery(".left"),
        uiBoxToggleEngaged = false;

    //clean up
    db.remove("ui-application-state");

    if (!_panelConfigEnabled) {
        _applicationState = [];
        _panelConfigEnabled = true;
    }

    utils.forEach(_availablePanels, function (obj) {
        var matchingDomId = function (panel) {
            return panel.domId === obj.domId;
        };
        if (!utils.some(_applicationState, matchingDomId)) {
            _applicationState.push({
                "domId": obj.domId,
                "collapsed": obj.collapsed,
                "pane": obj.pane,
                "titleName" : obj.titleName,
                "display" : obj.display
            });
        }
    });

    utils.forEach(_applicationState, function (obj) {
        var node = jQuery("#" + obj.domId),
            imgNode = node.find(".ui-box-TitleImage");
            matchingDomId = function (panel) {
                return panel.domId === obj.domId;
            };

        if (node.length > 0) {
            if (!utils.some(_availablePanels, matchingDomId)) {
                node.parent()[0].removeChild(node[0]);
            }
            else {
                if (obj.display !== false) {
                    leftPanelSection.append(node.parent()[0].removeChild(node[0]));
                    if (!obj.collapsed) {
                        node.find(".info")
                            .css({
                            "display": "block"
                        })
                        .end()
                        .addClass("ui-box-open");
                        imgNode.addClass("ui-box-TitleImageOpen");
                    }
                }
            }
        }
    });

    db.saveObject(_applicationStateId, _applicationState);
    db.saveObject(constants.PANEL.PANEL_CONFIG, _panelConfigEnabled);

    event.on("ApplicationState", function () {
        try {
            var leftArray = jQuery(".left").sortable('toArray');
            _applicationStateTmp = [];
            _applicationStateTmp = utils.copy(_applicationState);
            _applicationState = [];
            _addUIPaneItemsToApplicationState(leftArray, "left");

            if (leftArray.length === 0) {
                _collapsePannels("left");
            }

            db.saveObject(_applicationStateId, _applicationState);
        }
        catch (e) {
            exception.handle(e);
        }
    });

    jQuery(".left").sortable({
        handle: ".drag-handle",
        revert: true,
        placeholder: 'ui-sortable-highlight ui-corner-all',
        connectWith: [".left"],
        scroll: true,
        update: function (uiEvent, ui) {
            event.trigger("ApplicationState");
        }
    });

    jQuery(".left").sortable({ axis: 'y' });

    jQuery(".collapse-handle").bind("click", function () {
        if (!uiBoxToggleEngaged) {

            uiBoxToggleEngaged = true;

            var jNode = jQuery(this).parentsUntil(".ui-box"),
                    pNode = jNode.parent(),
                    isOpen = pNode.hasClass("ui-box-open"),
                    imgNode = jQuery(this).find(".ui-box-TitleImage");

            if (!isOpen) {
                pNode.addClass("ui-box-open");
                imgNode.removeClass("ui-box-TitleImageClosed");
                imgNode.addClass("ui-box-TitleImageOpen");
            }

            jQuery(this).parent().next().toggle("blind", {}, 300, function () {
                if (isOpen) {
                    pNode.removeClass("ui-box-open");
                    imgNode.removeClass("ui-box-TitleImageOpen");
                    imgNode.addClass("ui-box-TitleImageClosed");
                }
                event.trigger("ApplicationState", [pNode]);
                uiBoxToggleEngaged = false;
            });
        }
    });
}

_self = module.exports = {
    initialize: function () {
        var plugins = _systemPlugins.concat(platform.current().ui.plugins || []).map(function (name) {
                return require('ripple/ui/plugins/' + name);
            }),
            boot = jWorkflow.order(_initializeUI);

        _availablePanels = [];

        plugins.forEach(function (plugin) {
            if (plugin.initialize) {
                boot.andThen(plugin.initialize);
            }

            if (plugin.panel) {
                _availablePanels.push(plugin.panel);
            }
        });

        boot.start();
    },

    getSystemPlugins: function () {
        return utils.copy(_systemPlugins);
    },

    register: function (plugin) {
        _systemPlugins.push(plugin);
    },

    registered: function (plugin) {
        return _systemPlugins.indexOf(plugin) >= 0;
    },

    getExtensionURL: function () {
        return jQuery("#" + constants.COMMON.EXTENSION_URL_CONTAINER).text();
    },

    showOverlay: function (id, callback, showContainer) {
        _overlay.getOrCreate(id).show(callback, showContainer);
    },

    hideOverlay: function (id, callback) {
        _overlay.getOrCreate(id).hide(callback);
    }
};
