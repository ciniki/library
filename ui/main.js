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
    this.musicFormats = {
        '11':'Vinyl',
        '12':'CD',
        '15':'Digital',
        };
    this.bookFormats = {
        '30':'Hardcover',
        '41':'Trade Paperback',
        '42':'Mass Paperback',
        '51':'epub',
        '52':'mobi',
        };
    this.musicFlags = {
        '1':{'name':'Owned'},
        '2':{'name':'Wanted'},
        };
    this.bookFlags = {
        '1':{'name':'Owned'},
        '2':{'name':'Wanted'},
        };
    this.ratingToggles = {
        '1':'*',
        '2':'**',
        '3':'***',
        '4':'****',
        '5':'*****',
        };
    this.priorityToggles = {
        '1':'$',
        '2':'$$',
        '3':'$$$',
        '4':'$$$$',
        '5':'$$$$$',
        };
    //
    // Setup the main panel to list the collection
    //
    this.menu = new M.panel('Library', 'ciniki_library_main', 'menu', 'mc', 'medium', 'sectioned', 'ciniki.library.main.menu');
    this.menu.data = {};
    this.menu.item_type = 10;
    this.menu.cur_tab = 'genres';
    this.menu.sections = {
        'search':{'label':'', 'aside':'yes', 'autofocus':'yes', 'type':'livesearchgrid', 'livesearchcols':1,
            'hint':'Search', 
            'noData':'No items found',
            'headerValues':null,
            },
        'tabs':{'label':'', 'aside':'yes', 'type':'paneltabs', 'selected':this.menu.item_type, 'tabs':{
            '10':{'label':'Music', 'fn':'M.ciniki_library_main.menu.switchMenuTab(\'10\');'},
            '20':{'label':'Books', 'fn':'M.ciniki_library_main.menu.switchMenuTab(\'20\');'},
            }},
        'menu':{'label':'', 'aside':'yes', 'list':{
            'wanted':{'label':'Wanted', 'visible':'no', 'fn':'M.ciniki_library_main.list.showWanted();'},
            // IF MORE ADDED MAKE SURE TO UPDATE this.start
            }},
        'formats':{'label':'Formats', 'aside':'yes', 'type':'simplegrid', 'num_cols':1,
            'noData':'No formats found',
            },
        '_tabs':{'label':'', 'aside':'yes', 'type':'paneltabs', 'selected':this.menu.cur_tab, 'tabs':{
            'genres':{'label':'Genres', 'fn':'M.ciniki_library_main.menu.switchTab(\'genres\');'},
            'tags':{'label':'Tags', 'fn':'M.ciniki_library_main.menu.switchTab(\'tags\');'},
            'locations':{'label':'Locations', 'fn':'M.ciniki_library_main.menu.switchTab(\'locations\');'},
            'purchased_places':{'label':'Purchased', 'fn':'M.ciniki_library_main.menu.switchTab(\'purchased_places\');'},
            }},
        'genres':{'label':'Genres', 'visible':'no', 'aside':'yes', 'type':'simplegrid', 'num_cols':1,
            'noData':'No genres found',
            },
        'tags':{'label':'Tags', 'visible':'no', 'aside':'yes', 'type':'simplegrid', 'num_cols':1,
            'noData':'No tags found',
            },
        'locations':{'label':'Locations', 'visible':'no', 'aside':'yes', 'type':'simplegrid', 'num_cols':1,
            'noData':'No locations found',
            },
        'purchased_places':{'label':'Purchased', 'visible':'no', 'aside':'yes', 'type':'simplegrid', 'num_cols':1,
            'noData':'No places found',
            'addTxt':'more',
            'addFn':'M.ciniki_library_main.purchased.open(\'M.ciniki_library_main.menu.open();\',M.ciniki_library_main.menu.item_type);',
            },
        'items':{'label':'', 'visible':'no', 'type':'simplegrid', 'num_cols':1,
            'sortable':'yes',
            },
        };
    this.menu.listby = 'category';
    this.menu.liveSearchCb = function(s, i, v) {
        if( v != '' ) {
            M.api.getJSONBgCb('ciniki.library.itemSearch', {'tnid':M.curTenantID, 'start_needle':v, 'limit':'15'},
                function(rsp) {
                    M.ciniki_library_main.menu.liveSearchShow(s, null, M.gE(M.ciniki_library_main.menu.panelUID + '_' + s), rsp.items);
                });
        }
        return true;
    };
    this.menu.liveSearchResultValue = function(s, f, i, j, d) {
        var priority = '';
        if( d.item.ratings != null && d.item.ratings.length > 0 ) {
            if( M.curTenant.numEmployees > 1 ) {
                for(i in d.item.ratings) {
                    if( M.curTenant.employees[d.item.ratings[i].rating.user_id] != null 
                        && d.item.ratings[i].rating.rating > 0
                        ) {
                        priority += ', ' + M.curTenant.employees[d.item.ratings[i].rating.user_id] + ': ' + M.ciniki_library_main.wantedPriorities[d.item.ratings[0].rating.rating];
                    }
                }
            } else if( M.curTenant.numEmployees == 1 ) {
                priority = ', ' + M.ciniki_library_main.wantedPriorities[d.item.ratings[0].rating.rating];
            }
        }
        return (d.item.author_display!=''?d.item.author_display+', ':'') + d.item.title 
            + (d.item.wanted=='yes'?' [WANTED' + (priority!=''?priority:'') + ']':'');
    };
    this.menu.liveSearchResultRowFn = function(s, f, i, j, d) {
//        return 'M.startApp(\'ciniki.library.item\',null,\'M.ciniki_library_main.menu.open();\',\'mc\',{\'item_id\':\'' + d.item.id + '\'});';
        return 'M.ciniki_library_main.edit.open(\'M.ciniki_library_main.menu.open();\',\'' + d.item.id + '\');';
    };
    this.menu.liveSearchResultRowStyle = function(s, f, i, d) { return ''; };
//      Currently not allowing full search
//      this.menu.liveSearchSubmitFn = function(s, search_str) {
//          M.ciniki_library_main.searchArtCatalog('M.ciniki_library_main.menu.open();', search_str);
//      };
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
        if( s == 'locations' ) {
            return (d.location.name==''?'Unknown':d.location.name) + ' <span class="count">' + d.location.num_items + '</span>';
        }
        if( s == 'purchased_places' ) {
            return d.place.purchased_place + ' <span class="count">' + d.place.num_items + '</span>';
        }
        if( s == 'items' ) {
            if( this.title == 'Wanted' && j > 1 ) {
                d.item[this.sections[s].dataMaps[j]]
                var r = (d.item[this.sections[s].dataMaps[j]]!=null?d.item[this.sections[s].dataMaps[j]]:0);
                var v = '';
                for(k=1;k<6;k++) {
                    v += '<span class="' + (k>r?'rating_off':'rating_on') + '" onclick="event.stopPropagation();M.ciniki_library_main.updateRating(event,\'' + d.item.id + '\',\'' + this.sections[s].dataMaps[j] + '\',\'' + (k==r?0:k) + '\');">$</span>';
                }
                return v;
            }
            return d.item[this.sections[s].dataMaps[j]];
        }
    };
    this.menu.cellSortValue = function(s, i, j, d) {
        if( s == 'items' ) {
            if( j == 0 ) {
                return d.item.author_sort;
            }
            if( j > 1 ) {
                if( d.item[this.sections[s].dataMaps[j]] != null ) { 
                    return d.item[this.sections[s].dataMaps[j]];
                }
                return 0;
            }
        }
    };
    this.menu.rowFn = function(s, i, d) {
        if( s == 'formats' ) {
            return 'M.ciniki_library_main.list.open(\'M.ciniki_library_main.menu.open();\',\'' + escape(d.format.item_format_text) + '\',\'format\',\'' + M.ciniki_library_main.menu.item_type + '\',null,null,\'' + d.format.item_format + '\');'
        }
        if( s == 'genres' ) {
            return 'M.ciniki_library_main.list.open(\'M.ciniki_library_main.menu.open();\',\'' + escape(d.name.tag_name) + '\',\'genre\',\'' + M.ciniki_library_main.menu.item_type + '\',\'' + d.name.tag_type + '\',\'' + d.name.permalink + '\');'
        }
        if( s == 'tags' ) {
            return 'M.ciniki_library_main.list.open(\'M.ciniki_library_main.menu.open();\',\'' + escape(d.name.tag_name) + '\',\'tag\',\'' + M.ciniki_library_main.menu.item_type + '\',\'' + d.name.tag_type + '\',\'' + d.name.permalink + '\');'
        }
        if( s == 'locations' ) {
            return 'M.ciniki_library_main.list.open(\'M.ciniki_library_main.menu.open();\',\'' + escape(d.location.name) + '\',\'location\',\'' + M.ciniki_library_main.menu.item_type + '\',null,null,null,null,\'' + escape(d.location.name) + '\');'
        }
        if( s == 'purchased_places' ) {
            return 'M.ciniki_library_main.list.open(\'M.ciniki_library_main.menu.open();\',\'' + escape(d.place.purchased_place) + '\',\'purchased_place\',\'' + M.ciniki_library_main.menu.item_type + '\',null,null,null,\'' + escape(d.place.purchased_place) + '\');'
        }
        if( s == 'items' ) {
            //return 'M.startApp(\'ciniki.library.item\',null,\'M.ciniki_library_main.menu.open();\',\'mc\',{\'item_id\':\'' + d.item.id + '\'});';
            return 'M.ciniki_library_main.edit.open(\'M.ciniki_library_main.menu.open();\',\'' + d.item.id + '\');';
        }
    };
//      this.menu.listCount = function(s, i, d) { 
//          if( d.count != null ) { return d.count; }
//          return ''; 
//      };
    this.menu.listFn = function(s, i, d) { return d.fn; }
    this.menu.noData = function(s) {
        if( this.sections[s].noData != null ) { return this.sections[s].noData; }
        return '';
    }
    this.menu.sectionData = function(s) { 
        if( s == 'menu' ) { return this.sections[s].list; }
        return this.data[s];
    };
    this.menu.open = function(cb, item_type) {
        if( cb != null ) { this.cb = cb; }
        if( item_type != null ) { 
            this.item_type = item_type; 
            this.sections.tabs.selected = item_type; 
        }
        this.data = {};
        this.list_type = '';
        M.api.getJSONCb('ciniki.library.itemStats', {'tnid':M.curTenantID}, function(rsp) {
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
            p.switchMenuTab(p.item_type);
        });
    };
    this.menu.switchMenuTab = function(item_type) {
        var p = this;
        this.item_type = item_type;
        this.sections.tabs.selected = item_type;
        //
        // Go through the list of item types looking for a match to this item type
        //
        this.data.formats = [];
        this.data.genres = [];
        this.data.tags = [];
        this.data.purchased_places = [];
        this.data.locations = [];
        this.sections.menu.visible = 'no';
        this.sections.menu.list.wanted.count = 0;
        this.sections.menu.list.wanted.visible = 'no';
        for(i in this.data.item_types) {
            if( this.data.item_types[i].type.item_type == this.item_type ) {
                if( this.data.item_types[i].type.wanted != null ) {
                    this.sections.menu.list.wanted.count = this.data.item_types[i].type.wanted;
                    this.sections.menu.visible = 'yes';
                    this.sections.menu.list.wanted.visible = 'yes';
                }
                // 
                // If we find a matching item_type, then go through the tag types to find the genres
                //
                if( this.data.item_types[i].type.formats != null ) {
                    this.data.formats = this.data.item_types[i].type.formats;
                }
                for(j in this.data.item_types[i].type.tag_types) {
                    if( this.data.item_types[i].type.tag_types[j].type.tag_type == '20' ) {
                        this.data.genres = this.data.item_types[i].type.tag_types[j].type.names;
                    }
                    if( this.data.item_types[i].type.tag_types[j].type.tag_type == '40' ) {
                        this.data.tags = this.data.item_types[i].type.tag_types[j].type.names;
                    }
                }
                if( this.data.item_types[i].type.locations != null ) {
                    this.data.locations = this.data.item_types[i].type.locations;
                }
                if( this.data.item_types[i].type.purchased_places != null ) {
                    this.data.purchased_places = this.data.item_types[i].type.purchased_places;
                }
            }
        }
        var ct = 0;
        this.sections.formats.visible = (this.data.formats.length==0?'no':'yes');
        if( this.data.genres.length == 0 ) {
            this.sections.genres.visible = 'no';
            this.sections._tabs.tabs.genres.visible = 'no';
        } else {
            this.sections.genres.visible = 'yes';
            this.sections._tabs.tabs.genres.visible = 'yes';
            ct++;
        }
        if( this.data.tags.length == 0 ) {
            this.sections.tags.visible = 'no';
            this.sections._tabs.tabs.tags.visible = 'no';
        } else {
            this.sections.tags.visible = 'yes';
            this.sections._tabs.tabs.tags.visible = 'yes';
            ct++;
        }
        if( this.data.locations.length == 0 ) {
            this.sections.locations.visible = 'no';
            this.sections._tabs.tabs.locations.visible = 'no';
        } else {
            this.sections.locations.visible = 'yes';
            this.sections._tabs.tabs.locations.visible = 'yes';
            ct++;
        }
        if( this.data.purchased_places.length == 0 ) {
            this.sections.purchased_places.visible = 'no';
            this.sections._tabs.tabs.purchased_places.visible = 'no';
        } else {
            this.sections.purchased_places.visible = 'yes';
            this.sections._tabs.tabs.purchased_places.visible = 'yes';
            ct++;
        }
        if( ct > 1 ) {
            this.sections._tabs.visible = 'yes';
        }

        this.switchTab();
    }
    this.menu.switchTab = function(tab) {
        var p = this;
        if( tab != null ) { this.cur_tab = tab; }
        //
        // Setup the tabs
        //
        for(i in this.sections._tabs.tabs) {
            if( this.cur_tab == i ) {
                this.sections[i].visible = 'yes';
                this.sections._tabs.selected = i;
            } else {
                this.sections[i].visible = 'no';
            }
        }
        if( this.list_type != null && this.list_type != '' ) {
            this.size = 'medium mediumaside';
            this.sections.items.visible = 'yes';
            M.ciniki_library_main.list.open();
        } else {
            this.size = 'medium';
            this.sections.items.visible = 'no';
            this.refresh();
            this.show();
        }
    }
    this.menu.addButton('add', 'Add', 'M.ciniki_library_main.edit.open(\'M.ciniki_library_main.menu.open();\',0);');
    //'M.startApp(\'ciniki.library.item\',null,\'M.ciniki_library_main.menu.open();\',\'mc\',{\'add\':M.ciniki_library_main.menu.item_type});');
//      this.menu.addButton('tools', 'Tools', 'M.ciniki_library_main.tools.show(\'M.ciniki_library_main.menu.open();\');');
    this.menu.addClose('Back');

    //
    // The album list
    //
    this.list = new M.panel('Library', 'ciniki_library_main', 'list', 'mc', 'medium mediumflex', 'sectioned', 'ciniki.library.main.list');
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
            M.api.getJSONBgCb('ciniki.library.itemSearch', {'tnid':M.curTenantID, 'start_needle':v, 'flags':(M.ciniki_library_main.list.title=='Wanted'?2:0), 'limit':'15'},
                function(rsp) {
                    M.ciniki_library_main.list.liveSearchShow(s, null, M.gE(M.ciniki_library_main.list.panelUID + '_' + s), rsp.items);
                });
        }
        return true;
    };
    this.list.liveSearchResultValue = this.menu.liveSearchResultValue;
    this.list.liveSearchResultRowFn = function(s, f, i, j, d) {
        return 'M.ciniki_library_main.edit.open(\'M.ciniki_library_main.menu.open();\',\'' + d.item.id + '\');';
        // return 'M.startApp(\'ciniki.library.item\',null,\'M.ciniki_library_main.list.open();\',\'mc\',{\'item_id\':\'' + d.item.id + '\'});';
    };
    this.list.liveSearchResultRowStyle = function(s, f, i, d) { return ''; };
//      Currently not allowing full search
//      this.list.liveSearchSubmitFn = function(s, search_str) {
//          M.ciniki_library_main.searchArtCatalog('M.ciniki_library_main.menu.open();', search_str);
//      };
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
        return 'M.ciniki_library_main.edit.open(\'M.ciniki_library_main.menu.open();\',\'' + d.item.id + '\');';
        // return 'M.startApp(\'ciniki.library.item\',null,\'M.ciniki_library_main.list.open();\',\'mc\',{\'item_id\':\'' + d.item.id + '\'});';
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
    this.list.addButton('add', 'Add', 'M.ciniki_library_main.edit.open(\'M.ciniki_library_main.menu.open();\',0);');
//    'M.startApp(\'ciniki.library.item\',null,\'M.ciniki_library_main.list.open();\',\'mc\',{\'add\':M.ciniki_library_main.list.item_type});');
    this.list.addClose('Back');

    //
    // The panel for display the list of places and amount spent
    //
    this.purchased = new M.panel('Purchased', 'ciniki_library_main', 'purchased', 'mc', 'medium', 'sectioned', 'ciniki.library.main.purchased');
    this.purchased.data = {};
    this.purchased.item_type = 10;
    this.purchased.sections = {
        'places':{'label':'Purchased', 'type':'simplegrid', 'num_cols':2,
            'headerValues':['Place', 'Amount'],
            'sortable':'yes',
            'sortTypes':['text', 'altnumber'],
            'noData':'No places found',
            },
        };
    this.purchased.sectionData = function(s) { 
        return this.data[s];
    };
    this.purchased.cellValue = function(s, i, j, d) {
        switch(j) {
            case 0: return d.place.name;
            case 1: return d.place.total_amount;
        }
    };
    this.purchased.cellSortValue = function(s, i, j, d) {
        switch(j) {
            case 0: return d.place.name;
            case 1: return d.place.total_amount.replace(/\$/, '');
        }
    };
    this.purchased.rowFn = function(s, i, d) {
        return 'M.ciniki_library_main.list.open(\'M.ciniki_library_main.purchased.open();\',\'' + escape(d.place.name) + '\',\'purchased_place\',\'' + M.ciniki_library_main.purchased.item_type + '\',null,null,null,\'' + escape(d.place.name) + '\');'
    };
    this.purchased.footerValue = function(s, i, d) {
        if( this.data.totals != null ) {
            switch(i) {
                case 1: return this.data.totals.total_amount;
            }
            return '';
        }
        return null;
    };
    this.purchased.open = function(cb, item_type) {
        if( item_type != null ) { this.item_type = item_type; }
        M.api.getJSONCb('ciniki.library.purchasedStats', {'tnid':M.curTenantID, 'item_type':this.item_type}, function(rsp) {
            if( rsp.stat != 'ok' ) {
                M.api.err(rsp);
                return false;
            }
            var p = M.ciniki_library_main.purchased;
            p.data = rsp;
            p.refresh();
            p.show(cb);
        });
    };
    this.list.open = function(cb, title, list_type, item_type, tag_type, tag_permalink, format, purchased_place, location) {
        if( M.size == 'normal' ) {
            var p = M.ciniki_library_main.menu;
            p.sections.items.visible = 'yes';
            p.size = 'medium mediumaside';
        } else {
            var p = M.ciniki_library_main.list;
            M.ciniki_library_main.menu.sections.items.visible = 'no';
            M.ciniki_library_main.menu.size = 'medium';
        }
        if( title != null ) { p.title = unescape(title); p.sections.items.label = unescape(title); }
        if( list_type != null ) { p.list_type = list_type; }
        if( item_type != null ) { p.item_type = item_type; }
        if( tag_type != null ) { p.tag_type = tag_type; }
        if( tag_permalink != null ) { p.tag_permalink = tag_permalink; }
        if( format != null ) { p.item_format = format; }
        if( purchased_place != null ) { p.purchased_place = unescape(purchased_place); }
        if( location != null ) { p.location = unescape(location); }
        if( p.item_type == '10' ) {
            p.sections.items.num_cols = 3;
            p.sections.items.headerValues = ['Artist', 'Album', 'Year'];
            p.sections.items.sortTypes = ['alttext', 'text', 'number'];
            p.sections.items.dataMaps = ['author_display', 'title', 'year'];
        } else if( p.item_type == '20' ) {
            p.sections.items.num_cols = 3;
            p.sections.items.headerValues = ['Author', 'Title', 'Year'];
            p.sections.items.sortTypes = ['alttext', 'text', 'number'];
            p.sections.items.dataMaps = ['author_display', 'title', 'year'];
        }
        if( p.list_type == 'genre' || p.list_type == 'tag' ) {
            M.api.getJSONCb('ciniki.library.itemList', {'tnid':M.curTenantID, 
                'item_type':p.item_type, 'tag_type':p.tag_type, 
                'tag_permalink':p.tag_permalink, 'flags':0x01}, function(rsp) {
                    if( rsp.stat != 'ok' ) {
                        M.api.err(rsp);
                        return false;
                    }
//                  var p = M.ciniki_library_main.list;
//                  p.data = rsp;
                    p.data.items = rsp.items;
                    p.refresh();
                    p.show(cb);
                });
        } 
        else if( p.list_type == 'format' ) {
            M.api.getJSONCb('ciniki.library.itemList', {'tnid':M.curTenantID, 
                'item_type':p.item_type, 'flags':0x01, 'item_format':p.item_format}, function(rsp) {
                    if( rsp.stat != 'ok' ) {
                        M.api.err(rsp);
                        return false;
                    }
//                  var p = M.ciniki_library_main.list;
//                  p.data = rsp;
                    p.data.items = rsp.items;
                    p.refresh();
                    p.show(cb);
                });
        } 
        else if( p.list_type == 'location' ) {
            M.api.getJSONCb('ciniki.library.itemList', {'tnid':M.curTenantID, 
                'item_type':p.item_type, 'flags':0x01, 'location':encodeURIComponent(p.location)}, function(rsp) {
                    if( rsp.stat != 'ok' ) {
                        M.api.err(rsp);
                        return false;
                    }
//                  var p = M.ciniki_library_main.list;
//                  p.data = rsp;
                    p.data.items = rsp.items;
                    p.refresh();
                    p.show(cb);
                });
        } 
        else if( p.list_type == 'purchased_place' ) {
            p.sections.items.num_cols = 5;
            p.sections.items.headerValues[2] = 'Place';
            p.sections.items.headerValues[3] = 'Date';
            p.sections.items.headerValues[4] = 'Price';
            p.sections.items.sortTypes = ['alttext', 'text', 'number', 'text', 'date', 'number'];
            p.sections.items.dataMaps = ['author_display', 'title', 'purchased_place', 'purchased_date', 'purchased_price'];
            M.api.getJSONCb('ciniki.library.itemList', {'tnid':M.curTenantID, 
                'item_type':p.item_type, 'flags':0x01, 'purchased_place':encodeURIComponent(p.purchased_place)}, function(rsp) {
                    if( rsp.stat != 'ok' ) {
                        M.api.err(rsp);
                        return false;
                    }
//                  var p = M.ciniki_library_main.list;
//                  p.data = rsp;
                    p.data.items = rsp.items;
                    p.refresh();
                    p.show(cb);
                });
        } 
        else if( p.list_type == 'wanted' ) {
            p.sections.items.num_cols = 3;
            p.sections.items.headerValues = ['Author', 'Title'];
            var col = 2;
            for(i in M.curTenant.employees) {
                p.sections.items.headerValues[col] = M.curTenant.employees[i];
                p.sections.items.sortTypes[col] = 'altnumber';
                p.sections.items.dataMaps[col] = 'user-' + i + '-rating';
                col++;
            }
            p.sections.items.num_cols = col;
            M.api.getJSONCb('ciniki.library.itemListWanted', {'tnid':M.curTenantID, 
                'item_type':p.item_type}, function(rsp) {
                    if( rsp.stat != 'ok' ) {
                        M.api.err(rsp);
                        return false;
                    }
//                  var p = M.ciniki_library_main.list;
                    p.data.items = rsp.items;
                    p.refresh();
                    p.show(cb);
                });
        }
    };
    this.list.showWanted = function() {
        this.open('M.ciniki_library_main.menu.open();','Wanted','wanted',M.ciniki_library_main.menu.item_type);
    };
    this.purchased.addClose('Back');

    //
    // The edit panel
    //
    this.edit = new M.panel('Item', 'ciniki_library_main', 'edit', 'mc', 'medium mediumaside', 'sectioned', 'ciniki.library.main.edit');
    this.edit.item_id = 0;
    this.edit.data = {'item_type':10};
    this.edit.owned_wanted = 'owned';
    this.edit.formtabs = {'label':'', 'field':'item_type', 'tabs':{}};
    this.edit.forms = {};
    this.edit.forms.music = {
        '_image':{'label':'', 'aside':'yes', 'type':'imageform', 'fields':{
            'primary_image_id':{'label':'', 'type':'image_id', 'hidelabel':'yes', 'controls':'all', 'history':'no'},
            }},
        'details':{'label':'', 'aside':'yes', 'fields':{
            'item_format':{'label':'Format', 'type':'toggle', 'default':'11', 'toggles':this.musicFormats},
            'title':{'label':'Title', 'type':'text'},
            'author_display':{'label':'Artist/Band', 'type':'text', 'livesearch':'yes', 'livesearchempty':'no'},
            'author_sort':{'label':'Sort Artist', 'type':'text', 'livesearch':'yes', 'livesearchempty':'no'},
            'year':{'label':'Year', 'type':'text'},
            'location':{'label':'Location', 'type':'text'},
//              'flags':{'label':'Options', 'type':'flags', 'flags':this.musicFlags},
            }},
        '_owned':{'label':'', 'type':'paneltabs', 'aside':'yes', 'selected':'owned', 'tabs':{
            'owned':{'label':'Owned', 'fn':'M.ciniki_library_main.edit.toggleOwnedWanted(\'owned\');'},
            'wanted':{'label':'Wanted', 'fn':'M.ciniki_library_main.edit.toggleOwnedWanted(\'wanted\');'},
            }},
        'ratings':{'label':'', 'aside':'yes', 'visible':'yes', 'aside':'yes', 'fields':{
            }},
        'purchased':{'label':'', 'aside':'yes', 'visible':'hidden', 'aside':'yes', 'fields':{
            'purchased_date':{'label':'Purchased Date', 'type':'date'},
            'purchased_price':{'label':'Purchased Price', 'type':'text'},
            'purchased_place':{'label':'Purchased Place', 'type':'text', 'livesearch':'yes', 'livesearchempty':'yes'},
            }},
        '_genres':{'label':'Genres', 'aside':'yes', 'fields':{
            'genres':{'label':'', 'hidelabel':'yes', 'type':'tags', 'tags':[], 'hint':'Enter a new genre:'},
            }},
        '_tags':{'label':'Tags', 'aside':'yes', 'fields':{
            'tags':{'label':'', 'hidelabel':'yes', 'type':'tags', 'tags':[], 'hint':'Enter a new tag:'},
            }},
        '_synopsis':{'label':'Synopsis', 'fields':{
            'synopsis':{'label':'', 'hidelabel':'yes', 'type':'textarea', 'size':'small'},
            }},
        '_description':{'label':'Description', 'fields':{
            'description':{'label':'', 'hidelabel':'yes', 'type':'textarea', 'size':'large'},
            }},
        '_notes':{'label':'Notes', 'fields':{
            'notes':{'label':'', 'hidelabel':'yes', 'type':'textarea', 'size':'small'},
            }},
        '_buttons':{'label':'', 'buttons':{
            'save':{'label':'Save', 'fn':'M.ciniki_library_main.edit.save();'},
            'delete':{'label':'Delete', 'fn':'M.ciniki_library_main.edit.remove();'},
            }},
    };
    this.edit.forms.book = {
        '_image':{'label':'', 'aside':'yes', 'type':'imageform', 'fields':{
            'primary_image_id':{'label':'', 'type':'image_id', 'hidelabel':'yes', 'controls':'all', 'history':'no'},
            }},
        'details':{'label':'', 'aside':'yes', 'fields':{
            'item_format':{'label':'Format', 'type':'toggle', 'default':'11', 'toggles':this.bookFormats},
            'title':{'label':'Title', 'type':'text'},
            'author_display':{'label':'Author', 'type':'text', 'livesearch':'yes', 'livesearchempty':'no'},
            'author_sort':{'label':'Sort Author', 'type':'text', 'livesearch':'yes', 'livesearchempty':'no'},
            'year':{'label':'Year', 'type':'text'},
            'location':{'label':'Location', 'type':'text'},
//              'flags':{'label':'Options', 'type':'flags', 'flags':this.bookFlags},
            }},
        '_owned':{'label':'', 'aside':'yes', 'type':'paneltabs', 'selected':'owned', 'tabs':{
            'owned':{'label':'Owned', 'fn':'M.ciniki_library_main.edit.toggleOwnedWanted(\'owned\');'},
            'wanted':{'label':'Wanted', 'fn':'M.ciniki_library_main.edit.toggleOwnedWanted(\'wanted\');'},
            }},
        'ratings':{'label':'', 'aside':'yes', 'visible':'yes', 'aside':'yes', 'fields':{
            }},
        'purchased':{'label':'', 'active':'no', 'aside':'yes', 'fields':{
            'purchased_date':{'label':'Purchased Date', 'type':'date'},
            'purchased_price':{'label':'Purchased Price', 'type':'text'},
            'purchased_place':{'label':'Purchased Place', 'type':'text', 'livesearch':'yes', 'livesearchempty':'yes'},
            }},
        '_genres':{'label':'Genres', 'aside':'yes', 'fields':{
            'genres':{'label':'', 'hidelabel':'yes', 'type':'tags', 'tags':[], 'hint':'Enter a new genre:'},
            }},
        '_tags':{'label':'Tags', 'aside':'yes', 'fields':{
            'tags':{'label':'', 'hidelabel':'yes', 'type':'tags', 'tags':[], 'hint':'Enter a new tag:'},
            }},
        '_synopsis':{'label':'Synopsis', 'fields':{
            'synopsis':{'label':'', 'hidelabel':'', 'type':'textarea', 'size':'small'},
            }},
        '_description':{'label':'Description', 'fields':{
            'description':{'label':'', 'hidelabel':'', 'type':'textarea', 'size':'large'},
            }},
        '_notes':{'label':'Notes', 'fields':{
            'notes':{'label':'', 'hidelabel':'', 'type':'textarea', 'size':'small'},
            }},
        '_buttons':{'label':'', 'buttons':{
            'save':{'label':'Save', 'fn':'M.ciniki_library_main.edit.save();'},
            'delete':{'label':'Delete', 'fn':'M.ciniki_library_main.edit.remove();'},
            }},
    };
    this.edit.sectionData = function(s) { 
        return this.data[s]; 
    };
    this.edit.fieldValue = function(s, i, d) {
        return this.data[i];
    };
    this.edit.liveSearchCb = function(s, i, value) {
        if( i == 'author_display' || i == 'author_sort' || i == 'purchased_place') {
            var rsp = M.api.getJSONBgCb('ciniki.library.itemSearchField', {'tnid':M.curTenantID, 'field':i, 'start_needle':value, 'limit':15},
                function(rsp) {
                    M.ciniki_library_main.edit.liveSearchShow(s, i, M.gE(M.ciniki_library_main.edit.panelUID + '_' + i), rsp.results);
                });
        }
    };
    this.edit.liveSearchResultValue = function(s, f, i, j, d) {
        if( (f == 'author_display' || f == 'author_sort' || f == 'purchased_place' ) && d.result != null ) { 
            return d.result.name;
        }
        return '';
    };
    this.edit.liveSearchResultRowFn = function(s, f, i, j, d) { 
        if( (f == 'author_display' || f == 'author_sort' ) && d.result != null ) {
            return 'M.ciniki_library_main.edit.updateAuthor(\'' + s + '\',\'' + f + '\',\'' + escape(d.result.author_display) + '\',\'' + escape(d.result.author_sort) + '\');';
        }
        if( f == 'purchased_place' && d.result != null ) {
            return 'M.ciniki_library_main.edit.updateField(\'' + s + '\',\'' + f + '\',\'' + escape(d.result.name) + '\');';
        }
    };
    this.edit.updateAuthor = function(s, fid, author_display, author_sort) {
        M.gE(this.panelUID + '_author_display').value = unescape(author_display);
        M.gE(this.panelUID + '_author_sort').value = unescape(author_sort);
        this.removeLiveSearch(s, fid);
    };
    this.edit.updateField = function(s, fid, result) {
        M.gE(this.panelUID + '_' + fid).value = unescape(result);
        this.removeLiveSearch(s, fid);
    };
    this.edit.fieldHistoryArgs = function(s, i) {
        return {'method':'ciniki.library.itemHistory', 'args':{'tnid':M.curTenantID, 'item_id':this.item_id, 'field':i}};
    };
    this.edit.addDropImage = function(iid) {
        M.ciniki_library_main.edit.setFieldValue('primary_image_id', iid, null, null);
        return true;
    };
    this.edit.deleteImage = function(fid) {
        this.setFieldValue(fid, 0, null, null);
        return true;
    };
    this.edit.open = function(cb, iid, type) {
        if( iid != null ) { this.item_id = iid; }
        if( type != null ) { this.item_type = type; }
        if( this.item_id > 0 ) {
            this.forms.music._buttons.buttons.delete.visible = 'yes';
            this.forms.book._buttons.buttons.delete.visible = 'yes';
            M.api.getJSONCb('ciniki.library.itemGet', {'tnid':M.curTenantID,
                'item_id':this.item_id, 'tags':'yes'}, function(rsp) {
                    if( rsp.stat != 'ok' ) {
                        M.api.err(rsp);
                        return false;
                    }
                    var p = M.ciniki_library_main.edit;
                    p.data = rsp.item;
                    var genres = [];
                    if( rsp.genres != null ) {
                        for(i in rsp.genres) { genres.push(rsp.genres[i].tag.name); }
                    }
                    var tags = [];
                    if( rsp.tags != null ) {
                        for(i in rsp.tags) { tags.push(rsp.tags[i].tag.name); }
                    }
                    p.forms.music._genres.fields.genres.tags = genres;
                    p.forms.book._genres.fields.genres.tags = genres;
                    p.forms.music._tags.fields.tags.tags = tags;
                    p.forms.book._tags.fields.tags.tags = tags;
                    if( (p.data.flags&0x02) == 2 ) {
                        M.ciniki_library_main.edit.toggleOwnedWanted('wanted');
                    } else {
                        M.ciniki_library_main.edit.toggleOwnedWanted('owned');
                    }
                    p.refresh();
                    p.show(cb);
                });
        } else {
            this.reset();
            this.forms.music._buttons.buttons.delete.visible = 'no';
            this.forms.book._buttons.buttons.delete.visible = 'no';
            // Get tags
            M.api.getJSONCb('ciniki.library.itemTags', {'tnid':M.curTenantID, 
                'item_type':this.item_type}, function(rsp) {
                if( rsp.stat != 'ok' ) {
                    M.api.err(rsp);
                    return false;
                }
                var p = M.ciniki_library_main.edit;
                p.data = {'flags':1, 'item_type':M.ciniki_library_main.edit.item_type};
                var genres = [];
                if( rsp.genres != null ) {
                    for(i in rsp.genres) { genres.push(rsp.genres[i].tag.name); }
                }
                var tags = [];
                if( rsp.tags != null ) {
                    for(i in rsp.tags) { tags.push(rsp.tags[i].tag.name); }
                }
                p.forms.music._genres.fields.genres.tags = genres;
                p.forms.book._genres.fields.genres.tags = genres;
                p.forms.music._tags.fields.tags.tags = tags;
                p.forms.book._tags.fields.tags.tags = tags;
                p.cb = cb;
                if( (p.data.flags&0x02) == 2 ) {
                    M.ciniki_library_main.edit.toggleOwnedWanted('wanted');
                } else {
                    M.ciniki_library_main.edit.toggleOwnedWanted('owned');
                }
                p.refresh();
                p.show(cb);
            });
        }
    };
    this.edit.toggleOwnedWanted = function(v, r) {
        if( v == 'owned') {
            this.forms.music._owned.selected = 'owned';
            this.forms.book._owned.selected = 'owned';
            this.forms.music.purchased.visible = 'yes';
            this.forms.book.purchased.visible = 'yes';
            if( this.sections.purchased != null ) {
                this.sections.purchased.visible = 'yes';
            }
            this.forms.music.ratings.label = 'Ratings';
            this.forms.book.ratings.label = 'Ratings';
            for(i in this.forms.music.ratings.fields) {
                this.forms.music.ratings.fields[i].toggles = this.ratingToggles;
                this.forms.book.ratings.fields[i].toggles = this.ratingToggles;
            }
            if( this.sections.ratings != null && this.sections.ratings.label != '' ) {
                this.sections.ratings.label = 'Ratings';
            }
        } else {
            this.forms.music._owned.selected = 'wanted';
            this.forms.book._owned.selected = 'wanted';
            this.forms.music.purchased.visible = 'hidden';
            this.forms.book.purchased.visible = 'hidden';
            if( this.sections.purchased != null ) {
                this.sections.purchased.visible = 'hidden';
            }
            this.forms.music.ratings.label = 'Priority';
            this.forms.book.ratings.label = 'Priority';
            for(i in this.forms.music.ratings.fields) {
                this.forms.music.ratings.fields[i].toggles = this.priorityToggles;
                this.forms.book.ratings.fields[i].toggles = this.priorityToggles;
            }
            if( this.sections.ratings != null && this.sections.ratings.label != '' ) {
                this.sections.ratings.label = 'Priority';
            }
        }
        if( r == null || r == 'yes' ) {
            this.refreshSection('_owned');
            this.refreshSection('ratings');
            this.refreshSection('purchased');
        }
//      this.edit.show();
    };
    this.edit.save = function() {
        var f = 1;
        if( this.sections._owned.selected == 'wanted' ) {
            f = 2;
        }
        if( this.item_id > 0 ) {
            var c = this.serializeForm('no');
            if( f != this.data.flags ) {
                c += '&flags=' + f;
            }
            if( c != '' ) {
                M.api.postJSONCb('ciniki.library.itemUpdate', {'tnid':M.curTenantID,
                    'item_id':this.item_id}, c, function(rsp) {
                        if( rsp.stat != 'ok' ) {
                            M.api.err(rsp);
                            return false;
                        }
                        M.ciniki_library_main.edit.close();
                    });
            } else {
                this.close();
            }
        } else {
            var c = this.serializeForm('yes');
            c += 'flags=' + f + '&';
            M.api.postJSONCb('ciniki.library.itemAdd', {'tnid':M.curTenantID}, c, function(rsp) {
                if( rsp.stat != 'ok' ) {
                    M.api.err(rsp);
                    return false;
                }
                M.ciniki_library_main.edit.close();
            });
        }
    };
    this.edit.remove = function() {
        if( this.item_id <= 0 ) { return false; }
        M.confirm("Are you sure you want to remove this item from the library?",null,function() {
            M.api.getJSONCb('ciniki.library.itemDelete', {'tnid':M.curTenantID, 'item_id':M.ciniki_library_main.edit.item_id}, function(rsp) {
                if( rsp.stat != 'ok' ) {
                    M.api.err(rsp);
                    return false;
                }
                M.ciniki_library_main.edit.close();
            });
        });
    };
    this.edit.addButton('save', 'Save', 'M.ciniki_library_main.edit.save();');
    this.edit.addClose('Cancel');

    //
    // Start the app
    //
    this.start = function(cb, appPrefix, aG) {
        args = {};
        if( aG != null ) { args = eval(aG); }

        //
        // Create container
        //
        var appContainer = M.createContainer(appPrefix, 'ciniki_library_main', 'yes');
        if( appContainer == null ) {
            M.alert('App Error');
            return false;
        }

        //
        // Decide what to display
        //
        this.edit.formtabs.tabs = {};
        this.menu.sections.tabs.tabs = {};
        var default_tab = 0;
        var ct = 0;
        if( M.modFlagOn('ciniki.library', 0x01) ) {
            default_tab = 10;
            ct++;
            this.menu.sections.tabs.tabs['10'] = {'label':'Music', 'fn':'M.ciniki_library_main.menu.switchMenuTab(\'10\');'};
            this.edit.formtabs.tabs['music'] = {'label':'Music', 'field_id':10};
        }
        if( M.modFlagOn('ciniki.library', 0x02) ) {
            if( default_tab == 0 ) { default_tab = 20; }
            ct++;
            this.menu.sections.tabs.tabs['20'] = {'label':'Books', 'fn':'M.ciniki_library_main.menu.switchMenuTab(\'20\');'};
            this.edit.formtabs.tabs['book'] = {'label':'Books', 'field_id':20};
        }
        this.menu.sections.tabs.visible = (ct>1?'yes':'no');
        this.edit.formtabs.selected = default_tab;
        this.edit.formtabs.visible = (ct>1?'yes':'no');

        //
        // Check if Wanted is turned on
        //
        if( M.modFlagOn('ciniki.library', 0x04) ) {
            this.menu.sections.menu.list.wanted.visible = 'yes';
            this.menu.sections.menu.visible = 'yes';
        } else {
            this.menu.sections.menu.list.wanted.visible = 'no';
            this.menu.sections.menu.visible = 'no';
        }

        //
        // Check if wanted is enabled
        //
        if( M.modFlagOn('ciniki.library', 0x08) ) {
            this.edit.forms.music._owned.visible = 'yes';
            this.edit.forms.book._owned.visible = 'yes';
        } else {
            this.edit.forms.music._owned.visible = 'no';
            this.edit.forms.book._owned.visible = 'no';
        }

        //
        // Check if ratings/priorities are enabled
        //
        if( M.modFlagOn('ciniki.library', 0x08) ) {
            //
            // Setup the employee ratings
            //
            var fields = {};
            if( M.curTenant.employees != null) {
                var ct = 0;
                var uid = 0;
                for(i in M.curTenant.employees) {
                    fields['user-' + i + '-rating'] = {'label':M.curTenant.employees[i], 'type':'toggle', 'none':'yes', 'toggles':this.ratingToggles};
                    uid = i;
                    ct++;
                }
                if( ct == 1 ) {
                    this.edit.forms.music.ratings.label = '';
                    fields['user-' + uid + '-rating'].label = 'Your Rating';
                } else {
                    this.edit.forms.music.ratings.label = 'Ratings';
                }
            }
            this.edit.forms.music.ratings.fields = fields;
            this.edit.forms.book.ratings.fields = fields;
        } else {
            this.edit.forms.music.ratings.fields = {};
            this.edit.forms.book.ratings.fields = 'no';
            this.edit.forms.music.ratings.active = 'no';
            this.edit.forms.book.ratings.active = 'no';
        }
        this.menu.open(cb, default_tab);
    }

    this.updateRating = function(e, item_id, field, rating) {
        var args = {'tnid':M.curTenantID, 'item_id':item_id};
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
            e.target.parentNode.innerHTML = v;
        });
    };
}
