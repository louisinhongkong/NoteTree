<?php
	error_reporting(E_ALL);
	ini_set('display_errors', 1);

	include("libs/config.php");
	include("libs/dbShell.php");
	include("libs/template.php");
	include("libs/initialize.php");
	include("libs/functions.php");
	

	/*

		2 Objects, Folders + notes

		-----------------
		DB
			folders - folderID, parentFolder, date, name  (smallInt, vc6, vc12, vc100)
			notes - noteID, parentFolder, date, name, note (smallInt, vc6, vc12, vc100, text)
		----------------
		Add new folder
			get parentFolder, if none set to 0 for root.
			auto increment folderID
			
		Add new note
			get parentID, if none set to 0 for root
			auto increment noteID

		Add to new folder
			Call add new folder, get new folderID
			Assign folderID to note's parentFolder

	
		Delete 
			if note, delete where noteID
			if folder
				find + delete all notes in folder
				find all folders in folder, call Delete function to mass delete. 


		Rename
			update name where ID 


		Save
			update text where noteID

	
		Get folder content (sort by)
			Select * from notes where parentID order by
			Select * from folders where parentID order by

		Search
			Select * from notes/folders where text/name like %% order by

		
*/



	processAction();
			
	function processAction(){


		$action = assign_input('action','R');
		$folderID = assign_input('folderID','R');
		$noteID = assign_input('noteID','R');
		$parentFolder = assign_input('parentFolder','R');
		$date = assign_input('date','R');
		$name = assign_input('name','R');
		$note = assign_input('note','P',1);
		$sortByDate = assign_input('sortByDate','R');



	  switch($action){
	  	case 'newFolder': $res = newFolder($name, $parentFolder); break;
	  	case 'newNote': $res = newNote($name,$note, $parentFolder); break;
	  	case 'toNewFolder': $res = addToNewFolder($parentFolder,$noteID); break;
	  	case 'delete': $res = delete_( ($noteID) ? $noteID : $folderID , $folderID); break;
	  	case 'rename': $res = rename_($name, ($noteID) ? $noteID : $folderID ,$folderID); break;
	  	case 'save': $res = save($noteID,$note); break;
	  	case 'get': $res = getContent($parentFolder, ($sortByDate) ? 1 : 0);  break;
	  	case 'loadNote': $res = loadNote($noteID);  break;

	  	case 'search': break;
	  	default: $res = array("error"=>"no action");
	  }


	  
	  /*
	  if(( isset($res['error']))&&($res['error'])){echo 'Error occured : '.$res['error'].'<br/>';}
	  
	  if($action=='get'){

	  	echo json_encode($res);
	  }
	  */
	  echo json_encode($res);


	}


	function loadNote($noteID){
		global $db;		

		$sql = "select note from notes where noteID = '".$noteID."'";
		$res = $db->query($sql);
		$content = array();

		if($db->count($sql)>0){
			while($data = mysqli_fetch_array($res, MYSQL_ASSOC)) {
				array_push($content,$data);
			}
		}		
		$error = ($db->error()) ? 'db error' : 0 ;

		return array("error"=>$error,"content"=>$content);
	}


	function newFolder($name, $parentFolder) {
		global $db;
		$name = $name or $name = 'New Folder';
		$parentFolder = $parentFolder or $parentFolder = 0;
		$time = time();
		$sql = "insert into folders set parentFolder='".$parentFolder."', date='".$time."', name='".$name."'";
		$db->query($sql);
		$return['ID'] = $db->insertID();		
		return $return;
	}

	
	function newNote($name,$note,$parentFolder) {
		global $db;
		$name = $name or $name = 'New Note';
		$note = $note or $note = 'My note.'; 
		$parentFolder = $parentFolder or $parentFolder = 0;

		$time = time();
		$sql = "insert into notes set parentFolder='".$parentFolder."', date='".$time."', name='".$name."', note='".$note."'";
		$db->query($sql);
		$return['ID'] = $db->insertID();		
		return $return;

	}

	function addToNewFolder($parentFolder,$noteID) {
		global $db;
		$parentFolder = $parentFolder or $parentFolder = 0;
		if(!$noteID){return array("error"=>"no noteID");}
		$sql = "update notes set parentFolder='".$parentFolder."' where noteID='".$noteID."'";	
		$db->query($sql);

		$error = 0 || ($db->affected()==0);
		return array("error"=>$error);
	}

	function delete_($ID, $isFolder=0) {
		global $db;
		if($isFolder){

			$error = 0;

			//delete notes in folder
			$sql = "delete from notes where parentFolder = '".$ID."'";
			$db->query($sql);
			//$error = 0 || ($db->affected()==0);



			//delete subfolder and subfiles			
			$sql = "select * from folders where parentFolder = '".$ID."'";
			$res = $db->query($sql);
			if($db->count($sql)>0)
			{
				while($data = mysqli_fetch_array($res)) {
					$folderID = $data['folderID'];
					$result = delete_($folderID, 1);
					if($result['error']){
						$error = $error.'|2';
					}
				}
			}

			//delete folder itself
			$sql = "delete from folders where folderID = '".$ID."'";
			$db->query($sql);
			$error = ($db->affected()==0) ? $error.'|no folder deleted with ID' : $error;

			return array("error"=>$error);			
		}else{

			$sql = "delete from notes where noteID = '".$ID."'";
			$db->query($sql);
			$error = 0 || ($db->affected()==0);
			return array("error"=>$error);			
		}
	}


	function rename_($name,$ID,$isFolder=0) {
		global $db;
		if($isFolder){
			$name = $name or $name = 'Renamed Folder';		
			$sql = "update folders set name='".$name."' where folderID='".$ID."'";
		}else{
			$name = $name or $name = 'Renamed File';					
			$sql = "update notes set name='".$name."' where noteID='".$ID."'";
		}

		$db->query($sql);
		$error = ($db->affected()==0) ? 'Nothing renamed' : 0;
		return array("error"=>$error);		
	}
	
	function save($noteID,$note) {
		global $db;
		if(!$note){return array("error"=>"empty note");}
		if(!$noteID){return array("error"=>"empty ID");}


		$sql = "update notes set note='".$note."' where noteID='".$noteID."'";
		$db->query($sql);
		$error = ($db->affected()==0) ? 'Note not saved' : 0;
		return array("error"=>$error);		
	}


	function getContent($parentFolder, $sortByDate) {
		global $db;
		$parentFolder = ($parentFolder) ? $parentFolder : 0;
		$sort = ($sortByDate) ? "date" : "name";
		$content = array();

		$sql = "select * from folders where parentFolder = '".$parentFolder."' order by ".$sort." asc";
		$res = $db->query($sql);

		if($db->count($sql)>0){
			while($data = mysqli_fetch_array($res, MYSQL_ASSOC)) {
				array_push($content,$data);
			}
		}
		$error = ($db->error()) ? 'db error' : 0 ;


		$sql = "select * from notes where parentFolder = '".$parentFolder."' order by ".$sort." asc";
		$res = $db->query($sql);
		if($db->count($sql)>0){
			while($data = mysqli_fetch_array($res, MYSQL_ASSOC)) {
				array_push($content,$data);				
			}
		}

		$error = ($db->error()) ? 'db error' : 0 ;
		

		return array("error"=>$error,"content"=>$content);
			
	}

	/*
	$template->assign("pageText","This is the index page");
	$template->assign("mysqlStatus",mysql_ping());
	$template->loadDisplay("header");
	$template->loadDisplay("index");
	$template->loadDisplay("footer");

	*/
?>
