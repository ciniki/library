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
// tnid:         The ID of the tenant to get the item from.
// 
// Returns
// -------
//
function ciniki_library_itemTags($ciniki) {
    //  
    // Find all the required and optional arguments
    //  
    ciniki_core_loadMethod($ciniki, 'ciniki', 'core', 'private', 'prepareArgs');
    $rc = ciniki_core_prepareArgs($ciniki, 'no', array(
        'tnid'=>array('required'=>'yes', 'blank'=>'no', 'name'=>'Tenant'), 
        'item_type'=>array('required'=>'yes', 'blank'=>'yes', 'name'=>'Item Type'),
        )); 
    if( $rc['stat'] != 'ok' ) { 
        return $rc;
    }   
    $args = $rc['args'];
    
    //  
    // Make sure this module is activated, and
    // check permission to run this function for this tenant
    //  
    ciniki_core_loadMethod($ciniki, 'ciniki', 'library', 'private', 'checkAccess');
    $rc = ciniki_library_checkAccess($ciniki, $args['tnid'], 'ciniki.library.itemTags'); 
    if( $rc['stat'] != 'ok' ) { 
        return $rc;
    }   
    $modules = $rc['modules'];

    //
    // Load the tags
    //
    ciniki_core_loadMethod($ciniki, 'ciniki', 'library', 'private', 'loadTags');
    $rc = ciniki_library_loadTags($ciniki, $args['tnid'], $args['item_type']);
    if( $rc['stat'] != 'ok' ) {
        return $rc;
    }

    return $rc;
}
?>
