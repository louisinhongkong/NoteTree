var revealingModuleName = (function() {
	'use strict';

	function methodName() {
		
	}

	return {
		methodName:methodName
	};

}());

var noteTree = function(){

		document.oncontextmenu = function() {return false;}; 
	
		var log = function log(v){
			console.log(v);
		}

		//COPY IMPLEMENT - template actions linked to api actions
		//actions


		//COPY
		function Templates(){
			var _folder = '<div class="folder" fid="{fid}"><span>[+]</span><span class="name">{folderName}</span></div>';
			var _note = '<div class="note" nid="{nid}"><span>&nbsp;=&nbsp;</span><span class="name">{noteName}</span></div>';
			var _folderContent = '<div class="folder-content">{content}</div>';
			var _contextMenu = '<div id="context-menu"><ul>{items}</ul></div>';
			var _contextItem = '<li>{item}</li>';
 			var _fMenuItems = ['New Folder', 'New Note', 'Delete', 'Rename', 'Sort', 'Search'];
 			var _nMenuItems = ['Delete', 'Rename', 'Add To New Folder'];
			var actions = {'New Folder':'_nf', 'New Note':'_nn', 'Delete':'_d', 'Rename':'_r', 'Sort':'_s', 'Search':'_se', 'Add To New Folder':'_t'};


			var folder = function(folderName,fid){
				return _folder.replace('{folderName}',folderName).replace('{fid}',fid);
			}
			var note = function(noteName,nid){
				return _note.replace('{noteName}',noteName).replace('{nid}',nid);
			}
			var folderContent = function(content){
				return _folderContent.replace('{content}',content);
			}
			var contextMenu = function(items){
				return _contextMenu.replace('{items}',items);
			}
			var contextItem = function(item){
				return _contextItem.replace('{item}',item);
			}						
			//TODO
			var output = function(template,varsArr){
				this[template].replace(varsArr.key,varsArr.Value);
			}

			return {actions:actions, folder:folder,note:note,folderContent:folderContent, contextMenu:contextMenu, contextItem:contextItem, fMenuItems:_fMenuItems, nMenuItems:_nMenuItems, output:output}
		}
		//COPY		
		function Api(){
			this.url = 'api.php?';
			
			//params
			this.a = 'action';
			this.f = 'folderID';
			this.n = 'noteID';
			this.p = 'parentFolder';
			this.d = 'date';
			this.na = 'name';
			this.s = 'sort';
			this.no = 'note';				

			//values
			this._nf = 'newFolder';
			this._nn = 'newNote';
			this._t = 'toNewFolder';
			this._d = 'delete';
			this._r = 'rename';
			this._s = 'save';
			this._g = 'get';
			this._l = 'loadNote'
			this._se = 'search';

			this.build = function(input){
				var out = api.url;
				input.map(function(v){
					key = (typeof v == "object") ? Object.getOwnPropertyNames(v)[0] : v ;
					out += (key.indexOf('_')==-1) ? '&' : '=';
					out += (typeof v == "object") ? api[key]+'='+v[key] : api[key];
				});
				return out;
			}
		}
		function App(){ this.register = this.register || []; this.previouslyFocussedEl = '';}
		function Data(){}
		function View(){}
		function StateSwitcher(){}


		App.prototype.loadNew = function(){
			data.getFolderContent(0,function(){view.focus($('div#noteTree>div.folder-content>div').first())});
		}
		App.prototype.registerTree=function(type,folderID){		
			if(type=='o'){
				this.register.push(folderID);
			}else{
				var index = this.register.indexOf(folderID);
				this.register.splice(index,1);
				var $el = $('div[fid='+folderID+']');
				$el.find('div.folder-content').remove();
				$el.find('span:first').html('[+]');
			}
		}
		App.prototype.loadNote=function(nid){
			var url = api.build(['a','_l',{'n':nid}]);
			var success = fail = always = function(){};
			var done = function(json){
				if(json.error){log('json error : '+json.error)}
					var note = json.content[0].note;
					$('#notepad').html(note);
					$('#notepad').attr('noteID',nid);
			}
			data.callApi(url,success,done,fail,always);
		}
		App.prototype.unloadNote=function(){
			$('#notepad').html('');
		}
		App.prototype.saveNote=function(){
			var note = $('#notepad').html();
			if($('#notepad').get(0).innerText.length ==0){return;} //empty note dont save 
			var noteID = $("#notepad").attr('noteID');


			var url = api.build(['a','_s',{'n':noteID}]);



			var success = done = fail = always = function(){};
			var done = function(json){
				if(json.error){log('json error : '+json.error)}
				if(json.error=='0'){
					$('#notepad').fadeOut(50).fadeIn(50);
					log('saved');
				}
			}
			$.post(url,{note:note},done,'json');

			//data.callApi(url,success,done,fail,always);		
		}
		App.prototype.setNotepadUI=function(){
			$('#notepad').focus(function(){
					view.unfocus();
					view.removeContextMenu();
					app.engageEditKeys(true);
			});

			$('#notepad').off('click').on('click',function(){
				log('ckiuc');
					$('#notepad').focus();					
			});
		}

		//COPY
		Data.prototype.getFolderContent = function(parentFolder,callback){ 
			callback = callback || function(){};
			var always = always || function(){};
			var url = api.build(['a','_g',{'p':parentFolder}]);
			$.getJSON(url,function(){log('json success')})
			.done(function(json){
				if(json.error){log('json error : '+json.error)}
				view.renderFolderContent(json.content,parentFolder,callback);	
			}).fail(function(){
				//log('json fail');				
			}).always(always);
			return this;
		}
		Data.prototype.callApi=function(url,success,done,fail,always){
			$.getJSON(url,success).done(done).fail(fail).always(always);
			return this;
		}		

		View.prototype.renderFolderContent=function(content,folderID,callback){
			var html = '';
			$.each(content,function(k,v){				
				html += (v.hasOwnProperty('folderID')) ? templates.folder(v['name'],v['folderID']) : templates.note(v['name'],v['noteID']) ;
			});
			html = templates.folderContent(html);
			
			$('div[fid='+folderID+']').append(html).find('>span:first').html('[-]');


			//load inner open folders 
			$.each(content,function(k,v){
					if(v.hasOwnProperty('folderID')){
						var fid = v['folderID'];
						if(app.register.indexOf(fid)!=-1){
							data.getFolderContent(fid);
						}
					}
			});

			callback();
			view.setUIEvents();
		}
		View.prototype.removeContextMenu = function(){	

			$('div#context-menu').remove();
		}
		View.prototype.addContextMenu = function(items){
			var html = '';
			$.map(items,function(v){
					html += templates.contextItem(v);								
			});							
			html = templates.contextMenu(html);
			var $c =$(html).css({'left':event.pageX,'top':event.pageY});	
			$('body').append($c);
		}
		View.prototype.setContextMenuUIEvents=function(){
			$('div#context-menu>ul>li').each(function(){

				$(this).off('mouseover').on('mouseover',function(){
					$(this).siblings().removeClass('cfocus');					
					$(this).addClass('cfocus');
				});

				$(this).off('mouseout').on('mouseout',function(){
					$(this).removeClass('cfocus');
				});

				$(this).off('mouseup').on('mouseup',function(e){
					//if(e.which==1){
						var label = $(this).text();
						var fn = templates.actions[label];
						switch(fn)
						{
							case '_nf': app.addNewFolder(); break; //new folder - 
							case '_nn': app.addNewNote(); break; //new note
							case '_d': app.delete_(); break; //del
							case '_r': app.rename_(); break; //ranem
							case '_s': app.sortBy(); break; //sort
							case '_se': app.searchFolder(); break; //search
							case '_t': app.addToNewFolder(); break; //add to folder
						}

						view.removeContextMenu();
					//} 
				});


			});
		}
		View.prototype.setUIEvents = function(){
			$('div.folder > span, div.note > span, div.folder-content, div#directory').each(function(){
				//bind click, bind mouseover, bind rightclick
				$(this).off('mousedown').on('mousedown',function(e){
					
					event.preventDefault();

					//log(event.pageX);
					//log(event.pageY);

					if(e.which==3){} //right click
					if(e.which==1){} //left click

				
					//clicked on outerspace
					if($(this).hasClass('folder-content') || $(this).is('#directory'))
					{
						view.unfocus().focus($(this).parent());						
						if(e.which==1){
							view.removeContextMenu();
						}
						if(e.which==3){
							view.removeContextMenu();				
							view.addContextMenu(templates.fMenuItems);
							view.setContextMenuUIEvents();						
						}

						return false;
					}			

					//clicked on a folder
					if($(this).parent().hasClass('folder'))
					{
						view.unfocus().focus($(this).parent());
						if((e.which==1)&&(!$(this).hasClass('name'))){
							var folderID = $(this).parent().attr('fid');
							var isContentsOpen = $(this).siblings('div.folder-content').length;
							if(isContentsOpen){
								app.registerTree('c',folderID);								
							}else{								
								data.getFolderContent(folderID);
								app.registerTree('o',folderID);																
							}
						}

						if(e.which==3){
							view.removeContextMenu();				
							view.addContextMenu(templates.fMenuItems);
							view.setContextMenuUIEvents();
						}
						return false;
					}

					//clicked on a note
					if($(this).parent().hasClass('note'))
					{						
						view.unfocus().focus($(this).parent());

						if(e.which==1){
							app.loadNote($('div.focus').attr('nid'));
						}

						if(e.which==3){
							view.removeContextMenu();				
							view.addContextMenu(templates.nMenuItems);
							view.setContextMenuUIEvents();
						}						
						return false;
					}


					

						//folder left
							//if opened, hide content else get show content
							//focus
						//folder right
							//New Folder
							//New Note
							//Sort
							//Search						
							//delete
							//rename
							//new note	

						//note left click
							//open note
							//focus
						//note right click
							//delete
							//rename
							//toNewFolder							

				});
			});
			//$('div.folder').each(function(){});
			//$('div.note').each(function(){});
		}
		View.prototype.focus=function(el){
			$(el).addClass('focus');
			app.previouslyFocussedEl = $(el);	
			app.engageNavKeys(true);
			app.engageEditKeys(false);
			view.removeContextMenu();
			$('#notepad').blur();

			return this;
		}
		View.prototype.unfocus = function(){
			$('div.focus').removeClass('focus');
			app.engageNavKeys(false);
			return this;
		}
	


		App.prototype.addNewFolder=function(parentFolder,callback){
			var parentFolder = parentFolder || $('div.folder.focus').attr('fid') || 0;
			var folderName = prompt("Folder Name");
			if(folderName == null){return;}

			var success = fail = always = function(){};
			var callback = callback || function(){};
			var url = api.build(['a','_nf',{'p':parentFolder},{'na':folderName}]);
			var done = function(json){
				if(json.error){log('json error : '+json.error)}
					newFID = json.ID;
					$('div[fid='+parentFolder+']>div.folder-content').remove();
					
					var gotFolder = function(){
						view.unfocus().focus($('div[fid='+newFID+']'));
						callback();
					}

					data.getFolderContent(parentFolder,gotFolder);
			}
			data.callApi(url,success,done,fail,always);
		}
		App.prototype.addNewNote=function(){
			var parentFolder = parentFolder || $('div.folder.focus').attr('fid') || 0;	
			var noteName = prompt("Note Name");
			if(noteName == null){return;}

			var success = fail = always = function(){}
			var url = api.build(['a','_nn',{'p':parentFolder},{'na':noteName}]);
			var done = function(json){
				if(json.error){log('json error : '+json.error)}
					newNID = json.ID;
					$('div[fid='+parentFolder+']>div.folder-content').remove();
					
					var gotFolder = function(){
						view.unfocus().focus($('div[nid='+newNID+']'));
						app.loadNote(newNID);
					}
					data.getFolderContent(parentFolder,gotFolder);
			}
			data.callApi(url,success,done,fail,always);
		}
		App.prototype.addToNewFolder=function(){
			var parentFolder = $('div.note.focus').parent().parent().attr('fid') || 0;
			var noteID = $('div.note.focus').attr('nid');
			var gotNewFolder = function(){
				var newFID = $('div.folder.focus').attr('fid');
				var success = fail = always = function(){}
				var url = api.build(['a','_t',{'p':newFID},{'n':noteID}]);
				var done = function(json){
					if(json.error){log('json error : '+json.error)}
						$('div[nid='+noteID+']').remove();
					data.getFolderContent(newFID,function(){
						view.unfocus().focus($('div[nid='+noteID+']'));
					});
				}
				data.callApi(url,success,done,fail,always);	
			}
			app.addNewFolder(parentFolder,gotNewFolder);
		}	
		App.prototype.delete_=function(){
			var isFolder = ($('div.focus').hasClass('note')) ? false : true;
			var id = (isFolder) ? $('div.focus').attr('fid') : $('div.focus').attr('nid');
			var parentFolder = $('div.focus').parent().parent().attr('fid') || 0;
			//prompt confirm delete all contents
			
			var conf = confirm("Delete?!");
			if(!conf){return;}

			var param = (isFolder) ? {'f':id} : {'n':id}; 
			var url = api.build(['a','_d',param]);
			var success = fail = always = function(){}

			var done = function(json){
				if(json.error){log('json error : '+json.error)}
				$('div[fid='+parentFolder+']>.folder-content').remove();			
				data.getFolderContent(parentFolder);
				view.unfocus().focus($('div[fid='+parentFolder+']'));				
			}
			data.callApi(url,success,done,fail,always);			
		}
		App.prototype.rename_=function(ID,isFolder){
			var isFolder = ($('div.focus').hasClass('note')) ? false : true;
			var id = (isFolder) ? $('div.focus').attr('fid') : $('div.focus').attr('nid');	
			var parentFolder = $('div.focus').parent().parent().attr('fid') || 0;
			var name = $('div.focus>span.name').text();
			var newName = prompt("New Name",name);
			if(newName == null){return;}
			var success = fail = always = function(){}		
			var param = (isFolder) ? {'f':id} : {'n':id}; 
			var url = api.build(['a','_r',param,{'na':newName}]);
			var done = function(json){
				if(json.error){log('json error : '+json.error)}
				view.unfocus();
				$('div[fid='+parentFolder+']>.folder-content').remove();
				var callback = function(){
					var idName = (isFolder) ? 'fid' : 'nid';
					view.focus($('div['+idName+'='+id+']'));
					log('callingback');
				}			
				data.getFolderContent(parentFolder,callback);
			}			
			data.callApi(url,success,done,fail,always);				
		}
		App.prototype.engageNavKeys=function(engage){
			if(engage){
				var isAlphaNumeric = function(e){
					key = e.which;
					var key = String.fromCharCode((96 <= key && key <= 105)? key-48 : key);
					if(/^[a-z0-9]+$/i.test(key))
					{
						//log(key);
					}
				}
				var up = function(){
					var afterFocus = false;
					$($('#noteTree div').get().reverse()).each(function(k,v){
						if(afterFocus){
							if($(v).hasClass('folder')){view.unfocus(); view.focus(v);return false;}
							if($(v).hasClass('note')){view.unfocus();view.focus(v);return false;}
						}
						afterFocus = ($(v).hasClass('focus')) || afterFocus;						
					});
				}				
				var down = function(){
					var afterFocus = false;
					$('#directory div').each(function(k,v){
						if(afterFocus){
							if($(v).hasClass('folder')){view.unfocus(); view.focus(v);return false;}
							if($(v).hasClass('note')){view.unfocus();view.focus(v);return false;}
						}
						afterFocus = ($(v).hasClass('focus')) || afterFocus;						
					});
				}
				var left = function(){
					var $fc =  $('div.focus');
					if($fc.attr('id')=='noteTree'){return}
					var $el =  ($fc.children('div.folder-content').length) ? $fc :$fc.parents('div.folder:first');
					
					if($fc.hasClass('note')){
						var fid =	$fc.parents('div.folder:first').attr('fid'); 
						if(!fid){return}
						view.unfocus().focus($el);					
						return;
					}

					var fid = $fc.attr('fid'); 										
					if(!$el.length){return}
					app.registerTree('c',fid);
					view.unfocus().focus($el);					
				}
				var right = function(){
					if($('div.focus').hasClass('note')){
						app.loadNote($('div.focus').attr('nid'));
					}

					if($('div.focus>div.folder-content').length){return}
					var fid = $('div.focus').attr('fid');
					data.getFolderContent(fid);
					app.registerTree('o',fid);							
				}
				var tab = function(e){
					if(typeof $('#notepad').attr('noteID') == 'undefined'){return}
					$('#notepad').focus();
					e.preventDefault();
				}

				var keydowned = function(e){
					switch(e.which){
						case 38: up(); break; //up
						case 40: down(); break; //d
						case 37: left(); break; //l 
						case 39: right(); break; //r
						case 9: tab(e); break;
						case 8: app.delete_(); break;
						case 46: app.delete_(); break;
						default: isAlphaNumeric(e);
					}
					e.preventDefault();

				}
				$('body').off('keydown').on('keydown',keydowned);
			}else{
				$('body').off('keydown');
			}
		}
		App.prototype.engageEditKeys=function(engage){
			if(engage){

				var keysDown = [];
				var caretPos = '';

				var tab = function(e){
					view.focus(app.previouslyFocussedEl);
					e.preventDefault();
				}

				var keydowned = function(e){

					if(keysDown.lastIndexOf(e.which)==-1)
					{
						keysDown.push(e.which);
					}

					if( keysDown[0]==91 && keysDown[1]==83 && keysDown.length==2 ) // ctrl + s;
					{
						e.preventDefault(); 			
						app.saveNote(); 			
					}

					if( keysDown[0]==91 && keysDown[1]==86 && keysDown.length==2 ) // ctrl + v;
					{
						caretPos = getCaretCharacterOffsetWithin($('#notepad').get(0));						
					}							


					switch(e.which){
						case 9: tab(e); break;
					}
				}

				var keyupped = function(e){

					//check if theres a pasting... replace tabs with double spacing.
					if( keysDown[0]==91 && keysDown[1]==86 && keysDown.length==2 ) // ctrl + s;
					{
						e.preventDefault(); 			
						/*
						var caretPos2 = getCaretCharacterOffsetWithin($('#notepad').get(0));						
						var pasteText = $('#notepad').text().substring(caretPos,caretPos2);
						
						var startOfLine = $('#notepad').text().substring(0,caretPos).lastIndexOf('<div>');
						var whiteSpacesBeforeCaret = $('#notepad').text().substring(startOfLine,caretPos).match(/^\s+/)[0].length;
						var whiteSpaceOnFirstLine = pasteText.match(/^\s+/)[0].length;
						*/


						$('#notepad').html(function() {
						    return this.innerHTML.replace(/\t/g, '&nbsp;&nbsp;');
						});			
					}		

 		 			keysDown = []; 		 
				}

				$('body').off('keydown.edit').on('keydown.edit',keydowned);
				$('body').off('keyup.edit').on('keyup.edit',keyupped);
			}else{
				$('body').off('keydown.edit');
				$('body').off('keyup.edit');				
			}
		}		

		//TODO
		App.prototype.sortBy=function(){}; 
		App.prototype.searchFolder=function(){}; 


		var api = new Api;
		var templates = new Templates;

		var app = new App;
		var data = new Data;
		var view = new View;


		$(document).ready(function(){
			app.loadNew();			
			app.setNotepadUI();
		});

}();

