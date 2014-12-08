<?php
//
// Description
// ===========
// This method will return all information for an item.
//
// Arguments
// ---------
// api_key:
// auth_token:
// business_id: 		The ID of the business to get the item from.
// item_id:			The ID of the item to get.
// 
// Returns
// -------
//
function ciniki_library_itemGet($ciniki) {
    //  
    // Find all the required and optional arguments
    //  
    ciniki_core_loadMethod($ciniki, 'ciniki', 'core', 'private', 'prepareArgs');
    $rc = ciniki_core_prepareArgs($ciniki, 'no', array(
        'business_id'=>array('required'=>'yes', 'blank'=>'no', 'name'=>'Business'), 
        'item_id'=>array('required'=>'yes', 'blank'=>'no', 'name'=>'Item'), 
		'images'=>array('required'=>'no', 'blank'=>'yes', 'name'=>'Images'),
		'genres'=>array('required'=>'no', 'blank'=>'yes', 'name'=>'Genres'),
        )); 
    if( $rc['stat'] != 'ok' ) { 
        return $rc;
    }   
    $args = $rc['args'];
    
    //  
    // Make sure this module is activated, and
    // check permission to run this function for this business
    //  
    ciniki_core_loadMethod($ciniki, 'ciniki', 'library', 'private', 'checkAccess');
    $rc = ciniki_library_checkAccess($ciniki, $args['business_id'], 'ciniki.library.itemGet'); 
    if( $rc['stat'] != 'ok' ) { 
        return $rc;
    }   

	ciniki_core_loadMethod($ciniki, 'ciniki', 'users', 'private', 'timezoneOffset');
	$utc_offset = ciniki_users_timezoneOffset($ciniki);

	ciniki_core_loadMethod($ciniki, 'ciniki', 'core', 'private', 'dbQuote');
	ciniki_core_loadMethod($ciniki, 'ciniki', 'users', 'private', 'datetimeFormat');
	$datetime_format = ciniki_users_datetimeFormat($ciniki);
	ciniki_core_loadMethod($ciniki, 'ciniki', 'users', 'private', 'dateFormat');
	$date_format = ciniki_users_dateFormat($ciniki);

	$strsql = "SELECT ciniki_library_items.id, "
		. "ciniki_library_items.item_type, "
		. "ciniki_library_items.item_format, "
		. "ciniki_library_items.title, "
		. "ciniki_library_items.permalink, "
		. "ciniki_library_items.author_display, "
		. "ciniki_library_items.author_sort, "
		. "ciniki_library_items.flags, "
		. "ciniki_library_items.isbn, "
		. "ciniki_library_items.year, "
		. "ciniki_library_items.location, "
		. "ciniki_library_items.synopsis, "
		. "ciniki_library_items.description, "
		. "ciniki_library_items.primary_image_id, "
		. "ciniki_library_items.primary_image_caption, "
		. "ciniki_library_items.notes, "
		. "DATE_FORMAT(ciniki_library_items.purchased_date, '" . ciniki_core_dbQuote($ciniki, $date_format) . "') AS purchased_date, "
		. "ciniki_library_items.purchased_price, "
		. "ciniki_library_items.purchased_place "
		. "FROM ciniki_library_items "
		. "WHERE ciniki_library_items.business_id = '" . ciniki_core_dbQuote($ciniki, $args['business_id']) . "' "
		. "AND ciniki_library_items.id = '" . ciniki_core_dbQuote($ciniki, $args['item_id']) . "' "
		. "";

	ciniki_core_loadMethod($ciniki, 'ciniki', 'core', 'private', 'dbHashQueryTree');
	$rc = ciniki_core_dbHashQueryTree($ciniki, $strsql, 'ciniki.library', array(
		array('container'=>'items', 'fname'=>'id', 'name'=>'item',
			'fields'=>array('id', 'item_type', 'item_format', 'title', 'permalink', 
				'author_display', 'author_sort', 'flags', 'isbn', 'year', 'location', 
				'synopsis', 'description', 'primary_image_id', 'primary_image_caption',
				'notes', 'purchased_date', 'purchased_price', 'purchased_place'),
			),
		));
	if( $rc['stat'] != 'ok' ) {
		return $rc;
	}
	if( !isset($rc['items']) ) {
		return array('stat'=>'ok', 'err'=>array('pkg'=>'ciniki', 'code'=>'2097', 'msg'=>'Unable to find item'));
	}
	$item = $rc['items'][0]['item'];

	//
	// Get the categories and tags for the post
	//
	$strsql = "SELECT tag_type, tag_name AS lists "
		. "FROM ciniki_library_tags "
		. "WHERE item_id = '" . ciniki_core_dbQuote($ciniki, $args['item_id']) . "' "
		. "AND business_id = '" . ciniki_core_dbQuote($ciniki, $args['business_id']) . "' "
		. "AND tag_type = 20 "
		. "ORDER BY tag_type, tag_name "
		. "";
	$rc = ciniki_core_dbHashQueryTree($ciniki, $strsql, 'ciniki.library', array(
		array('container'=>'tags', 'fname'=>'tag_type', 'name'=>'tags',
			'fields'=>array('tag_type', 'lists'), 'dlists'=>array('lists'=>'::')),
		));
	if( $rc['stat'] != 'ok' ) {
		return $rc;
	}
	if( isset($rc['tags']) ) {
		foreach($rc['tags'] as $tags) {
			if( $tags['tags']['tag_type'] == 20 ) {
				$item['genres'] = $tags['tags']['lists'];
			}
		}
	}

	//
	// Check if all tags should be returned
	//
	$genres = array();
	if( isset($args['genres']) && $args['genres'] == 'yes' ) {
		//
		// Get the available genres
		//
		ciniki_core_loadMethod($ciniki, 'ciniki', 'core', 'private', 'tagsList');
		$rc = ciniki_core_tagsList($ciniki, 'ciniki.library', $args['business_id'], 
			'ciniki_library_tags', 20);
		if( $rc['stat'] != 'ok' ) {
			return array('stat'=>'fail', 'err'=>array('pkg'=>'ciniki', 'code'=>'2098', 'msg'=>'Unable to get list of genres', 'err'=>$rc['err']));
		}
		if( isset($rc['tags']) ) {
			$genres = $rc['tags'];
		}
	}

	return array('stat'=>'ok', 'item'=>$item, 'genres'=>$genres);
}
?>
