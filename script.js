// Dynamic Greeting with Typing Animation
function updateGreeting() {
  const greetingElement = document.getElementById("greeting");
  const greetings = ["Hello, night owl!", "Hey there!", "Welcome back!"];
  let currentIndex = 0;

  function typeGreeting() {
    greetingElement.textContent = "";
    let currentGreeting = greetings[currentIndex];
    let charIndex = 0;

    function typeCharacter() {
      if (charIndex < currentGreeting.length) {
        greetingElement.textContent += currentGreeting[charIndex];
        charIndex++;
        setTimeout(typeCharacter, 50); // Adjust typing speed here
      } else {
        setTimeout(eraseGreeting, 1000); // Wait before erasing
      }
    }

    typeCharacter();
  }

  function eraseGreeting() {
    let currentGreeting = greetings[currentIndex];
    let charIndex = currentGreeting.length;

    function eraseCharacter() {
      if (charIndex > 0) {
        greetingElement.textContent = currentGreeting.substring(0, charIndex - 1);
        charIndex--;
        setTimeout(eraseCharacter, 25); // Adjust erasing speed here
      } else {
        currentIndex = (currentIndex + 1) % greetings.length; // Cycle through greetings
        setTimeout(typeGreeting, 500); // Wait before typing next greeting
      }
    }

    eraseCharacter();
  }

  typeGreeting(); // Start the typing animation
}

// Smooth Scrolling
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener("click", function (e) {
    e.preventDefault();
    const targetId = this.getAttribute("href").substring(1);
    const targetElement = document.getElementById(targetId);

    if (targetElement) {
      window.scrollTo({
        top: targetElement.offsetTop - 70, // Adjust for fixed navbar
        behavior: "smooth",
      });
    }
  });
});

// Dark/Light Mode Toggle
const themeToggle = document.getElementById("theme-toggle");
const body = document.body;

themeToggle.addEventListener("click", () => {
  body.classList.toggle("dark-mode");

  // Update icon based on mode
  if (body.classList.contains("dark-mode")) {
    themeToggle.textContent = "☀️"; // Sun icon for light mode
  } else {
    themeToggle.textContent = "🌙"; // Moon icon for dark mode
  }

  // Save preference to localStorage
  const isDarkMode = body.classList.contains("dark-mode");
  localStorage.setItem("darkMode", isDarkMode);
});

// Load saved theme preference
const savedTheme = localStorage.getItem("darkMode");
if (savedTheme === "true") {
  body.classList.add("dark-mode");
  themeToggle.textContent = "☀️";
} else {
  body.classList.remove("dark-mode");
  themeToggle.textContent = "🌙";
}

// Sticky Navbar
window.addEventListener("scroll", () => {
  const navbar = document.getElementById("navbar");
  if (window.scrollY > 50) {
    navbar.classList.add("shrink");
  } else {
    navbar.classList.remove("shrink");
  }
});

// Fade-in Sections and Back to Top Button
function handleScroll() {
  const sections = document.querySelectorAll(".section");
  sections.forEach((section) => {
    const sectionTop = section.getBoundingClientRect().top;
    if (sectionTop < window.innerHeight * 0.8) {
      section.classList.add("visible");
    } else {
      section.classList.remove("visible");
    }
  });

  const backToTopBtn = document.getElementById("back-to-top-btn");
  if (window.scrollY > 300) {
    backToTopBtn.classList.add("visible");
  } else {
    backToTopBtn.classList.remove("visible");
  }
}

window.addEventListener("scroll", handleScroll);

// Back to Top Button Functionality
document.getElementById("back-to-top-btn").addEventListener("click", () => {
  window.scrollTo({
    top: 0,
    behavior: "smooth",
  });
});

// Form Validation and Submission
document.getElementById("contact-form").addEventListener("submit", (e) => {
  e.preventDefault();

  const name = document.getElementById("name").value.trim();
  const email = document.getElementById("email").value.trim();
  const message = document.getElementById("message").value.trim();

  if (!name || !email || !message) {
    alert("Please fill out all fields.");
    return;
  }

  if (!validateEmail(email)) {
    alert("Please enter a valid email address.");
    return;
  }

  alert("Message sent successfully!");
  document.getElementById("contact-form").reset();
});

function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(String(email).toLowerCase());
}

// Hamburger Menu Toggle Functionality
const menuToggle = document.getElementById("menu-toggle");
const navLinks = document.querySelector(".nav-links");

menuToggle.addEventListener("click", () => {
  navLinks.classList.toggle("active");
});

// Initialize Everything on Page Load
window.addEventListener("load", () => {
  updateGreeting();
});
