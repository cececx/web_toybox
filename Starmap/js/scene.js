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

  (6) Camera projection
      world coords -> cam coords -> film coords -> pixel coords

      1. world to cam:
      [X]   [cos(-A)cos(-B), -cos(-B)sin(-B), sin(-A)]   [U - Cx]
      [Y] = [sin(-B),         cos(-B),        0      ] X [V - Cy]
      [Z]   [-sin(-A)sin(-B), sin(-A)sin(-B), cos(-A)]   [W - Cz]

      化简：
      X = cosy ( sinz * dy + cosz * dx ) - siny * dz;
      Y = sinx ( cosy * dz + siny * (sinz * dy + cosz * dx)) + cosx * (cosz * dy - sinz * dx)
      Z = cosx ( cosy * dz + siny * (sinz * dy + cosz * dx)) - sinx * (cosz * dy - sinz * dx)
      你玩儿得很开心嘛少女？

      2. cam to screen
      [x, y] = [f * X / Z, f * Y / Z]

  それ以上！lets开始敲码！
*/

// --------- constants & globals -----------
var RADIUS = 5, CAMERA_SIZE = 300, CAM_SENS = Math.PI / 100;
var canvas, context, camera;
var starList = [];

// ------ 喵物理学家库 -------
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
function rotate(pos, ry, rz) {
    var cosA = Math.cos(ry),
        sinA = Math.sin(ry),
        cosB = Math.cos(rz),
        sinB = Math.sin(rz);
    var x = cosA * cosB * pos.x - cosB * sinB * pox.y + sinA * pox.z;
    var y = sinB * pox.x + cosB * pox.y;
    var z = - sinA * sinB * pox.x + sinA * sinB * pox.y + cosA * pox.z;
}

function Vector3(x, y, z) {
    this.x = x;
    this.y = y;
    this.z = z;
}
Vector3.prototype = {
    constructor : Vector3,
    set : function(x, y, z) {
        this.x = x;
        this.y = y;
        this.z = z;
    },
    subtract: function(src, dst) {
        return new Vector3(dst.x - src.x, dst.y - src.y, dst.z - src.z);
    },
    clone : function() {
        return new Vector3(this.x, this.y, this.z);
    }
}

function Camera(pos, rot, len, w, h) {
    this.position = pos.clone();
    this.rotation = rot.clone();
    this.len = len;
    this.width = w;
    this.height = h;
}
Camera.prototype = {
    constructor : Camera,
    WorldToCamera : function(pos) {
        var dx = pos.x - this.position.x,
            dy = pos.y - this.position.y,
            dz = pos.z - this.position.z;
        var cx = Math.cos(this.rotation.x), sx = Math.sin(this.rotation.x),
            cy = Math.cos(this.rotation.y), sy = Math.sin(this.rotation.y),
            cz = Math.cos(this.rotation.z), sz = Math.sin(this.rotation.z);
        var X = cy * ( sz * dy + cz * dx ) - sy * dz;
        var Y = sx * ( cy * dz + sy * (sz * dy + cz * dx)) + cx * (cz * dy - sz * dx);
        var Z = cx * ( cy * dz + sy * (sz * dy + cz * dx)) - sx * (cz * dy - sz * dx);
        return new Vector3(X, Y, Z);
    },
    WorldToScreen : function(pos) {
        var camPos = this.WorldToCamera(pos);
        var x = this.len * camPos.z / camPos.x;
        var y = this.len * camPos.y / camPos.x;
        x = (x + this.width / 2) / this.width;
        y = (y + this.height / 2) / this.height;
        return new Vector3(x, y, camPos.x);
    }
}

function Star(mag, ra, dec) {
    var v3 = coord3d(ra, dec);
    this.position = new (v3[0], v3[1], v3[2]);
    this.magnitude = mag;
}

function addStar() {
    for (var i=0; i<5; i++) {
        for (var j=0; j<5; j++) {
            for (var k=0; k<5; k++) {
                starList.push(new Vector3((i-2)*10,(j-2)*10,(k-2)*10));
            }
        }
    }
}

function drawStar(star) {
    var scrPos = camera.WorldToScreen(star);
    if (scrPos.x <= 0) return;
    context.beginPath();
    context.fillStyle = "white";
    context.arc(scrPos.x * canvas.width, scrPos.y * canvas.height, 3, 0, Math.PI*2, true);
    context.closePath();
    context.fill();
}

function setupCanvas() {
    canvas = document.getElementById("canvas");
    canvas.addEventListener("mousedown", function(event){
        lastPos.x = event.clientX;
        lastPos.y = event.clientY;
        isDrag = true;
    });
    window.addEventListener("mouseup", function(event){
        isDrag = false;
    });
    context = canvas.getContext("2d");
    camera = new Camera(new Vector3(-40,0,0), new Vector3(0,0,0), 30, 50, 30);
    addStar();
    resetCanvas();
}

function resetCanvas() {
    canvas.width = window.innerWidth - 360;
    canvas.height = window.innerHeight;
    update();
}

var lastPos;
var isDrag = false;
function moveCamera() {
    if (isDrag) {
        canvas.ommousemove = function(event) {
            var dx = event.clientX - lastPos.x;
            var dy = event.clientY - lastPos.y;
            lastPos.x = event.clientX;
            lastPos.y = event.clientY;
            camera.rotation.y += dx * CAM_SENS;
            camera.rotation.z += dy * CAM_SENS;
            if (camera.rotation.y > Math.PI * 2)
                camera.rotation.y -= Math.PI * 2;
            if (camera.rotation.z > Math.PI * 2)
                camera.rotation.z -= Math.PI * 2;
        }
    }
}

function update() {
    context.fillStyle = "#111122";
    context.fillRect(0,0,canvas.width,canvas.height);

    // mouse move event
    if

    for (var i in starList) {
        drawStar(starList[i]);
    }

    window.requestAnimationFrame(draw);
}
