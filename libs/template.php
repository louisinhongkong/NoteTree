<?php

class template
{
	var $templateDir;
	var $dataStore = array();
	var $templateStore = array();
	
	function setDir($dir)
	{
		$this->templateDir = $dir;
	}
	
	function assign($name,$var)
	{
		$this->dataStore[$name] = $var;
	}
	
	function loadDisplay($templateFileName)
	{
		$this->load($templateFileName);
		$this->display($templateFileName);
	}
	
	function loadReturn($templateFileName)
	{
		$this->load($templateFileName);
		return $this->templateStore[$templateFileName];	
	}
	
	
	function load($templateFileName)
	{
		$templateContents = file_get_contents($this->templateDir.$templateFileName.".html", true);
		$templateContents = $this->templateStore[$templateFileName] = $this->process($templateContents);
	}
	
	function display($name)
	{
		echo $this->templateStore[$name];
	}
	
	function process($templateContents)
	{
		$arrayKeys = array_keys($this->dataStore);
		
		foreach($arrayKeys as $v)
		{
			$name = '{$'.$v.'}';
			$templateContents = str_replace($name,stripslashes($this->dataStore[$v]),$templateContents);
		}
		$templateContents = preg_replace('%\{\$(\w+)\}%i','',$templateContents);
		
		return $templateContents;
	}
	
}

?>