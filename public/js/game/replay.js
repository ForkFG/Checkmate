"use strict";
$(() => {

    let nick = "";
    let roomName = "";
    let User;
    let colorNick = [];
    let myColor;
    let movementUploader;
    let init = false;
    let start = false;

    let size = 20;
    const color = ['grey', 'blue', 'red', 'green', 'orange', 'pink', 'purple', 'chocolate', 'maroon'];
    let gameData;
    let playerInfo = [];
    let gm = [];
    let player = [];
    let round;
    let isThirdPerson = false;
    let halfTag = false;
    let scrollSize = 30;

    function makeBoard() {
        let m = document.getElementById("m");
        m.innerHTML = "";
        var str = "";
        str += "<tbody>";
        for (var i = 1; i <= size; ++i) {
            str += "<tr >";
            for (var j = 1; j <= size; ++j) {
                str += "<td id=\"td-" + ((i - 1) * size + j) + "\">" + String((i - 1) * size + j) + "</td>";
            }
            str += "</tr>";
        }
        str += "</tbody>";
        $(m).append(str);
        for (var i = 1; i <= size; ++i) {
            for (var j = 1; j <= size; ++j) {
                $("#td-" + String((i - 1) * size + j))[0].onclick = function () {
                    var id = Number(this.id.substr(3));
                    var ln = Math.floor((id - 1) / size) + 1, col = Number((((id % size) == 0) ? size : (id % size)));
                    if (gm[ln][col].color == myColor) {
                        makeSelect(ln, col);
                    }
                }
            }
        }
    }

    function reloadSymbol(i, j) {
        let c = "";
        if (gm[i][j].type == 1) {//crown
            if (c.indexOf("crown.png") != -1) return;
            if (!start || judgeShown(i, j))
                $("#td-" + String((i - 1) * size + j)).css('background-image', c + "url('/img/crown.png')");
        } else if (gm[i][j].type == 3) {//city
            if (c.indexOf("city.png") != -1 || c.indexOf("obstacle.png") != -1) return;
            if (!start || judgeShown(i, j))
                $("#td-" + String((i - 1) * size + j)).css('background-image', c + "url('/img/city.png')");
            else $("#td-" + String((i - 1) * size + j)).css('background-image', c + "url('/img/obstacle.png')");
        } else if (gm[i][j].type == 4) {//mountain
            if (c.indexOf("mountain.png") != -1 || c.indexOf("obstacle.png") != -1) return;
            if (!start || judgeShown(i, j))
                $("#td-" + String((i - 1) * size + j)).css('background-image', c + "url('/img/mountain.png')");
            else $("#td-" + String((i - 1) * size + j)).css('background-image', c + "url('/img/obstacle.png')");
        } else if (gm[i][j].type == 5) {//empty city
            if (c.indexOf("city.png") != -1 || c.indexOf("obstacle.png") != -1) return;
            if (!start || judgeShown(i, j))
                $("#td-" + String((i - 1) * size + j)).css('background-image', c + "url('/img/city.png')");
            else $("#td-" + String((i - 1) * size + j)).css('background-image', c + "url('/img/obstacle.png')");
        }
    }

    function addAmountCrown() {
        for (var i = 1; i <= size; ++i) {
            for (var j = 1; j <= size; ++j) {
                if (gm[i][j].type == 1) {
                    gm[i][j].amount++;
                }
            }
        }
    }
    function addAmountCity() {
        for (var i = 1; i <= size; ++i) {
            for (var j = 1; j <= size; ++j) {
                if (gm[i][j].type == 3)
                    gm[i][j].amount++;
            }
        }
    }
    function addAmountRoad() {
        for (var i = 1; i <= size; ++i) {
            for (var j = 1; j <= size; ++j) {
                if (gm[i][j].type == 2 && gm[i][j].color && gm[i][j].amount > 0)
                    gm[i][j].amount++;
            }
        }
    }

    function combineBlock(f, t, cnt) {
        if (t.color == f.color) { //same color means combine
            t.amount += cnt;
            f.amount -= cnt;
        } else { // not same color need to do delete
            t.amount -= cnt;
            f.amount -= cnt;
            if (t.amount < 0) { // t was cleared
                if (t.type == 1) { // t was player's crown and the player was killed
                    var tcolor = t.color;
                    for (var i = 1; i <= size; ++i) {
                        for (var j = 1; j <= size; ++j) {
                            if (gm[i][j].color == tcolor) {
                                gm[i][j].color = f.color;
                                if (gm[i][j].type == 1) {
                                    gm[i][j].type = 3; // to a city
                                }
                            }
                        }
                    }
                } else if (t.type == 5) { // trans to city 
                    t.type = 3;
                } else if (t.type != 3) { // trans to road
                    t.type = 2;
                }
                t.color = f.color;
                t.amount = -t.amount;
            }
        }
    }

    function illu() {
        playerInfo = [];// 12%
        let doc = document;
        for (let t1 = 1; t1 <= size; ++t1) {
            for (let t2 = 1; t2 <= size; ++t2) {
                let i = t1, j = t2;
                if (gm == 0) return;
                if (gm[i][j].color != 0) {
                    if (playerInfo[gm[i][j].color] == undefined) playerInfo[gm[i][j].color] = [0, 0, 0];
                    playerInfo[gm[i][j].color][0] += 1;
                    playerInfo[gm[i][j].color][1] += gm[i][j].amount;
                    playerInfo[gm[i][j].color][2] = gm[i][j].color;
                }
                let d = doc.getElementById("td-" + String((i - 1) * size + j));
                d.classList = "";
                d.innerHTML = (gm[i][j].amount == 0) ? " " : gm[i][j].amount;
                d.classList.add("shown");
                d.classList.add(color[gm[i][j].color]);
            }
        }
        for (let t1 = 1; t1 <= size; ++t1) {
            for (let t2 = 1; t2 <= size; ++t2) {
                reloadSymbol(t1, t2);
            }
        }
    }

    function getData(data) {
        gameData = JSON.parse(data);
        round = 0;
        player = gameData[0][0][0].player;
        gm = gameData[0];
        size = gm[0][0].size;
        makeBoard();
        illu();
    }

    getData(dat);

    function next() {
        ++round;
        if (round % 10 == 0) addAmountRoad();
        addAmountCity(), addAmountCrown();
        if (gameData[round] == undefined) return;
        else {
            for (var i in gameData[round]) {
                let mv = gameData[round][i];
                if (mv[0] == undefined) continue;
                let f = gm[mv[0]][mv[1]], t = gm[mv[2]][mv[3]];
                if (f.color == 0 || f.color != player[i].color) continue;
                combineBlock(f, t, ((mv[4] == 1) ? (Math.ceil((f.amount + 0.5) / 2)) : f.amount) - 1);
            }
        }
        illu();
    }

    setInterval(next, 250);

    $(document).ready(() => {
        //兼容性写法，该函数也是网上别人写的，不过找不到出处了，蛮好的，所有我也没有必要修改了
        //判断鼠标滚轮滚动方向
        if (window.addEventListener)//FF,火狐浏览器会识别该方法
            window.addEventListener('DOMMouseScroll', wheel, false);
        window.onmousewheel = document.onmousewheel = wheel;//W3C
        //统一处理滚轮滚动事件
        function wheel(event) {
            var delta = 0;
            if (!event) event = window.event;
            if (event.wheelDelta) {//IE、chrome浏览器使用的是wheelDelta，并且值为“正负120”
                delta = event.wheelDelta / 120;
                if (window.opera) delta = -delta;//因为IE、chrome等向下滚动是负值，FF是正值，为了处理一致性，在此取反处理
            } else if (event.detail) {//FF浏览器使用的是detail,其值为“正负3”
                delta = -event.detail / 3;
            }
            if (delta)
                handle(delta);
        }
        //上下滚动时的具体处理函数
        function handle(delta) {
            if (delta < 0) scrollSize /= 1.2; //向下滚动
            else scrollSize *= 1.2; //向上滚动
            if (scrollSize <= 20) { scrollSize *= 1.2; return; }
            else if (scrollSize >= 500) { scrollSize /= 1.2; return; }
            var str = "#m td{width: " + String(scrollSize) + "px;max-width: " + String(scrollSize) + "px;min-width: " + String(scrollSize) + "px;height: " + String(scrollSize) + "px;max-height: " + String(scrollSize) + "px;min-height: " + String(scrollSize) + "px;}";
            $("#font-size-control")[0].innerHTML = str;
            var t1 = Number($("#m").css('margin-left').substr(0, $("#m").css('margin-left').length - 2));
            var t2 = Number($("#m").css('margin-top').substr(0, $("#m").css('margin-top').length - 2));
            if (delta < 0) t1 /= 1.2, t2 /= 1.2;
            // else t1*=1.2,t2*=1.2;
            $(m).css('margin-left', t1 + "px");
            $(m).css('margin-top', t2 + "px");
        }
    });

    $(document).ready(() => {
        var box = document.getElementById('m');
        document.onmousedown = function (e) {
            if (!$(e.target).hasClass('unshown') && e.target.id != 'main') return;
            var tx = $(box).css('margin-left'); tx = Number(tx.substr(0, tx.length - 2));
            var ty = $(box).css('margin-top'); ty = Number(ty.substr(0, ty.length - 2));
            var disx = e.pageX;
            var disy = e.pageY;
            document.onmousemove = function (e) {
                box.style.marginLeft = e.pageX - disx + tx + 'px';
                box.style.marginTop = e.pageY - disy + ty + 'px';
            };
            document.onmouseup = function () {
                document.onmousemove = document.onmouseup = null;
            };
        }
    });

});