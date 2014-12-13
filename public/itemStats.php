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

	//
	// Load the status maps for the text description of each status
	//
	ciniki_core_loadMethod($ciniki, 'ciniki', 'library', 'private', 'maps');
	$rc = ciniki_library_maps($ciniki);
	if( $rc['stat'] != 'ok' ) {
		return $rc;
	}
	$maps = $rc['maps'];

	ciniki_core_loadMethod($ciniki, 'ciniki', 'core', 'private', 'dbHashQueryTree');
	ciniki_core_loadMethod($ciniki, 'ciniki', 'core', 'private', 'dbHashQueryIDTree');

	$rsp = array('stat'=>'ok', 'item_types'=>array());

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
	if( isset($rc['item_types']) ) {
		$rsp['item_types'] = $rc['item_types'];
	}

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

	//
	// Get the formats
	//
	$strsql = "SELECT item_type, item_format, item_format AS item_format_text, COUNT(item_format) AS num_items "
		. "FROM ciniki_library_items "
		. "WHERE ciniki_library_items.business_id = '" . ciniki_core_dbQuote($ciniki, $args['business_id']) . "' "
		. "AND ciniki_library_items.flags&0x01 = 1 "
		. "GROUP BY item_type, item_format "
		. "ORDER BY item_type, item_format "
		. "";
	$rc = ciniki_core_dbHashQueryTree($ciniki, $strsql, 'ciniki.library', array(
		array('container'=>'item_types', 'fname'=>'item_type', 'name'=>'type',
			'fields'=>array('item_type')),
		array('container'=>'formats', 'fname'=>'item_format', 'name'=>'format',
			'fields'=>array('item_type', 'item_format', 'item_format_text', 'num_items'),
			'maps'=>array('item_format_text'=>$maps['item']['item_format'])),
		));
	if( $rc['stat'] != 'ok' ) {
		return $rc;
	}
	$types = array();
	if( isset($rc['item_types']) ) {
		foreach($rc['item_types'] as $type) {
			$types[$type['type']['item_type']] = $type['type']['formats'];
		}
		foreach($rsp['item_types'] as $itid => $item_type) {
			if( isset($types[$item_type['type']['item_type']]) ) {
				$rsp['item_types'][$itid]['type']['formats'] = $types[$item_type['type']['item_type']];
			}
		}
	}

	//
	// Get the purchased places
	//
	$strsql = "SELECT item_type, purchased_place, COUNT(purchased_place) AS num_items "
		. "FROM ciniki_library_items "
		. "WHERE ciniki_library_items.business_id = '" . ciniki_core_dbQuote($ciniki, $args['business_id']) . "' "
		. "AND (ciniki_library_items.flags&0x01) = 1 "
		. "AND purchased_place <> '' "
		. "GROUP BY item_type, purchased_place "
		. "ORDER BY item_type, purchased_place "
		. "";
	$rc = ciniki_core_dbHashQueryTree($ciniki, $strsql, 'ciniki.library', array(
		array('container'=>'item_types', 'fname'=>'item_type', 'name'=>'type',
			'fields'=>array('item_type')),
		array('container'=>'places', 'fname'=>'purchased_place', 'name'=>'place',
			'fields'=>array('item_type', 'purchased_place', 'num_items')),
		));
	if( $rc['stat'] != 'ok' ) {
		return $rc;
	}
	$types = array();
	if( isset($rc['item_types']) ) {
		foreach($rc['item_types'] as $type) {
			$types[$type['type']['item_type']] = $type['type']['places'];
		}
		foreach($rsp['item_types'] as $itid => $item_type) {
			if( isset($types[$item_type['type']['item_type']]) ) {
				$rsp['item_types'][$itid]['type']['purchased_places'] = $types[$item_type['type']['item_type']];
			}
		}
	}

	//
	// Get the number of wanted
	//
	$strsql = "SELECT item_type, COUNT(id) AS num_items "
		. "FROM ciniki_library_items "
		. "WHERE ciniki_library_items.business_id = '" . ciniki_core_dbQuote($ciniki, $args['business_id']) . "' "
		. "AND (ciniki_library_items.flags&0x02) = 2 "
		. "GROUP BY item_type "
		. "ORDER BY item_type "
		. "";
	$rc = ciniki_core_dbHashQueryIDTree($ciniki, $strsql, 'ciniki.library', array(
		array('container'=>'item_types', 'fname'=>'item_type',
			'fields'=>array('item_type', 'num_items')),
		));
	if( $rc['stat'] != 'ok' ) {
		return $rc;
	}
	$types = array();
	if( isset($rc['item_types']) ) {
		foreach($rsp['item_types'] as $itid => $item_type) {
			if( isset($rc['item_types'][$item_type['type']['item_type']]) ) {
				$rsp['item_types'][$itid]['type']['wanted'] = $rc['item_types'][$item_type['type']['item_type']]['num_items'];
			}
		}
	}

	return $rsp;
}
?>
