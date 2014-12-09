<?php
//
// Description
// ===========
// This method will return the existing genres for items.
//
// Arguments
// ---------
// api_key:
// auth_token:
// business_id: 		The ID of the business to get the item from.
// 
// Returns
// -------
//
function ciniki_library_loadTags($ciniki, $business_id, $item_type) {
	//
	// Get the list of genres
	//
	$strsql = "SELECT DISTINCT CONCAT_WS('-', tag_type, tag_name) AS fname, tag_type, tag_name "
		. "FROM ciniki_library_items, ciniki_library_tags "
		. "WHERE ciniki_library_items.business_id = '" . ciniki_core_dbQuote($ciniki, $business_id) . "' "
		. "AND ciniki_library_items.item_type = '" . ciniki_core_dbQuote($ciniki, $item_type) . "' "
		. "AND ciniki_library_items.id = ciniki_library_tags.item_id "
		. "AND ciniki_library_tags.business_id = '" . ciniki_core_dbQuote($ciniki, $business_id) . "' "
		. "";
	$strsql .= "GROUP BY fname ";
	$strsql .= "ORDER BY tag_type, tag_name ";

	$rsp = array('stat'=>'ok', 
		'genres'=>array(),
		'tags'=>array(),
		'lists'=>array(),
		);

	ciniki_core_loadMethod($ciniki, 'ciniki', 'core', 'private', 'dbHashQueryTree');
	$rc = ciniki_core_dbHashQueryTree($ciniki, $strsql, 'ciniki.library', array(
		array('container'=>'types', 'fname'=>'tag_type', 'name'=>'type',
			'fields'=>array('type'=>'tag_type')),
		array('container'=>'tags', 'fname'=>'fname', 'name'=>'tag',
			'fields'=>array('type'=>'tag_type', 'name'=>'tag_name')),
		));
	if( $rc['stat'] != 'ok' ) {
		return $rc;
	}

	if( isset($rc['types']) ) {
		foreach($rc['types'] as $tid => $type) {
			if( $type['type']['type'] == '20' ) {
				$rsp['genres'] = $type['type']['tags'];
			} elseif( $type['type']['type'] == '40' ) {
				$rsp['tags'] = $type['type']['tags'];
			} elseif( $type['type']['type'] == '60' ) {
				$rsp['lists'] = $type['type']['tags'];
			}
		}
	}

	return $rsp;
}
?>
