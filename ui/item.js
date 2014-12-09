//
// This panel will create or edit an invoice
//
function ciniki_library_item() {
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
	this.init = function() {
		//
		// The edit panel
		//
		this.edit = new M.panel('Item',
			'ciniki_library_item', 'edit',
			'mc', 'medium mediumaside', 'sectioned', 'ciniki.library.item.edit');
		this.edit.item_id = 0;
		this.edit.data = {};
		this.edit.formtabs = {'label':'', 'field':'item_type', 'tabs':{
			'music':{'label':'Music', 'field_id':10},
			'book':{'label':'Book', 'field_id':20},
			}};
		this.edit.forms = {};
		this.edit.forms.music = {
			'_image':{'label':'', 'aside':'yes', 'fields':{
				'primary_image_id':{'label':'', 'type':'image_id', 'hidelabel':'yes', 'controls':'all', 'history':'no'},
				}},
			'details':{'label':'', 'aside':'yes', 'fields':{
				'item_format':{'label':'Format', 'type':'toggle', 'toggles':this.musicFormats},
				'title':{'label':'Title', 'type':'text'},
				'author_display':{'label':'Artist/Band', 'type':'text'},
				'author_sort':{'label':'Sort Artist', 'type':'text'},
				'year':{'label':'Year', 'type':'text'},
				'location':{'label':'Location', 'type':'text'},
				'flags':{'label':'Options', 'type':'flags', 'flags':this.musicFlags},
				'purchased_date':{'label':'Purchased Date', 'type':'date'},
				'purchased_price':{'label':'Purchased Price', 'type':'text'},
				'purchased_place':{'label':'Purchased Place', 'type':'text'},
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
				'save':{'label':'Save', 'fn':'M.ciniki_library_item.saveItem();'},
				'delete':{'label':'Delete', 'fn':'M.ciniki_library_item.deleteItem();'},
				}},
		};
		this.edit.forms.book = {
			'_image':{'label':'', 'aside':'yes', 'fields':{
				'primary_image_id':{'label':'', 'type':'image_id', 'hidelabel':'yes', 'controls':'all', 'history':'no'},
				}},
			'details':{'label':'', 'aside':'yes', 'fields':{
				'item_format':{'label':'Format', 'type':'toggle', 'toggles':this.bookFormats},
				'title':{'label':'Title', 'type':'text'},
				'author_display':{'label':'Author', 'type':'text'},
				'author_sort':{'label':'Sort Author', 'type':'text'},
				'year':{'label':'Year', 'type':'text'},
				'location':{'label':'Location', 'type':'text'},
				'flags':{'label':'Options', 'type':'flags', 'flags':this.bookFlags},
				'purchased_date':{'label':'Purchased Date', 'type':'date'},
				'purchased_price':{'label':'Purchased Price', 'type':'text'},
				'purchased_place':{'label':'Purchased Place', 'type':'text'},
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
				'save':{'label':'Save', 'fn':'M.ciniki_library_item.saveItem();'},
				'delete':{'label':'Delete', 'fn':'M.ciniki_library_item.deleteItem();'},
				}},
		};
		this.edit.sectionData = function(s) { 
			return this.data[s]; 
		};
		this.edit.fieldValue = function(s, i, d) {
			return this.data[i];
		};
		this.edit.fieldHistoryArgs = function(s, i) {
			return {'method':'ciniki.library.history', 'args':{'business_id':M.curBusinessID,
				'object':'ciniki.library.item', 'object_id':this.item_id, 'field':i}};
		};
		this.edit.addDropImage = function(iid) {
			M.ciniki_library_item.edit.setFieldValue('primary_image_id', iid, null, null);
			return true;
		};
		this.edit.deleteImage = function(fid) {
			this.setFieldValue(fid, 0, null, null);
			return true;
		};
		this.edit.addButton('save', 'Save', 'M.ciniki_library_item.saveShipment();');
		this.edit.addClose('Cancel');
	}; 

	this.start = function(cb, aP, aG) {
		args = {};
		if( aG != null ) { args = eval(aG); }
		var aC = M.createContainer(aP, 'ciniki_library_item', 'yes');
		if( aC == null ) {
			alert('App Error');
			return false;
		}

		if( args.add != null ) {
			this.editItem(cb, 0, args.add);
		} else {
			this.editItem(cb, args.item_id);
		}
	};

	this.editItem = function(cb, iid, type) {
		if( iid != null ) { this.edit.item_id = iid; }
		if( this.edit.item_id > 0 ) {
			this.edit.forms.music._buttons.buttons.delete.visible = 'yes';
			this.edit.forms.book._buttons.buttons.delete.visible = 'yes';
			M.api.getJSONCb('ciniki.library.itemGet', {'business_id':M.curBusinessID,
				'item_id':this.edit.item_id, 'tags':'yes'}, function(rsp) {
					if( rsp.stat != 'ok' ) {
						M.api.err(rsp);
						return false;
					}
					var p = M.ciniki_library_item.edit;
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
					p.refresh();
					p.show(cb);
				});
		} else {
			this.edit.forms.music._buttons.buttons.delete.visible = 'no';
			this.edit.forms.book._buttons.buttons.delete.visible = 'no';
			// Get tags
			M.api.getJSONCb('ciniki.library.itemTags', {'business_id':M.curBusinessID}, function(rsp) {
				if( rsp.stat != 'ok' ) {
					M.api.err(rsp);
					return false;
				}
				var p = M.ciniki_library_item.edit;
				p.data = {'item_type':type};
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
				p.refresh();
				p.show(cb);
			});
		}
	};

	this.saveItem = function() {
		if( this.edit.item_id > 0 ) {
			var c = this.edit.serializeForm('no');
			if( c != '' ) {
				M.api.postJSONCb('ciniki.library.itemUpdate', {'business_id':M.curBusinessID,
					'item_id':this.edit.item_id}, c, function(rsp) {
						if( rsp.stat != 'ok' ) {
							M.api.err(rsp);
							return false;
						}
						M.ciniki_library_item.edit.close();
					});
			} else {
				this.edit.close();
			}
		} else {
			var c = this.edit.serializeForm('yes');
			M.api.postJSONCb('ciniki.library.itemAdd', {'business_id':M.curBusinessID}, c, function(rsp) {
				if( rsp.stat != 'ok' ) {
					M.api.err(rsp);
					return false;
				}
				M.ciniki_library_item.edit.close();
			});
		}
	};

	this.deleteItem = function(iid) {
		if( iid <= 0 ) { return false; }
		if( confirm("Are you sure you want to remove this item from the library?") ) {
			M.api.getJSONCb('ciniki.library.shipmentItemDelete', {'business_id':M.curBusinessID,
				'item_id':iid}, function(rsp) {
					if( rsp.stat != 'ok' ) {
						M.api.err(rsp);
						return false;
					}
					M.ciniki_library_item.edit.close();
				});
		}
	};
}
