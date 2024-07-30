document.addEventListener('DOMContentLoaded', () => {
    const lightboxes = document.getElementsByClassName('lightbox_content');
    const canvas = lightboxes[0].querySelector('canvas');
    const ctx = canvas.getContext('2d');

    if (canvas) {
        resizeCanvas(canvas);
        animateTwinklingParticles(ctx, canvas.width, canvas.height);
    }

    console.log(ctx);

    window.addEventListener('resize', () => {
        resizeCanvas(canvas);
        animateTwinklingParticles(ctx, canvas.width, canvas.height);
    });

    // Delay the lightbox display by 8 seconds
    setTimeout(() => {
        var lightbox = document.getElementById('lightbox');
        if (lightbox) {
            lightbox.style.display = 'flex';
            setTimeout(function () {
                document.querySelector('.lightbox_close').style.opacity = 1;
                document.querySelector('.lightbox_close').style.zIndex = 10000;

            }, 1000); // Delay in milliseconds before the close button appears
        }
    }, 8000); // Delay of 8000 milliseconds (8 seconds)
});

function closeLightbox() {
    var lightbox = document.getElementById('lightbox');
    if (lightbox) {
        lightbox.style.display = 'none';
    }
}

function resizeCanvas(canvas) {
    canvas.width = window.innerWidth; // Adjust as needed
    canvas.height = window.innerHeight; // Adjust as needed
}

function animateTwinklingParticles(ctx, width, height) {
    const particles = [];
    const numParticles = 100;

    for (let i = 0; i < numParticles; i++) {
        particles.push({
            x: Math.random() * width,
            y: Math.random() * height,
            radius: Math.random() * 3 + 1,
            alpha: Math.random(),
            dx: (Math.random() - 0.5) * 2,
            dy: (Math.random() - 0.5) * 2
        });
    }

    function drawParticles() {
        ctx.clearRect(0, 0, width, height);

        particles.forEach(particle => {
            ctx.beginPath();
            ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2, false);
            ctx.fillStyle = `rgba(255, 215, 0, ${particle.alpha})`;
            ctx.fill();

            // Update particle position
            particle.x += particle.dx;
            particle.y += particle.dy;

            // Bounce particles off the edges
            if (particle.x < 0 || particle.x > width) particle.dx *= -1;
            if (particle.y < 0 || particle.y > height) particle.dy *= -1;

            // Randomly change alpha for twinkling effect
            particle.alpha += (Math.random() - 0.5) * 0.05;
            if (particle.alpha < 0) particle.alpha = 0;
            if (particle.alpha > 1) particle.alpha = 1;
        });

        requestAnimationFrame(drawParticles);
    }

    drawParticles();
}
