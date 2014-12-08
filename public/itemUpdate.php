<?php
//
// Description
// ===========
// This method updates one or more elements of an existing item.
//
// Arguments
// ---------
// api_key:
// auth_token:
// business_id:		The ID of the business to the item is a part of.
// item_id:			The ID of the item to update.
//
// Returns
// -------
// <rsp stat='ok' />
//
function ciniki_library_itemUpdate(&$ciniki) {
    //  
    // Find all the required and optional arguments
    //  
    ciniki_core_loadMethod($ciniki, 'ciniki', 'core', 'private', 'prepareArgs');
    $rc = ciniki_core_prepareArgs($ciniki, 'no', array(
        'business_id'=>array('required'=>'yes', 'blank'=>'no', 'name'=>'Business'), 
        'item_id'=>array('required'=>'yes', 'blank'=>'no', 'name'=>'Item'), 
        'item_type'=>array('required'=>'no', 'blank'=>'no', 'name'=>'Item Type'), 
		'item_format'=>array('required'=>'no', 'blank'=>'no', 'name'=>'Format'),
        'title'=>array('required'=>'no', 'blank'=>'no', 'name'=>'Title'), 
        'permalink'=>array('required'=>'no', 'blank'=>'yes', 'name'=>'Permalink'), 
        'author_display'=>array('required'=>'no', 'blank'=>'yes', 'name'=>'Author Display'), 
        'author_sort'=>array('required'=>'no', 'blank'=>'yes', 'name'=>'Author Sort'), 
        'flags'=>array('required'=>'no', 'blank'=>'yes', 'name'=>'Options'), 
        'isbn'=>array('required'=>'no', 'blank'=>'yes', 'name'=>'ISBN'), 
        'year'=>array('required'=>'no', 'blank'=>'yes', 'name'=>'Year'), 
        'location'=>array('required'=>'no', 'blank'=>'yes', 'name'=>'Location'), 
        'synopsis'=>array('required'=>'no', 'blank'=>'yes', 'name'=>'Synopsis'), 
        'description'=>array('required'=>'no', 'blank'=>'yes', 'name'=>'Description'), 
        'primary_image_id'=>array('required'=>'no', 'blank'=>'yes', 'name'=>'Image'), 
        'primary_image_caption'=>array('required'=>'no', 'blank'=>'yes', 'name'=>'Image Caption'), 
        'notes'=>array('required'=>'no', 'blank'=>'yes', 'name'=>'Notes'), 
        'purchased_date'=>array('required'=>'no', 'blank'=>'yes', 'name'=>'Purchased Date'), 
        'purchased_price'=>array('required'=>'no', 'blank'=>'yes', 'name'=>'Purchased Price'), 
		'genres'=>array('required'=>'no', 'blank'=>'yes', 'type'=>'list', 'delimiter'=>'::', 'name'=>'Genres'),
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
    $rc = ciniki_library_checkAccess($ciniki, $args['business_id'], 'ciniki.library.itemUpdate'); 
    if( $rc['stat'] != 'ok' ) { 
        return $rc;
    }   

	if( isset($args['title']) ) {
		$args['permalink'] = preg_replace('/ /', '-', preg_replace('/[^a-z0-9 ]/', '', strtolower($args['title'])));
		//
		// Make sure the permalink is unique
		//
		$strsql = "SELECT id, title, permalink FROM ciniki_library "
			. "WHERE business_id = '" . ciniki_core_dbQuote($ciniki, $args['business_id']) . "' "
			. "AND permalink = '" . ciniki_core_dbQuote($ciniki, $args['permalink']) . "' "
			. "AND item_type = '" . ciniki_core_dbQuote($ciniki, $args['item_type']) . "' "
			. "AND id <> '" . ciniki_core_dbQuote($ciniki, $args['item_id']) . "' "
			. "";
		$rc = ciniki_core_dbHashQuery($ciniki, $strsql, 'ciniki.library', 'item');
		if( $rc['stat'] != 'ok' ) {
			return $rc;
		}
		if( $rc['num_rows'] > 0 ) {
			return array('stat'=>'fail', 'err'=>array('pkg'=>'ciniki', 'code'=>'2095', 'msg'=>'You already have a item with this name, please choose another name'));
		}
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
	// Update the item
	//
	ciniki_core_loadMethod($ciniki, 'ciniki', 'core', 'private', 'objectUpdate');
	$rc = ciniki_core_objectUpdate($ciniki, $args['business_id'], 'ciniki.library.item', 
		$args['item_id'], $args);
	if( $rc['stat'] != 'ok' ) {
		return $rc;
	}

	//
	// Update the tags
	//
	if( isset($args['tags']) ) {
		ciniki_core_loadMethod($ciniki, 'ciniki', 'core', 'private', 'tagsUpdate');
		$rc = ciniki_core_tagsUpdate($ciniki, 'ciniki.library', 'tag', $args['business_id'],
			'ciniki_library_tags', 'ciniki_library_history',
			'item_id', $args['item_id'], 20, $args['tags']);
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

	return array('stat'=>'ok');
}
?>
