/* Notes:
   Suppose we use the right-hand axis, main camera(0,0,0)

  (1) spherical coord(r, θ, φ)
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

      object pos: [ax, ay, az]
      camera pos: [cx, cy, cz]

      vew matrix:
      [ux, uy, uz, -cxux - cyuy - czuz]
      [vx, vy, vz, -cxvx - cyvy - czvz]
      [Wx, wy, wz, -cxwx - cywy - czwz]
      [0,  0,  0,  1                  ]

  それ以上！let's开始敲码！
*/

// --------- constants & globals -----------
var RADIUS = 2000,
    CAMERA_LEN = 500,
    CAMERA_SIZE = 600,
    CAM_SENS = Math.PI / 2000,
    CAM_ZOOM_SPEED = 0.5;
    MAX_CAM_DIST = 800,
    STAR_SIZE = 4;
var canvas, context, camera;
var lastPos = {};
var isDrag = false;
var starList = [];


// -------- 强行3D库wwww ----------
function Matrix() {};
Matrix.prototype = {
    constructor : Matrix,
    Multiply : function(m1, m2) {
        var m = [[],[],[],[]];
        for (var i=0; i<4; i++) {
            for (var j=0; j<4; j++) {
                m[i][j] = 0;
                for (var k=0; k<4; k++) {
                    m[i][j] += m1[i][k] * m2[k][j];
                }
            }
        }
        return m;
    },
    RotateAround : function(axis, angle) {
        var x = axis.x, y = axis.y, z = axis.z, c = Math.cos(angle), s = Math.sin(angle);
        return [
            [c+x*x*(1-c), x*y*(1-c)-z*s, x*z*(1-c)+y*s, 0],
            [y*x*(1-c)+z*s, c+y*y*(1-c), y*z*(1-c)-x*s, 0],
            [z*x*(1-c)-y*s, z*y*(1-c)+x*s, c+z*z*(1-c),0],
            [0,0,0,1]
        ];
    }
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
    },
    transform : function(m) {
        var x = this.x * m[0][0] + this.y * m[0][1] + this.z * m[0][2] + m[0][3];
        var y = this.x * m[1][0] + this.y * m[1][1] + this.z * m[1][2] + m[1][3];
        var z = this.x * m[2][0] + this.y * m[2][1] + this.z * m[2][2] + m[2][3];
        return new Vector3(x, y, z);
    },
    dot : function(other) {
        return (this.x * other.x + this.y * other.y + this.z * other.z);
    },
    cross : function(other) {
        return new Vector3(this.y * other.z - this.z * other.y, this.z * other.x - this.x * other.z, this.x * other.y - this.y * other.x);
    }
}

function Camera(pos, len, w, h) {
    this.position = pos.clone();
    this.right = new Vector3(1,0,0);
    this.up = new Vector3(0,1,0);
    this.forward = new Vector3(0,0,1);
    this.len = len;
    this.dist = 0;
    this.width = w;
    this.height = h;
}
Camera.prototype = {
    constructor : Camera,
    WorldToCamera : function(pos) {
        var u = this.right, v = this.up, w = this.forward,
            c = new Vector3(
                -this.dist * this.forward.x,
                -this.dist * this.forward.y,
                 -this.dist * this.forward.z
             );
        var matrix = [
            [u.x, u.y, u.z, -c.x * u.x - c.y * u.y - c.z * u.z],
            [v.x, v.y, v.z, -c.x * v.x - c.y * v.y - c.z * v.z],
            [w.x, w.y, w.z, -c.x * w.x - c.y * w.y - c.z * w.z],
            [  0,   0,   0,                                  1],
        ];
        return pos.transform(matrix);
    },
    WorldToScreen : function(pos) {
        var camPos = this.WorldToCamera(pos);
        var x = this.len * camPos.x / camPos.z;
        var y = this.len * camPos.y / camPos.z;
        x = (x + this.width / 2) / this.width;
        y = (y + this.height / 2) / this.height;
        return new Vector3(x, y, camPos.z);
    },
    rotate : function(axis, angle) {
        // var matrix = new Matrix().RotateAround(axis, angle);
        var matrix = new Matrix().RotateAround(axis, angle);
        this.right = this.right.transform(matrix);
        this.up = this.up.transform(matrix);
        this.forward = this.forward.transform(matrix);
    }
}

// ------ 喵物理学家库 -------
function Ra(h, m, s) {
    return (h + m/60 + s/3600) * 15 * Math.PI / 180;
}

function Dec(d, m, s) {
    return (90 - (d + m/60 + s/3600)) * Math.PI / 180;
}

function coord3d(ra, dec, dist) {
    return new Vector3(
        dist * Math.sin(dec) * Math.cos(ra),
        dist * Math.sin(dec) * Math.sin(ra),
        dist * Math.cos(dec)
    );
}

// ---------- 天体相关 ------------

function Star(cons, name, vmeg, ameg, ra, dec, dist) {
    this.belongTo = cons;
    this.name = name;
    this.position = coord3d(ra, dec, dist/10);
    this.vmeg = vmeg;
    this.ameg = ameg;
    this.distance = dist;
}

function initStars() {
    function addStar(cons, star) {
        var ra = Ra(star.ra[0], star.ra[1], star.ra[2]);
        var dec = Dec(star.dec[0], star.dec[1], star.dec[2]);
        starList.push(new Star(cons, star.name, star.vmeg, star.ameg, ra, dec, star.dist));
    }
    for (var i in stardata) {
        for (var j in stardata[i])
            addStar(i, stardata[i][j]);
    }
}

function drawStar(star) {
    var scrPos = camera.WorldToScreen(star.position);
    if (scrPos.z <= 0 || scrPos.x < 0 || scrPos.x > 1 || scrPos.y < 0 || scrPos.y > 1) return;

    // var meg = camera.dist > 50 ? star.ameg + 8 : star.vmeg;
    var meg = star.vmeg;
    var r = STAR_SIZE - meg > 1 ? (STAR_SIZE - meg) * 1.3 : 1;

    context.fillStyle = "white";
    if (r > 1) {
        context.beginPath();
        context.arc(scrPos.x * canvas.width, scrPos.y * canvas.height, r, 0, Math.PI*2, true);
        context.closePath();
        context.fill();
    } else {
        context.fillRect(scrPos.x * canvas.width, scrPos.y * canvas.height, 1, 1);
    }
}

// -------------- 绘制相关 --------------------

function setupCanvas() {
    // init canvas
    canvas = document.getElementById("canvas");
    // init context
    context = canvas.getContext("2d");
    // init camera
    camera = new Camera(new Vector3(0,0,-30), CAMERA_LEN, CAMERA_SIZE, CAMERA_SIZE * canvas.height / canvas.width);

    // events
    canvas.addEventListener("mousedown", function(event){
        lastPos.x = event.clientX;
        lastPos.y = event.clientY;
        isDrag = true;
    });

    // mouse wheel event -> this part is tricky
    var mousewheelevt=(/Firefox/i.test(navigator.userAgent))? "DOMMouseScroll" : "mousewheel" //FF doesn't recognize mousewheel as of FF3.x

    if (document.attachEvent) //if IE (and Opera depending on user setting)
        document.attachEvent("on" + mousewheelevt, cameraZoom)
    else if (document.addEventListener) //WC3 browsers
        document.addEventListener(mousewheelevt, cameraZoom, false)

    canvas.addEventListener("mousewheel", function(event){
        cameraZoom(event.detail);
    });
    window.addEventListener("mouseup", function(event){ isDrag = false;});
    window.addEventListener("mousemove", function(event){ moveCamera(event);});

    initStars();
    resetCanvas();
}

function resetCanvas() {
    canvas.width = canvas.parentNode.offsetWidth;
    canvas.height = canvas.parentNode.offsetHeight;
    camera.width = CAMERA_SIZE;
    camera.height = CAMERA_SIZE * canvas.height / canvas.width;
    update();
}

function moveCamera(event) {
    if (isDrag) {
        var dx = event.clientX - lastPos.x;
        var dy = event.clientY - lastPos.y;
        lastPos.x = event.clientX;
        lastPos.y = event.clientY;
        camera.rotate(camera.up, dx * CAM_SENS);
        camera.rotate(camera.right, -dy * CAM_SENS);
    }
}

function cameraZoom(event){
    var evt = window.event || e //equalize event object
    var delta = evt.detail? evt.detail*(-120) : evt.wheelDelta;
    camera.dist -= delta * CAM_ZOOM_SPEED;
    if (camera.dist < 0)
        camera.dist = 0;
    if (camera.dist > MAX_CAM_DIST)
        camera.dist = MAX_CAM_DIST;
}
function update() {
    context.fillStyle = "#111122";
    context.fillRect(0,0,canvas.width,canvas.height);

    for (var i in starList) {
        drawStar(starList[i]);
    }

    window.requestAnimationFrame(update);
}
