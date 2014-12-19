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
	this.wantedPriorities = {
		'0':'',
		'1':'$',
		'2':'$$',
		'3':'$$$',
		'4':'$$$$',
		'5':'$$$$$',
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
			'menu':{'label':'', 'visible':'no', 'list':{
				'wanted':{'label':'Wanted', 'visible':'no', 'fn':'M.ciniki_library_main.showWanted();'},
				// IF MORE ADDED MAKE SURE TO UPDATE this.start
				}},
			'formats':{'label':'Formats', 'type':'simplegrid', 'num_cols':1,
				'noData':'No formats found',
				},
			'genres':{'label':'Genres', 'type':'simplegrid', 'num_cols':1,
				'noData':'No genres found',
				},
			'tags':{'label':'Tags', 'type':'simplegrid', 'num_cols':1,
				'noData':'No tags found',
				},
			'purchased_places':{'label':'Purchased', 'type':'simplegrid', 'num_cols':1,
				'noData':'No places found',
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
			var priority = '';
			if( d.item.ratings != null && d.item.ratings.length > 0 ) {
				if( M.curBusiness.numEmployees > 1 ) {
					for(i in d.item.ratings) {
						if( M.curBusiness.employees[d.item.ratings[i].rating.user_id] != null 
							&& d.item.ratings[i].rating.rating > 0
							) {
							priority += ', ' + M.curBusiness.employees[d.item.ratings[i].rating.user_id] + ': ' + M.ciniki_library_main.wantedPriorities[d.item.ratings[0].rating.rating];
						}
					}
				} else if( M.curBusiness.numEmployees == 1 ) {
					priority = ', ' + M.ciniki_library_main.wantedPriorities[d.item.ratings[0].rating.rating];
				}
			}
			return (d.item.author_display!=''?d.item.author_display+', ':'') + d.item.title 
				+ (d.item.wanted=='yes'?' [WANTED' + (priority!=''?priority:'') + ']':'');
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
			if( s == 'formats' ) {
				return d.format.item_format_text + ' <span class="count">' + d.format.num_items + '</span>';
			}
			if( s == 'genres' ) {
				return d.name.tag_name + ' <span class="count">' + d.name.num_items + '</span>';
			}
			if( s == 'tags' ) {
				return d.name.tag_name + ' <span class="count">' + d.name.num_items + '</span>';
			}
			if( s == 'purchased_places' ) {
				return d.place.purchased_place + ' <span class="count">' + d.place.num_items + '</span>';
			}
		};
		this.menu.rowFn = function(s, i, d) {
			if( s == 'formats' ) {
				return 'M.ciniki_library_main.showList(\'M.ciniki_library_main.showMenu();\',\'' + escape(d.format.item_format_text) + '\',\'format\',\'' + M.ciniki_library_main.menu.item_type + '\',null,null,\'' + d.format.item_format + '\');'
			}
			if( s == 'genres' ) {
				return 'M.ciniki_library_main.showList(\'M.ciniki_library_main.showMenu();\',\'' + escape(d.name.tag_name) + '\',\'genre\',\'' + M.ciniki_library_main.menu.item_type + '\',\'' + d.name.tag_type + '\',\'' + d.name.permalink + '\');'
			}
			if( s == 'tags' ) {
				return 'M.ciniki_library_main.showList(\'M.ciniki_library_main.showMenu();\',\'' + escape(d.name.tag_name) + '\',\'tag\',\'' + M.ciniki_library_main.menu.item_type + '\',\'' + d.name.tag_type + '\',\'' + d.name.permalink + '\');'
			}
			if( s == 'purchased_places' ) {
				return 'M.ciniki_library_main.showList(\'M.ciniki_library_main.showMenu();\',\'' + escape(d.place.purchased_place) + '\',\'purchased_place\',\'' + M.ciniki_library_main.menu.item_type + '\',null,null,null,\'' + escape(d.place.purchased_place) + '\');'
			}
		};
//		this.menu.listCount = function(s, i, d) { 
//			if( d.count != null ) { return d.count; }
//			return ''; 
//		};
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
			'mc', 'medium mediumflex', 'sectioned', 'ciniki.library.main.list');
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
				M.api.getJSONBgCb('ciniki.library.itemSearch', {'business_id':M.curBusinessID, 'start_needle':v, 'flags':(M.ciniki_library_main.list.title=='Wanted'?2:0), 'limit':'15'},
					function(rsp) {
						M.ciniki_library_main.list.liveSearchShow(s, null, M.gE(M.ciniki_library_main.list.panelUID + '_' + s), rsp.items);
					});
			}
			return true;
		};
		this.list.liveSearchResultValue = this.menu.liveSearchResultValue;
		this.list.liveSearchResultRowFn = function(s, f, i, j, d) {
			return 'M.startApp(\'ciniki.library.item\',null,\'M.ciniki_library_main.showList();\',\'mc\',{\'item_id\':\'' + d.item.id + '\'});';
		};
		this.list.liveSearchResultRowStyle = function(s, f, i, d) { return ''; };
// 		Currently not allowing full search
//		this.list.liveSearchSubmitFn = function(s, search_str) {
//			M.ciniki_library_main.searchArtCatalog('M.ciniki_library_main.showMenu();', search_str);
//		};
		this.list.sectionData = function(s) { 
			return this.data[s];
		};
		this.list.cellValue = function(s, i, j, d) {
			if( this.title == 'Wanted' && j > 1 ) {
				d.item[this.sections[s].dataMaps[j]]
				var r = (d.item[this.sections[s].dataMaps[j]]!=null?d.item[this.sections[s].dataMaps[j]]:0);
				var v = '';
				for(k=1;k<6;k++) {
					v += '<span class="' + (k>r?'rating_off':'rating_on') + '" onclick="event.stopPropagation();M.ciniki_library_main.updateRating(event,\'' + d.item.id + '\',\'' + this.sections[s].dataMaps[j] + '\',\'' + (k==r?0:k) + '\');">$</span>';
//					v += '<span class="' + (k>r?'rating_off':'rating_on') + '" onclick="event.stopPropagation();M.ciniki_library_main.updateRating(event,\'' + d.item.id + '\',\'' + this.sections[s].dataMaps[j].replace(/.*-([0-9]+)-.*/,"$1") + '\',\'' + (k==r?0:k) + '\');">$</span>';
				}
				return v;
			}
			return d.item[this.sections[s].dataMaps[j]];
		};
		this.list.cellSortValue = function(s, i, j, d) {
			if( j == 0 ) {
				return d.item.author_sort;
			}
			if( j > 1 ) {
				if( d.item[this.sections[s].dataMaps[j]] != null ) { 
					return d.item[this.sections[s].dataMaps[j]];
				}
				return 0;
			}
		};
		this.list.cellFn = function(s, i, j, d) {
			if( this.title == 'Wanted' && j > 1 ) {
				return 'event.stopPropagation();';
			}
		};
		this.list.rowFn = function(s, i, d) {
			return 'M.startApp(\'ciniki.library.item\',null,\'M.ciniki_library_main.showList();\',\'mc\',{\'item_id\':\'' + d.item.id + '\'});';
		};
		this.list.footerValue = function(s, i, d) {
			if( s == 'items' && this.list_type == 'purchased_place' && this.data.totals != null ) {
				switch(i) {
					case 4: return this.data.totals.purchased_price;
				}
				return '';
			}
			return null;
		};
//		this.list.footerClass = function(s, i, d) {
//			if( i == 4 ) { return 'alignright'; }
//			return '';
//		}
		this.list.addButton('add', 'Add', 'M.startApp(\'ciniki.library.item\',null,\'M.ciniki_library_main.showList();\',\'mc\',{\'add\':M.ciniki_library_main.list.item_type});');
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

		//
		// Decide what to display
		//
		this.menu.sections.tabs.tabs = {};
		var default_tab = 0;
		var ct = 0;
		if( (M.curBusiness.modules['ciniki.library'].flags&0x01) > 0 ) {
			default_tab = 10;
			ct++;
			this.menu.sections.tabs.tabs['10'] = {'label':'Music', 'fn':'M.ciniki_library_main.switchMenuTab(\'10\');'};
		}
		if( (M.curBusiness.modules['ciniki.library'].flags&0x02) > 0 ) {
			if( default_tab == 0 ) { default_tab = 20; }
			ct++;
			this.menu.sections.tabs.tabs['20'] = {'label':'Books', 'fn':'M.ciniki_library_main.switchMenuTab(\'20\');'};
		}
		this.menu.sections.tabs.visible = (ct>1?'yes':'no');

		//
		// Check if Wanted is turned on
		//
		if( (M.curBusiness.modules['ciniki.library'].flags&0x04) > 0 ) {
			this.menu.sections.menu.list.wanted.visible = 'yes';
			this.menu.sections.menu.visible = 'yes';
		} else {
			this.menu.sections.menu.list.wanted.visible = 'no';
			this.menu.sections.menu.visible = 'no';
		}

		this.showMenu(cb, default_tab);
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
		p.data.formats = [];
		p.data.genres = [];
		p.data.tags = [];
		p.data.purchased_places = [];
		p.sections.menu.visible = 'no';
		p.sections.menu.list.wanted.count = 0;
		p.sections.menu.list.wanted.visible = 'no';
		for(i in p.data.item_types) {
			if( p.data.item_types[i].type.item_type == p.item_type ) {
				if( p.data.item_types[i].type.wanted != null ) {
					p.sections.menu.list.wanted.count = p.data.item_types[i].type.wanted;
					p.sections.menu.visible = 'yes';
					p.sections.menu.list.wanted.visible = 'yes';
				}
				// 
				// If we find a matching item_type, then go through the tag types to find the genres
				//
				if( p.data.item_types[i].type.formats != null ) {
					p.data.formats = p.data.item_types[i].type.formats;
				}
				for(j in p.data.item_types[i].type.tag_types) {
					if( p.data.item_types[i].type.tag_types[j].type.tag_type == '20' ) {
						p.data.genres = p.data.item_types[i].type.tag_types[j].type.names;
					}
					if( p.data.item_types[i].type.tag_types[j].type.tag_type == '40' ) {
						p.data.tags = p.data.item_types[i].type.tag_types[j].type.names;
					}
				}
				if( p.data.item_types[i].type.purchased_places != null ) {
					p.data.purchased_places = p.data.item_types[i].type.purchased_places;
				}
			}
		}
		p.sections.tags.visible = (p.data.tags.length==0?'no':'yes');
		p.sections.formats.visible = (p.data.formats.length==0?'no':'yes');
		p.sections.purchased_places.visible = (p.data.purchased_places.length==0?'no':'yes');
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
			// 
			// Add the uncategoried to bottom of genres
			//
			for(i in p.data.item_types) {
				if( p.data.item_types[i].type.item_type == p.item_type ) {
					// If we find a matching item_type, then go through the tag types to find the genres
					for(j in p.data.item_types[i].type.tag_types) {
						if( p.data.item_types[i].type.tag_types[j].type.tag_type == '20' ) {
							// Look for tag type to add uncategoried for genre
							if( p.data.item_types[i].type.tag_types[j].type.uncategorized != null 
								&& p.data.item_types[i].type.tag_types[j].type.uncategorized > 0 ) {
								p.data.item_types[i].type.tag_types[j].type.names.push({'name':{'permalink':'', 
									'tag_name':'No Genre', 'tag_type':'20',
									'num_items':p.data.item_types[i].type.tag_types[j].type.uncategorized}});
							}
						}
					}
				}
			}
			M.ciniki_library_main.switchMenuTab(p.item_type);
		});
	};

	this.showList = function(cb, title, list_type, item_type, tag_type, tag_permalink, format, purchased_place) {
		if( title != null ) { this.list.title = unescape(title); this.list.sections.items.label = unescape(title); }
		if( list_type != null ) { this.list.list_type = list_type; }
		if( item_type != null ) { this.list.item_type = item_type; }
		if( tag_type != null ) { this.list.tag_type = tag_type; }
		if( tag_permalink != null ) { this.list.tag_permalink = tag_permalink; }
		if( format != null ) { this.list.item_format = format; }
		if( purchased_place != null ) { this.list.purchased_place = unescape(purchased_place); }
		if( this.list.item_type == '10' ) {
			this.list.sections.items.num_cols = 3;
			this.list.sections.items.headerValues = ['Artist', 'Album', 'Year'];
			this.list.sections.items.sortTypes = ['alttext', 'text', 'number'];
			this.list.sections.items.dataMaps = ['author_display', 'title', 'year'];
		} else if( this.list.item_type == '20' ) {
			this.list.sections.items.num_cols = 3;
			this.list.sections.items.headerValues = ['Author', 'Title', 'Year'];
			this.list.sections.items.sortTypes = ['alttext', 'text', 'number'];
			this.list.sections.items.dataMaps = ['author_display', 'title', 'year'];
		}
		if( this.list.list_type == 'genre' || this.list.list_type == 'tag' ) {
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
		} 
		else if( this.list.list_type == 'format' ) {
			M.api.getJSONCb('ciniki.library.itemList', {'business_id':M.curBusinessID, 
				'item_type':this.list.item_type, 'flags':0x01, 'item_format':this.list.item_format}, function(rsp) {
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
		else if( this.list.list_type == 'purchased_place' ) {
			this.list.sections.items.num_cols = 5;
			this.list.sections.items.headerValues[2] = 'Place';
			this.list.sections.items.headerValues[3] = 'Date';
			this.list.sections.items.headerValues[4] = 'Price';
			this.list.sections.items.sortTypes = ['alttext', 'text', 'number', 'text', 'date', 'number'];
			this.list.sections.items.dataMaps = ['author_display', 'title', 'purchased_place', 'purchased_date', 'purchased_price'];
			M.api.getJSONCb('ciniki.library.itemList', {'business_id':M.curBusinessID, 
				'item_type':this.list.item_type, 'flags':0x01, 'purchased_place':encodeURIComponent(this.list.purchased_place)}, function(rsp) {
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
		else if( this.list.list_type == 'wanted' ) {
			this.list.sections.items.num_cols = 3;
			this.list.sections.items.headerValues = ['Author', 'Title'];
			var col = 2;
			for(i in M.curBusiness.employees) {
				this.list.sections.items.headerValues[col] = M.curBusiness.employees[i];
				this.list.sections.items.sortTypes[col] = 'altnumber';
				this.list.sections.items.dataMaps[col] = 'user-' + i + '-rating';
				col++;
			}
			this.list.sections.items.num_cols = col;
			M.api.getJSONCb('ciniki.library.itemListWanted', {'business_id':M.curBusinessID, 
				'item_type':this.list.item_type}, function(rsp) {
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

	this.updateRating = function(e, item_id, field, rating) {
		var args = {'business_id':M.curBusinessID, 'item_id':item_id};
		args[field] = rating;
		M.api.getJSONCb('ciniki.library.itemUpdate', args, function(rsp) {
			if( rsp.stat != 'ok' ) {
				M.api.err(rsp);
				return false;
			}
			var p = M.ciniki_library_main.list;
			p.data = rsp;
			var v = '';
			for(k=1;k<6;k++) {
				v += '<span class="' + (k>rating?'rating_off':'rating_on') + '" onclick="event.stopPropagation();M.ciniki_library_main.updateRating(event,\'' + item_id + '\',\'' + field + '\',\'' + (k==rating?0:k) + '\');">$</span>';
			}
			e.srcElement.parentNode.innerHTML = v;
		});
	};
}
