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
			'search':{'label':'', 'type':'livesearchgrid', 'livesearchcols':1,
				'hint':'Search', 
				'noData':'No items found',
				'headerValues':null,
				},
			'tabs':{'label':'', 'type':'paneltabs', 'selected':this.menu.item_type, 'tabs':{
				'10':{'label':'Music', 'fn':'M.ciniki_library_main.showMenu(null,\'10\');'},
				'20':{'label':'Books', 'fn':'M.ciniki_library_main.showMenu(null,\'20\');'},
				}},
			'type_10':{'label':'Music', 'visible':'no', 'type':'simplegrid', 'num_cols':3,
				'headerValues':['Artist/Band', 'Album', 'Year'],
				},
			'type_20':{'label':'Books', 'visible':'no', 'type':'simplegrid', 'num_cols':3,
				'headerValues':['Author', 'Title', 'Year'],
				},
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
			return d.item.title + (d.item.author_display!=''?', '+d.item.author_display:'');
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
			switch (j) {
				case 0: return d.item.author_display;
				case 1: return d.item.title;
				case 2: return d.item.year;
			}
		};
		this.menu.rowFn = function(s, i, d) {
			return 'M.startApp(\'ciniki.library.item\',null,\'M.ciniki_library_main.showMenu();\',\'mc\',{\'item_id\':\'' + d.item.id + '\'});';
		};
		this.menu.sectionData = function(s) { 
			return this.data[s];
		};
		this.menu.addButton('add', 'Add', 'M.startApp(\'ciniki.library.item\',null,\'M.ciniki_library_main.showMenu();\',\'mc\',{\'add\':M.ciniki_library_main.menu.item_type});');
//		this.menu.addButton('tools', 'Tools', 'M.ciniki_library_main.tools.show(\'M.ciniki_library_main.showMenu();\');');
		this.menu.addClose('Back');
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

	this.showMenu = function(cb, item_type) {
		if( item_type != null ) { this.menu.item_type = item_type; this.menu.sections.tabs.selected = item_type; }
		this.menu.data = {};
		var rsp = M.api.getJSONCb('ciniki.library.itemList', 
			{'business_id':M.curBusinessID, 'item_type':this.menu.item_type}, function(rsp) {
				if( rsp.stat != 'ok' ) {
					M.api.err(rsp);
					return false;
				}
				// 
				// Setup the menu to display the categories
				//
				var p = M.ciniki_library_main.menu;
				p.data['type_' + p.item_type] = rsp.items;
				if( p.item_type == 10 ) {
					p.sections['type_10'].visible = 'yes';
					p.sections['type_20'].visible = 'no';
				} else if( p.item_type == 20 ) {
					p.sections['type_10'].visible = 'no';
					p.sections['type_20'].visible = 'yes';
				}
				p.refresh();
				p.show(cb);
			});
	};
}
