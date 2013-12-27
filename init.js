/*
 * Copyright (c) Codiad & Andr3as, distributed
 * as-is and without warranty under the MIT License.
 * See http://opensource.org/licenses/MIT for more information. 
 * This information must remain intact.
 */

(function(global, $){
    
    var codiad = global.codiad,
        scripts = document.getElementsByTagName('script'),
        path = scripts[scripts.length-1].src.split('?')[0],
        curpath = path.split('/').slice(0, -1).join('/')+'/';

    $(function() {
        codiad.Favorites.init();
    });

    codiad.Favorites = {
        
        path: curpath,
        hide: true,
        item: null,
        
        /**
         * Init
         * @name init
         */
        init: function() {
            var _this = this;
            $.get(this.path+"template.html", function(data){
                $('#side-projects').before(data);
                //Set hidelistener
                $('#favorites-collapse').live('click', function(){
                    if (_this.hide) {
                        $('.favorites').hide();
                        $('.favorites-hr').hide();
                        $('#favorites-collapse').removeClass('icon-down-dir');
                        $('#favorites-collapse').addClass('icon-up-dir');
                        _this.hide = false;
                        //Set height
						$('.favorites-sb').css("height","35px");
                    } else {
                        $('.favorites').show();
                        $('.favorites-hr').show();
                        $('#favorites-collapse').removeClass('icon-up-dir');
                        $('#favorites-collapse').addClass('icon-down-dir');
                        _this.hide = true;
                        //Set height
						$('.favorites-sb').css("height","100px");
                    }
                    _this.resize();
                });
            });
            $('.favorite-item a').live('click', function(e){
				if (codiad.editor.settings.fileManagerTrigger) {
					_this.jump(this);
				}
            });
            $('.favorite-item a').live('dblclick', function(e){
				if (!codiad.editor.settings.fileManagerTrigger) {
					_this.jump(this);
				}
            });
            $('.favorite-item img').live('click', function(){
				var parent = $(this).parent();
				$(parent).remove();
            });
            //Amplify
            amplify.subscribe('filemanager.onIndex', function(obj){
				if (_this.item !== null) {
					if (_this.startsWith(_this.item.path,obj.path)) {
						setTimeout(function(){
							if (_this.item.parts.length > _this.item.index) {
								codiad.filemanager.rescan(_this.item.parts[_this.item.index]);
								_this.item.index++;
							} else {
								_this.item = null;
							}
						}, 50);
					}
				}
            });
            //Prjects resizing - Get current and replace them
            var collapse    = codiad.project.projectsCollapse;
            var expand      = codiad.project.projectsExpand;
            codiad.project.projectsCollapse = function() {
				collapse();
				_this.resize();
				codiad.project._sideExpanded = false;
            };
            codiad.project.projectsExpand = function() {
				expand();
				_this.resize();
				codiad.project._sideExpanded = true;
            };
        },
        
       /**
        * Add folder to favorites
        * @name add
        * @param {string} path Path of folder
        */
        add: function(path) {
            var element = $('a[data-path="'+path+'"]');
            var name    = $(element).text();
            var project = codiad.project.getCurrent();
            var item    = '<li class="favorite-item"><img src="'+this.path+"remove.png"+'"></img>';
                item   +='<a class="directory open" data-favorite-path="'+path+'" data-favorite-project="'+project+'">'+name+'</a></li>';
            $('#favorites-list').append(item);
        },
        
        /**
         * Jump to folder
         * @name jump
         * @param {jQuery object} item jQuery object of target
         */
        jump: function(item) {
			var path = $(item).attr('data-favorite-path');
			var project = $(item).attr('data-favorite-project');
			var current = codiad.project.getCurrent();
			this.item = this.splitPath(path,project);
			if (!this.startsWith(path, current)) {
				codiad.project.open(project);
			} else {
				if (this.item.parts.length !== 0) {
					codiad.filemanager.rescan(this.item.parts[0]);
					this.item.index = 1;
				}
			}
        },
        
        /**
         * Start string with a needle
         * @name startsWith
         * @param {string} string String to search in
         * @param {string} needle Needle to search for
         * @returns {bool}
         */
        startsWith: function(string, needle) {
			if (string.indexOf(needle) === 0) {
				return true;
			} else {
				return false;
			}
        },
         /**
          * Splits path in parts for sequential rescan
          * @name splitPath
          * @param {string} path File path
          * @param {string} project Project path
          * @returns {bool/object} Returns info object or false on failure
          */
        splitPath: function(path, project) {
			if (this.startsWith(path,project)) {
				var result  = {path: path, project: project, index: 0};
				path        = path.replace(project, "");
				if (this.startsWith(path,"/")) {
					path = path.replace("/", "");
				}
				var parts   = path.split("/");
				if (parts.length !== 0) {
					var buffer  = project + "/" + parts[0];
					parts[0]    = buffer;
					for (var i = 1; i < parts.length; i++) {
						buffer     += "/"+parts[i];
						parts[i]    = buffer;
					}
				}
				result.parts = parts;
				return result;
			} else {
				return false;
			}
        },
        
        /**
         * Resize favorite area
         * @name resize
         */
        resize: function() {
            var projectSize = $('.sb-left-projects').height();
            var favoritesSize = $('.favorites-sb').height();
			$('.favorites-sb').css("bottom", projectSize+"px");
			$('.sb-left-content').css("bottom", projectSize+favoritesSize+"px");
        }
    };
})(this, jQuery);