// Dynamic Greeting
function updateGreeting() {
    const greetingElement = document.getElementById('greeting');
    const now = new Date();
    const hours = now.getHours();
  
    let greetingText = '';
  
    if (hours >= 5 && hours < 12) {
      greetingText = "Good morning! I'm Nilay Naha.";
    } else if (hours >= 12 && hours < 17) {
      greetingText = "Good afternoon! I'm Nilay Naha.";
    } else if (hours >= 17 && hours < 21) {
      greetingText = "Good evening! I'm Nilay Naha.";
    } else {
      greetingText = "Hello, night owl! I'm Nilay Naha.";
    }
  
    greetingElement.textContent = greetingText;
  }
  
  // Call the function when the page loads
  updateGreeting();
  
// Smooth Scrolling
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const targetId = this.getAttribute('href').substring(1);
      const targetElement = document.getElementById(targetId);
      targetElement.scrollIntoView({ behavior: 'smooth' });
    });
  });
  
  // Dark/Light Mode Toggle
  const themeToggle = document.getElementById('theme-toggle');
  const body = document.body;
  
  // Check for saved theme preference in localStorage
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme === 'dark-mode') {
    body.classList.add('dark-mode');
    themeToggle.textContent = '☀️'; // Show sun icon for dark mode
  } else {
    body.classList.remove('dark-mode');
    themeToggle.textContent = '🌙'; // Show moon icon for light mode
  }
  
  // Toggle theme on button click
  themeToggle.addEventListener('click', () => {
    body.classList.toggle('dark-mode');
  
    if (body.classList.contains('dark-mode')) {
      themeToggle.textContent = '☀️'; // Switch to sun icon
      localStorage.setItem('theme', 'dark-mode'); // Save preference
    } else {
      themeToggle.textContent = '🌙'; // Switch to moon icon
      localStorage.setItem('theme', 'light-mode'); // Save preference
    }
  });