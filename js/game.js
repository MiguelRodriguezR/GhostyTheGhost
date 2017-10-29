// Inits
window.onload = function init() {
  var game = new GF();
  game.start();
};

var GF = function(){
   var canvas, ctx, w, h;
   var backgroundPattern;
   var rainDrop = new Array();
   var numberDrops = 300;
   var delta,oldTime=0;
   var houseModel;
   var objects = new Array();
   var poshx,poshy;
   var inputStates = {};
   var lightOn =1;
   var someFocused = -1;
   var actionFocused = -1;
   var menufocused = -1;
   var sounds = {};
   var ghosty = {
     name:"ghosty",
     x:0,
     y:0,
     directionx:0,
     move:false,
     img:new Image(),
     thinkTime:0,
     thinking:"",
     speed:100,
     actionToDo:function(){

     },
     goTo:function(object,action){
       ghosty.move=true;
       ghosty.directionx=object.x;
       ghosty.actionToDo=action;
     },
     think:function(thinkarr){
       t=Math.floor(Math.random()*thinkarr.length)
       sounds.hmmSound.play();
       ghosty.thinkTime=5;
       ghosty.thinking=thinkarr[t];
     }
   }

   ghosty.img.src="res/models/ghosty/ghostyFrontRight.png";
   //States of menu:
   //nd : not deployed
   //w : waiting
   var menuState = "nd";

   //menu position
   var menuPos = {x:0,y:0}



   // MAIN LOOP //
   var mainLoop = function(currentTime){

     delta = timer(currentTime);

     paintBackground();
     paintHouse();
     paintObjects();
     paintLight();
     checkFocus();
     checkClick();
     checkGhosty();
     paintGhosty();
     checkDMenu();

     requestAnimationFrame(mainLoop);

   }


   // Get delta //
   function timer(currentTime) {
    var delta = currentTime - oldTime;
    oldTime = currentTime;
    return delta;

    }

    function circleCollide(x1, y1, r1, x2, y2, r2) {
      var dx = x1 - x2;
      var dy = y1 - y2;
      return ((dx * dx + dy * dy) < (r1 + r2)*(r1+r2));
    }


    // Collisions between rectangle and circle
     function circRectsOverlap(x0, y0, w0, h0, cx, cy, r) {
         var testX=cx;
         var testY=cy;

         if (testX < x0) testX=x0;
         if (testX > (x0+w0)) testX=(x0+w0);
         if (testY < y0) testY=y0;
         if (testY > (y0+h0)) testY=(y0+h0);

         return (((cx-testX)*(cx-testX)+(cy-testY)*(cy-testY))<r*r);
     }


    function checkGhosty(){
        if(ghosty.thinkTime>0){
          ghosty.thinkTime-=(1*delta)/1000;
          console.log(ghosty.thinkTime);
        }
        if(ghosty.move==true){
          if(ghosty.directionx<ghosty.x){
            if(ghosty.directionx>ghosty.x-(ghosty.speed*delta/1000)){
              ghosty.img.src="res/models/ghosty/ghostyBackLeft.png";
              move=false
              ghosty.actionToDo();
              ghosty.actionToDo=function(){};
              //actionFocused=-1;
            }
            else{
              ghosty.x-=ghosty.speed*delta/1000
            }
          }
          else if(ghosty.directionx>ghosty.x){
            if(ghosty.directionx<ghosty.x+(ghosty.speed*delta/1000)){
              ghosty.img.src="res/models/ghosty/ghostyBackRight.png";
              move=false
              ghosty.actionToDo();
              ghosty.actionToDo=function(){};
              //actionFocused=-1;
            }
            else{
              ghosty.x+=ghosty.speed*delta/1000
            }
          }

        }
    }


    function paintGhosty(){
      ctx.save();

       ctx.shadowColor = 'white';
       ctx.shadowBlur = 10;
       ctx.filter = 'opacity(0.7) ';
       ctx.translate(ghosty.x ,ghosty.y );
       ctx.drawImage(ghosty.img,0,0);
      ctx.restore();
      if(ghosty.thinkTime>0){
          ctx.save();
            ctx.translate(ghosty.x ,ghosty.y );
            ctx.font="11px Arial";
            ctx.fillStyle="#000000";
            ctx.filter = 'opacity('+ghosty.thinkTime/2+') ';
            ctx.beginPath();
            ctx.fillRect(-160,-32,350,16);
            ctx.fillStyle="#FFFFFF";
            ctx.fillText(ghosty.thinking,-150,-20 );
          ctx.restore();

      }
    }

    function sound(src,loop) {
      this.sound = document.createElement("audio");
      this.sound.src = src;
      this.sound.setAttribute("preload", "auto");
      this.sound.setAttribute("controls", "none");
      this.sound.style.display = "none";

      if(loop==true){
        this.sound.setAttribute("loop", "true");
      }
      document.body.appendChild(this.sound);
      this.play = function(){
          this.sound.play();
      }
      this.stop = function(){
          this.sound.pause();
      }
    }

    function checkFocus(){

      if(menuState=="w"){
          var count=0;
          var founded=0;
         for (var c in objects[menufocused].actions) {
           if(circRectsOverlap(menuPos.x+20,objects[menufocused].actionsMenuPosy[c]+15, 170, 30,inputStates.mousePos.x, inputStates.mousePos.y, 1)){

             objects[menufocused].actionsMenuFocused[c]=1;
             actionFocused=count;
             founded = 1;
           }
           else{
             objects[menufocused].actionsMenuFocused[c]=0;
             if(founded==0){
               actionFocused=-1;
             }

           }
           count=count+1;
         }
         if(founded == 1){
           if(someFocused!=-1){
             objects[someFocused].focused=0;
           }
           someFocused =-1;
           return ;
         }
      }

      for (var o in objects) {
       for (var c in objects[o].colidersx) {
        if(circleCollide(inputStates.mousePos.x, inputStates.mousePos.y, 1,objects[o].colidersx[c],objects[o].colidersy[c],objects[o].rColiders) ){
          objects[o].focused=1;
          someFocused = o;
          drawName(inputStates.mousePos.x,inputStates.mousePos.y);
          return;
        }
        else{
          objects[o].focused=0;
          someFocused =-1;
        }
       }
      }

    }

  function checkClick(){
    if (inputStates.mousedown) {
            // ctx.fillText("mousedown b" + inputStates.mouseButton, 5, 180);
            // monster.speed = 5;
            if(inputStates.mouseButton==2){

              menuState = "nd";
              return
            }
            if(inputStates.mouseButton==0){
              //console.log(actionFocused);
              if(someFocused != -1){
                //if(menuState=="nd"){
                  menuPos.x=inputStates.mousePos.x;
                  menuPos.y=inputStates.mousePos.y;
                  menuState = "w";
                  menufocused = someFocused;
                  drawMenu(someFocused);
                //}

              }

              else if (actionFocused != -1 && menuState=="w" && objects[menufocused].typeAction[actionFocused]=="nnm") {

                //console.log("e");
                objects[menufocused].actionfunc[actionFocused]();
                menuState="nd";
                actionFocused=-1;
              }
              else if (actionFocused != -1 && menuState=="w" && objects[menufocused].typeAction[actionFocused]=="nm") {

                //console.log("e");
                //objects[menufocused].actionfunc[actionFocused]();
                if(objects[menufocused].x<ghosty.x){ghosty.img.src="res/models/ghosty/ghostyFrontLeft.png";}
                else{ghosty.img.src="res/models/ghosty/ghostyFrontRight.png";}
                ghosty.goTo(objects[menufocused],objects[menufocused].actionfunc[actionFocused]);
                menuState="nd";
                actionFocused=-1;
              }
            }
        }
  }

  function drawName(x,y){
    ctx.save();
      ctx.font="11px Arial";
      ctx.fillStyle="#000000";
      ctx.filter = 'opacity(0.5) ';
      ctx.beginPath();
      ctx.fillRect(x-25,y-20,40,13);
      ctx.fillStyle="#FFFFFF";
      ctx.fillText(objects[someFocused].objectName,x-20,y-10  );
    ctx.restore();
  }
  function drawMenu(objectF){
    if(objectF!=-1){
      var count=0;
      var ha = 30;
      for (var a in objects[objectF].actions) {
        ctx.save();
          //ctx.strokeStyle="#FFFFFF";

          ctx.translate(menuPos.x,menuPos.y+(ha*count));
          if(objects[objectF].actionsMenuFocused[a]==0){
            ctx.filter = 'opacity(0.5) ';
          }
          ctx.fillStyle="#000000";
          ctx.beginPath();
          ctx.fillRect(20,15, 170, 30);
          //console.log(30*count);
          ctx.beginPath();
          ctx.fillStyle="#FFFFFF";
          ctx.fillText(objects[objectF].actions[a], 25, 35);


        ctx.restore();
        count=count+1;
      }

    }
  }

    function checkDMenu(){
      if(menuState=="w"){
        drawMenu(menufocused);
        var count=0;
         for (var a in objects[menufocused].actions) {
             objects[menufocused].actionsMenuPosy[a]=menuPos.y+(30*count);
             count=count+1;
         }
      }
    }


    function paintObjects(){
      for (var o in objects) {
        ctx.save();
          ctx.translate(objects[o].x,objects[o].y);
          if(objects[o].focused==1){
            ctx.shadowColor = 'white';
            ctx.shadowBlur = 3;
          }
          else{
            ctx.shadowColor = 'black';
            ctx.shadowBlur = 3;
          }

          ctx.drawImage(objects[o].img,0,0);
        ctx.restore();
        // ctx.save();
        //   ctx.translate(objects[o].colidersx[0],objects[o].colidersy[0]);
        //   ctx.rect(-36,-36, 38*2, 38*2);
        //   ctx.fill();
        // ctx.restore();
      }
    }

    function paintLight(){
      if(lightOn==1){
        ctx.save();

          ctx.translate(poshx ,poshy );
          ctx.rotate(45*Math.PI/180);
          ctx.scale(1.5+(Math.random()*0.1),1.5+(Math.random()*0.1));
          //ctx.filter = 'opacity('+((Math.random()*0.1)+0.2 )+') blur(15px)';
          ctx.filter = 'opacity(0.3) blur(15px)';
          var grd=ctx.createRadialGradient(15,50,5,30,50,150);
          grd.addColorStop(0,"#F9E79F");
          grd.addColorStop(1,"rgba(255, 165, 0, 0)");
          ctx.fillStyle = grd;
          ctx.beginPath();
          ctx.rect(0, 0, 300, 300);
          ctx.fill();

        ctx.restore();
      }

    }

    function paintHouse(){
      ctx.save();
        ctx.shadowColor = 'black';
        ctx.shadowBlur = 3;
       ctx.translate(poshx-40  ,poshy );
       ctx.drawImage(houseModel,-200,0);
      ctx.restore();
    }

    // clearCanvas //
   function paintBackground(){
     ctx.save();

      ctx.font="11px Arial";
      ctx.fillStyle="#FFFFFF";
      ctx.fillText("Music by Myuu",10,h-20 );
       ctx.filter = 'opacity(0.6) blur(10px)';

      //  ctx.filter = 'opacity(0.6)';
      //  grd=ctx.createRadialGradient(75,50,5,90,60,100);
      //  grd.addColorStop(0,"#002242");
      //  grd.addColorStop(1,"#00001A");
      //  ctx.fillStyle = grd;
      //  ctx.filter = 'opacity(0.8)';
      //  ctx.rect(0, 0, w, h);
      //  ctx.fill();


      // ctx.font="11px Arial";
      // ctx.fillStyle="#000000";
      // ctx.filter = 'opacity('+ghosty.thinkTime/2+') ';
      // ctx.beginPath();
      // ctx.fillRect(-160,-32,350,16);
      // ctx.fillStyle="#FFFFFF";
      // ctx.fillText(ghosty.thinking,-150,-20 );


       ctx.fillStyle = backgroundPattern;
       ctx.rect(0, 0, w, h);
       ctx.fill();
     ctx.restore();
     updateRainPosition();
     paintRain();
   }

   function updateRainPosition(){
     for (var r in rainDrop){

         rainDrop[r].y += (rainDrop[r].speed * delta) / 1000;
         if(rainDrop[r].y>=h){
           rainDrop[r].y=0;
           rainDrop[r].x=Math.floor(Math.random()*w);
         }
       }
   }

   function paintRain() {
     ctx.save();
     ctx.translate(100  ,-h*0.4);
      ctx.rotate(10*Math.PI/180);
      ctx.scale(1.4,1.4);

      //ctx.shadowColor = 'white';
      //ctx.shadowBlur = 10;

      ctx.strokeStyle="#FFFFFF";
      for (var r in rainDrop) {
        ctx.beginPath();
        ctx.moveTo(rainDrop[r].x,rainDrop[r].y);
        ctx.lineTo(rainDrop[r].x,rainDrop[r].y+3);
        ctx.stroke();
      }
     ctx.restore();
   }

   function getMousePos(evt) {
        // necessary to take into account CSS boudaries
        var rect = canvas.getBoundingClientRect();
        return {
            x: evt.clientX - rect.left,
            y: evt.clientY - rect.top
        };
    }

   var start = function(){

      canvas = document.querySelector("#myCanvas");
      canvas.oncontextmenu = function (e) {
        e.preventDefault();
      };
      w = window.innerWidth-(window.innerWidth*0.01);
      h = window.innerHeight-(window.innerHeight*0.035 );
      poshx=w/2+10;poshy=h/2-220;
      canvas.width = w;
      canvas.height = h;
      ctx = canvas.getContext('2d');
      ctx.font="20px Arial";
      img = new Image();
      houseModel = new Image();

      img.src = "res/patterns/darkblu.png";
      houseModel.src = "res/models/house.png";
      img.onload = function(){
        backgroundPattern = ctx.createPattern(img, 'repeat');
      }

      ghosty.x=poshx;
      ghosty.y=poshy+190;


      bed = {
        objectName:"bed",
        x:poshx-50,
        y:poshy+120,
        img:new Image(),
        w:147,
        h:136,
        colidersx:[poshx,poshx+50],
        colidersy:[poshy+160,poshy+190],
        actionsMenuPosy:[],
        actionsMenuFocused:[0,0],
        rColiders:147/4,
        actions:["watch","go to"],
        actionfunc:[function(){

              t=[
              "You have to work eight hours and sleep eight hours, but not the same.",
              "A real love is like sleeping and being awake.",
              "In the cool I settle and sleep.",
              "The great thing about sleeping is that everyone is finally alone",
              "I'm Always alone"]
              ghosty.think(t);

        },function(){
        }],
        typeAction:["nnm","nm"],
        focused:0
      }
      bed.img.src="res/models/bed.png";


      radio = {
        objectName:"radio",
        x:poshx-150,
        y:poshy+190,
        img:new Image(),
        w:147,
        h:136,
        colidersx:[poshx-120],
        colidersy:[poshy+200],
        actionsMenuPosy:[],
        actionsMenuFocused:[0,0],
        rColiders:10,
        on:1,
        actions:["watch","turn on/off"],
        actionfunc:[function(){
          t=[
          "The radio marks the minutes of life.",
          "I like music.",
          "Let's dance"]
          ghosty.think(t);
        },
        function(){

            sounds.switchSound.play()
            if(objects[2].on==1){
              sounds.willHe.play();
              objects[2].on=0;
            }
            else{
              sounds.willHe.stop();
              objects[2].on=1;
            }


        }],
        typeAction:["nnm","nm"],
        focused:0
      }
      radio.img.src="res/models/radio.png";


      picture = {
        objectName:"picture",
        x:poshx+140,
        y:poshy+130,
        img:new Image(),
        w:147,
        h:136,
        colidersx:[poshx+160],
        colidersy:[poshy+150],
        actionsMenuPosy:[],
        actionsMenuFocused:[0,0],
        rColiders:20,
        actions:["watch","contemplate"],
        actionfunc:[function(){
          t=[
          "my grandmother gave them to me.",
          "There's not much to say, it's just three paintings",
          "Bahh."]
          ghosty.think(t);


        },function(){
          t=[
          "Well, it's a good artistic work.",
          "It is not too bad.",]
          ghosty.think(t);

        }],
        typeAction:["nnm","nm"],
        focused:0
      }
      picture.img.src="res/models/picture.png";

      lightOb = {
        objectName:"light",
        x:poshx-10,
        y:poshy-140,
        img:new Image(),
        w:38,
        h:212,
        colidersx:[poshx],
        colidersy:[poshy+30],
        actionsMenuPosy:[],
        actionsMenuFocused:[0,0],
        actions:["watch","turn off/on"],
        actionfunc:[

          function (){
              t=["Cool.",
              "You can not be light to yourself; You can not, you can not.",
              "I am shining the light of those who do not breathe.",
              "The colors depend on the light that is seen.",
              "Turning off a light dazzles me more than turning it on.",
              "Freedom comes from the light inside those who are born with it on."]
              ghosty.think(t);
          }

          ,function (){
            lightOn=lightOn*-1;
            if(lightOn==1){
              lightOb.img.src="res/models/lightOn.png";
              sounds.switchSound.play();
            }
            else{
              lightOb.img.src="res/models/lightOff.png";
              sounds.switchSound.play();
            }
          }

        ],
        // there are diferent type of actions :
        // nnm = no need to move
        // nm = need to move to
        typeAction:["nnm","nnm"],
        rColiders:19,
        focused:0
      }
      lightOb.img.src="res/models/lightOn.png";


      objects.push(bed);
      objects.push(lightOb);
      objects.push(radio);
      objects.push(picture);

      sounds.switchSound=new sound("res/sounds/switch.wav",false);
      sounds.hmmSound=new sound("res/sounds/hmm.wav",false);
      sounds.willHe=new sound("res/sounds/music/myuu.mp3",true);
      sounds.rain=new sound("res/sounds/rain.wav",true);

      sounds.rain.play();

      inputStates.mousePos={};
      inputStates.mousePos.x=0;
      inputStates.mousePos.y=0;

      canvas.addEventListener('mousemove', function (evt) {
          inputStates.mousePos = getMousePos(evt);
      }, false);

      canvas.addEventListener('mousedown', function (evt) {
            inputStates.mousedown = true;
            inputStates.mouseButton = evt.button;
      }, false);

      canvas.addEventListener('mouseup', function (evt) {
          inputStates.mousedown = false;
      }, false);

      for(var i = 0; i < numberDrops; i++) {
        //xarray[i]=Math.floor((Math.random() * height) + 0);
        var r={
          x:Math.floor(Math.random()*w),
          y:Math.floor(Math.random()*h),
          speed:Math.floor(Math.random()*800)+350
        };
        rainDrop.push(r);
      }
      requestAnimationFrame(mainLoop);





    }

   //our GameFramework returns a public API visible from outside its scope
    return {
        start: start
    };
}
