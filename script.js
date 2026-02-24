// 1. ประกาศ Lenis ไว้ข้างนอกสุด (เพื่อให้ทุกส่วนเข้าถึงได้)
const lenis = new Lenis({
    duration: 1,
    easing: (t) => 1 - Math.pow(1 - t, 4),
    wheelMultiplier: 1,
    lerp: 0.015,
    smoothWheel: true,
    orientation: 'vertical',
    gestureOrientation: 'vertical',
});

// 2. ฟังก์ชัน loop สำหรับ scroll (ต้องอยู่นอกสุด)
function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
}
requestAnimationFrame(raf);

// 3. รวมคำสั่งอื่นๆ ไว้ใน Load Event
window.addEventListener('load', () => {

    const anchors = document.querySelectorAll('a[href^="#"]');

    anchors.forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault(); // หยุดการ "วาร์ป" และไม่ให้โชว์ # ใน URL

            const targetId = this.getAttribute('href'); // ดึงค่า เช่น #detail หรือ #top

            // ใช้ Lenis สั่งเลื่อนไปที่ตำแหน่งนั้นแบบสโลว์
            lenis.scrollTo(targetId, {
                duration: 2,   // ความนาน (ยิ่งเยอะยิ่งสโลว์)
                offset: 0,       // ระยะเผื่อขอบบน (ถ้ามีเมนู Fix ไว้ให้ปรับตรงนี้)
                easing: (t) => 1 - Math.pow(1 - t, 4) // ความนุ่มนวล
            });
        });
    });

    // --- ระบบแยกตัวอักษรสั่น (text_shaker) ---
    const containers = document.querySelectorAll('.text_shaker');
    containers.forEach((textContainer) => {
        const content = textContainer.innerText;
        textContainer.innerHTML = '';

        // ใช้การดึงตัวอักษรแบบที่รวมสระ/วรรณยุกต์ไทยเข้ากับตัวข้างหน้า
        const chars = [];
        for (let char of content) {
            // ช่วงของสระและวรรณยุกต์ไทยที่ต้องอยู่ติดกับตัวอักษรข้างหน้า
            if (char.match(/[\u0E31\u0E34-\u0E3A\u0E47-\u0E4E]/) && chars.length > 0) {
                chars[chars.length - 1] += char;
            } else {
                chars.push(char);
            }
        }

        chars.forEach((char) => {
            const span = document.createElement('span');
            span.innerText = char === ' ' ? '\u00A0' : char;
            span.classList.add('letter');

            const randomDelay = Math.random() * -2;
            const randomDuration = 0.1 + Math.random() * 0.2;

            span.style.animationDelay = `${randomDelay}s`;
            span.style.animationDuration = `${randomDuration}s`;

            textContainer.appendChild(span);
        });
    });

    // --- ระบบปุ่ม Back (ย้อนกลับหน้าเดิม) ---
    const backButton = document.querySelector('.detail');
    if (backButton) {
        backButton.addEventListener('click', () => {
            window.history.back();
        });
    }

    // --- ระบบปุ่ม Back to Top (ใช้ lenis ที่ประกาศไว้ข้างบน) ---
    const backToTopBtn = document.querySelector('.click-link');
    if (backToTopBtn) {
        backToTopBtn.addEventListener('click', function (e) {
            e.preventDefault();
            lenis.scrollTo(0, {
                duration: 2.5
            });
        });
    }

    // ดึง Element ของปุ่มลูกศรมา
    const btnLeft = document.querySelector('.bt-l');
    const btnRight = document.querySelector('.bt-r');

    // ฟังก์ชันสำหรับไปรูปก่อนหน้า
    function prevSlide() {
        // ถ้า index เป็น 0 ให้ย้อนไปรูปสุดท้าย (index = 2) 
        // ถ้าไม่ใช่ ให้ลบไป 1
        let prevIndex = (currentIndex - 1 + items.length) % items.length;
        goToSlide(prevIndex);
    }

    // เพิ่ม Event ให้ปุ่มซ้าย
    if (btnLeft) {
        btnLeft.addEventListener('click', () => {
            prevSlide();
        });
    }

    // เพิ่ม Event ให้ปุ่มขวา
    if (btnRight) {
        btnRight.addEventListener('click', () => {
            nextSlide();
        });
    }

    // --- Mobile Controls ---
    const btnLeftMobile = document.querySelector('.bt-l-mobile');
    const btnRightMobile = document.querySelector('.bt-r-mobile');

    if (btnLeftMobile) {
        btnLeftMobile.addEventListener('click', () => {
            prevSlide();
        });
    }

    if (btnRightMobile) {
        btnRightMobile.addEventListener('click', () => {
            nextSlide();
        });
    }

    const items = document.querySelectorAll('.item-time');
    const preArea = document.querySelector('.item-pre-area');
    const slideDuration = 5000; // ตั้งเวลา 5 วินาที (ต้องสัมพันธ์กับ CSS animation)
    let currentIndex = 0;
    let slideInterval;

    function goToSlide(index) {
        currentIndex = index;

        // 1. เลื่อนภาพ (left: 0%, -100%, -200%)
        preArea.style.left = `-${currentIndex * 100}%`;

        // 2. จัดการ Class Active
        items.forEach(item => item.classList.remove('active'));
        items[currentIndex].classList.add('active');

        // 3. Reset และเริ่มจับเวลาใหม่
        resetTimer();
    }

    function nextSlide() {
        let nextIndex = (currentIndex + 1) % items.length; // วนกลับไป 0 เมื่อถึงรูปสุดท้าย
        goToSlide(nextIndex);
    }

    function resetTimer() {
        clearTimeout(slideInterval);
        slideInterval = setTimeout(nextSlide, slideDuration);
    }

    // คลิกที่ตัวเลขเพื่อเปลี่ยนสไลด์เอง
    items.forEach((item, index) => {
        item.addEventListener('click', () => {
            goToSlide(index);
        });
    });

    // เริ่มทำงานครั้งแรก
    goToSlide(0);

    // --- ระบบฝนตก (Rain Effect) ---
    const canvas = document.getElementById('rainCanvas');
    const rainToggleBtn = document.getElementById('rainToggleBtn');
    let isRainOn = true;

    if (canvas) {
        const ctx = canvas.getContext('2d');
        let drops = [];
        const MAX_DROPS = 300;
        const DROP_COLOR = 'rgba(174,194,224,0.6)';
        const DROP_WIDTH = 1.5;

        function resizeCanvas() {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        }

        function createDrop() {
            return {
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                length: Math.random() * 20 + 10,
                speed: Math.random() * 10 + 30,
                opacity: Math.random() * 0.5 + 0.3
            };
        }

        function draw() {
            if (!isRainOn) {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                return;
            }

            ctx.clearRect(0, 0, canvas.width, canvas.height);
            for (let i = 0; i < drops.length; i++) {
                let drop = drops[i];
                ctx.beginPath();
                ctx.moveTo(drop.x, drop.y);
                ctx.lineTo(drop.x + DROP_WIDTH, drop.y + drop.length);
                ctx.strokeStyle = DROP_COLOR;
                ctx.lineWidth = DROP_WIDTH;
                ctx.globalAlpha = drop.opacity;
                ctx.stroke();

                drop.y += drop.speed;
                if (drop.y > canvas.height) {
                    drop.y = -drop.length;
                    drop.x = Math.random() * canvas.width;
                }
            }
            while (drops.length < MAX_DROPS) {
                drops.push(createDrop());
            }
            requestAnimationFrame(draw);
        }

        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);
        draw();

        // Toggle logic
        if (rainToggleBtn) {
            rainToggleBtn.addEventListener('click', () => {
                isRainOn = !isRainOn;
                if (isRainOn) {
                    rainToggleBtn.classList.remove('off');
                    draw(); // Restart animation loop if it was stopped
                } else {
                    rainToggleBtn.classList.add('off');
                }
            });
        }
    }

    // --- Mobile Menu Toggle ---
    const burgerMenu = document.querySelector('.burger-menu');
    const navMenu = document.querySelector('.area-r');

    if (burgerMenu && navMenu) {
        burgerMenu.addEventListener('click', () => {
            navMenu.classList.toggle('active'); // Slide in/out
            burgerMenu.classList.toggle('active'); // Change icon to X
        });

        // Close menu when clicking a link
        const navLinks = navMenu.querySelectorAll('a');
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                navMenu.classList.remove('active');
                burgerMenu.classList.remove('active');
            });
        });
    }

    // --- ระบบ Scroll Reveal (ค่อยๆ โผล่เมื่อเลื่อนถึง) ---
    const revealOptions = {
        threshold: 0.05,
        rootMargin: "0px 0px -10px 0px"
    };

    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
            } else {
                entry.target.classList.remove('active');
            }
        });
    }, revealOptions);

    document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));


});
