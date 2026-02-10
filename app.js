'use strict';

const CONFIG = window.CONFIG || {
  DISCORD_WEBHOOK: ''
};

const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);

const debounce = (fn, ms) => {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => fn(...args), ms);
  };
};

const lerp = (a, b, t) => a + (b - a) * t;

class Cursor {
  constructor() {
    this.cursor = $('.cursor');
    this.follower = $('.cursor-follower');
    
    if (!this.cursor || !this.follower) return;
    
    this.pos = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    this.followerPos = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    this.mouse = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    this.isActive = false;
    
    if (window.matchMedia('(hover: hover)').matches) {
      this.init();
    } else {
      document.body.classList.add('no-custom-cursor');
    }
  }
  
  init() {
    document.addEventListener('mousemove', (e) => {
      this.mouse.x = e.clientX;
      this.mouse.y = e.clientY;
    }, { passive: true });
    
    const interactive = $$('a, button, .btn, .magnetic, input, textarea, .project-card, .skill-category, .social-link');
    
    interactive.forEach(el => {
      el.addEventListener('mouseenter', () => {
        this.isActive = true;
        this.cursor.classList.add('active');
        this.follower.classList.add('active');
      });
      
      el.addEventListener('mouseleave', () => {
        this.isActive = false;
        this.cursor.classList.remove('active');
        this.follower.classList.remove('active');
      });
    });
    
    this.render();
  }
  
  render() {
    this.pos.x = lerp(this.pos.x, this.mouse.x, 0.8);
    this.pos.y = lerp(this.pos.y, this.mouse.y, 0.8);
    
    this.followerPos.x = lerp(this.followerPos.x, this.mouse.x, 0.2);
    this.followerPos.y = lerp(this.followerPos.y, this.mouse.y, 0.2);
    
    if (this.cursor) {
      this.cursor.style.left = `${this.pos.x}px`;
      this.cursor.style.top = `${this.pos.y}px`;
    }
    
    if (this.follower) {
      this.follower.style.left = `${this.followerPos.x}px`;
      this.follower.style.top = `${this.followerPos.y}px`;
    }
    
    requestAnimationFrame(() => this.render());
  }
}

class Magnetic {
  constructor() {
    this.buttons = $$('.magnetic');
    if (!window.matchMedia('(hover: hover)').matches) return;
    
    this.buttons.forEach(btn => {
      btn.addEventListener('mousemove', (e) => {
        const rect = btn.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        btn.style.transform = `translate(${x * 0.15}px, ${y * 0.15}px)`;
      });
      
      btn.addEventListener('mouseleave', () => {
        btn.style.transform = 'translate(0, 0)';
      });
    });
  }
}

class Nav {
  constructor() {
    this.nav = $('.nav');
    this.toggle = $('#navToggle');
    this.menu = $('#navMenu');
    this.links = $$('.nav-link');
    this.init();
  }
  
  init() {
    let ticking = false;
    window.addEventListener('scroll', () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          if (window.scrollY > 50) {
            this.nav.classList.add('scrolled');
          } else {
            this.nav.classList.remove('scrolled');
          }
          this.updateActive();
          ticking = false;
        });
        ticking = true;
      }
    }, { passive: true });
    
    if (this.toggle) {
      this.toggle.addEventListener('click', () => {
        this.toggle.classList.toggle('active');
        this.menu.classList.toggle('active');
      });
    }
    
    this.links.forEach(link => {
      link.addEventListener('click', (e) => {
        const href = link.getAttribute('href');
        if (href.startsWith('#')) {
          e.preventDefault();
          const target = $(href);
          if (target) {
            const offsetTop = target.offsetTop - 80;
            window.scrollTo({
              top: offsetTop,
              behavior: 'smooth'
            });
            
            if (this.menu.classList.contains('active')) {
              this.toggle.classList.remove('active');
              this.menu.classList.remove('active');
            }
          }
        }
      });
    });
  }
  
  updateActive() {
    const sections = $$('section[id]');
    const scroll = window.scrollY + 100;
    
    sections.forEach(section => {
      const top = section.offsetTop;
      const height = section.offsetHeight;
      const id = section.getAttribute('id');
      
      if (scroll >= top && scroll < top + height) {
        this.links.forEach(link => {
          link.classList.remove('active');
          if (link.getAttribute('href') === `#${id}`) {
            link.classList.add('active');
          }
        });
      }
    });
  }
}

class Typewriter {
  constructor(el, texts, speed = 80, deleteSpeed = 40, pause = 2000) {
    if (!el) return;
    this.el = el;
    this.texts = texts;
    this.speed = speed;
    this.deleteSpeed = deleteSpeed;
    this.pause = pause;
    this.textIndex = 0;
    this.charIndex = 0;
    this.isDeleting = false;
    this.type();
  }
  
  type() {
    const current = this.texts[this.textIndex];
    
    if (this.isDeleting) {
      this.el.textContent = current.substring(0, this.charIndex - 1);
      this.charIndex--;
    } else {
      this.el.textContent = current.substring(0, this.charIndex + 1);
      this.charIndex++;
    }
    
    let speed = this.isDeleting ? this.deleteSpeed : this.speed;
    
    if (!this.isDeleting && this.charIndex === current.length) {
      speed = this.pause;
      this.isDeleting = true;
    } else if (this.isDeleting && this.charIndex === 0) {
      this.isDeleting = false;
      this.textIndex = (this.textIndex + 1) % this.texts.length;
      speed = 500;
    }
    
    setTimeout(() => this.type(), speed);
  }
}

class ScrollAnim {
  constructor() {
    this.elements = $$('[data-aos]');
    if (!this.elements.length) return;
    
    this.observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('aos-animate');
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '0px 0px -10% 0px'
    });
    
    this.elements.forEach(el => this.observer.observe(el));
  }
}

class Skills {
  constructor() {
    this.items = $$('.skill-item');
    this.animated = false;
    
    if (!this.items.length) return;
    
    const section = $('#skills');
    if (!section) return;
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !this.animated) {
          this.animate();
          this.animated = true;
        }
      });
    }, { threshold: 0.3 });
    
    observer.observe(section);
  }
  
  animate() {
    this.items.forEach((item, i) => {
      setTimeout(() => {
        const fill = item.querySelector('.skill-fill');
        if (fill) {
          const progress = fill.getAttribute('data-progress');
          fill.style.setProperty('--progress-width', `${progress}%`);
          item.classList.add('animate');
        }
      }, i * 100);
    });
  }
}

function calculateAge() {
  const birth = new Date('2007-12-24');
  const ageEl = $('#age');
  
  if (!ageEl) return;
  
  const update = () => {
    const now = new Date();
    const ageMs = now - birth;
    const ageYears = ageMs / (1000 * 60 * 60 * 24 * 365.25);
    ageEl.textContent = `${ageYears.toFixed(9)} years`;
  };
  
  update();
  setInterval(update, 100);
}

class ContactForm {
  constructor() {
    this.form = $('#contactForm');
    this.status = $('#formStatus');
    if (this.form) this.init();
  }
  
  init() {
    this.form.addEventListener('submit', async (e) => {
      e.preventDefault();
      await this.submit();
    });
  }
  
  async submit() {
    const formData = new FormData(this.form);
    const data = {
      name: formData.get('name'),
      email: formData.get('email'),
      subject: formData.get('subject'),
      message: formData.get('message')
    };
    
    if (!CONFIG.DISCORD_WEBHOOK) {
      this.showStatus('error', '⚠️ Discord webhook not configured. Please add it to config.js');
      console.error('Add webhook URL to config.js file');
      return;
    }
    
    const submitBtn = this.form.querySelector('button[type="submit"]');
    const originalHTML = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span>Sending...</span>';
    
    try {
      const embed = {
        title: '📬 New Portfolio Contact',
        color: 0xffffff,
        fields: [
          { name: '👤 Name', value: data.name, inline: true },
          { name: '📧 Email', value: data.email, inline: true },
          { name: '📝 Subject', value: data.subject, inline: false },
          { name: '💬 Message', value: data.message || 'No message', inline: false }
        ],
        footer: { text: 'Portfolio Contact Form' },
        timestamp: new Date().toISOString()
      };
      
      const response = await fetch(CONFIG.DISCORD_WEBHOOK, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ embeds: [embed] })
      });
      
      if (response.ok || response.status === 204) {
        this.showStatus('success', '✓ Message sent successfully! I\'ll get back to you soon.');
        this.form.reset();
      } else {
        throw new Error('Failed to send message');
      }
    } catch (error) {
      console.error('Error:', error);
      this.showStatus('error', '✗ Failed to send message. Please try again or email me directly.');
    } finally {
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalHTML;
    }
  }
  
  showStatus(type, message) {
    this.status.className = `form-status ${type}`;
    this.status.textContent = message;
    
    setTimeout(() => {
      this.status.className = 'form-status';
      this.status.textContent = '';
    }, 5000);
  }
}

class Loading {
  constructor() {
    this.screen = $('.loading-screen');
    if (!this.screen) return;
    
    window.addEventListener('load', () => {
      setTimeout(() => {
        this.screen.classList.add('hidden');
      }, 600);
    });
  }
}

function scrollToTop() {
  $$('a[href="#home"]').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  });
}

function preloadImages() {
  const images = ['images/logo.png'];
  images.forEach(src => {
    const img = new Image();
    img.src = src;
  });
}

document.addEventListener('DOMContentLoaded', () => {
  preloadImages();
  
  new Loading();
  new Cursor();
  new Magnetic();
  new Nav();
  new ScrollAnim();
  new Skills();
  new ContactForm();
  
  const typewriter = $('#typewriter');
  if (typewriter) {
    new Typewriter(
      typewriter,
      [
        'Computer science student',
        'Web developer',
        'Cybersecurity enthusiast',
        'Lua scripter',
        'Problem solver'
      ]
    );
  }
  
  calculateAge();
  
  scrollToTop();
  
  console.log('%c👋 Hey there!', 'font-size: 16px; font-weight: bold;');
  console.log('%c💼 Looking for developers? Let\'s connect!', 'font-size: 12px;');
});

if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  document.body.style.setProperty('--transition', '0ms');
  document.body.style.setProperty('--transition-slow', '0ms');
}