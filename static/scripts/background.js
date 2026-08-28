(() => {
    const content = document.querySelector(".content");

    function isDesktopEnvironment() {
        const userAgent = navigator.userAgent || "";
        const reportsMobile = navigator.userAgentData
            ? navigator.userAgentData.mobile
            : /Android|iPhone|iPad|iPod|IEMobile|Opera Mini/i.test(userAgent);
        const isTouchOnlyIPad = /Macintosh/i.test(userAgent) && navigator.maxTouchPoints > 1;
        const hasDesktopViewport = window.matchMedia("(min-width: 769px)").matches;
        const hasDesktopPointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

        return !reportsMobile && !isTouchOnlyIPad && hasDesktopViewport && hasDesktopPointer;
    }

    function createHardwareAcceleratedContext(canvas) {
        const context = canvas.getContext("webgl2", {
            antialias: false,
            failIfMajorPerformanceCaveat: true,
            powerPreference: "high-performance"
        });

        if (!context) {
            return null;
        }

        const rendererInfo = context.getExtension("WEBGL_debug_renderer_info");
        if (!rendererInfo) {
            return context;
        }

        const renderer = String(
            context.getParameter(rendererInfo.UNMASKED_RENDERER_WEBGL) || ""
        );
        const usesSoftwareRenderer = /swiftshader|llvmpipe|softpipe|software rasterizer|lavapipe|microsoft basic render|angle.*warp/i.test(renderer);

        if (usesSoftwareRenderer) {
            const loseContext = context.getExtension("WEBGL_lose_context");
            if (loseContext) {
                loseContext.loseContext();
            }
            return null;
        }

        return context;
    }

    if (!content || !isDesktopEnvironment()) {
        return;
    }

    const canvas = document.createElement("canvas");
    canvas.id = "backgroundCanvas";
    canvas.setAttribute("aria-hidden", "true");

    const gl = createHardwareAcceleratedContext(canvas);
    if (!gl) {
        return;
    }

    content.appendChild(canvas);
    content.classList.add("background-canvas-enabled");

    function disableBackground(error) {
        window.removeEventListener("resize", resizeHandler);
        content.removeEventListener("mousemove", mouseMoveHandler);
        observer.disconnect();
        content.classList.remove("background-canvas-enabled");
        canvas.remove();

        const loseContext = gl.getExtension("WEBGL_lose_context");
        if (loseContext) {
            loseContext.loseContext();
        }

        console.warn("WebGL background disabled.", error);
    }

    function resizeHandler() {
        canvas.width = content.offsetWidth;
        canvas.height = content.offsetHeight;
        canvas.style.top = `${content.offsetTop}px`;
        gl.viewport(0, 0, canvas.width, canvas.height);
    }
    window.addEventListener("resize", resizeHandler);
    resizeHandler();

    // Update uniforms with the pointer position and current color scheme.
    let mouseX = 0;
    let mouseY = 0;
    function mouseMoveHandler(event) {
        mouseX = event.clientX;
        mouseY = event.clientY - content.offsetTop;
    }
    content.addEventListener("mousemove", mouseMoveHandler);

    let darkmode = +document.body.classList.contains("colorscheme-dark");
    function colorschemeChangeHandler() {
        darkmode = +document.body.classList.contains("colorscheme-dark");
    }
    const observer = new MutationObserver(colorschemeChangeHandler);
    observer.observe(document.body, { attributes: true, attributeFilter: ["class"] });

    gl.clearColor(0.5, 0.5, 0.5, 0.9);

    // Utility shader creation function sourced from MDN's WebGLShader documentation.
    function createShader(sourceCode, type) {
        const shader = gl.createShader(type);
        gl.shaderSource(shader, sourceCode);
        gl.compileShader(shader);
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            const info = gl.getShaderInfoLog(shader);
            gl.deleteShader(shader);
            throw new Error(`Could not compile WebGL shader.\n\n${info}`);
        }
        return shader;
    }

    const shaderProgram = gl.createProgram();
    const fullscreenQuadVbo = gl.createBuffer();
    let positionAttribute = null;
    let mouseUniform = null;
    let timeUniform = null;
    let resolutionUniform = null;
    let darkmodeUniform = null;

    function drawBackground(time) {
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.useProgram(shaderProgram);
        gl.uniform2f(mouseUniform, mouseX, mouseY);
        gl.uniform1i(darkmodeUniform, darkmode);
        gl.uniform2f(resolutionUniform, canvas.width, canvas.height);
        gl.uniform1f(timeUniform, time);
        gl.bindBuffer(gl.ARRAY_BUFFER, fullscreenQuadVbo);
        gl.enableVertexAttribArray(positionAttribute);
        gl.vertexAttribPointer(positionAttribute, 2, gl.FLOAT, false, 0, 0);
        gl.drawArrays(gl.TRIANGLES, 0, 6);
        window.requestAnimationFrame(drawBackground);
    }

    function initBackground(shaders) {
        const vertexShader = createShader(shaders[0], gl.VERTEX_SHADER);
        const fragmentShader = createShader(shaders[1], gl.FRAGMENT_SHADER);
        gl.attachShader(shaderProgram, vertexShader);
        gl.attachShader(shaderProgram, fragmentShader);
        gl.linkProgram(shaderProgram);
        if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
            const info = gl.getProgramInfoLog(shaderProgram);
            throw new Error(`Could not link WebGL program.\n\n${info}`);
        }
        mouseUniform = gl.getUniformLocation(shaderProgram, "mouse");
        timeUniform = gl.getUniformLocation(shaderProgram, "time");
        resolutionUniform = gl.getUniformLocation(shaderProgram, "resolution");
        darkmodeUniform = gl.getUniformLocation(shaderProgram, "darkmode");

        const fullscreenQuad = [
            1.0, 1.0, -1.0, 1.0, -1.0, -1.0,
            -1.0, -1.0, 1.0, -1.0, 1.0, 1.0
        ];
        gl.bindBuffer(gl.ARRAY_BUFFER, fullscreenQuadVbo);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(fullscreenQuad), gl.STATIC_DRAW);
        positionAttribute = gl.getAttribLocation(shaderProgram, "position");

        window.requestAnimationFrame(drawBackground);
    }

    const shaders = ["mandelbrot", "static", "littlewood"];
    const weights = [0.5, 0.0, 0.5];
    console.assert(shaders.length === weights.length, "Shaders and weights must be the same length");
    console.assert(weights.reduce((a, b) => a + b, 0) === 1, "Weights must sum to 1");

    let selectedShader = "";
    const randomValue = Math.random();
    let sum = 0;
    for (let i = 0; i < shaders.length; i++) {
        sum += weights[i];
        if (randomValue < sum) {
            selectedShader = shaders[i];
            break;
        }
    }

    Promise.all([
        fetch(`scripts/${selectedShader}.vert`).then(response => response.text()),
        fetch(`scripts/${selectedShader}.frag`).then(response => response.text())
    ]).then(initBackground).catch(disableBackground);
})();
