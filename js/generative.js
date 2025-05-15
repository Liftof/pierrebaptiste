document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('livingCanvas');
    const ctx = canvas.getContext('2d');
    const infoOverlay = document.getElementById('infoOverlay');

    let particlesArray = [];
    const numberOfParticles = 100;
    let mouse = {
        x: null,
        y: null,
        radius: 100 // Area of influence for mouse interaction
    };

    // Set canvas size
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    window.addEventListener('resize', () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        initParticles(); // Re-initialize particles on resize for new density
    });

    window.addEventListener('mousemove', (event) => {
        mouse.x = event.clientX;
        mouse.y = event.clientY;
    });
    window.addEventListener('mouseout', () => { // Reset mouse when it leaves window
        mouse.x = undefined;
        mouse.y = undefined;
    });


    // Particle class
    class Particle {
        constructor(x, y, size, color, weight) {
            this.x = x;
            this.y = y;
            this.size = size;
            this.color = color;
            this.weight = weight; // How much mouse affects it
            this.baseX = this.x; // Original X for returning effect
            this.baseY = this.y; // Original Y
        }

        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2, false);
            ctx.fillStyle = this.color;
            ctx.fill();
        }

        update() {
            let dx = mouse.x - this.x;
            let dy = mouse.y - this.y;
            let distance = Math.sqrt(dx * dx + dy * dy);
            let forceDirectionX = dx / distance;
            let forceDirectionY = dy / distance;

            // Max distance, force, and speed
            let maxDistance = mouse.radius;
            let force = (maxDistance - distance) / maxDistance; // The closer, the stronger
            let directionX = forceDirectionX * force * this.weight;
            let directionY = forceDirectionY * force * this.weight;

            if (distance < mouse.radius) {
                this.x -= directionX * 5; // Repel from mouse
                this.y -= directionY * 5;
            } else {
                // Return to base position if not already there
                if (this.x !== this.baseX) {
                    let dxReturn = this.x - this.baseX;
                    this.x -= dxReturn / 10; // Slow return
                }
                if (this.y !== this.baseY) {
                    let dyReturn = this.y - this.baseY;
                    this.y -= dyReturn / 10;
                }
            }
            this.draw();
        }
    }

    function initParticles() {
        particlesArray = [];
        for (let i = 0; i < numberOfParticles; i++) {
            let size = Math.random() * 5 + 1; // Random size 1-6
            let x = Math.random() * (canvas.width - size * 2) + size;
            let y = Math.random() * (canvas.height - size * 2) + size;
            // Vibrant colors: cyan, magenta, yellow, bright green, orange
            const colors = ['#00FFFF', '#FF00FF', '#FFFF00', '#00FF00', '#FFA500'];
            let color = colors[Math.floor(Math.random() * colors.length)];
            let weight = Math.random() * 0.5 + 0.1; // Random weight for mouse interaction
            particlesArray.push(new Particle(x, y, size, color, weight));
        }
    }

    function animateParticles() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        for (let i = 0; i < particlesArray.length; i++) {
            particlesArray[i].update();
        }
        requestAnimationFrame(animateParticles);
    }

    // Info Overlay Logic
    function setupInfoOverlay() {
        infoOverlay.innerHTML = `
            <h1>Pierre-Baptiste Borges</h1>
            <p><strong>Connect:</strong></p>
            <a href="files/Resume_BORGES_PierreBaptiste-2022.pdf" target="_blank">Resume (2022)</a>
            <a href="https://www.linkedin.com/in/pierrebaptisteborges/" target="_blank">LinkedIn</a>
            <a href="https://twitter.com/pierbapt" target="_blank">Twitter</a>
            <a href="https://medium.com/@pierrebaptiste-borges" target="_blank">Medium</a>
            <a href="https://www.instagram.com/pb.bor/" target="_blank">Instagram</a>
            <p style="margin-top:15px;"><strong>Playlists:</strong></p>
            <a href="https://open.spotify.com/playlist/4hnRnG9BiowYdy8DfcmeR1" target="_blank">Playlist 1</a>
            <a href="https://open.spotify.com/playlist/2TCIPO3tZPwlHPepxPwEji" target="_blank">Playlist 2</a>
            <a href="https://open.spotify.com/playlist/6K6hcekkdpXrys8FM6JZsr" target="_blank">Playlist 3</a>
            <a href="https://open.spotify.com/playlist/2K64c4XOn7oU07mwJMmIXq" target="_blank">Playlist 4</a>
            <a href="https://open.spotify.com/playlist/4diQDIVvy9Mc2RvPGtWpiQ" target="_blank">Playlist 5</a>
            <a href="https://open.spotify.com/playlist/1phi9ufzLASdjw9B1CplRi" target="_blank">Playlist 6</a>
        `;

        // Show overlay when mouse is near top-left corner
        // Or on a key press, e.g., 'i' for info
        let overlayTimeout;
        canvas.addEventListener('mousemove', (e) => {
            if (e.clientX < 150 && e.clientY < 150) { // If mouse in top-left
                infoOverlay.style.display = 'block';
                clearTimeout(overlayTimeout); // Clear any existing timeout
            } else {
                // Hide after a delay if mouse moves out
                overlayTimeout = setTimeout(() => {
                    infoOverlay.style.display = 'none';
                }, 1000); // Hide after 1 second
            }
        });
        infoOverlay.addEventListener('mouseenter', () => clearTimeout(overlayTimeout)); // Keep open if mouse on overlay
        infoOverlay.addEventListener('mouseleave', () => { // Hide if mouse leaves overlay
             overlayTimeout = setTimeout(() => {
                infoOverlay.style.display = 'none';
            }, 500);
        });
    }

    initParticles();
    animateParticles();
    setupInfoOverlay();
});
