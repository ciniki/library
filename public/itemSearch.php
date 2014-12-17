<?php
//
// Description
// -----------
//
// Returns
// -------
//
function ciniki_library_itemSearch($ciniki) {
    //  
    // Find all the required and optional arguments
    //  
    ciniki_core_loadMethod($ciniki, 'ciniki', 'core', 'private', 'prepareArgs');
    $rc = ciniki_core_prepareArgs($ciniki, 'no', array(
        'business_id'=>array('required'=>'yes', 'blank'=>'no', 'name'=>'Business'), 
        'start_needle'=>array('required'=>'yes', 'blank'=>'yes', 'name'=>'Search String'), 
        'flags'=>array('required'=>'no', 'blank'=>'no', 'name'=>'Options'), 
        'limit'=>array('required'=>'yes', 'blank'=>'no', 'name'=>'Limit'), 
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
    $rc = ciniki_library_checkAccess($ciniki, $args['business_id'], 'ciniki.library.itemSearch'); 
    if( $rc['stat'] != 'ok' ) { 
        return $rc;
    }   

	//
	// Get the number of faqs in each status for the business, 
	// if no rows found, then return empty array
	//
	if( ($ciniki['business']['modules']['ciniki.library']['flags']&0x08) > 0 ) {
		//
		// Ratings included
		//
		$strsql = "SELECT ciniki_library_items.id, "
			. "item_type, "
			. "item_format, "
			. "title, "
			. "author_display, "
			. "author_sort, "
			. "IF(flags&0x01>0, 'yes', 'no') AS owned, "
			. "IF(flags&0x02>0, 'yes', 'no') AS wanted, "
			. "IFNULL(ciniki_library_reviews.user_id, 0) AS user_id, "
			. "IFNULL(ciniki_library_reviews.rating, 0) AS rating "
			. "FROM ciniki_library_items "
			. "LEFT JOIN ciniki_library_reviews ON ("
				. "ciniki_library_items.id = ciniki_library_reviews.item_id "
				. "AND ciniki_library_reviews.business_id = '" . ciniki_core_dbQuote($ciniki, $args['business_id']) . "' "
				. ") "
			. "WHERE ciniki_library_items.business_id = '" . ciniki_core_dbQuote($ciniki, $args['business_id']) . "' "
			. "AND (title LIKE '" . ciniki_core_dbQuote($ciniki, $args['start_needle']) . "%' "
				. "OR title LIKE '% " . ciniki_core_dbQuote($ciniki, $args['start_needle']) . "%' "
				. "OR author_display LIKE '" . ciniki_core_dbQuote($ciniki, $args['start_needle']) . "%' "
				. "OR author_display LIKE '% " . ciniki_core_dbQuote($ciniki, $args['start_needle']) . "%' "
				. ") "
			. "";
		if( isset($args['flags']) && $args['flags'] == 2 ) {
			$strsql .= "AND (ciniki_library_items.flags&0x02) = 2 ";
		}
		$strsql .= "ORDER BY author_sort, title COLLATE latin1_general_cs, ciniki_library_items.id "
			. "";
		if( isset($args['limit']) && $args['limit'] != '' && $args['limit'] > 0 ) {
			$strsql .= "LIMIT " . ciniki_core_dbQuote($ciniki, $args['limit']) . " ";
		} else {
			$strsql .= "LIMIT 25 ";
		}
		ciniki_core_loadMethod($ciniki, 'ciniki', 'core', 'private', 'dbHashQueryTree');
		$rc = ciniki_core_dbHashQueryTree($ciniki, $strsql, 'ciniki.library', array(
			array('container'=>'items', 'fname'=>'title', 'name'=>'item', 
				'fields'=>array('id', 'item_type', 'item_format', 'title', 'author_display', 'author_sort', 
					'owned', 'wanted')),
			array('container'=>'ratings', 'fname'=>'user_id', 'name'=>'rating', 
				'fields'=>array('user_id', 'rating')),
			));
	} else {
		$strsql = "SELECT id, "
			. "item_type, "
			. "item_format, "
			. "title, "
			. "author_display, "
			. "author_sort, "
			. "IF(flags&0x01>0, 'yes', 'no') AS owned, "
			. "IF(flags&0x02>0, 'yes', 'no') AS wanted "
			. "FROM ciniki_library_items "
			. "WHERE ciniki_library_items.business_id = '" . ciniki_core_dbQuote($ciniki, $args['business_id']) . "' "
			. "AND (title LIKE '" . ciniki_core_dbQuote($ciniki, $args['start_needle']) . "%' "
				. "OR title LIKE '% " . ciniki_core_dbQuote($ciniki, $args['start_needle']) . "%' "
				. "OR author_display LIKE '" . ciniki_core_dbQuote($ciniki, $args['start_needle']) . "%' "
				. "OR author_display LIKE '% " . ciniki_core_dbQuote($ciniki, $args['start_needle']) . "%' "
				. ") "
			. "";
		if( isset($args['flags']) && $args['flags'] == 2 ) {
			$strsql .= "AND (ciniki_library_items.flags&0x02) = 2 ";
		}
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
				'fields'=>array('id', 'item_type', 'item_format', 'title', 'author_display', 'author_sort', 
					'owned', 'wanted')),
			));
	}
	if( $rc['stat'] != 'ok' ) {
		return $rc;
	}
	if( !isset($rc['items']) || !is_array($rc['items']) ) {
		return array('stat'=>'ok', 'items'=>array());
	}

	return array('stat'=>'ok', 'items'=>$rc['items']);
}
?>
