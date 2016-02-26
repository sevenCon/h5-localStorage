/*
    data:2016-02-25
    author:lanco quan
    description: archieve and maintenance a object to operate the indexDB in the browser ,and 
    upload to the https://github.com/sevenCon
*/

	var db ;   //operating object of indexDB
	var arrayKey=[];
	var openRequest;
	var lastCursor;
	var indexedDB = window.indexedDB || window.webkitIndexDB || window.mozIndexedDB || window.msIndexedDB;
	var dbName = "person";
	var tableName = "testTable";

	function init(){
		openRequest = indexedDB.open(dbName);  //open the databse or new one
		//handle setup
		openRequest.onupgradeneeded = function(e){    // new database or version change
			console.log("running onupgradeneeded");
			var thisDb = e.target.result;   
			console.log(thisDb.version);
			if(!thisDb.objectStoreNames.contains(tableName)){   //if contains the table
				console.log("I need to create the obejectstore");
				//   primary key id ,auto increment
				var objectStore = thisDb.createObjectStore(tableName,{keyPath:"id",autoIncrement:true});
				//set index ,if unique
				objectStore.createIndex("name","name",{unique:false});
				objectStore.createIndex("phone","phone",{unique:false});
			}
		}

		openRequest.onsuccess = function (e){
			db = e.target.result;
			console.log(db.version);
			db.onerror = function (){
				//generic error handleer for all errors targeted at this database'sd
				console.log("Database error:"+ event.target.errorCode);
				console.dir(event.target);
			};
			if(db.objectStoreNames.contains(tableName)){
				console.log("contains table "+ tableName);
				var transaction = db.transaction([tableName],"readwrite");
					transaction.oncomlete = function (event){
						console.log("All done!");
					};
					//var content = document.querySelector("#content");
					transaction.onerror = function(event){
						//Don't forget to handle errors
						console.dir(event);
					}
				//get the records from the table
				var objectStore  = transaction.objectStore(tableName);
					//iterator
					objectStore.openCursor().onsuccess = function(event){
						var cursor = event.target.result;
						// console.log(cursor);
						if(cursor){
							// console.log(cursor.key);
							// console.log(cursor.value);
							render({key:cursor.key,name:cursor.value["name"],phone:cursor.value["phone"],address:cursor.value['address']});
							//flag++;
							lastCursor = cursor.key;
							cursor.continue();
						}else{
							console.log("Done with cursor");
						}
					};
					objectStore.openCursor().onerror = function (event){
						console.log(event);
					};
			}
		}

		openRequest.onerror = function(event){

		}

		// add new record 
		document.querySelector("#add").addEventListener("click",function(){
			var name = document.querySelector("#name").value;
			var phone  = document.querySelector("#phone").value;
			var address = document.querySelector("#address").value;
			var person ={"name" : name,"phone":phone,"address":address};

			var transaction = db.transaction([tableName],"readwrite");
				transaction.oncomlete = function(e){
					console.log("transaction complete!");

				}
				transaction.onerror = function(e){
					console.dir(event);
				}

			var objectStore = transaction.objectStore(tableName);
				objectStore.add(person);
				objectStore.openCursor().onsuccess = function(event){
					cursor = event.target.result;
					var key;
					if(lastCursor==null){
						key = cursor.key;
						lastCursor = key;
					}else{
						key = ++lastCursor;
					}
					render({key:key,name:name,phone:phone,address:address});
					console.log("success add new record ! key:"+key);
					console.dir(person);
				}
		},false);
		//删除指定id
		function deleteRecord(id){
			var transaction = db.transaction([tableName],"readwrite");
				transaction.oncomlete = function(e){
					console.log("transction complete!");
				}
				transaction.onerror = function(e){
					console.dir(event);
				};
				var objectStore = transaction.objectStore(tableName);//get the obejct objectStore
				var removeKey = parseInt(id);
				var getRequest = objectStore.get(removeKey);
				getRequest.onsuccess=function(e){
					var result = e.result;
					console.log(result);
				}
				var request = objectStore.delete(removeKey);
				request.onsuccess=function(e){
					console.log("successed delete record!");
				}
				request.onerror = function(e){
					console.log("success delete record!");
					console.dir(e);
				}	
			//display the record deleted
			document.getElementById(removeKey).style.display="none";
		}
		
		//delete the database handler
		document.querySelector("#deleteDB").addEventListener("click",function(){
			deleteDB(dbName);
		},false);

		//query
		document.querySelector("#selectBtn").addEventListener("click",function(){
			var curName = document.getElementById("selname").value;
			var transaction = db.transaction([tableName],'readwrite');
				transaction.oncomlete = function(e){
					console.log("transaction complete!");
				}
				transaction.onerror = function(e){
					console.dir(e);
				}

				var objectStore = transaction.objectStore(tableName);
				var boundkeyRange = IDBKeyRange.only(curName);//get the range object
					objectStore.index("name").openCursor(boundkeyRange).onsuccess =function(event){
						var cursor = event.target.result;
						if(!cursor){
							return;
						}
						var rowData =cursor.value;
						// console.log(rowData);
						// console.log(cursor);
						render({key:cursor.value.id,name:cursor.value['name'],phone:cursor.value["phone"],address:cursor.value["address"]});
						cursor.continue();
					};
					clearTable();

		},false)


		//delete the databse
		function deleteDB(name){
			var deleteDB = indexedDB.deleteDatabase(name);
			deleteDB.onsuccess=function(e){
				console.log("database delete successed!");
			}
			deleteDB.onerror=function(e){
				console.dir("database delete error! "+e.target);
			}
		}
		//render the data in page
		function render(obj){
			var table  = document.querySelector("#table tbody");
			table.innerHTML += "<tr id='"+obj.key+"'><td>"+obj.key+"</td><td>"+obj.name+"</td><td>"+obj.phone+"</td><td>"+obj.address+"</td><td><input type='button' name='deleteRe' id='deleteRe' data-id='"+obj.key+"' value='删除'/></tr>";
			
		}
		//clear table
		function clearTable(){
			var table  = document.querySelector("#table tbody");
			table.innerHTML="";
		}
		document.querySelector("table").addEventListener("click", function(e){
			//delete the record handler
			var event = window.event || e;
			var target = event.srcElement||event.target;
			// console.log(target.getAttribute("type").toLowerCase());
			if(target.getAttribute("type").toLowerCase()=="button" ){
				deleteRecord(target.getAttribute("data-id"));
			}
		},false);
		
		
}

window.addEventListener("DOMContentLoaded",init,false);
