// Dynamic Greeting with Typing Animation
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

  // Typing animation
  let index = 0;
  greetingElement.textContent = ''; // Clear previous text
  function type() {
    if (index < greetingText.length) {
      greetingElement.textContent += greetingText.charAt(index);
      index++;
      setTimeout(type, 100); // Adjust speed here (100ms per character)
    } else {
      greetingElement.classList.add('typing-effect'); // Add typing effect class after typing
    }
  }
  type();
}

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

const savedTheme = localStorage.getItem('theme');
if (savedTheme === 'dark-mode') {
  body.classList.add('dark-mode');
  themeToggle.textContent = '☀️';
} else {
  themeToggle.textContent = '🌙';
}

themeToggle.addEventListener('click', () => {
  body.classList.toggle('dark-mode');
  themeToggle.textContent = body.classList.contains('dark-mode') ? '☀️' : '🌙';
  localStorage.setItem('theme', body.classList.contains('dark-mode') ? 'dark-mode' : 'light-mode');
});

// Sticky Navbar
window.addEventListener('scroll', () => {
  const navbar = document.getElementById('navbar');
  if (window.scrollY > 50) {
    navbar.classList.add('shrink');
  } else {
    navbar.classList.remove('shrink');
  }
});

// Fade-in Sections and Back to Top Button
function handleScroll() {
  const sections = document.querySelectorAll('.section');
  sections.forEach(section => {
    const rect = section.getBoundingClientRect();
    if (rect.top < window.innerHeight - 100) {
      section.classList.add('visible');
    }
  });

  const backToTopBtn = document.getElementById('back-to-top-btn');
  if (window.scrollY > 300) {
    backToTopBtn.classList.add('visible');
  } else {
    backToTopBtn.classList.remove('visible');
  }
}

window.addEventListener('scroll', handleScroll);
window.addEventListener('load', handleScroll);

// Back to Top Button Functionality
document.getElementById('back-to-top-btn').addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

// Animated Progress Bars
function animateProgressBars() {
  const skillLevels = document.querySelectorAll('.skill-level');
  skillLevels.forEach(skillLevel => {
    const width = skillLevel.getAttribute('data-width');
    skillLevel.style.width = width;
  });
}

const skillsObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      animateProgressBars();
      skillsObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.1 });

skillsObserver.observe(document.getElementById('skills'));

// Form Validation and Submission
document.getElementById('contact-form').addEventListener('submit', (e) => {
  e.preventDefault();

  const nameInput = document.getElementById('name');
  const emailInput = document.getElementById('email');
  const messageInput = document.getElementById('message');
  let isValid = true;

  if (!nameInput.value.trim()) {
    nameInput.classList.add('shake');
    isValid = false;
  } else {
    nameInput.classList.remove('shake');
  }

  if (!emailInput.value.trim() || !validateEmail(emailInput.value)) {
    emailInput.classList.add('shake');
    isValid = false;
  } else {
    emailInput.classList.remove('shake');
  }

  if (!messageInput.value.trim()) {
    messageInput.classList.add('shake');
    isValid = false;
  } else {
    messageInput.classList.remove('shake');
  }

  if (isValid) {
    alert('Message sent successfully! (This is a demo)');
    nameInput.value = '';
    emailInput.value = '';
    messageInput.value = '';
  }
});

function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(String(email).toLowerCase());
}

// Initialize on Load
window.addEventListener('load', () => {
  updateGreeting();
});
