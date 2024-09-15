document.addEventListener('DOMContentLoaded', () => {
    const themeToggle = document.getElementById('theme-toggle');
    const body = document.body;
    const icon = themeToggle.querySelector('i');

    // Function to set theme
    function setTheme(theme) {
        if (theme === 'dark') {
            body.classList.add('dark-theme');
            icon.classList.remove('fa-moon');
            icon.classList.add('fa-sun');
        } else {
            body.classList.remove('dark-theme');
            icon.classList.add('fa-moon');
            icon.classList.remove('fa-sun');
        }
        localStorage.setItem('theme', theme);
    }

    // Check for saved theme preference or default to 'light'
    const savedTheme = localStorage.getItem('theme') || 'dark';
    setTheme(savedTheme);

    // Theme toggle event listener
    themeToggle.addEventListener('click', () => {
        const newTheme = body.classList.contains('dark-theme') ? 'light' : 'dark';
        setTheme(newTheme);
    });

    // Smooth page transition
    document.body.classList.add('fade-in');

    // Add event listeners to all internal links
    document.querySelectorAll('a[href^="index.html"], a[href^="projects.html"], a[href^="reviews.html"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            document.body.classList.remove('fade-in');
            document.body.classList.add('fade-out');
            const href = this.getAttribute('href');
            setTimeout(() => {
                window.location.href = href;
            }, 500); // Matches the transition duration
        });
    });
});