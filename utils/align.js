export default class Align
{
	static scaleToGameW(game, obj,per)
	{
		obj.displayWidth=game.config.width*per;
		obj.scaleY=obj.scaleX;
	}
	static centerH(game, obj)
	{
		obj.x = game.config.width/2-obj.displayWidth/2;
	}
	static centerV(game, obj)
	{
		obj.y = game.config.height/2-obj.displayHeight/2;
	}
	static center2(game,obj)
	{
		obj.x = game.config.width/2-obj.displayWidth/2;
	}
	static center4(game, obj) {
		obj.x = game.config.width / 4 - obj.displayWidth / 4;
	}
	static center5(game, obj) {
		obj.x = game.config.width / 5 - obj.displayWidth / 5;
	}
	static center6(game, obj) {
		obj.x = game.config.width / 6 - obj.displayWidth / 6;
	}
	static center(game,obj)
	{
		obj.x = game.config.width/2;
		obj.y = game.config.height/2;
	}
	static centerW(game, obj) {
		obj.x = game.config.width / 2;
	}
}