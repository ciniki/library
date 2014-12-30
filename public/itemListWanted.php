<?php
//
// Description
// -----------
//
// Returns
// -------
//
function ciniki_library_itemListWanted($ciniki) {
    //  
    // Find all the required and optional arguments
    //  
    ciniki_core_loadMethod($ciniki, 'ciniki', 'core', 'private', 'prepareArgs');
    $rc = ciniki_core_prepareArgs($ciniki, 'no', array(
        'business_id'=>array('required'=>'yes', 'blank'=>'no', 'name'=>'Business'), 
        'item_type'=>array('required'=>'yes', 'blank'=>'yes', 'name'=>'Item Type'), 
        'item_format'=>array('required'=>'no', 'blank'=>'yes', 'name'=>'Item Format'), 
        'tag_type'=>array('required'=>'no', 'blank'=>'yes', 'name'=>'Tag Type'), 
        'tag_permalink'=>array('required'=>'no', 'blank'=>'yes', 'name'=>'Tag Permalink'), 
        'flags'=>array('required'=>'no', 'blank'=>'yes', 'name'=>'Flags'), 
        'purchased_place'=>array('required'=>'no', 'blank'=>'yes', 'name'=>'Purchased Place'), 
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
    $rc = ciniki_library_checkAccess($ciniki, $args['business_id'], 'ciniki.library.itemListWanted'); 
    if( $rc['stat'] != 'ok' ) { 
        return $rc;
    }   

	ciniki_core_loadMethod($ciniki, 'ciniki', 'businesses', 'private', 'intlSettings');
	$rc = ciniki_businesses_intlSettings($ciniki, $args['business_id']);
	if( $rc['stat'] != 'ok' ) {
		return $rc;
	}
	$intl_timezone = $rc['settings']['intl-default-timezone'];
	$intl_currency_fmt = numfmt_create($rc['settings']['intl-default-locale'], NumberFormatter::CURRENCY);
	$intl_currency = $rc['settings']['intl-default-currency'];

	ciniki_core_loadMethod($ciniki, 'ciniki', 'core', 'private', 'dbQuote');
	ciniki_core_loadMethod($ciniki, 'ciniki', 'users', 'private', 'datetimeFormat');
	$datetime_format = ciniki_users_datetimeFormat($ciniki);
	ciniki_core_loadMethod($ciniki, 'ciniki', 'users', 'private', 'dateFormat');
	$date_format = ciniki_users_dateFormat($ciniki);

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
		. "DATE_FORMAT(ciniki_library_items.purchased_date, '" . ciniki_core_dbQuote($ciniki, $date_format) . "') AS purchased_date, "
		. "ciniki_library_items.purchased_price, "
		. "ciniki_library_items.purchased_place, "
		. "IF(ciniki_library_items.flags&0x01>0, 'yes', 'no') AS owned, "
		. "IF(ciniki_library_items.flags&0x02>0, 'yes', 'no') AS wanted, "
//		. "IFNULL(ciniki_library_reviews.user_id, 0) AS user_id, "
		. "ciniki_library_reviews.user_id, "
		. "IFNULL(ciniki_library_reviews.rating, 0) AS rating "
		. "FROM ciniki_library_items "
		. "LEFT JOIN ciniki_library_reviews ON ("
			. "ciniki_library_items.id = ciniki_library_reviews.item_id "
			. "AND ciniki_library_items.business_id = '" . ciniki_core_dbQuote($ciniki, $args['business_id']) . "' "
			. ") "
		. "WHERE ciniki_library_items.business_id = '" . ciniki_core_dbQuote($ciniki, $args['business_id']) . "' "
		. "AND item_type = '" . ciniki_core_dbQuote($ciniki, $args['item_type']) . "' "
		. "AND (flags&0x02) > 0 "
		. "";
	$strsql .= "ORDER BY author_sort, title COLLATE latin1_general_cs "
			. "";
	ciniki_core_loadMethod($ciniki, 'ciniki', 'core', 'private', 'dbHashQueryTree');
	$rc = ciniki_core_dbHashQueryTree($ciniki, $strsql, 'ciniki.library', array(
		array('container'=>'items', 'fname'=>'title', 'name'=>'item', 
			'fields'=>array('id', 'item_type', 'item_format', 'title', 'author_display', 'author_sort', 'year',
				'purchased_date', 'purchased_price', 'purchased_place',
				'owned', 'wanted')),
		array('container'=>'ratings', 'fname'=>'user_id', 'name'=>'rating',
			'fields'=>array('user_id', 'rating'),
//			'maps'=>array('rating'=>array('0'=>'', '1'=>'$', '2'=>'$$', '3'=>'$$$', '4'=>'$$$$', '5'=>'$$$$$'))
			),
		));
	if( $rc['stat'] != 'ok' ) {
		return $rc;
	}
	if( !isset($rc['items']) || !is_array($rc['items']) ) {
		return array('stat'=>'ok', 'items'=>array());
	}
	$items = $rc['items'];
	foreach($items as $iid => $item) {
		if( isset($item['item']['ratings']) ) {
			foreach($item['item']['ratings'] as $rid => $rating) {
				$items[$iid]['item']['user-' . $rating['rating']['user_id'] . '-rating'] = $rating['rating']['rating'];
			}
			unset($items[$iid]['item']['ratings']);
		}
	}

	return array('stat'=>'ok', 'items'=>$items);
}
?>
