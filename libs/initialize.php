<?php

//start the db engine
$db = new dbShell;
$db->setVars($dbhost,$dbuser,$dbpass,$dbname);
$db->connectDB();

//start the html template engine
$template = new template;
$template->setDir($config['templatesDIR']);


//set some siteWide varibles for the template engine
$template->assign("rootURL",$config['rootURL']);
$template->assign("siteName",$config['siteName']);

$template->assign("imageURL",$config['rootURL']."/images/");
$template->assign("jsURL",$config['rootURL']."/js/");
$template->assign("cssURL",$config['rootURL']."/css/");




?>