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
        'tag_type'=>array('required'=>'no', 'blank'=>'yes', 'name'=>'Tag Type'), 
        'tag_permalink'=>array('required'=>'no', 'blank'=>'yes', 'name'=>'Tag Permalink'), 
        'flags'=>array('required'=>'no', 'blank'=>'yes', 'name'=>'Flags'), 
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
	$strsql = "SELECT ciniki_library_items.id, "
		. "ciniki_library_items.item_type, "
		. "ciniki_library_items.item_format, "
		. "ciniki_library_items.title, "
		. "ciniki_library_items.author_display, "
		. "ciniki_library_items.author_sort, "
		. "ciniki_library_items.year, "
		. "IF(ciniki_library_items.flags&0x01>0, 'yes', 'no') AS owned, "
		. "IF(ciniki_library_items.flags&0x02>0, 'yes', 'no') AS wanted "
		. "";
	if( isset($args['tag_type']) && $args['tag_type'] != '' 
		&& isset($args['tag_permalink']) && $args['tag_permalink'] != '' 
		) {
		$strsql .= "FROM ciniki_library_tags, ciniki_library_items "
			. "WHERE ciniki_library_tags.business_id = '" . ciniki_core_dbQuote($ciniki, $args['business_id']) . "' "
			. "AND ciniki_library_tags.tag_type = '" . ciniki_core_dbQuote($ciniki, $args['tag_type']) . "' "
			. "AND ciniki_library_tags.permalink = '" . ciniki_core_dbQuote($ciniki, $args['tag_permalink']) . "' "
			. "AND ciniki_library_tags.item_id = ciniki_library_items.id "
			. "AND item_type = '" . ciniki_core_dbQuote($ciniki, $args['item_type']) . "' "
			. "AND ciniki_library_items.business_id = '" . ciniki_core_dbQuote($ciniki, $args['business_id']) . "' "
			. "";
		if( isset($args['flags']) && $args['flags'] != '' && intval($args['flags']) > 0 ) {
			$strsql .= "AND (ciniki_library_items.flags&" . intval($args['flags']) . ") > 0 ";
		}
		$strsql .= "ORDER BY author_sort, title COLLATE latin1_general_cs "
			. "";
	} elseif( isset($args['tag_type']) && $args['tag_type'] != '' 
		&& isset($args['tag_permalink']) && $args['tag_permalink'] == '' 
		) {
		$strsql .= ", ciniki_library_tags.tag_name "
			. "FROM ciniki_library_items "
			. "LEFT JOIN ciniki_library_tags ON ("
				. "ciniki_library_tags.item_id = ciniki_library_items.id "
				. "AND ciniki_library_tags.business_id = '" . ciniki_core_dbQuote($ciniki, $args['business_id']) . "' "
				. "AND ciniki_library_tags.tag_type = '" . ciniki_core_dbQuote($ciniki, $args['tag_type']) . "' "
				. ") "
			. "WHERE ciniki_library_items.business_id = '" . ciniki_core_dbQuote($ciniki, $args['business_id']) . "' "
			. "AND item_type = '" . ciniki_core_dbQuote($ciniki, $args['item_type']) . "' ";
		if( isset($args['flags']) && $args['flags'] != '' && intval($args['flags']) > 0 ) {
			$strsql .= "AND (ciniki_library_items.flags&" . intval($args['flags']) . ") > 0 ";
		}
		$strsql .= "HAVING ISNULL(tag_name) ";
		$strsql .= "ORDER BY author_sort, title COLLATE latin1_general_cs "
			. "";

	} elseif( isset($args['flags']) && ($args['flags']&0x02) > 0 ) {
		$strsql .= "FROM ciniki_library_items "
			. "WHERE ciniki_library_items.business_id = '" . ciniki_core_dbQuote($ciniki, $args['business_id']) . "' "
			. "AND item_type = '" . ciniki_core_dbQuote($ciniki, $args['item_type']) . "' "
			. "AND (flags&0x02) > 0 "
			. "";
		$strsql .= "ORDER BY author_sort, title COLLATE latin1_general_cs "
			. "";
	} else {
		$strsql .= "FROM ciniki_library_items "
			. "WHERE ciniki_library_items.business_id = '" . ciniki_core_dbQuote($ciniki, $args['business_id']) . "' "
			. "AND item_type = '" . ciniki_core_dbQuote($ciniki, $args['item_type']) . "' "
			. "";
		if( isset($args['flags']) && $args['flags'] != '' && intval($args['flags']) > 0 ) {
			$strsql .= "AND (ciniki_library_items.flags&" . intval($args['flags']) . ") > 0 ";
		}
		$strsql .= "ORDER BY author_sort, title COLLATE latin1_general_cs "
			. "";
		if( isset($args['limit']) && $args['limit'] != '' && $args['limit'] > 0 ) {
			$strsql .= "LIMIT " . ciniki_core_dbQuote($ciniki, $args['limit']) . " ";
		} else {
			$strsql .= "LIMIT 25 ";
		}
	}
	ciniki_core_loadMethod($ciniki, 'ciniki', 'core', 'private', 'dbHashQueryTree');
	$rc = ciniki_core_dbHashQueryTree($ciniki, $strsql, 'ciniki.library', array(
		array('container'=>'items', 'fname'=>'title', 'name'=>'item', 
			'fields'=>array('id', 'item_type', 'item_format', 'title', 'author_display', 'author_sort', 'year',
				'owned', 'wanted')),
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
