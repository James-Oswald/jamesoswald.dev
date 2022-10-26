

content = document.getElementsByClassName("content")[0];
canvas = document.createElement("canvas");
canvas.style.position = "absolute";
canvas.style.width = content.offsetWidth;
canvas.style.height = content.offsetHeight;
canvas.style.top = content.offsetTop;
content.appendChild(canvas);