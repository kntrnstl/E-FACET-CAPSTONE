<template>
  <div class="landing-page">
    <!-- Background -->
    <div class="background-container">
      <img src="/background.png" alt="Background" class="background-image" />
      <div class="background-overlay"></div>
    </div>
    
    <!-- Navigation -->
    <nav class="navbar">
      <div class="nav-container">
        <div class="logo-container">
          <div class="logo-box">
            <img src="/facet-logo.png" alt="FACET" class="logo-img" />
          </div>
          <div class="logo-text">
            <span class="logo-main">E-FACET</span>
            <span class="logo-sub">Enrollment Portal</span>
          </div>
        </div>
        
        <div class="nav-links">
          <a href="#home" class="nav-link active">Home</a>
          <a href="#programs" class="nav-link">Programs</a>
          <a href="#features" class="nav-link">Features</a>
          <a href="#how-it-works" class="nav-link">How It Works</a>
          <a href="#faq" class="nav-link">FAQ</a>
        </div>
        
        <div class="nav-actions">
          <div class="dropdown auth-dropdown">
            <button class="btn btn-outline dropdown-toggle">
              <font-awesome-icon icon="fas fa-sign-in-alt" />
              Login
            </button>
            <div class="dropdown-menu">
              <router-link to="/login?track=tesda" class="dropdown-item">
                <font-awesome-icon icon="fas fa-graduation-cap" />
                TESDA Login
              </router-link>
              <router-link to="/login?track=driving" class="dropdown-item">
                <font-awesome-icon icon="fas fa-car" />
                Driving Course Login
              </router-link>
            </div>
          </div>
          
          <div class="dropdown auth-dropdown">
            <button class="btn btn-primary dropdown-toggle">
              <font-awesome-icon icon="fas fa-user-plus" />
              Get Started
            </button>
            <div class="dropdown-menu">
              <router-link to="/signup?track=tesda" class="dropdown-item">
                <font-awesome-icon icon="fas fa-graduation-cap" />
                TESDA Sign Up
              </router-link>
              <router-link to="/signup?track=driving" class="dropdown-item">
                <font-awesome-icon icon="fas fa-car" />
                Driving Course Sign Up
              </router-link>
            </div>
          </div>
        </div>
        
        <button class="mobile-menu-btn" @click="toggleMobileMenu">
          <font-awesome-icon icon="fas fa-bars" />
        </button>
      </div>
      
      <!-- Mobile Menu -->
      <div v-if="mobileMenuOpen" class="mobile-menu">
        <a href="#home" class="mobile-nav-link" @click="toggleMobileMenu">
          <font-awesome-icon icon="fas fa-home" />
          Home
        </a>
        <a href="#programs" class="mobile-nav-link" @click="toggleMobileMenu">
          <font-awesome-icon icon="fas fa-graduation-cap" />
          Programs
        </a>
        <a href="#features" class="mobile-nav-link" @click="toggleMobileMenu">
          <font-awesome-icon icon="fas fa-star" />
          Features
        </a>
        <a href="#how-it-works" class="mobile-nav-link" @click="toggleMobileMenu">
          <font-awesome-icon icon="fas fa-cogs" />
          How It Works
        </a>
        <a href="#faq" class="mobile-nav-link" @click="toggleMobileMenu">
          <font-awesome-icon icon="fas fa-question-circle" />
          FAQ
        </a>
        
        <!-- Mobile Authentication Options -->
        <div class="mobile-auth-section">
          <h3 class="mobile-auth-title">TESDA Programs</h3>
          <div class="mobile-auth-actions">
            <router-link to="/login?track=tesda" class="btn btn-outline btn-small">
              <font-awesome-icon icon="fas fa-sign-in-alt" />
              TESDA Login
            </router-link>
            <router-link to="/signup?track=tesda" class="btn btn-primary btn-small">
              <font-awesome-icon icon="fas fa-user-plus" />
              TESDA Sign Up
            </router-link>
          </div>
          
          <h3 class="mobile-auth-title">Driving Courses</h3>
          <div class="mobile-auth-actions">
            <router-link to="/login?track=driving" class="btn btn-outline btn-small">
              <font-awesome-icon icon="fas fa-sign-in-alt" />
              Driving Login
            </router-link>
            <router-link to="/signup?track=driving" class="btn btn-primary btn-small">
              <font-awesome-icon icon="fas fa-user-plus" />
              Driving Sign Up
            </router-link>
          </div>
        </div>
      </div>
    </nav>

    <!-- Hero Section -->
    <section id="home" class="hero">
      <div class="hero-container">
        <div class="hero-content">
          <div class="badge">
            <span class="badge-dot"></span>
            <span>Official Enrollment System</span>
          </div>
          
          <h1 class="hero-title">
            Training Made
            <span class="highlight">Organized</span>
            <br>
            Enrollment Made
            <span class="highlight">Faster</span>
          </h1>
          
          <p class="hero-description">
            A complete digital solution for TESDA and Driving programs. 
            Streamline requirements, track schedules, take assessments, 
            and get certificates — all in one platform.
          </p>
          
          <!-- Quick Authentication Buttons -->
          <div class="quick-auth">
            <div class="quick-auth-group">
              <h3 class="quick-auth-title">
                <font-awesome-icon icon="fas fa-graduation-cap" />
                TESDA Programs
              </h3>
              <div class="quick-auth-actions">
                <router-link to="/login?track=tesda" class="btn btn-outline btn-small">
                  <font-awesome-icon icon="fas fa-sign-in-alt" />
                  Login
                </router-link>
                <router-link to="/signup?track=tesda" class="btn btn-primary btn-small">
                  <font-awesome-icon icon="fas fa-user-plus" />
                  Sign Up
                </router-link>
              </div>
            </div>
            
            <div class="quick-auth-group">
              <h3 class="quick-auth-title">
                <font-awesome-icon icon="fas fa-car" />
                Driving Courses
              </h3>
              <div class="quick-auth-actions">
                <router-link to="/login?track=driving" class="btn btn-outline btn-small">
                  <font-awesome-icon icon="fas fa-sign-in-alt" />
                  Login
                </router-link>
                <router-link to="/signup?track=driving" class="btn btn-primary btn-small">
                  <font-awesome-icon icon="fas fa-user-plus" />
                  Sign Up
                </router-link>
              </div>
            </div>
          </div>
          
          <div class="hero-stats">
            <div class="stat">
              <div class="stat-number">5,000+</div>
              <div class="stat-label">Successful Graduates</div>
            </div>
            <div class="stat">
              <div class="stat-number">98%</div>
              <div class="stat-label">Satisfaction Rate</div>
            </div>
            <div class="stat">
              <div class="stat-number">24/7</div>
              <div class="stat-label">Online Support</div>
            </div>
          </div>
        </div>
        
        <div class="hero-visual">
          <!-- Dashboard Preview - Centered and Fixed -->
          <div class="dashboard-preview">
            <div class="dashboard-header">
              <div class="dashboard-dots">
                <span></span>
                <span></span>
                <span></span>
              </div>
              <div class="dashboard-title">Student Dashboard</div>
              <div class="dashboard-badge">Live</div>
            </div>
            
            <div class="dashboard-content">
              <!-- Enrollment Progress -->
              <div class="progress-section">
                <div class="progress-header">
                  <span>Enrollment Progress</span>
                  <span class="progress-percent">75%</span>
                </div>
                <div class="progress-bar">
                  <div class="progress-fill" :style="{ width: '75%' }"></div>
                </div>
              </div>
              
              <!-- Quick Stats -->
              <div class="quick-stats">
                <div class="stat-item">
                  <div class="stat-icon docs">
                    <font-awesome-icon icon="fas fa-file-alt" />
                  </div>
                  <div class="stat-info">
                    <div class="stat-value">3/5</div>
                    <div class="stat-label">Documents</div>
                  </div>
                </div>
                
                <div class="stat-item">
                  <div class="stat-icon sessions">
                    <font-awesome-icon icon="fas fa-calendar-check" />
                  </div>
                  <div class="stat-info">
                    <div class="stat-value">12</div>
                    <div class="stat-label">Sessions</div>
                  </div>
                </div>
                
                <div class="stat-item">
                  <div class="stat-icon exams">
                    <font-awesome-icon icon="fas fa-file-signature" />
                  </div>
                  <div class="stat-info">
                    <div class="stat-value">85%</div>
                    <div class="stat-label">Mock Exams</div>
                  </div>
                </div>
              </div>
              
              <!-- Recent Activity -->
              <div class="recent-activity">
                <div class="activity-title">Recent Activity</div>
                <div class="activity-item">
                  <font-awesome-icon icon="fas fa-check-circle" />
                  <span>Document submitted - 2 hours ago</span>
                </div>
                <div class="activity-item">
                  <font-awesome-icon icon="fas fa-calendar" />
                  <span>Next session: Tomorrow 9 AM</span>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Floating Feature Cards - Clean Design -->
          <div class="floating-card card-1">
            <div class="floating-icon">
              <font-awesome-icon icon="fas fa-cloud-upload-alt" />
            </div>
            <div class="floating-content">
              <h4>Easy Document Upload</h4>
              <p>Submit requirements quickly</p>
            </div>
          </div>
          
          <div class="floating-card card-2">
            <div class="floating-icon">
              <font-awesome-icon icon="fas fa-chart-line" />
            </div>
            <div class="floating-content">
              <h4>Progress Tracking</h4>
              <p>Monitor your journey</p>
            </div>
          </div>
          
          <div class="floating-card card-3">
            <div class="floating-icon">
              <font-awesome-icon icon="fas fa-certificate" />
            </div>
            <div class="floating-content">
              <h4>Digital Certification</h4>
              <p>Get certificates instantly</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Programs Section -->
    <section id="programs" class="programs">
      <div class="section-container">
        <div class="section-header">
          <span class="section-label">Choose Your Program</span>
          <h2 class="section-title">Start Your Journey Today</h2>
          <p class="section-description">
            Select from our accredited training programs and begin your path to success
          </p>
        </div>
        
        <div class="programs-grid">
          <!-- TESDA Program -->
          <div class="program-card">
            <div class="program-header">
              <div class="program-icon tesda">
                <font-awesome-icon icon="fas fa-graduation-cap" />
              </div>
              <div class="program-badge">
                <span class="badge-text">Government Accredited</span>
              </div>
            </div>
            
            <h3 class="program-title">TESDA Programs</h3>
            <p class="program-description">
              Technical Education and Skills Development Authority certified courses with national recognition and job placement assistance.
            </p>
            
            <ul class="program-features">
              <li><font-awesome-icon icon="fas fa-check-circle" /> Nationally recognized certificates</li>
              <li><font-awesome-icon icon="fas fa-check-circle" /> Industry-standard training</li>
              <li><font-awesome-icon icon="fas fa-check-circle" /> Employment assistance</li>
              <li><font-awesome-icon icon="fas fa-check-circle" /> Scholarship opportunities</li>
            </ul>
            
            <!-- TESDA Authentication -->
            <div class="program-auth">
              <h4 class="auth-title">Get Started with TESDA</h4>
              <div class="auth-actions">
                <router-link to="/login?track=tesda" class="btn btn-outline btn-small">
                  <font-awesome-icon icon="fas fa-sign-in-alt" />
                  TESDA Login
                </router-link>
                <router-link to="/signup?track=tesda" class="btn btn-primary btn-small">
                  <font-awesome-icon icon="fas fa-user-plus" />
                  TESDA Sign Up
                </router-link>
              </div>
            </div>
            
            <div class="program-actions">
              <router-link to="/programs/tesda" class="btn btn-primary">
                <font-awesome-icon icon="fas fa-list" />
                View Courses
              </router-link>
              <a href="#" class="btn-link">
                <font-awesome-icon icon="fas fa-info-circle" />
                Learn More
              </a>
            </div>
          </div>
          
          <!-- Driving Program (Featured) -->
          <div class="program-card featured">
            <div class="featured-badge">Most Popular</div>
            
            <div class="program-header">
              <div class="program-icon driving">
                <font-awesome-icon icon="fas fa-car" />
              </div>
              <div class="program-badge">
                <span class="badge-text">LTO Accredited</span>
              </div>
            </div>
            
            <h3 class="program-title">Driving Courses</h3>
            <p class="program-description">
              Comprehensive driver training programs with theoretical lessons and practical driving sessions for all vehicle categories.
            </p>
            
            <ul class="program-features">
              <li><font-awesome-icon icon="fas fa-check-circle" /> Professional instructors</li>
              <li><font-awesome-icon icon="fas fa-check-circle" /> Modern training vehicles</li>
              <li><font-awesome-icon icon="fas fa-check-circle" /> LTO-accredited certificates</li>
              <li><font-awesome-icon icon="fas fa-check-circle" /> Flexible schedules</li>
            </ul>
            
            <!-- Driving Course Authentication -->
            <div class="program-auth">
              <h4 class="auth-title">Start Driving Course</h4>
              <div class="auth-actions">
                <router-link to="/login?track=driving" class="btn btn-outline btn-small">
                  <font-awesome-icon icon="fas fa-sign-in-alt" />
                  Driving Login
                </router-link>
                <router-link to="/signup?track=driving" class="btn btn-primary btn-small">
                  <font-awesome-icon icon="fas fa-user-plus" />
                  Driving Sign Up
                </router-link>
              </div>
            </div>
            
            <div class="program-actions">
              <router-link to="/programs/driving" class="btn btn-primary">
                <font-awesome-icon icon="fas fa-list" />
                View Courses
              </router-link>
              <a href="#" class="btn-link">
                <font-awesome-icon icon="fas fa-info-circle" />
                Learn More
              </a>
            </div>
          </div>
          
          <!-- Corporate Program -->
          <div class="program-card">
            <div class="program-header">
              <div class="program-icon corporate">
                <font-awesome-icon icon="fas fa-briefcase" />
              </div>
              <div class="program-badge">
                <span class="badge-text">Group Discounts</span>
              </div>
            </div>
            
            <h3 class="program-title">Corporate Training</h3>
            <p class="program-description">
              Customized training solutions for organizations and corporate teams with flexible scheduling and group rates.
            </p>
            
            <ul class="program-features">
              <li><font-awesome-icon icon="fas fa-check-circle" /> Customized curriculum</li>
              <li><font-awesome-icon icon="fas fa-check-circle" /> Flexible scheduling</li>
              <li><font-awesome-icon icon="fas fa-check-circle" /> Group discounts</li>
              <li><font-awesome-icon icon="fas fa-check-circle" /> On-site training</li>
            </ul>
            
            <div class="program-actions">
              <router-link to="/contact" class="btn btn-primary">
                <font-awesome-icon icon="fas fa-phone-alt" />
                Contact Us
              </router-link>
              <a href="#" class="btn-link">
                <font-awesome-icon icon="fas fa-info-circle" />
                Learn More
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Features Section -->
    <section id="features" class="features">
      <div class="section-container">
        <div class="section-header">
          <span class="section-label">Key Features</span>
          <h2 class="section-title">Everything You Need in One Platform</h2>
          <p class="section-description">
            Our comprehensive system covers every aspect of your training journey
          </p>
        </div>
        
        <div class="features-grid">
          <div class="feature-item">
            <div class="feature-icon">
              <font-awesome-icon icon="fas fa-file-upload" />
            </div>
            <h3>Document Upload</h3>
            <p>Securely upload and manage all your requirements in one place with real-time validation.</p>
          </div>
          
          <div class="feature-item">
            <div class="feature-icon">
              <font-awesome-icon icon="fas fa-calendar-alt" />
            </div>
            <h3>Schedule Management</h3>
            <p>View and manage your training schedules, set reminders, and never miss a session.</p>
          </div>
          
          <div class="feature-item">
            <div class="feature-icon">
              <font-awesome-icon icon="fas fa-chart-bar" />
            </div>
            <h3>Progress Tracking</h3>
            <p>Monitor your progress with detailed analytics and performance reports.</p>
          </div>
          
          <div class="feature-item">
            <div class="feature-icon">
              <font-awesome-icon icon="fas fa-file-signature" />
            </div>
            <h3>Mock Exams</h3>
            <p>Practice with simulated exams to prepare for your actual assessments.</p>
          </div>
          
          <div class="feature-item">
            <div class="feature-icon">
              <font-awesome-icon icon="fas fa-clipboard-check" />
            </div>
            <h3>Attendance System</h3>
            <p>Digital attendance tracking with QR code check-ins for accurate records.</p>
          </div>
          
          <div class="feature-item">
            <div class="feature-icon">
              <font-awesome-icon icon="fas fa-certificate" />
            </div>
            <h3>Certificate Generation</h3>
            <p>Automatically generate and download certificates upon course completion.</p>
          </div>
        </div>
      </div>
    </section>

    <!-- How It Works -->
    <section id="how-it-works" class="how-it-works">
      <div class="section-container">
        <div class="section-header">
          <span class="section-label">Simple Process</span>
          <h2 class="section-title">How E-FACET Works</h2>
          <p class="section-description">
            Follow these simple steps to complete your training journey
          </p>
        </div>
        
        <div class="steps-container">
          <div class="step">
            <div class="step-number">01</div>
            <div class="step-icon">
              <font-awesome-icon icon="fas fa-user-plus" />
            </div>
            <h3>Register Account</h3>
            <p>Create your account and choose your desired program</p>
          </div>
          
          <div class="step-line"></div>
          
          <div class="step">
            <div class="step-number">02</div>
            <div class="step-icon">
              <font-awesome-icon icon="fas fa-upload" />
            </div>
            <h3>Upload Documents</h3>
            <p>Submit required documents for verification</p>
          </div>
          
          <div class="step-line"></div>
          
          <div class="step">
            <div class="step-number">03</div>
            <div class="step-icon">
              <font-awesome-icon icon="fas fa-calendar-check" />
            </div>
            <h3>Attend Sessions</h3>
            <p>Follow your schedule and attend training sessions</p>
          </div>
          
          <div class="step-line"></div>
          
          <div class="step">
            <div class="step-number">04</div>
            <div class="step-icon">
              <font-awesome-icon icon="fas fa-award" />
            </div>
            <h3>Get Certified</h3>
            <p>Complete requirements and receive your certificate</p>
          </div>
        </div>
        
        <div class="process-visual">
          <div class="process-line"></div>
          <div class="process-point point-1"></div>
          <div class="process-point point-2"></div>
          <div class="process-point point-3"></div>
          <div class="process-point point-4"></div>
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="cta">
      <div class="cta-container">
        <div class="cta-content">
          <div class="logo-watermark">
            <div class="logo-box-large">
              <img src="/facet-logo.png" alt="FACET" class="logo-img-large" />
            </div>
          </div>
          
          <h2>Ready to Start Your Training Journey?</h2>
          <p>Join thousands of successful graduates who transformed their careers with E-FACET.</p>
          <div class="cta-actions">
            <div class="dropdown auth-dropdown">
              <button class="btn btn-primary btn-large dropdown-toggle">
                <font-awesome-icon icon="fas fa-user-plus" />
                Create Free Account
              </button>
              <div class="dropdown-menu">
                <router-link to="/signup?track=tesda" class="dropdown-item">
                  <font-awesome-icon icon="fas fa-graduation-cap" />
                  TESDA Account
                </router-link>
                <router-link to="/signup?track=driving" class="dropdown-item">
                  <font-awesome-icon icon="fas fa-car" />
                  Driving Course Account
                </router-link>
              </div>
            </div>
            <a href="tel:+1234567890" class="btn btn-outline btn-large">
              <font-awesome-icon icon="fas fa-phone-alt" />
              Call for Assistance
            </a>
          </div>
        </div>
      </div>
    </section>

    <!-- Footer -->
    <footer class="footer">
      <div class="footer-container">
        <div class="footer-main">
          <div class="footer-brand">
            <div class="logo-container">
              <div class="logo-box">
                <img src="/facet-logo.png" alt="FACET" class="logo-img" />
              </div>
              <div class="logo-text">
                <span class="logo-main">E-FACET</span>
                <span class="logo-sub">Digital Enrollment System</span>
              </div>
            </div>
            <p class="footer-description">
              Transforming education through technology, providing seamless enrollment and training experiences.
            </p>
            <div class="social-links">
              <a href="#" class="social-link"><font-awesome-icon :icon="['fab', 'facebook-f']" /></a>
              <a href="#" class="social-link"><font-awesome-icon :icon="['fab', 'twitter']" /></a>
              <a href="#" class="social-link"><font-awesome-icon :icon="['fab', 'instagram']" /></a>
              <a href="#" class="social-link"><font-awesome-icon :icon="['fab', 'youtube']" /></a>
            </div>
          </div>
          
          <div class="footer-links">
            <div class="footer-column">
              <h3>Platform</h3>
              <a href="#features">Features</a>
              <a href="#programs">Programs</a>
              <a href="#how-it-works">How It Works</a>
              <a href="#faq">FAQs</a>
            </div>
            
            <div class="footer-column">
              <h3>Program Access</h3>
              <a href="/login?track=tesda">
                <font-awesome-icon icon="fas fa-graduation-cap" /> TESDA Login
              </a>
              <a href="/login?track=driving">
                <font-awesome-icon icon="fas fa-car" /> Driving Course Login
              </a>
              <a href="/signup?track=tesda">
                <font-awesome-icon icon="fas fa-user-plus" /> TESDA Sign Up
              </a>
              <a href="/signup?track=driving">
                <font-awesome-icon icon="fas fa-user-plus" /> Driving Sign Up
              </a>
            </div>
            
            <div class="footer-column">
              <h3>Contact</h3>
              <a href="tel:+1234567890">
                <font-awesome-icon icon="fas fa-phone" /> (123) 456-7890
              </a>
              <a href="mailto:info@efacet.com">
                <font-awesome-icon icon="fas fa-envelope" /> info@efacet.com
              </a>
              <a href="#">
                <font-awesome-icon icon="fas fa-map-marker-alt" /> Training Center
              </a>
              <a href="#">
                <font-awesome-icon icon="fas fa-clock" /> Mon-Fri, 8AM-5PM
              </a>
            </div>
          </div>
        </div>
        
        <div class="footer-bottom">
          <p>&copy; {{ currentYear }} E-FACET Enrollment System. All rights reserved.</p>
          <div class="footer-legal">
            <span>Official Partner: TESDA Accredited</span>
            <span>LTO Accredited Training Center</span>
          </div>
        </div>
      </div>
    </footer>
  </div>
</template>

<script>
export default {
  name: 'LandingPage',
  data() {
    return {
      mobileMenuOpen: false,
      currentYear: new Date().getFullYear()
    }
  },
  mounted() {
    // Add scroll effect to navbar
    window.addEventListener('scroll', this.handleScroll)
  },
  beforeUnmount() {
    window.removeEventListener('scroll', this.handleScroll)
  },
  methods: {
    handleScroll() {
      const navbar = document.querySelector('.navbar')
      if (window.scrollY > 50) {
        navbar.classList.add('scrolled')
      } else {
        navbar.classList.remove('scrolled')
      }
    },
    toggleMobileMenu() {
      this.mobileMenuOpen = !this.mobileMenuOpen
    }
  }
}
</script>

<style scoped>
/* Base Styles */
.landing-page {
  font-family: 'Inter', 'Segoe UI', system-ui, sans-serif;
  color: #ffffff;
  min-height: 100vh;
  position: relative;
  overflow-x: hidden;
}

/* Background Container */
.background-container {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: -2;
}

.background-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  filter: blur(2px) brightness(0.8);
  transform: scale(1.1);
}

.background-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
    135deg,
    rgba(0, 0, 0, 0.7) 0%,
    rgba(0, 0, 0, 0.4) 50%,
    rgba(0, 0, 0, 0.6) 100%
  );
  backdrop-filter: blur(2px);
}

/* Navigation */
.navbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  padding: 1rem 0;
  transition: all 0.3s ease;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(16, 185, 129, 0.1);
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.navbar.scrolled {
  padding: 0.5rem 0;
  background: rgba(255, 255, 255, 0.98);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}

.nav-container {
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 2rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

/* Logo Container */
.logo-container {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.logo-box {
  width: 50px;
  height: 50px;
  background: white;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border: 2px solid rgba(16, 185, 129, 0.2);
  transition: all 0.3s ease;
}

.logo-box:hover {
  transform: rotate(5deg);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
  border-color: rgba(16, 185, 129, 0.4);
}

.logo-img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  filter: none;
}

.logo-text {
  display: flex;
  flex-direction: column;
}

.logo-main {
  font-size: 1.5rem;
  font-weight: 800;
  color: #111827;
  line-height: 1;
  background: linear-gradient(90deg, #10b981, #059669);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.logo-sub {
  font-size: 0.75rem;
  color: #6b7280;
  font-weight: 500;
}

.nav-links {
  display: flex;
  gap: 2rem;
  align-items: center;
}

.nav-link {
  color: #374151;
  text-decoration: none;
  font-weight: 500;
  font-size: 0.95rem;
  padding: 0.5rem 0;
  position: relative;
  transition: color 0.3s;
}

.nav-link:hover,
.nav-link.active {
  color: #059669;
}

.nav-link::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 0;
  height: 2px;
  background: linear-gradient(90deg, #10b981, #059669);
  transition: width 0.3s;
}

.nav-link:hover::after,
.nav-link.active::after {
  width: 100%;
}

.nav-actions {
  display: flex;
  gap: 1rem;
  align-items: center;
}

/* Authentication Dropdowns */
.auth-dropdown {
  position: relative;
  display: inline-block;
}

.dropdown-toggle {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  white-space: nowrap;
  border: none;
  outline: none;
}

.dropdown-menu {
  position: absolute;
  top: 100%;
  left: 0;
  background: white;
  border-radius: 12px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  min-width: 200px;
  padding: 0.75rem 0;
  margin-top: 0.5rem;
  opacity: 0;
  visibility: hidden;
  transform: translateY(-10px);
  transition: all 0.3s ease;
  z-index: 1000;
  border: 1px solid #e5e7eb;
}

.auth-dropdown:hover .dropdown-menu {
  opacity: 1;
  visibility: visible;
  transform: translateY(0);
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1.25rem;
  color: #374151;
  text-decoration: none;
  font-weight: 500;
  transition: all 0.2s;
  border-left: 3px solid transparent;
}

.dropdown-item:hover {
  background: #f9fafb;
  color: #059669;
  border-left-color: #10b981;
}

.dropdown-item font-awesome-icon {
  width: 20px;
  text-align: center;
  color: #10b981;
}

.btn {
  padding: 0.625rem 1.5rem;
  border-radius: 8px;
  font-weight: 600;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.3s;
  cursor: pointer;
  border: 2px solid transparent;
  font-size: 0.95rem;
}

.btn-primary {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 25px rgba(16, 185, 129, 0.3);
}

.btn-outline {
  background: transparent;
  color: #059669;
  border-color: #d1fae5;
}

.btn-outline:hover {
  background: rgba(16, 185, 129, 0.1);
  border-color: #10b981;
}

.btn-large {
  padding: 1rem 2rem;
  font-size: 1.1rem;
}

.btn-small {
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
}

.mobile-menu-btn {
  display: none;
  background: none;
  border: none;
  font-size: 1.5rem;
  color: #374151;
  cursor: pointer;
}

.mobile-menu {
  display: none;
  background: white;
  padding: 1rem;
  border-top: 1px solid #e5e7eb;
}

.mobile-nav-link {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  color: #374151;
  text-decoration: none;
  border-bottom: 1px solid #f3f4f6;
  transition: background 0.3s;
}

.mobile-nav-link:hover {
  background: #f9fafb;
  color: #059669;
}

.mobile-nav-link font-awesome-icon {
  width: 20px;
  text-align: center;
}

/* Mobile Authentication Section */
.mobile-auth-section {
  padding: 1.5rem;
  border-top: 1px solid #e5e7eb;
}

.mobile-auth-title {
  color: #374151;
  font-size: 1rem;
  margin: 1rem 0 0.75rem;
  font-weight: 600;
}

.mobile-auth-actions {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
}

/* Hero Section */
.hero {
  padding: 12rem 0 6rem;
  position: relative;
}

.hero-container {
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 2rem;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4rem;
  align-items: center;
}

.hero-content {
  max-width: 600px;
}

.badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: rgba(255, 255, 255, 0.15);
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 50px;
  font-size: 0.875rem;
  font-weight: 600;
  margin-bottom: 2rem;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.badge-dot {
  width: 8px;
  height: 8px;
  background: #10b981;
  border-radius: 50%;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.hero-title {
  font-size: 3.5rem;
  font-weight: 800;
  line-height: 1.1;
  margin-bottom: 1.5rem;
  color: white;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.highlight {
  background: linear-gradient(90deg, #10b981, #34d399);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.hero-description {
  font-size: 1.125rem;
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: 2.5rem;
  line-height: 1.7;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
}

/* Quick Authentication in Hero */
.quick-auth {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 15px;
  padding: 1.5rem;
  margin: 2rem 0;
  border: 1px solid rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
}

.quick-auth-group {
  margin-bottom: 1rem;
}

.quick-auth-group:last-child {
  margin-bottom: 0;
}

.quick-auth-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: white;
  font-size: 1rem;
  margin-bottom: 0.75rem;
  font-weight: 600;
}

.quick-auth-title font-awesome-icon {
  color: #10b981;
}

.quick-auth-actions {
  display: flex;
  gap: 0.75rem;
}

.hero-stats {
  display: flex;
  gap: 3rem;
}

.stat {
  text-align: center;
}

.stat-number {
  font-size: 2rem;
  font-weight: 700;
  color: #10b981;
  margin-bottom: 0.25rem;
  font-feature-settings: "tnum";
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.stat-label {
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.875rem;
  font-weight: 500;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
}

/* Hero Visual - Fixed */
.hero-visual {
  position: relative;
  height: 500px;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Dashboard Preview - Centered and Fixed */
.dashboard-preview {
  position: relative;
  width: 340px;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 20px;
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.3);
  overflow: hidden;
  z-index: 50;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  margin: 0 auto;
}

.dashboard-header {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  padding: 1.25rem 1.5rem;
  color: white;
  display: flex;
  align-items: center;
  gap: 1rem;
}

.dashboard-dots {
  display: flex;
  gap: 0.5rem;
}

.dashboard-dots span {
  width: 10px;
  height: 10px;
  background: rgba(255, 255, 255, 0.6);
  border-radius: 50%;
}

.dashboard-title {
  font-weight: 600;
  font-size: 1rem;
  flex: 1;
}

.dashboard-badge {
  background: rgba(255, 255, 255, 0.2);
  padding: 0.25rem 0.75rem;
  border-radius: 50px;
  font-size: 0.75rem;
  font-weight: 500;
}

.dashboard-content {
  padding: 1.5rem;
}

.progress-section {
  margin-bottom: 1.5rem;
}

.progress-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
  color: #374151;
  font-size: 0.875rem;
  font-weight: 500;
}

.progress-percent {
  color: #059669;
  font-weight: 600;
  font-size: 0.875rem;
}

.progress-bar {
  height: 8px;
  background: #e5e7eb;
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #10b981, #34d399);
  border-radius: 4px;
  transition: width 1s ease-in-out;
}

.quick-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  background: #f9fafb;
  border-radius: 10px;
  transition: transform 0.3s;
}

.stat-item:hover {
  transform: translateY(-2px);
}

.stat-icon {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 0.875rem;
}

.stat-icon.docs {
  background: linear-gradient(135deg, #3b82f6, #1d4ed8);
}

.stat-icon.sessions {
  background: linear-gradient(135deg, #10b981, #059669);
}

.stat-icon.exams {
  background: linear-gradient(135deg, #8b5cf6, #7c3aed);
}

.stat-info {
  flex: 1;
}

.stat-value {
  font-weight: 700;
  color: #111827;
  font-size: 1rem;
  line-height: 1;
  margin-bottom: 0.125rem;
}

.stat-label {
  color: #6b7280;
  font-size: 0.75rem;
  text-shadow: none;
}

.recent-activity {
  padding-top: 1.5rem;
  border-top: 1px solid #e5e7eb;
}

.activity-title {
  color: #374151;
  font-size: 0.875rem;
  font-weight: 600;
  margin-bottom: 0.75rem;
}

.activity-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #6b7280;
  font-size: 0.75rem;
  margin-bottom: 0.5rem;
}

.activity-item font-awesome-icon {
  color: #10b981;
  font-size: 0.75rem;
}

/* Clean Floating Cards - NO GREEN TOP */
.floating-card {
  position: absolute;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 12px;
  padding: 1rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
  z-index: 100;
  width: 200px;
  animation: floatSimple 6s ease-in-out infinite;
}

/* REMOVED the green top line from floating cards */
/* .floating-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, #10b981, #34d399);
  border-radius: 12px 12px 0 0;
} */

.card-1 {
  top: 15%;
  left: 5%;
  animation-delay: 0s;
}

.card-2 {
  top: 60%;
  right: 5%;
  animation-delay: 2s;
}

.card-3 {
  bottom: 20%;
  left: 15%;
  animation-delay: 4s;
}

@keyframes floatSimple {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

.floating-icon {
  width: 36px;
  height: 36px;
  background: linear-gradient(135deg, #10b981, #059669);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1rem;
  flex-shrink: 0;
}

.floating-content {
  flex: 1;
  min-width: 0;
}

.floating-card h4 {
  color: #111827;
  font-size: 0.9rem;
  font-weight: 600;
  margin-bottom: 0.25rem;
  line-height: 1.2;
}

.floating-card p {
  color: #6b7280;
  font-size: 0.75rem;
  line-height: 1.2;
  margin: 0;
}

/* Ensure floating cards are always on top */
.floating-card:hover {
  transform: scale(1.05);
  z-index: 200;
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.25);
  transition: all 0.3s ease;
}

/* Sections */
.section-container {
  max-width: 1280px;
  margin: 0 auto;
  padding: 6rem 2rem;
  position: relative;
}

.section-header {
  text-align: center;
  max-width: 600px;
  margin: 0 auto 4rem;
  position: relative;
  z-index: 1;
}

.section-label {
  color: #10b981;
  font-weight: 600;
  font-size: 0.875rem;
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-bottom: 1rem;
  display: inline-block;
  background: rgba(16, 185, 129, 0.1);
  padding: 0.5rem 1rem;
  border-radius: 50px;
  backdrop-filter: blur(10px);
}

.section-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: white;
  margin-bottom: 1rem;
  line-height: 1.2;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.section-description {
  color: rgba(255, 255, 255, 0.9);
  font-size: 1.125rem;
  line-height: 1.7;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
}

/* Programs */
.programs {
  background: rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(10px);
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.programs-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  margin-top: 2rem;
}

.program-card {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  padding: 2rem;
  position: relative;
  transition: all 0.3s;
  border: 1px solid rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
}

.program-card:hover {
  transform: translateY(-10px);
  border-color: rgba(16, 185, 129, 0.3);
  background: rgba(255, 255, 255, 0.15);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
}

.program-card.featured {
  border-color: #10b981;
  background: rgba(16, 185, 129, 0.1);
}

.featured-badge {
  position: absolute;
  top: -12px;
  right: 2rem;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  padding: 0.5rem 1.5rem;
  border-radius: 50px;
  font-size: 0.75rem;
  font-weight: 600;
  box-shadow: 0 4px 15px rgba(16, 185, 129, 0.3);
}

.program-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1.5rem;
}

.program-icon {
  width: 60px;
  height: 60px;
  border-radius: 15px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.75rem;
  color: white;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
}

.program-icon.tesda {
  background: linear-gradient(135deg, #3b82f6, #1d4ed8);
}

.program-icon.driving {
  background: linear-gradient(135deg, #10b981, #059669);
}

.program-icon.corporate {
  background: linear-gradient(135deg, #8b5cf6, #7c3aed);
}

.program-badge .badge-text {
  background: rgba(255, 255, 255, 0.15);
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 50px;
  font-size: 0.75rem;
  font-weight: 500;
  backdrop-filter: blur(10px);
}

.program-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: white;
  margin-bottom: 1rem;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
}

.program-description {
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: 1.5rem;
  line-height: 1.6;
}

.program-features {
  list-style: none;
  padding: 0;
  margin-bottom: 2rem;
}

.program-features li {
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 0.75rem;
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  font-size: 0.95rem;
}

.program-features font-awesome-icon {
  color: #10b981;
  margin-top: 0.2rem;
  flex-shrink: 0;
}

/* Program Authentication */
.program-auth {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  padding: 1rem;
  margin: 1.5rem 0;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.auth-title {
  color: white;
  font-size: 0.95rem;
  font-weight: 600;
  margin-bottom: 0.75rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.auth-actions {
  display: flex;
  gap: 0.75rem;
}

.program-actions {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.btn-link {
  color: #10b981;
  text-decoration: none;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: color 0.3s;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
}

.btn-link:hover {
  color: #34d399;
}

/* Features */
.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  margin-top: 2rem;
}

.feature-item {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 15px;
  padding: 2rem;
  transition: all 0.3s;
  border: 1px solid rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
}

.feature-item:hover {
  transform: translateY(-5px);
  border-color: rgba(16, 185, 129, 0.3);
  background: rgba(255, 255, 255, 0.15);
  box-shadow: 0 15px 30px rgba(0, 0, 0, 0.2);
}

.feature-icon {
  width: 60px;
  height: 60px;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1.5rem;
  color: white;
  font-size: 1.5rem;
  box-shadow: 0 8px 20px rgba(16, 185, 129, 0.3);
}

.feature-item h3 {
  font-size: 1.25rem;
  font-weight: 600;
  color: white;
  margin-bottom: 0.75rem;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
}

.feature-item p {
  color: rgba(255, 255, 255, 0.9);
  line-height: 1.6;
}

/* How It Works */
.how-it-works {
  background: rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(10px);
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.steps-container {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  position: relative;
  max-width: 1000px;
  margin: 0 auto 4rem;
  padding: 2rem 0;
}

.step {
  flex: 1;
  text-align: center;
  position: relative;
  z-index: 2;
}

.step-number {
  font-size: 3rem;
  font-weight: 800;
  color: rgba(16, 185, 129, 0.2);
  margin-bottom: 1rem;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.step-icon {
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1.5rem;
  color: white;
  font-size: 2rem;
  box-shadow: 0 10px 25px rgba(16, 185, 129, 0.3);
}

.step h3 {
  font-size: 1.25rem;
  font-weight: 600;
  color: white;
  margin-bottom: 0.5rem;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
}

.step p {
  color: rgba(255, 255, 255, 0.9);
  font-size: 0.95rem;
  max-width: 200px;
  margin: 0 auto;
}

.step-line {
  position: absolute;
  top: 1px;
  left: 25%;
  right: 25%;
  height: 2px;
  background: rgba(16, 185, 129, 0.3);
  z-index: 1;
}

.step-line::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 100%;
  background: linear-gradient(90deg, #10b981, #059669);
  animation: lineProgress 8s ease-in-out infinite;
}

@keyframes lineProgress {
  0%, 100% { width: 0; }
  50% { width: 100%; }
}

.process-visual {
  position: relative;
  height: 100px;
  max-width: 800px;
  margin: 0 auto;
}

.process-line {
  position: absolute;
  top: 50%;
  left: 10%;
  right: 10%;
  height: 4px;
  background: linear-gradient(90deg, #10b981, #059669);
  transform: translateY(-50%);
  border-radius: 2px;
}

.process-point {
  position: absolute;
  top: 50%;
  width: 20px;
  height: 20px;
  background: white;
  border: 3px solid #10b981;
  border-radius: 50%;
  transform: translateY(-50%);
  box-shadow: 0 0 20px rgba(16, 185, 129, 0.5);
}

.process-point::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 8px;
  height: 8px;
  background: #10b981;
  border-radius: 50%;
}

.point-1 { left: 10%; }
.point-2 { left: 37%; }
.point-3 { left: 64%; }
.point-4 { left: 90%; }

/* CTA */
.cta {
  background: rgba(16, 185, 129, 0.9);
  padding: 6rem 0;
  position: relative;
  overflow: hidden;
  border-top: 1px solid rgba(255, 255, 255, 0.2);
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
}

.cta-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 0 2rem;
  text-align: center;
  position: relative;
  z-index: 2;
}

.logo-watermark {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  opacity: 0.1;
  z-index: 1;
}

.logo-box-large {
  width: 400px;
  height: 400px;
  background: white;
  border-radius: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 60px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.logo-img-large {
  width: 100%;
  height: 100%;
  object-fit: contain;
  filter: none;
}

.cta h2 {
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 1rem;
  color: white;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  position: relative;
  z-index: 2;
}

.cta p {
  font-size: 1.25rem;
  opacity: 0.9;
  margin-bottom: 2.5rem;
  color: rgba(255, 255, 255, 0.95);
  position: relative;
  z-index: 2;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
}

.cta-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  position: relative;
  z-index: 2;
}

.cta .btn-primary {
  background: white;
  color: #059669;
}

.cta .btn-outline {
  background: transparent;
  color: white;
  border: 2px solid rgba(255, 255, 255, 0.3);
}

.cta .btn-outline:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: white;
}

/* Footer */
.footer {
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(10px);
  padding: 4rem 0 2rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.footer-container {
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 2rem;
}

.footer-main {
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 4rem;
  margin-bottom: 3rem;
}

.footer-brand {
  max-width: 300px;
}

.footer-brand .logo-container {
  margin-bottom: 1.5rem;
}

.footer-description {
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 2rem;
  line-height: 1.7;
}

.social-links {
  display: flex;
  gap: 1rem;
}

.social-link {
  width: 40px;
  height: 40px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  text-decoration: none;
  transition: all 0.3s;
}

.social-link:hover {
  background: #10b981;
  transform: translateY(-3px);
}

.footer-links {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 2rem;
}

.footer-column h3 {
  font-size: 1.125rem;
  font-weight: 600;
  color: white;
  margin-bottom: 1.5rem;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
}

.footer-column a {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: rgba(255, 255, 255, 0.7);
  text-decoration: none;
  margin-bottom: 0.75rem;
  transition: color 0.3s;
  font-size: 0.95rem;
}

.footer-column a:hover {
  color: #10b981;
}

.footer-bottom {
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  padding-top: 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: rgba(255, 255, 255, 0.5);
  font-size: 0.875rem;
}

.footer-legal {
  display: flex;
  gap: 2rem;
}

.footer-legal span {
  padding: 0.25rem 0.75rem;
  background: rgba(16, 185, 129, 0.2);
  border-radius: 4px;
  color: #10b981;
  font-size: 0.75rem;
  font-weight: 500;
}

/* Responsive Design */
@media (max-width: 1024px) {
  .hero-container {
    grid-template-columns: 1fr;
    text-align: center;
    gap: 3rem;
  }
  
  .hero-stats {
    justify-content: center;
  }
  
  .steps-container {
    flex-direction: column;
    gap: 3rem;
  }
  
  .step-line {
    display: none;
  }
  
  .footer-main {
    grid-template-columns: 1fr;
    gap: 3rem;
  }
  
  .process-visual {
    display: none;
  }
  
  /* Adjust floating cards for tablet */
  .floating-card {
    width: 180px;
  }
  
  .card-1 {
    top: 10%;
    left: 2%;
  }
  
  .card-2 {
    top: 65%;
    right: 2%;
  }
  
  .card-3 {
    bottom: 15%;
    left: 10%;
  }
}

@media (max-width: 768px) {
  .nav-links, .nav-actions {
    display: none;
  }
  
  .mobile-menu-btn {
    display: block;
  }
  
  .mobile-menu {
    display: block;
  }
  
  .hero-title {
    font-size: 2.5rem;
  }
  
  .section-title {
    font-size: 2rem;
  }
  
  .hero-actions, .cta-actions {
    flex-direction: column;
  }
  
  .btn {
    width: 100%;
    justify-content: center;
  }
  
  /* Floating cards on mobile */
  .floating-card {
    position: relative !important;
    width: 100%;
    margin: 1rem 0;
    animation: none;
    transform: none !important;
    opacity: 0.9;
  }
  
  .card-1, .card-2, .card-3 {
    position: relative;
    top: auto;
    left: auto;
    right: auto;
    bottom: auto;
    transform: none !important;
    margin: 1rem auto;
  }
  
  .hero-visual {
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  
  .dashboard-preview {
    position: relative;
    margin-bottom: 2rem;
  }
  
  .quick-auth-actions,
  .auth-actions,
  .mobile-auth-actions {
    flex-direction: column;
  }
  
  .footer-links {
    grid-template-columns: 1fr;
    gap: 2rem;
  }
  
  .footer-bottom {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }
  
  .footer-legal {
    flex-direction: column;
    gap: 0.5rem;
  }
}

@media (max-width: 480px) {
  .nav-container, .hero-container, .section-container, .cta-container, .footer-container {
    padding: 0 1rem;
  }
  
  .hero {
    padding: 9rem 0 3rem;
  }
  
  .hero-title {
    font-size: 2rem;
  }
  
  .section-title {
    font-size: 1.75rem;
  }
  
  .hero-stats {
    flex-direction: column;
    gap: 1.5rem;
  }
  
  .programs-grid, .features-grid {
    grid-template-columns: 1fr;
  }
  
  .dashboard-preview {
    width: 300px;
  }
  
  .floating-card {
    width: 100%;
    margin: 1rem 0;
  }
  
  .floating-icon {
    width: 32px;
    height: 32px;
    font-size: 0.875rem;
  }
  
  .floating-card h4 {
    font-size: 0.85rem;
  }
  
  .floating-card p {
    font-size: 0.7rem;
  }
}
</style>