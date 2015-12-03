<?php
	error_reporting(E_ALL);
	ini_set('display_errors', 1);

	include("libs/config.php");
	include("libs/dbShell.php");
	include("libs/template.php");
	include("libs/initialize.php");
	include("libs/functions.php");
	

	$template->assign("pageText","This is the index page");
	$template->loadDisplay("header");
	$template->loadDisplay("index");
	$template->loadDisplay("footer");

?>
