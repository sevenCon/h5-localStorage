/*
    data:2016-02-24
    author:lanco quan
    description: archieve and maintenance a object to simulate the cookies in the browser ,and 
    upload to the https://github.com/sevenCon
*/
	//cookie object to Transaction
 	function Anco(){
 		this.init();
 	};

 	//test localstorage is available
 	Anco.prototype.init=function(){
 		
 		try{
			localStorage.setItem("test","test");
			localStorage.removeItem("test");
	 	}catch(e){
	 		console.log("do not support the localstorage!");
	 		throw new error("do not support the localstorage!");
	 	}
	}

 	//setCookie key=>value,value is {} type
 	Anco.prototype.setCookie=function(name,value){
 		localStorage.setItem(name,JSON.stringify(value));
 	}

 	//getCookie name 
 	Anco.prototype.getCookie=function(name){
 		var str = localStorage.getItem(name);
 		var resJson = JSON.parse(str);
 		if(resJson.expired>new Date().getTime()){
 			localStorage.removeItem(name);        //remove cookies if expired
 			return;
 		}
 		return resJson.value;
 	}

 	//remove cookie
 	Anco.prototype.removeCookie=function(name){
		localStorage.removeItem(name);
 	}

 	//test unit
 	var anco = new Anco();
 	anco.setCookie("name1",{"name1":"lanco","expired":new Date().getTime()+20});
 	anco.removeCookie("name1");
 	