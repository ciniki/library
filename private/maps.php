<?php
//
// Description
// -----------
// This function returns the array of status text for ciniki_sapos_invoices.status.
//
// Arguments
// ---------
//
// Returns
// -------
//
function ciniki_library_maps($ciniki) {

	$maps = array();
	$maps['item'] = array(
		'item_format'=>array(
			'0'=>'Unknown',
			'11'=>'Vinyl',
			'12'=>'CD',
			'15'=>'Digital',
			'30'=>'Hardcover',
			'41'=>'Trade Paperback',
			'42'=>'Mass Paperback',
			'51'=>'epub',
			'52'=>'mobi',
			),
		);	
	return array('stat'=>'ok', 'maps'=>$maps);
}
?>
