
function Animal(sx,sy,sname) {
	this.x = sx;
	this.y = sy;
	this.name = sname;
	this.R = 255*Math.random();
	this.G = 255*Math.random();
	this.B = 255*Math.random();
	
	do {
		this.dx = -1 + (3*Math.random()^0);
		this.dy = -1 + (3*Math.random()^0);
	} while ( this.dx==0 && this.dy==0 );	
}

var World = {
	l:640,
	h:480,
	list: [], //список действующих лиц
	map: [], //карта размером l*h

	
	mapset: function(b,x,y) { this.map[y*this.l+x]= b; }, // можно ещё проверку выходов за пределы сделать
	mapget: function(x,y) { return this.map[y*this.l+x]; }, // можно ещё возвращать что-то при выходе за пределы
	
	Draw: function() {  return false; }, // слот для функции анимации мира
	
	Act: function() 
	{	var b;
		for (var i = 0; i < World.list.length; i++)
		{	b = World.list[i]; // b может быть и undefined, потому лучше перестраховаться:
			if(b) b.Act1();
		};
		this.t++;
	},
	
	t: 0 //номер итерации
}

World.Create = function(sl,sh,scount)
{
	this.l = sl;
	this.h = sh;
	var sx,sy;
	
	var Empty = new Animal(0,0,"Empty");
	Empty.R = 0; Empty.G = 0; Empty.B = 255;
	// интересно, что начальное заполнение массива сильно повышает производительность:
	for(var yp=0; yp<sh; yp++) for(var xp=0; xp<sl; xp++) World.map[yp*sl+xp]=Empty;
	World.Empty = Empty;
	
	for (var i = 0; i < scount; i++) {
		sx = sl*Math.random()^0; // xor 0 эквивалентен округлению
		sy = sh*Math.random()^0; // xor 0 эквивалентен округлению
		var b = new Animal(sx,sy, "Num"+i.toString());
		this.list.push(b);
		this.map[sy*this.l + sx] = b;
	}
}

Animal.prototype.Act = function()
{
	var dx = -1 + (3*Math.random()^0);
	var dy = -1 + (3*Math.random()^0);
	
	var nx = this.x + dx;
	var ny = this.y + dy;
	World.map[this.y*World.l + this.x] = World.Empty; //undefined;
	if((nx>0)||(nx<World.l)) this.x = nx;
	if((ny>0)||(ny<World.h)) this.y = ny;
	World.map[this.y*World.l + this.x] = this;
}

Animal.prototype.Act1 = function()
{
	var nx = this.x + this.dx;
	var ny = this.y + this.dy;
	
	var rb = World.mapget(nx,ny);
	
	if((nx<0)||(nx>World.l)||(ny<0)||(ny>World.h)||(rb!=World.Empty))
	{	if(Math.random()>0.05)
		{ 	if(this.R>128) 	{ this.dx=-1; this.dy = 0; } else
			if(this.G>128) 	{ this.dx=1; this.dy = 0; } else
			if(this.B>128) 	{ this.dx=0; this.dy = -1; } else
							{ this.dx=0; this.dy = 1; }
		} else
		do {
			this.dx = -1 + (3*Math.random()^0);
			this.dy = -1 + (3*Math.random()^0);
		} while ( this.dx==0 && this.dy==0 );
		return;
	}

	World.map[this.y*World.l + this.x] = World.Empty; //undefined;
	this.x = nx;
	this.y = ny;
	World.map[this.y*World.l + this.x] = this;
}

function drawTraect()
{
	World.list.forEach(function(b){
		var j = (b.y * p_width + b.x) * 4;
		pixels.data[j + 0] = b.R;
		pixels.data[j + 1] = b.G;
		pixels.data[j + 2] = b.B;
		pixels.data[j + 3] = 255;
	} );
	
	cc.putImageData(pixels, 0, 0);
};

function drawMap()
{
	for(var yp=0; yp<p_height; yp++)
	for(var xp=0; xp<p_width; xp++)
	{	var j = (yp * p_width + xp) * 4;

		var b = World.map[yp*World.l + xp] || World.Empty;
		if(b)
		{	pixels.data[j + 0] = b.R;
			pixels.data[j + 1] = b.G;
			pixels.data[j + 2] = b.B;
			pixels.data[j + 3] = 255;
		};
	};
	
	cc.putImageData(pixels, 0, 0);
};


var timer;
var p_st;

function onTimer()
{
//if((World.t%10)==0)
if(true)
{
	var perf = "?";
	if(performance.now) // не работает в iron-хроме
	if(World.t==0) p_st = performance.now()/1000;
		else { var p = performance.now()/1000;
				perf = World.t/(p - p_st);
			};
	infopanel.innerHTML = "t: " + World.t+ " p:" + perf + " it/sec";
};			
	World.Act();
	
	//if((World.t%10)==0)
	World.Draw();
	
	timer = setTimeout(onTimer, 0);
}

var tmOn = 0;
function doTimerTrigger()
{
  tmOn = !tmOn;
  var bt = document.getElementById("ButtonTimer");
  if(tmOn) bt.innerHTML = "Выкл.таймер";
      else bt.innerHTML = "Вкл.таймер";
      
  if(tmOn) timer = setTimeout(onTimer, 100);
  else clearTimeout(timer); // Остановить таймер (если запущен)
}


var cc; // CanvasContext
var pixels;
var p_width, p_height;
var infopanel; // параграф информации

var dx=0, dy=0; //глобальные переменные для движения по стрелкам клавиатуры
var isKey = { up:false, down:false, left:false, right:false, z:false, x:false }

function processKeyDown(e) {
	dx = 0; dy = 0;
	if (e.keyCode == 38) { dy = -1; isKey.up = true; };
	if (e.keyCode == 40) { dy = 1; isKey.down = true; }
	if (e.keyCode == 37) { dx = -1; isKey.left = true; }
	if (e.keyCode == 39) { dx = 1; isKey.right = true; }
};

function processKeyUp(e) {
	//dx = 0; dy = 0;
	if (e.keyCode == 38) {  isKey.up = false; };
	if (e.keyCode == 40) {  isKey.down = false; }
	if (e.keyCode == 37) {  isKey.left = false; }
	if (e.keyCode == 39) {  isKey.right = false; }
};

function onLoadMy()
{
	/*загрузка параметров командной строки:
	var urlParams = parseParamsFromUrl();
	var txt = "";
	for(var key in urlParams) 
		txt+=key+"="+urlParams[key]+"\r\n";   
	document.all.mycode.value=txt;
	*/

	//глобальная переменная для удобства обращения с канвой:
	var b_canvas = document.getElementById("canv");
	var b_context = b_canvas.getContext("2d");
	cc = b_context;

	p_width = cc.canvas.width;
	p_height = cc.canvas.height;
	pixels = cc.createImageData(p_width, p_height);
	
	cc.fillText("Hello World!", 100, 100);

	infopanel = document.getElementById("infopanel"); 

	//нажатия клавиш отследим глобально:
	window.onkeydown = processKeyDown;
	window.onkeyup = processKeyUp;  
	
	//timer = setTimeout("drawFrame()", 100);
	World.Draw = drawTraect;
	World.Draw = drawMap;
	World.Create(640,480,100000);
	
	document.getElementById("ButtonTimer").onclick = doTimerTrigger;
};

window.onload = onLoadMy; //при таком подходе html-код полностью очищается от скриптов, т.е. представление отделяется от логики