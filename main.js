// --- DOM ELEMENTS ---
const navbar = document.getElementById('navbar');
const menuToggle = document.querySelector('.menu-toggle');
const navLinks = document.querySelector('.nav-links');
const navItems = document.querySelectorAll('.nav-links a');
const reveals = document.querySelectorAll('.scroll-reveal');

// --- NAVIGATION TOGGLE (Mobile) ---
menuToggle.addEventListener('click', () => {
    navLinks.classList.toggle('active');
    const icon = menuToggle.querySelector('i');
    if(navLinks.classList.contains('active')) {
        icon.classList.remove('fa-bars');
        icon.classList.add('fa-times');
    } else {
        icon.classList.remove('fa-times');
        icon.classList.add('fa-bars');
    }
});

// Close menu when clicking a link
navItems.forEach(item => {
    item.addEventListener('click', () => {
        navLinks.classList.remove('active');
        const icon = menuToggle.querySelector('i');
        icon.classList.remove('fa-times');
        icon.classList.add('fa-bars');
    });
});

// --- SCROLL EFFECTS ---
window.addEventListener('scroll', () => {
    // Navbar background
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
    
    // Active Navigation Link Highlight
    let current = '';
    const sections = document.querySelectorAll('section');
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        if (pageYOffset >= (sectionTop - 200)) {
            current = section.getAttribute('id');
        }
    });

    navItems.forEach(a => {
        a.classList.remove('active');
        if (a.getAttribute('href').includes(current)) {
            a.classList.add('active');
        }
    });

    // Reveal elements on scroll
    reveals.forEach(reveal => {
        const windowHeight = window.innerHeight;
        const elementTop = reveal.getBoundingClientRect().top;
        const elementVisible = 100;
        if (elementTop < windowHeight - elementVisible) {
            reveal.classList.add('visible');
        }
    });
});

// Trigger scroll once on load
window.dispatchEvent(new Event('scroll'));

// --- CAROUSEL LOGIC ---
const track = document.querySelector('.carousel-track');
const slides = Array.from(track.children);
const nextButton = document.querySelector('.next-btn');
const prevButton = document.querySelector('.prev-btn');
const nav = document.querySelector('.carousel-nav');

// Create dots dynamically
slides.forEach((_, index) => {
    const dot = document.createElement('span');
    dot.classList.add('dot');
    if(index === 0) dot.classList.add('active');
    dot.dataset.index = index;
    nav.appendChild(dot);
});
const dots = Array.from(nav.children);

let currentSlideIndex = 0;

function updateCarousel(index) {
    slides.forEach(slide => slide.classList.remove('active'));
    dots.forEach(dot => dot.classList.remove('active'));
    
    slides[index].classList.add('active');
    dots[index].classList.add('active');
    currentSlideIndex = index;
}

nextButton.addEventListener('click', () => {
    let nextIndex = currentSlideIndex + 1;
    if (nextIndex >= slides.length) nextIndex = 0;
    updateCarousel(nextIndex);
});

prevButton.addEventListener('click', () => {
    let prevIndex = currentSlideIndex - 1;
    if (prevIndex < 0) prevIndex = slides.length - 1;
    updateCarousel(prevIndex);
});

dots.forEach(dot => {
    dot.addEventListener('click', e => {
        const index = parseInt(e.target.dataset.index);
        updateCarousel(index);
    });
});

// Auto slide
setInterval(() => {
    let nextIndex = currentSlideIndex + 1;
    if (nextIndex >= slides.length) nextIndex = 0;
    updateCarousel(nextIndex);
}, 5000);

// --- MESSAGE IN A BOTTLE FORM ---
const bottleForm = document.getElementById('bottle-form');
const messageText = document.getElementById('message-text');
const charCount = document.getElementById('char-count');
const formStatus = document.getElementById('form-status');
const submitBtn = document.getElementById('submit-btn');
const bottleAnimation = document.getElementById('bottle-animation');

// Character counter
messageText.addEventListener('input', () => {
    const len = messageText.value.length;
    charCount.textContent = len;
});

// Form Submission
bottleForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Honeypot check
    const honeypot = document.getElementById('honeypot').value;
    if (honeypot) {
        return; // Bot detected, quietly exit
    }

    // Rate Limiting (1 message per minute)
    const lastSent = localStorage.getItem('lastMessageTime');
    const now = Date.now();
    if (lastSent && now - parseInt(lastSent) < 60000) {
        formStatus.textContent = "Please wait a minute before sending another message. The tide is currently low.";
        formStatus.className = 'form-status status-error';
        return;
    }

    const message = messageText.value.trim();
    if (message.length === 0 || message.length > 500) {
        formStatus.textContent = "Message must be between 1 and 500 characters.";
        formStatus.className = 'form-status status-error';
        return;
    }

    const moodInput = document.querySelector('input[name="mood"]:checked');
    const mood = moodInput ? moodInput.value : '';

    // UI Update (Loading state)
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span>Throwing...</span> <i class="fas fa-spinner fa-spin"></i>';

    try {
        // Attempt to save to Firebase if initialized
        if (window.db) {
            await window.db.collection('messages').add({
                text: message,
                mood: mood,
                timestamp: firebase.firestore.FieldValue.serverTimestamp()
            });
        } else {
            // Demo mode simulation
            console.log("Firebase not configured. Running in Demo Mode.");
            console.log("Message:", message, "Mood:", mood);
            await new Promise(r => setTimeout(r, 1000)); // simulate network request
        }

        // Success state
        localStorage.setItem('lastMessageTime', now.toString());
        formStatus.textContent = "Your message is adrift in the sea!";
        formStatus.className = 'form-status status-success';
        
        // Show Animation
        bottleForm.style.display = 'none';
        bottleAnimation.classList.remove('hidden');

        // Reset Form
        bottleForm.reset();
        charCount.textContent = '0';
        
        // Bring back form after animation (optional, let's just leave it hidden for a bit)
        setTimeout(() => {
            bottleAnimation.classList.add('hidden');
            bottleForm.style.display = 'block';
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<span>Throw into the sea</span> <i class="fas fa-water"></i>';
            formStatus.textContent = '';
        }, 3000);

    } catch (error) {
        console.error("Error sending message:", error);
        formStatus.textContent = "The waves pushed it back. Try again later.";
        formStatus.className = 'form-status status-error';
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<span>Throw into the sea</span> <i class="fas fa-water"></i>';
    }
});

// --- YOUTUBE API & MUSIC CONTROL ---
let ytPlayer;
let isMusicPlaying = false;
let isPlayerReady = false;
let userClickedEnter = false;
const muteBtn = document.getElementById('mute-btn');
const splashScreen = document.getElementById('splash-screen');
const enterBtn = document.getElementById('enter-btn');

// Fallback video IDs in case official Disney video blocks embedding (error 101/150)
const musicVideoIds = ['cPAbx5kgCJo', 'gme8u3a-g4A', 'L0MK7qz13bU'];
let currentVideoIndex = 0;

// Lock scroll initially
document.body.style.overflow = 'hidden';

// Load user preference
let savedMuteState = false;
try {
    savedMuteState = localStorage.getItem('portfolio_music_muted') === 'true';
} catch (e) {
    console.log("Local storage not accessible");
}

function updateMuteButtonUI(playing, muted, error = false) {
    const icon = muteBtn.querySelector('i');
    if (!icon) return;
    
    if (error) {
        icon.className = 'fas fa-volume-xmark';
        muteBtn.disabled = true;
        muteBtn.title = "Music unavailable";
        return;
    }
    
    muteBtn.disabled = false;
    if (playing && !muted) {
        icon.className = 'fas fa-compact-disc record-icon spinning';
        muteBtn.title = "Mute Music";
    } else {
        icon.className = 'fas fa-volume-xmark record-icon';
        muteBtn.title = "Unmute Music";
    }
}

function onYouTubeIframeAPIReady() {
    ytPlayer = new YT.Player('youtube-player', {
        height: '0',
        width: '0',
        videoId: musicVideoIds[currentVideoIndex],
        playerVars: {
            'autoplay': 0,
            'controls': 0,
            'loop': 1,
            'playlist': musicVideoIds[currentVideoIndex],
            'playsinline': 1,
            'start': 19,
            'origin': window.location.origin || '*'
        },
        events: {
            'onReady': onPlayerReady,
            'onError': onPlayerError,
            'onStateChange': onPlayerStateChange
        }
    });
}

function onPlayerReady(event) {
    isPlayerReady = true;
    ytPlayer.setVolume(40);
    
    // If user already clicked "Ready" on splash screen before player was ready
    if (userClickedEnter && !savedMuteState) {
        startMusicPlayback();
    }
}

function startMusicPlayback() {
    if (!ytPlayer) return;
    try {
        if (typeof ytPlayer.seekTo === 'function') {
            ytPlayer.seekTo(19, true);
        }
        if (typeof ytPlayer.playVideo === 'function') {
            ytPlayer.playVideo();
            isMusicPlaying = true;
            updateMuteButtonUI(true, false);
        }
    } catch (err) {
        console.error("Playback error:", err);
    }
}

function onPlayerStateChange(event) {
    // When video starts playing or loops back, ensure it plays from 00:19 onwards
    if (event.data === YT.PlayerState.PLAYING) {
        isMusicPlaying = true;
        updateMuteButtonUI(true, false);
        if (typeof ytPlayer.getCurrentTime === 'function' && ytPlayer.getCurrentTime() < 18) {
            ytPlayer.seekTo(19, true);
        }
    } else if (event.data === YT.PlayerState.PAUSED) {
        isMusicPlaying = false;
        updateMuteButtonUI(false, savedMuteState);
    }
}

function onPlayerError(event) {
    console.warn("YouTube player error code:", event.data);
    currentVideoIndex++;
    if (currentVideoIndex < musicVideoIds.length) {
        console.log("Attempting fallback video ID:", musicVideoIds[currentVideoIndex]);
        if (ytPlayer && typeof ytPlayer.loadVideoById === 'function') {
            ytPlayer.loadVideoById({
                videoId: musicVideoIds[currentVideoIndex],
                startSeconds: 19
            });
            return;
        }
    }
    updateMuteButtonUI(false, true, true);
}

enterBtn.addEventListener('click', () => {
    userClickedEnter = true;
    
    // Unlock scroll & show main content
    document.body.style.overflow = '';
    document.body.classList.remove('splash-active');
    
    // Hide splash screen
    splashScreen.style.opacity = '0';
    setTimeout(() => {
        splashScreen.style.display = 'none';
    }, 800);
    
    // Play music if player is ready and not muted
    if (isPlayerReady && !savedMuteState) {
        startMusicPlayback();
    }
});

// Toggle Mute button
muteBtn.addEventListener('click', () => {
    if (!ytPlayer || typeof ytPlayer.getPlayerState !== 'function') return;
    
    if (isMusicPlaying) {
        ytPlayer.pauseVideo();
        isMusicPlaying = false;
        savedMuteState = true;
        updateMuteButtonUI(false, true);
        try { localStorage.setItem('portfolio_music_muted', 'true'); } catch(e){}
    } else {
        startMusicPlayback();
        savedMuteState = false;
        try { localStorage.setItem('portfolio_music_muted', 'false'); } catch(e){}
    }
});

// Pause music when tab is hidden
document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
        if (isMusicPlaying && ytPlayer && typeof ytPlayer.pauseVideo === 'function') {
            ytPlayer.pauseVideo();
            recordIcon.classList.remove('spinning');
        }
    } else {
        if (isMusicPlaying && ytPlayer && typeof ytPlayer.playVideo === 'function') {
            ytPlayer.playVideo();
            recordIcon.classList.add('spinning');
        }
    }
});

// Dynamically update water overlay opacity based on scroll
const waterOverlay = document.getElementById('water-overlay');
window.addEventListener('scroll', () => {
    // Max opacity ~0.95 when scrolled down
    const scrollPercent = Math.min(window.scrollY / (document.body.scrollHeight - window.innerHeight), 1);
    // Base opacity 0.45 + up to 0.5 extra
    waterOverlay.style.opacity = 0.45 + (scrollPercent * 0.5);
});
