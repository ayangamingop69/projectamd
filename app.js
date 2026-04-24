document.addEventListener('DOMContentLoaded', () => {
    // State
    let waterConsumed = 750;
    const waterGoal = 2000;
    const glassSize = 250;
    let caloriesTotal = 2000;
    let caloriesConsumed = 760;

    // DOM Elements
    const greetingText = document.getElementById('greeting-text');
    const mealTimeBadge = document.getElementById('meal-time-badge');
    
    // SVG Circular Progress
    const calorieCircle = document.getElementById('calorie-circle');
    const caloriesLeftEl = document.getElementById('calories-left');
    
    // Macro Bars
    const proteinBar = document.getElementById('protein-bar');
    const carbsBar = document.getElementById('carbs-bar');
    const fatsBar = document.getElementById('fats-bar');
    
    // Water Elements
    const waterLevelEl = document.getElementById('water-level');
    const waterConsumedEl = document.getElementById('water-consumed');
    const addWaterBtn = document.getElementById('add-water-btn');
    
    // Interactive Buttons
    const addMealBtns = document.querySelectorAll('.add-meal-btn');
    const logActions = document.querySelectorAll('.log-action');
    const toast = document.getElementById('toast');
    const toastMsg = document.getElementById('toast-msg');

    // --- Time of Day Logic ---
    function setGreetingAndTime() {
        const hour = new Date().getHours();
        let greeting = 'Good Evening';
        let emoji = '🌙';
        let mealTime = 'Dinner';

        if (hour >= 5 && hour < 12) {
            greeting = 'Good Morning';
            emoji = '☀️';
            mealTime = 'Breakfast';
        } else if (hour >= 12 && hour < 17) {
            greeting = 'Good Afternoon';
            emoji = '🌤️';
            mealTime = 'Lunch';
        } else if (hour >= 17 && hour < 21) {
            greeting = 'Good Evening';
            emoji = '🌇';
            mealTime = 'Dinner';
        } else {
            greeting = 'Good Night';
            emoji = '🌌';
            mealTime = 'Late Snack';
        }

        greetingText.innerHTML = `${greeting}! <span class="emoji">${emoji}</span>`;
        mealTimeBadge.textContent = mealTime;
    }

    // --- Progress Ring Logic ---
    function updateProgressRing(consumed, total) {
        const radius = calorieCircle.r.baseVal.value;
        const circumference = radius * 2 * Math.PI;
        
        const percent = Math.min(consumed / total, 1);
        const offset = circumference - (percent * circumference);
        
        // Initial setup for stroke properties in case CSS didn't apply
        calorieCircle.style.strokeDasharray = `${circumference} ${circumference}`;
        
        // Trigger reflow
        calorieCircle.getBoundingClientRect();
        
        calorieCircle.style.strokeDashoffset = offset;
        caloriesLeftEl.textContent = (total - consumed).toLocaleString();
    }

    // --- Water Tracker Logic ---
    function updateWaterTracker() {
        const percentage = Math.min((waterConsumed / waterGoal) * 100, 100);
        // Map 0-100% to visible bottle height (approx 15% to 90%)
        const visibleHeight = 15 + (percentage * 0.75);
        
        waterLevelEl.style.height = `${visibleHeight}%`;
        waterConsumedEl.innerHTML = `${waterConsumed} <span class="unit">ml</span>`;
        
        // Update text under consumed
        const glasses = Math.floor(waterConsumed / glassSize);
        const totalGlasses = Math.floor(waterGoal / glassSize);
        document.querySelector('.water-stats p').textContent = `${glasses} of ${totalGlasses} glasses`;
        
        if (waterConsumed >= waterGoal) {
            addWaterBtn.innerHTML = '<i class="fa-solid fa-check"></i> Goal Met!';
            addWaterBtn.style.background = 'var(--grad-primary)';
            addWaterBtn.disabled = true;
        }
    }

    addWaterBtn.addEventListener('click', () => {
        if (waterConsumed < waterGoal) {
            waterConsumed += glassSize;
            updateWaterTracker();
            showToast('Added 250ml of water! 💧');
            
            // Add a little pop animation
            addWaterBtn.style.transform = 'scale(0.95)';
            setTimeout(() => addWaterBtn.style.transform = 'scale(1)', 150);
        }
    });

    // --- Interactive Logging ---
    function showToast(message) {
        toastMsg.textContent = message;
        toast.classList.add('show');
        
        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }

    addMealBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const mealName = this.parentElement.querySelector('h3').textContent;
            showToast(`Logged: ${mealName}`);
            
            // Simulate adding calories
            caloriesConsumed += 300;
            if (caloriesConsumed > caloriesTotal) caloriesConsumed = caloriesTotal;
            updateProgressRing(caloriesConsumed, caloriesTotal);
            
            // Animate button
            this.innerHTML = '<i class="fa-solid fa-check"></i>';
            this.style.background = 'var(--neon-green)';
            this.style.color = 'var(--bg-color)';
            setTimeout(() => {
                this.innerHTML = '<i class="fa-solid fa-plus"></i>';
                this.style.background = '';
                this.style.color = '';
            }, 2000);
        });
    });

    // --- Modal & Search Logic ---
    const foodModal = document.getElementById('food-modal');
    const closeModalBtn = document.getElementById('close-modal');
    const foodSearch = document.getElementById('food-search');
    const foodResults = document.getElementById('food-results');
    const modalTitle = document.getElementById('modal-title');

    // Sample food database
    const foodDb = [
        { name: 'Apple', calories: 95, desc: '1 medium • High Fiber' },
        { name: 'Banana', calories: 105, desc: '1 medium • Potassium Rich' },
        { name: 'Oatmeal', calories: 150, desc: '1 cup • Complex Carbs' },
        { name: 'Chicken Breast', calories: 165, desc: '3 oz • High Protein' },
        { name: 'Salmon', calories: 206, desc: '3 oz • Healthy Fats' },
        { name: 'Almonds', calories: 164, desc: '1 oz • Healthy Fats' },
        { name: 'Greek Yogurt', calories: 100, desc: '1 container • High Protein' },
        { name: 'Protein Shake', calories: 200, desc: '1 scoop • Muscle Recovery' }
    ];

    function renderFoodResults(foods) {
        foodResults.innerHTML = '';
        if (foods.length === 0) {
            foodResults.innerHTML = '<p style="color: var(--text-secondary); text-align: center; padding: 1rem;">No foods found.</p>';
            return;
        }

        foods.forEach(food => {
            const row = document.createElement('div');
            row.className = 'food-item-row';
            row.innerHTML = `
                <div class="food-item-info">
                    <h4>${food.name}</h4>
                    <p>${food.calories} kcal • ${food.desc}</p>
                </div>
                <button class="add-food-btn" data-calories="${food.calories}" data-name="${food.name}">
                    <i class="fa-solid fa-plus"></i>
                </button>
            `;
            foodResults.appendChild(row);
        });

        // Add event listeners to new buttons
        document.querySelectorAll('.add-food-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const cals = parseInt(this.dataset.calories);
                const name = this.dataset.name;
                
                // Animate button
                this.innerHTML = '<i class="fa-solid fa-check"></i>';
                this.style.background = 'var(--neon-blue)';
                
                setTimeout(() => {
                    caloriesConsumed += cals;
                    if (caloriesConsumed > caloriesTotal) caloriesConsumed = caloriesTotal;
                    updateProgressRing(caloriesConsumed, caloriesTotal);
                    
                    foodModal.classList.remove('active');
                    showToast(`Logged: ${name} (+${cals} kcal)`);
                }, 300);
            });
        });
    }

    logActions.forEach(action => {
        action.addEventListener('click', function() {
            const type = this.querySelector('span').textContent;
            modalTitle.textContent = `Log ${type}`;
            foodSearch.value = '';
            renderFoodResults(foodDb);
            foodModal.classList.add('active');
        });
    });

    closeModalBtn.addEventListener('click', () => {
        foodModal.classList.remove('active');
    });

    // Close on overlay click
    foodModal.addEventListener('click', (e) => {
        if (e.target === foodModal) {
            foodModal.classList.remove('active');
        }
    });

    // Search filter
    foodSearch.addEventListener('input', (e) => {
        const term = e.target.value.toLowerCase();
        const filtered = foodDb.filter(f => f.name.toLowerCase().includes(term));
        renderFoodResults(filtered);
    });

    // --- SPA Routing Logic ---
    const navLinks = document.querySelectorAll('.nav-links a');
    const viewSections = document.querySelectorAll('.view-section');
    const sidebar = document.getElementById('sidebar');
    const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
    const closeSidebarBtn = document.getElementById('close-sidebar');

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            
            // Remove active from all links and sections
            document.querySelectorAll('.nav-links li').forEach(li => li.classList.remove('active'));
            viewSections.forEach(section => section.classList.remove('active'));
            
            // Add active to clicked link's parent li
            e.currentTarget.parentElement.classList.add('active');
            
            // Show target section
            const targetId = e.currentTarget.getAttribute('data-view');
            document.getElementById(targetId).classList.add('active');
            
            // Close mobile sidebar if open
            if (window.innerWidth <= 900) {
                sidebar.classList.remove('open');
            }
        });
    });

    // --- Mobile Menu Toggle ---
    mobileMenuToggle.addEventListener('click', () => {
        sidebar.classList.add('open');
    });
    closeSidebarBtn.addEventListener('click', () => {
        sidebar.classList.remove('open');
    });

    // --- Add Custom Meal Logic ---
    const addMealForm = document.getElementById('add-meal-form');
    const mealTimeline = document.getElementById('meal-timeline');

    function addMealToTimeline(name, cals, picUrl) {
        const item = document.createElement('div');
        item.className = 'timeline-item';
        
        let iconHtml = '<i class="fa-solid fa-utensils"></i>';
        if (picUrl) {
            iconHtml = `<img src="${picUrl}" alt="${name}">`;
        }

        item.innerHTML = `
            <div class="timeline-pic">${iconHtml}</div>
            <div class="timeline-info">
                <h4>${name}</h4>
                <p>${cals} kcal • Just now</p>
            </div>
        `;
        
        // Insert right after the h3
        const h3 = mealTimeline.querySelector('h3');
        h3.insertAdjacentElement('afterend', item);
    }

    addMealForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('custom-meal-name').value;
        const cals = parseInt(document.getElementById('custom-meal-cals').value);
        const pic = document.getElementById('custom-meal-pic').value;
        
        addMealToTimeline(name, cals, pic);
        
        caloriesConsumed += cals;
        if (caloriesConsumed > caloriesTotal) caloriesConsumed = caloriesTotal;
        updateProgressRing(caloriesConsumed, caloriesTotal);
        
        showToast(`Added ${name}!`);
        addMealForm.reset();
    });

    // --- Goals Form Logic ---
    const goalsForm = document.getElementById('goals-form');
    goalsForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const newCalGoal = parseInt(document.getElementById('goal-calories').value);
        const newWaterGoal = parseInt(document.getElementById('goal-water').value);
        
        caloriesTotal = newCalGoal;
        updateProgressRing(caloriesConsumed, caloriesTotal);
        showToast('Goals updated successfully!');
    });

    // Initialize
    setGreetingAndTime();
    
    // Start progress animations after a slight delay for visual effect
    setTimeout(() => {
        updateProgressRing(caloriesConsumed, caloriesTotal);
        // Simulate setting macro bars
        proteinBar.style.width = '40%';
        carbsBar.style.width = '60%';
        fatsBar.style.width = '46%';
    }, 500);
    
    updateWaterTracker();
});
