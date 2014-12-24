<?php
//
// Description
// -----------
//
// Returns
// -------
//
function ciniki_library_purchasedStats($ciniki) {
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
    $rc = ciniki_library_checkAccess($ciniki, $args['business_id'], 'ciniki.library.purchasedStats'); 
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
	$strsql = "SELECT purchased_place AS name, "
		. "SUM(purchased_price) AS total_amount "
		. "FROM ciniki_library_items "
		. "WHERE business_id = '" . ciniki_core_dbQuote($ciniki, $args['business_id']) . "' "
		. "AND purchased_place <> '' "
		. "AND item_type = '" . ciniki_core_dbQuote($ciniki, $args['item_type']) . "' "
		. "AND (flags&0x01) = 1 "
		. "GROUP BY purchased_place "
		. "ORDER BY purchased_place "
		. "";
	ciniki_core_loadMethod($ciniki, 'ciniki', 'core', 'private', 'dbHashQueryTree');
	$rc = ciniki_core_dbHashQueryTree($ciniki, $strsql, 'ciniki.library', array(
		array('container'=>'places', 'fname'=>'name', 'name'=>'place', 
			'fields'=>array('name', 'total_amount')),
		));
	if( $rc['stat'] != 'ok' ) {
		return $rc;
	}
	if( !isset($rc['places']) || !is_array($rc['places']) ) {
		return array('stat'=>'ok', 'places'=>array());
	}
	$places = $rc['places'];
	$totals = array('total_amount'=>0);
	foreach($places as $pid => $place) {
		$place = $place['place'];
		$totals['total_amount'] = bcadd($totals['total_amount'], $place['total_amount'], 4);
		$places[$pid]['place']['total_amount'] = numfmt_format_currency($intl_currency_fmt,
			$place['total_amount'], $intl_currency);
	}
	$totals['total_amount'] = numfmt_format_currency($intl_currency_fmt,
		$totals['total_amount'], $intl_currency);

	return array('stat'=>'ok', 'places'=>$places, 'totals'=>$totals);
}
?>
