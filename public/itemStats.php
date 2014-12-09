<?php
//
// Description
// -----------
//
// Returns
// -------
//
function ciniki_library_itemStats($ciniki) {
    //  
    // Find all the required and optional arguments
    //  
    ciniki_core_loadMethod($ciniki, 'ciniki', 'core', 'private', 'prepareArgs');
    $rc = ciniki_core_prepareArgs($ciniki, 'no', array(
        'business_id'=>array('required'=>'yes', 'blank'=>'no', 'name'=>'Business'), 
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
    $rc = ciniki_library_checkAccess($ciniki, $args['business_id'], 'ciniki.library.itemStats'); 
    if( $rc['stat'] != 'ok' ) { 
        return $rc;
    }   

	$rsp = array('stat'=>'ok');

	//
	// Get the genres
	//
	$strsql = "SELECT ciniki_library_items.item_type, "
		. "ciniki_library_tags.tag_type, "
		. "ciniki_library_tags.tag_name, "
		. "ciniki_library_tags.permalink, "
		. "COUNT(ciniki_library_tags.tag_name) AS num_items "
		. "FROM ciniki_library_items "
		. "LEFT JOIN ciniki_library_tags ON ("
			. "ciniki_library_items.id = ciniki_library_tags.item_id "
			. "AND ciniki_library_tags.business_id = '" . ciniki_core_dbQuote($ciniki, $args['business_id']) . "' "
			. ") "
		. "WHERE ciniki_library_items.business_id = '" . ciniki_core_dbQuote($ciniki, $args['business_id']) . "' "
		. "AND (ciniki_library_items.flags&0x01) = 1 "
		. "GROUP BY item_type, tag_type, tag_name "
		. "";
	ciniki_core_loadMethod($ciniki, 'ciniki', 'core', 'private', 'dbHashQueryTree');
	$rc = ciniki_core_dbHashQueryTree($ciniki, $strsql, 'ciniki.library', array(
		array('container'=>'item_types', 'fname'=>'item_type', 'name'=>'type',
			'fields'=>array('item_type')),
		array('container'=>'tag_types', 'fname'=>'tag_type', 'name'=>'type',
			'fields'=>array('tag_type')),
		array('container'=>'names', 'fname'=>'tag_name', 'name'=>'name',
			'fields'=>array('item_type', 'tag_type', 'tag_name', 'permalink', 'num_items')),
		));
	if( $rc['stat'] != 'ok' ) {
		return $rc;
	}
	$rsp['item_types'] = $rc['item_types'];

	//
	// Select the items with no Genre
	//
	$strsql = "SELECT ciniki_library_items.item_type, "
		. "ciniki_library_tags.tag_type, "
		. "ciniki_library_tags.tag_name, "
		. "COUNT(ciniki_library_items.id) AS num_items "
		. "FROM ciniki_library_items "
		. "LEFT JOIN ciniki_library_tags ON ("
			. "ciniki_library_items.id = ciniki_library_tags.item_id "
			. "AND ciniki_library_tags.tag_type = 20 "
			. ") "
		. "WHERE ciniki_library_items.business_id = '" . ciniki_core_dbQuote($ciniki, $args['business_id']) . "' "
		. "AND (ciniki_library_items.flags&0x01) = 1 "
		. "AND ISNULL(tag_name) "
		. "GROUP BY item_type "
		. "";
	$rc = ciniki_core_dbHashQuery($ciniki, $strsql, 'ciniki.products', 'uncategorized');
	if( $rc['stat'] != 'ok' ) {
		return $rc;
	}
	if( isset($rc['rows']) ) {
		foreach($rc['rows'] as $row) {
			$found = 'no';
			foreach($rsp['item_types'] as $itid => $type) {
				if( $type['type']['item_type'] == $row['item_type'] ) {
					$found = 'yes';
					if( !isset($rsp['item_types'][$itid]['type']['tag_types']) ) {
						$rsp['item_types'][$itid]['type']['tag_types'] = array('type'=>array('tag_type'=>'20', 'uncategorized'=>$row['num_items'], 'names'=>array()));
					} else {
						$f2 = 'no';
						foreach($rsp['item_types'][$itid]['type']['tag_types'] as $ttid => $tag_type) {
							if( $tag_type['type']['tag_type'] == '20' ) {
								$f2 = 'yes';
								$rsp['item_types'][$itid]['type']['tag_types'][$ttid]['type']['uncategorized'] = $row['num_items'];
							}
						}
						if( $f2 == 'no' ) {
							$rsp['item_types'][$itid]['type']['tag_types'] = array('type'=>array('tag_type'=>'20', 'uncategorized'=>$row['num_items'], 'names'=>array()));
						}
					}
				}
			}
			if( $found == 'no' ) {
				$rsp['item_types'][$itid]['type']['tag_types'] = array('type'=>array('tag_types'=>array('type'=>array('tag_type'=>'20', 'uncategorized'=>$row['num_items'], 'names'=>array()))));
			}
		}
	}

	return $rsp;
}
?>
