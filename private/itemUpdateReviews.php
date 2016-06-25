<?php
//
// Description
// -----------
// This function will update an item's rating from arguments passed to itemAdd or itemUpdate.
//
// Arguments
// ---------
//
// Returns
// -------
//
function ciniki_library_itemUpdateReviews($ciniki, $business_id, $item_id) {

    ciniki_core_loadMethod($ciniki, 'ciniki', 'core', 'private', 'dbQuote');
    ciniki_core_loadMethod($ciniki, 'ciniki', 'core', 'private', 'dbHashQueryIDTree');
    ciniki_core_loadMethod($ciniki, 'ciniki', 'core', 'private', 'objectAdd');
    ciniki_core_loadMethod($ciniki, 'ciniki', 'core', 'private', 'objectUpdate');

    //
    // Get the existing ratings and employees
    //
    $strsql = "SELECT ciniki_business_users.user_id, "
        . "IFNULL(ciniki_library_reviews.id, 0) AS review_id, "
        . "IFNULL(ciniki_library_reviews.rating, 0) AS rating "
        . "FROM ciniki_business_users "
        . "LEFT JOIN ciniki_library_reviews ON ("
            . "ciniki_business_users.user_id = ciniki_library_reviews.user_id "
            . "AND ciniki_library_reviews.item_id = '" . ciniki_core_dbQuote($ciniki, $item_id) . "' "
            . "AND ciniki_library_reviews.business_id = '" . ciniki_core_dbQuote($ciniki, $business_id) . "' "
            . ") "
        . "WHERE ciniki_business_users.business_id = '" . ciniki_core_dbQuote($ciniki, $business_id) . "' "
        . "AND ciniki_business_users.status = 10 "
        . "";
    $rc = ciniki_core_dbHashQueryIDTree($ciniki, $strsql, 'ciniki.customers', array(
        array('container'=>'employees', 'fname'=>'user_id',
            'fields'=>array('user_id', 'review_id', 'rating')),
        ));
    if( $rc['stat'] != 'ok' ) {
        return $rc;
    }
    if( !isset($rc['employees']) ) {    
        return array('stat'=>'ok');
    }
    $employees = $rc['employees'];

    //
    // Check the args for each employee rating
    //
    foreach($employees as $user_id => $user) {
        $args = array();
        if( isset($ciniki['request']['args']['user-' . $user_id . '-rating']) ) {
            if( $ciniki['request']['args']['user-' . $user_id . '-rating'] != $user['rating'] ) {
                $args['rating'] = $ciniki['request']['args']['user-' . $user_id . '-rating'];
            }
        }
        if( count($args) > 0 ) {
            //
            // Update the review member
            //
            if( $user['review_id'] > 0 ) {
                $rc = ciniki_core_objectUpdate($ciniki, $business_id, 'ciniki.library.review', $user['review_id'], $args, 0x04);
                if( $rc['stat'] != 'ok' ) {
                    return $rc;
                }
            } else {
                $args['item_id'] = $item_id;
                $args['user_id'] = $user_id;
                if( !isset($args['review']) ) {
                    $args['review'] = '';
                }
                $rc = ciniki_core_objectAdd($ciniki, $business_id, 'ciniki.library.review', $args, 0x04);
                if( $rc['stat'] != 'ok' ) {
                    return $rc;
                }
            }
        }
    }


    return array('stat'=>'ok');
}
?>
