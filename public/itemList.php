<?php
//
// Description
// -----------
//
// Returns
// -------
//
function ciniki_library_itemList($ciniki) {
    //  
    // Find all the required and optional arguments
    //  
    ciniki_core_loadMethod($ciniki, 'ciniki', 'core', 'private', 'prepareArgs');
    $rc = ciniki_core_prepareArgs($ciniki, 'no', array(
        'business_id'=>array('required'=>'yes', 'blank'=>'no', 'name'=>'Business'), 
        'item_type'=>array('required'=>'yes', 'blank'=>'yes', 'name'=>'Item Type'), 
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
    $rc = ciniki_library_checkAccess($ciniki, $args['business_id'], 'ciniki.library.itemList'); 
    if( $rc['stat'] != 'ok' ) { 
        return $rc;
    }   

	//
	// Get the number of faqs in each status for the business, 
	// if no rows found, then return empty array
	//
	$strsql = "SELECT id, "
		. "item_type, "
		. "item_format, "
		. "title, "
		. "author_display, "
		. "author_sort "
		. "FROM ciniki_library_items "
		. "WHERE ciniki_library_items.business_id = '" . ciniki_core_dbQuote($ciniki, $args['business_id']) . "' "
		. "AND item_type = '" . ciniki_core_dbQuote($ciniki, $args['item_type']) . "' "
		. "";
	$strsql .= "ORDER BY author_sort, title COLLATE latin1_general_cs "
		. "";
	if( isset($args['limit']) && $args['limit'] != '' && $args['limit'] > 0 ) {
		$strsql .= "LIMIT " . ciniki_core_dbQuote($ciniki, $args['limit']) . " ";
	} else {
		$strsql .= "LIMIT 25 ";
	}
	ciniki_core_loadMethod($ciniki, 'ciniki', 'core', 'private', 'dbHashQueryTree');
	$rc = ciniki_core_dbHashQueryTree($ciniki, $strsql, 'ciniki.library', array(
		array('container'=>'items', 'fname'=>'title', 'name'=>'item', 
			'fields'=>array('id', 'item_type', 'item_format', 'title', 'author_display', 'author_sort')),
		));
	if( $rc['stat'] != 'ok' ) {
		return $rc;
	}
	if( !isset($rc['items']) || !is_array($rc['items']) ) {
		return array('stat'=>'ok', 'items'=>array());
	}
	return array('stat'=>'ok', 'items'=>$rc['items']);
}
?>
