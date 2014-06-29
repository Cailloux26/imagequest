/********* Init Valuables *************/
var playerNum = 3; //the number of a player
var players = new Array(); // player's parameters

/********* monster parameters *************/
var monstersArray = new Array();
var mHp = 200;
var mAtk = 200;
var mDef = 200;
var mDie = 0;
var lv = 0;
var mAttck = 0;
/********* About Player *************/
// player parameters(only initialization)
var pNm = "-";  // name
var pHp = "-";  // HP
var pAtk = "-"; // attack
var pDef = "-"; // deffence
var life = 3;	// player's life(the number of players)
var pAttck = 0; // player's attack point
var readyforattack = 0; //players are ready for attack or not

/********* Sound / files path *************/
var soundPool = new Array();
var audioType;
var loadCount = 0;
var itemsToLoad = 0;
var MAX_SOUNDS = 6;
var SOUND_CLICK = "./images/click";
var SOUND_BATTLE = "./images/battle";
var SOUND_OPENING = "./images/opening";
var SOUND_BATTLELOOP = "./images/battle_loop";
var SOUND_ATTACK = "./images/attack";
var SOUND_DAMAGE = "./images/damage";
var SOUND_WIN = "./images/win";
var tempSound = new Array();
// About battle
var loopTimer = new Array();

/********* Main Init *************/
$(function init(){
	//check browser features
	if(!chkBrowser()){
		alert("your browser doesn't support file API");
	}
	//init Game
	initGame();
});
function chkBrowser(){
	// Check for the various File API support.
	if (window.File && window.FileReader && window.FileList && window.Blob) {
	  // Great success! All the File APIs are supported.
	  return true;
	} else {
	  console.log('The File APIs are not fully supported in this browser.');
	  return false;
	}
}
/********* Init Audio *************/
function supportedAudioFormat(audio) {
	var returnExtension = "";
	if (audio.canPlayType("audio/ogg") == "probably" || audio.canPlayType("audio/ogg") == "maybe") {
		returnExtension = "ogg";
	} else if(audio.canPlayType("audio/wav") == "probably" || audio.canPlayType("audio/wav") == "maybe") {
		returnExtension = "wav";
	} else if(audio.canPlayType("audio/mp3") == "probably" || audio.canPlayType("audio/mp3") == "maybe") {
		returnExtension = "mp3";
	}
	return returnExtension;
}
function itemLoaded(event) {
	loadCount++;
	if (loadCount >= itemsToLoad) {
		openingSound.removeEventListener("canplaythrough", itemLoaded, false);
		battleSound.removeEventListener("canplaythrough", itemLoaded, false);
		attackSound.removeEventListener("canplaythrough", itemLoaded, false);
		clickSound.removeEventListener("canplaythrough", itemLoaded, false);
		damageSound.removeEventListener("canplaythrough", itemLoaded, false);
		winSound.removeEventListener("canplaythrough", itemLoaded, false);
		deadSound.removeEventListener("canplaythrough", itemLoaded, false);
		soundPool.push({name:"battle", element:attackSound, played:false});
		soundPool.push({name:"click", element:clickSound, played:false});
	}
}
function poolSounds(){
	openingSound = document.createElement("audio");
	document.body.appendChild(openingSound);
	audioType = supportedAudioFormat(openingSound);
	openingSound.addEventListener("canplaythrough", itemLoaded, false);
	openingSound.setAttribute("src", "./images/opening." + audioType);

	battleSound = document.createElement("audio");
	document.body.appendChild(battleSound);
	battleSound.addEventListener("canplaythrough", itemLoaded, false);
	battleSound.setAttribute("src", "./images/battle." + audioType);

	attackSound = document.createElement("audio");
	document.body.appendChild(attackSound);
	attackSound.addEventListener("canplaythrough", itemLoaded, false);
	attackSound.setAttribute("src", "./images/attack." + audioType);

	clickSound = document.createElement("audio");
	document.body.appendChild(clickSound);
	clickSound.addEventListener("canplaythrough", itemLoaded, false);
	clickSound.setAttribute("src", "./images/click." + audioType);

	damageSound = document.createElement("audio");
	document.body.appendChild(damageSound);
	damageSound.addEventListener("canplaythrough", itemLoaded, false);
	damageSound.setAttribute("src", "./images/damage." + audioType);

	winSound = document.createElement("audio");
	document.body.appendChild(winSound);
	winSound.addEventListener("canplaythrough", itemLoaded, false);
	winSound.setAttribute("src", "./images/win." + audioType);

	deadSound = document.createElement("audio");
	document.body.appendChild(deadSound);
	deadSound.addEventListener("canplaythrough", itemLoaded, false);
	deadSound.setAttribute("src", "./images/dead." + audioType);
}
/**
	to play sounds you passed
	sound: sound file path(relative)
	volume: sound's volume
**/
function playSound(sound, volume) {
	var soundFound = false;
	var soundIndex = 0;

	if (soundPool.length > 0) {
		while (!soundFound && soundIndex < soundPool.length) {
			var tSound = soundPool[soundIndex];
			if ((tSound.element.ended || !tSound.played) && tSound.name == sound) {
				soundFound = true;
				tSound.played = true;
			} else {
				soundIndex++;
			}
		}
	}
	if (soundFound) {
		tempSound[sound] = soundPool[soundIndex].element;
		tempSound[sound].volume = volume;
		tempSound[sound].play();

	} else if (soundPool.length < MAX_SOUNDS){
		tempSound[sound] = document.createElement("audio");
		tempSound[sound].setAttribute("src", sound + "." + audioType);
		tempSound[sound].volume = volume;
		tempSound[sound].play();
		soundPool.push({name:sound, element:tempSound[sound], type:audioType, played:true});
	}
	console.log(tempSound);
}
/********* Init Game *************/
function initGame(){
	//reset player's status
	for(var i = 1; i <= playerNum; i++ ){
		setPlayerData(i,"player0"+i,pHp,pAtk,pDef);
	}
	//loading effect sounds
	poolSounds();

	//start music
	playSound(SOUND_OPENING, 1);

	//get Monsters from a Json file
	getMonsters();

	//show Battle Button
	var btn = document.createElement('button');
	btn.setAttribute("class", "btnBattleStart");
	btn.addEventListener("click", startBattle, false);
	var t=document.createTextNode("Battle Start!");
	btn.appendChild(t);
	var btndiv = document.getElementById('startBtn');
	btndiv.appendChild(btn);

	//make you unable to command until you pick players
	$(".commend").css("display","none");
}

/********* Start Battle *************/
function startBattle(){
	console.log("start");
	tempSound[SOUND_OPENING].pause();
	tempSound[SOUND_OPENING].currentTime = 0;
	
	//show Monsters
	displayMonster();
	//make you available to command until you pick players
	$(".commend").css("display","block");
	playSound(SOUND_BATTLELOOP, 1);
}
/**
	to get monsters from Json file
**/
function getMonsters(){
    var jqxhr = $.getJSON("./monsters.json", {}, function (data) {
	    $.each(data.row, function (key, val) {
	    	monstersArray.push({image_url:val.image_url, name:val.name, hp:val.hp, atk:val.atk, def:val.def, die:0});
	    });
	});
	jqxhr.complete(function() {
	  console.log( "Json complete" );
	});
}
/**
	to show monster from monster's array
**/
function displayMonster(){
	console.log(monstersArray[lv]);
	var mns = monstersArray[lv];
	var mnsElm = document.getElementById("monsimg");
	mnsElm.src = "./images/" + mns["image_url"];
	$("#monsimg").css("display","");
	$(".message>p").text(mns["name"]+" appeared!!");
	mHp = mns["hp"];
	mAtk = mns["atk"];
	mDef = mns["def"];
	mDie = mns["die"];
}
/**
	to set player's status
	plyaerId: Player's ID (1 to 3)
**/
function setPlayerData(plyaerId,name,hp,atk,def){
	$(".player0"+plyaerId+">.name").text(name);
	$(".player0"+plyaerId+">.hp").text(hp);
	$(".player0"+plyaerId+">.atk").text(atk);
	$(".player0"+plyaerId+">.def").text(def);
	//die : 0:alive 1:die
	//command : 0:nothing 1:attack 2:guard
	players[plyaerId] = {
		"nm":name,
		"hp":hp,
		"atk":atk,
		"def":def,
		"die":0,
		"command":0
	}
}


/********* Stock Attack Command *************/
$(".battle>a").click(function(evt){
playSound(SOUND_CLICK, 1);
evt.preventDefault();
stockCommand(1);
if(!readyforattack){
	console.log("not yet");
}else{
	console.log("attack");
	$(".commend").css("display","none");
	battleTurn(); // get turn
	battle();
}
return false;
});
/********* Stock defence Command *************/
$(".guard>a").click(function(evt){
	playSound(SOUND_CLICK, 1);
	evt.preventDefault();
	stockCommand(2);
});

/**
	to attack monster or player
	type: who attack / 0:player 1:monster
	i: which player. 1 to 3 is player , 4 is monster
**/
function attack(type,i){
	//eval("dfd"+i+"=$.Deferred();");
	if(!type){
		//player
		if(players[i].die != 1){
			console.log("player attack"+i);
			attckP(0,i); // get Attack point
	  		//if players alive, they can attack
	  		playSound(SOUND_ATTACK, 1);
			$(".message>p").text(players[i].nm+"'s turn! you gave "+pAttck+" damage");
			mHp = mHp-pAttck;
			$(".monsterLi>li").addClass("damage");
			setTimeout(function(){
				$(".monsterLi>li").removeClass("damage");
				//eval("dfd"+ i).resolve();
				dieCheck(1,4); // check if the monster die or not
			},1500);
	  	}
	}else{
		//monster
		console.log("mons attack");
		if(mDie != 1){
			// choose a target player
			var target = Math.floor((Math.random() * 3) + 1);
			attckP(1,target); // get Attack point
	  	    $(".monsterLi>li").addClass("attck");
			$(".iqArea").addClass("shock");
			playSound(SOUND_DAMAGE, 1);
			while(players[target].die == 1){
				// if the player has already dead, choose another
				target = Math.floor((Math.random() * 3) + 1);
			}
			$(".message>p").text("Monster's turn! "+ players[target].nm +" got "+mAttck+" damage");
			players[target].hp = players[target].hp-mAttck;
			dieCheck(0,target); // check if the player die or not
			$(".player0"+ target +">.hp").text(players[target].hp);
			setTimeout(function(){
				$(".monsterLi>li").removeClass("attck");
				$(".iqArea").removeClass("shock");
			},1700);
		}
	}

}
/**
	to defence from monster's attack
	type: who attack / 0:player 1:monster
	i: which player. 1 to 3 is player
**/
function defence(i){
	$(".message>p").text(+ players[target].nm +" are guarding! ");
	//monster attacks
	var target = Math.floor((Math.random() * 3) + 1);
	attckP(1,target);
	mAttck = Math.floor(mAttck*0.4);
	setTimeout(function(){
	$(".monsterLi>li").addClass("attck");
	$(".iqArea").addClass("shock");
	
	while(players[target].die == 1){
		// if the player has already dead, choose another
		target = Math.floor((Math.random() * 3) + 1);
	}
	$(".message>p").text("Monster's turn! " + players[target].nm + " got "+mAttck+" damage");
	players[target].hp = players[target].hp-mAttck;
	dieCheck(0,target); // check if the player die or not
	$(".player0"+ target +">.hp").text(players[target].hp);
	setTimeout(function(){
		$(".monsterLi>li").removeClass("attck");
		$(".iqArea").removeClass("shock");
		},1500);
	},2000);
	return false;
}

//check die or not
function dieCheck(type,pId){

	if(!type){
		if(players[pId].hp<=0){
			$(".player0"+pId+">.hp").text("0");
			players[pId].die = 1;
			setTimeout(function(){$(".message>p").text(players[pId].nm+" is dead.");},1300);
			$(".commend").css("display","none");
			$(".iqArea").removeClass("dying");
			life--;
			if(life == 0){
				//all end
				$(".iqArea").addClass("die");
			}
		}else if(players[pId].hp<=30){
			$(".iqArea").addClass("dying");
			players[pId].die = 0;
		}else {
			players[pId].die = 0;
		}
	}else{
		console.log("die check in mons");
		if(mHp<=0){
			setTimeout(function(){
				$(".message>p").text("you beated monster");
				playSound(SOUND_WIN, 1);
			},1000);
			$(".monsterLi img").css("display","none");
			Mdie = 1;
			clearTimeout(loopTimer[2]);
			clearTimeout(loopTimer[3]);
			clearTimeout(loopTimer[4]);

			$(".commend").css("display","block");
			
			// move to next level
			lv++;
			setTimeout(function(){

				playSound(SOUND_BATTLELOOP, 1);
				displayMonster();
			},2000);
		}else{
			// monster still alive
			Mdie= 0;
		}		
	}

}

$('.commend li').hover(function(){
$('.commend li').removeClass("cur");
$(this).addClass("cur");
});

function stockCommand(commandId){
	switch($(".commend>p").text()){
		case "Player01":
			players[1].command = commandId;
			displayNextPlayer(2);
			readyforattack = 0;
			break;
		case "Player02":
			players[2].command = commandId;
			displayNextPlayer(3);
			readyforattack = 0;
			break;
		case "Player03":
			players[3].command = commandId;
			displayNextPlayer(1);
			readyforattack = 1;
			break;
		default:
			break;
	}
}

function displayNextPlayer(pId){
	for (var i = pId; i <= playerNum; i++) {
		if(players[pId].die == 0){
			$(".commend>p").text("Player0"+i);
			break;
		}
	};
}

function battle(){
	if(turn){
		//your turn
		if(players[1].command==1){attack(0,1)}else{attack(0,1)};

		loopTimer[2] = setTimeout(function(){
			if(players[2].command==1){attack(0,2)}else{attack(0,2)};
			loopTimer[3] = setTimeout(function(){
				if(players[3].command==1){attack(0,3)}else{attack(0,3)};
				loopTimer[4] = setTimeout(function(){
					//monster's turn
					attack(1,4);
					$(".commend").css("display","block");
					},3500);
			},3500);
		},3500);
	}else{
		//monster's turn
		attack(1,4);
		loopTimer[1] = setTimeout(function(){
			if(players[1].command==1){attack(0,1)}else{attack(0,1)};
			loopTimer[2] = setTimeout(function(){
				if(players[2].command==1){attack(0,2)}else{attack(0,2)};
				loopTimer[3] = setTimeout(function(){
					if(players[3].command==1){attack(0,3)}else{attack(0,3)};
					$(".commend").css("display","block");
					},3500);
			},3500);
		},3500);
	}
	turn = false;

}
function getRandom(min,max){
	var num = Math.floor(Math.random()*(max-min+1))+min;
	return num;
}
// calculate attack
function attckP(type,pId){
	if(!type){
		pAttck = Math.round((players[pId].atk - mDef) / 2),
			randomNum = 100;
		if(pAttck < 2) {
			pAttck = getRandom(1,2);
		} else {
			pAttck = Math.round((pAttck + (pAttck + 1) * (randomNum /256)) / 2);
		}
		
	}else{
		
		mAttck = Math.round((mAtk * 2 - players[pId].def) / 2),
			randomNum = getRandomNum();
		if(mAttck <= 0) {
			mAttck = getRandom(1,2);
		} else if(mAttck < (mAtk / 2 + 1)) {
			mAttck = Math.round((2 + (mAtk/ 2 + 1) * (randomNum / 256)) / 3);
		} else if(mAttck > (mAtk / 2 + 1)) {
			mAttck = Math.round((mAttck + (mAttck + 1) * (randomNum / 256)) / 2);
		}
	}
	return false;
}
// get Random
function getRandomNum(){
	var table = [
		7, 182, 240, 31, 85, 91, 55, 227, 174, 79, 178, 94, 153, 246, 119, 203, 96, 143, 67, 62, 167, 76, 45, 136, 199, 104, 215, 209, 194, 242, 193, 221,170, 147, 22, 247, 38, 4, 54, 161, 70, 78, 86, 190, 108, 110, 128, 213, 181, 142, 164, 158, 231, 202, 206, 33, 255, 15, 212, 140, 230, 211, 152, 71, 244, 13, 21, 237, 196, 228, 53, 120, 186, 218, 39, 97, 171, 185, 195, 125, 133, 252, 149, 107, 48, 173, 134, 0, 141, 205, 126, 159, 229, 239, 219, 89, 235, 5, 20, 201, 36, 44, 160, 60, 68, 105, 64, 113, 100, 58, 116, 124, 132, 19, 148, 156, 150, 172, 180, 188, 3, 222, 84, 220, 197, 216, 12, 183, 37, 11, 1, 28, 35, 43, 51, 59, 151, 27, 98, 47, 176, 224, 115, 204, 2, 74, 254, 155, 163, 109, 25, 56, 117, 189, 102, 135, 63, 175, 243, 251, 131, 10, 18, 26, 34, 83, 144, 207, 122, 139, 82, 90, 73, 106, 114, 40, 88, 138, 191, 14, 6, 162, 253, 250, 65, 101, 210, 77, 226, 92, 29, 69, 30, 9, 17, 179, 95, 41, 121, 57, 46, 42, 81, 217, 93, 166, 234, 49, 129, 137, 16, 103, 245, 169, 66, 130, 112, 157, 146, 87, 225, 61, 241, 249, 238, 8, 145, 24, 32, 177, 165, 187, 198, 72, 80, 154, 214, 127, 123, 233, 118, 223, 50, 111, 52, 168, 208, 184, 99, 200, 192, 236, 75, 232, 23, 248
	];
	var pos = Math.floor(Math.random() * 255) % 256;
	var v = table[pos];
	pos = Math.floor(pos + Math.random() * 255) % 256;
	return v;
}


// choose which turn
function battleTurn(){
	turn=Math.floor(Math.random()*10);
	if(turn<=5){
	  turn=false;
	}else{
	  turn=true;
	}
	return false;
}
