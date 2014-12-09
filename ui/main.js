//
// The library app to manage an artists collection
//
function ciniki_library_main() {
	this.webFlags = {
		'1':{'name':'Hidden'},
		'5':{'name':'Category Highlight'},
		};
	// Web flags for additional image
	this.webFlags2 = {
		'1':{'name':'Hidden'},
		};
	this.init = function() {
		//
		// Setup the main panel to list the collection
		//
		this.menu = new M.panel('Library',
			'ciniki_library_main', 'menu',
			'mc', 'medium', 'sectioned', 'ciniki.library.main.menu');
		this.menu.data = {};
		this.menu.item_type = 10;
		this.menu.sections = {
			'search':{'label':'', 'autofocus':'yes', 'type':'livesearchgrid', 'livesearchcols':1,
				'hint':'Search', 
				'noData':'No items found',
				'headerValues':null,
				},
			'tabs':{'label':'', 'type':'paneltabs', 'selected':this.menu.item_type, 'tabs':{
				'10':{'label':'Music', 'fn':'M.ciniki_library_main.switchMenuTab(\'10\');'},
				'20':{'label':'Books', 'fn':'M.ciniki_library_main.switchMenuTab(\'20\');'},
				}},
			'menu':{'label':'', 'list':{
				'wanted':{'label':'Wanted', 'fn':'M.ciniki_library_main.showWanted();'},
				}},
			'genres':{'label':'Genres', 'type':'simplegrid', 'num_cols':1,
				'noData':'No genres found',
				},
//			'type_10':{'label':'Music', 'visible':'no', 'type':'simplegrid', 'num_cols':3,
//				'headerValues':['Artist/Band', 'Album', 'Year'],
//				},
//			'type_20':{'label':'Books', 'visible':'no', 'type':'simplegrid', 'num_cols':3,
//				'headerValues':['Author', 'Title', 'Year'],
//				},
			};
		this.menu.listby = 'category';
		this.menu.liveSearchCb = function(s, i, v) {
			if( v != '' ) {
				M.api.getJSONBgCb('ciniki.library.itemSearch', {'business_id':M.curBusinessID, 'start_needle':v, 'limit':'15'},
					function(rsp) {
						M.ciniki_library_main.menu.liveSearchShow(s, null, M.gE(M.ciniki_library_main.menu.panelUID + '_' + s), rsp.items);
					});
			}
			return true;
		};
		this.menu.liveSearchResultValue = function(s, f, i, j, d) {
			return (d.item.author_display!=''?d.item.author_display+', ':'') + d.item.title + (d.item.wanted=='yes'?' [WANTED]':'');
		};
		this.menu.liveSearchResultRowFn = function(s, f, i, j, d) {
			return 'M.startApp(\'ciniki.library.item\',null,\'M.ciniki_library_main.showMenu();\',\'mc\',{\'item_id\':\'' + d.item.id + '\'});';
		};
		this.menu.liveSearchResultRowStyle = function(s, f, i, d) { return ''; };
// 		Currently not allowing full search
//		this.menu.liveSearchSubmitFn = function(s, search_str) {
//			M.ciniki_library_main.searchArtCatalog('M.ciniki_library_main.showMenu();', search_str);
//		};
		this.menu.cellValue = function(s, i, j, d) {
			if( s == 'genres' ) {
				return d.name.tag_name + ' <span class="count">' + d.name.num_items + '</span>';
			}
		};
		this.menu.rowFn = function(s, i, d) {
			return 'M.ciniki_library_main.showList(\'M.ciniki_library_main.showMenu();\',escape(\'' + d.name.tag_name + '\'),\'genre\',\'' + M.ciniki_library_main.menu.item_type + '\',\'' + d.name.tag_type + '\',\'' + d.name.permalink + '\');'
		};
		this.menu.listFn = function(s, i, d) { return d.fn; }
		this.menu.noData = function(s) {
			if( this.sections[s].noData != null ) { return this.sections[s].noData; }
			return '';
		}
		this.menu.sectionData = function(s) { 
			if( s == 'menu' ) { return this.sections[s].list; }
			return this.data[s];
		};
		this.menu.addButton('add', 'Add', 'M.startApp(\'ciniki.library.item\',null,\'M.ciniki_library_main.showMenu();\',\'mc\',{\'add\':M.ciniki_library_main.menu.item_type});');
//		this.menu.addButton('tools', 'Tools', 'M.ciniki_library_main.tools.show(\'M.ciniki_library_main.showMenu();\');');
		this.menu.addClose('Back');

		//
		// The album list
		//
		this.list = new M.panel('Library',
			'ciniki_library_main', 'list',
			'mc', 'medium', 'sectioned', 'ciniki.library.main.list');
		this.list.data = {};
		this.list.item_type = 10;
		this.list.sections = {
			'search':{'label':'', 'autofocus':'yes', 'type':'livesearchgrid', 'livesearchcols':1,
				'hint':'Search', 
				'noData':'No items found',
				'headerValues':null,
				},
			'items':{'label':'', 'type':'simplegrid', 'num_cols':1,
				'sortable':'yes',
				},
			};
		this.list.liveSearchCb = function(s, i, v) {
			if( v != '' ) {
				M.api.getJSONBgCb('ciniki.library.itemSearch', {'business_id':M.curBusinessID, 'start_needle':v, 'limit':'15'},
					function(rsp) {
						M.ciniki_library_main.list.liveSearchShow(s, null, M.gE(M.ciniki_library_main.list.panelUID + '_' + s), rsp.items);
					});
			}
			return true;
		};
		this.list.liveSearchResultValue = function(s, f, i, j, d) {
			return (d.item.author_display!=''?d.item.author_display+', ':'') + d.item.title + (d.item.wanted=='yes'?' [WANTED]':'');
		};
		this.list.liveSearchResultRowFn = function(s, f, i, j, d) {
			return 'M.startApp(\'ciniki.library.item\',null,\'M.ciniki_library_main.showMenu();\',\'mc\',{\'item_id\':\'' + d.item.id + '\'});';
		};
		this.list.liveSearchResultRowStyle = function(s, f, i, d) { return ''; };
// 		Currently not allowing full search
//		this.list.liveSearchSubmitFn = function(s, search_str) {
//			M.ciniki_library_main.searchArtCatalog('M.ciniki_library_main.showMenu();', search_str);
//		};
		this.list.cellValue = function(s, i, j, d) {
			switch (j) {
				case 0: return d.item.author_display;
				case 1: return d.item.title;
				case 2: return d.item.year;
			}
		};
		this.list.rowFn = function(s, i, d) {
			return 'M.startApp(\'ciniki.library.item\',null,\'M.ciniki_library_main.showMenu();\',\'mc\',{\'item_id\':\'' + d.item.id + '\'});';
		};
		this.list.sectionData = function(s) { 
			return this.data[s];
		};
		this.list.addButton('add', 'Add', 'M.startApp(\'ciniki.library.item\',null,\'M.ciniki_library_main.showMenu();\',\'mc\',{\'add\':M.ciniki_library_main.list.item_type});');
		this.list.addClose('Back');
	}

	this.start = function(cb, appPrefix, aG) {
		args = {};
		if( aG != null ) {
			args = eval(aG);
		}

		//
		// Create container
		//
		var appContainer = M.createContainer(appPrefix, 'ciniki_library_main', 'yes');
		if( appContainer == null ) {
			alert('App Error');
			return false;
		}

		this.showMenu(cb, 10);
	}

	this.showWanted = function() {
		this.showList('M.ciniki_library_main.showMenu();','Wanted','wanted',M.ciniki_library_main.menu.item_type);
	};

	this.switchMenuTab = function(item_type) {
		var p = M.ciniki_library_main.menu;
		p.item_type = item_type;
		p.sections.tabs.selected = item_type;
		//
		// Go through the list of item types looking for a match to this item type
		//
		p.data.genres = [];
		for(i in p.data.item_types) {
			if( p.data.item_types[i].type.item_type == p.item_type ) {
				// 
				// If we find a matching item_type, then go through the tag types to find the genres
				//
				for(j in p.data.item_types[i].type.tag_types) {
					if( p.data.item_types[i].type.tag_types[j].type.tag_type == '20' ) {
						p.data.genres = p.data.item_types[i].type.tag_types[j].type.names;
						//
						// Check for the number of uncategorized number of items
						//
						if( p.data.item_types[i].type.tag_types[j].type.uncategorized != null 
							&& p.data.item_types[i].type.tag_types[j].type.uncategorized > 0 ) {
							p.data.genres.push({'name':{'permalink':'', 'tag_name':'No Genre', 'tag_type':'20',
								'num_items':p.data.item_types[i].type.tag_types[j].type.uncategorized}});
						}
					}
				}
			}
		}
		p.refresh();
		p.show();
	}

	this.showMenu = function(cb, item_type) {
		if( cb != null ) { this.menu.cb = cb; }
		if( item_type != null ) { this.menu.item_type = item_type; this.menu.sections.tabs.selected = item_type; }
		this.menu.data = {};
		M.api.getJSONCb('ciniki.library.itemStats', {'business_id':M.curBusinessID}, function(rsp) {
			if( rsp.stat != 'ok' ) {
				M.api.err(rsp);
				return false;
			}
			var p = M.ciniki_library_main.menu;
			p.data = rsp;
			M.ciniki_library_main.switchMenuTab(p.item_type);
		});
	};

	this.showList = function(cb, title, list_type, item_type, tag_type, tag_permalink) {
		if( title != null ) { this.list.title = unescape(title); }
		if( list_type != null ) { this.list.list_type = list_type; }
		if( item_type != null ) { this.list.item_type = item_type; }
		if( tag_type != null ) { this.list.tag_type = tag_type; }
		if( tag_permalink != null ) { this.list.tag_permalink = tag_permalink; }
		if( this.list.item_type == '10' ) {
			this.list.sections.items.num_cols = 3;
			this.list.sections.items.headerValues = ['Artist', 'Album', 'Year'];
			this.list.sections.items.sortTypes = ['text', 'text', 'number'];
		} else if( this.list.item_type == '20' ) {
			this.list.sections.items.num_cols = 3;
			this.list.sections.items.headerValues = ['Author', 'Title', 'Year'];
			this.list.sections.items.sortTypes = ['text', 'text', 'number'];
		}
		if( this.list.list_type == 'genre' ) {
			M.api.getJSONCb('ciniki.library.itemList', {'business_id':M.curBusinessID, 
				'item_type':this.list.item_type, 'tag_type':this.list.tag_type, 
				'tag_permalink':this.list.tag_permalink, 'flags':0x01}, function(rsp) {
					if( rsp.stat != 'ok' ) {
						M.api.err(rsp);
						return false;
					}
					var p = M.ciniki_library_main.list;
					p.data = rsp;
					p.refresh();
					p.show(cb);
				});
		} else if( this.list.list_type == 'wanted' ) {
			M.api.getJSONCb('ciniki.library.itemList', {'business_id':M.curBusinessID, 
				'item_type':this.list.item_type, 'flags':0x02}, function(rsp) {
					if( rsp.stat != 'ok' ) {
						M.api.err(rsp);
						return false;
					}
					var p = M.ciniki_library_main.list;
					p.data = rsp;
					p.refresh();
					p.show(cb);
				});
			
		}

	};
}
