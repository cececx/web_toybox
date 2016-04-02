/* Notes:
   Suppose we use the right-hand axis, main camera(0,0,0)

  (1) spherical coor(r, θ, φ)
      θ[0,π]: 和Z轴夹角, φ[0,2π]: 平面上和x轴夹角
      x = r * sinθ * cosφ
      y = r * sinθ * sinφ
      z = r * cosθ

  (2) 妈呀这个问题的分类是fundamental astronomy...2333
      Right ascension: (h + m/60 + s/3600) * 15
      Declination: 90 - (d + m/60 + s/3600)

  (3) Math.sin(Math.PI)

  (4) Quaternion早不啃下来书到用时方恨少2333
      Definition:
      x = RotationAxis.x * sin(RotationAngle / 2)
      y = RotationAxis.y * sin(RotationAngle / 2)
      z = RotationAxis.z * sin(RotationAngle / 2)
      w = cos(RotationAngle / 2)

      unit Quaternion: (0,0,0,1)

      * use euler angles if ur writing plugins for artists (intuitive)
      * use quaternion for 3d engine core (handy & faster)

  (5) Rotation
      http://inside.mines.edu/fs_home/gmurray/ArbitraryAxisRotation/
      For this program we only need to rotate around z-axis & y-axis
      Ry = [cosA   0  sinA 0]
           [  0    1   0   0]
           [-sinA  0  cosA 0]
           [   0   0   0   1]

      Rz = [cosB -sinB  0  0]
           [sinB  cosB  0  0]
           [  0    0    1  0]
           [  0    0    0  1]   _(:3TZ)_回到了故乡

      so--> (手残少女一定计算错 (do it just do it
      x = cosAcosB * x - cosBsinB * y + sinA * z
      y = sinB * x + cosB * y
      z = -sinAsinB * x + sinAsinB * y + cosA * z

  (6) それ以上！lets开始敲码！
*/

// --------- constants & globals -----------
var canvas;
var RADIUS = 5;
var starList = [];

// ------ calculate functions -------
function ra(h, m, s) {
    return (h + m/60 + s/3600) * 15 * Math.PI / 180;
}

function dec(d, m, s) {
    return (90 - (d + m/60 + s/3600)) * Math.PI / 180;
}

function coord3d(ra, dec) {
    var x = r * sinθ * cosφ;
    var y = r * sinθ * sinφ;
    var z = r * cosθ;
    return [
        RADIUS * Math.sin(dec) * Math.cos(ra),
        RADIUS * Math.sin(dec) * Math.sin(ra),
        RADIUS * Math.cos(dec)
    ];
}

// -------- 强行3D库wwww ----------
function Vector3(x, y, z) {
    this.x = x;
    this.y = y;
    this.z = z;
}

function Star(mag, ra, dec) {
    var v3 = coord3d(ra, dec);
    this.position = new (v3[0], v3[1], v3[2]);
    this.magnitude = mag;
}

function setupCanvas() {
    canvas = document.getElementById("canvas");
    canvas.width = window.innerWidth - 360;
    canvas.height = window.innerHeight;
    var context = canvas.getContext("2d");

    context.fillStyle = "#111122";
    context.fillRect(0,0,canvas,500);
}

function onDraw() {

}
