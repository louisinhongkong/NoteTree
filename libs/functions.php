<?php
	function sql_quote($value,$allow_html=0) 
	{ 
		global $db;
		if(get_magic_quotes_gpc()){ 
			$value = stripslashes( $value ); 
		} 
		//check if this function exists 
		if( function_exists( "mysqli_real_escape_string" ) ){ 
			$value = mysqli_real_escape_string($db->conn,$value); 
		} 
		//for PHP version < 4.3.0 use addslashes 
		else{ 
			$value = addslashes( $value ); 
		} 
		$value = ($allow_html) ? $value : htmlentities(strip_tags($value),ENT_QUOTES,'UTF-8');
		return $value; 
	} 


	function assign_input($name,$input,$allow_html=0){
		$array = null;
		if($input=="R"){$array = $_REQUEST;}
		if($input=="P"){$array = $_POST;}
		if($input=="G"){$array = $GET;}
		if($input=="C"){$array = $_COOKIE;}

		if(!isset($array[$name])){return null;}
		return ($allow_html) ? sql_quote($array[$name],1) : sql_quote($array[$name]);
	}
	
?>