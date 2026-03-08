(function () {
    const DESKTOP_MIN_WIDTH = 1024;
    const MAX_PARTICLES = 18;
    const SPAWN_INTERVAL_MS = 28;
    const mediaQueryLists = [
        window.matchMedia('(prefers-color-scheme: dark)'),
        window.matchMedia('(prefers-reduced-motion: reduce)')
    ];

    let layer = null;
    let particles = [];
    let rafId = 0;
    let lastFrameTime = 0;
    let lastSpawnTime = 0;
    let lastPointerX = null;
    let lastPointerY = null;

    function clamp(value, min, max) {
        return Math.min(max, Math.max(min, value));
    }

    function isEligible() {
        return window.matchMedia('(hover: hover) and (pointer: fine)').matches &&
            !window.matchMedia('(prefers-reduced-motion: reduce)').matches &&
            window.innerWidth >= DESKTOP_MIN_WIDTH;
    }

    function isDarkMode() {
        return mediaQueryLists[0].matches;
    }

    function observeMediaQuery(mediaQueryList, listener) {
        if (typeof mediaQueryList.addEventListener === 'function') {
            mediaQueryList.addEventListener('change', listener);
            return;
        }

        if (typeof mediaQueryList.addListener === 'function') {
            mediaQueryList.addListener(listener);
        }
    }

    function ensureLayer() {
        if (layer) {
            return;
        }

        layer = document.createElement('div');
        layer.className = 'ascii-cursor-layer';
        layer.setAttribute('aria-hidden', 'true');
        document.body.appendChild(layer);
    }

    function clearParticles() {
        particles.forEach((particle) => particle.node.remove());
        particles = [];
    }

    function stopAnimation() {
        if (rafId) {
            cancelAnimationFrame(rafId);
            rafId = 0;
        }
    }

    function teardown() {
        stopAnimation();
        clearParticles();
        lastPointerX = null;
        lastPointerY = null;

        if (layer) {
            layer.remove();
            layer = null;
        }
    }

    function syncState() {
        if (!isEligible()) {
            teardown();
            return;
        }

        ensureLayer();

        if (!rafId) {
            lastFrameTime = performance.now();
            rafId = requestAnimationFrame(animate);
        }
    }

    function pickGlyph(speed) {
        if (speed > 42) {
            return '+';
        }

        if (speed > 18) {
            return ':';
        }

        return Math.random() > 0.7 ? ':' : '.';
    }

    function getShade(speed) {
        if (isDarkMode()) {
            return clamp(182 + speed * 0.78 + Math.random() * 20, 182, 238);
        }

        return clamp(102 + speed * 0.9 + Math.random() * 18, 102, 182);
    }

    function spawnParticle(event) {
        if (!layer || !isEligible()) {
            return;
        }

        if (lastPointerX === null || lastPointerY === null) {
            lastPointerX = event.clientX;
            lastPointerY = event.clientY;
            return;
        }

        const now = performance.now();
        const dx = event.clientX - lastPointerX;
        const dy = event.clientY - lastPointerY;
        const speed = Math.hypot(dx, dy);

        lastPointerX = event.clientX;
        lastPointerY = event.clientY;

        if (speed < 2 || now - lastSpawnTime < SPAWN_INTERVAL_MS) {
            return;
        }

        lastSpawnTime = now;

        const node = document.createElement('span');
        const shade = Math.round(getShade(speed));
        const opacity = Math.min(0.34, 0.14 + speed * 0.004);
        const driftX = -dx * 0.05 + (Math.random() - 0.5) * 0.35;
        const driftY = -dy * 0.05 - 0.08 + (Math.random() - 0.5) * 0.35;
        const jitterX = (Math.random() - 0.5) * 8;
        const jitterY = (Math.random() - 0.5) * 8;

        node.className = 'ascii-cursor-particle';
        node.textContent = pickGlyph(speed);
        node.style.color = `rgba(${shade}, ${shade}, ${shade}, ${opacity})`;

        const particle = {
            node,
            x: event.clientX + 8 + jitterX,
            y: event.clientY + 8 + jitterY,
            velocityX: driftX,
            velocityY: driftY,
            life: 380 + Math.random() * 180,
            age: 0,
            opacity
        };

        node.style.transform = `translate3d(${particle.x}px, ${particle.y}px, 0)`;
        layer.appendChild(node);
        particles.push(particle);

        while (particles.length > MAX_PARTICLES) {
            const oldParticle = particles.shift();
            oldParticle.node.remove();
        }

        if (!rafId) {
            lastFrameTime = now;
            rafId = requestAnimationFrame(animate);
        }
    }

    function animate(timestamp) {
        const delta = Math.min(32, timestamp - lastFrameTime || 16);
        lastFrameTime = timestamp;

        particles = particles.filter((particle) => {
            particle.age += delta;

            if (particle.age >= particle.life) {
                particle.node.remove();
                return false;
            }

            const progress = particle.age / particle.life;
            particle.x += particle.velocityX * delta * 0.06;
            particle.y += particle.velocityY * delta * 0.06;
            particle.node.style.opacity = (particle.opacity * (1 - progress)).toFixed(3);
            particle.node.style.transform = `translate3d(${particle.x}px, ${particle.y}px, 0) scale(${(1 + progress * 0.18).toFixed(3)})`;

            return true;
        });

        if (!particles.length) {
            rafId = 0;
            return;
        }

        rafId = requestAnimationFrame(animate);
    }

    window.addEventListener('pointermove', (event) => {
        if (event.pointerType !== 'mouse') {
            return;
        }

        spawnParticle(event);
    }, { passive: true });

    window.addEventListener('mouseout', (event) => {
        if (event.relatedTarget) {
            return;
        }

        lastPointerX = null;
        lastPointerY = null;
        clearParticles();
    });

    window.addEventListener('resize', syncState, { passive: true });
    mediaQueryLists.forEach((mediaQueryList) => observeMediaQuery(mediaQueryList, syncState));

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', syncState, { once: true });
    } else {
        syncState();
    }
}());
