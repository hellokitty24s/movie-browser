const apiKey = 'e2faba2d';
  
// Get the movie title from the URL
const params = new URLSearchParams(window.location.search);
const movieTitle = params.get('title');

console.log("Fetching movie:", movieTitle);

// Load movie data
fetch(`https://www.omdbapi.com/?t=${encodeURIComponent(movieTitle)}&apikey=${apiKey}`)
  .then(res => res.json())
  .then(data => {
    if (data.Response === "True") {
      document.getElementById("movieTitle").innerText = data.Title;
      document.getElementById("moviePlot").innerText = data.Plot;
      document.getElementById("moviePoster").src = data.Poster;
    } else {
      document.getElementById("movieTitle").innerText = "Movie not found.";
    }
  })
  .catch(err => {
    console.error("Error fetching data: ", err);
  });

// Check if user is logged in and update auth links
function updateAuthLinks() {
    const sessionId = localStorage.getItem('sessionId');
    const username = localStorage.getItem('username');
    const authLinks = document.getElementById('authLinks');
    
    if (sessionId && username) {
        authLinks.innerHTML = `Welcome, ${username}! | <a href="#" onclick="logout()">Logout</a>`;
        // Show review form
        document.getElementById('reviewForm').style.display = 'block';
        document.getElementById('loginMessage').style.display = 'none';
    } else {
        authLinks.innerHTML = '<a href="login.html">Login</a> | <a href="register.html">Register</a>';
        // Show login message
        document.getElementById('reviewForm').style.display = 'none';
        document.getElementById('loginMessage').style.display = 'block';
    }
}

// Logout function
async function logout() {
    const sessionId = localStorage.getItem('sessionId');
    
    try {
        await fetch('/logout', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ sessionId })
        });
    } catch (error) {
        console.log('Logout request failed, but clearing local storage anyway');
    }
    
    localStorage.removeItem('sessionId');
    localStorage.removeItem('username');
    updateAuthLinks();
}

// Load reviews for current movie
async function loadReviews() {
    if (!movieTitle) return;
    
    try {
        const response = await fetch(`/reviews/${encodeURIComponent(movieTitle)}`);
        const data = await response.json();
        
        const reviewsList = document.getElementById('reviewsList');
        
        if (data.success && data.reviews.length > 0) {
            reviewsList.innerHTML = data.reviews.map(review => {
                const stars = '⭐'.repeat(review.rating);
                const date = new Date(review.created_at).toLocaleDateString();
                return `
                    <div class="review-item">
                        <div class="review-header">
                            ${review.username} <span class="review-rating">${stars} (${review.rating}/5)</span>
                            <span style="float: right; color: #666; font-size: 0.9em;">${date}</span>
                        </div>
                        <div>${review.review_text}</div>
                    </div>
                `;
            }).join('');
        } else {
            reviewsList.innerHTML = '<p>No reviews yet. Be the first to review this movie!</p>';
        }
    } catch (error) {
        console.error('Error loading reviews:', error);
        document.getElementById('reviewsList').innerHTML = '<p>Error loading reviews.</p>';
    }
}

// Handle review form submission
document.getElementById('addReviewForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const sessionId = localStorage.getItem('sessionId');
    if (!sessionId) {
        alert('Please login to submit a review');
        return;
    }
    
    const rating = document.getElementById('rating').value;
    const reviewText = document.getElementById('reviewText').value;
    const messageDiv = document.getElementById('reviewMessage');
    
    try {
        const response = await fetch('/review', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                sessionId: sessionId,
                movieTitle: movieTitle,
                reviewText: reviewText,
                rating: parseInt(rating)
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            messageDiv.innerHTML = '<p style="color: green;">Review submitted successfully!</p>';
            document.getElementById('rating').value = '';
            document.getElementById('reviewText').value = '';
            // Reload reviews to show the new one
            loadReviews();
        } else {
            messageDiv.innerHTML = '<p style="color: red;">' + data.error + '</p>';
        }
    } catch (error) {
        messageDiv.innerHTML = '<p style="color: red;">Failed to submit review. Please try again.</p>';
    }
});

// Initialize page
updateAuthLinks();
loadReviews();
