<?php
	//print_r("test");
	//exit;

	$ctx = stream_context_create(array(
    		'http' => array(
        			'timeout' => 1
        			)
    			)
		);

	$url = "https://bythegram.ca/superstreetview/collections_en.json";
	$file = file_get_contents($url, 0, $ctx);
	$json = json_decode( $file );

	//print_r($json);
	//exit;

	if ( is_array($json->{'1'}) ) :

	shuffle( $json->{'1'});
	$rand = $json->{'1'}[0];
	
	//print_r($rand);
	//exit;
/*
	$url = "https://www.google.com/maps/streetview/data/{$rand}.json";
	$file = file_get_contents($url, 0, $ctx);
	$json = json_decode( $file );

	shuffle( $json->{'1'});
	$rand = $json->{'2'}[0];
	
	//print_r($rand);
	//exit;
*/	
	$items[0]['lat'] = $rand->{'5'}->{'2'}->{'3'}->{'1'};
	$items[0]['lng'] = $rand->{'5'}->{'2'}->{'3'}->{'2'};
	$items[0]['title'] = $rand->{'1'};
	$newJ = json_encode( $items );
	echo $newJ;

	endif;
?>
