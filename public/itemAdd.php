<?php
//
// Description
// ===========
// This method will add a new item to the database.
//
// Arguments
// ---------
// api_key:
// auth_token:
// business_id:		The ID of the business to add the item to.  The user must
//					an owner of the business.
//
// 
// Returns
// -------
// <rsp stat='ok' id='34' />
//
function ciniki_library_itemAdd(&$ciniki) {
    //  
    // Find all the required and optional arguments
    //  
    ciniki_core_loadMethod($ciniki, 'ciniki', 'core', 'private', 'prepareArgs');
    $rc = ciniki_core_prepareArgs($ciniki, 'no', array(
        'business_id'=>array('required'=>'yes', 'blank'=>'no', 'name'=>'Business'), 
        'item_type'=>array('required'=>'yes', 'blank'=>'no', 'name'=>'Item Type'), 
		'item_format'=>array('required'=>'yes', 'blank'=>'no', 'name'=>'Format'),
        'title'=>array('required'=>'yes', 'blank'=>'no', 'name'=>'Title'), 
        'permalink'=>array('required'=>'no', 'blank'=>'yes', 'name'=>'Permalink'), 
        'author_display'=>array('required'=>'no', 'blank'=>'yes', 'default'=>'', 'name'=>'Author Display'), 
        'author_sort'=>array('required'=>'no', 'blank'=>'yes', 'default'=>'', 'name'=>'Author Sort'), 
        'flags'=>array('required'=>'no', 'blank'=>'yes', 'default'=>'0', 'name'=>'Options'), 
        'isbn'=>array('required'=>'no', 'blank'=>'yes', 'default'=>'', 'name'=>'ISBN'), 
        'year'=>array('required'=>'no', 'blank'=>'yes', 'default'=>'', 'name'=>'year'), 
        'location'=>array('required'=>'no', 'blank'=>'yes', 'default'=>'', 'name'=>'Location'), 
        'synopsis'=>array('required'=>'no', 'blank'=>'yes', 'default'=>'', 'name'=>'Synopsis'), 
        'description'=>array('required'=>'no', 'blank'=>'yes', 'default'=>'', 'name'=>'Description'), 
        'primary_image_id'=>array('required'=>'no', 'blank'=>'yes', 'default'=>'0', 'name'=>'Image'), 
        'primary_image_caption'=>array('required'=>'no', 'blank'=>'yes', 'default'=>'', 'name'=>'Image Caption'), 
        'notes'=>array('required'=>'no', 'blank'=>'yes', 'default'=>'', 'name'=>'Notes'), 
        'purchased_date'=>array('required'=>'no', 'blank'=>'yes', 'default'=>'', 'type'=>'date', 'name'=>'Purchased Date'), 
        'purchased_price'=>array('required'=>'no', 'blank'=>'yes', 'default'=>'0', 'type'=>'currency', 'name'=>'Purchased Price'), 
        'purchased_place'=>array('required'=>'no', 'blank'=>'yes', 'default'=>'', 'name'=>'Purchased Place'), 
		'genres'=>array('required'=>'no', 'blank'=>'yes', 'type'=>'list', 'delimiter'=>'::', 'name'=>'Genres'),
		'tags'=>array('required'=>'no', 'blank'=>'yes', 'type'=>'list', 'delimiter'=>'::', 'name'=>'Tags'),
        )); 
    if( $rc['stat'] != 'ok' ) { 
        return $rc;
    }   
    $args = $rc['args'];

	ciniki_core_loadMethod($ciniki, 'ciniki', 'core', 'private', 'makePermalink');
	if( isset($args['author_display']) && $args['author_display'] != '' ) {
		$args['permalink'] = ciniki_core_makePermalink($ciniki, $args['author_display'] . '-' . $args['title']);
	}
    
    //  
    // Make sure this module is activated, and
    // check permission to run this function for this business
    //  
    ciniki_core_loadMethod($ciniki, 'ciniki', 'library', 'private', 'checkAccess');
    $rc = ciniki_library_checkAccess($ciniki, $args['business_id'], 'ciniki.library.itemAdd'); 
    if( $rc['stat'] != 'ok' ) { 
        return $rc;
    }   

	//
	// Check the permalink doesn't already exist, for the item type
	//
	$strsql = "SELECT id, title, permalink FROM ciniki_library_items "
		. "WHERE business_id = '" . ciniki_core_dbQuote($ciniki, $args['business_id']) . "' "
		. "AND item_type = '" . ciniki_core_dbQuote($ciniki, $args['item_type']) . "' "
		. "AND permalink = '" . ciniki_core_dbQuote($ciniki, $args['permalink']) . "' "
		. "";
	$rc = ciniki_core_dbHashQuery($ciniki, $strsql, 'ciniki.library', 'item');
	if( $rc['stat'] != 'ok' ) {
		return $rc;
	}
	if( $rc['num_rows'] > 0 ) {
		return array('stat'=>'fail', 'err'=>array('pkg'=>'ciniki', 'code'=>'2096', 'msg'=>'You already have a item with this title, please choose another title.'));
	}

	//  
	// Turn off autocommit
	//  
	ciniki_core_loadMethod($ciniki, 'ciniki', 'core', 'private', 'dbTransactionStart');
	ciniki_core_loadMethod($ciniki, 'ciniki', 'core', 'private', 'dbTransactionRollback');
	ciniki_core_loadMethod($ciniki, 'ciniki', 'core', 'private', 'dbTransactionCommit');
	ciniki_core_loadMethod($ciniki, 'ciniki', 'core', 'private', 'dbQuote');
	$rc = ciniki_core_dbTransactionStart($ciniki, 'ciniki.library');
	if( $rc['stat'] != 'ok' ) { 
		return $rc;
	}   

	//
	// Add the item
	//
	ciniki_core_loadMethod($ciniki, 'ciniki', 'core', 'private', 'objectAdd');
	$rc = ciniki_core_objectAdd($ciniki, $args['business_id'], 'ciniki.library.item', $args);
	if( $rc['stat'] != 'ok' ) {	
		return $rc;
	}
	$item_id = $rc['id'];

	//
	// Update the genres
	//
	if( isset($args['genres']) ) {
		ciniki_core_loadMethod($ciniki, 'ciniki', 'core', 'private', 'tagsUpdate');
		$rc = ciniki_core_tagsUpdate($ciniki, 'ciniki.library', 'tag', $args['business_id'],
			'ciniki_library_tags', 'ciniki_library_history',
			'item_id', $item_id, 20, $args['genres']);
		if( $rc['stat'] != 'ok' ) {
			ciniki_core_dbTransactionRollback($ciniki, 'ciniki.library');
			return $rc;
		}
	}

	//
	// Update the tags
	//
	if( isset($args['tags']) ) {
		ciniki_core_loadMethod($ciniki, 'ciniki', 'core', 'private', 'tagsUpdate');
		$rc = ciniki_core_tagsUpdate($ciniki, 'ciniki.library', 'tag', $args['business_id'],
			'ciniki_library_tags', 'ciniki_library_history',
			'item_id', $item_id, 40, $args['tags']);
		if( $rc['stat'] != 'ok' ) {
			ciniki_core_dbTransactionRollback($ciniki, 'ciniki.library');
			return $rc;
		}
	}
	
	//
	// Update the reviews/ratings
	//
	if( ($ciniki['business']['modules']['ciniki.library']['flags']&0x08) > 0 ) {
		ciniki_core_loadMethod($ciniki, 'ciniki', 'library', 'private', 'itemUpdateReviews');
		$rc = ciniki_library_itemUpdateReviews($ciniki, $args['business_id'], $item_id);
		if( $rc['stat'] != 'ok' ) {
			ciniki_core_dbTransactionRollback($ciniki, 'ciniki.library');
			return $rc;
		}
	}

	//
	// Commit the database changes
	//
    $rc = ciniki_core_dbTransactionCommit($ciniki, 'ciniki.library');
	if( $rc['stat'] != 'ok' ) {
		return $rc;
	}

	//
	// Update the last_change date in the business modules
	// Ignore the result, as we don't want to stop user updates if this fails.
	//
	ciniki_core_loadMethod($ciniki, 'ciniki', 'businesses', 'private', 'updateModuleChangeDate');
	ciniki_businesses_updateModuleChangeDate($ciniki, $args['business_id'], 'ciniki', 'library');

	return array('stat'=>'ok', 'id'=>$item_id);
}
?>
