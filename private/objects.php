<?php
//
// Description
// -----------
//
// Arguments
// ---------
//
// Returns
// -------
//
function ciniki_library_objects($ciniki) {
	
	$objects = array();
	$objects['item'] = array(
		'name'=>'Items',
		'sync'=>'yes',
		'table'=>'ciniki_library_items',
		'fields'=>array(
			'item_type'=>array(),
			'item_format'=>array(),
			'title'=>array(),
			'permalink'=>array(),
			'author_display'=>array(),
			'author_sort'=>array(),
			'flags'=>array(),
			'isbn'=>array(),
			'location'=>array(),
			'synopsis'=>array(),
			'description'=>array(),
			'primary_image_id'=>array('ref'=>'ciniki.images.image'),
			'primary_image_caption'=>array(),
			'notes'=>array(),
			'purchased_date'=>array(),
			'purchased_price'=>array(),
			),
		'history_table'=>'ciniki_event_history',
		);
	$objects['tag'] = array(
		'name'=>'Tag',
		'sync'=>'yes',
		'table'=>'ciniki_library_tags',
			'fields'=>array(
			'item_id'=>array('ref'=>'ciniki.library.item'),
			'tag_type'=>array(),
			'tag_name'=>array(),
			'permalink'=>array(),
			),
		'history_table'=>'ciniki_library_history',
		);
	
	return array('stat'=>'ok', 'objects'=>$objects);
}
?>
