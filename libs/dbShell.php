<?php

class dbShell
{
	
	var $dbhost;
	var $dbuser;
	var $dbpass;
	var $dbname;
	var $conn;
	
	
	function setVars($dbhost,$dbuser,$dbpass,$dbname)
	{
		$this->dbhost = $dbhost;
		$this->dbuser =	$dbuser;
		$this->dbpass = $dbpass;
		$this->dbname = $dbname;
	}

	function connectDB()
	{
		$this->conn = new mysqli($this->dbhost,$this->dbuser,$this->dbpass,$this->dbname);
	}

	function query($query)
	{
		$result = mysqli_query($this->conn,$query);
		if(DEBUG){ echo $this->error();}
		return $result; 
	}
	function count($query)
	{
		return mysqli_num_rows($this->query($query));
	}
	function affected()
	{
		return mysqli_affected_rows($this->conn);
	}
	function error()
	{
		return mysqli_error($this->conn);
	}
	function fetch($query)
	{
		return mysqli_fetch_array($this->query($query));
	}
	function insertID()
	{
		return mysqli_insert_id($this->conn); 

	}
}

?>